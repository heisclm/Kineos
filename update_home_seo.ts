import fs from 'fs';

const target = 'src/app/(main)/page.tsx';
let content = fs.readFileSync(target, 'utf8');

const componentStart = /(export default async function HomePage\(\) \{[\s\S]*?let topRatedMovies = await getTopRatedMovies\(5\);)/;

const jsonLdAdd = `\n    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Kineos",
      "url": "https://kineos.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://kineos.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };\n`;

content = content.replace(componentStart, `$1\n${jsonLdAdd}`);

const returnStart = /(return \(\n\s*<div className="space-y-12)/;
content = content.replace(returnStart, `return (\n      <>\n        <script\n          type="application/ld+json"\n          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}\n        />\n      <div className="space-y-12`);

const returnEnd = /(<\/div>\n\s*\);\n\s*\})/;
content = content.replace(returnEnd, `</div>\n      </>\n    );\n  }`);

fs.writeFileSync(target, content);
console.log("Updated homepage JSON-LD");
