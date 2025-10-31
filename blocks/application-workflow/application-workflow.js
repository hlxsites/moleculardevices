import { getMetadata } from '../../scripts/lib-franklin.js';
import { a } from '../../scripts/dom-helpers.js';
import { addIconToCTA, applyCustomSpacing, wrapTimelineContent } from './workflow-helper.js';

const RIGHT_BOX_CLASS = 'right-box';

export default async function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;

  const timelineArticles = section?.querySelectorAll('.timeline-article');
  if (!timelineArticles?.length) return;

  timelineArticles.forEach((article) => {
    /* add CTA Icon */
    const hasBoxClass = Array.from(article.classList).some((c) => c.endsWith('-box'));
    const isRightbox = article.classList.contains(RIGHT_BOX_CLASS);

    // Select parent element for left/right timeline
    let parentEl = article.querySelector(':scope > div > div:first-child');
    if (isRightbox) parentEl = article.querySelector(':scope > div > div:last-child');
    if (hasBoxClass) parentEl.classList.add('timeline-box');

    addIconToCTA(article);

    const mediaWrappers = article.querySelectorAll(':scope .timeline, :scope > div > div');
    if (!mediaWrappers.length) return;

    mediaWrappers.forEach((wrapper) => {
      if (!wrapper.classList.contains('timeline')) wrapper.classList.add('timeline');

      // Apply spacing depending on box type
      if (hasBoxClass) {
        applyCustomSpacing(article, wrapper.querySelector('.picture'), 'highlighted-box-image-position', 'marginTop');
      } else {
        applyCustomSpacing(article, wrapper, 'timeline-top-space');
        applyCustomSpacing(article, wrapper, 'timeline-top-positive-space', 'paddingTop');
      }

      // Skip empty wrappers (only images/videos, no text)
      const children = Array.from(wrapper.children);
      const hasContent = children
        .some((child) => !child.classList.contains('picture') && !child.classList.contains('video-wrapper'));
      if (!hasContent) return;

      // Detect special Spectra case (image with alt text or article class)
      const spectraImg = wrapper.querySelector('.picture img[alt*="Spectra Robot"]');
      if (spectraImg) wrapper.classList.add('spectra-robot-box');

      // Handle RFQ link wrapping (Spectra specific)
      const hasRFQLink = article.classList.contains('quote-request-link');
      const familyID = getMetadata('family-id');
      if (hasRFQLink && familyID) {
        const RFQAnchor = a({ href: `/quote-request?pid=${familyID}` });
        wrapper.parentNode.insertBefore(RFQAnchor, wrapper);
        RFQAnchor.appendChild(wrapper);
      }

      // Wrap timeline content
      wrapTimelineContent(wrapper, article);

      // Spectra scrollHeight adjustment
      if (spectraImg) {
        const timelineContent = wrapper.querySelector('.timeline-content');
        if (!timelineContent) return;

        // Wait until element is visible in the DOM (not display:none)
        const waitForVisible = () => new Promise((resolve) => {
          const checkVisible = () => {
            if (timelineContent.offsetParent !== null) {
              resolve();
            } else {
              requestAnimationFrame(checkVisible);
            }
          };
          checkVisible();
        });

        // Wait for all images in this wrapper to load
        const imgs = wrapper.querySelectorAll('img');
        const imagePromises = Array.from(imgs).map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }
          return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true }); // prevents hanging
          });
        });

        // Wait for both visibility and image loading before measuring
        Promise.all([...imagePromises, waitForVisible()]).then(() => {
          requestAnimationFrame(() => {
            const rect = timelineContent.getBoundingClientRect();
            if (rect.height > 0) {
              timelineContent.style.minHeight = `${rect.height + 30}px`;
            }
          });
        });
      }

      /* apply spacing between image and text over */
      if (!wrapper.classList.contains('timeline-box')) {
        const firstPicture = wrapper.querySelector('.picture');
        const firstContent = wrapper.querySelector('.picture + .timeline-content');

        if (firstPicture && firstContent) {
          const firstImg = firstPicture.querySelector('img');
          const applySpacing = () => {
            applyCustomSpacing(article, firstContent, 'position-top');
            applyCustomSpacing(article, firstContent, 'position-top-positive', 'positiveBottom');
          };

          if (firstImg && !firstImg.complete) {
            firstImg.addEventListener('load', applySpacing);
          } else {
            applySpacing();
          }
        }
      }
    });
  });
}
