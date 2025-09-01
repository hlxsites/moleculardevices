/* eslint-disable import/no-cycle, no-unused-expressions */
import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import {
  div, img, p, span,
} from '../../scripts/dom-helpers.js';
import {
  clearAutoScroll, createDotButton, scrollToItem, appendClones,
  addNavButtons, getOptimizedThumbnailPath,
} from './carousel-utils.js';

const AUTOSCROLL_INTERVAL = 7000;
const ITEMS_TO_SCROLL = 1;

class Carousel {
  constructor(block, data, config) {
    // Set defaults
    this.cssFiles = [];
    this.defaultStyling = false;
    this.dotButtons = true;
    this.navButtons = true;
    this.counter = false;
    this.infiniteScroll = true;
    this.autoScroll = true; // only available with infinite scroll
    this.autoScrollInterval = AUTOSCROLL_INTERVAL;
    this.currentIndex = 0;
    this.counterText = '';
    this.counterNavButtons = true;
    this.cardRenderer = this;
    this.hasImageInDots = false;
    this.cardStyling = false;
    this.stepBy = ITEMS_TO_SCROLL;
    // this is primarily controlled by CSS,
    // but we need to know then intention for scrolling pourposes
    this.visibleItems = [
      { items: 1, condition: () => true },
    ];

    // Set information
    this.block = block;
    this.data = data || [...block.children];

    // Will be replaced after rendering, if available
    this.navButtonLeft = null;
    this.navButtonRight = null;

    // Apply overwrites
    Object.assign(this, config);

    if (this.getCurrentVisibleItems() >= this.data.length) {
      this.block.classList.add('fully-visible', 'three-items-visible');
    }

    if (this.defaultStyling) this.cssFiles.push('/blocks/carousel/carousel.css');
    if (this.cardStyling) this.cssFiles.push('/blocks/carousel/carousel-cards.css');
  }

  getBlockPadding() {
    if (!this.blockStyle) this.blockStyle = window.getComputedStyle(this.block);
    return +(this.blockStyle.getPropertyValue('padding-left').replace('px', ''));
  }

  getCurrentVisibleItems() {
    if (!Array.isArray(this.visibleItems) || this.visibleItems.length === 0) return 1;
    const width = window.innerWidth;
    const match = this.visibleItems.find((rule) => {
      if (typeof rule.condition === 'function') {
        const result = rule.condition(width);
        return result;
      }
      return false;
    });

    if (match) {
      return match.items;
    }

    const fallback = this.visibleItems[this.visibleItems.length - 1].items;
    return fallback;
  }

  getStep() {
    return this.getCurrentVisibleItems();
  }

  getActiveItems() {
    // :scope keeps it to direct children and avoids expensive tree scans
    return this.block.querySelectorAll(':scope > .carousel-item:not(.clone,.skip)');
  }

  updateCounterText(newIndex = this.currentIndex) {
    this.currentIndex = newIndex;
    if (this.counter) {
      const counterTextBlock = this.block.parentElement.querySelector('.carousel-counter .carousel-counter-text p');

      const dotContainer = this.block.parentElement.querySelector('.carousel-dot-buttons');
      const visibleCount = this.getCurrentVisibleItems();
      const itemsLen = this.getActiveItems().length;
      const totalPages = dotContainer
        ? dotContainer.children.length : Math.ceil(itemsLen / Math.max(visibleCount, 1));

      const pageCounter = `${Math.min(this.currentIndex + 1, totalPages)} / ${totalPages}`;
      counterTextBlock.innerHTML = this.counterText ? `${this.counterText} ${pageCounter}` : pageCounter;
    }
  }

  /**
   * Update selected states for items, dots, and counter
   */
  updateSelectedStates(newIndex, newSelectedItem, items, dotButtons) {
    // reset all
    items.forEach((item) => item.classList.remove('selected'));
    [...dotButtons].forEach((dot) => dot.classList.remove('selected'));

    // apply new
    newSelectedItem.classList.add('selected');
    if (dotButtons.length) [...dotButtons][newIndex].classList.add('selected');

    // counter text
    this.updateCounterText(newIndex);
  }

