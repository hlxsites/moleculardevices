import { div, span } from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

export function addIconToCTA(parentEl) {
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

export function applyCustomSpacing(article, element, className, cssProperty = 'bottom') {
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

export function wrapTimelineContent(wrapper, article) {
  const isImageList = article.classList.contains('image-list');
  const pictures = Array.from(wrapper.querySelectorAll('.picture, .video-wrapper'));
  const firstPicture = pictures[0];

  const timelineContent = div({ class: 'timeline-content' });

  if (firstPicture) {
    wrapper.insertBefore(firstPicture, wrapper.firstChild);
    const contentAfterFirstPic = Array.from(wrapper.children)
      .filter((child) => child !== firstPicture);

    wrapper.appendChild(timelineContent);
    contentAfterFirstPic.forEach((el) => timelineContent.appendChild(el));

    // If image-list exists, wrap its picture + content inside timeline-content
    if (isImageList) {
      const imageListPics = Array.from(timelineContent.querySelectorAll('.picture'));

      imageListPics.forEach((img) => {
        const imageListContainer = div({ class: 'image-list-container' });
        const imageListWrapper = div({ class: 'image-list-wrapper' });
        const nextContent = [];

        let next = img.nextElementSibling;
        while (next) {
          nextContent.push(next);
          next = next.nextElementSibling;
        }

        imageListContainer.appendChild(img);
        nextContent.forEach((el) => imageListWrapper.appendChild(el));

        imageListContainer.appendChild(imageListWrapper);
        timelineContent.appendChild(imageListContainer);
      });
    }
  } else {
    while (wrapper.firstChild) {
      timelineContent.appendChild(wrapper.firstChild);
    }
    wrapper.appendChild(timelineContent);
  }
}
