import {
  button, div, span,
} from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

const viewAllCategory = 'viewall';

function setActiveFilter(block) {
  let activeHash = window.location.hash;
  activeHash = activeHash ? activeHash.substring(1) : viewAllCategory;
  const filterLink = block.querySelector(`a[href*="#${activeHash}"`);
  if (!filterLink) {
    const viewAllLink = block.querySelector(`a[href*="#${viewAllCategory}"`);
    viewAllLink.classList.add('active');
    block.querySelector('.active-filter .filter-title').innerText = viewAllLink.innerText;
  } else {
    block.querySelector('.active-filter .filter-title').innerText = filterLink.innerText;
    filterLink.classList.add('active');
  }
}

function filterChangedViaHash(block, filters) {
  filters.forEach((r) => r.classList.remove('active'));
  setActiveFilter(block);
}

function showHideAllFilters(block) {
  block.querySelector('ul').classList.toggle('hide');
}

export default function decorate(block) {
  block.prepend(
    div({ class: 'active-filter' },
      button({ class: 'show-hide-filters', onclick: () => { showHideAllFilters(block); } },
        span({ class: 'filter-title' }),
        span({ class: 'icon icon-chevron-right-outline' }),
      ),
    ),
  );
  decorateIcons(block);

  // on mobile we always start with the list of filters hidden
  block.querySelector('ul').classList.add('hide');

  const filters = [...block.querySelectorAll('a')];
  filters.forEach((link) => {
    link.addEventListener('click', (e) => {
      filters.forEach((r) => r.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  if (block.closest('main').querySelector('.blog-list')) {
    // we are on the page where cards are displayed and filtering is enabled by hash
    window.addEventListener('hashchange', () => { filterChangedViaHash(block, filters); });
    // set initial active filter
    setActiveFilter(block);
  } else {
    // we are on different page
    // TODO
  }
}
