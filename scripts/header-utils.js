import { buildBlock, decorateBlock, loadBlock } from './lib-franklin.js';

import fetchAndStyleHeaderMegamenus from '../blocks/header/header-megamenu.js';

/**
 * loads a block named 'header' into header
 */
export default function loadHeader(header) {
  const headerBlock = buildBlock('header', '');
  header.append(headerBlock);
  decorateBlock(headerBlock);
  loadBlock(headerBlock);
  return headerBlock;
}
