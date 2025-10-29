import { decorateIcons } from '../../scripts/lib-franklin.js';
import { div, span } from '../../scripts/dom-helpers.js';

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

function extractPositionValue(classList) {
  const cls = classList.find((className) => className === 'position-top' || className.startsWith('position-top-'));
  if (!cls) return 0;
  const m = cls.match(/^position-top(?:-(\d+))?$/);
  return (m && m[1]) ? parseInt(m[1], 10) : 0;
}

function applyMargin(timelineArticle, contentEl) {
  if (!contentEl) return;
  const classList = Array.from(timelineArticle.classList);
  const positionValue = extractPositionValue(classList);
  if (positionValue) contentEl.style.marginTop = `-${positionValue}px`;
}

export default async function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;

  const timelineArticles = section?.querySelectorAll('.timeline-article');
  if (!timelineArticles?.length) return;

  timelineArticles.forEach((article) => {
    /* add CTA Icon */
    const hasBoxClass = article.classList.value.includes('-box');
    const isRightbox = article.classList.contains(RIGHT_BOX_CLASS);
    let parentEl = article.querySelector(':scope > div > div:first-child');
    if (isRightbox) parentEl = article.querySelector(':scope > div > div:last-child');
    if (hasBoxClass) parentEl.classList.add('timeline-box');
    addIconToCTA(parentEl);

    const mediaWrappers = article.querySelectorAll(':scope .timeline, :scope > div > div');
    mediaWrappers.forEach((wrapper) => {
      if (!wrapper.classList.contains('timeline')) {
        wrapper.classList.add('timeline');
      }

      const children = Array.from(wrapper.children);
      if (!children.some((child) => !child.classList.contains('picture') && !child.classList.contains('video-wrapper'))) {
        return;
      }

      // detect special spectra image case
      const spectraImg = wrapper.querySelector('.picture img[alt="Spectra Robot"]');
      if (spectraImg) wrapper.classList.add('spectra-robot-box');

      // wrap non-media children .timeline-content
      let currentWrapper = null;
      children.forEach((child) => {
        const isPicture = child.classList.contains('picture');
        const isVideo = child.querySelector('p > .video-wrapper');

        if (isPicture || isVideo) {
          currentWrapper = null;
        } else {
          if (!currentWrapper) {
            currentWrapper = div({ class: 'timeline-content' });
            wrapper.insertBefore(currentWrapper, child);
          }
          currentWrapper.appendChild(child);
        }
      });

      /* apply spacing between image and text over */
      const firstPicture = wrapper.querySelector('.picture');
      const firstContent = wrapper.querySelector('.picture + .timeline-content');

      if (firstPicture && firstContent) {
        const firstImg = firstPicture.querySelector('img');

        if (firstImg && !firstImg.complete) {
          firstImg.addEventListener('load', () => applyMargin(article, firstContent));
        } else {
          applyMargin(article, firstContent);
        }
      }
    });
  });
}
