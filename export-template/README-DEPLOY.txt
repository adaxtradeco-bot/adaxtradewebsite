================================================================
راهنمای نصب سایت استاتیک
================================================================

این بسته چیست؟
  این فایل ZIP نسخه استاتیک کامل سایت است. همه صفحات از قبل ساخته
  شده‌اند و به پایگاه داده یا Node.js نیازی نیست.

  تاریخ خروجی: {{exportedAt}}
  زبان پیش‌فرض: {{defaultLang}}
  تعداد صفحات (مسیرها): {{routeCount}}
  تعداد فایل‌ها: {{fileCount}}
  صفحات به تفکیک زبان:
{{perLanguage}}

پیش‌نیازها
  - هاست Apache همراه با ماژول mod_rewrite (در اغلب هاست‌های cPanel فعال است)
  - PHP نسخه 7.4 یا بالاتر، فقط برای ارسال فرم‌ها (فرم تماس و مشابه)
  - بدون PHP، سایت کامل نمایش داده می‌شود ولی ارسال فرم کار نمی‌کند

مراحل آپلود
  1. وارد cPanel شوید و File Manager را باز کنید (یا با FTP وصل شوید).
  2. به پوشه public_html بروید (ریشه دامنه). سایت باید در ریشه دامنه
     باشد، نه در زیرپوشه.
  3. فایل ZIP را آپلود کنید و روی آن Extract بزنید.
  4. مطمئن شوید فایل index.html و فایل .htaccess مستقیم داخل
     public_html هستند، نه داخل یک پوشه دیگر.
  5. فایل‌های مخفی را نمایش دهید (در File Manager: Settings و گزینه
     Show Hidden Files) تا .htaccess دیده شود.

تنظیم فایل config.php (برای ارسال فرم)
  فایل config.php را در File Manager باز کنید و این موارد را پر کنید:
  - transport: روش ارسال. مقدار smtp (پیشنهادی) یا mail
  - smtp.host: آدرس سرور ایمیل، مثلا mail.example.com
  - smtp.port و smtp.secure:
        پورت 587 با secure برابر tls   (STARTTLS)
        پورت 465 با secure برابر ssl   (SSL مستقیم)
  - smtp.user: آدرس کامل صندوق ایمیل، مثلا info@example.com
  - smtp.pass: رمز همان صندوق ایمیل
  - from_email و from_name: فرستنده‌ای که در ایمیل دریافتی دیده می‌شود
    (بهتر است از همان دامنه باشد)
  - default_to: ایمیلی که پیام فرم‌ها به آن می‌رسد
  - allowed_recipients: فهرست آدرس‌هایی که فرم اجازه ارسال به آن‌ها را
    دارد. هر مقصد دیگری رد می‌شود (برای جلوگیری از سوءاستفاده).
  - rate_limit: حداکثر تعداد ارسال در بازه زمانی (پیش‌فرض 5 بار در 10 دقیقه)
  - debug: فقط هنگام رفع اشکال true کنید و بعد false بگذارید

  مثال تنظیم (پورت 587):
        'smtp' => ['host' => 'mail.example.com', 'port' => 587,
                   'secure' => 'tls', 'user' => 'info@example.com',
                   'pass' => '...']
  مثال تنظیم (پورت 465):
        'smtp' => ['host' => 'mail.example.com', 'port' => 465,
                   'secure' => 'ssl', 'user' => 'info@example.com',
                   'pass' => '...']

آزمایش فرم
  یک صفحه دارای فرم را باز کنید، فرم را با ایمیل خودتان پر و ارسال
  کنید. پیام موفقیت باید نمایش داده شود و ایمیل به default_to برسد.
  اگر نرسید، پوشه Spam را ببینید و تنظیمات SMTP را بررسی کنید.

بررسی سایت
  1. آدرس دامنه را باز کنید. باید به زبان پیش‌فرض ({{defaultLang}})
     هدایت شوید.
  2. زبان را از منوی زبان عوض کنید و چند صفحه را باز کنید.
  3. یک فرم را ارسال کنید.

اگر هاست شما Nginx است
  فایل .htaccess در Nginx اثری ندارد. در تنظیمات سایت این را بگذارید:

        location / {
            try_files $uri $uri/ =404;
        }
        error_page 404 /404.html;

  هدایت زبان پیش‌فرض در Nginx:

        location = / { return 302 /{{defaultLang}}/; }
        location ~ ^/(?!(fa|en|ar|tr|fr|de|es)(/|$)|_next|_data|media|uploads|fonts|fontawesome|webfonts|data|send\.php|static-shim\.js|sitemap\.xml|robots\.txt|404\.html|favicon) {
            if (!-e $request_filename) { return 302 /{{defaultLang}}$request_uri; }
        }

  ارسال فرم در Nginx نیاز به PHP-FPM دارد.

