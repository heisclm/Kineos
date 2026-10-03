import fs from 'fs';

let css = fs.readFileSync('src/app/globals.css', 'utf8');

if (!css.includes('-webkit-tap-highlight-color')) {
  css += `
@layer utilities {
  .no-tap-highlight {
    -webkit-tap-highlight-color: transparent;
  }
}

* {
  -webkit-tap-highlight-color: transparent;
}
`;
  fs.writeFileSync('src/app/globals.css', css);
}
