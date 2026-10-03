import fs from 'fs';

const target = 'src/app/(main)/page.tsx';
let content = fs.readFileSync(target, 'utf8');

if (content.includes('`n')) {
  console.log("FOUND backtick n in page.tsx!");
  // Let's replace it
  content = content.replace(/`n/g, '\n');
  fs.writeFileSync(target, content);
} else {
  console.log("Not found.");
}
