import ffetch from '../../scripts/ffetch.js';
import { decorateButtons, fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import {
  div, p, strong, a,
} from '../../scripts/dom-helpers.js';
import resourceMapping from '../resources/resource-mapping.js';

const relatedResourcesHeaders = {
  Product: 'relatedProducts',
  Technology: 'relatedTechnologies',
  Application: 'relatedApplications',
};

function onViewAllClick(e) {
  e.preventDefault();
  const resourcesLink = document.querySelector('.page-tabs li > a[href="#resources"]');
  resourcesLink.click();
  document.querySelector('.page-tabs-container').scrollIntoView();
}

export default async function decorate(block) {
  const template = getMetadata('template');
  const identifier = getMetadata('identifier') || document.querySelector('.hero .container h1, .hero-advanced .container h1').textContent;

  const includedResourceTypes = Object.keys(resourceMapping);
  const relatedResource = relatedResourcesHeaders[template] || 'relatedProducts';

  const resources = await ffetch('/query-index.json')
    .sheet('resources')
    .chunks(2000)
    .filter((resource) => resource[relatedResource].includes(identifier)
      && includedResourceTypes.includes(resource.type))
    .limit(9)
    .all();

  const placeholders = await fetchPlaceholders();
  const resourceCard = await createCard({
    defaultButtonText: placeholders.learnMore || 'Learn more',
    descriptionLength: block.classList.contains('list') ? 180 : 75,
  });

  // citations has default thumbnail image
  resources.forEach((resource) => {
    if (resource.type === 'Citation') {
      resource.thumbnail = '/images/citation-card-thumbnail.webp';
    }
  });

  await createCarousel(
    block,
    resources,
    {
      defaultStyling: true,
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
  const viewAllBtn = div({ class: 'latest-resources-button' },
    p({ class: 'button-container' },
      strong(
        a({
          href: '#resources',
          class: 'button primary',
          onclick: onViewAllClick,
        }, placeholders.viewAllResources || 'View all Resources'),
      ),
    ),
  );
  decorateButtons(viewAllBtn);
  block.parentElement.parentElement.append(viewAllBtn);
}
