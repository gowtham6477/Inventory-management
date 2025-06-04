#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html'];


const PROJECT_ROOT = path.resolve(__dirname, '..');


function walkDirectory(dir) {
  const files = [];
  
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}


function removeJSComments(content) {
  
  
  content = content.replace(/(?<!:)\/\/(?![\/\*]).*$/gm, '');
  
  
  content = content.replace(/\/\*[\s\S]*?\*\
  
  
  content = content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
  
  return content;
}


function removeCSSComments(content) {
  
  return content.replace(/\/\*[\s\S]*?\*\
}


function removeHTMLComments(content) {
  
  return content.replace(/<!--[\s\S]*?-->/g, '');
}


function removeComments(content, filePath) {
  const ext = path.extname(filePath);
  
  switch (ext) {
    case '.js':
    case '.jsx':
    case '.ts':
    case '.tsx':
      return removeJSComments(content);
    case '.css':
      return removeCSSComments(content);
    case '.html':
      return removeHTMLComments(content);
    default:
      return content;
  }
}


function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleanedContent = removeComments(content, filePath);
    
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      console.log(`✓ Processed: ${path.relative(PROJECT_ROOT, filePath)}`);
      return true;
    } else {
      console.log(`- No changes: ${path.relative(PROJECT_ROOT, filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}


function main() {
  console.log('🧹 Starting comment removal process...\n');
  console.log(`📁 Project root: ${PROJECT_ROOT}`);
  console.log(`📋 Supported extensions: ${SUPPORTED_EXTENSIONS.join(', ')}\n`);
  
  
  const files = walkDirectory(PROJECT_ROOT);
  console.log(`📄 Found ${files.length} files to process\n`);
  
  if (files.length === 0) {
    console.log('No files found to process.');
    return;
  }
  
  
  let processedCount = 0;
  let modifiedCount = 0;
  
  for (const file of files) {
    const wasModified = processFile(file);
    processedCount++;
    if (wasModified) {
      modifiedCount++;
    }
  }
  
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total files found: ${files.length}`);
  console.log(`Files processed: ${processedCount}`);
  console.log(`Files modified: ${modifiedCount}`);
  console.log(`Files unchanged: ${processedCount - modifiedCount}`);
  console.log('\n✅ Comment removal process completed!');
}


main();