import { addLinkIcon } from '../../scripts/scripts.min.js';

export default async function decorate(block) {
  addLinkIcon(block.querySelector('.customer-story p a'));
  return block;
}
