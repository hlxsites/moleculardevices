import { decorateAutoBlock } from '../news/news.js';
import { buildBlock } from '../../scripts/lib-franklin.js';

export default function buildAutoBlocks() {
  const container = document.querySelector('main div');
  decorateAutoBlock(container);
  container.append(buildBlock('social-share', '<p>Share this news</p>'));
}
