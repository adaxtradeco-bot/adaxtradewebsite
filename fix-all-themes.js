const fs = require('fs');
const path = require('path');

const sectionsDir = path.join(__dirname, 'src', 'components', 'builder-sections');

const files = [
  'WhyNWMSection.tsx',
  'StakeholdersNWMSection.tsx',
  'EcosystemNWMSection.tsx',
  'VideoPreviewNWMSection.tsx',
  'PartnersNWMSection.tsx',
  'FinalCTANWMSection.tsx',
  'FeaturesGridNWMSection.tsx',
  'InfographicNWMSection.tsx'
];

files.forEach(filename => {
  const filePath = path.join(sectionsDir, filename);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove duplicate classes (keep only first occurrence)
    content = content.replace(/(\w+-[\w-/]+)\s+dark:\1\s+\1/g, '$1 dark:$1');
    content = content.replace(/(\w+-[\w-/]+)\s+\1\s+dark:\1/g, '$1 dark:$1');
    
    // Fix specific patterns
    content = content.replace(/text-slate-400 text-slate-600 dark:text-slate-400/g, 'text-slate-600 dark:text-slate-400');
    content = content.replace(/text-white text-slate-900 dark:text-white/g, 'text-slate-900 dark:text-white');
    content = content.replace(/text-slate-300 text-slate-700 dark:text-slate-300/g, 'text-slate-700 dark:text-slate-300');
    
    content = content.replace(/border-slate-700\/50 dark:border-slate-700\/50 border-slate-200/g, 'border-slate-200 dark:border-slate-700/50');
    content = content.replace(/border-slate-700 dark:border-slate-700 border-slate-300/g, 'border-slate-300 dark:border-slate-700');
    
    content = content.replace(/bg-slate-900\/60 dark:bg-slate-900\/60 bg-white\/90/g, 'bg-white/90 dark:bg-slate-900/60');
    content = content.replace(/bg-slate-800\/80 dark:bg-slate-800\/80 bg-slate-50/g, 'bg-slate-50 dark:bg-slate-800/80');
    
    content = content.replace(/from-cyan-500\/10 to-violet-500\/10 dark:from-cyan-500\/10 dark:to-violet-500\/10 from-cyan-500\/20 to-violet-500\/20/g, 'from-cyan-500/20 to-violet-500/20 dark:from-cyan-500/10 dark:to-violet-500/10');
    
    // Fix background gradients in WhyNWMSection
    content = content.replace(
      /bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/g,
      'bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'
    );
    
    // Fix card backgrounds in WhyNWMSection
    content = content.replace(
      /bg-gradient-to-br from-violet-500\/10 to-slate-900\/90 dark:from-violet-500\/10 dark:to-slate-900\/90/g,
      'bg-gradient-to-br from-violet-500/20 to-white dark:from-violet-500/10 dark:to-slate-900/90'
    );
    
    // Fix hover text colors
    content = content.replace(/group-hover:text-slate-300 dark:group-hover:text-slate-300/g, 'group-hover:text-slate-700 dark:group-hover:text-slate-300');
    content = content.replace(/group-hover:text-cyan-400 dark:group-hover:text-cyan-400 group-hover:text-cyan-600/g, 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400');
    
    // Fix glow colors
    content = content.replace(/bg-cyan-500\/20 dark:bg-cyan-500\/20 bg-cyan-500\/30/g, 'bg-cyan-500/30 dark:bg-cyan-500/20');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filename}`);
  }
});

console.log('\n✨ All sections fixed!');
