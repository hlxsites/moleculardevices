/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-expressions */
/* eslint-disable import/prefer-default-export */

import { loadCSS, decorateIcons } from '../../scripts/lib-franklin.js';
import {
  div,
  button,
  h2,
  a,
  h3,
  img,
  span,
  p,
} from '../../scripts/dom-helpers.js';

class Item {
  // create constructor that receives json object
  constructor(data = {}) {
    const productData = data.product.data[0];
    const specificationsData = data.general.data[0];
    this.productData = productData;
    this.specifications = specificationsData;

    // remove Name and path from specifications
    delete this.specifications.Name;
    delete this.specifications.path;
  }

  getTitle() {
    return this.productData.title;
  }

  getPath() {
    return this.productData.path;
  }

  getThumbnail() {
    return this.productData.thumbnail;
  }

  getSpecs() {
    return this.specifications;
  }
}

class CompareModal {
  constructor(config = {}) {
    this.cssFiles = [];
    this.compareItemsMetadata = [];
    this.modal = document.querySelector('.pro-comparison-result');

    this.productSpecsBasePath = '/products/specifications';

    // Apply overwrites
    Object.assign(this, config);

    this.cssFiles.push('/templates/compare-items/compare-modal.css');
  }

  async fetchPathData(path) {
    const productPath = path.split('/').pop();
    const resp = await fetch(`${this.productSpecsBasePath}/${productPath}.json`);

    if (resp.ok) {
      const json = await resp.json();
      return new Item(json);
    }

    return null;
  }

  async fetchMetadata(paths) {
    const metadata = [];

    // use promises to fetch all items in parallel
    const promises = paths.map((path) => this.fetchPathData(path));
    const items = await Promise.all(promises);

    // filter out null items
    items.forEach((item) => {
      if (item) {
        metadata.push(item);
      }
    });

    return metadata;
  }

  getItemsSpecValues(specName) {
    const itemsSpecValues = [];
    for (let i = 0; i < this.compareItemsMetadata.length; i += 1) {
      const item = this.compareItemsMetadata[i];
      itemsSpecValues.push(item.getSpecs()[specName]);
    }
    return itemsSpecValues;
  }

  parseUnconventionalCharacters(value) {
    // if value contains &#8322, replace with <sub>2</sub>
    if (value.includes('&#8322')) {
      return value.replace('&#8322', '<sub>2</sub>');
    }

    // if value contains &s.up2; replace with html code <sup>2</sup>
    if (value.includes('&s.up2;')) {
      return value.replace('&s.up2;', '<sup>2</sup>');
    }

    return value;
  }

  stylizeSpecValue(value) {
    // if value is true or false string then display a checkmark or x
    if (value === 'true') {
      return [img(
        {
          src: '/images/true-icon.png', alt: 'True', height: '30', width: '30',
        },
      ), true];
    }

    if (value === 'false' || value === undefined) {
      return [img(
        {
          src: '/images/false-icon.png', alt: 'False', height: '30', width: '30',
        },
      ), true];
    }

    return [this.parseUnconventionalCharacters(value), false];
  }

  specificationsRows() {
    // iterate through the specifications of the first item
    // and create a row for each specification
    const rows = [];
    const specs = this.compareItemsMetadata[0].getSpecs();

    // iterate through the other items and get the value for the current key
    Object.keys(specs).forEach((key) => {
      const values = this.getItemsSpecValues(key);

      const valueColumns = [];

      for (let i = 0; i < values.length; i += 1) {
        const [parsedValue, isImg] = this.stylizeSpecValue(values[i]);
        const pElement = p();
        if (isImg) {
          pElement.appendChild(parsedValue);
        } else {
          pElement.innerHTML = parsedValue;
        }

        valueColumns.push(
          div(
            { class: 'col-xs-6 col-sm-3' },
            div(
              { class: 'comparison-cell' },
              pElement,
            ),
          ),
        );
      }

      const parsedKey = this.parseUnconventionalCharacters(key);
      const pElement = p();
      pElement.innerHTML = parsedKey;
      const row = div(
        { class: 'row' },
        div(
          { class: 'col-xs-12 col-sm-3' },
          div(
            { class: 'comparison-cell' },
            pElement,
          ),
        ),
      );

      valueColumns.forEach((column) => {
        row.appendChild(column);
      });

      const comparisonRow = div(
        { class: 'comparison-row' },
        row,
      );

      rows.push(comparisonRow);
    });

    return rows;
  }

