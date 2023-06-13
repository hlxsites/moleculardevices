/* eslint-disable no-unused-expressions */
/* eslint-disable import/prefer-default-export */

import { loadCSS } from '../../scripts/lib-franklin.js';
import { div } from '../../scripts/dom-helpers.js';

class CompareModal {
  constructor(config = {}) {
    this.cssFiles = [];
    this.compareItemsCount = 0;
    this.compareItemsMetadata = [];

    // Apply overwrites
    Object.assign(this, config);

    this.cssFiles.push('/blocks/compare-products/compare-products.css');
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    const compareModal = div(
      { class: 'compare-modal' },
    );

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
 * @param {Object}  item     required - rendered item in JSON
 * @param {Object}  config   optional - config object for
 * customizing the rendering and behaviour
 */
export async function createCompareModal(config) {
  const card = new CompareModal(config);
  await card.loadCSSFiles();
  return card;
}
