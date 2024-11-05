// build/generate-route.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, '../routes');
const outputFile = path.join(routesDir, 'index.ts');

const generateRouteImports = () => {
  const files = fs.readdirSync(routesDir);
  const imports = files
    .filter(file => file.endsWith('.ts') && file !== 'index.ts')
    .map(file => {
      const routeName = file.replace('.ts', '');
      return `export { default as ${routeName} } from './${routeName}';`;
    });

  fs.writeFileSync(outputFile, imports.join('\n'));
  console.log('Generated route index at build time.');
};

generateRouteImports();
