const fs = require('fs');
const path = require('path');

// Read the all.css file
const cssPath = path.join(__dirname, '../src/FontAwesome.Pro.7.1.0/FontAwesome.Pro.7.1.0/css/all.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

// Extract all icon names using regex
const iconRegex = /\.fa-([a-z0-9-]+)\{--fa:"\\[^"]+"\}/g;
const icons = new Set();

let match;
while ((match = iconRegex.exec(cssContent)) !== null) {
  const iconName = match[1];
  // Skip utility classes
  if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(iconName) &&
      !iconName.match(/^(xs|sm|lg|xl|2xl|3xl|4xl|5xl|1x|2x|3x|4x|5x|6x|7x|8x|9x|10x)$/)) {
    icons.add(iconName);
  }
}

// Convert to array and sort
const iconArray = Array.from(icons).sort();

console.log(`Found ${iconArray.length} unique icons`);

// Create categorized structure (simplified - all in one category for now)
const categorized = {
  all: iconArray
};

// Write to JSON file
const outputPath = path.join(__dirname, '../public/data/fontawesome-icons.json');
fs.writeFileSync(outputPath, JSON.stringify(categorized, null, 2));

console.log(`✅ Extracted ${iconArray.length} icons to ${outputPath}`);
