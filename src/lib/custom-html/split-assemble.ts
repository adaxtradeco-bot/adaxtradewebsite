/**
 * Custom HTML section — builds the sections of a page split (spec §13).
 *
 * Every part runs through the single-section pipeline (detect -> tokenize -> compile -> assemble +
 * schema validation), so limits and field detection are the same as for a one-section import.
 * All or nothing: the first part that fails aborts the whole build.
 */
import { analyzeExtract, assembleCustomHtml } from './assemble';
import type { SplitPart } from './split-page';
import type { CompileRequest, CompileResult, CustomHtmlData } from './types';

export interface AssembleSplitInput {
  parts: SplitPart[];
  dir?: 'auto' | 'ltr' | 'rtl';
  compile: (req: CompileRequest) => Promise<CompileResult>;
  /** called before each part is built */
  onProgress?: (done: number, total: number) => void;
}

export interface AssembleSplitResult {
  /** in page order */
  sections: CustomHtmlData[];
  /** compile warnings, prefixed with the section name */
  warnings: string[];
}

export async function assembleSplit(input: AssembleSplitInput): Promise<AssembleSplitResult> {
  const { parts, dir, compile, onProgress } = input;
  const sections: CustomHtmlData[] = [];
  const warnings: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const label = `Section ${i + 1} "${part.name.trim()}"`;
    onProgress?.(i, parts.length);
    try {
      if (!part.name.trim()) throw new Error('Give the section a name.');
      const analysis = analyzeExtract(part.extract);
      const result = await assembleCustomHtml({
        name: part.name,
        analysis,
        fields: analysis.detect.fields,
        dir,
        compile,
      });
      sections.push(result.data);
      warnings.push(...result.compileWarnings.map((w) => `${label}: ${w}`));
    } catch (err) {
      throw new Error(
        `${label} could not be imported, so nothing was inserted. ${err instanceof Error ? err.message : 'Import failed.'}`
      );
    }
  }
  return { sections, warnings };
}
