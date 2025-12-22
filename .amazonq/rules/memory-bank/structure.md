# Project Structure & Architecture

## Directory Organization

### Root Level Structure
```
english-website/
├── src/                    # Source code
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── docs/                   # Project documentation
├── scripts/                # Database seeding and utility scripts
├── sample pages/           # HTML templates and design references
└── .amazonq/rules/         # AI assistant rules and memory bank
```

## Core Application Structure (`src/`)

### Application Routes (`src/app/`)
- **`[lang]/`** - Internationalized routes with language prefixes
- **`admin/`** - Administrative interface and dashboard
  - `pages/` - Page management and builder interface
  - `menus/` - Navigation menu configuration
  - `settings/` - Site-wide settings management
  - `media/` - File upload and media management
- **`api/`** - REST API endpoints for data operations
- **`test-*/`** - Development testing pages

### Component Architecture (`src/components/`)

#### Admin Components (`admin/`)
- **PageBuilder/** - Visual page construction system
- **CustomStylesManager** - CSS customization interface
- **MediaManager** - File upload and organization
- **SettingsManager** - Configuration panels

#### Business Solution Components
- **`business-automation/`** - Enterprise workflow solutions
- **`fleet-management/`** - Vehicle and logistics management
- **`form-builder/`** - Dynamic form creation system
- **`workflow-orchestrator/`** - Process automation tools

#### Builder Sections (`builder-sections/`)
- 20+ reusable section types (hero, features, testimonials, pricing, etc.)
- Each section includes TypeScript interfaces and default configurations
- Responsive design patterns with Tailwind CSS

#### UI Components (`ui/`)
- Reusable interface elements following design system
- Accessibility-compliant components
- Theme-aware styling with dark/light mode support

### Business Logic (`src/lib/`)

#### Core Systems
- **`page-builder/`** - Section schemas, validation, and API integration
- **`admin/`** - Administrative utilities and helpers
- **`i18n/`** - Internationalization configuration and utilities
- **`import-export/`** - Data migration and backup systems
- **`themes/`** - Theme management and customization

#### Utilities
- **Database Integration** - Prisma client configuration
- **Authentication** - JWT-based user management
- **Design Tokens** - Centralized styling variables
- **Custom Styles** - Dynamic CSS management system

### Custom Hooks (`src/hooks/`)
- **`useCustomStyles`** - Dynamic CSS injection and management
- **`useSiteSettings`** - Global configuration state
- **`useTranslation`** - Multi-language content delivery
- **`useTheme`** - Dark/light mode management
- **`useImageUpload`** - File handling and optimization

## Database Architecture (`prisma/`)

### Core Models
- **User** - Authentication and role management
- **Page** - Content pages with builder data
- **Translation** - Multi-language content storage
- **Menu** - Navigation structure management
- **SiteSettings** - Global configuration
- **Media** - File metadata and organization
- **SectionTemplate** - Reusable content blocks

### Data Relationships
- Pages support both legacy sections and modern builder data
- Translations organized by namespace and language
- Menus support location-based and language-specific configurations
- Media files linked to content through path references

## Asset Management (`public/`)

### Static Assets
- **`assets/`** - Images, icons, and media files
- **`uploads/`** - User-generated content and settings files
- **Test Files** - API testing and development utilities

## Development Tools

### Scripts (`scripts/`)
- **Database Seeding** - Pre-populate content for different industries
- **Migration Tools** - Data import/export utilities
- **Development Helpers** - Testing and debugging scripts

### Documentation (`docs/`)
- **Implementation Guides** - Feature-specific documentation
- **Roadmaps** - Development phase planning
- **Technical Specifications** - Architecture and design decisions

## Architectural Patterns

### Page Builder System
- **Section-Based Architecture** - Modular content blocks
- **Schema Validation** - Type-safe configuration objects
- **Real-time Preview** - Live editing with immediate feedback
- **Template System** - Reusable section configurations

### Multi-language Support
- **Route-based Localization** - Language prefixes in URLs
- **Namespace Organization** - Logical grouping of translations
- **Fallback System** - Graceful handling of missing translations
- **RTL Support** - Right-to-left layout for Arabic content

### Theme System
- **Design Token Architecture** - Centralized styling variables
- **Dynamic CSS Injection** - Runtime style customization
- **Component-level Theming** - Granular style control
- **Accessibility Integration** - WCAG compliance built-in

### Security Architecture
- **Role-based Access Control** - Granular permission system
- **JWT Authentication** - Stateless session management
- **Input Validation** - Zod schema validation throughout
- **SQL Injection Prevention** - Prisma ORM protection