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
import { unselectSpecificComparedItem } from '../../scripts/compare-helpers.js';

class Item {
  constructor(identifier, title, path, thumbnail, familyID, specifications) {
    this.identifier = identifier;
    this.title = title;
    this.path = path;
    this.thumbnail = thumbnail;
    this.familyID = familyID;
    this.specifications = specifications;
  }

  getTitle() {
    return this.title;
  }

  getPath() {
    return this.path;
  }

  getIdentifier() {
    return this.identifier;
  }

  getThumbnail() {
    return this.thumbnail;
  }

  getFamilyID() {
    return this.familyID;
  }

  getSpecs() {
    return this.specifications;
  }
}

class CompareModal {
  constructor(compareBanner, config = {}) {
    this.cssFiles = [];
    this.compareItemsMetadata = [];
    this.modal = document.querySelector('.pro-comparison-result');
    this.compareBanner = compareBanner;

    this.productSpecsBasePath = '/products/specifications';

    // Apply overwrites
    Object.assign(this, config);

    this.cssFiles.push('/templates/compare-items/compare-modal.css');
  }

  showModal() {
    this.modal.classList.add('show');
  }

  hideModal() {
    this.modal.classList.remove('show');
  }

  async fetchItemSpecifications(specificationsPath) {
    const resp = await fetch(specificationsPath);

    if (!resp.ok) {
      return null;
    }

    const json = await resp.json();
    return json;
  }

  parseSpecificationsSheet(info, json) {
    // get product index that contains the path in the key path
    const products = json.product.data;
    const productIndex = products.findIndex((row) => row.identifier === info.identifier);
    const productData = products[productIndex];

    // get all keys in the json that are in the 'categories' string inside the product data
    // this string is separated by commas.
    const specificationsObjects = Object.keys(json).filter((key) => {
      const categories = productData.categories.split(',');
      return categories.includes(key);
    });

    // create array of specifications that contains all the specs that contain
    // a path equal to the product path
    // This is required because in the same product specifications json, we can have
    // specifications for multiple similar products
    const productSpecificationsLabels = [];
    const productSpecificationsObjects = [];
    specificationsObjects.forEach((spec) => {
      const specIndex = json[spec].data.findIndex((row) => row.identifier === info.identifier);
      if (specIndex !== -1) {
        productSpecificationsLabels.push(json[spec].data[0]);
        productSpecificationsObjects.push(json[spec].data[specIndex]);
      }
    });

    // create a map with from Specification Label -> Specification Value
    // with all specifications for this product
    const reservedKeyNames = ['path', 'name', 'key', 'identifier', 'label'];
    const specifications = {};
    productSpecificationsObjects.forEach((spec, idx) => {
      Object.keys(spec).forEach((key) => {
        if (!reservedKeyNames.includes(key.toLowerCase())) {
          specifications[productSpecificationsLabels[idx][key]] = spec[key];
        }
      });
    });

    return specifications;
  }

  async createItem(info) {
    const specificationsJson = await this.fetchItemSpecifications(info.specificationsPath);
    const specifications = this.parseSpecificationsSheet(info, specificationsJson);

    return new Item(
      info.identifier,
      info.title,
      info.path,
      info.thumbnail,
      info.familyID,
      specifications,
    );
  }

