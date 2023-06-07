/* eslint-disable import/prefer-default-export */

import { decorateIcons } from '../../scripts/lib-franklin.js';
import {
  a, div, i, span, img,
} from '../../scripts/dom-helpers.js';

class CompareBanner {
  constructor(config = {}) {
    this.currentCompareItemsCount = 0;
    this.maxCompareItemsCount = 3;
    this.compareButtonText = 'Compare ';
    this.banner = null;

    // Apply overwrites
    Object.assign(this, config);
  }

  render() {
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
              a(
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
              ),
              a(
                { class: 'gradiant-blue-btn btn compare-close' },
                i(
                  { class: 'fa fa-close' },
                ),
              ),
            ),
          ),
        ),
      ),
    );

    decorateIcons(compareBanner);

    this.banner = compareBanner;
    return compareBanner;
  }

  show() {
    this.banner.classList.add('show');
  }

  hide() {
    this.banner.classList.remove('show');
  }

  addItemName(itemName) {
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
        { class: 'compare-data', title: itemName },
        itemName,
        closeButton,
      ),
    );

    cellRow.appendChild(compareCellItem);
  }

  removeItemName(itemName) {
    this.currentCompareItemsCount -= 1;
    this.banner.querySelector('.compare-count').innerHTML = this.currentCompareItemsCount;

    // remove compare-cell that contains compare-data with title itemName
    const compareCell = this.banner.querySelectorAll('.compare-cell')[0];
    const cellRow = compareCell.querySelector('.compare-row');
    const compareCellItem = cellRow.querySelector(`.compare-data[title="${itemName}"]`).parentNode;
    cellRow.removeChild(compareCellItem);
  }
}

/**
 * Create and render default compare products banner.
 * @param {Object}  config   optional - config object for
 * customizing the rendering and behaviour
 */
export async function createCompareBanner(config) {
  const banner = new CompareBanner(config);
  return banner;
}
