/* eslint-disable no-unused-expressions */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-alert */

import {
  decorateIcons, loadCSS, createOptimizedPicture, fetchPlaceholders, toCamelCase,
} from '../../scripts/lib-franklin.js';
// eslint-disable-next-line import/no-cycle
import { formatDateUTCSeconds, isGatedResource, summariseDescription } from '../../scripts/scripts.js';
import {
  a, div, h3, p, i, span,
} from '../../scripts/dom-helpers.js';
import { createCompareBannerInterface } from '../../templates/compare-items/compare-banner.js';
import {
  MAX_COMPARE_ITEMS,
  getTitleFromNode,
  getSelectedItems,
  updateCompareButtons,
} from '../../scripts/compare-helpers.js';

let placeholders = {};

export async function handleCompareProducts(e) {
  const { target } = e;
  const clickedItemTitle = getTitleFromNode(target);
  const selectedItemTitles = getSelectedItems();

  // get or create compare banner
  const compareBannerInterface = await createCompareBannerInterface({
    currentCompareItemsCount: selectedItemTitles.length,
  });

  compareBannerInterface.getOrRenderBanner();

  if (selectedItemTitles.includes(clickedItemTitle)) {
    const deleteIndex = selectedItemTitles.indexOf(clickedItemTitle);
    if (deleteIndex !== -1) {
      selectedItemTitles.splice(deleteIndex, 1);
    }
  } else if (selectedItemTitles.length >= MAX_COMPARE_ITEMS) {
    alert(`You can only select up to ${MAX_COMPARE_ITEMS} products.`);
    return;
  } else {
    selectedItemTitles.push(clickedItemTitle);
  }

  updateCompareButtons(selectedItemTitles);
  compareBannerInterface.refreshBanner();
}

class Card {
  constructor(config = {}) {
    this.cssFiles = [];
    this.defaultStyling = true;
    this.defaultImage = '/images/default-card-thumbnail.webp';
    this.defaultButtonText = 'Read More';
    this.useDefaultButtonText = false;
    this.showImageThumbnail = true;
    this.imageBlockReady = false;
    this.thumbnailLink = true;
    this.titleLink = true;
    this.descriptionLength = 75;
    this.c2aLinkStyle = false;
    this.c2aLinkConfig = false;
    this.c2aLinkIconFull = false;
    this.showDate = false;
    this.showCategory = false;
    this.hideDescription = false;
    this.isRequestQuoteCard = false;
    this.isShopifyCard = false;

    // Apply overwrites
    Object.assign(this, config);

    if (this.defaultStyling) {
      this.cssFiles.push('/blocks/card/card.css');
    }

    if (this.isShopifyCard) {
      this.defaultButtonText = 'Order';
    }

    if (this.isRequestQuoteCard) {
      this.defaultButtonText = 'Request Quote';
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

    /* default button */
    let cardLink = this.isRequestQuoteCard ? `/quote-request?pid=${item.familyID}` : item.path;
    if (isGatedResource(item)) {
      cardLink = item.gatedURL;
    } else if (this.isShopifyCard && item.shopifyUrl) {
      cardLink = item.shopifyUrl;
    } else if (item.redirectPath && item.redirectPath !== '0') {
      cardLink = item.redirectPath;
    }

    const buttonText = !this.useDefaultButtonText && item.cardC2A && item.cardC2A !== '0'
      ? item.cardC2A : this.defaultButtonText;
    let c2aLinkBlock = a({ href: cardLink, 'aria-label': buttonText, class: 'button primary' }, buttonText);
    if (this.c2aLinkConfig) {
      c2aLinkBlock = a(this.c2aLinkConfig, buttonText);
    }
    if (this.c2aLinkStyle) {
      c2aLinkBlock.classList.remove('button', 'primary');
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

    if (item.specifications && item.specifications !== '0') {
      c2aBlock.append(div({ class: 'compare-button' },
        `${placeholders.compare || 'Compare'} (`,
        span({ class: 'compare-count' }, '0'),
        ')',
        span({
          class: 'compare-checkbox',
          onclick: handleCompareProducts,
          'data-identifier': item.identifier,
          'data-title': cardTitle,
          'data-path': cardLink,
          'data-thumbnail': itemImage,
          'data-specifications': item.specifications,
          'data-familyID': item.familyID,
        }),
      ));
    }

    /* hide description */
    let cardDescription = '';
    if ((this.isRequestQuoteCard || this.isShopifyCard) && item.cardDescription) {
      cardDescription = item.cardDescription;
    } else if (item.cardDescription && item.cardDescription !== '0' && !this.hideDescription) {
      cardDescription = summariseDescription(item.cardDescription, this.descriptionLength);
    } else if (item.description && item.description !== '0' && !this.hideDescription) {
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
        this.showCategory ? span({ class: 'card-category' }, item.subCategory && item.subCategory !== '0' ? item.subCategory : item.category) : '',
        div({ class: 'card-caption' },
          item.displayType ? div({ class: 'card-type' }, item.displayType) : '',
          this.showDate ? div({ class: 'card-date' }, formatDateUTCSeconds(item.date)) : '',
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
    let defaultCSSPromise = Promise.resolve();
    if (Array.isArray(this.cssFiles) && this.cssFiles.length > 0) {
      defaultCSSPromise = Promise.all(this.cssFiles.map(loadCSS));
    }
    return defaultCSSPromise;
  }
}

/**
 * Create and render default card.
 * @param {Object}  item     required - rendered item in JSON
 * @param {Object}  config   optional - config object for
 * customizing the rendering and behaviour
 */
export async function createCard(config = {}) {
  placeholders = await fetchPlaceholders();

  config.defaultButtonText = config.defaultButtonText
    ? (placeholders[toCamelCase(config.defaultButtonText)] || config.defaultButtonText)
    : placeholders.readMore;
  const card = new Card(config);
  await card.loadCSSFiles();
  return card;
}
