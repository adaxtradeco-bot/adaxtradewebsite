<?php
/**
 * Form handler for the static export (replacement for /api/contact-form).
 * POST application/json -> {"success":true} | {"success":false,"error":"..."}
 */

require_once __DIR__ . '/lib.php';

const MAX_BODY_BYTES = 65536;

$config = null;
$debug = false;

function respond($status, array $payload)
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail($status, $error, $detail = null)
{
    global $debug;
    $payload = ['success' => false, 'error' => $error];
    if ($debug && $detail !== null) {
        $payload['detail'] = $detail;
    }
    respond($status, $payload);
}

if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    fail(405, 'method_not_allowed');
}

$contentType = isset($_SERVER['CONTENT_TYPE']) ? strtolower(trim($_SERVER['CONTENT_TYPE'])) : '';
if (strpos($contentType, 'application/json') !== 0) {
    fail(415, 'unsupported_media_type');
}

if (isset($_SERVER['CONTENT_LENGTH']) && (int)$_SERVER['CONTENT_LENGTH'] > MAX_BODY_BYTES) {
    fail(413, 'payload_too_large');
}
$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    fail(413, 'payload_too_large');
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    fail(500, 'email_not_configured');
}
$config = require $configFile;
if (!is_array($config)) {
    fail(500, 'email_not_configured');
}
$debug = !empty($config['debug']);

$body = json_decode($raw, true);
if (!is_array($body)) {
    fail(400, 'invalid_json');
}

// Honeypot: bots fill it; pretend success and send nothing.
if (isset($body['website_url_hp']) && $body['website_url_hp'] !== '' && $body['website_url_hp'] !== null) {
    respond(200, ['success' => true]);
}

$rl = isset($config['rate_limit']) && is_array($config['rate_limit']) ? $config['rate_limit'] : [];
$ip = isset($_SERVER['REMOTE_ADDR']) ? (string)$_SERVER['REMOTE_ADDR'] : 'unknown';
if (!rate_limit_hit(
    __DIR__ . '/_ratelimit',
    $ip,
    isset($rl['max']) ? (int)$rl['max'] : 5,
    isset($rl['window_seconds']) ? (int)$rl['window_seconds'] : 600
)) {
    header('Retry-After: ' . (isset($rl['window_seconds']) ? (int)$rl['window_seconds'] : 600));
    fail(429, 'rate_limited');
}

$result = validate_request($body);
if (!$result['ok']) {
    fail(400, 'validation_failed', $result['errors']);
}
$data = $result['data'];
$fields = $data['fields'];

$allowed = isset($config['allowed_recipients']) && is_array($config['allowed_recipients'])
    ? $config['allowed_recipients'] : [];
$to = pick_recipient($data['destinationEmail'], $allowed, isset($config['default_to']) ? $config['default_to'] : '');
$fromEmail = sanitize_header_value(isset($config['from_email']) ? $config['from_email'] : '');
$fromName = sanitize_header_value(isset($config['from_name']) ? $config['from_name'] : 'Website Forms');
$replyTo = sanitize_header_value($fields['email']);
$subject = build_email_subject($data['formType'], $fields);
$html = build_email_html($data['formType'], $fields, $data['pageUrl']);

if ($to === '' || $fromEmail === '') {
    fail(500, 'email_not_configured');
}

$transport = isset($config['transport']) ? $config['transport'] : 'smtp';

try {
    if ($transport === 'mail') {
        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
        $headers = [
            'From: ' . $encodedFromName . ' <' . $fromEmail . '>',
            'Reply-To: ' . $replyTo,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
        ];
        $ok = mail($to, $encodedSubject, chunk_split(base64_encode($html)), implode("\r\n", $headers), '-f' . $fromEmail);
        if (!$ok) {
            fail(502, 'send_failed', 'mail() returned false');
        }
    } else {
        require_once __DIR__ . '/vendor/phpmailer/Exception.php';
        require_once __DIR__ . '/vendor/phpmailer/PHPMailer.php';
        require_once __DIR__ . '/vendor/phpmailer/SMTP.php';

        $smtp = isset($config['smtp']) && is_array($config['smtp']) ? $config['smtp'] : [];
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = isset($smtp['host']) ? $smtp['host'] : '';
        $mail->Port = isset($smtp['port']) ? (int)$smtp['port'] : 587;
        $secure = isset($smtp['secure']) ? $smtp['secure'] : 'tls';
        if ($secure === 'ssl') {
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
        } elseif ($secure === 'tls') {
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        } else {
            $mail->SMTPSecure = '';
            $mail->SMTPAutoTLS = false;
        }
        if (!empty($smtp['user'])) {
            $mail->SMTPAuth = true;
            $mail->Username = $smtp['user'];
            $mail->Password = isset($smtp['pass']) ? $smtp['pass'] : '';
        }
        $mail->Timeout = 15;
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($to);
        $mail->addReplyTo($replyTo, $fields['name'] !== '' ? sanitize_header_value($fields['name']) : '');
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $html;
        $mail->AltBody = strip_tags(str_replace(['</tr>', '</td><td'], ["\n", "</td>: <td"], $html));
        $mail->send();
    }
} catch (Throwable $e) { // includes PHPMailer\PHPMailer\Exception; message never contains the password
    fail(502, 'send_failed', $e->getMessage());
}

respond(200, ['success' => true]);