  featuresRow() {
    const itemColumns = [];

    // for each object of type Item inside this.compareItemsMetadata
    // create a column with the item's thumbnail, title, and link to details page
    for (let i = 0; i < this.compareItemsMetadata.length; i += 1) {
      const item = this.compareItemsMetadata[i];

      const itemColumn = div(
        { class: 'col-xs-6 col-sm-3' },
        div(
          { class: 'comparison-cell' },
          div(
            { class: 'pro-container' },
            img(
              { alt: item.getTitle(), src: item.getThumbnail(), width: '100%' },
            ),
            div(
              { class: 'pro-details' },
              h3(item.getTitle()),
            ),
            div(
              { class: 'link_wrap' },
              a(
                { href: item.getPath(), class: 'linkBtn' },
                'Details',
                span({ class: 'icon icon-icon_link' }),
              ),
              // TODO: add request quote button
            ),
          ),
        ),
      );

      decorateIcons(itemColumn);

      itemColumns.push(itemColumn);
    }

    const row = div(
      { class: 'row' },
      div(
        { class: 'col-xs-12 col-sm-3' },
        div(
          { class: 'comparison-cell title' },
          h3('Features'),
        ),
      ),
    );

    itemColumns.forEach((item) => {
      row.appendChild(item);
    });

    return div(
      { class: 'comparison-row' },
      row,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    const closeBtn = a(
      { class: 'img-ico img-ico-close emptycomparebox' },
      img(
        { src: '/images/close.png' },
      ),
    );

    const itemsComparisonTable = div(
      { class: 'comparison-table' },
      this.featuresRow(),
    );

    const specificationsRows = this.specificationsRows();
    specificationsRows.forEach((row) => {
      itemsComparisonTable.appendChild(row);
    });

    const compareModal = div(
      { class: 'pro-comparison-result popup' },
      div(
        { class: 'container' },
        div(
          { class: 'product-comparison' },
          div(
            { class: 'row' },
            div(
              { class: 'col-xs-12' },
              div(
                { class: 'section-heading text-center' },
                button(
                  { class: 'btn btn-primary pull-right' },
                  'Print',
                ),
                h2('Product Comparison'),
                closeBtn,
              ),
            ),
          ),
          div(
            { id: 'comp-table-section', class: 'scroll_div' },
            div(
              { class: 'row' },
              div(
                { class: 'col-xs-12' },
                itemsComparisonTable,
              ),
            ),
          ),
        ),
      ),
    );

    this.modal = compareModal;

    closeBtn.addEventListener('click', () => {
      this.hideBanner();
    });

    return compareModal;
  }

  showModal() {
    this.modal.classList.add('show');
  }

  hideBanner() {
    this.modal.classList.remove('show');
  }

  async loadCSSFiles() {
    let defaultCSSPromise;
    if (Array.isArray(this.cssFiles) && this.cssFiles.length > 0) {
      defaultCSSPromise = new Promise((resolve) => {
        this.cssFiles.forEach((cssFile) => {
          loadCSS(cssFile, (e) => resolve(e));
        });
      });
    }
    this.cssFiles && (await defaultCSSPromise);
  }
}

/**
 * Create and render default compare products modal.
 * @param {Object}  item     required - rendered item in JSON
 * @param {Object}  config   optional - config object for
 * customizing the rendering and behaviour
 */
export async function createCompareModalInterface(paths) {
  const modalInterface = new CompareModal();
  modalInterface.compareItemsMetadata = await modalInterface.fetchMetadata(paths);
  await modalInterface.loadCSSFiles();
  return modalInterface;
}
