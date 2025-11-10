# Page Builder Components Implementation Roadmap

## 🗺️ Component Architecture Overview

### Core Builder Components Status
- ✅ **PageBuilder.tsx** - Main orchestrator component
- ✅ **Canvas.tsx** - Drag-and-drop canvas with sortable sections
- 🚧 **SectionLibrary.tsx** - Draggable section templates library
- 🚧 **PropertyPanel.tsx** - Section configuration panel
- 🚧 **Toolbar.tsx** - Save, preview, publish actions
- 🚧 **PreviewModes.tsx** - Device preview switcher

## 📋 Remaining Components Implementation Plan

### 1. SectionLibrary.tsx
**Purpose**: Left sidebar with draggable section templates
**Features**:
- Categorized section templates (Headers, Content, Actions)
- Search and filter functionality
- Drag-to-canvas functionality
- Template preview thumbnails

**Key Props**:
```typescript
interface SectionLibraryProps {
  onAddSection: (templateType: string) => void;
}
```

**Implementation Notes**:
- Use SECTION_TEMPLATES from registry
- Group by SECTION_CATEGORIES
- Simple click-to-add (not drag for now)
- Collapsible categories

### 2. PropertyPanel.tsx
**Purpose**: Right sidebar for editing selected section properties
**Features**:
- Dynamic form based on section type
- Real-time preview updates
- Style controls (colors, spacing, alignment)
- Content editing (text, buttons, items)

**Key Props**:
```typescript
interface PropertyPanelProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
  onClose: () => void;
}
```

**Implementation Notes**:
- Use react-hook-form for form handling
- Different form layouts per section type
- Color picker for style properties
- Array management for items/buttons

### 3. Toolbar.tsx
**Purpose**: Top toolbar with main actions
**Features**:
- Save/Auto-save functionality
- Preview toggle
- Undo/Redo (future)
- Publish status

**Key Props**:
```typescript
interface ToolbarProps {
  onSave: () => Promise<void>;
  isSaving: boolean;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}
```

**Implementation Notes**:
- Simple button layout
- Loading states for save
- Preview mode toggle
- Device mode selector

### 4. PreviewModes.tsx
**Purpose**: Device preview mode selector
**Features**:
- Desktop/Tablet/Mobile buttons
- Visual device indicators
- Responsive canvas sizing

**Key Props**:
```typescript
interface PreviewModesProps {
  mode: 'desktop' | 'tablet' | 'mobile';
  onModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}
```

**Implementation Notes**:
- Simple button group
- Icons for each device type
- Active state styling

## 🔧 Implementation Strategy

### Phase 1: Basic Functionality
1. **SectionLibrary** - Simple click-to-add sections
2. **Toolbar** - Basic save and preview toggle
3. **PreviewModes** - Device mode switching
4. **PropertyPanel** - Basic text editing

### Phase 2: Enhanced Features
1. **PropertyPanel** - Style controls and advanced editing
2. **SectionLibrary** - Search and filtering
3. **Toolbar** - Auto-save and status indicators

### Phase 3: Advanced Features
1. **Drag-and-drop** from library to canvas
2. **Undo/Redo** functionality
3. **Template management**
4. **Bulk operations**

## 📁 File Structure
```
src/components/admin/PageBuilder/
├── PageBuilder.tsx           ✅ Main orchestrator
├── Canvas.tsx                ✅ Drag-and-drop canvas
├── SectionLibrary.tsx        🚧 Section templates library
├── PropertyPanel.tsx         🚧 Configuration panel
├── Toolbar.tsx               🚧 Top action bar
├── PreviewModes.tsx          🚧 Device mode selector
└── components/
    ├── ColorPicker.tsx       🔮 Future: Color selection
    ├── IconPicker.tsx        🔮 Future: Icon selection
    └── MediaPicker.tsx       🔮 Future: Image selection
```

## 🎯 Integration Points

### With Existing System
- **Pages API**: Save builder data to database
- **Translation System**: Support for multilingual content
- **Media Management**: Image selection and upload
- **Theme System**: Consistent styling

### Data Flow
1. **PageBuilder** manages overall state
2. **Canvas** renders sections and handles selection
3. **PropertyPanel** updates section configuration
4. **SectionLibrary** adds new sections
5. **Toolbar** saves changes to database

## 🔄 State Management
```typescript
// Main PageBuilder state
const [sections, setSections] = useState<SectionConfig[]>([]);
const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
const [isPreviewMode, setIsPreviewMode] = useState(false);
```

## 🚀 Next Steps After Components
1. **Page Integration**: Connect to existing pages
2. **Migration Tool**: Convert current pages to builder format
3. **Template System**: Save and reuse page templates
4. **Performance**: Optimize for large pages
5. **Collaboration**: Multi-user editing support