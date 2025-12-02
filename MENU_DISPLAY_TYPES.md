# Menu Display Types

## 5 Display Types for Submenus

### 1. Mega Menu (mega-menu) - Default
Full-width dropdown with multiple columns
- Best for: Complex navigation with many items
- Features: Column layout, icons, descriptions
- Example: Product menu with Core Features + Enterprise columns

```json
{
  "displayType": "mega-menu",
  "dropdown": {
    "columns": [
      {
        "title": "Column Title",
        "icon": "⭐",
        "items": [...]
      }
    ]
  }
}
```

### 2. Simple Dropdown (dropdown)
Single column dropdown list
- Best for: Simple menus with few items
- Features: Compact, clean design
- Example: User account menu

```json
{
  "displayType": "dropdown",
  "dropdown": {
    "columns": [
      {
        "items": [
          { "title": "Item 1", "href": "/link1" },
          { "title": "Item 2", "href": "/link2" }
        ]
      }
    ]
  }
}
```

### 3. Grid Layout (grid)
Items displayed in a responsive grid
- Best for: Visual navigation with icons
- Features: Equal-sized cards, icon-focused
- Example: App launcher, feature showcase

```json
{
  "displayType": "grid",
  "dropdown": {
    "columns": [
      {
        "items": [
          { "title": "App 1", "icon": "📱", "href": "/app1" },
          { "title": "App 2", "icon": "💻", "href": "/app2" }
        ]
      }
    ]
  }
}
```

### 4. List View (list)
Vertical list with optional descriptions
- Best for: Text-heavy navigation
- Features: Full descriptions, no columns
- Example: Documentation menu, blog categories

```json
{
  "displayType": "list",
  "dropdown": {
    "columns": [
      {
        "items": [
          { 
            "title": "Getting Started", 
            "description": "Learn the basics",
            "href": "/docs/start" 
          }
        ]
      }
    ]
  }
}
```

### 5. Card Style (cards)
Large cards with images/icons and descriptions
- Best for: Feature highlights, product categories
- Features: Visual emphasis, large clickable areas
- Example: Industry solutions, product categories

```json
{
  "displayType": "cards",
  "dropdown": {
    "columns": [
      {
        "items": [
          { 
            "title": "Enterprise", 
            "description": "Solutions for large teams",
            "icon": "🏢",
            "badge": "Popular",
            "href": "/enterprise" 
          }
        ]
      }
    ]
  }
}
```

## Additional Properties

### Item Properties
- `title`: Display text (required)
- `href`: Link URL (required)
- `icon`: Emoji or icon (optional)
- `description`: Subtitle text (optional)
- `badge`: Label like "New", "Hot" (optional)
- `backgroundColor`: Tailwind classes (optional)

### Menu Properties
- `label`: Menu button text
- `icon`: Menu button icon
- `displayType`: One of 5 types above
- `backgroundColor`: Dropdown background color
- `href`: Direct link (optional, for clickable menu items)

## Usage in Menu Builder

1. Go to `/admin/menus`
2. Edit a menu
3. Select an item
4. Choose "Display Type" from dropdown
5. Add icons, badges, colors as needed
6. Save changes

Changes apply immediately after page refresh.
