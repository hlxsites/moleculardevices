// eslint-disable-next-line import/no-extraneous-dependencies
import { minify } from 'terser';
import fs from 'fs';

const files = [
  { in: './scripts/lib-franklin.js', out: './scripts/lib-franklin.min.js' },
  { in: './scripts/scripts.js', out: './scripts/scripts.min.js' },
];

(async () => {
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const code = fs.readFileSync(file.in, 'utf-8');

    // eslint-disable-next-line no-await-in-loop
    const result = await minify(code, {
      compress: true,
      mangle: true,
      format: {
        beautify: false,
        semicolons: true,
        comments: false,
      },
    });

    fs.writeFileSync(file.out, result.code);
    // eslint-disable-next-line no-console
    console.log(`Minified: ${file.out}`);
  }
})();
