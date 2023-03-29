import { decorateAutoBlock } from '../news/news.js';

export default function buildAutoBlocks() {
  const content = document.querySelector('.section > .default-content-wrapper');
  decorateAutoBlock(content);
}
