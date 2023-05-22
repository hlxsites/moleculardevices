import { getCookie } from '../../scripts/scripts.js';
import {
  a, div, h3, h4, i, p, span,
} from '../../scripts/dom-helpers.js';

function renderAddToCart(item) {
  if (!item) return '';

  return (
    div({ class: 'variant-item-store' },
      div({ class: 'variant-item-store-header' },
        p({ class: 'legend' }, `$${(item.price / 100).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} USD`),
      ),
      div({ class: 'variant-item-store-content' },
        div({ class: 'variant-item-store-count' },
          span({ class: 'down' }, i({ class: 'fa fa-minus', data: item.id })),
          span({ class: 'count', id: item.id }, 1),
          span({ class: 'up' }, i({ class: 'fa fa-plus', data: item.id })),
        ),
        div({ class: 'variant-item-store-add-to-cart' },
          a({ class: 'button primary', name: 'Add to cart' }, 'Add to cart'),
        ),
      ),
    )
  );
}

function renderCart() {
  return (
    div({ class: 'cart-store' },
      span({ class: 'view-cart-count' }, 2),
      i({ class: 'fa fa-shopping-cart' }),
      a({
        href: 'https://shop.moleculardevices.com/cart',
        target: '_blank',
        name: 'View Cart',
        rel: 'noopener noreferrer',
      }, 'View Cart'),
    )
  );
}

function renderItem(item, addToCart) {
  if (!item) return '';

  return (
    div({ class: 'ordering-option-item', id: item.handle },
      div({ class: 'header' },
        h3({ class: 'title' }, item.title),
      ),
      div({ class: 'ordering-option-item-variants' },
        ...item.variants.map((variant) => div({ class: 'variant-item' },
          h4({ class: 'legend' }, variant.public_title),
          p({ class: 'legend' }, `#${variant.sku}`),
          (addToCart) ? renderAddToCart(variant) : '',
        ),
        ),
      ),
    )
  );
}

function fetchOption(option) {
  return fetch(`https://shop.moleculardevices.com/products/${option}.js`, {
    mode: 'cors',
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn(`Could not fetch ordering details for option ${option}, got status ${err.status}.`, err.statusText);
  });
}

async function fetchOptionIntoArray(array, idx, option) {
  array[idx] = await fetchOption(option.trim());
}

async function getOrderingOptions(block) {
  const refs = [...block.querySelectorAll('.ordering-options > div > div')]
    .map((ref) => (ref.innerHTML).split(', '))
    .reduce((x, y) => x.concat(y), []);

  const options = new Array(refs.length);
  await Promise.all(refs
    .map((option, idx) => fetchOptionIntoArray(options, idx, option)),
  );
  return options;
}

async function renderList(block) {
  const options = await getOrderingOptions(block);
  const addToCart = (getCookie('country_code') === 'US') || true;
  const items = [];
  options.forEach((option) => {
    items.push(renderItem(option, addToCart));
  });

  block.innerHTML = '';
  const container = div({ class: 'ordering-options-list' });
  container.append(...items);
  if (addToCart) container.append(renderCart());
  block.append(container);
}

export default async function decorate(block) {
  renderList(block);
}
