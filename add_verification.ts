import fs from 'fs';

const target = 'src/app/layout.tsx';
let content = fs.readFileSync(target, 'utf8');

if (!content.includes('verification: {')) {
  content = content.replace(
    /metadataBase: new URL\(process\.env\.NEXT_PUBLIC_SITE_URL \|\| 'https:\/\/kineos\.fun'\),/,
    `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kineos.fun'),\n  verification: {\n    google: 'neoQUkKOyHuDcE5ICC7fngunc7PhITml45oGaqSaJZI',\n  },`
  );
  fs.writeFileSync(target, content);
  console.log("Added Google verification to layout.tsx");
}
