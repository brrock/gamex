const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const indexPath = path.join(__dirname, 'index.ts');  // Corrected to root directory

// Verify that the components directory exists
if (!fs.existsSync(componentsDir)) {
  console.error('Error: components directory does not exist.');
  process.exit(1);
}

// Recursive function to get all .ts and .tsx files in a directory and its subdirectories
function getFilesRecursively(directory) {
  let files = [];
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      files = [...files, ...getFilesRecursively(fullPath)];
    } else if ((item.endsWith('.ts') || item.endsWith('.tsx')) && item !== 'index.ts') {
      files.push(fullPath);
    }
  }
  return files;
}

// Function to generate the index.ts file with dynamic exports
function generateExports() {
  console.log('Generating root index.ts...');

  const files = getFilesRecursively(componentsDir);

  const exports = files.map(file => {
    const relativePath = path.relative(__dirname, file).replace(/\\/g, '/').replace(/\.tsx?$/, '');
    return `export * from './${relativePath}';`;
  }).join('\n');

  fs.writeFileSync(indexPath, exports, { flag: 'w' });  // Ensure synchronous write
  fs.fsyncSync(fs.openSync(indexPath, 'r+')); // Force flush to file system
  console.log(`index.ts file generated with ${files.length} exports.`);
}

// Initial generation
generateExports();

// Watch for changes in development mode only
if (process.env.NODE_ENV === 'development') {
  console.log('Watching for changes in development mode...');
  fs.watch(componentsDir, { recursive: true }, (eventType, filename) => {
    if (filename && (filename.endsWith('.ts') || filename.endsWith('.tsx'))) {
      console.log(`Detected change in ${filename}, regenerating root index.ts...`);
      generateExports();
    }
  });
}
