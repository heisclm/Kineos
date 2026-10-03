import fs from 'fs';

let admin = fs.readFileSync('src/features/admin/admin.actions.ts', 'utf8');

admin = admin.replace(
  /const shortTeaser = formData\.get\("shortTeaser"\) as string;\n    const shortTeaser = formData\.get\("shortTeaser"\) as string;/,
  'const shortTeaser = formData.get("shortTeaser") as string;'
);

fs.writeFileSync('src/features/admin/admin.actions.ts', admin);
