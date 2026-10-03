import fs from 'fs';
import path from 'path';

function replaceInDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        replaceInDir(fullPath);
      }
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.txt')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('kineos.fun')) {
          content = content.replace(/kineos\.com/g, 'kineos.fun');
          fs.writeFileSync(fullPath, content);
          console.log(`Replaced in ${fullPath}`);
        }
      }
    }
  }
}

replaceInDir(process.cwd());
console.log('Domain replacement complete.');
