import fs from 'fs';

let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');

if (!layout.includes('NextTopLoader')) {
  layout = layout.replace('import { Toaster } from "sonner";', 'import { Toaster } from "sonner";\nimport NextTopLoader from "nextjs-toploader";');
  layout = layout.replace('{children}', '<NextTopLoader color="#3b82f6" initialPosition={0.08} crawlSpeed={200} height={3} crawl={true} showSpinner={false} easing="ease" speed={200} shadow="0 0 10px #3b82f6,0 0 5px #3b82f6" />\n        {children}');
  fs.writeFileSync('src/app/layout.tsx', layout);
}
