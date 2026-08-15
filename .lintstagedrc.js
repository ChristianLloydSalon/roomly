module.exports = {
  'apps/backend/**/*.{ts,js}': [
    'eslint --config apps/backend/eslint.config.mjs --fix',
    'prettier --write',
  ],
  'apps/admin/**/*.{ts,tsx,js,jsx}': [
    'eslint --config apps/admin/eslint.config.mjs --fix',
    'prettier --write',
  ],
  // Filenames are quoted because lint-staged tokenizes this string on
  // whitespace before spawning it, and this repo's absolute path contains a
  // space (".../side projects/roomly/...") that would otherwise get split
  // into two bogus arguments.
  'apps/mobile/**/*.dart': (filenames) =>
    `node scripts/format-mobile-staged.js ${filenames.map((f) => JSON.stringify(f)).join(' ')}`,
};
