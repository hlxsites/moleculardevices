import { fetchFragment, summariseDescription } from '../../scripts/scripts.js';
import { createCarousel } from '../carousel/carousel.js';
import {
  div, a, p, i, h3,
} from '../../scripts/dom-helpers.js';

function onReadMoreClick(e) {
  e.preventDefault();
  const appsLink = document.querySelector('.page-tabs li > a[href="#applications"]');
  appsLink.click();
  window.scroll(0, 0);
}

function renderItem(item) {
  const buttonText = 'Read More';

  return (
    div({ class: 'app-carousel-item' },
      div({ class: 'app-carousel-thumb' }, item.pictureBlock),
      div({ class: 'app-carousel-details' },
        h3(item.title),
        p({ class: 'app-description' }, summariseDescription(item.description, 100)),
      ),
      div({ class: 'app-carousel-actions' },
        p({ class: 'button-container' },
          a({
            href: '#applications',
            'aria-label': buttonText,
            onclick: onReadMoreClick,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          buttonText,
          i({ class: 'fa fa-chevron-circle-right', 'aria-hidden': true }),
          ),
        ),
      ),
    )
  );
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
  const fragmentPaths = [...block.querySelectorAll('a')].map((elem) => elem.getAttribute('href'));
  const fragments = await Promise.all(fragmentPaths.map(async (path) => {
    const fragmentHtml = await fetchFragment(path);
    if (fragmentHtml) {
      const fragmentElement = document.createElement('div');
      fragmentElement.innerHTML = fragmentHtml;
      const h3Block = fragmentElement.querySelector('h3');
      const pictureBlock = fragmentElement.querySelector('picture');
      const description = getDescription(fragmentElement);
      return {
        id: h3Block.id, title: h3Block.textContent, pictureBlock, description,
      };
    }
    return null;
  }));
  const sortedFragments = fragments.filter((item) => !!item).sort((x, y) => {
    if (x.title < y.title) {
      return -1;
    }
    if (x.title > y.title) {
      return 1;
    }
    return 0;
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
      renderItem,
    },
  );
}