  /**
   * Handle infinite scroll illusion adjustments
   */
  adjustForInfiniteScroll(newIndex, direction, newSelectedItem, items) {
    const { block } = this;
    let targetEl = null;

    if (newIndex === 0 && direction > 0) {
      targetEl = newSelectedItem.previousElementSibling;
    } else if (newIndex === items.length - 1 && direction < 0) {
      targetEl = newSelectedItem.nextElementSibling;
    }

    if (targetEl) {
      scrollToItem(block, targetEl, this.getBlockPadding(), block.offsetLeft);
    }
  }

  /**
   * Scroll the carousel by a step (positive = next, negative = prev)
   */
  scrollByStep(direction) {
    const {
      infiniteScroll, block, navButtonLeft, navButtonRight,
    } = this;

    if (!infiniteScroll) {
      navButtonLeft && navButtonLeft.classList.remove('disabled');
      navButtonRight && navButtonRight.classList.remove('disabled');
    }

    const dotButtons = block.parentNode.querySelectorAll('.carousel-dot-button');
    const items = block.querySelectorAll('.carousel-item:not(.clone,.skip)');
    const selectedItem = block.querySelector('.carousel-item.selected');

    const step = this.getStep();
    let index = [...items].indexOf(selectedItem);
    index = index !== -1 ? index : 0;

    let newIndex = index + direction * step;

    if (infiniteScroll) {
      if (newIndex < 0) newIndex = items.length + newIndex;
      newIndex %= items.length;
    } else {
      if (newIndex < 0) {
        navButtonLeft && navButtonLeft.classList.add('disabled');
        return;
      }
      if (newIndex > items.length - step) {
        navButtonRight && navButtonRight.classList.add('disabled');
        return;
      }
    }

    const newSelectedItem = items[newIndex];

    if (infiniteScroll) {
      this.adjustForInfiniteScroll(newIndex, direction, newSelectedItem, items);
    }

    scrollToItem(block, newSelectedItem, this.getBlockPadding(), block.offsetLeft);
    this.updateSelectedStates(newIndex, newSelectedItem, items, dotButtons);
  }

  /** Scroll the carousel to the next item */
  nextItem() {
    this.scrollByStep(1);
  }

  /** Scroll the carousel to the previous item */
  prevItem() {
    this.scrollByStep(-1);
  }

  /**
  * Create clone items at the beginning and end of the carousel
  * to give the appearance of infinite scrolling
  */
  createClones() {
    const children = [...this.block.children];
    const total = children.length;
    if (total < 2) return;

    // how many to clone per side (at least visible or step size)
    const count = Math.min(Math.max(this.getStep(), 1), total);

    appendClones(this.block, children, count);
    decorateIcons(this.block);
  }

  rebuildClones(step) {
    // Remove old clones
    this.block.querySelectorAll('.carousel-item.clone').forEach((c) => c.remove());

    const children = [...this.block.querySelectorAll('.carousel-item:not(.clone)')];
    const total = children.length;
    if (total < 2) return;

    const count = Math.min(Math.max(step, 1), total);

    appendClones(this.block, children, count);
  }

  /**
  * Create left and right arrow navigation buttons
  */
  createNavButtons(parentElement) {
    addNavButtons(parentElement, this);
  }

