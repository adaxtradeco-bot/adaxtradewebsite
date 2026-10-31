<?php
/**
 * CLI test for lib.php (no PHPUnit, sends no mail).  Run: php tests/lib-test.php
 */
require __DIR__ . '/../lib.php';

$pass = 0;
$failed = 0;
function check($cond, $label)
{
    global $pass, $failed;
    if ($cond) {
        $pass++;
    } else {
        $failed++;
        echo "FAIL: $label\n";
    }
}

function req($type, array $fields, $dest = 'info@example.com', array $extra = [])
{
    return array_merge(['formType' => $type, 'destinationEmail' => $dest, 'fields' => $fields], $extra);
}

// Valid payloads for each form type
$r = validate_request(req('contact', ['name' => 'Ali', 'email' => 'a@b.com', 'message' => 'Hi']));
check($r['ok'], 'contact valid');
check($r['data']['fields']['phone'] === '', 'contact optional phone defaults empty');
$r = validate_request(req('demo', ['name' => 'Ali', 'email' => 'a@b.com', 'company' => 'X']));
check($r['ok'], 'demo valid without message');
$r = validate_request(req('partnership', ['name' => 'Ali', 'email' => 'a@b.com', 'company' => 'X', 'message' => 'm', 'website' => 'https://x.com']));
check($r['ok'], 'partnership valid');

// Trim and unknown fields ignored
$r = validate_request(req('contact', ['name' => '  Ali  ', 'email' => ' a@b.com ', 'message' => 'Hi', 'evil' => 'x']));
check($r['ok'] && $r['data']['fields']['name'] === 'Ali' && !isset($r['data']['fields']['evil']), 'trim + unknown dropped');

// Failures
check(!validate_request(req('contact', ['name' => 'Ali', 'email' => 'a@b.com']))['ok'], 'missing message');
check(!validate_request(req('contact', ['name' => '   ', 'email' => 'a@b.com', 'message' => 'm']))['ok'], 'blank name');
check(!validate_request(req('contact', ['name' => 'A', 'email' => 'not-an-email', 'message' => 'm']))['ok'], 'bad email');
check(!validate_request(req('demo', ['name' => 'A', 'email' => 'a@b.com']))['ok'], 'demo missing company');
check(!validate_request(req('partnership', ['name' => 'A', 'email' => 'a@b.com', 'company' => 'C']))['ok'], 'partnership missing message');
check(!validate_request(req('contact', ['name' => str_repeat('a', 201), 'email' => 'a@b.com', 'message' => 'm']))['ok'], 'name too long');
check(!validate_request(req('contact', ['name' => 'A', 'email' => 'a@b.com', 'message' => str_repeat('a', 5001)]))['ok'], 'message too long');
check(validate_request(req('contact', ['name' => 'A', 'email' => 'a@b.com', 'message' => str_repeat('a', 5000)]))['ok'], 'message at limit ok');
check(!validate_request(req('contact', ['name' => 'A', 'email' => 'a@b.com', 'message' => 'm', 'phone' => str_repeat('1', 51)]))['ok'], 'phone too long');
check(!validate_request(req('other', ['name' => 'A']))['ok'], 'unknown formType');
check(!validate_request(req('contact', ['name' => 'A', 'email' => 'a@b.com', 'message' => 'm'], 'bad'))['ok'], 'bad destination');
check(!validate_request(req('contact', ['name' => ['x'], 'email' => 'a@b.com', 'message' => 'm']))['ok'], 'non-string field');
check(!validate_request(req('contact', ['name' => 'A', 'email' => 'a@b.com', 'message' => 'm'], 'info@example.com', ['pageUrl' => str_repeat('a', 501)]))['ok'], 'pageUrl too long');
check(!validate_request(null)['ok'] && !validate_request('x')['ok'], 'non-array body');
check(!validate_request(req('contact', ['name' => 'A', 'email' => "a@b.com\r\nBcc: x@y.com", 'message' => 'm']))['ok'], 'email header injection rejected');

// Persian counted by characters, survives
$fa = 'سلام، این یک پیام آزمایشی است';
$r = validate_request(req('contact', ['name' => 'علی رضایی', 'email' => 'a@b.com', 'message' => str_repeat('م', 5000)]));
check($r['ok'], 'persian 5000 chars (10000 bytes) allowed');
$r = validate_request(req('contact', ['name' => 'علی', 'email' => 'a@b.com', 'message' => $fa]));
check($r['ok'] && $r['data']['fields']['message'] === $fa, 'persian preserved');
$html = build_email_html('contact', $r['data']['fields'], 'https://example.com/fa/تماس');
check(strpos($html, $fa) !== false && strpos($html, 'تماس') !== false, 'persian in html');
check(strpos($html, 'New Contact Request') !== false, 'html heading');

// Recipient allow-list
$allowed = ['Sales@Example.com', 'info@example.com'];
check(pick_recipient('sales@example.COM', $allowed, 'def@example.com') === 'sales@example.COM', 'allowed case-insensitive');
check(pick_recipient('evil@x.com', $allowed, 'def@example.com') === 'def@example.com', 'unknown falls back');
check(pick_recipient("info@example.com\r\nBcc: x@y.com", $allowed, 'def@example.com') === 'def@example.com', 'injected recipient falls back');
check(pick_recipient('x@y.com', [], 'def@example.com') === 'def@example.com', 'empty allow-list');

// Header sanitizing
$s = sanitize_header_value("a@b.com\r\nBcc: x@y.com");
check(strpos($s, "\r") === false && strpos($s, "\n") === false, 'CRLF stripped');
check(strpos(build_email_subject('contact', ['name' => "Ali\r\nBcc: x@y.com"]), "\n") === false, 'subject has no newline');
check(build_email_subject('demo', ['name' => 'Ali']) === 'Demo Request — Ali', 'subject format');

// HTML escaping
$html = build_email_html('contact', ['name' => '<script>alert(1)</script>', 'email' => 'a@b.com', 'phone' => '', 'message' => "it's \"q\" & more"], '<b>u</b>');
check(strpos($html, '<script>') === false && strpos($html, '&lt;script&gt;') !== false, 'script escaped');
check(strpos($html, '&#39;') !== false && strpos($html, '&quot;q&quot;') !== false && strpos($html, '&amp; more') !== false, 'quotes and ampersand escaped');
check(strpos($html, '&lt;b&gt;u&lt;/b&gt;') !== false, 'pageUrl escaped');
check(strpos($html, '>phone<') === false, 'empty fields omitted');

// Rate limit
$dir = sys_get_temp_dir() . '/rl_test_' . uniqid();
$t = 1000000;
check(rate_limit_hit($dir, '1.2.3.4', 2, 60, $t), 'rate hit 1');
check(rate_limit_hit($dir, '1.2.3.4', 2, 60, $t + 1), 'rate hit 2');
check(!rate_limit_hit($dir, '1.2.3.4', 2, 60, $t + 2), 'rate hit 3 blocked');
check(rate_limit_hit($dir, '5.6.7.8', 2, 60, $t + 2), 'other IP ok');
check(rate_limit_hit($dir, '1.2.3.4', 2, 60, $t + 100), 'window expired');
check(is_file($dir . '/.htaccess') && is_file($dir . '/index.html'), 'ratelimit dir protected');
foreach (glob($dir . '/{*,.htaccess}', GLOB_BRACE) as $f) {
    @unlink($f);
}
@rmdir($dir);

echo "$pass passed, $failed failed\n";
exit($failed ? 1 : 0);
