import { addLinkIcon } from '../../scripts/scripts.js';

export default async function decorate(block) {
  addLinkIcon(block.querySelector('.customer-story p a'));
  return block;
}
