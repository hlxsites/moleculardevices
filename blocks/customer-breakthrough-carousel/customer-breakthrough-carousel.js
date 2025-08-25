import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture, fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import { addViewAllCTA } from '../latest-resources/latest-resources.js';
import { div } from '../../scripts/dom-helpers.js';

const placeholders = await fetchPlaceholders();

async function getCBData() {
  const category = getMetadata('category');
  return ffetch('/query-index.json')
    .sheet('customer-breakthroughs')
    .filter((cb) => cb.category === category)
    .limit(9)
    .all();
}

export default async function decorate(block) {
  const resources = await getCBData();
  const waveImage = createOptimizedPicture('/images/wave-footer-bg-top.png', 'wave', false, [
    { media: '(min-width: 992px)', width: '1663' },
    { width: '900' },
  ]);
  if (resources.length < 3) {
    // block.parentElement.previousElementSibling.remove();
    // block.parentElement.remove();
    block.closest('.section').previousElementSibling.classList.add('wave-section');
    block.closest('.section').previousElementSibling.appendChild(div({ class: 'wave' }, waveImage));
    block.closest('.section').remove();
    return;
  }

  const cbPath = '/customer-breakthroughs';
  const category = getMetadata('category').split(' ').join('-');
  const anchor = `${cbPath}#${category}`;

  /* view all CTA */
  addViewAllCTA(block, '', 'customer-breakthrough', anchor, () => { }, 'View case studies');

  const resourceCard = await createCard({
    showDate: true,
    defaultButtonText: placeholders.learnMore || 'Learn more',
    descriptionLength: block.classList.contains('list') ? 180 : 75,
  });

  await createCarousel(
    block,
    resources,
    {
      defaultStyling: true,
      cardStyling: true,
      navButtons: true,
      dotButtons: false,
      infiniteScroll: true,
      autoScroll: false,
      visibleItems: [
        {
          items: 1,
          condition: () => window.screen.width < 768,
        },
        {
          items: 2,
          condition: () => window.screen.width < 1200,
        }, {
          items: 3,
        },
      ],
      cardRenderer: resourceCard,
    },
  );
}
