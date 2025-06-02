import { detectStore, getCartItemCount, setCookie } from '../../scripts/scripts.js';
import { loadUserData } from '../../scripts/delayed.js';
import {
  a, button, div, domEl, h3, i, img, input, label, p, span,
} from '../../scripts/dom-helpers.js';
import { toClassName } from '../../scripts/lib-franklin.js';

const SHOP_BASE_URL = 'https://shop.moleculardevices.com';
const COOKIE_NAME_CART_ITEM_COUNT = 'cart-item-count';
const STORE_HIDDEN_CLASS = 'store-hidden';

function increaseAndDecreaseCounter(event) {
  const btnContainer = event.target.closest('span');
  const counterEl = btnContainer.parentElement.querySelector('.count');
  const counter = parseInt(counterEl.textContent, 10) || 1;
  if (btnContainer.classList.contains('up')) {
    counterEl.textContent = counter + 1;
  } else {
    counterEl.textContent = (counter > 1) ? counter - 1 : 1;
  }
}

async function getCartDetails() {
  return new Promise((resolve) => {
    const script = domEl('script',
      {
        src: `${SHOP_BASE_URL}/cart.json?callback=cartDetails`,
      },
    );

    /* eslint-disable dot-notation */
    window['cartDetails'] = (data) => {
      document.getElementsByTagName('head')[0].removeChild(script);
      delete window['cartDetails'];
      setCookie(COOKIE_NAME_CART_ITEM_COUNT, data.item_count || 0);
      resolve(data);
    };
    /* eslint-enable dot-notation */

    document.getElementsByTagName('head')[0].appendChild(script);
  });
}

async function updateCounters(counter) {
  await getCartDetails();
  let count = getCartItemCount();
  if (count === '0') {
    count = counter;
  }
  const cartCounters = document.querySelectorAll('.cart-count');
  if (cartCounters.length > 0) {
    cartCounters.forEach((cartCounter) => {
      cartCounter.textContent = count;
    });
  }
}

function createSpinner() {
  const spinner = (
    div({ class: 'spinner-container' },
      img({
        class: 'spinner',
        src: '/images/ajax-common-loader-gray.gif',
        alt: 'Image loading...',
        height: '42',
        width: '42',
      }),
    )
  );
  return spinner;
}

