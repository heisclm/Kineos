import fs from 'fs';

const target = 'src/app/(main)/search/page.tsx';
let content = fs.readFileSync(target, 'utf8');

content = content.replace(/`n\s+shortTeaser/, '\n              shortTeaser');

fs.writeFileSync(target, content);
console.log("Fixed search page");
