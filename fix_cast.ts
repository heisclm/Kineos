import fs from 'fs';

const fixCast = (target: string) => {
  let content = fs.readFileSync(target, 'utf8');
  content = content.replace(/name: c\.person\.name/g, 'name: c.name');
  fs.writeFileSync(target, content);
  console.log("Fixed cast in", target);
};

fixCast('src/app/(main)/movies/[slug]/page.tsx');
fixCast('src/app/(main)/series/[slug]/page.tsx');
