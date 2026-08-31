import { addLinkIcon } from '../../scripts/scripts.min.js';

export default async function decorate(block) {
  addLinkIcon(block.querySelector('.button-container a'));
}
