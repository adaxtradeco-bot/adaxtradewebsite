# Sections Reference Guide

## Complete List of All Available Sections

### Headers Category

#### 1. workflow-hero
**Icon**: 🔄  
**Description**: Hero section for workflow/orchestration pages with feature cards  
**File**: `WorkflowHeroSection.tsx`

**Customizable Properties**:
- badge (text)
- title (text)
- titleHighlight (text)
- description (text)
- primaryButton (text, href)
- secondaryButton (text, href)
- footerText (text)
- cards[] (icon, title, description)
- backgroundColor
- gradientFrom, gradientTo

#### 2. industry-hero
**Icon**: 🏭  
**Description**: Specialized hero for industry pages  
**File**: `IndustryHeroSection.tsx`

**Customizable Properties**:
- title, subtitle, description
- icon
- buttons[]
- textAlign
- backgroundColor

#### 3. hero
**Icon**: 🎯  
**Description**: Standard hero section  
**File**: `HeroSection.tsx`

**Customizable Properties**:
- title, subtitle, description
- buttons[]
- badges[]
- backgroundImage

---

### Content Category

#### 4. simple-cards
**Icon**: 🎴  
**Description**: Grid of simple cards with title and description  
**File**: `SimpleCardsSection.tsx`

**Customizable Properties**:
- title, description
- cards[] (title, description)
- columns (2, 3, 4)
- backgroundColor, textColor

#### 5. two-column-media
**Icon**: 🖼️  
**Description**: Content with media/placeholder on left or right  
**File**: `TwoColumnMediaSection.tsx`

**Customizable Properties**:
- title, description
- features[] (text)
- mediaIcon, mediaText
- mediaPosition (left, right)
- badge
- pattern (boolean)
- backgroundColor, textColor

#### 6. feature-cards
**Icon**: 🎯  
**Description**: Feature cards with icon, title, description, and details list  
**File**: `FeatureCardsSection.tsx`

**Customizable Properties**:
- cards[] (icon, title, description, details[])
- backgroundColor, textColor

#### 7. sidebar-content
**Icon**: 📋  
**Description**: Sidebar navigation with content area  
**File**: `SidebarContentSection.tsx`

**Customizable Properties**:
- sidebarItems[] (id, label, content{})
- Each content: title, description, features[], placeholderIcon, placeholderText
- backgroundColor, textColor

#### 8. media-content
**Icon**: 🎬  
**Description**: Content section with image or video  
**File**: `MediaContentSection.tsx`

**Customizable Properties**:
- title, subtitle, description
- mediaType (image, video)
- mediaUrl, mediaAlt
- layout (media-left, media-right)
- features[] (icon, title, description)
- ctaText, ctaLink
- backgroundColor, textColor

#### 9. features
**Icon**: ⭐  
**Description**: Grid layout showcasing features  
**File**: `FeaturesSection.tsx`

**Customizable Properties**:
- title, subtitle, description
- items[] (title, description, icon)

#### 10. tabs
**Icon**: 📑  
**Description**: Tabbed content with interactive switching  
**File**: `TabsSection.tsx`

**Customizable Properties**:
- tabs[] (id, label, title, description, features[])

#### 11. faq
**Icon**: ❓  
**Description**: Expandable FAQ  
**File**: `FAQSection.tsx`

**Customizable Properties**:
- title, subtitle
- categories[] (title, items[])

---

### Actions Category

#### 12. cta
**Icon**: 🚀  
**Description**: Call-to-action section  
**File**: `CTASection.tsx`

**Customizable Properties**:
- title, description
- buttons[] (text, href, variant, size)
- backgroundColor, textColor, alignment

---

### Social Proof Category

#### 13. metrics
**Icon**: 📊  
**Description**: Display business impact metrics  
**File**: `MetricsSection.tsx`

**Customizable Properties**:
- title, description
- metrics[] (value, label)
- backgroundColor, textColor

#### 14. testimonials
**Icon**: 💬  
**Description**: Customer testimonials  
**File**: `TestimonialsSection.tsx`

**Customizable Properties**:
- title, subtitle
- testimonials[] (name, role, content, rating, avatar)
- backgroundColor, textColor, alignment

#### 15. stats
**Icon**: 📊  
**Description**: Statistics counter  
**File**: `StatsSection.tsx`

**Customizable Properties**:
- title
- stats[] (value, label, icon)

---

## Common Style Properties

### All Sections Support:
```json
{
  "style": {
    "backgroundColor": "bg-white dark:bg-slate-900",
    "textColor": "text-slate-900 dark:text-white",
    "padding": "py-16",
    "alignment": "center"
  }
}
```

### Background Options:
- Solid: `bg-white`, `bg-slate-50`, `bg-slate-900`
- Gradient: `bg-gradient-to-r from-violet-600 to-cyan-500`
- Complex: `bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50`

### Text Color Options:
- Light: `text-slate-900 dark:text-white`
- Dark: `text-white`
- Colored: `text-violet-600 dark:text-violet-400`

### Padding Options:
- `py-8` (32px)
- `py-16` (64px)
- `py-20` (80px)
- `py-24` (96px)
- `py-32` (128px)

### Alignment Options:
- `left`
- `center`
- `right`

## Icon Options for Feature Cards

Lucide Icons که در FeatureCardsSection استفاده میشن:
- Settings, Layers, Zap, Link, Users, FileText
- Workflow, BarChart3, Shield
- و بیشتر...

## Button Variants

```json
{
  "variant": "primary" | "secondary" | "outline",
  "size": "sm" | "md" | "lg"
}
```

## Media Types

```json
{
  "mediaType": "image" | "video",
  "mediaUrl": "/path/to/media.jpg",
  "videoProvider": "youtube" | "vimeo" | "direct"
}
```

## Layout Options

### MediaContentSection:
- `media-left` - عکس سمت چپ، محتوا سمت راست
- `media-right` - محتوا سمت چپ، عکس سمت راست

### TwoColumnMediaSection:
- `mediaPosition: "left"` - media سمت چپ
- `mediaPosition: "right"` - media سمت راست

## Grid Columns

### SimpleCardsSection:
- `columns: 2` - 2 ستون
- `columns: 3` - 3 ستون
- `columns: 4` - 4 ستون

## Best Practices

1. **همیشه dark mode support داشته باشید**
2. **از Tailwind classes استفاده کنید**
3. **responsive design را رعایت کنید**
4. **accessibility را فراموش نکنید**
5. **performance را در نظر بگیرید**

## Quick Reference Table

| Section Type | Category | Use Case |
|--------------|----------|----------|
| workflow-hero | Headers | Workflow pages |
| industry-hero | Headers | Industry pages |
| hero | Headers | General pages |
| simple-cards | Content | Feature lists |
| two-column-media | Content | Content + Image |
| feature-cards | Content | Detailed features |
| sidebar-content | Content | Builder interfaces |
| media-content | Content | Rich media content |
| metrics | Social Proof | Business impact |
| testimonials | Social Proof | Customer reviews |
| cta | Actions | Conversions |
