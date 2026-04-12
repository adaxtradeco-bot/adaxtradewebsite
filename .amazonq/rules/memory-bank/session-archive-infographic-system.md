# Session Archive — Infographic System (Unified)
**Date:** 2025-07
**Status:** ✅ کامل شد

---

## خلاصه کار انجامشده

### هدف اصلی
ساخت یک سیستم یکپارچه برای نمایش infographic در تمام سکشنهای Page Builder.

---

## فایلهای ساختهشده / تغییریافته

### 1. `InfographicRenderer.tsx` ✅ کامل
**مسیر:** `src/components/builder-sections/InfographicRenderer.tsx`

کامپوننت universal برای رندر 18 نوع infographic + mediaOverride.

**انواع پشتیبانیشده:**
`audit` | `roles` | `exception` | `exception-alert` | `role-levels` | `stats` | `flow` | `timeline` | `kpi` | `performance` | `performance-bars` | `prediction` | `status-list` | `media` | `workflow` | `sla` | `sla-bars` | `org` | `mediaOverride`

### 2. `infographic-defaults.ts` ✅ کامل
**مسیر:** `src/lib/page-builder/infographic-defaults.ts`

فایل مرکزی برای:
- `INFOGRAPHIC_DEFAULT_DATA` — default data برای هر type
- `INFOGRAPHIC_TYPE_OPTIONS` — لیست options برای select در PropertyPanel ها

### 3. سکشنهای Refactor شده ✅
| سکشن | وضعیت |
|------|--------|
| `AnalyticsBentoGridSection.tsx` | ✅ از InfographicRenderer استفاده میکند |
| `GovernanceGridSection.tsx` | ✅ از InfographicRenderer استفاده میکند |
| `MetroGridSection.tsx` | ✅ از InfographicRenderer استفاده میکند |
| `RotatingTabsSection.tsx` | ✅ از InfographicRenderer استفاده میکند |

### 4. PropertyPanel های ساخته/بروزشده ✅
| PropertyPanel | وضعیت |
|--------------|--------|
| `GovernanceGridPropertyPanel.tsx` | ✅ همه 18 نوع + default data |
| `MetroGridPropertyPanel.tsx` | ✅ همه 18 نوع + default data |
| `RotatingTabsPropertyPanel.tsx` | ✅ جدید — همه 18 نوع + default data |
| `AnalyticsBentoGridPropertyPanel.tsx` | ✅ جدید — همه 18 نوع + default data |

### 5. `PropertyPanel.tsx` ✅ بروز شد
- `rotating-tabs` → `RotatingTabsPropertyPanel`
- `analytics-bento-grid` → `AnalyticsBentoGridPropertyPanel`
- هر دو در `hasCustomEditor` list اضافه شدند

---

## معماری سیستم

```
PropertyPanel (انتخاب type)
  → INFOGRAPHIC_DEFAULT_DATA[type]  ← default data خودکار
  → ذخیره در section.data.cards[n].infographic

SectionRenderer
  → Section Component (GovernanceGrid / MetroGrid / RotatingTabs / AnalyticsBento)
    → InfographicRenderer (رندر یکپارچه)
```

---

## قوانین مهم

1. `InfographicRenderer` تنها منبع رندر infographic است
2. `infographic-defaults.ts` تنها منبع default data و type options است
3. هیچ inline infographic جدیدی نباید در سکشنها نوشته شود
4. برای اضافه کردن type جدید:
   - یک `case` به `InfographicRenderer` اضافه کن
   - یک entry به `INFOGRAPHIC_DEFAULT_DATA` اضافه کن
   - یک option به `INFOGRAPHIC_TYPE_OPTIONS` اضافه کن

---

## وضعیت Build
✅ Build موفق — بدون هیچ error TypeScript

