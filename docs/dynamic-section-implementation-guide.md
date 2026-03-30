# Dynamic Section Implementation Guide

This checklist matches the pattern used for `ivaflow-partner-showcase` sections.

## 1) Create Section Component
- File: `src/components/builder-sections/<SectionName>Section.tsx`
- Props pattern:
  - `data?: any`
  - `style?: any`
  - `isBuilder?: boolean`
- Requirements:
  - Provide sane defaults inside component (`mergedData`, `mergedStyle`).
  - Support both themes (`dark:` classes and light equivalents).
  - Keep structure/content aligned with source HTML.
  - For media fields, render image/video from dynamic data (do not hardcode).

## 2) Add Default Schema
- File: `src/lib/page-builder/section-schemas.ts`
- Add union support/type mapping for new `type`.
- Ensure `data` defaults mirror source HTML values exactly.

## 3) Register in Section Registry
- File: `src/lib/page-builder/section-registry.ts`
- Add to `SECTION_TEMPLATES`:
  - `id`, `name`, `type`, `category`, `description`, `icon`
  - `defaultData` with:
    - `type`, `order`, `data`, `style`
  - `configSchema` (or empty object if JSON-driven)
- Confirm default text, stats, cards, buttons, and media paths are identical to source.

## 4) Register in Renderer
- File: `src/lib/page-builder/section-renderer.tsx`
- Add import for new section component.
- Add `case '<section-type>'` in switch:
  - `return <SectionComponent data={(section as any).data} style={(section as any).style} isBuilder={isBuilder} />;`

## 5) Create Property Panel
- File: `src/components/admin/PageBuilder/<SectionName>PropertyPanel.tsx`
- Use existing pattern (`ProcessStepsPropertyPanel`, `PlatformSnapshotPropertyPanel`).
- Must expose complete editable settings for all visible content.
- For media fields:
  - Use current uploader/browser flow (`MediaBrowser` / upload endpoint path already used in project).
  - Allow selecting existing image/video and uploading new media.

## 6) Register Property Panel
- File: `src/components/admin/PageBuilder/PropertyPanel.tsx`
- Add import once (no duplicates).
- Add one switch case for new section type.
- Route to `<NewSectionPropertyPanel section={section} onUpdate={onUpdate} />`.

## 7) Validate Per Section
- After each section:
  - `npm run build`
  - Open builder and verify:
    - Section appears in dynamic list.
    - Defaults match source HTML.
    - All fields editable.
    - Image/video uploader works.
    - Light/Dark rendering is correct.

## 8) Final Verification
- Run full build again.
- Check for duplicate imports/cases in `PropertyPanel.tsx` and renderer.
- Smoke test page with all sections in sequence.
