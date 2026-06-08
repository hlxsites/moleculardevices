import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture, fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.min.js';
import { cardStyleConfig, createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import { addViewAllCTA } from '../latest-resources/latest-resources.js';
import { div } from '../../scripts/dom-helpers.js';

const placeholders = await fetchPlaceholders();

async function getCBData(category, pageIdentifier) {
  return ffetch('/query-index.json')
    .sheet('customer-breakthroughs')
    .filter((cb) => cb.category.includes(category) && cb.relatedProducts.includes(pageIdentifier))
    .limit(9)
    .all();
}

export default async function decorate(block) {
  const pageIdentifier = getMetadata('identifier');
  block.classList.add('cards');
  const cbPath = '/customer-breakthroughs';
  let category = getMetadata('category');
  if (category === 'Services and Support') category = 'Lab Automation';

  const resources = await getCBData(category, pageIdentifier);

  category = category.split(' ').join('-');
  const anchor = `${cbPath}#${category}`;

  /* view all CTA */
  addViewAllCTA(block, '', 'customer-breakthrough', anchor, () => { }, 'View case studies');

  const waveImage = createOptimizedPicture('/images/wave-footer-bg-top.png', 'wave', false, [
    { media: '(min-width: 992px)', width: '1663' },
    { width: '900' },
  ]);
  if (resources.length < 1) {
    block.closest('.section').previousElementSibling.classList.add('wave-section');
    block.closest('.section').previousElementSibling.appendChild(div({ class: 'wave' }, waveImage));
    block.closest('.section').remove();
    return;
  }

  const resourceCard = await createCard({
    showDate: true,
    defaultButtonText: placeholders.learnMore || 'Learn more',
    descriptionLength: block.classList.contains('list') ? 180 : 75,
    showTag: true,
  });

  await createCarousel(
    block,
    resources,
    {
      ...cardStyleConfig,
      cardRenderer: resourceCard,
    },
  );
}
