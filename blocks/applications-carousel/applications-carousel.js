import { fetchFragment, sortDataByTitle } from '../../scripts/scripts.js';
import { createCarousel } from '../carousel/carousel.js';
import { createCard } from '../card/card.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

function onReadMoreClick(e) {
  e.preventDefault();
  const appsLink = document.querySelector('.page-tabs li > a[href="#applications"]');
  appsLink.click();
  document.querySelector('.page-tabs-container').scrollIntoView();
}

function getDescription(element) {
  const pElements = element.querySelectorAll('div p');
  let firstPWithText = '';
  for (let index = 0; index < pElements.length; index += 1) {
    const textContent = pElements[index].textContent.trim();
    if (textContent !== '') {
      firstPWithText = textContent;
      break;
    }
  }
  return firstPWithText;
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const hasApplicationTab = block.closest('main').querySelector('.page-tabs');
  const fragmentPaths = [...block.querySelectorAll('a')].map((elem) => elem.getAttribute('href'));

  const fragments = await Promise.all(fragmentPaths.map(async (path) => {
    const fragmentHtml = await fetchFragment(path);
    if (fragmentHtml) {
      const fragmentElement = document.createElement('div');
      fragmentElement.innerHTML = fragmentHtml;
      const h3Block = fragmentElement.querySelector('h3');
      const imageBlock = fragmentElement.querySelector('picture');
      const description = getDescription(fragmentElement);
      const appLinks = fragmentElement.querySelectorAll('a:last-of-type');
      const appLink = fragmentElement.querySelectorAll('a:last-of-type')[appLinks.length - 1];
      return {
        id: h3Block.id,
        title: h3Block.textContent,
        imageBlock,
        description,
        c2aLinkConfig: {
          href: hasApplicationTab ? '#applications' : appLink,
          'aria-label': placeholders.readMore || 'Read More',
          onclick: hasApplicationTab ? onReadMoreClick : null,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      };
    }
    return null;
  }));
  const sortedFragments = sortDataByTitle(fragments);

  const cardRenderer = await createCard({
    titleLink: false,
    thumbnailLink: false,
    descriptionLength: 100,
    imageBlockReady: true,
    c2aLinkStyle: true,
  });

  await createCarousel(
    block,
    sortedFragments,
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
      cardRenderer,
    },
  );
}
