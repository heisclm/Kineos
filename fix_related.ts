import fs from 'fs';

const target = 'src/features/content/content.service.ts';
let content = fs.readFileSync(target, 'utf8');

const relatedMoviesCode = `const unique = [];
      const seen = new Set();
      for (const row of result) {
        if (!seen.has(row.id)) {
          seen.add(row.id);
          unique.push(row);
        }
      }
      
      if (unique.length > 0) {
        const ids = unique.map(r => r.id);
        const media = await db.select().from(mediaAssets).where(inArray(mediaAssets.contentId, ids));
        for (const row of unique) {
          const m = media.find(m => m.contentId === row.id && m.type === 'poster');
          if (m) (row as any).imageUrl = m.url;
        }
      }

      return unique;`;

content = content.replace(/const unique = \[\];[\s\S]*?return unique;/g, relatedMoviesCode);

fs.writeFileSync(target, content);
console.log("Updated content.service.ts for related items");
