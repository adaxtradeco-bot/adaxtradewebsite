const fs = require('fs');
const path = require('path');

const sectionsDir = path.join(__dirname, 'src', 'components', 'builder-sections');

const fixes = [
  {
    file: 'EcosystemNWMSection.tsx',
    from: 'bg-gradient-to-br from-cyan-500/5 via-slate-900/90 to-violet-500/5 dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-violet-500/5',
    to: 'bg-gradient-to-br from-cyan-500/10 via-white to-violet-500/10 dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-violet-500/5'
  },
  {
    file: 'VideoPreviewNWMSection.tsx',
    from: 'bg-gradient-to-br from-cyan-500/5 via-slate-900/90 to-transparent dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-transparent',
    to: 'bg-gradient-to-br from-cyan-500/10 via-white to-transparent dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-transparent'
  },
  {
    file: 'FeaturesGridNWMSection.tsx',
    from: 'bg-slate-900/60 dark:bg-slate-900/60',
    to: 'bg-white/90 dark:bg-slate-900/60'
  },
  {
    file: 'FinalCTANWMSection.tsx',
    from: 'bg-gradient-to-br from-cyan-500/5 via-slate-900/90 to-violet-500/5 dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-violet-500/5',
    to: 'bg-gradient-to-br from-cyan-500/10 via-white to-violet-500/10 dark:from-cyan-500/5 dark:via-slate-900/90 dark:to-violet-500/5'
  },
  {
    file: 'PartnersNWMSection.tsx',
    from: 'bg-gradient-to-br from-violet-500/10 to-slate-900/90 dark:from-violet-500/10 dark:to-slate-900/90',
    to: 'bg-gradient-to-br from-violet-500/20 to-white dark:from-violet-500/10 dark:to-slate-900/90'
  }
];

fixes.forEach(({ file, from, to }) => {
  const filePath = path.join(sectionsDir, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/\//g, '\\/'), 'g'), to);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed background in: ${file}`);
    } else {
      console.log(`⚠️  Pattern not found in: ${file}`);
    }
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('\n✨ All backgrounds fixed!');
