# Page Builder — Complete Reference

## Architecture Overview

```
Page Builder System
├── lib/page-builder/
│   ├── section-schemas.ts        ← Zod schemas + TypeScript types
│   ├── section-registry.ts       ← All section templates + defaultData
│   ├── section-registry-additions.ts  ← workflow, integrations, process
│   ├── section-registry-nwm.ts   ← NWM-style section templates
│   ├── section-renderer.tsx      ← Switch-based dynamic renderer
│   ├── builder-api.ts            ← load/save/convert page API calls
│   ├── page-converter.ts         ← Legacy page → builder format converters
│   └── why-ivaflow-new-version.ts ← Data for WhyIvaFlowNewVersion section
│
└── components/builder-sections/  ← ~80 React section components
```

## How It Works

1. **Database** stores pages with `builderData: SectionConfig[]` (JSON array)
2. **SectionConfig** = `{ id, type, order, data: {}, style: {} }`
3. **SectionRenderer** reads `section.type` → renders matching React component
4. **Admin Page Builder** UI lets users add/reorder/edit sections visually
5. **SECTION_TEMPLATES** in registry provides defaultData for each type

## Data Flow

```
DB (builderData JSON)
  → API /api/admin/pages/[id]/builder
  → loadBuilderPage() in builder-api.ts
  → SectionConfig[]
  → SectionRenderer (switch on section.type)
  → React Component
```

## SectionConfig Structure

```typescript
interface SectionConfig {
  id: string;           // unique ID (e.g. "hero-1")
  type: string;         // section type key (e.g. "hero", "features")
  order: number;        // render order (sorted ascending)
  data: Record<string, any>;  // section-specific content
  style?: {
    backgroundColor?: string;  // Tailwind class
    textColor?: string;        // Tailwind class
    padding?: string;          // Tailwind class
    alignment?: 'left' | 'center' | 'right';
    layout?: string;
    columns?: number;
  };
  responsive?: {
    mobile?: Record<string, any>;
    tablet?: Record<string, any>;
    desktop?: Record<string, any>;
  };
}
```

## All Section Types (type → Component)

### Headers / Hero
| type | Component | Notes |
|------|-----------|-------|
| `hero` / `HeroSection` | HeroSection | Standard hero with buttons, badges |
| `hero-video` | HeroVideoSection | Hero with background video |
| `hero-animated` | HeroAnimatedSection | Animated hero |
| `hero-slider` | HeroSliderSection | Multi-slide hero with statistics |
| `hero-slider-nwm` / `HeroSliderNWMSection` | HeroSliderNWMSection | NWM-style full-width slider |
| `home-slider-pro` | HOMEsLIDERpRO | BPMS industry slider with process word clouds |
| `industry-hero` | IndustryHeroSection | Industry-specific hero |
| `partnership-hero` | PartnershipHeroSection | Partnership page hero |
| `partnership-hero-interactive` | PartnershipHeroInteractive | Interactive partnership hero |
| `product-hero` | ProductHeroSection | Unified hero with themes, FA icons, flexible media |
| `AppBuilderHero` | AppBuilderHeroSection | App builder specific hero |
| `form-builder-features` | FormBuilderFeaturesSection | Form builder hero/features |
| `workflow-hero` | WorkflowHeroSection | Workflow page hero |

### Content Sections
| type | Component | Notes |
|------|-----------|-------|
| `features` | FeaturesSection | Grid of feature cards with icons |
| `features-compact` | FeaturesCompactSection | Compact feature list |
| `features-minimal` | FeaturesMinimalSection | Minimal feature display |
| `feature-grid` / `FeaturesGridSection` | FeatureGridSection | Feature grid layout |
| `feature-cards` / `FeatureCards` | FeatureCardsSection | Feature cards |
| `features-grid-nwm` | FeaturesGridNWMSection | NWM-style feature grid with glow |
| `tabs` | TabsSection | Interactive tabbed content |
| `platform-tabs` | PlatformTabsSection | Platform ecosystem tabs (by feature/industry/use case) |
| `experience-tabs` | ExperienceTabsSection | Experience-focused tabs |
| `feature-video-tabs` | FeatureVideoTabsSection | Full-width video with tab navigation |
| `fusion-teams-tabs` | FusionTeamsTabsSection | Team type tabs with enable/disable |
| `media-content` / `MediaContent` | MediaContentSection | Content + image/video left or right |
| `two-column-media` | TwoColumnMediaSection | Two-column with media placeholder |
| `sidebar-content` / `SidebarContent` | SidebarContentSection | Sidebar nav + content area |
| `simple-cards` | SimpleCardsSection | Grid of simple title+description cards |
| `metrics` | MetricsSection | Business impact metrics grid |
| `stats` | StatsSection | Stats counter with icons |
| `timeline` | TimelineSection | Timeline/steps layout |
| `process` | ProcessSection | Visual process flow diagram |
| `process-steps` | ProcessStepsSection | BPMS implementation timeline with hover effects |
| `workflow` | WorkflowSection | Automated workflow showcase |
| `integrations` | IntegrationsSection | Integration grid |
| `video` | VideoSection | Video embed section |
| `video-preview-nwm` | VideoPreviewNWMSection | Video placeholder with module list |
| `why` | WhySection | Why choose us section |
| `why-nwm` | WhyNWMSection | NWM-style 3-column why cards |
| `why-ivaflow-new-version` | WhyIvaFlowNewVersion | Advanced why with unified OS showcase |
| `why-automate-with-us` | WhyAutomateWithUsSection | Bento-style benefit cards with ticker |
| `platform-features` | PlatformFeaturesSection | Two-column feature list with background image |
| `interactive-feature-wall` | InteractiveFeatureWall | Interactive grid with dynamic preview |
| `wall-of-features` | WallOfFeaturesSection | ClickUp-style feature tile wall |
| `ecosystem-nwm` | EcosystemNWMSection | 3-column feature list in glass card |
| `infographic-nwm` | InfographicNWMSection | Architecture diagram with circular layers |
| `stakeholder` | StakeholderSection | Stakeholder cards |
| `stakeholders-nwm` | StakeholdersNWMSection | NWM-style 4-column stakeholder cards |
| `benefit-grid` | BenefitGridSection | Benefit grid layout |
| `benefits-grid` | BenefitsGridSection | Benefits grid variant |
| `case-study` | CaseStudySection | Case study showcase |
| `industry-features` | IndustryFeaturesSection | Industry-specific features |
| `industry-cards` | IndustryCardsSection | Industry solution cards |
| `properties` | PropertiesSection | Property showcase cards |
| `location` | LocationSection | Location map + contact info |
| `partner-cards` | PartnerCardsSection | Partner showcase cards |
| `partner-benefits` | PartnerBenefitsSection | Partnership benefits grid |
| `partner-types` | PartnerTypesSection | Partnership type cards with CTAs |
| `partners-nwm` | PartnersNWMSection | NWM-style partner cards |
| `requirements` | RequirementsSection | Requirements list + visual |

