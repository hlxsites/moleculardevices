import { styleCaption } from '../../scripts/scripts.js';
import { div } from '../../scripts/dom-helpers.js';

export default function buildAutoBlocks() {
  // add social share block
  const blogCarousel = document.querySelector('.recent-blogs-carousel');
  if (blogCarousel) {
    const blogCarouselSection = blogCarousel.parentElement;
    const socialShareSection = div(
      div({ class: 'social-share' }),
    );

    blogCarouselSection.parentElement.insertBefore(
      socialShareSection,
      blogCarouselSection,
    );
  }

  // add wave
  main.appendChild(
    div(
      div({ class: 'section-metadata' },
        div(
          div('style'),
          div('wave'),
        ),
      ),
    ),
  );
}
