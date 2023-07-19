import { fetchPlaceholders, readBlockConfig } from '../../scripts/lib-franklin.js';

import { createOverview, fetchData } from '../news/news.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const placeholders = await fetchPlaceholders();
  const options = {
    limitPerPage: parseInt(config.limitPerPage, 10) || 10,
    limitForPagination: parseInt(config.limitForPagination, 9) || 9,
    showDescription: true,
    viewMoreText: placeholders.learnMore || 'learn more',
    panelTitle: `${placeholders.filterBy || 'Filter By'} :`,
  };
  options.activeFilters = new Map();
  options.activeFilters.set('year', '');
  options.activeFilters.set('page', 1);

  options.data = await fetchData('publications');
  await createOverview(
    block,
    options);
}
