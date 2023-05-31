import {
  a, div, domEl, h3, i, p, span,
} from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

function decorateDownloadButton() {
  const specsAnnotationBlock = document.querySelector('.section[aria-labelledby="specifications-options"] .default-content-wrapper:last-child');
  const downloadHeading = specsAnnotationBlock?.querySelector('h3');
  if (downloadHeading) {
    const downloadHeadingLink = downloadHeading.querySelector('a');
    const downloadImage = specsAnnotationBlock.querySelector('picture');
    if (downloadImage) {
      const downloadImageP = downloadImage.parentNode;
      downloadHeadingLink.insertBefore(downloadImage, downloadHeadingLink.firstChild);
      specsAnnotationBlock.removeChild(downloadImageP);
    }
    downloadHeading.classList.add('download-button');
  }
}

export default async function decorate(block) {
  decorateDownloadButton();

  const jsonFileBlock = block.querySelector('a');
  const jsonFile = jsonFileBlock?.href;
  block.innerHTML = '';
  if (!jsonFile) {
    return block;
  }
  const familyId = getMetadata('family-id');
  const response = await fetch(jsonFile);
  const specData = await response.json();
  let categories = [];
  // render table head
  const headRow = domEl('tr',
    domEl('th', ''),
  );
  specData.product?.data?.forEach((product, idx) => {
    if (idx === 0) {
      categories = product.categories?.split(',');
    }
    headRow.append(domEl('th',
      div({ class: 'product-heading' },
        p(product.title),
        a({ href: `/quote-request?pid=${familyId}` },
          'Request a Quote',
          i({ class: 'fa fa-chevron-circle-right' }),
        ),
      ),
    ));
  });

  // render table body
  const tBodyBlock = domEl('tbody');
  categories.forEach((dataName) => {
    const groupData = specData[dataName];
    const attrs = Object.keys(groupData.data[0] || {});
    attrs.forEach((attr) => {
      if (attr === 'path') {
        return;
      }
      const thisRow = domEl('tr');
      if (attr === 'Name') {
        thisRow.append(domEl('td',
          h3(groupData.data[0].Name)),
        );
      } else {
        thisRow.append(domEl('td', attr));
        groupData.data.forEach((item) => {
          let rowValue = item[attr];
          rowValue = rowValue.replace(/true/gi, '<img src="/images/check-icon.png" alt="true" width="30" height="30">');
          rowValue = rowValue.replace(/false/gi, '<img src="/images/false-icon.png" alt="false" width="30" height="30">');
          const rowBlock = span();
          rowBlock.innerHTML = rowValue;
          thisRow.append(domEl('td', rowBlock));
        });
      }
      tBodyBlock.append(thisRow);
    });
  });

  const tHeadBlock = domEl('thead', { class: 'table-head' }, headRow,
  );
  block.append(div({ class: 'table-container' },
    domEl('table', { class: 'responsive-table' }, tHeadBlock, tBodyBlock),
  ));

  return block;
}
