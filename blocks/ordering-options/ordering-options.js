import {
  div, h3, h4, p,
} from '../../scripts/dom-helpers.js';

function renderItem(item) {
  if (!item) return;

  // eslint-disable-next-line consistent-return
  return (
    div({ class: 'ordering-option-item', id: item.handle },
      div({ class: 'header' },
        h3({ class: 'title' }, item.title),
      ),
      div({ class: 'ordering-option-item-variants' },
        ...item.variants.map((variant) => div({ class: 'variant-item' },
          h4({ class: 'legend' }, variant.public_title),
          p({ class: 'legend' }, `#${variant.sku}`),
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
    .reduce((a, b) => a.concat(b), []);

  const options = new Array(refs.length);
  await Promise.all(refs
    .map((option, idx) => fetchOptionIntoArray(options, idx, option)),
  );
  return options;
}

async function renderList(block) {
  const options = await getOrderingOptions(block);
  const items = [];
  options.forEach((option) => {
    items.push(renderItem(option));
  });

  block.innerHTML = '';
  const container = div({ class: 'ordering-options-list' });
  container.append(...items);
  block.append(container);
}

export default async function decorate(block) {
  renderList(block);
}
