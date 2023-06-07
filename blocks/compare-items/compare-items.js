/* eslint-disable no-unused-expressions */
/* eslint-disable import/prefer-default-export */

import { loadCSS } from '../../scripts/lib-franklin.js';
import { createCompareBanner } from './compare-banner.js';

class CompareProducts {
  constructor(config = {}) {
    this.cssFiles = [];
    this.currentCompareItemsCount = 0;
    this.maxCompareItemsCount = 3;
    this.banner = null;
    this.modal = null;
    this.items = [];

    // Apply overwrites
    Object.assign(this, config);

    this.cssFiles.push('/blocks/compare-items/compare-items.css');
  }

  isFull() {
    return this.currentCompareItemsCount === this.maxCompareItemsCount;
  }

  isEmpty() {
    return this.currentCompareItemsCount === 0;
  }

  showItemCountWarning() {
    // eslint-disable-next-line no-alert
    window.alert(`You can only select up to ${this.maxCompareItemsCount} Products.`);
  }

  hasItem(name) {
    return this.items.some((item) => item.name === name);
  }

  addItem(url, name) {
    if (this.hasItem(name)) {
      return;
    }

    this.items.push({
      url,
      name,
    });

    this.currentCompareItemsCount = this.items.length;
    this.banner.addItemName(name);
  }

  removeItem(name) {
    this.items = this.items.filter((item) => item.name !== name);
    this.currentCompareItemsCount = this.items.length;
    this.banner.removeItemName(name);
  }

  async createBanner() {
    const banner = await createCompareBanner({
      currentCompareItemsCount: this.currentCompareItemsCount,
      maxCompareItemsCount: this.maxCompareItemsCount,
    });
    this.banner = banner;
    return banner;
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
 * @returns {Object} compareProducts
 */
export default async function createCompareProducts(config) {
  const compareProducts = new CompareProducts(config);
  await compareProducts.loadCSSFiles();
  return compareProducts;
}
