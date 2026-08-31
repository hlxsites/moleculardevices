/* eslint-disable import/no-cycle */
import { createCard } from '../card/card.js';
import { cardStyleConfig, createCarousel } from '../carousel/carousel.js';
import ffetch from '../../scripts/ffetch.js';
import { getCountryCode, sortDataByTitle } from '../../scripts/scripts.min.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.min.js';

export const isCountryCodeUS = await getCountryCode() === 'US';

export default async function decorate(block) {
  block.classList.add('cards');
  const fragmentPaths = [...block.querySelectorAll('a')].map((elem) => elem.getAttribute('href'));
  const placeholders = await fetchPlaceholders();
  const cardRenderer = await createCard({
    titleLink: false,
    thumbnailLink: false,
    isShopifyCard: isCountryCodeUS,
    c2aLinkStyle: true,
    isRequestQuoteCard: !isCountryCodeUS,
    defaultButtonText: placeholders.requestQuote || 'Request Quote',
  });

  const fragments = await ffetch('/query-index.json')
    .sheet('applications')
    .filter((frag) => fragmentPaths.includes(frag.path))
    .all();
  fragments.forEach((fragment) => {
    const hasShopifyURL = isCountryCodeUS && (fragment.shopifyUrl && fragment.shopifyUrl !== '0');
    const rfqLink = `/quote-request?pid=${fragment.familyID}`;
    fragment.c2aLinkConfig = {
      href: hasShopifyURL ? fragment.shopifyUrl : rfqLink,
      'aria-label': hasShopifyURL ? 'Order' : 'Request Quote',
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  });

  await createCarousel(
    block,
    sortDataByTitle(fragments),
    {
      ...cardStyleConfig,
      cardRenderer,
    },
  );
}
