/* eslint-disable no-unused-expressions, import/no-cycle */
import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import {
  button, div, img, p, span,
} from '../../scripts/dom-helpers.js';
import {
  applyInfiniteScrollIllusion, calculateNewIndex, createClone, handleNavBoundaries,
  resetNavButtons, scrollToItem, updateSelection,
} from './carousel-helpers.js';

const AUTOSCROLL_INTERVAL = 7000;

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
    this.hasStepByScroll = false;
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
      // this.infiniteScroll = false;
      // this.navButtons = false;
      this.block.classList.add('fully-visible', 'three-items-visible');
    }

    if (this.defaultStyling) this.cssFiles.push('/blocks/carousel/carousel.css');
    if (this.cardStyling) this.cssFiles.push('/blocks/carousel/carousel-cards.css');
  }

  getStep() {
    return this.hasStepByScroll ? this.getCurrentVisibleItems() : 1;
  }

  getBlockPadding() {
    if (!this.blockStyle) {
      this.blockStyle = window.getComputedStyle(this.block);
    }
    return +(this.blockStyle.getPropertyValue('padding-left').replace('px', ''));
  }

  getCurrentVisibleItems() {
    if (!Array.isArray(this.visibleItems) || this.visibleItems.length === 0) return 1;

    const width = window.innerWidth;

    // try matching by condition
    const match = this.visibleItems.find((rule) => {
      if (typeof rule.condition === 'function') {
        return rule.condition(width);
      }
      return false;
    });

    // if no condition matches, use the last rule as default
    if (match) return match.items;
    return this.visibleItems[this.visibleItems.length - 1].items || 1;
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

  navigate(direction) {
    resetNavButtons(this);

    const dotButtons = this.block.parentNode.querySelectorAll('.carousel-dot-button');
    const items = this.block.querySelectorAll('.carousel-item:not(.clone,.skip)');
    const selectedItem = this.block.querySelector('.carousel-item.selected');

    let index = [...items].indexOf(selectedItem);
    index = index !== -1 ? index : 0;

    const step = this.getStep();
    const maxIndex = items.length - step;

    const newIndex = calculateNewIndex(direction, index, step, items.length);
    const newSelectedItem = items[newIndex];

    if (handleNavBoundaries(this, direction, newIndex, step, maxIndex, items.length)) return;

    applyInfiniteScrollIllusion(this, direction, index, newIndex, maxIndex, newSelectedItem);
    scrollToItem(this, newSelectedItem);
    updateSelection(this, items, dotButtons, newIndex, step);
  }

  // wrappers
  nextItem() {
    this.navigate('next');
  }

  prevItem() {
    this.navigate('prev');
  }

  /**
  * Create clone items at the beginning and end of the carousel
  * to give the appearance of infinite scrolling
  */
  createClones() {
    if (this.block.children.length < 2) return;

    const initialChildren = [...this.block.children];

    this.block.lastChild.after(createClone(initialChildren[0]));
    this.block.lastChild.after(createClone(initialChildren[1]));

    this.block.firstChild.before(createClone(initialChildren[initialChildren.length - 1]));
    this.block.firstChild.before(createClone(initialChildren[initialChildren.length - 2]));

    decorateIcons(this.block);
  }

  /**
  * Create left and right arrow navigation buttons
  */
  createNavButtons(parentElement) {
    const buttonLeft = document.createElement('button');
    buttonLeft.classList.add('carousel-nav-left');
    buttonLeft.ariaLabel = 'Scroll to previous item';
    buttonLeft.append(span({ class: 'icon icon-chevron-left' }));
    buttonLeft.addEventListener('click', () => {
      clearInterval(this.intervalId);
      this.prevItem();
    });

    if (!this.infiniteScroll) {
      buttonLeft.classList.add('disabled');
    }

    const buttonRight = document.createElement('button');
    buttonRight.classList.add('carousel-nav-right');
    buttonRight.ariaLabel = 'Scroll to next item';
    buttonRight.append(span({ class: 'icon icon-chevron-right' }));
    buttonRight.addEventListener('click', () => {
      clearInterval(this.intervalId);
      this.nextItem();
    });

    [buttonLeft, buttonRight].forEach((navButton) => {
      navButton.classList.add('carousel-nav-button');
      parentElement.append(navButton);
    });

    decorateIcons(buttonLeft);
    decorateIcons(buttonRight);
    this.navButtonLeft = buttonLeft;
    this.navButtonRight = buttonRight;
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
      const itemRect = item.getBoundingClientRect();
      const blockRect = this.block.getBoundingClientRect();
      const padding = this.getBlockPadding();
      const scrollLeft = (itemRect.left - padding - blockRect.left);

      requestAnimationFrame(() => {
        item.parentNode.scrollTo({
          top: 0,
          left: scrollLeft,
          behavior: 'instant',
        });
      });
    };

    const section = this.block.closest('.section');

    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type === 'attributes'
          && mutation.attributeName === 'data-section-status'
          && section.getAttribute('data-section-status') === 'loaded') {
          requestAnimationFrame(() => {
            scrollToSelectedItem();
          });
          observer.disconnect();
        }
      });
    });

    observer.observe(section, { attributes: true, attributeFilter: ['data-section-status'] });
    // ensure that we disconnect the observer
    // if the animation has kicked in, we for sure no longer need it
    setTimeout(() => { observer.disconnect(); }, AUTOSCROLL_INTERVAL);
  }

  createDotButtons() {
    const btnClasses = `carousel-dot-buttons ${this.hasImageInDots ? 'carousel-dot-img-buttons' : ''}`;
    const buttons = div({ class: btnClasses });

    const items = [...this.block.children].filter((item) => !item.classList.contains('skip') && !item.classList.contains('clone'));
    const visibleItems = this.getCurrentVisibleItems();
    const totalPages = Math.ceil(items.length / visibleItems);

    for (let page = 0; page < totalPages; page += 1) {
      const ariaLabel = `Scroll to items ${page * visibleItems + 1} - ${Math.min((page + 1) * visibleItems, items.length)}`;
      const btn = button({ class: 'carousel-dot-button', 'aria-label': ariaLabel });

      if (this.hasImageInDots) {
        const imgPath = items[page * visibleItems].querySelector('img')?.getAttribute('src');
        if (imgPath) {
          const customPath = imgPath.split('?')[0];
          const imgFormat = customPath.split('.').pop();
          const imgPrefix = `${customPath}?width=100&format=${imgFormat}&optimize=medium`;
          btn.appendChild(img({ src: imgPrefix }));
        }
      }

      if (page === Math.floor(this.currentIndex / visibleItems)) {
        btn.classList.add('selected');
      }

      btn.addEventListener('click', () => {
        clearInterval(this.intervalId);

        // Scroll to the first item of this page
        const scrollIndex = page * visibleItems;
        const targetItem = items[scrollIndex];

        // Calculate scroll accounting for clones
        const scrollLeft = targetItem.offsetLeft - this.getBlockPadding() - this.block.offsetLeft;

        this.block.scrollTo({
          top: 0,
          left: scrollLeft,
          behavior: 'smooth',
        });

        // Clear previous selected classes
        [...buttons.children].forEach((b) => b.classList.remove('selected'));
        [...this.block.children].forEach((i) => i.classList.remove('selected'));

        // Mark visible items on the page as selected
        for (let j = scrollIndex; j < scrollIndex + visibleItems && j < items.length; j += 1) {
          items[j].classList.add('selected');
        }

        btn.classList.add('selected');
        this.updateCounterText(scrollIndex);
      });

      buttons.append(btn);
    }

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
    this.infiniteScroll && this.createClones();
    this.addSwipeCapability();
    this.infiniteScroll && this.setInitialScrollingPosition();
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

  const noRepetition = block.classList.contains('no-repetition');
  if (noRepetition && block.children.length < 3) {
    cardStyleConfig.infiniteScroll = false;
  }

  // cards style carousel
  const useCardsStyle = block.classList.contains('cards');
  if (useCardsStyle) {
    await createCarousel(block, [...block.children], cardStyleConfig);
    return;
  }

  // use the default carousel
  await createCarousel(block);
}
