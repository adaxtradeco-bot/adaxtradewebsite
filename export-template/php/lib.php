<?php
/**
 * Pure helper functions for send.php (no I/O except rate_limit_hit).
 * Mirrors src/app/api/contact-form/route.ts. PHP 7.4 compatible.
 */

/** Field rules per form type, mirroring FORM_FIELD_SCHEMAS: [required, max length]. Order = email row order. */
function form_field_rules()
{
    return [
        'contact' => [
            'name' => [true, 200], 'email' => [true, 0], 'phone' => [false, 50], 'message' => [true, 5000],
        ],
        'demo' => [
            'name' => [true, 200], 'email' => [true, 0], 'company' => [true, 200],
            'phone' => [false, 50], 'message' => [false, 5000],
        ],
        'partnership' => [
            'name' => [true, 200], 'email' => [true, 0], 'company' => [true, 200],
            'website' => [false, 300], 'message' => [true, 5000],
        ],
    ];
}

function form_labels()
{
    return [
        'contact' => 'Contact Request',
        'demo' => 'Demo Request',
        'partnership' => 'Partnership Request',
    ];
}

/** Remove CR, LF and NUL so a value can never inject extra headers. */
function sanitize_header_value($value)
{
    return trim(str_replace(["\r", "\n", "\0"], ' ', (string)$value));
}

/** Same escaping as escapeHtml() in the route (&#39; for single quotes). */
function escape_html($value)
{
    return strtr((string)$value, [
        '&' => '&amp;', '<' => '&lt;', '>' => '&gt;', '"' => '&quot;', "'" => '&#39;',
    ]);
}

/** Character count (not bytes), so Persian text is measured like zod measures it. */
function text_length($value)
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }
    return preg_match_all('/./us', $value, $m);
}

/** Unicode-aware trim. */
function trim_unicode($value)
{
    $out = preg_replace('/^[\s\x{FEFF}]+|[\s\x{FEFF}]+$/u', '', $value);
    return $out === null ? trim($value) : $out;
}

function is_valid_email($value)
{
    return $value !== '' && strpos($value, "\r") === false && strpos($value, "\n") === false
        && filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate the decoded JSON body.
 * Returns ['ok'=>true, 'data'=>[formType,destinationEmail,fields,pageUrl]]
 *      or ['ok'=>false, 'errors'=>[fieldName => reason]].
 */
function validate_request($body)
{
    $errors = [];
    if (!is_array($body)) {
        return ['ok' => false, 'errors' => ['body' => 'invalid']];
    }

    $rules = form_field_rules();
    $formType = isset($body['formType']) && is_string($body['formType']) ? $body['formType'] : '';
    if (!isset($rules[$formType])) {
        $errors['formType'] = 'invalid';
    }

    $dest = isset($body['destinationEmail']) && is_string($body['destinationEmail'])
        ? trim_unicode($body['destinationEmail']) : '';
    if (!is_valid_email($dest)) {
        $errors['destinationEmail'] = 'invalid';
    }

    $pageUrl = '';
    if (isset($body['pageUrl'])) {
        if (!is_string($body['pageUrl'])) {
            $errors['pageUrl'] = 'invalid';
        } else {
            $pageUrl = trim_unicode($body['pageUrl']);
            if (text_length($pageUrl) > 500) {
                $errors['pageUrl'] = 'too_long';
            }
        }
    }

    $raw = isset($body['fields']) ? $body['fields'] : null;
    if (!is_array($raw)) {
        $errors['fields'] = 'invalid';
    } else {
        foreach ($raw as $v) {
            if (!is_string($v)) { // z.record(string, string)
                $errors['fields'] = 'invalid';
                break;
            }
        }
    }

    $fields = [];
    if (isset($rules[$formType]) && is_array($raw) && !isset($errors['fields'])) {
        foreach ($rules[$formType] as $name => $rule) {
            $value = isset($raw[$name]) ? trim_unicode($raw[$name]) : '';
            if ($value === '') {
                if ($rule[0]) {
                    $errors[$name] = 'required';
                }
                $fields[$name] = '';
                continue;
            }
            if ($name === 'email') {
                if (!is_valid_email($value)) {
                    $errors[$name] = 'invalid';
                }
            } elseif ($rule[1] > 0 && text_length($value) > $rule[1]) {
                $errors[$name] = 'too_long';
            }
            $fields[$name] = $value; // unknown keys are dropped
        }
    }

    if ($errors) {
        return ['ok' => false, 'errors' => $errors];
    }
    return ['ok' => true, 'data' => [
        'formType' => $formType,
        'destinationEmail' => $dest,
        'fields' => $fields,
        'pageUrl' => $pageUrl,
    ]];
}

/** Recipient is the requested address only if it is on the allow-list (case-insensitive). */
function pick_recipient($destinationEmail, array $allowed, $defaultTo)
{
    $dest = sanitize_header_value($destinationEmail);
    foreach ($allowed as $a) {
        if (is_string($a) && strcasecmp(trim($a), $dest) === 0 && is_valid_email($dest)) {
            return $dest;
        }
    }
    return sanitize_header_value($defaultTo);
}

function build_email_subject($formType, array $fields)
{
    $labels = form_labels();
    return sanitize_header_value($labels[$formType] . ' — ' . (isset($fields['name']) ? $fields['name'] : ''));
}

/** Same markup as buildEmailHtml() in the route. */
function build_email_html($formType, array $fields, $pageUrl = '')
{
    $labels = form_labels();
    $rows = '';
    foreach ($fields as $key => $value) {
        if ($value === '' || $value === null) {
            continue;
        }
        $rows .= '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#334155;text-transform:capitalize;">'
            . escape_html($key)
            . '</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;white-space:pre-wrap;">'
            . escape_html($value) . '</td></tr>';
    }
    $page = $pageUrl
        ? '<p style="margin-top:16px;color:#64748b;font-size:13px;">Submitted from: ' . escape_html($pageUrl) . '</p>'
        : '';

    return "\n    <div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;\">\n"
        . '      <h2 style="color:#0f172a;">New ' . $labels[$formType] . "</h2>\n"
        . '      <table style="width:100%;border-collapse:collapse;margin-top:12px;">' . $rows . "</table>\n"
        . '      ' . $page . "\n    </div>\n  ";
}

/**
 * Per-IP file rate limit. Returns true when the request is ALLOWED (and records it),
 * false when the IP exceeded $max hits within $window seconds.
 */
function rate_limit_hit($dir, $ip, $max, $window, $now = null)
{
    $now = $now === null ? time() : $now;
    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0755, true) && !is_dir($dir)) {
            return true; // cannot enforce; do not block legitimate users
        }
    }
    if (!is_file($dir . '/.htaccess')) {
        @file_put_contents($dir . '/.htaccess', "Require all denied\n");
    }
    if (!is_file($dir . '/index.html')) {
        @file_put_contents($dir . '/index.html', '');
    }

    $file = $dir . '/' . sha1($ip) . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return true;
    }
    flock($fh, LOCK_EX);
    $hits = json_decode((string)stream_get_contents($fh), true);
    $hits = is_array($hits) ? $hits : [];
    $recent = [];
    foreach ($hits as $t) {
        if (is_int($t) && $t > $now - $window) {
            $recent[] = $t;
        }
    }
    $allowed = count($recent) < $max;
    if ($allowed) {
        $recent[] = $now;
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($recent));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $allowed;
}
