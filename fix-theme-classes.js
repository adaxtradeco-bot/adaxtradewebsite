const fs = require('fs');
const path = require('path');

const sectionsDir = path.join(__dirname, 'src', 'components', 'builder-sections');

const nwmSections = [
  'StakeholdersNWMSection.tsx',
  'WhyNWMSection.tsx',
  'EcosystemNWMSection.tsx',
  'InfographicNWMSection.tsx',
  'VideoPreviewNWMSection.tsx',
  'PartnersNWMSection.tsx',
  'FinalCTANWMSection.tsx',
  'FeaturesGridNWMSection.tsx'
];

const replacements = [
  // Background colors
  { from: /bg-slate-950 dark:bg-slate-950 light:bg-white/g, to: 'bg-white dark:bg-slate-950' },
  { from: /bg-slate-950 dark:bg-slate-950 light:bg-slate-50/g, to: 'bg-slate-50 dark:bg-slate-950' },
  
  // Text colors - fix order
  { from: /text-slate-400 dark:text-slate-400 light:text-slate-600/g, to: 'text-slate-600 dark:text-slate-400' },
  { from: /text-white dark:text-white light:text-slate-900/g, to: 'text-slate-900 dark:text-white' },
  { from: /text-slate-300 dark:text-slate-300 light:text-slate-700/g, to: 'text-slate-700 dark:text-slate-300' },
  
  // Border colors
  { from: /border-slate-700\/50 dark:border-slate-700\/50 light:border-slate-200/g, to: 'border-slate-200 dark:border-slate-700/50' },
  { from: /border-slate-700 dark:border-slate-700 light:border-slate-300/g, to: 'border-slate-300 dark:border-slate-700' },
  
  // Remove all remaining light: classes
  { from: / light:[a-z-:\/0-9]+/g, to: '' }
];

nwmSections.forEach(filename => {
  const filePath = path.join(sectionsDir, filename);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filename}`);
  }
});

console.log('\n✨ All NWM sections fixed!');
