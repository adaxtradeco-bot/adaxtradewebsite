# Import/Export Feature Documentation

## Overview
The Import/Export feature allows you to export pages and sections as JSON files and import them into other instances of the website. This feature maintains full compatibility with the existing dynamic structure and automatically handles section dependencies.

## Features

### ✅ Page Export/Import
- Export complete pages with all their sections
- Automatic section dependency detection
- Auto-import of required sections during page import
- Preserves all page metadata and builder data

### ✅ Section Export/Import
- Export individual section templates
- Import custom sections from other instances
- Maintains section configuration and styling

### ✅ Smart Dependency Management
- Automatically detects new sections in imported pages
- Auto-imports missing section templates
- Prevents conflicts with existing sections

## Usage

### Exporting Pages
1. Go to Admin → Pages
2. Find the page you want to export
3. Click the "Export" button in the actions column
4. JSON file will be downloaded automatically

### Importing Pages
1. Go to Admin → Pages
2. Click the "Import" button at the top
3. Select your JSON file
4. Review the preview
5. Click "Import" to complete

### Exporting Sections
1. Go to Admin → Sections
2. Find the section template you want to export
3. Click the "Export" button on the section card
4. JSON file will be downloaded automatically

### Importing Sections
1. Go to Admin → Sections
2. Click the "Import" button at the top
3. Select your JSON file
4. Review the preview
5. Click "Import" to complete

## File Structure

### Page Export Format
```json
{
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "type": "page",
  "data": {
    "page": {
      "title": "Page Title",
      "slug": "page-slug",
      "metaTitle": "Meta Title",
      "metaDescription": "Meta Description",
      "language": "en",
      "builderData": [...]
    },
    "sections": [...]
  }
}
```

### Section Export Format
```json
{
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "type": "section",
  "data": {
    "id": "section-id",
    "type": "section-type",
    "name": "Section Name",
    "category": "Content",
    "description": "Section description",
    "defaultData": {...}
  }
}
```

## Technical Implementation

### Components
- `ImportExportModal`: Main modal for import/export operations
- `ImportExportButtons`: Reusable buttons for triggering import/export
- `ImportExportManager`: Utility class for handling operations

### API Endpoints
- `POST /api/admin/import-export`: Handles import operations

### Key Features
- **Non-destructive**: Preserves existing structure completely
- **Modular**: Each component is independent and reusable
- **Validated**: All imports are validated before processing
- **Error Handling**: Comprehensive error reporting
- **Auto-detection**: Automatically detects and imports required sections

## Security & Validation

### Import Validation
- JSON structure validation
- Required field checking
- Data type validation
- Conflict detection

### Error Handling
- File parsing errors
- Database operation errors
- Validation failures
- Network errors

## Compatibility

### Backward Compatibility
- ✅ Works with all existing pages
- ✅ Preserves all current functionality
- ✅ No changes to existing database structure
- ✅ Compatible with all section types

### Forward Compatibility
- Version tracking for future migrations
- Extensible data structure
- Modular architecture for easy updates

## Usage Examples

### Migrating Content Between Environments
1. Export pages from development
2. Import to staging/production
3. All sections automatically included

### Sharing Section Templates
1. Create custom section in one instance
2. Export section template
3. Import in other instances
4. Use in page builder immediately

### Backup and Restore
1. Export all pages regularly
2. Store JSON files as backups
3. Restore individual pages as needed

## Troubleshooting

### Common Issues
- **File not recognized**: Ensure JSON format is correct
- **Import fails**: Check validation errors in modal
- **Missing sections**: Enable auto-import sections option
- **Duplicate content**: Use overwrite option if needed

### Support
For technical issues, check the browser console for detailed error messages and refer to the API response for specific validation failures.