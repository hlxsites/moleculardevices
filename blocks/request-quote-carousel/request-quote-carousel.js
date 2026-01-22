/* eslint-disable import/no-cycle */
import { createCard } from '../card/card.js';
import { createCarousel } from '../carousel/carousel.js';
import ffetch from '../../scripts/ffetch.js';
import { getCountryCode, sortDataByTitle } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

export const isCountryCodeUS = await getCountryCode() === 'US';

export default async function decorate(block) {
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
      defaultStyling: true,
      navButtons: true,
      dotButtons: false,
      infiniteScroll: true,
      autoScroll: false,
      visibleItems: [
        { items: 1, condition: (width) => width < 768 },
        { items: 2, condition: (width) => width < 1200 },
        { items: 3 },
      ],
      cardRenderer,
    },
  );
}
