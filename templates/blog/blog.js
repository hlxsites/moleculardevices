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

  // decorate captions
  const main = document.querySelector('main');
  styleCaption(main.querySelectorAll('p > picture'));
  main.querySelectorAll('ol > li > em').forEach((item) => {
    item.parentElement.parentElement.classList.add('text-caption');
  });

  main.querySelectorAll('.vidyard', '.columns').forEach((item) => {
    if (!item.nextElementSibling.tagName === 'P') {
      return;
    }

    const paragraph = item.nextElementSibling;
    if (paragraph.children.length === 1 && paragraph.children[0].tagName === 'EM') {
      paragraph.children[0].classList.add('text-caption');
    }
  });

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
