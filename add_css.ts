import fs from 'fs';

const target = 'src/app/globals.css';
let content = fs.readFileSync(target, 'utf8');

const hideScrollbarClass = `
@layer utilities {
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
}
`;

if (!content.includes('.hide-scrollbar')) {
  content += hideScrollbarClass;
  fs.writeFileSync(target, content);
  console.log('Added hide-scrollbar to globals.css');
}
