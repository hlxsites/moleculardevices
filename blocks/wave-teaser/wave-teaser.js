import { addLinkIcon } from '../../scripts/scripts.js';

export default async function decorate(block) {
  addLinkIcon(block.querySelector('.button-container a'));
}
