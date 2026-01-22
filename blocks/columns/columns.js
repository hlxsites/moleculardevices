import { domEl } from '../../scripts/dom-helpers.js';
import { embedCerosFrame } from '../embed/embed.js';

function decorateEmbed(elems) {
  elems.forEach((elem) => {
    const embedHTML = embedCerosFrame(elem);
    const container = domEl('aside', { class: 'embed embed-ceros' });
    container.innerHTML = embedHTML;
    elem.replaceWith(container);
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

    // Handle Left/Right positioning classes
    const updatedCols = row.querySelectorAll('.columns-col');
    if (updatedCols.length > 0) {
      if (updatedCols[0].tagName === 'FIGURE') {
        row.classList.add('image-left');
      }
      if (updatedCols[updatedCols.length - 1].tagName === 'FIGURE') {
        row.classList.add('image-right');
      }
    }
  });
}
