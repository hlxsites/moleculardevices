import { domEl } from '../../scripts/dom-helpers.js';
import { embedCerosFrame } from '../embed/embed.js';

function decorateEmbed(elems) {
  elems.forEach((elem) => {
    const embedHTML = embedCerosFrame(elem);
    const parentEl = elem.parentElement;
    const container = domEl('aside', { class: 'embed embed-ceros' }, embedHTML);

    parentEl.replaceWith(container);
  });
}

export default function decorate(block) {
  // Handle Embeds
  const embedUrls = block.querySelectorAll('a[href*="ceros.com"]');
  decorateEmbed(embedUrls);

  // Setup Column Structure
  const rows = [...block.children];
  rows.forEach((row) => {
    row.className = 'columns-row';
    const cols = [...row.children];
    block.classList.add(`columns-${cols.length}-cols`);
    cols.forEach((col) => {
      const picture = col.querySelector('picture');
      const headings = col.querySelector('h1, h2, h3, h4, h5, h6');

      if (picture && !headings) {
        const figure = domEl('figure', { class: 'columns-col columns-img-col' });
        figure.append(...col.childNodes);
        col.replaceWith(figure);
      } else {
        const article = domEl('article', { class: 'columns-col columns-text-col' });
        article.append(...col.childNodes);
        col.replaceWith(article);
      }
    });
  });

  // Handle Left/Right positioning classes
  const firstCol = block.querySelector('.columns-col:first-child');
  const lastCol = block.querySelector('.columns-col:last-child');

  if (firstCol?.querySelector('picture')) {
    block.classList.add('image-left');
  }
  if (lastCol?.querySelector('picture')) {
    block.classList.add('image-right');
  }
}
