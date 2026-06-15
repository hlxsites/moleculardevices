/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import postcss from 'postcss';
import cssnano from 'cssnano';

const input = './styles/styles.css';
const output = './styles/styles.min.css';

(async () => {
  const css = fs.readFileSync(input, 'utf-8');

  const result = await postcss([cssnano]).process(css, { from: input });

  fs.writeFileSync(output, result.css);
  // eslint-disable-next-line no-console
  console.log('CSS Minified');
})();
