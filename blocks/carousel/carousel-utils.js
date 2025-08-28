/* eslint-disable import/no-cycle */
import { handleCompareProducts } from '../card/card.js';

/**
 * Scroll the carousel to a specific item
 */
export function scrollToItem(block, item, padding, offsetLeft = 0) {
  if (!item) return;
  block.scrollTo({
    top: 0,
    left: item.offsetLeft - padding - offsetLeft,
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
  const button = document.createElement('button');
  button.classList.add(`carousel-nav-${direction}`, 'carousel-nav-button');
  button.ariaLabel = `Scroll to ${direction === 'left' ? 'previous' : 'next'} item`;

  const spanEl = document.createElement('span');
  spanEl.classList.add('icon', iconClass);
  button.append(spanEl);

  button.addEventListener('click', clickHandler);
  return button;
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

/**
 * Create dot button for a given item
 */
export function createDotButton(item, index, currentIndex, block, padding, updateCallback) {
  const button = document.createElement('button');
  button.ariaLabel = `Scroll to item ${index + 1}`;
  button.classList.add('carousel-dot-button');
  if (index === currentIndex) button.classList.add('selected');

  button.addEventListener('click', () => {
    updateCallback(index, item, button);
  });

  return button;
}
