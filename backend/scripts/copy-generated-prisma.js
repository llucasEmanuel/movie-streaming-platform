const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../src/generated/prisma');
const dest = path.resolve(__dirname, '../dist/generated/prisma');

if (!fs.existsSync(src)) {
  console.error(`Prisma generated client not found at ${src}`);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`Copied Prisma client from ${src} to ${dest}`);