  async createItems(infos) {
    // use promises to fetch all items in parallel
    const promises = [];
    infos.forEach((info) => {
      promises.push(
        this.createItem(info),
      );
    });

    const itemPromises = await Promise.all(promises);

    // filter out null items
    const items = [];
    itemPromises.forEach((item) => {
      if (item) {
        items.push(item);
      }
    });

    return items;
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

  // Stylizes the value of a specification, for example, if the value is true or false
  // it replaces by a checkmark or x. If the value contains &#8322, it replaces with <sub>2</sub>
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

  // Computes an array containing all the specifications across all items
  getAllSpecs() {
    const specs = [];
    for (let i = 0; i < this.compareItemsMetadata.length; i += 1) {
      const item = this.compareItemsMetadata[i];
      const itemSpecs = item.getSpecs();
      Object.keys(itemSpecs).forEach((key) => {
        if (!specs.includes(key)) {
          specs.push(key);
        }
      });
    }
    return specs;
  }

  // The family-id is used to redirect the user to the request quote page
  // This id lives in the product content page metadata
  async fetchFamilyId(path) {
    const resp = await fetch(`${path}`);
    if (!resp.ok) {
      return null;
    }

    // get the head meta tag with name="family-id"
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const meta = doc.querySelector('meta[name="family-id"]');
    if (!meta) {
      return null;
    }

    return meta.getAttribute('content');
  }

  createSpecificationsRows() {
    // iterate through the specifications of the first item
    // and create a row for each specification
    const rows = [];
    const specs = this.getAllSpecs();

    // iterate through the other items and get the value for the current key
    specs.forEach((specName) => {
      const values = this.getItemsSpecValues(specName);

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
            { class: 'col-xs-6 col-sm-3', 'item-title': this.compareItemsMetadata[i].getTitle() },
            div(
              { class: 'comparison-cell' },
              pElement,
            ),
          ),
        );
      }

      const parsedKey = this.parseUnconventionalCharacters(specName);
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

  removeCompareItem(title) {
    // remove all divs inside pro-comparison-result that have an attribute item-title equal to title
    const divs = document.querySelectorAll(`.pro-comparison-result div[item-title="${title}"]`);
    divs.forEach((removable) => {
      removable.remove();
    });

    // remove the item from this.compareItemsMetadata
    for (let i = 0; i < this.compareItemsMetadata.length; i += 1) {
      if (this.compareItemsMetadata[i].getTitle() === title) {
        this.compareItemsMetadata.splice(i, 1);
        break;
      }
    }
  }

  createFeaturesRow() {
    const itemColumns = [];

    // for each object of type Item inside this.compareItemsMetadata
    // create a column with the item's thumbnail, title, and link to details page
    for (let i = 0; i < this.compareItemsMetadata.length; i += 1) {
      const item = this.compareItemsMetadata[i];

      const links = div(
        { class: 'link_wrap' },
        a(
          { href: item.getPath(), class: 'linkBtn' },
          'Details',
          span({ class: 'icon icon-icon_link' }),
        ),
      );

      if (item.getFamilyID()) {
        const familyLink = a(
          { href: `/quote-request?pid=${item.getFamilyID()}`, class: 'linkBtn' },
          'Request a Quote',
          span({ class: 'icon icon-icon_link' }),
        );

        links.appendChild(familyLink);
      }

      const removeButton = img(
        { class: 'trash-icon', src: '/images/trash.png', alt: 'Remove' },
      );

      const itemColumn = div(
        { class: 'col-xs-6 col-sm-3', 'item-title': item.getTitle() },
        div(
          { class: 'comparison-cell' },
          div(
            { class: 'pro-container' },
            removeButton,
            img(
              { alt: item.getTitle(), src: item.getThumbnail(), width: '100%' },
            ),
            div(
              { class: 'pro-details' },
              h3(item.getTitle()),
            ),
            links,
          ),
        ),
      );

      removeButton.addEventListener('click', () => {
        this.removeCompareItem(item.getTitle());

        if (this.compareItemsMetadata.length === 1) {
          // eslint-disable-next-line no-alert
          window.alert('Please choose atleast two products for comparison.');
        }

        unselectSpecificComparedItem(item.getPath());
        this.compareBanner.refreshBanner();
        this.hideModal();
      });

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
        { src: '/images/close-black.png' },
      ),
    );

    const itemsComparisonTable = div(
      { class: 'comparison-table' },
      this.createFeaturesRow(),
    );

    const specificationsRows = this.createSpecificationsRows();
    specificationsRows.forEach((row) => {
      itemsComparisonTable.appendChild(row);
    });

    const printBtn = button(
      { class: 'btn btn-primary pull-right' },
      'Print',
    );

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
                printBtn,
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

    printBtn.addEventListener('click', () => {
      window.print();
    });

    this.modal = compareModal;

    closeBtn.addEventListener('click', () => {
      this.hideModal();
    });

    return compareModal;
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
 * @param {Object}  compareBanner     required - rendered compare banner
 * @param {Array}   infos              array of items to compare
 * customizing the rendering and behaviour
 */
export async function createCompareModalInterface(compareBanner, infos) {
  const modalInterface = new CompareModal(compareBanner, {});
  modalInterface.compareItemsMetadata = await modalInterface.createItems(infos);
  await modalInterface.loadCSSFiles();
  return modalInterface;
}
