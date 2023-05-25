import { domEl, div, span, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const specURLs = [...block.querySelectorAll('a')].map((a) => a.href);
  const attributesDiv = block.querySelector('.product-comparison div:last-child > div:last-child');
  block.innerHTML = '';

  const attributesText = attributesDiv.textContent;
  const attributes = attributesText.split(',').map(function(attribute) {
    return attribute.trim().toLowerCase();
  });
  console.log(specURLs)
  const productSpecs = {};
  const specDataAll = await Promise.all(specURLs.map(async (url) => {
    const response = await fetch(url);
    const specData = await response.json();

    specData[':names'].forEach((group => {
      
      specData[group].data.forEach(item => {
        if (!productSpecs[item.path]) {
          productSpecs[item.path] = {};
        }
        productSpecs[item.path] = { ...productSpecs[item.path], ...item }
      });
    }));
    return specData;
  }));
  console.log(productSpecs);

  const productPaths = Object.keys(productSpecs);

  // make all attribute keys lower case
  productPaths.forEach(productPath => {
    productSpecs[productPath] = Object.entries(productSpecs[productPath]).reduce((acc, [key, value]) => {
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
        a({ href: productPath },
          createOptimizedPicture(productSpec.thumbnail),
          productSpec.title,
        ),
      ),
    ));
  });

  // render table body
  const tBodyBlock = domEl('tbody');
  attributes.forEach((attribute) => {
    const thisRow = domEl('tr');
    thisRow.append(domEl('td', attribute));
    productPaths.forEach(productPath => {
      let rowValue = productSpecs[productPath][attribute] || '';
      rowValue = rowValue.replace(/true/gi, '<img src="/images/check-icon.png" alt="true" width="30" height="30">');
      rowValue = rowValue.replace(/false/gi, '<img src="/images/false-icon.png" alt="false" width="30" height="30">');
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