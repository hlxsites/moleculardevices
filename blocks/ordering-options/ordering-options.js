import { loadScript, getCookie, setCookie } from '../../scripts/scripts.js';
import {
  a, div, h3, i, p, span,
} from '../../scripts/dom-helpers.js';

const CART_COOKIE_NAME = 'cart';

function updateCounter(event) {
  const btnContainer = event.target.closest('span');
  const counterEl = btnContainer.parentElement.querySelector('.count');
  const counter = parseInt(counterEl.textContent, 10) || 1;
  if (btnContainer.classList.contains('up')) {
    counterEl.textContent = counter + 1;
  } else {
    counterEl.textContent = (counter > 1) ? counter - 1 : 1;
  }
}

async function generateCartToken() {
  await loadScript('../../scripts/buy-button-storefront.min.js');
  // Initialize the Shopify Buy SDK client
  // eslint-disable-next-line no-undef
  /* const client = ShopifyBuy.buildClient({
    domain: 'shop.moleculardevices.com',
    storefrontAccessToken: 'your-storefront-access-token',
  });

  // Create a new cart and generate a cart token
  client.createCart().then((cart) => {
    const cartToken = cart.token;
    console.log('Cart Token:', cartToken);
    return cartToken;
  }).catch((error) => {
    console.error('Error creating cart:', error);
  }); */
  return '0349b4fbb1e90a42598d459200f5c459';
}

async function getCartDetails() {
  return fetch('https://shop.moleculardevices.com/cart.json', {
    mode: 'no-cors',
  })
    .catch((err) => {
    // eslint-disable-next-line no-console
      console.warn('Could not get cart details.', err);
    });
}

async function setCartWidgetItemCount() {
  if (getCookie(CART_COOKIE_NAME)) {
    const details = await getCartDetails();
    const count = details.item_count;
    document.querySelector('.ordering-options .cart-widget .view-cart-count').textContent = count || 0;
  }
}

async function addToCart(event) {
  const cartCookie = getCookie(CART_COOKIE_NAME);
  const cartToken = cartCookie || await generateCartToken();
  if (!cartCookie) setCookie(CART_COOKIE_NAME, cartToken, 30);

  const el = event.target;
  const counterEl = el.closest('.variant-item-store-content').querySelector('.variant-item-store-count .count');
  const counter = parseInt(counterEl.textContent, 10) || 1;
  const itemId = el.getAttribute('id');

  fetch(`https://shop.moleculardevices.com/cart/add.js?${new URLSearchParams({
    id: itemId,
    quantity: counter,
    _: Date.now(),
  })}`, {
    mode: 'no-cors',
  })
    .catch((err) => {
    // eslint-disable-next-line no-console
      console.warn(`Could not add id ${itemId} to cart.`, err);
    });
}

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
          a({
            class: 'button primary',
            id: item.id,
            name: 'Add to cart',
          }, 'Add to cart'),
        ),
      ),
    )
  );
}

function renderItem(item, showStore) {
  if (!item) return '';

  return (
    div({ class: 'ordering-option-item', id: item.handle },
      div({ class: 'header' },
        h3({ class: 'title' }, item.title),
      ),
      div({ class: 'ordering-option-item-variants' },
        ...item.variants.map((variant) => div({ class: 'variant-item' },
          div({ class: 'title-variant' },
            p({ class: 'legend' }, variant.public_title),
          ),
          div({ class: 'sku-variant' },
            p({ class: 'legend' }, `#${variant.sku}`),
          ),
          (showStore) ? renderAddToCart(variant) : '',
        ),
        ),
      ),
    )
  );
}

async function renderCartWidget(container) {
  container.append(
    div({ class: 'cart-widget' },
      span({ class: 'view-cart-count' }, 0),
      i({ class: 'fa fa-shopping-cart' }),
      a({
        href: 'https://shop.moleculardevices.com/cart',
        target: '_blank',
        name: 'View Cart',
        rel: 'noopener noreferrer',
      }),
    ),
  );
  setCartWidgetItemCount();
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
  const showStore = (getCookie('country_code') === 'US') || true;
  const items = [];
  options.forEach((option) => {
    items.push(renderItem(option, showStore));
  });

  block.innerHTML = '';

  const container = div({ class: 'ordering-options-list' });
  container.append(...items);
  block.append(container);

  if (showStore) {
    block.classList.add('cart-store');
    renderCartWidget(block);

    const counterButtons = document.querySelectorAll('.ordering-options .variant-item-store-count > span > i');
    [...counterButtons].forEach((counterButton) => {
      counterButton.addEventListener('click', (e) => {
        updateCounter(e);
      });
    });

    const addToCartButtons = document.querySelectorAll('.ordering-options .variant-item-store-add-to-cart > a');
    [...addToCartButtons].forEach((addToCartButton) => {
      addToCartButton.addEventListener('click', (e) => {
        addToCart(e);
      });
    });
  }
}

export default async function decorate(block) {
  renderList(block);
}
