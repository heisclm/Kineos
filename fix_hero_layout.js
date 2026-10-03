const fs = require('fs');
let content = fs.readFileSync('src/app/(main)/page.tsx', 'utf8');
content = content.replace('className="px-6 md:px-10 pt-6"', 'className="px-0 sm:px-6 md:px-10 sm:pt-6"');
fs.writeFileSync('src/app/(main)/page.tsx', content);

let carousel = fs.readFileSync('src/components/home/HeroCarousel.tsx', 'utf8');
carousel = carousel.replace('rounded-xl md:rounded-2xl', 'rounded-none sm:rounded-xl md:rounded-2xl');
fs.writeFileSync('src/components/home/HeroCarousel.tsx', carousel);
