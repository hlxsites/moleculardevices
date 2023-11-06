/* eslint-disable import/prefer-default-export */

import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import {
  a, div, i, span, img,
} from '../../scripts/dom-helpers.js';
import {
  MAX_COMPARE_ITEMS,
  getItemInformation,
  getItemPath,
  getSelectedItems,
  unselectAllComparedItems,
  unselectSpecificComparedItem,
  updateCompareButtons,
} from '../../scripts/compare-helpers.js';
import { createCompareModalInterface } from './compare-modal.js';

class CompareBanner {
  constructor(config = {}) {
    this.cssFiles = [];
    this.currentCompareItemsCount = 0;
    this.compareButtonText = 'Compare ';
    this.banner = document.querySelector('.compare-banner');
    this.selectedItemTitles = [];

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
        MAX_COMPARE_ITEMS,
      ),
      span(
        { class: 'btn_bdr' },
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

    compareButton.addEventListener('click', async () => {
      this.selectedItemTitles = getSelectedItems();
      const compareItemInfos = this.selectedItemTitles.map((title) => getItemInformation(title));

      const compareModalInterface = await createCompareModalInterface(
        this, compareItemInfos,
      );

      const main = document.querySelector('main');
      main.appendChild(compareModalInterface.render());
      compareModalInterface.showModal();
    });

    closeButton.addEventListener('click', () => {
      unselectAllComparedItems();
      updateCompareButtons([]);
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

  refreshBanner() {
    this.selectedItemTitles = getSelectedItems();
    const numSelectedItems = this.selectedItemTitles.length;
    if (numSelectedItems === 0) {
      this.hideBanner();
      return;
    }
    this.banner.querySelector('.compare-count').innerHTML = numSelectedItems;

    // get first compare cell
    const compareCell = this.banner.querySelectorAll('.compare-cell')[0];
    const cellRow = compareCell.querySelector('.compare-row');
    cellRow.innerHTML = '';

    this.selectedItemTitles.forEach((title) => {
      const closeButton = a(
        { class: 'close greenstrip_close' },
        img(
          { src: '/images/close.png' },
        ),
      );

      closeButton.addEventListener('click', () => {
        unselectSpecificComparedItem(getItemPath(title));
        this.refreshBanner();
      });

      const compareCellItem = div(
        { class: 'compare-cell' },
        div(
          { class: 'compare-data', 'data-title': title },
          title,
          closeButton,
        ),
      );
      cellRow.appendChild(compareCellItem);
    });

    this.showBanner();
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

  async loadCSSFiles() {
    let defaultCSSPromise = Promise.resolve();
    if (Array.isArray(this.cssFiles) && this.cssFiles.length > 0) {
      defaultCSSPromise = Promise.all(this.cssFiles.map(loadCSS));
    }
    return defaultCSSPromise;
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
