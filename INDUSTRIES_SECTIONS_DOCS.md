# Industries Sections Documentation

## New Sections Created

### 1. IndustryHeroSection
**Type**: `industry-hero`

**Features**:
- Industry-specific color themes
- Stats display
- Dual CTA buttons
- Gradient backgrounds per industry

**Props**:
```typescript
{
  data: {
    industry: 'oilgas' | 'iot' | 'realestate' | 'construction' | 'healthcare' | 'default';
    title: string;
    subtitle: string;
    description: string;
    stats?: Array<{ value: string; label: string }>;
    primaryButton?: { text: string; link: string };
    secondaryButton?: { text: string; link: string };
  };
  style?: {
    alignment?: 'left' | 'center';
  };
}
```

**Default Data**:
```json
{
  "type": "industry-hero",
  "data": {
    "industry": "default",
    "title": "Transform Your Industry",
    "subtitle": "Industry Solutions",
    "description": "Powerful automation for your business",
    "stats": [
      { "value": "500+", "label": "Companies" },
      { "value": "99%", "label": "Uptime" },
      { "value": "50%", "label": "Cost Reduction" },
      { "value": "24/7", "label": "Support" }
    ]
  }
}
```

---

### 2. BenefitGridSection
**Type**: `benefit-grid`

**Features**:
- Icon-based benefits
- 2/3/4 column layouts
- Hover effects
- Dark mode support

**Props**:
```typescript
{
  data: {
    title: string;
    subtitle?: string;
    benefits: Array<{
      id: string;
      icon: string; // Lucide icon name
      title: string;
      description: string;
    }>;
  };
  style?: {
    columns?: 2 | 3 | 4;
  };
}
```

---

### 3. CaseStudySection
**Type**: `case-study`

**Features**:
- Company logos
- Challenge/Solution/Results format
- Image support
- Grid layout

**Props**:
```typescript
{
  data: {
    title: string;
    subtitle?: string;
    caseStudies: Array<{
      id: string;
      company: string;
      logo?: string;
      industry: string;
      challenge: string;
      solution: string;
      results: string[];
      image?: string;
    }>;
  };
}
```

---

### 4. IndustryFeaturesSection
**Type**: `industry-features`

**Features**:
- Image + features layout
- Icon-based features
- Detail lists
- Image positioning (left/right)

**Props**:
```typescript
{
  data: {
    title: string;
    subtitle?: string;
    image?: string;
    features: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
      details?: string[];
    }>;
  };
  style?: {
    layout?: 'image-left' | 'image-right' | 'no-image';
    imagePosition?: 'left' | 'right';
  };
}
```

---

## Industry Theme Colors

```typescript
const themes = {
  oilgas: 'from-blue-900 to-amber-500',
  iot: 'from-teal-600 to-green-500',
  realestate: 'from-slate-700 to-yellow-500',
  construction: 'from-orange-600 to-gray-600',
  healthcare: 'from-blue-600 to-green-500',
};
```

---

## Usage in Database

```typescript
await prisma.page.create({
  data: {
    slug: 'industries',
    isBuilderPage: true,
    builderData: {
      sections: [
        {
          id: 'hero-1',
          type: 'industry-hero',
          order: 1,
          data: { /* ... */ },
          style: { /* ... */ }
        }
      ]
    }
  }
});
```

---

## Files Created

✅ `src/lib/themes/industry-theme.ts`
✅ `src/components/builder-sections/IndustryHeroSection.tsx`
✅ `src/components/builder-sections/BenefitGridSection.tsx`
✅ `src/components/builder-sections/CaseStudySection.tsx`
✅ `src/components/builder-sections/IndustryFeaturesSection.tsx`
✅ `src/app/[lang]/industries/page.tsx`
✅ Updated `section-schemas.ts`
✅ Updated `section-renderer.tsx`

---

## Next Steps

1. Create industry subpages (oilgas, iot, etc.)
2. Add to navigation menu
3. Create database records
4. Test builder functionality
