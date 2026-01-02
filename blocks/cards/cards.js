import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { domEl } from '../../scripts/dom-helpers.js';
import { applyAdaptiveTextColor } from '../../scripts/utilities.js';

export default function decorate(block) {
  const ul = domEl('ul');

  [...block.children].forEach((row) => {
    const article = domEl('article', { class: 'cards-card-wrapper' }, ...row.children);

    [...article.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        const figure = domEl('figure', { class: 'cards-card-image' });
        figure.append(...div.childNodes);
        div.replaceWith(figure);
      } else {
        div.className = 'cards-card-body';
      }
    });

    const li = domEl('li', article);
    ul.append(li);
  });

  /* optimize picture */
  ul.querySelectorAll('img').forEach((img) => {
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPicture);
  });

  block.textContent = '';
  block.append(ul);

  if (block.classList.contains('image-link') || block.classList.contains('who-we-are')) {
    block.querySelectorAll('li').forEach((li) => {
      const link = li.querySelector('a');
      if (link) {
        li.querySelectorAll('picture').forEach((picture) => {
          const pictureClone = picture.cloneNode(true);
          const newLink = domEl('a', { href: link.href }, pictureClone);
          picture.parentNode.replaceChild(newLink, picture);
        });
      }
    });
  } else if (block.classList.contains('image-only')) {
    block.querySelectorAll('li').forEach((li) => {
      const link = li.querySelector('a');
      const picture = li.querySelector('picture');
      if (link && picture) {
        const pictureClone = picture.cloneNode(true);
        const newLink = domEl('a', { href: link.href }, pictureClone);
        picture.parentNode.replaceChild(newLink, picture);
        const cardBody = li.querySelector('.cards-card-body');
        cardBody.parentNode.removeChild(cardBody);
      }
    });
  }

  /* color preview card */
  if (block.classList.contains('color-preview-cards')) {
    block.querySelectorAll('.cards-card-wrapper').forEach((card) => {
      const body = card.querySelector('.cards-card-body');
      const bg = body.textContent.trim();
      card.closest('li').style.background = bg;
      applyAdaptiveTextColor(card.closest('li'), bg);
    });
  }
}
