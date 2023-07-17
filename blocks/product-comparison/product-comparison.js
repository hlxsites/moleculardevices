import {
  domEl, div, span, a, p,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const specURLs = [...block.querySelectorAll('a')].map((link) => link.href);
  const attributes = [...block.querySelectorAll('.product-comparison > div:last-child > div:last-child > p')]
    .map((attrP) => attrP.textContent.trim().toLowerCase());

  block.innerHTML = '';
  const productSpecs = {};
  await Promise.all(specURLs.map(async (url) => {
    const response = await fetch(url);
    const specData = await response.json();
    specData[':names'].forEach(((group) => {
      specData[group].data.forEach((item) => {
        if (!productSpecs[item.path]) {
          productSpecs[item.path] = {};
        }
        productSpecs[item.path] = { ...productSpecs[item.path], ...item };
      });
    }));
    return specData;
  }));

  const productPaths = Object.keys(productSpecs);
  productPaths.forEach((productPath) => {
    productSpecs[productPath] = Object.entries(
      productSpecs[productPath],
    ).reduce((acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    }, {});
  });

  // render table head
  const headRow = domEl('tr',
    domEl('th', ''),
  );
  productPaths.forEach((productPath) => {
    const productSpec = productSpecs[productPath];
    headRow.append(domEl('th',
      div({ class: 'product-heading' },
        div({ class: 'product-heading-title darkgrey' }, productSpec.title),
        createOptimizedPicture(productSpec.thumbnail),
        p(productSpec.description),
        a({ href: productPath, class: 'product-info-btn' }, 'PRODUCT INFO'),
      )),
    );
  });

  // render table body
  const tBodyBlock = domEl('tbody');
  attributes.forEach((attribute) => {
    const thisRow = domEl('tr');
    thisRow.append(domEl('td', { class: 'fixed' }, attribute));
    productPaths.forEach((productPath) => {
      let rowValue = productSpecs[productPath][attribute] || '';
      rowValue = rowValue.replace(/true/gi, '<img src="/images/check-icon.png" alt="true" width="30" height="30">');
      rowValue = rowValue.replace(/false/gi, '<img src="/images/false-icon.png" alt="false" width="30" height="30">');
      if (!rowValue) rowValue = '<img src="/images/false-icon.png" alt="false" width="30" height="30">';
      const rowBlock = span();
      rowBlock.innerHTML = rowValue;
      thisRow.append(domEl('td', rowBlock));
    });
    tBodyBlock.append(thisRow);
  });

  const tHeadBlock = domEl('thead', { class: 'table-head' }, headRow,
  );
  block.append(div({ class: 'table-container' },
    domEl('table', { class: 'responsive-table' }, tHeadBlock, tBodyBlock),
  ));

  return block;
}
