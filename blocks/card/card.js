/* eslint-disable no-unused-expressions */
/* eslint-disable import/prefer-default-export */

import { decorateIcons, loadCSS, createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { summariseDescription } from '../../scripts/scripts.js';
import {
  a, div, h3, p, i, span,
} from '../../scripts/dom-helpers.js';

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

    const buttonText = item.cardC2A && item.cardC2A !== '0' ? item.cardC2A : this.defaultButtonText;
    let c2aBlock = a({ href: item.path, 'aria-label': buttonText, class: 'button primary' }, buttonText);
    if (this.c2aLinkConfig) {
      c2aBlock = a(this.c2aLinkConfig, buttonText);
    }
    if (this.c2aLinkStyle) {
      c2aBlock = a({ href: item.path, 'aria-label': buttonText }, buttonText);
      c2aBlock.append(
        this.c2aLinkIconFull
          ? i({ class: 'fa fa-chevron-circle-right', 'aria-hidden': true })
          : span({ class: 'icon icon-chevron-right-outline', 'aria-hidden': true }),
      );
      decorateIcons(c2aBlock);
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
          this.thumbnailLink ? a({ href: item.path },
            thumbnailBlock,
          ) : thumbnailBlock,
        ) : '',
        item.badgeText ? div({ class: 'badge' }, item.badgeText) : '',
        div({ class: 'card-caption' },
          item.type ? div({ class: 'card-type' }, item.type) : '',
          h3(
            this.titleLink ? a({ href: item.path }, cardTitle) : cardTitle,
          ),
          cardDescription ? p({ class: 'card-description' }, cardDescription) : '',
          p({ class: 'button-container' },
            c2aBlock,
          ),
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
