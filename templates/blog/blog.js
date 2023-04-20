import { styleCaption, summariseDescription } from '../../scripts/scripts.js';
import {
  a, div, h3, p,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

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

export function renderBlogCard(item) {
  const itemImage = item.thumbnail && item.thumbnail !== '0' ? item.thumbnail : item.image;
  const buttonText = item.cardC2A && item.cardC2A !== '0' ? item.cardC2A : 'Read More';

  return (
    div({ class: 'blog-card' },
      div({ class: 'blog-card-thumb' },
        a({ href: item.path },
          createOptimizedPicture(itemImage, item.title, 'lazy', [{ width: '800' }]),
        ),
      ),
      div({ class: 'blog-card-caption' },
        h3(
          a({ href: item.path }, item.title),
        ),
        p({ class: 'blog-card-description' }, summariseDescription(item.description, 75)),
        p({ class: 'button-container' },
          a({ href: item.path, 'aria-label': buttonText, class: 'button primary' }, buttonText),
        ),
      ),
    )
  );
}
