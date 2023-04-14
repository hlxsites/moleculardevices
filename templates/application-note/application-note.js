import { styleCaption } from '../../scripts/scripts.js';

export default function buildAutoBlocks() {
  const main = document.querySelector('main');
  styleCaption(main.querySelectorAll('p > picture'));
  styleCaption(main.querySelectorAll('div.table'));
}
