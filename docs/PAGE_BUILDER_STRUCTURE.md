# Page Builder Structure Documentation

## Overview
این سیستم یک Page Builder کامل است که به شما امکان میدهد صفحات را به صورت داینامیک با drag & drop سکشنها بسازید.

## Database Schema

### Table: Page
```prisma
model Page {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  metaTitle     String?
  metaDescription String?
  status        String    @default("draft") // published, draft
  language      String    @default("en") // en, ar
  sections      String?   // JSON string (legacy)
  builderData   String?   // JSON array of builder sections
  isBuilderPage Boolean   @default(false)
  builderVersion String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## Builder Data Structure

### Format
```json
{
  "sections": [
    {
      "id": "unique-id",
      "type": "section-type",
      "order": 0,
      "data": {
        // Section-specific data
      },
      "style": {
        "backgroundColor": "bg-white dark:bg-slate-900",
        "textColor": "text-slate-900 dark:text-white",
        "padding": "py-16",
        "alignment": "center"
      }
    }
  ]
}
```

## Available Section Types

### 1. workflow-hero
Hero section برای صفحات workflow با feature cards

**Data Structure:**
```json
{
  "badge": "Live orchestration for modern teams",
  "title": "Orchestrate Processes. Reduce Errors.",
  "titleHighlight": "Move Faster.",
  "description": "Model, automate, and optimize...",
  "primaryButton": {
    "text": "Explore Features",
    "href": "#features"
  },
  "secondaryButton": {
    "text": "See Business Impact",
    "href": "#impact"
  },
  "footerText": "Secure • Extensible • Real-time visibility",
  "cards": [
    {
      "icon": "⚙️",
      "title": "Visual Builder",
      "description": "Drag & drop stages..."
    }
  ]
}
```

### 2. simple-cards
Grid از کارتهای ساده با title و description

**Data Structure:**
```json
{
  "title": "Why Intelligent Orchestration?",
  "description": "Centralization, compliance...",
  "cards": [
    {
      "title": "Centralization & Visibility",
      "description": "Unify requests and track..."
    }
  ],
  "columns": 4
}
```

### 3. two-column-media
محتوا در یک طرف، media/placeholder در طرف دیگر

**Data Structure:**
```json
{
  "title": "No-Code Workflow Builder",
  "description": "Design multi‑stage workflows...",
  "features": [
    { "text": "Drag‑and‑drop stages & forms" }
  ],
  "mediaIcon": "🔄",
  "mediaText": "Workflow Builder Screenshot",
  "mediaPosition": "right",
  "badge": "Build once, reuse across departments",
  "pattern": true
}
```

### 4. feature-cards
کارتهای feature با آیکون، عنوان، توضیحات و لیست details

**Data Structure:**
```json
{
  "cards": [
    {
      "icon": "Settings",
      "title": "Process Design",
      "description": "Define processes in a web UI...",
      "details": [
        "Web-based designer",
        "Folder organization",
        "Access control"
      ]
    }
  ]
}
```

### 5. metrics
نمایش business impact metrics در grid

**Data Structure:**
```json
{
  "title": "Proven Business Impact",
  "description": "Cut manual effort...",
  "metrics": [
    {
      "value": "40%+",
      "label": "Cycle time reduction"
    }
  ]
}
```

### 6. sidebar-content
Sidebar navigation با content area

**Data Structure:**
```json
{
  "sidebarItems": [
    {
      "id": "ui-blocks",
      "label": "UI Blocks",
      "content": {
        "title": "Visual Drag-and-Drop Builder",
        "description": "Place forms, tables...",
        "features": [
          { "text": "Reusable components" }
        ],
        "placeholderIcon": "🎨",
        "placeholderText": "Canvas preview"
      }
    }
  ]
}
```

### 7. media-content
Content section با image/video در چپ یا راست

**Data Structure:**
```json
{
  "title": "Powerful Features",
  "subtitle": "Why Choose Us",
  "description": "Discover how our platform...",
  "mediaType": "image",
  "mediaUrl": "/placeholder-image.jpg",
  "mediaAlt": "Feature showcase",
  "layout": "media-right",
  "features": [
    {
      "icon": "⚡",
      "title": "Lightning Fast",
      "description": "Optimized performance..."
    }
  ],
  "ctaText": "Learn More",
  "ctaLink": "#"
}
```

### 8. cta
Call to action section با دکمهها

**Data Structure:**
```json
{
  "title": "Ready to Transform Your Workflows?",
  "description": "Start orchestrating processes...",
  "buttons": [
    {
      "text": "Start Free Trial →",
      "href": "/signup",
      "variant": "primary",
      "size": "lg"
    }
  ]
}
```

### 9. hero
Hero section استاندارد

**Data Structure:**
```json
{
  "title": "Your Amazing Title",
  "subtitle": "Compelling Subtitle",
  "description": "Write a compelling description...",
  "buttons": [
    {
      "text": "Get Started",
      "href": "#",
      "variant": "primary",
      "size": "lg"
    }
  ],
  "badges": [
    { "text": "Free Trial", "variant": "success" }
  ]
}
```

### 10. industry-hero
Hero برای صفحات industry

**Data Structure:**
```json
{
  "title": "Built for Your Industry",
  "subtitle": "Transform Operations...",
  "description": "See how teams transform...",
  "icon": "🏭",
  "buttons": [
    {
      "text": "Explore Solutions",
      "href": "#solutions",
      "variant": "primary",
      "size": "lg"
    }
  ],
  "textAlign": "center"
}
```

## Style Options

### backgroundColor
- `bg-white dark:bg-slate-900`
- `bg-slate-50 dark:bg-slate-800`
- `bg-gradient-to-r from-violet-600 to-cyan-500`
- `bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50`

### textColor
- `text-slate-900 dark:text-white`
- `text-white`

### padding
- `py-8` - Small (32px)
- `py-16` - Medium (64px)
- `py-20` - Large (80px)
- `py-24` - Extra Large (96px)

### alignment
- `left`
- `center`
- `right`

## File Locations

### Components
- **Sections**: `src/components/builder-sections/`
- **Admin**: `src/components/admin/PageBuilder/`

### Configuration
- **Registry**: `src/lib/page-builder/section-registry.ts`
- **Renderer**: `src/lib/page-builder/section-renderer.tsx`
- **Schemas**: `src/lib/page-builder/section-schemas.ts`

### Pages
- **Builder**: `/admin/pages/builder/[id]`
- **Dynamic Pages**: `src/app/[lang]/[page-slug]/page.tsx`

## How to Add New Section

1. **Create Component**: `src/components/builder-sections/NewSection.tsx`
2. **Add to Schema**: `src/lib/page-builder/section-schemas.ts`
3. **Add to Registry**: `src/lib/page-builder/section-registry.ts`
4. **Add to Renderer**: `src/lib/page-builder/section-renderer.tsx`

## Database Pages

### Current Pages in Database
1. `/en/showcase` - Demo page
2. `/en/form-builder` - Form builder page
3. `/en/workflow-builder` - Workflow orchestrator page

## Example: Creating a Page

```javascript
const builderData = {
  sections: [
    {
      id: 'hero-1',
      type: 'workflow-hero',
      order: 0,
      data: { /* hero data */ },
      style: { /* style options */ }
    },
    {
      id: 'cards-1',
      type: 'simple-cards',
      order: 1,
      data: { /* cards data */ },
      style: { /* style options */ }
    }
  ]
};

await prisma.page.create({
  data: {
    slug: '/en/my-page',
    title: 'My Page',
    isBuilderPage: true,
    builderData: JSON.stringify(builderData),
    status: 'published'
  }
});
```

## Editing in Builder

### PropertyPanel
- **Hero, Features, CTA**: فرم با فیلدهای مشخص
- **سایر سکشنها**: JSON Editor

### JSON Editor
- تغییرات real-time
- Validation برای JSON
- پیغام خطا برای JSON نامعتبر

## Notes
- همه سکشنها باید props کامل داشته باشند
- همه متنها، رنگها، اندازهها قابل تغییر هستند
- هر سکشن باید responsive باشه
- Dark mode support الزامی است
