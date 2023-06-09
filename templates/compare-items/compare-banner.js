/* eslint-disable import/prefer-default-export */

import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import {
  a, div, i, span, img,
} from '../../scripts/dom-helpers.js';
import { unselectAllComparedItems, updateCompareButtons } from '../../blocks/card/card.js';

class CompareBanner {
  constructor(config = {}) {
    this.cssFiles = [];
    this.currentCompareItemsCount = 0;
    this.maxCompareItemsCount = 3;
    this.compareButtonText = 'Compare ';
    this.banner = document.querySelector('.compare-banner');

    // Apply overwrites
    Object.assign(this, config);

    this.cssFiles.push('/templates/compare-items/compare-items.css');
  }

  render() {
    const compareButton = a(
      { class: 'gradiant-blue-btn btn compare-toggle' },
      this.compareButtonText,
      span(
        { class: 'compare-count' },
        this.currentCompareItemsCount,
      ),
      '/',
      span(
        { class: 'compare-total-count' },
        this.maxCompareItemsCount,
      ),
    );

    const closeButton = a(
      { class: 'gradiant-blue-btn btn compare-close' },
      i(
        { class: 'fa fa-close' },
      ),
    );

    const compareBanner = div(
      { class: 'compare-banner' },
      div(
        { class: 'container' },
        div(
          { class: 'compare-row' },
          div(
            { class: 'compare-cell' },
            div(
              { class: 'compare-row' },
            ),
          ),
          div(
            { class: 'compare-cell button' },
            div(
              { class: 'compare-data' },
              compareButton,
              closeButton,
            ),
          ),
        ),
      ),
    );

    closeButton.addEventListener('click', () => {
      const selectedItemPaths = unselectAllComparedItems();
      updateCompareButtons(selectedItemPaths, 0);
      this.removeAllItems();
      this.hideBanner();
    });

    decorateIcons(compareBanner);

    this.banner = compareBanner;
    return compareBanner;
  }

  showBanner() {
    this.banner.classList.add('show');
  }

  hideBanner() {
    this.banner.classList.remove('show');
  }

  getOrRenderBanner() {
    let banner = document.querySelector('.compare-banner');
    if (!banner) {
      banner = this.render();

      const main = document.querySelector('main');
      main.append(banner);
    }

    return banner;
  }

  addItem(itemPath, itemName) {
    this.currentCompareItemsCount += 1;
    this.banner.querySelector('.compare-count').innerHTML = this.currentCompareItemsCount;

    // get first compare cell
    const compareCell = this.banner.querySelectorAll('.compare-cell')[0];
    const cellRow = compareCell.querySelector('.compare-row');

    const closeButton = a(
      { class: 'close greenstrip_close' },
      img(
        { src: '/images/close.png' },
      ),
    );

    const compareCellItem = div(
      { class: 'compare-cell' },
      div(
        { class: 'compare-data', 'data-name': itemName, 'data-path': itemPath },
        itemName,
        closeButton,
      ),
    );

    cellRow.appendChild(compareCellItem);
  }

  removeItem(itemPath) {
    this.currentCompareItemsCount -= 1;
    this.banner.querySelector('.compare-count').innerHTML = this.currentCompareItemsCount;

    // remove compare-cell that contains compare-data with path itemPath
    const compareCell = this.banner.querySelectorAll('.compare-cell')[0];
    const cellRow = compareCell.querySelector('.compare-row');
    const compareCellItem = cellRow.querySelector(`.compare-data[data-path="${itemPath}"]`).parentNode;
    cellRow.removeChild(compareCellItem);
  }

  removeAllItems() {
    this.currentCompareItemsCount = 0;
    this.banner.querySelector('.compare-count').innerHTML = this.currentCompareItemsCount;

    // remove all compare-cell that contains compare-data
    const compareCell = this.banner.querySelectorAll('.compare-cell')[0];
    const cellRow = compareCell.querySelector('.compare-row');
    const compareCellItems = cellRow.querySelectorAll('.compare-data');
    compareCellItems.forEach((compareCellItem) => {
      cellRow.removeChild(compareCellItem.parentNode);
    });
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
    // eslint-disable-next-line no-unused-expressions
    this.cssFiles && (await defaultCSSPromise);
  }
}

/**
 * Create an instance of the CompareBanner class
 * @param {Object}  config   optional - config object for
 * customizing the rendering and behaviour
 */
export async function createCompareBannerInterface(config) {
  const banner = new CompareBanner(config);
  await banner.loadCSSFiles();
  return banner;
}
