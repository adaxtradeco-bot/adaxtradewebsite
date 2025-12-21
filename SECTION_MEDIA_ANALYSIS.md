# Section Media & JSON Analysis Documentation

## مراحل کار:
1. ✅ بررسی تمام سکشن‌ها برای یافتن فیلدهای مدیا
2. 🔄 تصحیح JSON schemas برای شامل کردن تمام فیلدهای مدیا
3. 🔄 اتصال Image Manager به تمام فیلدهای مدیا
4. 🔄 اضافه کردن فیلدهای لینک و کلید به JSON
5. 🔄 تست و تأیید عملکرد

## سکشن‌های بررسی شده:

### 1. HeroSliderNWMSection ❌ نیاز به تصحیح
**مشکلات:**
- فیلد `dashboard.preview` در JSON موجود نیست
- Image Manager فقط background را پشتیبانی می‌کند
- فیلدهای لینک در JSON کامل نیست

**فیلدهای مدیا موجود:**
- `slides[].background` ✅
- `slides[].dashboard.preview` ❌ (موجود نیست)

**فیلدهای لینک:**
- `slides[].cta.link` (نیاز به بررسی)

### 2. سایر سکشن‌ها (در حال بررسی...)

## اقدامات لازم:
- [ ] تصحیح HeroSliderNWMSection JSON
- [ ] بررسی سایر سکشن‌ها
- [ ] تست Image Manager
- [ ] تست فیلدهای لینک