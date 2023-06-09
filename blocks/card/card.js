/* eslint-disable no-unused-expressions */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-alert */

import { decorateIcons, loadCSS, createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { summariseDescription } from '../../scripts/scripts.js';
import {
  a, div, h3, p, i, span,
} from '../../scripts/dom-helpers.js';
import { createCompareBannerInterface } from '../../templates/compare-items/compare-banner.js';

const MAX_COMPARE_ITEMS = 3;

function getPathFromNode(item) {
  return item.getAttribute('data-path');
}

function getNameFromNode(item) {
  // gets the name from the neares h3 above the item
  return item.closest('.card-caption').querySelector('h3').textContent;
}

export function getSelectedItems() {
  return [...document.querySelectorAll('.compare-button .compare-checkbox.selected')]
    .filter((value, index, self) => index === self.findIndex((t) => (
      getPathFromNode(t) === getPathFromNode(value)
    ),
    ))
    .map((item) => getPathFromNode(item));
}

export function unselectAllComparedItems() {
  const selectedItemPaths = getSelectedItems();
  selectedItemPaths.splice(0, selectedItemPaths.length);
  return selectedItemPaths;
}

export function updateCompareButtons(selectedItemPaths, numSelectedItems) {
  // update all compare buttons
  const allCompareCheckboxes = [...document.querySelectorAll('.compare-button .compare-checkbox')];
  allCompareCheckboxes.forEach((item) => {
    const buttonParent = item.parentNode;
    item.classList.remove('selected');
    buttonParent.querySelector('.compare-count').innerHTML = '0';
    const currentProductPath = getPathFromNode(item);
    if (selectedItemPaths.includes(currentProductPath)) {
      item.classList.add('selected');
      buttonParent.querySelector('.compare-count').innerHTML = numSelectedItems;
    }
  });
}

export async function handleCompareProducts(e) {
  const { target } = e;
  const clickedItemPath = getPathFromNode(target);
  const clickedItemName = getNameFromNode(target);
  const selectedItemPaths = getSelectedItems();

  // get or create compare banner
  const compareBannerInterface = await createCompareBannerInterface({
    currentCompareItemsCount: selectedItemPaths.length,
    maxCompareItemsCount: MAX_COMPARE_ITEMS,
  });

  compareBannerInterface.getOrRenderBanner();

  if (selectedItemPaths.includes(clickedItemPath)) {
    const deleteIndex = selectedItemPaths.indexOf(clickedItemPath);
    if (deleteIndex !== -1) {
      selectedItemPaths.splice(deleteIndex, 1);
    }

    compareBannerInterface.removeItem(clickedItemPath);
    if (selectedItemPaths.length === 0) {
      compareBannerInterface.hideBanner();
    }
  } else if (selectedItemPaths.length >= MAX_COMPARE_ITEMS) {
    alert(`You can only select up to ${MAX_COMPARE_ITEMS} products.`);
    return;
  } else {
    selectedItemPaths.push(clickedItemPath);

    compareBannerInterface.addItem(clickedItemPath, clickedItemName);
    compareBannerInterface.showBanner();
  }
  const numSelectedItems = selectedItemPaths.length;

  updateCompareButtons(selectedItemPaths, numSelectedItems);
}

class Card {
  constructor(config = {}) {
    this.cssFiles = [];
    this.defaultStyling = true;
    this.defaultImage = '/images/default-card-thumbnail.webp';
    this.defaultButtonText = 'Read More';
    this.showImageThumbnail = true;
    this.imageBlockReady = false;
    this.thumbnailLink = true;
    this.titleLink = true;
    this.descriptionLength = 75;
    this.c2aLinkStyle = false;
    this.c2aLinkConfig = false;
    this.c2aLinkIconFull = false;

    // Apply overwrites
    Object.assign(this, config);

    if (this.defaultStyling) {
      this.cssFiles.push('/blocks/card/card.css');
    }
  }

  renderItem(item) {
    const cardTitle = item.h1 && item.h1 !== '0' ? item.h1 : item.title;

    let itemImage = this.defaultImage;
    if (item.thumbnail && item.thumbnail !== '0') {
      itemImage = item.thumbnail;
    } else if (item.image && item.image !== '0') {
      itemImage = item.image;
    }
    const thumbnailBlock = this.imageBlockReady
      ? item.imageBlock : createOptimizedPicture(itemImage, item.title, 'lazy', [{ width: '800' }]);

    let cardLink = item.path;
    if (item.gated === 'Yes' && item.gatedURL && item.gatedURL !== '0') {
      cardLink = item.gatedURL;
    } else if (item.redirectPath && item.redirectPath !== '0') {
      cardLink = item.redirectPath;
    }

    const buttonText = item.cardC2A && item.cardC2A !== '0' ? item.cardC2A : this.defaultButtonText;
    let c2aLinkBlock = a({ href: cardLink, 'aria-label': buttonText, class: 'button primary' }, buttonText);
    if (this.c2aLinkConfig) {
      c2aLinkBlock = a(this.c2aLinkConfig, buttonText);
    }
    if (this.c2aLinkStyle) {
      c2aLinkBlock = a({ href: cardLink, 'aria-label': buttonText }, buttonText);
      c2aLinkBlock.append(
        this.c2aLinkIconFull
          ? i({ class: 'fa fa-chevron-circle-right', 'aria-hidden': true })
          : span({ class: 'icon icon-chevron-right-outline', 'aria-hidden': true }),
      );
      decorateIcons(c2aLinkBlock);
    }

    const c2aBlock = div({ class: 'c2a' },
      p({ class: 'button-container' },
        c2aLinkBlock,
      ),
    );
    if (item.productShowInFinder && item.productShowInFinder === 'Yes') {
      c2aBlock.append(div({ class: 'compare-button' },
        'Compare (',
        span({ class: 'compare-count' }, '0'),
        ')',
        span({
          class: 'compare-checkbox',
          onclick: handleCompareProducts,
          'data-path': item.path,
        }),
      ));
    }

    let cardDescription = '';
    if (item.cardDescription && item.cardDescription !== '0') {
      cardDescription = summariseDescription(item.cardDescription, this.descriptionLength);
    } else if (item.description && item.description !== '0') {
      cardDescription = summariseDescription(item.description, this.descriptionLength);
    }

    return (
      div({ class: 'card' },
        this.showImageThumbnail ? div({ class: 'card-thumb' },
          this.thumbnailLink ? a({ href: cardLink },
            thumbnailBlock,
          ) : thumbnailBlock,
        ) : '',
        item.badgeText ? div({ class: 'badge' }, item.badgeText) : '',
        div({ class: 'card-caption' },
          item.type ? div({ class: 'card-type' }, item.type) : '',
          h3(
            this.titleLink ? a({ href: cardLink }, cardTitle) : cardTitle,
          ),
          cardDescription ? p({ class: 'card-description' }, cardDescription) : '',
          c2aBlock,
        ),
      )
    );
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
 * Create and render default card.
 * @param {Object}  item     required - rendered item in JSON
 * @param {Object}  config   optional - config object for
 * customizing the rendering and behaviour
 */
export async function createCard(config) {
  const card = new Card(config);
  await card.loadCSSFiles();
  return card;
}
