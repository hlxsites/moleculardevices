import ffetch from '../../scripts/ffetch.js';
import { cardStyleConfig, createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  block.classList.add('cards');
  const productPaths = [...block.querySelectorAll('a')].map((elem) => elem.getAttribute('href'));
  const unsortedProducts = await ffetch('/query-index.json')
    .sheet('products')
    .filter((product) => productPaths.includes(product.path))
    .all();
  const products = unsortedProducts.sort((a, b) => {
    const indexA = productPaths.indexOf(a.path);
    const indexB = productPaths.indexOf(b.path);
    return indexA - indexB;
  });

  const placeholders = await fetchPlaceholders();

  const cardRenderer = await createCard({
    descriptionLength: 150,
    titleLink: false,
    thumbnailLink: false,
    defaultButtonText: placeholders.details || 'Details',
    c2aLinkStyle: true,
  });

  await createCarousel(
    block,
    products,
    {
      ...cardStyleConfig,
      cardRenderer,
    },
  );
}
