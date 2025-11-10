# Visual Page Builder Implementation

## Overview
Transform existing static pages into a drag-and-drop visual editor where all current pages appear as if they were built with the builder.

## Current Pages to Convert
1. **Home Page** (`/[lang]`) - Hero + Features
2. **App Builder** (`/[lang]/app-builder`) - Hero + Why Section + Workspaces + Tabs + Use Cases + CTA
3. **Form Builder** (`/[lang]/form-builder`) - Hero + Features + Templates + Integrations + CTA
4. **Other Marketing Pages** - Fleet Management, Business Automation, etc.

## Section Types to Create
### Core Sections
1. **HeroSection** - Large banner with title, subtitle, description, buttons
2. **FeaturesSection** - Grid of features with icons and descriptions
3. **CTASection** - Call-to-action with form or buttons
4. **TestimonialsSection** - Customer testimonials
5. **FAQSection** - Expandable FAQ items
6. **StatsSection** - Statistics display
7. **TabsSection** - Interactive tabbed content
8. **TextImageSection** - Text with accompanying image
9. **WorkspacesSection** - Dedicated workspaces content
10. **UseCasesSection** - Use cases grid with testimonials

## Implementation Architecture

### Database Schema Enhancement
```prisma
model SectionTemplate {
  id           String   @id @default(cuid())
  name         String   # "Hero Section"
  type         String   # "hero"
  category     String   # "Headers", "Content", "Actions"
  description  String
  defaultData  String   # JSON schema for default content
  configSchema String   # JSON schema for configuration options
  previewImage String?  # Preview thumbnail
  usageCount   Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Page {
  // ... existing fields
  builderData  String?  # JSON array of sections with configuration
  isBuilderPage Boolean @default(false) # Flag to use builder rendering
}
```

### Component Structure
```
src/components/admin/PageBuilder/
├── PageBuilder.tsx           # Main builder interface
├── Canvas.tsx                # Drag-and-drop canvas
├── SectionLibrary.tsx        # Draggable section components
├── PropertyPanel.tsx         # Section configuration panel
├── PreviewModes.tsx          # Device preview modes
├── Toolbar.tsx               # Save, preview, publish actions
└── sections/
    ├── HeroSectionBuilder.tsx
    ├── FeaturesSectionBuilder.tsx
    ├── CTASectionBuilder.tsx
    └── ... (all section builders)

src/components/builder-sections/
├── HeroSection.tsx           # Rendered hero section
├── FeaturesSection.tsx       # Rendered features section
├── CTASection.tsx            # Rendered CTA section
└── ... (all renderable sections)

src/lib/page-builder/
├── section-registry.ts       # Section type definitions
├── section-renderer.tsx      # Dynamic section rendering
├── builder-utils.ts          # Builder utilities
└── section-schemas.ts        # Configuration schemas
```

## Section Configuration Schema
Each section will have a standardized configuration:

```typescript
interface SectionConfig {
  id: string;
  type: string;
  order: number;
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttons?: ButtonConfig[];
    items?: any[];
    image?: MediaConfig;
    [key: string]: any;
  };
  style: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    alignment?: 'left' | 'center' | 'right';
    [key: string]: any;
  };
  responsive: {
    mobile?: Partial<SectionConfig['style']>;
    tablet?: Partial<SectionConfig['style']>;
    desktop?: Partial<SectionConfig['style']>;
  };
}
```

## Migration Strategy
1. **Extract Current Sections**: Convert existing page components to builder sections
2. **Create Section Templates**: Define default configurations for each section type
3. **Migrate Page Data**: Convert existing pages to builder format
4. **Maintain Compatibility**: Ensure existing URLs and functionality work
5. **Gradual Rollout**: Enable builder per page basis

## Key Features
- ✅ Drag-and-drop section management
- ✅ Live preview with device modes
- ✅ Property panel for section configuration
- ✅ Responsive design controls
- ✅ Section library with categories
- ✅ Undo/redo functionality
- ✅ Auto-save capabilities
- ✅ Export/import page templates

## Technical Dependencies
- `@dnd-kit/core` - Drag and drop functionality
- `@dnd-kit/sortable` - Sortable section lists
- `react-hook-form` - Form handling in property panel
- `zod` - Schema validation
- `framer-motion` - Smooth animations

## Implementation Phases
1. **Phase 1**: Section registry and basic builder UI
2. **Phase 2**: Drag-and-drop functionality
3. **Phase 3**: Property panel and configuration
4. **Phase 4**: Responsive controls and preview modes
5. **Phase 5**: Migration of existing pages
6. **Phase 6**: Advanced features (templates, undo/redo)