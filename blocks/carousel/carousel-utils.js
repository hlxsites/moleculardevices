/* eslint-disable import/no-cycle */
import { button, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import { handleCompareProducts } from '../card/card.js';

/**
 * Scroll the carousel to a specific item
 */
export function scrollToItem(container, item, padding = 0, offsetLeft = 0) {
  if (!item) return;
  const left = item.offsetLeft - padding - offsetLeft;
  container.scrollTo({
    top: 0,
    left,
    behavior: 'smooth',
  });
}

/**
 * Update .selected state on items and dot buttons
 */
export function updateSelectedState(items, dots, newIndex) {
  items.forEach((item) => item.classList.remove('selected'));
  dots.forEach((dot) => dot.classList.remove('selected'));

  if (items[newIndex]) items[newIndex].classList.add('selected');
  if (dots[newIndex]) dots[newIndex].classList.add('selected');
}

/**
 * Stop auto scroll interval
 */
export function clearAutoScroll(instance) {
  if (instance.intervalId) {
    clearInterval(instance.intervalId);
    instance.intervalId = null;
  }
}

/**
 * Create navigation button (left/right)
 */
export function createNavButton(direction, iconClass, clickHandler) {
  const ariaLabel = `Scroll to ${direction === 'left' ? 'previous' : 'next'} item`;
  const btn = button(
    { class: `carousel-nav-${direction} carousel-nav-button`, 'aria-label': ariaLabel },
    span({ class: `icon ${iconClass}` }),
  );
  btn.addEventListener('click', clickHandler);
  return btn;
}

export function addNavButtons(parent, carouselInstance) {
  const leftBtn = createNavButton('left', 'icon-chevron-left', () => {
    clearAutoScroll(carouselInstance);
    carouselInstance.prevItem();
  });
  const rightBtn = createNavButton('right', 'icon-chevron-right', () => {
    clearAutoScroll(carouselInstance);
    carouselInstance.nextItem();
  });

  if (!carouselInstance.infiniteScroll) leftBtn.classList.add('disabled');
  parent.append(leftBtn, rightBtn);
  decorateIcons(leftBtn);
  decorateIcons(rightBtn);
  carouselInstance.navButtonLeft = leftBtn;
  carouselInstance.navButtonRight = rightBtn;
}

export function getOptimizedThumbnailPath(src, width = 100) {
  const customPath = src.split('?')[0];
  const format = customPath.split('.').pop() || 'jpg';
  return `${customPath}?width=${width}&format=${format}&optimize=medium`;
}

/**
 * Clone a carousel item for infinite scroll
 */
export function createClone(item) {
  const clone = item.cloneNode(true);
  clone.classList.add('clone');
  clone.classList.remove('selected');
  const compareCheckbox = clone.querySelector('.compare-checkbox');
  if (compareCheckbox) {
    compareCheckbox.addEventListener('click', handleCompareProducts);
  }
  return clone;
}

export function createCloneWithMeta(item, originalIndex, clonePos) {
  const clone = createClone(item);
  clone.dataset.cloneOf = String(originalIndex);
  clone.dataset.clonePos = clonePos;
  return clone;
}

export function findClone(block, originalIndex, clonePos) {
  return block.querySelector(`.carousel-item.clone[data-clone-of="${originalIndex}"][data-clone-pos="${clonePos}"]`);
}

export function preJumpToClone(container, block, originalIndex, clonePos, padding, offsetLeft) {
  const cloneEl = findClone(block, originalIndex, clonePos);
  if (cloneEl) {
    scrollToItem(container, cloneEl, padding, offsetLeft);
  }
}

export function appendClones(block, children, count) {
  // tail
  for (let i = 0; i < count; i += 1) {
    const clone = createCloneWithMeta(children[i], i, 'tail');
    block.lastChild.after(clone);
  }
  // head
  for (let i = 0; i < count; i += 1) {
    const srcIndex = children.length - count + i;
    const clone = createCloneWithMeta(children[srcIndex], srcIndex, 'head');
    block.firstChild.before(clone);
  }
}

/**
 * Create dot button for a given item
 */
export function createDotButton(item, index, currentIndex, block, padding, updateCallback) {
  const btn = button({ class: 'carousel-dot-button', 'aria-label': `Scroll to item ${index + 1}` });
  if (index === currentIndex) btn.classList.add('selected');

  btn.addEventListener('click', () => updateCallback(index, item, btn));
  return btn;
}
