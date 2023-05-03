import { fetchFragment, summariseDescription } from '../../scripts/scripts.js';
import {
  a, div, h3, i, p,
} from '../../scripts/dom-helpers.js';
import { createCarousel } from '../../blocks/carousel/carousel.js';

function renderCard(card) {
  const buttonText = 'Request Quote';

  return (
    div(
      div({ class: 'item-thumb' }, card.picture),
      div({ class: 'item-details' },
        h3({ class: 'item-title' }, card.title),
        p({ class: 'item-description' }, summariseDescription(card.description, 150)),
        p({ class: 'button-container' },
          a({
            href: `/quote-request?pid=${card.id}`,
            'aria-label': buttonText,
          },
          buttonText,
          i({ class: 'fa fa-chevron-circle-right', 'aria-hidden': true }),
          ),
        ),
      ),
    )
  );
}

async function fetchProducts(productPaths) {
  return Promise.all(productPaths.map(async (path) => {
    const productHTML = await fetchFragment(path);
    if (productHTML) {
      const elem = document.createElement('div');
      elem.innerHTML = productHTML;
      const titleElem = elem.querySelector('h1');
      const descriptionElem = elem.querySelector('h1 ~ p');
      const picture = elem.querySelector('div div picture');
      return {
        href: path,
        id: titleElem.id,
        title: titleElem.textContent,
        description: descriptionElem.textContent,
        picture,
      };
    }
    return null;
  })).then((values) => values.filter((v) => v));
}

async function renderProducts() {
  const container = document.querySelector('main .cards');
  const productPaths = [...container.querySelectorAll('a')].map((link) => link.href);
  const products = await fetchProducts(productPaths);
  if (products.length === 0) {
    return;
  }
  container.innerHTML = '';

  container.parentElement.insertBefore(div(h3({ class: 'product-title' }, 'Products')), container);

  await createCarousel(
    container,
    products,
    {
      cssFiles: ['/templates/event/event.css'],
      navButtons: false,
      dotButtons: false,
      infiniteScroll: false,
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
      renderItem: renderCard,
    },
  );
}

async function renderDetails(insertAfterElement) {
  const summary = div({ class: 'event-summary' });
  insertAfterElement.parentNode.insertBefore(summary, insertAfterElement.nextSibling);
}

export default async function buildAutoBlocks() {
  const title = document.getElementById('event-details');
  if (title) title.classList.add('event-title');

  const moreBtn = document.querySelector('main strong > a:last-of-type');
  if (moreBtn) {
    moreBtn.setAttribute('target', '_blank');
    const par = moreBtn.closest('p');
    par.classList.add('find-out-more');
  }

  renderDetails(title);

  await renderProducts();
}
