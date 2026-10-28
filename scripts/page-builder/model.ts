/**
 * Shared schema model for the page-builder reference tooling.
 * The generator serialises TypeScript types into these nodes (model.json);
 * the validator walks them to check a page JSON.
 */

export type Node =
  | { t: 'string' | 'number' | 'boolean' | 'any' | 'infographic' }
  | { t: 'enum'; v: (string | number)[]; soft?: boolean }
  | { t: 'array'; i: Node }
  | { t: 'record'; v: Node }
  | { t: 'union'; a: Node[] }
  | { t: 'object'; p: Record<string, Field>; open?: boolean };

export interface Field {
  s: Node;
  /** true = optional */
  o: boolean;
  /** JSDoc / note */
  d?: string;
  /** where the field came from: the component's TS type, the registry default JSON, or a source scan */
  src?: 'type' | 'default' | 'scan';
  /** accepted but never read by the renderer */
  ignored?: boolean;
}

export interface SectionModel {
  type: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  /** appears in the editor's Add Section menu */
  inRegistry: boolean;
  /** another type string that the renderer maps to the same component (e.g. `HeroSection` → `hero`) */
  aliasOf?: string;
  /** group heading in the visual catalog (HEROES, FEATURES, …) */
  group: string | null;
  /** SectionRenderer has a case for it (otherwise the page shows a red "Unknown section type" box) */
  renderable: boolean;
  /** how the data schema was obtained */
  schemaSource: 'component-types' | 'default-json-only' | 'none';
  component: string | null;
  componentFile: string | null;
  schema: Node | null;
  /** the component's own `style` prop (keys beyond the base section style keys), when typed */
  styleSchema: Node | null;
  /** where the registry default JSON disagrees with the component (stale defaults — do not copy blindly) */
  defaultIssues: string[];
  /** exact default section (SectionConfig) from the registry; null for legacy types */
  defaultSection: any | null;
  /** extra default templates sharing this type (e.g. second `hero` variant) */
  alternateDefaults: any[];
  /** dotted paths of fields that accept an infographic object */
  infographicFields: string[];
  designNotes: string | null;
}

export interface InfographicTypeModel {
  type: string;
  group: string;
  component: string;
  description: string;
  schema: Node;
  notes: string[];
  defaultData: any;
}

export interface ReferenceModel {
  generatedAt: string;
  declaredTypes: string[];
  sections: Record<string, SectionModel>;
  infographic: {
    types: Record<string, InfographicTypeModel>;
    envelope: Node;
    theme: Node;
    animation: Node;
    style: Node;
    mediaOverride: Node;
    presets: string[];
  };
  sectionEnvelope: {
    styleKeys: string[];
    alignment: string[];
  };
}

// ---- tiny DSL used by the hand-curated infographic spec ----
export const str: Node = { t: 'string' };
export const num: Node = { t: 'number' };
export const bool: Node = { t: 'boolean' };
export const any: Node = { t: 'any' };
export const en = (...v: (string | number)[]): Node => ({ t: 'enum', v, soft: true });
export const strictEn = (...v: (string | number)[]): Node => ({ t: 'enum', v });
export const arr = (i: Node): Node => ({ t: 'array', i });
export const union = (...a: Node[]): Node => ({ t: 'union', a });
export const obj = (
  p: Record<string, Node | { s: Node; ignored?: boolean; d?: string }>,
  required: string[] = []
): Node => {
  const fields: Record<string, Field> = {};
  for (const [k, v] of Object.entries(p)) {
    const wrapped = 's' in (v as any) && !('t' in (v as any));
    const s = wrapped ? (v as any).s : (v as Node);
    fields[k] = {
      s,
      o: !required.includes(k),
      ...(wrapped && (v as any).ignored ? { ignored: true } : {}),
      ...(wrapped && (v as any).d ? { d: (v as any).d } : {}),
    };
  }
  return { t: 'object', p: fields };
};
export const ignored = (s: Node, d?: string) => ({ s, ignored: true, d });
