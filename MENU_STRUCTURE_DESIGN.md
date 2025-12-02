# Menu Structure Design - Unified Tree Architecture

## Overview
یک ساختار درختی یکپارچه که هر node میتونه یکی از 4 نوع باشه و children داشته باشه.

## Node Types

### 1. DROPDOWN
- **Purpose**: منوی اصلی که وقتی hover میشه باز میشه
- **Properties**:
  - label: عنوان منو
  - icon: آیکون
  - displayType: نوع نمایش (mega-menu, grid, list, cards, simple)
  - backgroundColor: رنگ پس‌زمینه dropdown
- **Children**: میتونه category یا page داشته باشه
- **Example**: "Product", "Industries"

### 2. CATEGORY
- **Purpose**: دسته‌بندی items داخل dropdown (ستون‌ها)
- **Properties**:
  - label: عنوان دسته (مثل "Sectors", "Core Features")
  - icon: آیکون دسته
  - description: توضیحات اختیاری
- **Children**: فقط page
- **Example**: "Sectors", "More Industries", "Core Features"

### 3. PAGE
- **Purpose**: لینک به یک صفحه
- **Properties**:
  - label: عنوان لینک
  - pageId: ID صفحه از page builder (optional)
  - href: URL مستقیم (اگر pageId نباشه)
  - icon: آیکون
  - description: توضیحات
  - badge: برچسب (New, Hot, ...)
- **Children**: ندارد
- **Example**: "Form Builder", "Oil & Gas"

### 4. LINK
- **Purpose**: لینک ساده بدون dropdown
- **Properties**:
  - label: عنوان
  - href: URL
  - icon: آیکون
- **Children**: ندارد
- **Example**: "Partnership", "Pricing"

## Tree Structure Example

```
Industries (DROPDOWN)
├─ displayType: "mega-menu"
├─ backgroundColor: "bg-white dark:bg-neutral-900"
└─ children:
    ├─ Sectors (CATEGORY)
    │   ├─ icon: "⚡"
    │   └─ children:
    │       ├─ Oil & Gas (PAGE)
    │       │   ├─ pageId: "page-123"
    │       │   ├─ icon: "⚡"
    │       │   └─ description: "Solutions for energy"
    │       ├─ IoT Integration (PAGE)
    │       └─ Real Estate (PAGE)
    └─ More Industries (CATEGORY)
        └─ children:
            ├─ Construction (PAGE)
            └─ Healthcare (PAGE)
```

## Data Structure

```typescript
interface MenuNode {
  id: string;
  type: 'dropdown' | 'category' | 'page' | 'link';
  label: string;
  icon?: string;
  
  // Type-specific properties
  displayType?: string;        // dropdown only
  backgroundColor?: string;    // dropdown only
  description?: string;        // category, page
  pageId?: string;            // page only
  href?: string;              // page, link
  badge?: string;             // page only
  
  // Recursive children
  children?: MenuNode[];
}
```

## Benefits

1. **یکپارچه**: همه چیز در یک ساختار درختی
2. **انعطاف‌پذیر**: هر node میتونه children داشته باشه
3. **Type-Safe**: هر type پراپرتی‌های مشخص خودش رو داره
4. **قابل توسعه**: راحت میشه type جدید اضافه کرد
5. **Page Picker**: میشه از لیست صفحات builder انتخاب کرد

## UI Flow

1. کاربر روی node کلیک میکنه
2. Property Panel نوع node رو نشون میده
3. بر اساس type، فیلدهای مربوطه نمایش داده میشه
4. اگر type=page باشه، page picker نشون داده میشه
5. میتونه child اضافه کنه (بر اساس قوانین parent type)

## Validation Rules

- DROPDOWN: children فقط CATEGORY یا PAGE
- CATEGORY: children فقط PAGE
- PAGE: children نداره
- LINK: children نداره