  /**
  * Adds event listeners for touch UI swiping
  */
  addSwipeCapability() {
    if (this.block.swipeCapabilityAdded) {
      return;
    }

    let touchstartX = 0;
    let touchendX = 0;

    this.block.addEventListener('touchstart', (e) => {
      touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.block.addEventListener('touchend', (e) => {
      touchendX = e.changedTouches[0].screenX;
      if (Math.abs(touchendX - touchstartX) < 10) {
        return;
      }

      if (touchendX < touchstartX) {
        clearInterval(this.intervalId);
        this.nextItem();
      }

      if (touchendX > touchstartX) {
        clearInterval(this.intervalId);
        this.prevItem();
      }
    }, { passive: true });
    this.block.swipeCapabilityAdded = true;
  }

  setInitialScrollingPosition() {
    const scrollToSelectedItem = () => {
      const item = this.block.querySelector('.carousel-item.selected');
      if (!item) return;
      scrollToItem(this.block, item, this.getBlockPadding(), this.block.offsetLeft);
    };

    const section = this.block.closest('.section');

    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type === 'attributes'
          && mutation.attributeName === 'data-section-status'
          && section.attributes.getNamedItem('data-section-status').value === 'loaded') {
          scrollToSelectedItem();
          observer.disconnect();
        }
      });
    });

    observer.observe(section, { attributes: true });

    // just in case the mutation observer didn't work
    setTimeout(scrollToSelectedItem, 700);

    // ensure that we disconnect the observer
    // if the animation has kicked in, we for sure no longer need it
    setTimeout(() => { observer.disconnect(); }, AUTOSCROLL_INTERVAL);
  }

  createDotButtons() {
    const buttons = div({ class: `carousel-dot-buttons ${this.hasImageInDots ? 'carousel-dot-img-buttons' : ''}` });

    const items = [...this.block.children];
    const padding = this.getBlockPadding();
    const visibleCount = this.getCurrentVisibleItems();
    const totalPages = Math.ceil(items.length / Math.max(visibleCount, 1));

    for (let page = 0; page < totalPages; page += 1) {
      const firstItemIndex = page * visibleCount;
      const firstItem = items[firstItemIndex];

      const button = createDotButton(
        firstItem, page, this.currentIndex, this.block, padding, (index, itm) => {
          clearAutoScroll(this);
          // scrollToItem(this.block, itm, padding, 0);
          scrollToItem(this.block, itm, this.getBlockPadding(), this.block.offsetLeft);

          // reset selected classes
          this.updateSelectedStates(index, itm, items, buttons.children);
        },
      );

      if (this.hasImageInDots) {
        const imgEl = firstItem.querySelector('img');
        const imgPath = imgEl?.getAttribute('src');
        if (imgPath) {
          const imgPrefix = getOptimizedThumbnailPath(imgPath);
          button.appendChild(img({ src: imgPrefix, loading: 'lazy' }));
        }
      }

      buttons.append(button);
    }

    const oldButtons = this.block.parentElement.querySelector('.carousel-dot-buttons');
    if (oldButtons) oldButtons.remove();

    this.block.parentElement.append(buttons);
  }

  createCounter() {
    const counter = div({ class: 'carousel-counter' },
      div({ class: 'carousel-counter-text' },
        p(''),
      ),
    );
    if (this.counterNavButtons) {
      this.createNavButtons(counter);
    }
    this.block.parentElement.append(counter);
    this.updateCounterText();
  }

  initResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // invalidate cached padding for responsive layouts
        this.blockStyle = null;

        const newVisible = this.getCurrentVisibleItems();
        if (this.infiniteScroll) {
          this.rebuildClones(newVisible);
        }
        // always rebuild dots if dots enabled (so dot count matches pages)
        if (this.dotButtons) {
          this.createDotButtons();
        }
      }, 200);
    });
  }

  /*
  * Changing the default rendering may break carousels that rely on it
  * (e.g. CSS might not match anymore)
  */
  // eslint-disable-next-line class-methods-use-this
  renderItem(item) {
    // create the carousel content
    const columnContainer = div({ class: 'carousel-item-columns-container' });
    const columns = [div(), div()];

    const itemChildren = [...item.children];
    itemChildren.forEach((itemChild, idx) => {
      if (itemChild.querySelector('img')) {
        itemChild.classList.add('carousel-item-image');
      } else {
        itemChild.classList.add('carousel-item-text');
      }
      columns[idx].appendChild(itemChild);
    });

    columns.forEach((column) => {
      column.classList.add('carousel-item-column');
      columnContainer.appendChild(column);
    });
    return columnContainer;
  }

  async render() {
    // copy carousel styles to the wrapper too
    this.block.parentElement.classList.add(
      ...[...this.block.classList].filter((item, idx) => idx !== 0 && item !== 'block'),
    );

    let defaultCSSPromise;
    if (Array.isArray(this.cssFiles) && this.cssFiles.length > 0) {
      // add default carousel classes to apply default CSS
      defaultCSSPromise = Promise.all(this.cssFiles.map(loadCSS));
      this.block.parentElement.classList.add('carousel-wrapper');
      this.block.classList.add('carousel');
    }

    this.block.innerHTML = '';
    this.data.forEach((item, index) => {
      const itemContainer = div({ class: `carousel-item carousel-item-${index + 1}` });

      let renderedItem = this.cardRenderer.renderItem(item);
      renderedItem = Array.isArray(renderedItem) ? renderedItem : [renderedItem];
      renderedItem.forEach((renderedItemElement) => {
        // There may be items in the carousel that are skipped from scrolling
        if (renderedItemElement.classList.contains('carousel-skip-item')) {
          itemContainer.classList.add('skip');
        }
        itemContainer.appendChild(renderedItemElement);
      });
      this.block.appendChild(itemContainer);
    });

    // set initial selected carousel item
    const activeItems = this.block.querySelectorAll('.carousel-item:not(.clone,.skip)');
    activeItems[this.currentIndex].classList.add('selected');

    // create autoscrolling animation
    this.autoScroll && this.infiniteScroll
      && (this.intervalId = setInterval(() => { this.nextItem(); }, this.autoScrollInterval));
    this.dotButtons && this.createDotButtons();
    this.counter && this.createCounter();
    this.navButtons && this.createNavButtons(this.block.parentElement);
    if (this.infiniteScroll) {
      this.createClones();
      this.setInitialScrollingPosition();
      this.initResizeHandler();
    }
    this.addSwipeCapability();
    this.cssFiles && (await defaultCSSPromise);
  }
}

