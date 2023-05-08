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
  return item.applicationCategory && item.applicationCategory !== '0'
    ? item.applicationCategory
    : item.category;
}

function compareApplicationCards(card1, card2) {
  if (card1.querySelector('h2')) return -1;
  if (card2.querySelector('h2')) return 1;

  return card1.querySelector('h3').textContent
    .localeCompare(card2.querySelector('h3').textContent);
}

function createViewAllCategory() {
  const categoryOrder = [...document.querySelectorAll('.card-list-filter a')]
    .filter((link) => !!link.href
        && link.href.includes('#')
        && !link.href.includes(`#${viewAllCategory}`)
    )
    .map((link) => link.href.split('#')[1]);

  let viewAllCardList = [];
  for(category of categoryOrder) {
    if (!APPLICATIONS.has(category))
      continue;

    viewAllCardList.push(...APPLICATIONS.get(category));
  }

  APPLICATIONS.set(viewAllCategory, viewAllCardList);
}

export default async function decorate(block) {
  const applications = await ffetch('/query-index.json')
    .sheet('applications')
    .all();

  let technologies = await ffetch('/query-index.json')
  .sheet('technology')
  .all();

  technologies = technologies.filter(
    (technology) => technology.applicationCategory && technology.applicationCategory !== '0'
  );

  const cardRenderer = await createCard();

  APPLICATIONS.set(viewAllCategory, []);
  [...applications, ...technologies].forEach((item) => {
    let itemCategory = getCategory(item);
    if (!itemCategory || itemCategory === '0') return;
    itemCategory = itemCategory.replaceAll(' ', '-');

    if (!APPLICATIONS.has(itemCategory)) {
      const heading = div({ class: 'card-list-heading' },
        h2(itemCategory),
      );

      APPLICATIONS.set(itemCategory, [ heading ]);
    }

    const renderedItem = cardRenderer.renderItem(item);
    APPLICATIONS.get(itemCategory).push(renderedItem);
  });

  for (const [_, categoryCards] of APPLICATIONS) {
    categoryCards.sort(compareApplicationCards);
  }

  createViewAllCategory();

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
