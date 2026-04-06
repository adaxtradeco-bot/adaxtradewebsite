# Section Registry Structure (New)

## Goal

Keep section registration maintainable by splitting templates based on **visual similarity** while preserving runtime behavior and template order.

## Key Rules

1. `src/lib/page-builder/section-registry.ts` is an **aggregator only**.
2. Template definitions live in `src/lib/page-builder/section-templates/*.ts`.
3. Group by UI/display pattern (hero, cards, process, reports, etc.), not by business domain.
4. Keep file sizes reasonable:

- Target: 200-450 lines
- Hard cap: 550 lines (split further if exceeded)

5. Preserve output order of `SECTION_TEMPLATES` unless a deliberate UX reorder is requested.

## Core Files

- `src/lib/page-builder/section-registry.types.ts`
  - `SectionTemplate` interface
  - `SECTION_CATEGORIES` constants

- `src/lib/page-builder/section-registry.ts`
  - Imports grouped arrays
  - Exports `SECTION_TEMPLATES`
  - Exports helper functions:
    - `getSectionTemplate`
    - `getSectionsByCategory`
    - `getAllSectionTypes`

## Template Group Files

Located in `src/lib/page-builder/section-templates/`:

1. `form-builder-special.ts`
2. `hero-layouts-core.ts`
3. `cards-interactive-core.ts`
4. `process-and-nwm.ts`
5. `media-proof-core.ts`
6. `cards-and-partners.ts`
7. `hero-tabs-feature-walls.ts`
8. `process-and-why.ts`
9. `platform-showcase.ts`
10. `platform-capabilities.ts`
11. `reports-showcase-core.ts`
12. `reports-showcase-advanced.ts`

## Related External Template Sources

- `src/lib/page-builder/section-registry-additions.ts`
  - `WORKFLOW_SECTION`, `INTEGRATIONS_SECTION`, `PROCESS_SECTION`
- `src/lib/page-builder/section-registry-nwm.ts`
  - `NWM_SECTION_TEMPLATES`

`process-and-nwm.ts` composes those sources into the main registry sequence.

## How To Add a New Section

1. Decide the visual family (hero/cards/process/reports/etc.).
2. Add the template object in the matching `section-templates/*.ts` file.
3. If the file goes above 550 lines, split it into two visual subgroups.
4. Ensure `type`, `id`, `defaultData.type`, and category are correct.
5. If introducing a new file, import and spread it in `section-registry.ts`.
6. Keep ordering deterministic.

## Safety Checklist

1. No circular imports (`section-registry-nwm.ts` should import types from `section-registry.types.ts`).
2. `SECTION_TEMPLATES` remains a flat `SectionTemplate[]`.
3. Existing template IDs and types remain unchanged unless intentionally migrated.
4. Helper functions in `section-registry.ts` stay behavior-compatible.

## Why This Works

- Big monolithic registry is removed.
- Visual-similar templates are grouped for easier editing.
- Aggregator keeps a single source for consumers.
- Behavior remains stable because template sequence and data are preserved.
