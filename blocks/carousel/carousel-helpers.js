/* eslint-disable import/no-cycle */
import { handleCompareProducts } from '../card/card.js';

/**
 * Clone a carousel item
 * @param {Element} item carousel item to be cloned
 * @returns {Element} clone of the carousel item
 */
export function createClone(item) {
  const clone = item.cloneNode(true);
  clone.classList.add('clone');
  clone.classList.remove('selected');

  // if clone has compare box, add event handler
  const compareCheckbox = clone.querySelector('.compare-checkbox');
  if (compareCheckbox) {
    compareCheckbox.addEventListener('click', handleCompareProducts);
  }

  return clone;
}

/**
 * Reset nav button states
 */
export function resetNavButtons(carousel) {
  if (!carousel.infiniteScroll) {
    carousel.navButtonRight?.classList.remove('disabled');
    carousel.navButtonLeft?.classList.remove('disabled');
  }
}

/**
 * Calculate new index based on direction & step
 * Signature: (direction, index, step, itemsLength)
 */
export function calculateNewIndex(direction, index, step, itemsLength) {
  let newIndex;

  if (direction === 'next') {
    newIndex = (index + step) % itemsLength;
  } else {
    newIndex = index - step;
    if (newIndex < 0) {
      newIndex = itemsLength - step;
    }
  }

  return newIndex;
}

/**
 * Handle finite mode boundaries
 */
export function handleNavBoundaries(carousel, direction, newIndex, step, maxIndex, itemCount) {
  if (carousel.infiniteScroll) return false;

  if (step === 1) {
    if (direction === 'next' && newIndex === 0) return true;
    if (direction === 'next' && newIndex === itemCount - carousel.getCurrentVisibleItems()) {
      carousel.navButtonRight?.classList.add('disabled');
    }
    if (direction === 'prev' && newIndex === itemCount - 1) return true;
    if (direction === 'prev' && newIndex === 0) {
      carousel.navButtonLeft?.classList.add('disabled');
    }
  } else {
    if (direction === 'next' && newIndex === 0) return true;
    if (direction === 'next' && newIndex === maxIndex) {
      carousel.navButtonRight?.classList.add('disabled');
    }
    if (direction === 'prev' && newIndex === maxIndex) return true;
    if (direction === 'prev' && newIndex === 0) {
      carousel.navButtonLeft?.classList.add('disabled');
    }
  }
  return false;
}

/**
 * Illusion of infinite scroll (wrap jump)
 */
export function applyInfiniteScrollIllusion(carousel, dir, newIndex, maxIndex, newSelectedItem) {
  if (dir === 'next' && newIndex === 0) {
    newSelectedItem.parentNode.scrollTo({
      top: 0,
      left: newSelectedItem.previousElementSibling.offsetLeft
        - carousel.getBlockPadding()
        - carousel.block.offsetLeft,
    });
  }
  if (dir === 'prev' && newIndex === maxIndex) {
    newSelectedItem.parentNode.scrollTo({
      top: 0,
      left: newSelectedItem.nextElementSibling.offsetLeft
        - carousel.getBlockPadding()
        - carousel.block.offsetLeft,
    });
  }
}

/**
 * Scroll smoothly to a selected item
 */
export function scrollToItem(carousel, newSelectedItem) {
  newSelectedItem.parentNode.scrollTo({
    top: 0,
    left: newSelectedItem.offsetLeft - carousel.getBlockPadding() - carousel.block.offsetLeft,
    behavior: 'smooth',
  });
}

/**
 * Update selection (items & dots)
 */
export function updateSelection(carousel, items, dotButtons, newIndex, step) {
  items.forEach((item) => item.classList.remove('selected'));
  dotButtons.forEach((dot) => dot.classList.remove('selected'));

  if (step === 1) {
    items[newIndex].classList.add('selected');
    if (dotButtons[newIndex]) dotButtons[newIndex].classList.add('selected');
  } else {
    for (let j = newIndex; j < newIndex + step && j < items.length; j += 1) {
      items[j].classList.add('selected');
    }
    const pageIndex = Math.floor(newIndex / step);
    if (dotButtons[pageIndex]) dotButtons[pageIndex].classList.add('selected');
  }
  carousel.updateCounterText(newIndex);
}
