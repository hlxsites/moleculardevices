import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';
import { a, div, span } from '../../scripts/dom-helpers.js';

const RIGHT_BOX_CLASS = 'right-box';

function addIconToCTA(parentEl) {
  if (!parentEl) return;
  const ctaBtns = parentEl.querySelectorAll('.button-container > a');
  ctaBtns.forEach((btn) => {
    const ctaIcon = span({ class: 'icon icon-chevron-right-outline' });
    btn.appendChild(ctaIcon);
  });
  decorateIcons(parentEl);
}

function extractPositionValue(classList, base) {
  const match = Array.from(classList)
    .find((cls) => cls.startsWith(`${base}-`) || cls === base);
  if (!match) return 0;
  const value = match.split('-').pop();
  return Number.isNaN(+value) ? 0 : +value;
}

function applyCustomSpacing(article, element, className, cssProperty = 'bottom') {
  if (!element) return;
  const classList = Array.from(article.classList);
  const positionValue = extractPositionValue(classList, className);
  if (positionValue && cssProperty === 'bottom') {
    element.style.bottom = `-${positionValue}px`;
  }
  if (positionValue && cssProperty === 'positiveBottom') {
    element.style.bottom = `${positionValue}px`;
  }
  if (positionValue && cssProperty === 'marginTop') {
    element.style.marginTop = `-${positionValue}px`;
  }
  if (positionValue && cssProperty === 'paddingTop') {
    element.style.paddingTop = `${positionValue}px`;
  }
}

function wrapTimelineContent(wrapper, article) {
  const isImageList = article.classList.contains('image-list');
  const pictures = Array.from(wrapper.querySelectorAll('.picture, .video-wrapper'));
  const firstPicture = pictures[0];

  // Create timeline-content container
  const timelineContent = div({ class: 'timeline-content' });

  if (firstPicture) {
    // Move first picture outside timeline-content (keeps it first)
    wrapper.insertBefore(firstPicture, wrapper.firstChild);

    // Capture all remaining elements after first picture
    const contentAfterFirstPic = Array.from(wrapper.children)
      .filter((child) => child !== firstPicture);

    // Append timeline-content to wrapper
    wrapper.appendChild(timelineContent);

    // Move all captured content into timeline-content
    contentAfterFirstPic.forEach((el) => timelineContent.appendChild(el));

    // If image-list exists, wrap its picture + content inside timeline-content
    if (isImageList) {
      const imageListPics = Array.from(timelineContent.querySelectorAll('.picture'));

      imageListPics.forEach((img) => {
        const imageListContainer = div({ class: 'image-list-container' });
        const imageListWrapper = div({ class: 'image-list-wrapper' });

        // Capture all content immediately after this picture
        const nextContent = [];
        let next = img.nextElementSibling;
        while (next) {
          nextContent.push(next);
          next = next.nextElementSibling;
        }

        // Move picture into container
        imageListContainer.appendChild(img);

        // Move captured content into wrapper
        nextContent.forEach((el) => imageListWrapper.appendChild(el));

        // Nest wrapper inside container, then container back into timeline-content
        imageListContainer.appendChild(imageListWrapper);
        timelineContent.appendChild(imageListContainer);
      });
    }
  } else {
    // No pictures: move everything into timeline-content
    while (wrapper.firstChild) {
      timelineContent.appendChild(wrapper.firstChild);
    }
    wrapper.appendChild(timelineContent);
  }
}

export default async function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;

  const timelineArticles = section?.querySelectorAll('.timeline-article');
  if (!timelineArticles?.length) return;

  timelineArticles.forEach((article) => {
    /* add CTA Icon */
    const hasBoxClass = Array.from(article.classList).some((c) => c.endsWith('-box'));
    const isRightbox = article.classList.contains(RIGHT_BOX_CLASS);
    let parentEl = article.querySelector(':scope > div > div:first-child');
    if (isRightbox) parentEl = article.querySelector(':scope > div > div:last-child');
    if (hasBoxClass) parentEl.classList.add('timeline-box');
    addIconToCTA(article);

    const mediaWrappers = article.querySelectorAll(':scope .timeline, :scope > div > div');
    mediaWrappers.forEach((wrapper) => {
      if (!wrapper.classList.contains('timeline')) {
        wrapper.classList.add('timeline');
      }
      if (hasBoxClass) {
        applyCustomSpacing(article, wrapper.querySelector('.picture'), 'highlighted-box-image-position', 'marginTop');
      } else {
        applyCustomSpacing(article, wrapper, 'timeline-top-space');
        applyCustomSpacing(article, wrapper, 'timeline-top-positive-space', 'paddingTop');
      }

      const children = Array.from(wrapper.children);
      if (!children.some((child) => !child.classList.contains('picture') && !child.classList.contains('video-wrapper'))) {
        return;
      }

      // detect special spectra image case
      const spectraImg = wrapper.querySelector('.picture img[alt="Spectra Robot"]');
      if (spectraImg) wrapper.classList.add('spectra-robot-box');

      /* add rfq link to spectra */
      const hasRFQLink = article.classList.contains('quote-request-link');
      const familyID = getMetadata('family-id');

      if (hasRFQLink && familyID) {
        const RFQAnchor = a({ href: `/quote-request?pid=${familyID}` });
        wrapper.parentNode.insertBefore(RFQAnchor, wrapper);
        RFQAnchor.appendChild(wrapper);
      }

      wrapTimelineContent(wrapper, article);

      /* apply spacing between image and text over */
      if (!wrapper.classList.contains('timeline-box')) {
        const firstPicture = wrapper.querySelector('.picture');
        const firstContent = wrapper.querySelector('.picture + .timeline-content');

        if (firstPicture && firstContent) {
          const firstImg = firstPicture.querySelector('img');

          if (firstImg && !firstImg.complete) {
            firstImg.addEventListener('load', () => applyCustomSpacing(article, firstContent, 'position-top'));
            firstImg.addEventListener('load', () => applyCustomSpacing(article, firstContent, 'position-top-positive', 'positiveBottom'));
          } else {
            applyCustomSpacing(article, firstContent, 'position-top');
            applyCustomSpacing(article, firstContent, 'position-top-positive', 'positiveBottom');
          }
        }
      }
    });
  });
}
