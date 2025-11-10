# Phase 2: Database Integration & Page Builder Route

## 🎯 Implementation Plan

### Step 1: Database Schema Update
**Goal**: Add builder support to existing pages table
**Changes**:
- Add `builderData` field to store section configurations
- Add `isBuilderPage` flag to identify builder-created pages
- Maintain backward compatibility with existing pages

### Step 2: API Enhancement
**Goal**: Support builder data in pages API
**Changes**:
- Update GET `/api/admin/pages/[id]` to return builder data
- Update PUT `/api/admin/pages/[id]` to save builder data
- Add validation for section configurations

### Step 3: Builder Route
**Goal**: Create dedicated builder interface
**Route**: `/admin/pages/builder/[id]`
**Features**:
- Full-screen builder interface
- Integration with existing page data
- Save/load builder configurations

### Step 4: Page Conversion
**Goal**: Convert existing pages to builder format
**Process**:
- Analyze current page structure
- Map components to builder sections
- Create migration utility

## 🗂️ File Structure
```
src/
├── app/admin/pages/builder/[id]/
│   └── page.tsx                    # Builder interface route
├── lib/page-builder/
│   ├── page-converter.ts           # Convert pages to builder format
│   └── builder-api.ts              # Builder-specific API calls
├── prisma/
│   └── migrations/                 # Database schema updates
└── scripts/
    └── migrate-pages.ts            # Page migration script
```

## 🔄 Migration Strategy
1. **Non-destructive**: Keep existing page data intact
2. **Gradual**: Enable builder per page basis
3. **Fallback**: Support both builder and traditional rendering
4. **Validation**: Ensure data integrity throughout process

## 📊 Database Changes
```prisma
model Page {
  // ... existing fields
  builderData    String?  # JSON array of section configurations
  isBuilderPage  Boolean  @default(false) # Flag for builder pages
  builderVersion String?  # Track builder version for migrations
}
```

## 🔌 API Integration Points
- **Load**: Fetch page with builder data
- **Save**: Store section configurations
- **Validate**: Check section schema compliance
- **Convert**: Transform existing pages to builder format

## 🎨 UI Integration
- **Builder Button**: Add "Open in Builder" to page list
- **Mode Toggle**: Switch between traditional and builder editing
- **Migration UI**: Convert pages with user confirmation
- **Preview**: Show builder vs traditional rendering