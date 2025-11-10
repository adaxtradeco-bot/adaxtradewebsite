# Website Page Structure Documentation

## Page Types & Sections

### 1. Home Page (`/[lang]`)
- **HeroSection**: Main banner with title, description, CTA buttons
- **FeaturesSection**: Key features grid
- **CTASection**: Final call-to-action with contact form

### 2. App Builder Page (`/[lang]/app-builder`)
- **PageHeader**: Page title and subtitle
- **AppBuilderHero**: Main hero section with features
- **WhySection**: Why choose app builder vs custom dev
- **WorkspacesSection**: Dedicated workspaces and roles
- **BuilderTabs**: Interactive tabs (UI, Flows, Themes, Code)
- **UseCasesSection**: Use cases grid and testimonials
- **CTASection**: FAQ and final CTA

### 3. Form Builder Page (`/[lang]/form-builder`)
- **PageHeader**: Page title and subtitle
- **FormBuilderHero**: Main hero section
- **FeaturesGrid**: Form builder features
- **TemplatesSection**: Pre-built templates
- **IntegrationsSection**: Available integrations
- **CTASection**: FAQ and final CTA

### 4. Other Marketing Pages
- **Workflow Orchestrator** (`/[lang]/workflow-orchestrator`)
- **Fleet Management** (`/[lang]/fleet-management`)
- **Business Automation** (`/[lang]/business-automation`)
- **Contact** (`/[lang]/contact`)

## Section Component Types

### Content Sections
1. **HeroSection**: Large banner with title, subtitle, description, buttons
2. **FeatureGrid**: Grid of features with icons, titles, descriptions
3. **TextImageSection**: Text content with accompanying image
4. **TabsSection**: Interactive tabbed content
5. **TestimonialsSection**: Customer testimonials grid
6. **FAQSection**: Expandable FAQ items
7. **CTASection**: Call-to-action with form or buttons
8. **StatsSection**: Statistics/metrics display
9. **PricingSection**: Pricing plans comparison
10. **ContactSection**: Contact form and information

### Layout Sections
- **Header**: Navigation and branding
- **Footer**: Links and company information
- **Sidebar**: Additional navigation or content

## Content Structure

### Text Content
- **title**: Main heading
- **subtitle**: Secondary heading
- **description**: Body text
- **buttonText**: CTA button labels
- **linkText**: Navigation links

### Media Content
- **heroImage**: Main section image
- **featureIcons**: Small icons for features
- **testimonialAvatars**: Customer photos
- **backgroundImages**: Section backgrounds

### Interactive Elements
- **buttons**: Call-to-action buttons
- **forms**: Contact/signup forms
- **tabs**: Tabbed content navigation
- **accordions**: Expandable content sections

## Translation Keys Structure
```
{
  "pages": {
    "pageName": {
      "title": "Page Title",
      "subtitle": "Page Subtitle"
    }
  },
  "sections": {
    "sectionName": {
      "title": "Section Title",
      "description": "Section Description",
      "buttons": {
        "primary": "Primary Button",
        "secondary": "Secondary Button"
      }
    }
  },
  "components": {
    "componentName": {
      "title": "Component Title",
      "items": [...]
    }
  }
}
```