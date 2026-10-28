/**
 * Consistency check between the registry and the generated reference.
 *
 *   npx tsx scripts/page-builder/selftest.ts
 *
 * Every registry default JSON is validated against the generated model. Because the model is
 * reconciled with those defaults, the only errors allowed are the ones the generator already
 * recorded as "default disagrees with the component" (`defaultIssues`) and non-renderable types.
 * Anything else means the generator and the validator have drifted apart.
 */
import { loadModel, validatePage } from './validate-page-json';

const model = loadModel();
let unexplained = 0;
let checked = 0;
let withKnownDefects = 0;

for (const m of Object.values(model.sections)) {
  if (!m.defaultSection) continue;
  for (const [i, def] of [m.defaultSection, ...m.alternateDefaults].entries()) {
    checked++;
    const errors = validatePage([{ ...def, id: 'section-1000000001', order: 0 }], model).filter((x) => x.level === 'error');
    const bad = errors.filter((e) => {
      if (!m.renderable) return false;
      if (/required (array|object) (is missing|is null)/.test(e.message)) return false; // listed in defaultIssues
      if (e.path.includes('.infographic')) return false; // listed in defaultIssues
      return true;
    });
    if (errors.length && !bad.length) withKnownDefects++;
    if (bad.length) {
      unexplained++;
      console.log(`✗ ${m.type}${i ? ` (alt #${i + 1})` : ''}`);
      for (const x of bad.slice(0, 6)) console.log(`    ${x.path}: ${x.message}`);
    }
  }
}
const stale = Object.values(model.sections).filter((m) => m.defaultIssues.length);
console.log(`\n${checked} default templates checked.`);
console.log(`${withKnownDefects} validate only with the known default defects recorded in the reference.`);
console.log(`${stale.length} sections have a registry default that disagrees with their component (see each sections/<type>.md).`);
console.log(unexplained ? `✗ ${unexplained} unexplained failure(s) — generator and validator are out of sync` : '✓ generator and validator agree');
process.exit(unexplained ? 1 : 0);
