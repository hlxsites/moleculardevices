import ffetch from '../../scripts/ffetch.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';

const BLOGS = new Map();
const viewAllCategory = 'viewall';

function getCurrentCategory() {
  const activeHash = window.location.hash;
  const currentFilter = activeHash ? activeHash.substring(1).toLowerCase() : viewAllCategory;
  return BLOGS.has(currentFilter) ? currentFilter : viewAllCategory;
}

function filterChanged(carousel) {
  carousel.data = BLOGS.get(getCurrentCategory());
  carousel.render();
}

export default async function decorate(block) {
  const blogs = await ffetch('/query-index.json')
    .sheet('blog')
    .all();

  BLOGS.set(viewAllCategory, []);
  const blogCard = await createCard();
  blogs.forEach((item) => {
    const itemCategory = item.path.split('/')[2];
    if (!itemCategory || itemCategory === 'blog') return;

    if (!BLOGS.has(itemCategory)) {
      BLOGS.set(itemCategory, []);
    }

    const renderedItem = blogCard.renderItem(item);

    BLOGS.get(itemCategory).push(renderedItem);
    BLOGS.get(viewAllCategory).push(renderedItem);
  });

  const carousel = await createCarousel(
    block,
    BLOGS.get(getCurrentCategory()),
    {
      infiniteScroll: true,
      navButtons: false,
      dotButtons: false,
      autoScroll: false,
      renderItem: (item) => item,
    },
  );

  window.addEventListener('hashchange', () => { filterChanged(carousel); });
  window.matchMedia('only screen and (max-width: 767px)').onchange = (e) => {
    if (e.matches) {
      carousel.setInitialScrollingPosition();
    }
  };
}
