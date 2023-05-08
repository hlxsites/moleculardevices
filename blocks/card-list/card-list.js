import ffetch from '../../scripts/ffetch.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import { div, h2 } from '../../scripts/dom-helpers.js';

const APPLICATIONS = new Map();
const viewAllCategory = 'viewall';

function getCurrentCategory() {
  const activeHash = window.location.hash;
  const currentFilter = activeHash ? activeHash.substring(1) : viewAllCategory;
  return APPLICATIONS.has(currentFilter) ? currentFilter : viewAllCategory;
}

function filterChanged(carousel) {
  carousel.data = APPLICATIONS.get(getCurrentCategory());
  carousel.render();
  carousel.block.querySelectorAll('.card-list-heading').forEach((heading) => {
    heading.parentElement.classList.add('carousel-heading-item');
  });
}

function getCategory(item) {
  return item.category;
}

export default async function decorate(block) {
  const applications = await ffetch('/query-index.json')
    .sheet('applications')
    .all();

  const cardRenderer = await createCard();

  APPLICATIONS.set(viewAllCategory, []);
  applications.forEach((item) => {
    const itemCategory = getCategory(item);
    if (!itemCategory || itemCategory === '0') return;

    if (!APPLICATIONS.has(itemCategory)) {
      const heading = div({ class: 'card-list-heading' },
        h2(itemCategory),
      );

      APPLICATIONS.set(itemCategory, [ heading ]);
      APPLICATIONS.get(viewAllCategory).push(heading);
    }

    const renderedItem = cardRenderer.renderItem(item);

    APPLICATIONS.get(itemCategory).push(renderedItem);
    APPLICATIONS.get(viewAllCategory).push(renderedItem);
  });

  const carousel = await createCarousel(
    block,
    APPLICATIONS.get(getCurrentCategory()),
    {
      infiniteScroll: true,
      navButtons: false,
      dotButtons: false,
      autoScroll: false,
      renderItem: (item) => item,
    },
  );
 
  // kind of hackish, but otherwise we'd need to refactor all the carousels
  block.querySelectorAll('.card-list-heading').forEach((heading) => {
    heading.parentElement.classList.add('carousel-heading-item');
  });

  window.addEventListener('hashchange', () => { filterChanged(carousel); });
  window.matchMedia('only screen and (max-width: 767px)').onchange = (e) => {
    if (e.matches) {
      carousel.setInitialScrollingPosition();
    }
  };
}
