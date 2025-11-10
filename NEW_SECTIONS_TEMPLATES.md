# New Section Templates Documentation

## 1. Hero Video Background
**Type:** `hero-video`
**Category:** Headers
**Icon:** 🎬

### Features:
- Full-screen video background
- Customizable overlay
- Auto-play with mute
- Fallback poster image
- Dark/Light mode support

### Default Data:
```json
{
  "videoUrl": "",
  "posterImage": "/placeholder-hero.jpg",
  "overlayColor": "black",
  "overlayOpacity": 50,
  "title": "Your Amazing Video Hero",
  "subtitle": "Captivating video background",
  "description": "Create stunning first impressions with video backgrounds",
  "buttons": [
    { "text": "Watch Demo", "variant": "primary", "size": "lg" },
    { "text": "Learn More", "variant": "outline", "size": "lg" }
  ]
}
```

---

## 2. Hero Animated
**Type:** `hero-animated`
**Category:** Headers  
**Icon:** ✨

### Features:
- Animated floating particles
- Gradient text animation
- Smooth entrance effects
- Customizable particle count
- Dark/Light mode support

### Default Data:
```json
{
  "title": "Animated Hero Section",
  "subtitle": "With floating particles",
  "description": "Eye-catching animations that engage your visitors",
  "particleCount": 50,
  "animationSpeed": "medium",
  "buttons": [
    { "text": "Get Started", "variant": "primary", "size": "lg" }
  ]
}
```

---

## 3. Timeline Vertical
**Type:** `timeline`
**Category:** Content
**Icon:** 📅

### Features:
- Vertical timeline with icons
- Alternating left/right layout
- Year/date display
- Connecting line
- Dark/Light mode support

### Default Data:
```json
{
  "title": "Our Journey",
  "subtitle": "Milestones and achievements",
  "layout": "center",
  "lineColor": "bg-violet-200",
  "items": [
    {
      "year": "2024",
      "title": "Launch",
      "description": "Started our journey",
      "icon": "🚀"
    },
    {
      "year": "2023",
      "title": "Founded",
      "description": "Company established",
      "icon": "🏢"
    }
  ]
}
```

---

## 4. Pricing Table
**Type:** `pricing`
**Category:** Actions
**Icon:** 💰

### Features:
- Multiple pricing tiers
- Monthly/Yearly toggle
- Highlighted popular plan
- Feature comparison
- Dark/Light mode support

### Default Data:
```json
{
  "title": "Simple, Transparent Pricing",
  "subtitle": "Choose the plan that fits your needs",
  "showYearlyToggle": true,
  "plans": [
    {
      "name": "Starter",
      "price": 29,
      "yearlyPrice": 290,
      "description": "Perfect for individuals",
      "features": [
        "5 Projects",
        "10GB Storage",
        "Email Support"
      ],
      "buttonText": "Start Free Trial",
      "buttonVariant": "outline"
    },
    {
      "name": "Pro",
      "price": 99,
      "yearlyPrice": 990,
      "description": "Best for professionals",
      "features": [
        "Unlimited Projects",
        "100GB Storage",
        "Priority Support",
        "Advanced Analytics"
      ],
      "highlighted": true,
      "buttonText": "Get Started",
      "buttonVariant": "primary"
    }
  ]
}
```

---

## 5. Stats Counter
**Type:** `stats`
**Category:** Social Proof
**Icon:** 📊

### Features:
- Animated number counting
- Icon for each stat
- Intersection Observer trigger
- Customizable colors
- Dark/Light mode support

### Default Data:
```json
{
  "title": "Trusted by Thousands",
  "subtitle": "Join our growing community",
  "animationDuration": 2000,
  "layout": "grid",
  "stats": [
    {
      "value": 10000,
      "suffix": "+",
      "label": "Active Users",
      "icon": "👥",
      "color": "violet"
    },
    {
      "value": 50,
      "suffix": "K",
      "label": "Downloads",
      "icon": "⬇️",
      "color": "cyan"
    },
    {
      "value": 99,
      "suffix": "%",
      "label": "Satisfaction",
      "icon": "⭐",
      "color": "green"
    },
    {
      "value": 24,
      "suffix": "/7",
      "label": "Support",
      "icon": "🛟",
      "color": "orange"
    }
  ]
}
```

---

## Usage in Page Builder

### Adding to Registry:
```typescript
import { HeroVideoSection } from '@/components/builder-sections/HeroVideoSection';
import { HeroAnimatedSection } from '@/components/builder-sections/HeroAnimatedSection';
import { TimelineSection } from '@/components/builder-sections/TimelineSection';
import { PricingSection } from '@/components/builder-sections/PricingSection';
import { StatsSection } from '@/components/builder-sections/StatsSection';
```

### Section Types:
- `hero-video` - Video background hero
- `hero-animated` - Animated particles hero
- `timeline` - Vertical timeline
- `pricing` - Pricing table
- `stats` - Animated statistics

### All sections support:
- ✅ Dark/Light mode
- ✅ Responsive design
- ✅ Customizable styling
- ✅ Builder mode preview
- ✅ Animation effects
