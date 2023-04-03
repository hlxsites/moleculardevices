import { decorateAutoBlock } from '../news/news.js';

export default function buildAutoBlocks() {
  const content = document.querySelector('main div');
  decorateAutoBlock(content);
}
