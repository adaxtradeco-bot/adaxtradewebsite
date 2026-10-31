<?php
/**
 * Copy/rename to config.php and fill in the values.
 * کپی کنید با نام config.php و مقادیر را پر کنید.
 *
 * NEVER commit real credentials. The Apache rules in .htaccess deny web access to this file.
 * هرگز اطلاعات واقعی را در مخزن قرار ندهید. فایل .htaccess دسترسی وب به این فایل را می‌بندد.
 */
return [
    // 'smtp' (default, uses bundled PHPMailer) or 'mail' (PHP mail(), no SMTP needed)
    // 'smtp' (پیش‌فرض) یا 'mail' (تابع mail() خود PHP)
    'transport' => 'smtp',

    // Used only when transport = 'smtp'. / فقط برای حالت smtp
    'smtp' => [
        'host'   => 'smtp.example.com',      // PLACEHOLDER: SMTP server / سرور SMTP
        'port'   => 587,                     // 587 with 'tls', 465 with 'ssl' / پورت
        'secure' => 'tls',                   // 'tls' | 'ssl' | '' (none)
        'user'   => 'CHANGE_ME_USER',        // PLACEHOLDER: SMTP username / نام کاربری
        'pass'   => 'CHANGE_ME_PASSWORD',    // PLACEHOLDER: SMTP password / رمز عبور
    ],

    // Sender shown to recipients; should be an address on your own domain.
    // فرستنده ایمیل؛ بهتر است آدرسی روی دامنه خودتان باشد.
    'from_email' => 'noreply@example.com',   // PLACEHOLDER
    'from_name'  => 'Website Forms',

    // Used when the form's destination email is not in allowed_recipients.
    // اگر ایمیل مقصد فرم در لیست مجاز نبود به این آدرس ارسال می‌شود.
    'default_to' => 'info@example.com',      // PLACEHOLDER

    // Only these addresses may be chosen by the forms (case-insensitive).
    // فقط این آدرس‌ها را فرم‌ها می‌توانند انتخاب کنند (بدون حساسیت به حروف).
    'allowed_recipients' => [
        'info@example.com',                  // PLACEHOLDER
    ],

    // Max submissions per IP within the window. / حداکثر ارسال برای هر IP در بازه زمانی
    'rate_limit' => ['max' => 5, 'window_seconds' => 600],

    // true adds a "detail" field to error responses (testing only; keep false in production).
    // true فقط برای تست؛ در محیط واقعی false بماند.
    'debug' => false,
];