/**
 * Create and render default carousel.
 * Best practice: Create a new block and call the function, instead using or modifying this.
 * @param {Element}  block        required - target block
 * @param {Array}    data         optional - a list of data elements.
 *  either a list of objects or a list of divs.
 *  if not provided: the div children of the block are used
 * @param {Object}   config       optional - config object for
 * customizing the rendering and behaviour
 */
export async function createCarousel(block, data, config) {
  const carousel = new Carousel(block, data, config);
  await carousel.render();
  return carousel;
}

/**
 * Custom card style config and rendering of carousel items.
 */
export function renderCardItem(item) {
  item.classList.add('card');
  item
    .querySelectorAll('.button-container a')
    .forEach((a) => a.append(span({ class: 'icon icon-chevron-right-outline', 'aria-hidden': true })));
  decorateIcons(item);
  return item;
}

const cardStyleConfig = {
  cssFiles: ['/blocks/carousel/carousel-cards.css'],
  navButtons: true,
  dotButtons: false,
  infiniteScroll: true,
  autoScroll: false,
  visibleItems: [
    { items: 1, condition: (w) => w < 768 },
    { items: 2, condition: (w) => w < 1200 },
    { items: 3 },
  ],
  renderItem: renderCardItem,
};

export default async function decorate(block) {
  // show full description
  const showFullDescription = block.classList.contains('show-full-description');
  if (showFullDescription) {
    cardStyleConfig.showFullDescription = true;
  }

  cardStyleConfig.infiniteScroll = false;

  // cards style carousel
  const useCardsStyle = block.classList.contains('cards');
  if (useCardsStyle) {
    await createCarousel(block, [...block.children], cardStyleConfig);
    return;
  }

  // use the default carousel
  await createCarousel(block);
}
