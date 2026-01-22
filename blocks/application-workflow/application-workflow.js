import {
  addIconToCTA, applyImageTextSpacing, applyWrapperSpacing, handleCTALinks,
  wrapTimelineContent,
} from './workflow-helper.js';

const RIGHT_BOX_CLASS = 'right-box';
const SPECTRA_IMAGE = 'spectra-image';
const SPECTRA_ROBOT_BOX = 'spectra-robot-box';

export default async function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;

  const timelineArticles = section.querySelectorAll('.timeline-article');
  if (!timelineArticles.length) return;

  timelineArticles.forEach((article) => {
    const hasBoxClass = Array.from(article.classList).some((c) => c.endsWith('-box'));
    const isRightBox = article.classList.contains(RIGHT_BOX_CLASS);

    // Select left/right timeline parent
    const parentEl = article.querySelector(
      isRightBox ? ':scope > div > div:last-child' : ':scope > div > div:first-child',
    );
    if (!parentEl) return;
    if (hasBoxClass) parentEl.classList.add('timeline-box');

    // Process timeline wrappers
    const wrappers = article.querySelectorAll(':scope .timeline, :scope > div > div');
    wrappers.forEach(async (wrapper) => {
      if (!wrapper.classList.contains('timeline')) wrapper.classList.add('timeline');

      applyWrapperSpacing(article, wrapper, hasBoxClass);

      const children = Array.from(wrapper.children);
      const hasContent = children.some(
        (child) => !child.classList.contains('picture') && !child.classList.contains('video-wrapper'),
      );
      if (!hasContent) return;

      // Handle Spectra Robot
      if (article.classList.contains(SPECTRA_IMAGE) && wrapper.querySelector('.picture img[alt^="Spectra"]')) {
        wrapper.classList.add(SPECTRA_ROBOT_BOX);
      }

      handleCTALinks(article, wrapper);
      wrapTimelineContent(wrapper, article);
      applyImageTextSpacing(article, wrapper);
    });
  });

  // Add CTA Icon..
  addIconToCTA(block);
}
