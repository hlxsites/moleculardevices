import {
  domEl, div, span, a, p,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const specURLs = [...block.querySelectorAll('a')].map((link) => link.href);
  const attributes = [
    ...block.querySelectorAll('.product-comparison > div:last-child > div:last-child > p'),
  ].map((attrP) => attrP.textContent.trim());

  block.innerHTML = '';
  const productSpecs = {};
  await Promise.all(
    specURLs.map(async (url) => {
      const response = await fetch(url);
      const specData = await response.json();
      specData[':names'].forEach((group) => {
        specData[group].data.forEach((item) => {
          if (!productSpecs[item.identifier]) {
            productSpecs[item.identifier] = {};
          }
          productSpecs[item.identifier] = { ...productSpecs[item.identifier], ...item };
        });
      });
      return specData;
    }),
  );

  const attributeMapping = productSpecs.Identifier;
  delete productSpecs.Identifier;

  let productIdentifiers;
  if (specURLs.length === 1) {
    const spc = new Map(Object.entries(productSpecs));
    productIdentifiers = Array.from(spc.keys());
  } else {
    productIdentifiers = specURLs
      .map((url) => {
        const urlName = url.split('/').pop().replace('.json', '');
        const match = Object.entries(productSpecs)
          .find(([, spec]) => spec.path?.includes(urlName));
        return match?.[0];
      })
      .filter(Boolean);
  }

  // render table head
  const headRow = domEl('tr', domEl('th', ''));
  headRow.querySelector('th').style.background = 'transparent';
  let maxHeight = 0;
  productIdentifiers.forEach((productIdentifier) => {
    const productSpec = productSpecs[productIdentifier];

    const productPathName = productSpec.path.split('#')[0];
    const cmPathName = window.location.pathname;

    headRow.append(
      domEl(
        'th',
        div(
          { class: 'product-heading' },
          div({ class: 'product-heading-title darkgrey' }, productSpec.title),
          productPathName === cmPathName
            ? a({ href: productSpec.path }, createOptimizedPicture(productSpec.thumbnail))
            : createOptimizedPicture(productSpec.thumbnail),

          productSpec.description ? p(productSpec.description) : '',
          productPathName === cmPathName
            ? ''
            : a({ href: productSpec.path, class: 'product-info-btn' }, 'PRODUCT INFO'),
        ),
      ),
    );
    if (productSpec.description) {
      const pElem = headRow.querySelector('p').cloneNode(true);
      pElem.style.visibility = 'hidden';
      pElem.innerText = productSpec.description;
      document.body.appendChild(pElem);
      if (pElem.offsetHeight > maxHeight) {
        maxHeight = pElem.offsetHeight;
      }
      document.body.removeChild(pElem);
    }
  });

  // render table body
  const tBodyBlock = domEl('tbody');
  attributes.forEach((attribute) => {
    const thisRow = domEl('tr');
    thisRow.append(domEl('td', attributeMapping[attribute]));
    productIdentifiers.forEach((productIdentifier) => {
      let rowValue = productSpecs[productIdentifier][attribute] || '';
      rowValue = rowValue.replace(
        /true/gi,
        '<img src="/images/check-icon.png" alt="true" width="30" height="30">',
      );
      rowValue = rowValue.replace(
        /false/gi,
        '<img src="/images/false-icon.png" alt="false" width="30" height="30">',
      );
      if (!rowValue) {
        rowValue = '<img src="/images/false-icon.png" alt="false" width="30" height="30">';
      }
      const rowBlock = span();
      rowBlock.innerHTML = rowValue;
      thisRow.append(domEl('td', rowBlock));
    });
    tBodyBlock.append(thisRow);
  });

  const tHeadBlock = domEl('thead', { class: 'table-head' }, headRow);
  block.append(
    div(
      { class: 'table-container' },
      domEl('table', { class: 'responsive-table' }, tHeadBlock, tBodyBlock),
    ),
  );

  block.querySelectorAll('.product-comparison .product-heading p').forEach((paragraph) => {
    paragraph.style.minHeight = `${5.3 * maxHeight - 6}px`;
  });

  return block;
}
