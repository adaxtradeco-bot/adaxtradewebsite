# Homepage Selection Feature

## Overview
This feature allows you to select any page created with the page builder as your website's homepage.

## How to Use

### 1. Set a Page as Homepage
1. Go to Admin Panel → Pages (`/admin/pages`)
2. Find the page you want to set as homepage
3. Click the **"Set Home"** button next to that page
4. The page will be marked with a **"Homepage"** badge
5. The page's slug will automatically be set to `/`

### 2. View Your Homepage
- Visit your website root URL (e.g., `http://localhost:3000/en`)
- The selected homepage will be displayed automatically
- If no homepage is set, the default homepage will be shown

## Features

✅ **Visual Badge**: Pages marked as homepage show a purple "Homepage" badge  
✅ **Automatic Slug**: Homepage slug is automatically set to `/`  
✅ **Single Homepage**: Only one page can be homepage at a time  
✅ **Builder Integration**: Works seamlessly with the page builder  
✅ **Fallback**: Shows default homepage if no custom homepage is set

## Technical Details

### Database Changes
- Added `isHomepage` field to the `Page` model
- Field type: `BOOLEAN` with default value `false`

### API Endpoints
- `POST /api/admin/pages/[id]/set-homepage` - Set a page as homepage
- `GET /api/pages/homepage` - Get the current homepage data

### Files Modified
1. `prisma/schema.prisma` - Added `isHomepage` field
2. `src/app/admin/pages/page.tsx` - Added "Set Home" button and badge
3. `src/app/[lang]/page.tsx` - Updated to load custom homepage
4. `src/app/api/admin/pages/[id]/set-homepage/route.ts` - New API endpoint
5. `src/app/api/pages/homepage/route.ts` - New API endpoint

## Migration
The database has been updated automatically. If you need to run the migration manually:

```bash
npx tsx update-db-prisma.ts
```

Or use the SQL file:
```bash
sqlite3 prisma/dev.db < add_homepage_field.sql
```

## Notes
- Only published pages should be set as homepage
- The homepage will be rendered using the PageRenderer component
- All builder sections will work on the homepage
- The feature respects the existing theme and layout settings

## Troubleshooting

### Homepage not showing?
1. Make sure the page status is "published"
2. Check that `isHomepage` is set to `true` in database
3. Restart the dev server: `npm run dev`
4. Clear browser cache and reload
5. Check browser console for errors

### Verify homepage is set:
```bash
node check-homepage.js
```

This will show which page is currently set as homepage.
