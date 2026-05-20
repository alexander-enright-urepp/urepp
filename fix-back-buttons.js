const fs = require('fs');
const content = fs.readFileSync('app/players/[username]/page.tsx', 'utf8');

// Replace all the malformed window.location.href = /; with proper syntax
let newContent = content;

// Fix the malformed fallback URL
newContent = newContent.replace(/window\.location\.href = \/;\s*\}/g, "window.location.href = '/'; }");

fs.writeFileSync('app/players/[username]/page.tsx', newContent);
console.log('Fixed back buttons');
