import fs from 'fs';

const target = 'src/components/content/DownloadSourceButton.tsx';
let content = fs.readFileSync(target, 'utf8');

content = content.replace(/`n          /g, '\n          ');
content = content.replace(/`n            /g, '\n            ');
content = content.replace(/`n              /g, '\n              ');

fs.writeFileSync(target, content);
console.log("Fixed DownloadSourceButton.tsx");
