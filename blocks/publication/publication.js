import { readBlockConfig } from '../../scripts/lib-franklin.js';

import { createOverview, fetchEntries } from '../news/news.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const limit = parseInt(config.limit, 10) || 10;
  const paginationLimit = parseInt(config.paginationLimit, 9) || 9;
  const entries = await fetchEntries('publications');
  const showDescription = true;
  const viewMoreText = 'learn more';
  // console.log(`found ${entries.length} entries`);
  await createOverview(block, entries, limit, paginationLimit, showDescription, viewMoreText);
}
