import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

function toComponentName(typeSlug: string): string {
  return typeSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') + 'Section';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { typeSlug, name, category, description, icon, defaultData, componentCode } = body;

    if (!typeSlug || !name || !category || !componentCode) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: typeSlug, name, category, componentCode' },
        { status: 400 }
      );
    }

    const componentName = body.componentName || toComponentName(typeSlug);
    const createdFiles: string[] = [];

    // ── 1. Write component file ────────────────────────────────────────────
    const componentPath = path.join(
      PROJECT_ROOT, 'src', 'components', 'builder-sections', `${componentName}.tsx`
    );
    fs.writeFileSync(componentPath, componentCode, 'utf8');
    createdFiles.push(`src/components/builder-sections/${componentName}.tsx`);

    // ── 2. Write/update custom-sections template file ───────────────────
    const customTemplatesPath = path.join(
      PROJECT_ROOT, 'src', 'lib', 'page-builder', 'section-templates', 'custom-sections.ts'
    );

    const safeDefaultData = {
      id: '',
      type: typeSlug,
      order: 0,
      data: defaultData || {},
    };

    const templateEntry = `
  {
    id: '${typeSlug}-template',
    name: '${name.replace(/'/g, "\\'")}',
    type: '${typeSlug}',
    category: '${category}',
    description: '${(description || '').replace(/'/g, "\\'")}',
    icon: '${icon || '🔧'}',
    defaultData: ${JSON.stringify(safeDefaultData, null, 4)},
    configSchema: {},
  },`;

    if (fs.existsSync(customTemplatesPath)) {
      let content = fs.readFileSync(customTemplatesPath, 'utf8');
      // Append before closing ];
      content = content.replace(/\n\];\s*$/, `${templateEntry}\n];\n`);
      fs.writeFileSync(customTemplatesPath, content, 'utf8');
    } else {
      const newContent = `import { type SectionTemplate } from '../section-registry.types';

export const CUSTOM_SECTION_TEMPLATES: SectionTemplate[] = [${templateEntry}
];
`;
      fs.writeFileSync(customTemplatesPath, newContent, 'utf8');
    }
    createdFiles.push('src/lib/page-builder/section-templates/custom-sections.ts');

    // ── 3. Update section-registry.ts ─────────────────────────────────────
    const registryPath = path.join(PROJECT_ROOT, 'src', 'lib', 'page-builder', 'section-registry.ts');
    let registryContent = fs.readFileSync(registryPath, 'utf8');

    if (!registryContent.includes('CUSTOM_SECTION_TEMPLATES')) {
      registryContent = registryContent.replace(
        "export { SECTION_CATEGORIES };",
        "import { CUSTOM_SECTION_TEMPLATES } from './section-templates/custom-sections';\n\nexport { SECTION_CATEGORIES };"
      );
      registryContent = registryContent.replace(
        '  ...REPORTS_SHOWCASE_ADVANCED_TEMPLATES,\n];',
        '  ...REPORTS_SHOWCASE_ADVANCED_TEMPLATES,\n  ...CUSTOM_SECTION_TEMPLATES,\n];'
      );
      fs.writeFileSync(registryPath, registryContent, 'utf8');
      createdFiles.push('src/lib/page-builder/section-registry.ts');
    }

    // ── 4. Update section-schemas.ts ──────────────────────────────────────
    const schemasPath = path.join(PROJECT_ROOT, 'src', 'lib', 'page-builder', 'section-schemas.ts');
    let schemasContent = fs.readFileSync(schemasPath, 'utf8');

    if (!schemasContent.includes(`'${typeSlug}'`)) {
      schemasContent = schemasContent.replace(
        "    'metrics-testimonials',\n  ])",
        `    'metrics-testimonials',\n    '${typeSlug}',\n  ])`
      );
      fs.writeFileSync(schemasPath, schemasContent, 'utf8');
      createdFiles.push('src/lib/page-builder/section-schemas.ts');
    }

    // ── 5. Update section-renderer.tsx ────────────────────────────────────
    const rendererPath = path.join(PROJECT_ROOT, 'src', 'lib', 'page-builder', 'section-renderer.tsx');
    let rendererContent = fs.readFileSync(rendererPath, 'utf8');

    if (!rendererContent.includes(`${componentName}`)) {
      rendererContent = rendererContent.replace(
        'interface SectionRendererProps {',
        `import ${componentName} from '@/components/builder-sections/${componentName}';\n\ninterface SectionRendererProps {`
      );
      rendererContent = rendererContent.replace(
        '        default:\n          console.error',
        `        case '${typeSlug}':\n          return <${componentName} section={section} isBuilder={isBuilder} />;\n        default:\n          console.error`
      );
      fs.writeFileSync(rendererPath, rendererContent, 'utf8');
      createdFiles.push('src/lib/page-builder/section-renderer.tsx');
    }

    return NextResponse.json({
      success: true,
      message: `Section "${name}" created successfully! Restart the dev server to see changes.`,
      files: createdFiles,
    });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
