module.exports = {
  'apps/backend/**/*.{ts,js}': [
    'eslint --config apps/backend/eslint.config.mjs --fix',
    'prettier --write',
  ],
  'apps/admin/**/*.{ts,tsx,js,jsx}': [
    'eslint --config apps/admin/eslint.config.mjs --fix',
    'prettier --write',
  ],
  'apps/mobile/**/*.dart': (filenames) =>
    `node scripts/format-mobile-staged.js ${filenames.join(' ')}`,
};
