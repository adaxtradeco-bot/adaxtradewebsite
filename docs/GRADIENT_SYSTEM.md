# Gradient Control System

## Overview
The Hero component now supports independent gradient controls for both background and title text, allowing full customization of visual appearance.

## Features
- ✅ Separate gradient configuration for background and title
- ✅ Light/dark theme support for each gradient
- ✅ Multiple gradient directions (8 options)
- ✅ Full Tailwind CSS color palette support
- ✅ Type-safe with TypeScript

## Gradient Configuration

### Interface Structure
```typescript
interface GradientConfig {
  from: string;        // Starting color (e.g., 'from-blue-500')
  to: string;          // Ending color (e.g., 'to-purple-600')
  direction?: string;  // Gradient direction (default: 'to-br')
}
```

### Available Directions
- `to-r` - Left to right
- `to-br` - Top-left to bottom-right (diagonal)
- `to-b` - Top to bottom
- `to-bl` - Top-right to bottom-left (diagonal)
- `to-l` - Right to left
- `to-tl` - Bottom-right to top-left (diagonal)
- `to-t` - Bottom to top
- `to-tr` - Bottom-left to top-right (diagonal)

## Usage Examples

### Default Configuration
```tsx
<Hero />
```
Uses primary-50 to secondary-50 for background, primary-600 to secondary-600 for title.

### Custom Background Only
```tsx
<Hero
  backgroundGradient={{
    light: { from: 'from-blue-100', to: 'to-purple-100', direction: 'to-br' },
    dark: { from: 'from-blue-900', to: 'to-purple-900', direction: 'to-br' }
  }}
/>
```

### Custom Title Only
```tsx
<Hero
  titleGradient={{
    light: { from: 'from-orange-500', to: 'to-red-600', direction: 'to-r' },
    dark: { from: 'from-orange-400', to: 'to-red-400', direction: 'to-r' }
  }}
/>
```

### Full Customization
```tsx
<Hero
  backgroundGradient={{
    light: { from: 'from-emerald-50', to: 'to-teal-50', direction: 'to-br' },
    dark: { from: 'from-emerald-950', to: 'to-teal-950', direction: 'to-br' }
  }}
  titleGradient={{
    light: { from: 'from-emerald-600', to: 'to-teal-600', direction: 'to-r' },
    dark: { from: 'from-emerald-400', to: 'to-teal-400', direction: 'to-r' }
  }}
/>
```

## Color Recommendations

### Background Gradients
Use lighter shades (50-100) for light mode and darker shades (800-950) for dark mode:
- Light mode: `from-color-50 to-color-100`
- Dark mode: `from-color-900 to-color-950`

### Title Gradients
Use medium to strong shades for better contrast:
- Light mode: `from-color-500 to-color-700`
- Dark mode: `from-color-400 to-color-500`

## Best Practices

1. **Contrast**: Ensure sufficient contrast between background and text
2. **Consistency**: Use related colors for harmonious gradients
3. **Accessibility**: Test with WCAG AA standards
4. **Performance**: Gradients are CSS-based, no performance impact
5. **Theme Support**: Always provide both light and dark variants

## Color Palette Reference

Available Tailwind colors:
- Primary: blue shades
- Secondary: slate/gray shades
- Success: green shades
- Warning: amber/yellow shades
- Error: red shades
- Neutral: gray shades

Plus all standard Tailwind colors: emerald, teal, cyan, indigo, purple, pink, rose, orange, etc.

## Technical Details

- Uses Tailwind's `bg-gradient-{direction}` utilities
- Title gradient uses `bg-clip-text` for text gradient effect
- Fully responsive and theme-aware
- No JavaScript required for gradient rendering
