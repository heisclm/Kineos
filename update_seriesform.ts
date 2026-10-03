import fs from 'fs';

const target = 'src/components/admin/SeriesForm.tsx';
let content = fs.readFileSync(target, 'utf8');

if (!content.includes('name="language"')) {
  // Add language after releaseDate
  content = content.replace(
    /style=\{\{ colorScheme: "dark" \}\}\s*\/>\s*<\/div>\s*<\/div>\s*<\/div>/,
    `style={{ colorScheme: "dark" }}\n                  />\n                </div>\n                <div>\n                  <label className={labelClasses}>Language</label>\n                  <input name="language" className={inputClasses} placeholder="e.g. English, Spanish" />\n                </div>\n              </div>\n            </div>`
  );
}

if (!content.includes('name="shortTeaser"')) {
  content = content.replace(
    /<label htmlFor="description" className=\{labelClasses\}>Full Storyline<\/label>/,
    `<label htmlFor="shortTeaser" className={labelClasses}>Short Teaser (Cards & Banners)</label>\n                  <textarea id="shortTeaser" name="shortTeaser" rows={2} className={inputClasses} placeholder="A brief 1-2 sentence hook..." />\n                </div>\n                <div className="space-y-2">\n                  <label htmlFor="description" className={labelClasses}>Full Storyline</label>`
  );
}

fs.writeFileSync(target, content);
console.log("Updated SeriesForm");
