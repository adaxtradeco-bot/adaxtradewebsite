require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeSections() {
  try {
    console.log('🔍 Analyzing all sections in database...');
    
    const pages = await prisma.page.findMany({
      where: { builderData: { not: null } }
    });
    
    const sectionTypes = new Set();
    const sectionAnalysis = {};
    
    for (const page of pages) {
      const builderData = JSON.parse(page.builderData);
      const sections = builderData.sections || builderData;
      
      if (!Array.isArray(sections)) continue;
      
      sections.forEach(section => {
        const type = section.type;
        sectionTypes.add(type);
        
        if (!sectionAnalysis[type]) {
          sectionAnalysis[type] = {
            count: 0,
            sampleData: null,
            mediaFields: new Set(),
            linkFields: new Set()
          };
        }
        
        sectionAnalysis[type].count++;
        
        if (!sectionAnalysis[type].sampleData) {
          sectionAnalysis[type].sampleData = section.data;
        }
        
        // Find potential media fields
        findMediaFields(section.data, '', sectionAnalysis[type].mediaFields);
        findLinkFields(section.data, '', sectionAnalysis[type].linkFields);
      });
    }
    
    console.log(`\n📊 Found ${sectionTypes.size} unique section types:\n`);
    
    Object.entries(sectionAnalysis).forEach(([type, analysis]) => {
      console.log(`🎯 ${type} (${analysis.count} instances)`);
      
      if (analysis.mediaFields.size > 0) {
        console.log(`   📷 Media fields: ${Array.from(analysis.mediaFields).join(', ')}`);
      }
      
      if (analysis.linkFields.size > 0) {
        console.log(`   🔗 Link fields: ${Array.from(analysis.linkFields).join(', ')}`);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function findMediaFields(obj, prefix, mediaFields) {
  if (!obj || typeof obj !== 'object') return;
  
  Object.keys(obj).forEach(key => {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (typeof value === 'string') {
      const isMediaField = key.toLowerCase().includes('image') ||
                          key.toLowerCase().includes('img') ||
                          key.toLowerCase().includes('media') ||
                          key.toLowerCase().includes('icon') ||
                          key.toLowerCase().includes('logo') ||
                          key.toLowerCase().includes('background') ||
                          key.toLowerCase().includes('preview') ||
                          key.toLowerCase().includes('poster') ||
                          key === 'mediaSrc' ||
                          key === 'mediaPoster';
      
      const isImageUrl = value.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)/i) ||
                        value.startsWith('/uploads/') ||
                        value.startsWith('/api/media/') ||
                        value.startsWith('http');
      
      if (isMediaField || (key.toLowerCase().includes('src') && isImageUrl)) {
        mediaFields.add(path);
      }
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        findMediaFields(value[0], `${path}[]`, mediaFields);
      }
    } else if (typeof value === 'object') {
      findMediaFields(value, path, mediaFields);
    }
  });
}

function findLinkFields(obj, prefix, linkFields) {
  if (!obj || typeof obj !== 'object') return;
  
  Object.keys(obj).forEach(key => {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (typeof value === 'string') {
      const isLinkField = key.toLowerCase().includes('link') ||
                         key.toLowerCase().includes('href') ||
                         key.toLowerCase().includes('url') ||
                         key === 'link';
      
      if (isLinkField) {
        linkFields.add(path);
      }
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        findLinkFields(value[0], `${path}[]`, linkFields);
      }
    } else if (typeof value === 'object') {
      findLinkFields(value, path, linkFields);
    }
  });
}

analyzeSections();