# Site Settings Feature

## Overview

The Site Settings feature allows administrators to configure various aspects of the website through a user-friendly admin panel. This includes logo management, language display options, contact sales configuration, theme settings, and favicon management.

## Features

### 1. Logo Configuration
- **Upload Logo**: Upload custom logo images (JPEG, PNG, GIF, SVG, WebP)
- **Alt Text**: Set alternative text for accessibility
- **Dimensions**: Configure logo width and height
- **Preview**: Real-time preview of logo changes

### 2. Language Settings
- **Header Display**: Toggle language switcher visibility in navigation
- **Default Language**: Set the default site language (English/Arabic)
- **Enabled Languages**: Select which languages are available

### 3. Contact Sales Configuration
- **Visibility**: Show/hide contact sales button in navigation
- **Button Text**: Customize the button text
- **URL**: Set the contact sales page URL

### 4. Theme Management
- **Default Theme**: Choose between Light, Dark, or System theme
- **Auto Switch**: Automatically switch to dark mode during specified hours
- **Time Configuration**: Set dark mode start and end times

### 5. Favicon Management
- **Favicon Upload**: Upload custom favicon files (.ico, .png, .jpg)
- **Apple Touch Icon**: Set Apple touch icon URL
- **Web Manifest**: Configure web manifest URL

## Technical Implementation

### Database Schema
```sql
model SiteSettings {
  id        String   @id @default(cuid())
  data      String   // JSON string of all settings
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### API Endpoints

#### GET /api/admin/settings
Returns current site settings or default values if none exist.

#### POST /api/admin/settings
Updates site settings with new configuration.

#### POST /api/admin/upload
Handles file uploads for logos and favicons.

### Components

#### Core Components
- `SiteSettingsProvider`: Context provider for settings
- `useSiteSettings`: Hook for accessing settings
- `ThemeManager`: Applies theme settings automatically
- `FaviconManager`: Updates favicon dynamically

#### UI Components
- `Logo`: Displays logo based on settings
- `ConditionalLanguageSwitch`: Shows/hides language switcher
- `ConditionalContactSales`: Shows/hides contact sales button

### Settings Structure
```typescript
interface SiteSettings {
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  languages: {
    showInHeader: boolean;
    defaultLanguage: string;
    enabledLanguages: string[];
  };
  contactSales: {
    show: boolean;
    text: string;
    url: string;
  };
  theme: {
    defaultTheme: 'light' | 'dark' | 'system';
    autoSwitchByTime: boolean;
    darkModeStart: string;
    darkModeEnd: string;
  };
  favicon: {
    url: string;
    appleTouchIcon: string;
    manifest: string;
  };
}
```

## Usage

### Admin Panel
1. Navigate to `/admin/settings`
2. Configure settings using the tabbed interface
3. Upload files using the upload buttons
4. Save changes using the "Save Settings" button

### Frontend Integration
Settings are automatically applied throughout the site:
- Logo appears in navigation and mobile menu
- Language switcher visibility is controlled
- Contact sales button shows/hides based on settings
- Theme switches automatically based on configuration
- Favicon updates dynamically

### File Uploads
- Maximum file size: 5MB
- Supported formats: JPEG, PNG, GIF, SVG, WebP, ICO
- Files are stored in `/public/uploads/settings/`
- Unique filenames prevent conflicts

## Security Considerations

- File upload validation prevents malicious files
- Settings are stored as JSON in database
- Admin authentication required for changes
- File size limits prevent abuse

## Performance Features

- Settings are cached in React context
- Automatic theme switching uses efficient intervals
- Favicon updates don't require page reload
- Logo components include loading states

## Testing

Use the provided test scripts:
```bash
# Test settings functionality
node test-settings.js

# Clean test data
node clean-test-settings.js
```

## Future Enhancements

- Multiple logo variants (light/dark themes)
- Advanced theme scheduling
- Logo animation settings
- Multi-language favicon support
- Bulk settings import/export