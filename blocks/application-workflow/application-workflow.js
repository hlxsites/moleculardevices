import { decorateIcons } from '../../scripts/lib-franklin.js';
import { div, span } from '../../scripts/dom-helpers.js';

const RIGHT_BOX_CLASS = 'right-box';
const LEFT_BOX_CLASS = 'left-box';

function addIconToCTA(parentEl) {
  parentEl?.classList.add('timeline-box');
  const ctaBtns = parentEl.querySelectorAll('.button-container > a');
  ctaBtns.forEach((btn) => {
    const ctaIcon = span({ class: 'icon icon-chevron-right-outline' });
    btn.appendChild(ctaIcon);
  });
  decorateIcons(parentEl);
}

export default async function decorate(block) {
  const section = block.closest('.section');

  /* timeline structure */
  const timelineArticles = section?.querySelectorAll('.timeline-article');
  if (!timelineArticles?.length) return;

  timelineArticles.forEach((boxItem) => {
    const isRightbox = boxItem.classList.contains(RIGHT_BOX_CLASS);
    const isLeftbox = boxItem.classList.contains(LEFT_BOX_CLASS);

    if (isRightbox) {
      const parentEl = boxItem.querySelector(':scope > div > div:last-child');
      addIconToCTA(parentEl);
    }
    if (isLeftbox) {
      const parentEl = boxItem.querySelector(':scope > div > div:first-child');
      addIconToCTA(parentEl);
    }

    // Select all direct timeline divs reliably
    const timelines = boxItem.querySelectorAll(':scope .timeline, :scope > div > div');

    timelines.forEach((timeline) => {
      if (!timeline.classList.contains('timeline')) {
        timeline.classList.add('timeline');
      }

      const children = Array.from(timeline.children);
      if (!children.some((child) => !child.classList.contains('picture'))) return;

      let currentWrapper = null;

      // Wrap all non-picture children without breaking structure
      children.forEach((child) => {
        const isPicture = child.classList.contains('picture');

        if (isPicture) {
          currentWrapper = null;
        } else {
          if (!currentWrapper) {
            currentWrapper = div({ class: 'timeline-content' });
            timeline.insertBefore(currentWrapper, child);
          }
          currentWrapper.appendChild(child);
        }
      });

      const firstPicture = timeline.querySelector('.picture');
      const firstContent = timeline.querySelector('.picture + .timeline-content');

      if (firstPicture && firstContent) {
        const firstImg = firstPicture.querySelector('img');

        const applyMargin = () => {
          const height = firstPicture.offsetHeight;
          if (height > 0) {
            firstContent.style.marginTop = `-${Math.floor(height / 4)}px`;
          }
        };

        if (firstImg && !firstImg.complete) {
          firstImg.addEventListener('load', applyMargin);
        } else {
          applyMargin();
        }
      }
    });
  });
}
