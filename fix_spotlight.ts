import fs from 'fs';

const target = 'src/app/(main)/page.tsx';
let content = fs.readFileSync(target, 'utf8');

// Fix SpotlightRow grid on md: screens
content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">/g,
  '<div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">'
);

fs.writeFileSync(target, content);
console.log('Fixed SpotlightRow layout on md screens');
