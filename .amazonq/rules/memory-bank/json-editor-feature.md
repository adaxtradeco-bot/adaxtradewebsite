# JSON Editor Toggle Feature

## Overview
قابلیت سوئیچ بین Visual Editor و JSON Editor برای سکشنهای با UI اختصاصی در Page Builder.

## Features
- 🎨 **Visual Mode**: استفاده از کنترلهای بصری برای ویرایش
- 📝 **JSON Mode**: ویرایش مستقیم JSON برای کاربران پیشرفته
- 📋 **Copy/Paste**: امکان کپی و پیست ساختار JSON
- 🔄 **Real-time Sync**: تغییرات در هر دو حالت همگام میشوند

## Supported Sections
سکشنهایی که این قابلیت را دارند:

### Core Sections
- `product-hero`
- `process-steps`
- `why-automate-with-us`

### Reports Sections
- `reports-hero`
- `reports-what-you-can-build`
- `reports-chart-builder`
- `reports-table`
- `reports-kanban`
- `reports-ai-insights`
- `reports-data-sources`
- `reports-scale`
- `reports-integration`
- `reports-roles`

### Platform Sections
- `partner-showcase-hero`
- `platform-snapshot`
- `platform-modules-bento`
- `platform-capabilities`

### Other Sections
- `how-it-works-steps`
- `automation-engine`
- `industries-grid`
- `sla-integration-split`
- `partner-cta-strip`
- `interactive-feature-wall`
- `wall-of-features`

## How to Use

### Visual Mode (Default)
1. انتخاب سکشن در Page Builder
2. استفاده از کنترلهای بصری در Property Panel
3. تغییرات به صورت خودکار اعمال میشوند

### JSON Mode
1. کلیک روی دکمه "📝 JSON" در بالای Property Panel
2. ویرایش مستقیم JSON
3. کلیک روی "💾 Save Changes" برای اعمال تغییرات

### Copy/Paste Workflow
```json
// 1. Switch to JSON mode
// 2. Copy entire JSON structure (Ctrl+A, Ctrl+C)
// 3. Paste in another section or save externally
// 4. Modify as needed
// 5. Paste back and save
```

## UI Components

### Toggle Button
```tsx
<div className="flex gap-1">
  <button>🎨 Visual</button>  // Visual editor mode
  <button>📝 JSON</button>     // JSON editor mode
</div>
```

### Visual Mode Features
- Collapsible sections
- Field-specific editors
- Image upload integration
- Color pickers
- Array management (add/remove/reorder)

### JSON Mode Features
- Syntax highlighting (via textarea)
- Real-time validation
- Image manager helper
- Error messages
- Auto-save on valid JSON

## Implementation Details

### File Modified
- `src/components/admin/PageBuilder/PropertyPanel.tsx`

### Key Changes
1. Added `editMode` state: `'visual' | 'json'`
2. Added `hasCustomEditor` check for supported sections
3. Added toggle UI component
4. Conditional rendering based on mode

### Code Structure
```tsx
const [editMode, setEditMode] = useState<'visual' | 'json'>('visual');

const hasCustomEditor = [/* list of section types */].includes(section.type);

// Toggle UI
{hasCustomEditor && (
  <div>
    <button onClick={() => setEditMode('visual')}>Visual</button>
    <button onClick={() => setEditMode('json')}>JSON</button>
  </div>
)}

// Conditional rendering
{hasCustomEditor && editMode === 'json' ? (
  <JSONEditor section={section} onUpdate={onUpdate} />
) : (
  renderSectionSpecificFields()
)}
```

## Benefits

### For Content Editors
- ✅ Easy-to-use visual interface
- ✅ No technical knowledge required
- ✅ Guided editing experience

### For Developers
- ✅ Direct JSON access
- ✅ Bulk editing capabilities
- ✅ Copy/paste between sections
- ✅ Advanced customization options

### For Both
- ✅ Flexibility to choose preferred method
- ✅ No data loss when switching modes
- ✅ Real-time validation
- ✅ Consistent data structure

## Future Enhancements
- [ ] JSON syntax highlighting library
- [ ] JSON diff viewer when switching modes
- [ ] Export/import JSON templates
- [ ] JSON schema validation with detailed errors
- [ ] Undo/redo functionality in JSON mode
- [ ] JSON beautify/minify options

## Notes
- تغییرات در JSON mode فقط با کلیک روی Save اعمال میشوند
- تغییرات در Visual mode به صورت خودکار اعمال میشوند
- هنگام سوئیچ بین دو حالت، داده‌ها حفظ میشوند
- JSON نامعتبر قابل ذخیره نیست و پیغام خطا نمایش داده میشود
