import {
  domEl, div, span, a,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const PRODUCT_SPEC_MAP = {
  'wavelength ranges': 'Wavelength ranges',
  'microplate types': 'Plate type(s)',
  'reading speed': 'Read times',
  'cuvette port': 'Cuvette port',
  'photometric accuracy (microplate/cuvette)': 'Photometric accuracy',
  shaking: 'Plate shaking',
};

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
      let rowValue = productSpecs[productPath][PRODUCT_SPEC_MAP[attribute]] || '';
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
  let moveBy = 0;
  block.append(div({ class: 'table-container' },
    domEl('table', { class: 'responsive-table' }, tHeadBlock, tBodyBlock),
    div({ class: 'scroll-container' },
      a({
        class: 'scroll-left-button',
        onclick: () => {
          moveBy -= 50;
          document.querySelectorAll('.scroll-dragger').forEach((el) => { el.style.left = `${moveBy}px`; });
          document.querySelectorAll('td:not(.fixed)').forEach((el) => { el.style.left = `${moveBy}px`; });
          document.querySelectorAll('.table-head').forEach((el) => { el.style.left = `${moveBy}px`; });
        },
      }),
      div({
        class: 'scroll-dragger',
        onmousedown: (e) => {
          e.preventDefault();
          moveBy += e.offsetX;
          e.target.style.left = moveBy;
          document.querySelectorAll('td:not(.fixed)').forEach((el) => { el.style.left = `${moveBy}px`; });
          document.querySelectorAll('.table-head').forEach((el) => { el.style.left = `${moveBy}px`; });
        },
      }),
      a({
        class: 'scroll-right-button',
        onclick: () => {
          moveBy += 50;
          document.querySelectorAll('.scroll-dragger').forEach((el) => { el.style.left = `${moveBy}px`; });
          document.querySelectorAll('td:not(.fixed)').forEach((el) => { el.style.left = `${moveBy}px`; });
          document.querySelectorAll('.table-head').forEach((el) => { el.style.left = `${moveBy}px`; });
        },
      }),
    )));

  return block;
}
