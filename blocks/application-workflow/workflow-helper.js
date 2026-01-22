import { a, div, i } from '../../scripts/dom-helpers.js';
import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

/**
 * Extracts a numeric value from a class name like "position-bottom-40".
 * @param {string[]} classList - Array of class names.
 * @param {string} base - Base class name prefix to match.
 * @returns {number} Extracted numeric value, or 0 if none found.
 */
const extractPositionValue = (classList, base) => {
  const match = classList.find((cls) => cls.startsWith(`${base}-`) || cls === base);
  if (!match) return { value: 0, unit: 'px' };

  const value = match.split('-').pop();
  const regex = /^(\d+)([a-zA-Z%]+)?$/; // Regex to match number and optional unit
  const result = regex.exec(value);

  if (!result) return { value: 0, unit: 'px' };

  const numValue = +result[1]; // Extract numeric part
  const unit = result[2] || 'px'; // Default to 'px' if no unit is specified

  return { numValue, unit };
};

/**
 * Dynamically applies spacing to an element based on metadata classes.
 * Automatically detects whether to use positive or negative values.
 * @param {HTMLElement} article - The article containing metadata classes.
 * @param {HTMLElement} element - The target element to style.
 * @param {string} className - The base class name used to extract spacing values.
 * @param {string} [cssProperty='bottom'] - Preferred CSS property context.
 */
const MARGIN_TOP = 'margin-top';
const PADDING_TOP = 'padding-top';
const POSITION_BOTTOM = 'bottom';
const SPECTRA_SPACE = 'spectra-space';
const HIGHLIGHTED_BOX_IMAGE_POSITION = 'highlighted-box-image-position';
const TIMELINE_TOP_POSITIVE_SPACE = 'timeline-top-positive-space';
export function applyCustomSpacing(article, element, className, cssProperty = MARGIN_TOP) {
  if (!element) return;

  const positionValue = extractPositionValue(Array.from(article.classList), className);
  if (!positionValue) return;

  const property = cssProperty;
  let value = positionValue.numValue;
  if (property === MARGIN_TOP) value = -positionValue.numValue;

  const unit = positionValue.unit || 'px';
  if (!element.closest('.timeline').classList.contains('spectra-robot-box')) {
    element.style[property] = `${value}${unit}`;
  }
}

/**
 * Applies appropriate spacing rules for a timeline wrapper element.
 * @param {HTMLElement} article - The parent timeline article element.
 * @param {HTMLElement} wrapper - The wrapper element to apply spacing to.
 * @param {boolean} hasBoxClass - Whether the article uses a box layout.
 */
export function applyWrapperSpacing(article, wrapper, hasBoxClass) {
  const picture = wrapper.querySelector('.picture');
  if (hasBoxClass) {
    applyCustomSpacing(article, picture, HIGHLIGHTED_BOX_IMAGE_POSITION);
  } else {
    applyCustomSpacing(article, picture, SPECTRA_SPACE);
    // applyCustomSpacing(article, picture, POSITION_BOTTOM, POSITION_BOTTOM);
    applyCustomSpacing(article, wrapper, TIMELINE_TOP_POSITIVE_SPACE, PADDING_TOP);
  }
}

/**
 * Adjusts spacing between image and text content inside a timeline item.
 * @param {HTMLElement} article - The article containing this timeline.
 * @param {HTMLElement} wrapper - The timeline wrapper element.
 */
export function applyImageTextSpacing(article, wrapper) {
  if (wrapper.classList.contains('timeline-box')) return;

  const firstPicture = wrapper.querySelector('.picture');
  const firstContent = wrapper.querySelector('.picture + .timeline-content');
  if (!firstPicture || !firstContent) return;

  const applySpacing = () => {
    applyCustomSpacing(article, firstContent, MARGIN_TOP);
    applyCustomSpacing(article, firstContent, POSITION_BOTTOM, POSITION_BOTTOM);
  };

  const img = firstPicture.querySelector('img');
  if (img && !img.complete) img.addEventListener('load', applySpacing, { once: true });
  else applySpacing();
}

/**
 * Wraps a timeline’s structure into a consistent format:
 * - Moves picture/video elements to the top
 * - Groups remaining content into `.timeline-content`
 * - Handles image-list layouts with nested containers
 * @param {HTMLElement} wrapper - The wrapper element containing timeline items.
 * @param {HTMLElement} article - The article element for context.
 */
export function wrapTimelineContent(wrapper, article) {
  if (wrapper.querySelector(':scope > .timeline-content')) return;

  const isImageList = article.classList.contains('image-list');
  const pictures = Array.from(wrapper.querySelectorAll('.picture, .video-wrapper'));
  const firstPicture = pictures[0];
  const timelineContent = div({ class: 'timeline-content' });

  if (firstPicture) {
    const rest = Array.from(wrapper.children).filter((c) => c !== firstPicture);
    wrapper.textContent = '';
    wrapper.append(firstPicture, timelineContent);
    rest.forEach((el) => timelineContent.append(el));

    if (isImageList) {
      const imageListPics = timelineContent.querySelectorAll('.picture');
      imageListPics.forEach((img) => {
        const container = div({ class: 'image-list-container' });
        const innerWrapper = div({ class: 'image-list-wrapper' });

        let next = img.nextElementSibling;
        while (next) {
          innerWrapper.appendChild(next);
          next = img.nextElementSibling;
        }

        container.append(img, innerWrapper);
        timelineContent.append(container);
      });
    }
  } else {
    while (wrapper.firstChild) timelineContent.append(wrapper.firstChild);
    wrapper.append(timelineContent);
  }
}

/**
 * Adds chevron icons to CTA buttons inside an element.
 * @param {HTMLElement} parentEl - The parent element containing CTAs.
 */
export function addIconToCTA(parentEl) {
  if (!parentEl) return;
  const buttons = parentEl.querySelectorAll('.button-container > a');
  buttons.forEach((btn) => {
    if (!btn.querySelector('span.icon')) {
      btn.appendChild(i({ class: 'fa-solid fa-chevron-circle-right' }));
    }
  });
  decorateIcons(parentEl);
}

/**
 * Wraps timeline wrapper content inside a link for RFQ (Request for Quote) flows.
 * @param {HTMLElement} article - The timeline article element.
 * @param {HTMLElement} wrapper - The timeline wrapper element.
 */
export function handleCTALinks(article, wrapper) {
  const hasRFQLink = article.classList.contains('quote-request-link');
  const familyID = getMetadata('family-id');
  if (hasRFQLink && familyID) {
    const RFQAnchor = a({ href: `/quote-request?pid=${familyID}` });
    wrapper.parentNode.insertBefore(RFQAnchor, wrapper);
    RFQAnchor.appendChild(wrapper);
  }
}
