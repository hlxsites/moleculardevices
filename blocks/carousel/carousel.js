/* eslint-disable import/no-cycle, no-unused-expressions */
import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import {
  div, img, p, span,
} from '../../scripts/dom-helpers.js';
// import { handleCompareProducts } from '../card/card.js';
import {
  clearAutoScroll, createDotButton, createNavButton, scrollToItem, updateSelectedState,
  preJumpToClone, createCloneWithMeta,
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

  updateCounterText(newIndex = this.currentIndex) {
    this.currentIndex = newIndex;
    if (this.counter) {
      const items = this.block.querySelectorAll('.carousel-item:not(.clone,.skip)');
      const counterTextBlock = this.block.parentElement.querySelector('.carousel-counter .carousel-counter-text p');
      const pageCounter = `${this.currentIndex + 1} / ${items.length}`;
      counterTextBlock.innerHTML = this.counterText ? `${this.counterText} ${pageCounter}` : pageCounter;
    }
  }

  getStep() {
    return Math.max(1, Number(this.stepBy || 1));
  }

  getCurrentVisibleItems() {
    return this.visibleItems.find((e) => !e.condition || e.condition()).items;
  }

  /**
  * Scroll the carousel to the next item
  */
  nextItem() {
    !this.infiniteScroll && this.navButtonRight?.classList.remove('disabled');
    !this.infiniteScroll && this.navButtonLeft?.classList.remove('disabled');

    const dotButtons = this.block.parentNode.querySelectorAll('.carousel-dot-button');
    const items = this.block.querySelectorAll('.carousel-item:not(.skip)');
    const selectedItem = this.block.querySelector('.carousel-item.selected');

    let index = [...items].indexOf(selectedItem);
    if (index === -1) index = 0;

    const step = this.getStep();
    const total = items.length;
    let newIndex = index + step;

    if (this.infiniteScroll) {
      // wrap forward into clones → then jump back
      if (newIndex >= total - this.getCurrentVisibleItems()) {
        const realIndex = newIndex % (total - (2 * this.getCurrentVisibleItems()));
        preJumpToClone(
          items[realIndex].parentNode,
          this.block,
          realIndex,
          'tail',
          this.getBlockPadding(),
          this.block.offsetLeft,
        );
        newIndex = realIndex;
      }
    } else {
      const lastIndex = total - this.getCurrentVisibleItems();
      if (newIndex > lastIndex) newIndex = lastIndex;
      if (newIndex === lastIndex) this.navButtonRight?.classList.add('disabled');
      this.navButtonLeft?.classList.remove('disabled');
    }

    const newSelectedItem = items[newIndex];
    scrollToItem(newSelectedItem.parentNode,
      newSelectedItem,
      this.getBlockPadding(),
      this.block.offsetLeft);
    updateSelectedState(items, dotButtons, newIndex);
    this.updateCounterText(newIndex);
  }

  /**
  * Scroll the carousel to the previous item
  */
  prevItem() {
    !this.infiniteScroll && this.navButtonRight?.classList.remove('disabled');
    !this.infiniteScroll && this.navButtonLeft?.classList.remove('disabled');

    const dotButtons = this.block.parentNode.querySelectorAll('.carousel-dot-button');
    const items = this.block.querySelectorAll('.carousel-item:not(.skip)');
    const selectedItem = this.block.querySelector('.carousel-item.selected');

    let index = [...items].indexOf(selectedItem);
    if (index === -1) index = 0;

    const step = this.getStep();
    const total = items.length;
    let newIndex = index - step;

    if (this.infiniteScroll) {
      if (newIndex < 0 + this.getCurrentVisibleItems()) {
        const realIndex = (total - (2 * this.getCurrentVisibleItems())) + newIndex;
        preJumpToClone(
          items[realIndex].parentNode,
          this.block,
          realIndex,
          'head',
          this.getBlockPadding(),
          this.block.offsetLeft,
        );
        newIndex = realIndex;
      }
    } else if (newIndex < 0) {
      this.navButtonLeft?.classList.add('disabled');
      return;
    }

    const newSelectedItem = items[newIndex];
    scrollToItem(newSelectedItem.parentNode,
      newSelectedItem,
      this.getBlockPadding(),
      this.block.offsetLeft);
    updateSelectedState(items, dotButtons, newIndex);
    this.updateCounterText(newIndex);
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
    const count = Math.min(Math.max(this.getCurrentVisibleItems(), this.getStep()), total);

    // tail clones (append first 'count' as clones)
    for (let i = 0; i < count; i += 1) {
      const clone = createCloneWithMeta(children[i], i, 'tail');
      this.block.lastChild.after(clone);
    }

    // head clones (prepend last 'count' as clones)
    for (let i = 0; i < count; i += 1) {
      const srcIndex = total - count + i;
      const clone = createCloneWithMeta(children[srcIndex], srcIndex, 'head');
      this.block.firstChild.before(clone);
    }

    decorateIcons(this.block);
  }

  /**
  * Create left and right arrow navigation buttons
  */
  createNavButtons(parentElement) {
    const leftBtn = createNavButton('left', 'icon-chevron-left', () => {
      clearAutoScroll(this);
      this.prevItem();
    });

    const rightBtn = createNavButton('right', 'icon-chevron-right', () => {
      clearAutoScroll(this);
      this.nextItem();
    });

    if (!this.infiniteScroll) leftBtn.classList.add('disabled');
    parentElement.append(leftBtn, rightBtn);
    decorateIcons(leftBtn);
    decorateIcons(rightBtn);
    this.navButtonLeft = leftBtn;
    this.navButtonRight = rightBtn;
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
      item.parentNode.scrollTo({
        top: 0,
        left: item.offsetLeft - this.getBlockPadding() - this.block.offsetLeft,
      });
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

    items.forEach((item, i) => {
      const button = createDotButton(
        item, i, this.currentIndex, this.block, padding, (index, itm, btn) => {
          clearAutoScroll(this);
          scrollToItem(this.block, itm, padding, 0);
          [...buttons.children].forEach((r) => r.classList.remove('selected'));
          items.forEach((r) => r.classList.remove('selected'));
          btn.classList.add('selected');
          itm.classList.add('selected');
          this.updateCounterText(index);
        });

      if (this.hasImageInDots) {
        const imgPath = item.querySelector('img').getAttribute('src');
        const customPath = imgPath.split('?')[0];
        const imgFormat = customPath.split('.')[1];
        const imgPrefix = `${customPath}?width=100&format=${imgFormat}&optimize=medium`;
        button.appendChild(img({ src: imgPrefix }));
      }

      buttons.append(button);
    });

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

  /*
  * Changing the default rendering may break carousels that rely on it
  * (e.g. CSS might not match anymore)
  */
  // eslint-disable-next-line class-methods-use-this
  renderItem(item) {
    // create the carousel content
    const columnContainer = document.createElement('div');
    columnContainer.classList.add('carousel-item-columns-container');

    const columns = [document.createElement('div'), document.createElement('div')];

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
      const itemContainer = document.createElement('div');
      itemContainer.classList.add('carousel-item', `carousel-item-${index + 1}`);

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
    {
      items: 1,
      condition: () => window.innerWidth < 768,
    },
    {
      items: 2,
      condition: () => window.innerWidth < 1200,
    }, {
      items: 3,
    },
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
