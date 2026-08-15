const { execFileSync } = require('node:child_process');
const path = require('node:path');

const mobileDir = path.join(__dirname, '..', 'apps', 'mobile');
const files = process.argv
  .slice(2)
  .map((file) => path.relative(mobileDir, file));

if (files.length > 0) {
  execFileSync('fvm', ['dart', 'format', ...files], {
    cwd: mobileDir,
    stdio: 'inherit',
  });
}
