# Translation Management System Implementation

## Overview
This document tracks the implementation of the translation management system for the admin panel.

## Current State (Before Implementation)
- Translation files: `src/locales/en/common.json` and `src/locales/ar/common.json`
- Static JSON files with hierarchical structure
- No database integration
- Manual file editing required

## Implementation Plan

### Phase 1: Database Integration
1. **Translation API Routes**
   - `GET /api/admin/translations` - List all translations
   - `PUT /api/admin/translations` - Update translations
   - `GET /api/admin/translations/sync` - Sync with JSON files

2. **Database Population**
   - Import existing JSON translations to database
   - Maintain hierarchical key structure (e.g., "nav.home", "components.hero.title")

### Phase 2: Admin Interface
1. **Translation Editor Page** (`/admin/translations`)
   - Language tabs (English/Arabic)
   - Search and filter functionality
   - Inline editing with save
   - Bulk import/export

2. **Real-time Updates**
   - Update database on save
   - Regenerate JSON files
   - Hot reload translations in frontend

### Phase 3: Integration
1. **Hook Integration**
   - Modify `useTranslation` hook to support database fallback
   - Maintain performance with caching
   - Graceful fallback to JSON files

## File Structure
```
src/
├── app/api/admin/translations/
│   ├── route.ts              # CRUD operations
│   ├── sync/route.ts         # Sync with JSON files
│   └── import/route.ts       # Bulk import
├── app/admin/translations/
│   └── page.tsx              # Translation editor UI
├── lib/
│   ├── translation-sync.ts   # JSON file sync utilities
│   └── translation-cache.ts  # Caching system
└── components/admin/
    └── TranslationEditor.tsx  # Translation editing component
```

## Key Features
- ✅ Hierarchical key structure preservation
- ✅ Real-time editing and preview
- ✅ Bulk operations (import/export)
- ✅ Search and filtering
- ✅ Language switching
- ✅ Automatic JSON file generation
- ✅ Performance optimization with caching

## Database Schema
```sql
Translation {
  id        String   @id @default(cuid())
  key       String   # e.g., "nav.home", "components.hero.title"
  language  String   # "en" or "ar"
  value     String   # Translation text
  namespace String?  # Optional grouping (components, pages, nav)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@unique([key, language, namespace])
}
```

## Implementation Notes
- Maintain backward compatibility with existing JSON files
- Implement caching for performance
- Ensure atomic updates to prevent inconsistencies
- Add validation for translation keys and values
- Support for nested object structures in keys