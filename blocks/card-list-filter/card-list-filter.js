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

function scrollBlockIntoView(block) {
  const section = block.closest('.section');

  const observer = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      if (mutation.type === 'attributes'
        && mutation.attributeName === 'data-section-status'
        && section.attributes.getNamedItem('data-section-status').value === 'loaded') {
        observer.disconnect();
        setTimeout(() => {
          window.scrollTo({
            top: block.querySelector('a.active').getBoundingClientRect().top - 70,
            left: 0,
            behavior: 'smooth',
          });
        }, 1000);
      }
    });
  });

  observer.observe(section, { attributes: true });
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

  if (block.closest('main').querySelector('.card-list')) {
    // we are on the page where cards are displayed and filtering is enabled by hash
    window.addEventListener('hashchange', () => { filterChangedViaHash(block, filters); });
    // set initial active filter
    setActiveFilter(block);

    if (window.location.hash && window.matchMedia('only screen and (min-width: 767px)').matches) {
      scrollBlockIntoView(block);
    }
  } else {
    // we are on different page
    const currentPageLink = block.querySelector(`a[href="${window.location.pathname}"`);
    if (currentPageLink) {
      currentPageLink.classList.add('active');
      block.querySelector('.active-filter .filter-title').innerText = currentPageLink.innerText;
    }
  }
}