رفع مشکل
  - صفحه سفید یا خطای 404 در همه جا: فایل‌ها در پوشه اشتباه هستند.
    index.html باید مستقیم در ریشه دامنه باشد.
  - ارسال فرم شکست می‌خورد: PHP فعال نیست یا تنظیمات SMTP در
    config.php درست نیست. debug را موقتا true کنید.
  - متن فارسی خراب نمایش داده می‌شود: فایل‌ها باید با کدگذاری UTF-8
    ذخیره شوند. فایل‌ها را با ویرایشگر دیگری عوض نکنید.
  - بعد از به‌روزرسانی سایت تغییرات دیده نمی‌شود: حداکثر 5 دقیقه صبر
    کنید یا حافظه نهان مرورگر را پاک کنید.

================================================================
Static Site Deployment Guide
================================================================

What is this package?
  This ZIP is a complete static version of the website. All pages are
  pre-built; no database or Node.js is needed.

  Exported at: {{exportedAt}}
  Default language: {{defaultLang}}
  Routes (pages): {{routeCount}}
  Files: {{fileCount}}
  Pages per language:
{{perLanguage}}

Requirements
  - Apache hosting with mod_rewrite (enabled on most cPanel hosts)
  - PHP 7.4 or newer, only for form submissions (contact form etc.)
  - Without PHP the whole site still displays, but forms will not send

Upload steps
  1. Log in to cPanel and open File Manager (or connect with FTP).
  2. Go to public_html (the domain root). The site must live at the
     domain root, not in a sub-folder.
  3. Upload the ZIP file and choose Extract.
  4. Make sure index.html and .htaccess sit directly inside public_html,
     not inside another folder.
  5. Enable "Show Hidden Files" in File Manager settings so you can see
     .htaccess.

Filling in config.php (for form delivery)
  Open config.php in File Manager and fill in:
  - transport: delivery method. smtp (recommended) or mail
  - smtp.host: your mail server, e.g. mail.example.com
  - smtp.port and smtp.secure:
        port 587 with secure = tls   (STARTTLS)
        port 465 with secure = ssl   (implicit SSL)
  - smtp.user: full mailbox address, e.g. info@example.com
  - smtp.pass: that mailbox's password
  - from_email and from_name: the sender shown on received messages
    (preferably an address on your own domain)
  - default_to: the address that receives form messages
  - allowed_recipients: the list of addresses the forms may send to.
    Any other recipient is rejected (prevents abuse of the form).
  - rate_limit: max submissions per time window (default 5 per 10 min)
  - debug: set true only while troubleshooting, then back to false

  Example (port 587):
        'smtp' => ['host' => 'mail.example.com', 'port' => 587,
                   'secure' => 'tls', 'user' => 'info@example.com',
                   'pass' => '...']
  Example (port 465):
        'smtp' => ['host' => 'mail.example.com', 'port' => 465,
                   'secure' => 'ssl', 'user' => 'info@example.com',
                   'pass' => '...']

Testing the form
  Open a page with a form, fill it in with your own email and submit.
  A success message should appear and the email should reach default_to.
  If nothing arrives, check your Spam folder and the SMTP settings.

Verifying the site
  1. Open your domain. You should be redirected to the default
     language ({{defaultLang}}).
  2. Switch language from the language menu and open a few pages.
  3. Submit a form.

If your host runs Nginx
  .htaccess has no effect on Nginx. Use this in the site configuration:

        location / {
            try_files $uri $uri/ =404;
        }
        error_page 404 /404.html;

  Default-language redirect on Nginx:

        location = / { return 302 /{{defaultLang}}/; }
        location ~ ^/(?!(fa|en|ar|tr|fr|de|es)(/|$)|_next|_data|media|uploads|fonts|fontawesome|webfonts|data|send\.php|static-shim\.js|sitemap\.xml|robots\.txt|404\.html|favicon) {
            if (!-e $request_filename) { return 302 /{{defaultLang}}$request_uri; }
        }

  Form delivery on Nginx needs PHP-FPM.

Troubleshooting
  - Blank page or 404 everywhere: files are in the wrong folder.
    index.html must be directly in the domain root.
  - Forms fail: PHP is not enabled or the SMTP settings in config.php
    are wrong. Temporarily set debug to true.
  - Persian text looks broken: files must be saved as UTF-8. Do not
    re-save them with an editor that changes the encoding.
  - Changes do not show after re-uploading: wait up to 5 minutes or
    clear the browser cache.