### Form Builder Sections (dedicated page)
| type | Component |
|------|-----------|
| `form-builder-why` | FormBuilderWhySection |
| `field-types` | FieldTypesSection |
| `dynamic-forms-content` | DynamicFormsContentSection |
| `form-builder-templates` | FormBuilderTemplatesSection |
| `form-builder-integrations` | FormBuilderIntegrationsSection |
| `form-builder-analytics` | FormBuilderAnalyticsSection |
| `form-builder-mobile-voice` | FormBuilderMobileVoiceSection |
| `form-builder-governance` | FormBuilderGovernanceSection |
| `form-builder-bpms` | FormBuilderBPMSSection |
| `form-builder-faq` | FormBuilderFAQSection |

### Social Proof
| type | Component |
|------|-----------|
| `testimonial` | TestimonialSection |
| `testimonials` / `Testimonials` | TestimonialsSection |
| `compliance` | ComplianceBadgesSection |
| `team` | TeamSection |

### Actions / CTA
| type | Component |
|------|-----------|
| `cta` / `CTA` / `CTASection` | CTASection |
| `faq` | FAQSection |
| `form-builder-final-cta` | FormBuilderFinalCTASection |
| `final-cta-nwm` | FinalCTANWMSection |
| `pricing` | PricingSection |

### Inline Rendered (no separate component)
| type | Notes |
|------|-------|
| `showcase` | Inline grid with image+features |
| `logo-cloud` | Logo grid |
| `ContentSection` | Simple centered text |
| `CardsSection` | 3-col cards with CTA |
| `TwoColumnSection` | Two-col with list + visual |

## Section Categories (SECTION_CATEGORIES)
- `Headers` — hero sections
- `Content` — main content blocks
- `Actions` — CTAs, FAQs, pricing
- `Social Proof` — testimonials, stats, compliance
- `Navigation` — (reserved)

## Component Prop Patterns

Components receive props in **two patterns**:

**Pattern A — `data` + `style` props:**
```tsx
<CTASection data={section.data} style={section.style} />
```

**Pattern B — spread `section.data` directly:**
```tsx
<MetricsSection key={section.id} {...section.data} />
<HOMEsLIDERpRO data={section.data} style={section.style} />
```

**Pattern C — full `section` object:**
```tsx
<HeroSection section={section} isBuilder={isBuilder} />
<ProductHeroSection section={section} />
```

## Builder API Endpoints

```
GET  /api/admin/pages/[id]/builder   → load page with builderData
PUT  /api/admin/pages/[id]/builder   → save sections array
POST /api/admin/pages/[id]/convert   → convert legacy page to builder
```

Auth: `Authorization: Bearer <adminToken>` (stored in localStorage)

## Adding a New Section — Checklist

1. **Create component** in `src/components/builder-sections/NewSection.tsx`
2. **Add type** to `BaseSectionSchema` enum in `section-schemas.ts`
3. **Add template** to `SECTION_TEMPLATES` in `section-registry.ts` with `defaultData`
4. **Add case** in `SectionRenderer` switch in `section-renderer.tsx`
5. **Import component** at top of `section-renderer.tsx`

## Style Conventions

All sections use Tailwind classes in `style` object:
- `backgroundColor`: e.g. `"bg-white"`, `"bg-slate-900"`, `"bg-gradient-to-br from-violet-50 to-cyan-50"`
- `textColor`: e.g. `"text-slate-900"`, `"text-white"`
- `padding`: e.g. `"py-16"`, `"py-20 lg:py-32"`
- Dark mode: use `dark:` prefix inline in component JSX, not in style object

## Key Files Quick Reference

| Task | File |
|------|------|
| Add/find section type | `section-registry.ts` |
| Add NWM-style section | `section-registry-nwm.ts` |
| Fix rendering bug | `section-renderer.tsx` |
| Add Zod validation | `section-schemas.ts` |
| API calls | `builder-api.ts` |
| Legacy page migration | `page-converter.ts` |
| Section components | `src/components/builder-sections/` |
