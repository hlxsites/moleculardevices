import ffetch from '../../scripts/ffetch.js';
import { decorateButtons, fetchPlaceholders, getMetadata } from '../../scripts/lib-franklin.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import {
  div, p, strong, a,
} from '../../scripts/dom-helpers.js';
import resourceMapping from '../resources/resource-mapping.js';
import { sortDataByDate } from '../../scripts/scripts.js';

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

async function getResourcesFromMetaTags() {
  const template = getMetadata('template');
  const identifier = getMetadata('identifier') || document.querySelector('.hero .container h1, .hero-advanced .container h1').textContent;

  const includedResourceTypes = Object.keys(resourceMapping);
  const relatedResource = relatedResourcesHeaders[template] || 'relatedProducts';

  return ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource[relatedResource].includes(identifier)
      && includedResourceTypes.includes(resource.type))
    .limit(9)
    .all();
}

async function getFeaturedResources(paths) {
  return ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => paths.includes(resource.path)
      || paths.includes(resource.gatedURL)
      || (resource.gatedURL && resource.gatedURL !== '0' && paths.includes(new URL(resource.gatedURL, 'https://moleculardevices.com').pathname)),
    )
    .limit(9)
    .all();
}

export default async function decorate(block) {
  const blockLinks = block.querySelectorAll('a');
  let resources = [];

  if (blockLinks.length !== 0) {
    resources = await getFeaturedResources([...blockLinks].map((link) => link.getAttribute('href')));
  } else {
    resources = await getResourcesFromMetaTags();
  }

  console.log(resources);

  if (resources.length < 3) {
    block.parentElement.parentElement.remove();
    return;
  }

  const placeholders = await fetchPlaceholders();
  const resourceCard = await createCard({
    showDate: true,
    defaultButtonText: placeholders.learnMore || 'Learn more',
    descriptionLength: block.classList.contains('list') ? 180 : 75,
  });

  // citations has default thumbnail image.
  resources.forEach((resource) => {
    if (resource.type === 'Citation') {
      resource.thumbnail = '/images/citation-card-thumbnail.webp';
    }
  });

  await createCarousel(
    block,
    sortDataByDate(resources),
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

  if (blockLinks.length === 0) {
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
}

/* TESTING */
// async function getRealatedResourceItems(relatedResource, cat, subCat, identifier, searchTitle) {
//   console.log(searchTitle);
//   const data = await ffetch('/query-index.json')
//     // .sheet('resources')
//     .filter(
//       (page) => page[relatedResource] !== '0'
//         && page.type !== 'Product'
//         && page.type !== 'Application'
//         && page.type !== 'Technology'
//         && (
//           (page.category && page.category !== '0' && page.category.includes(cat))
//           || (page.subCategory === searchTitle && page.subCategory && page.subCategory !== '0'
//             && (page.subCategory.includes(subCat)
//               || page.subCategory.includes(identifier)
//               || page.subCategory.includes(searchTitle)))
//         ))
//     .all();

//   console.log(data);
//   return data;
//   // return data.map((resource) => resource[relatedResource]);
//   // return data.filter((resource) => resource.category.includes(cat)
//   //   || resource.subCategory.includes(subCat));
// }

async function resourceTest() {
  const template = getMetadata('template');
  const category = getMetadata('category');
  const subCategory = getMetadata('sub-category');
  const searchTitle = getMetadata('search-title');
  const identifier = getMetadata('identifier') || document.querySelector('.hero .container h1, .hero-advanced .container h1').textContent;
  const includedResourceTypes = Object.keys(resourceMapping);
  const relatedResource = relatedResourcesHeaders[template] || 'relatedProducts';

  console.log(`category: ${category}`);
  console.log(`subCategory: ${subCategory}`);
  console.log(`searchTitle: ${searchTitle}`);
  console.log(`identifier: ${identifier}`);
  console.log('-------------------');

  const data = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((page) => page[relatedResource] !== '0'
      && page.type !== 'Product'
      && page.type !== 'Application'
      && page.type !== 'Technology'
      && page.category && page.category !== '0' && page.category === category
      && page[relatedResource].includes(identifier)
      && includedResourceTypes.includes(page.type),
    )
    // .limit(9)
    .all();

  console.log(data);
}
await resourceTest();
/* TESTING */
