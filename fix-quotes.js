import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/data/portfolio.js';
let content = readFileSync(filePath, 'utf8');

// Replace all smart quotes with regular quotes
content = content.replace(/'/g, "'");  // Left single quote
content = content.replace(/'/g, "'");  // Right single quote
content = content.replace(/"/g, '"');  // Left double quote
content = content.replace(/"/g, '"');  // Right double quote

writeFileSync(filePath, content);
console.log('✅ Fixed all smart quotes in portfolio.js');