async function loadShopScript(src) {
  const script = document.createElement('script');
  script.src = src;

  return new Promise((resolve) => {
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

function showSuccessMessage(btn, timer) {
  const cartWidget = document.querySelector('.cart-widget');
  const successClass = 'add-to-cart-success';

  cartWidget.classList.add('open');
  btn.classList.add(successClass);

  setTimeout(() => {
    cartWidget.classList.remove('open');
    btn.classList.remove(successClass);
  }, timer);
}

async function addToCart(btn, el, counterEl) {
  const timer = 1500;
  const spinner = createSpinner();
  document.body.appendChild(spinner);

  const counter = parseInt(counterEl.textContent || counterEl.value, 10) || 1;
  const itemId = el.id || el.getAttribute('id');

  const src = `${SHOP_BASE_URL}/cart/add.js?${new URLSearchParams({
    id: itemId,
    quantity: counter,
    _: Date.now(),
    callback: 'addToCart',
  })}`;

  const script = document.querySelector(`script[src="${src}"]`);

  setTimeout(() => {
    loadShopScript(src, timer);
  }, timer);

  setTimeout(() => {
    updateCounters(counter);
    spinner.remove();
    showSuccessMessage(btn, timer);

    if (script) {
      script.remove();
    }
  }, 2000);
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

function renderItem(item, itemDescriptionsMap) {
  if (!item) return '';
  return (
    div({ class: 'ordering-option-item', id: `${item.handle}-option-item` },
      div({ class: 'header' },
        h3({ class: 'title', id: toClassName(item.title) }, item.title),
      ),
      div({ class: 'ordering-option-item-variants' },
        ...item.variants.map((variant) => (
          div({ class: 'variant-item' },
            div({ class: 'title-variant' },
              p({ class: 'legend' }, variant.public_title || variant.name),
              div({ class: 'specs' },
                itemDescriptionsMap.get(`#${variant.sku}`) || '',
              ),
            ),
            div({ class: 'sku-variant' },
              p({ class: 'legend' }, `#${variant.sku}`),
            ),
            renderAddToCart(variant),
          )
        )),
      ),
    )
  );
}

function renderCartWidget(showStore) {
  // cart visible everywhere in product page
  const productsMain = document.querySelector('.product main');
  if (!productsMain) return;
  let cartWidget = productsMain.querySelector('.cart-widget');
  if (showStore && !cartWidget) {
    cartWidget = (
      div({ class: 'cart-widget', onclick: (e) => { e.target.closest('.cart-widget').classList.toggle('open'); } },
        span({ class: 'cart-count' }, getCartItemCount()),
        i({ class: 'fa fa-shopping-cart' }),
        a({
          class: 'view-cart-link',
          href: `${SHOP_BASE_URL}/cart`,
          target: '_blank',
          name: 'Cart',
          rel: 'noopener noreferrer',
        }, 'View Cart'),
      )
    );
    productsMain.append(cartWidget);
  } else if (!showStore && cartWidget) {
    cartWidget.remove();
  }
}

async function fetchOption(option) {
  return fetch(`${SHOP_BASE_URL}/products/${option}.js`, {
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

async function getOrderingOptions(refs) {
  const options = new Array(refs.length);
  await Promise.all(refs
    .map((option, idx) => fetchOptionIntoArray(options, idx, option)),
  );
  return options;
}

function renderList(options, container, itemDescriptionsMap) {
  const items = [];
  options.forEach((option) => {
    items.push(renderItem(option, itemDescriptionsMap));
  });
  container.append(...items);

  const counterButtons = document.querySelectorAll('.ordering-options .variant-item-store-count > span > i');
  [...counterButtons].forEach((counterButton) => {
    counterButton.addEventListener('click', (e) => {
      increaseAndDecreaseCounter(e);
    });
  });

  const addToCartButtons = document.querySelectorAll('.ordering-options .variant-item-store-add-to-cart > a');
  [...addToCartButtons].forEach((addToCartButton) => {
    addToCartButton.addEventListener('click', (e) => {
      const el = e.target;
      const counterEl = el.closest('.variant-item-store-content').querySelector('.variant-item-store-count .count');
      addToCart(el, el, counterEl);
    });
  });
}

function buildOrderingForm(options) {
  const orderContainer = document.querySelector('.order-container');
  if (!orderContainer) return;
  let selectedOption = null;
  let selectedVariant = null;

  function closeAllDropDowns() {
    orderContainer.querySelectorAll('.drop-down.show')
      .forEach((openDropdown) => openDropdown.classList.remove('show'));
  }

  function updateVariantsDropdownLabel() {
    const variantDropDown = orderContainer.querySelector('.drop-down.variants-drop-down .drop-down-btn .drop-down-btn-text');
    if (variantDropDown) {
      variantDropDown.innerHTML = selectedVariant.title;
    }
  }

  function updatePrice(price) {
    const priceContent = orderContainer.querySelector('.price');
    priceContent.textContent = `${(price / 100).toLocaleString('en-US')}.00 USD`;
  }

  function handleVariantSelection(variant) {
    selectedVariant = variant;
    updateVariantsDropdownLabel(orderContainer);
    updatePrice(variant.price);

    closeAllDropDowns();
  }

  function checkOptionValidity() {
    const variantDropDown = orderContainer.querySelector('.drop-down.variants-drop-down');
    if (!selectedOption || !selectedOption.variants || !selectedOption.variants.length) {
      selectedVariant = { title: 'Select Variation' };
      variantDropDown.classList.add('disabled');
      updateVariantsDropdownLabel();
    } else {
      variantDropDown.classList.remove('disabled');
    }
  }

  function openDropdownMenu(event) {
    const dropDownContent = event.target
      .closest('.drop-down')
      .querySelector('.drop-down-content');

    if (dropDownContent.children.length !== 0) {
      dropDownContent.parentElement.classList.toggle('show');
    }
  }

  function handleOptionSelection(option) {
    selectedOption = option;
    const optionsDropDown = orderContainer.querySelector('.drop-down.options-drop-down');
    const optionsDropDownButton = optionsDropDown.querySelector('.drop-down-btn .drop-down-btn-text');
    optionsDropDownButton.textContent = selectedOption.title;

    checkOptionValidity();
    updatePrice(0);
    const variantsContent = orderContainer.querySelector('.drop-down.variants-drop-down .drop-down-content');
    variantsContent.replaceChildren();
    if (option.variants && option.variants.length) {
      option.variants.forEach((variant) => {
        variantsContent.appendChild(
          a({ class: 'option', id: variant.id, onclick: () => handleVariantSelection(variant) }, variant.title),
        );
      });
    }

    closeAllDropDowns();
  }

  window.addEventListener('click', (e) => {
    if (!e.target.closest('.drop-down')) {
      closeAllDropDowns();
    }
  });

  function increaseQuantity(e) {
    const qInput = e.currentTarget
      .closest('.quantity-counter')
      .querySelector('.quantity-number');

    qInput.value = parseInt(qInput.value, 10) + 1;

    qInput.dispatchEvent(new Event('change'));
  }

  function decreaseQuantity(e) {
    const qInput = e.currentTarget
      .closest('.quantity-counter')
      .querySelector('.quantity-number');

    let currentQuantity = parseInt(qInput.value, 10);
    if (currentQuantity > 1) {
      currentQuantity -= 1;
      qInput.value = currentQuantity;
    }

    qInput.dispatchEvent(new Event('change'));
  }

  function quantityChange(e) {
    const qInput = e.target;
    const currentQuantity = parseInt(qInput.value, 10);
    if (Number.isNaN(currentQuantity) || currentQuantity < 0) {
      qInput.value = 0;
    }
  }

  function heroAddToCartHandler(e) {
    const quantity = orderContainer.querySelector('.quantity-number');
    if (!parseInt(quantity.value, 10)) {
      return;
    }

    addToCart(e.target, selectedVariant, quantity);
  }

  const orderFormContainer = (
    div({ class: 'order-container-inner' },
      div({ class: 'drop-down options-drop-down' },
        button({ class: 'drop-down-btn', onclick: (e) => openDropdownMenu(e) },
          span({ class: 'drop-down-btn-text' }, 'Product Options'),
        ),
        div({ class: 'drop-down-content' },
          a({ class: 'option placeholder', onclick: () => handleOptionSelection({ title: 'Product Options' }) }, 'Product Options'),
          ...options.map((option) => a({ class: 'option', onclick: () => { handleOptionSelection(option); } }, option.title)),
        ),
      ),
      div({ class: 'drop-down variants-drop-down disabled' },
        button({ class: 'drop-down-btn', onclick: (e) => openDropdownMenu(e) },
          span({ class: 'drop-down-btn-text' }, 'Select Variation'),
        ),
        div({ class: 'drop-down-content' },
          // dynamically populated when selecting a product
        ),
      ),
      div({ class: 'price-container' },
        label({ class: 'price-label' }, 'PRICE'),
        span({ class: 'price-currency' }, '$'),
        span({ class: 'price' }, '0.00 USD'),
      ),
      div({ class: 'quantity-container' },
        label({ class: 'quantity-label' }, 'QUANTITY'),
        div({ class: 'quantity-counter' },
          button({ class: 'quantity-button', onclick: (e) => { decreaseQuantity(e); } }, '-'),
          input({
            class: 'quantity-number',
            onchange: (e) => quantityChange(e),
            type: 'text',
            value: '0',
          }),
          button({ class: 'quantity-button', onclick: (e) => { increaseQuantity(e); } }, '+'),
        ),
      ),
      button({ class: 'add-to-cart primary', onclick: (e) => { heroAddToCartHandler(e); } }, 'Add to cart'),
    )
  );
  orderContainer.appendChild(orderFormContainer);
}

function renderHeroOrder(heroBlock) {
  if (heroBlock) {
    const heroContainer = heroBlock.querySelector('.container');
    if (heroContainer) {
      const heroOrder = div({ class: 'order-container' });
      heroOrder.classList.add(STORE_HIDDEN_CLASS);
      heroContainer.appendChild(heroOrder);
      heroBlock.classList.add('order');
    }
  }
}

async function renderOptions(orderBlock, heroBlock, productRefs, itemDescriptionsMap) {
  const container = div({ class: 'ordering-options-list' });
  container.classList.add(STORE_HIDDEN_CLASS);
  orderBlock.append(container);

  renderHeroOrder(heroBlock);

  const orderingOptions = await getOrderingOptions(productRefs);
  renderList(orderingOptions, container, itemDescriptionsMap);
  const options = orderingOptions.filter((o) => !!o);

  buildOrderingForm(options);

  await updateCounters(0);
}

function showHideStoreFeature(showStore, orderBlock, heroBlock) {
  renderCartWidget(showStore);
  let heroOrder = heroBlock?.querySelector('.order-container');
  if (heroOrder && heroBlock.querySelector('img')) heroOrder = undefined;
  if (showStore) {
    orderBlock.classList.remove(STORE_HIDDEN_CLASS);
    if (heroOrder) {
      heroOrder.classList.remove(STORE_HIDDEN_CLASS);
      // hide buttons in hero and instead show option form
      if (heroBlock) {
        heroBlock.querySelectorAll('.button-container').forEach((buttonContainer) => {
          buttonContainer.remove();
        });
      }
    }
  } else {
    orderBlock.classList.add(STORE_HIDDEN_CLASS);
    if (heroOrder) heroOrder.classList.add(STORE_HIDDEN_CLASS);
  }
}

export default async function decorate(block) {
  // initiate geolocation if not available yet
  await loadUserData();
  // first table should be  | shopify-handles | comma separated values |
  const shopifyHandlesValues = block.children[0].children[1];
  const refs = shopifyHandlesValues.textContent
    .replace(' ', '')
    .split(',')
    .map((ref) => ref.trim());

  const itemDescriptionsMap = new Map();
  [...block.children].forEach((item, idx) => {
    if (!idx) return; // first line is with shopify handlers.

    const productCode = item.children[0].textContent.trim();
    const productDescription = item.children[1];
    itemDescriptionsMap.set(productCode, productDescription);
  });
  block.innerHTML = '';

  // order content in hero
  const heroBlock = document.querySelector('.hero.block');
  renderOptions(block, heroBlock, refs, itemDescriptionsMap);

  const showStore = detectStore();
  showHideStoreFeature(showStore, block, heroBlock);

  document.addEventListener('geolocationUpdated', () => {
    showHideStoreFeature(showStore, block, heroBlock);
  });
}
