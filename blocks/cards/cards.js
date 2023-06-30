import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { a, li as liHelper, div as divHelper } from '../../scripts/dom-helpers.js';

// prettier-ignore
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const wrappingDiv = divHelper({ class: 'cards-card-wrapper' }, ...row.children);
    [...wrappingDiv.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });

    const li = liHelper(wrappingDiv);

    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  if (block.classList.contains('image-link') || block.classList.contains('who-we-are')) {
    block.querySelectorAll('li').forEach((li) => {
      const link = li.querySelector('a');
      li.querySelectorAll('picture').forEach((picture) => {
        const pictureClone = picture.cloneNode(true);
        const newLink = a({ href: link.href }, pictureClone);
        picture.parentNode.replaceChild(newLink, picture);
      });
    });
  } else if (block.classList.contains('image-only')) {
    block.querySelectorAll('li').forEach((li) => {
      const link = li.querySelector('a');
      const picture = li.querySelector('picture');
      const pictureClone = picture.cloneNode(true);
      const newLink = a({ href: link.href }, pictureClone);
      picture.parentNode.replaceChild(newLink, picture);
      const cardBody = li.querySelector('.cards-card-body');
      cardBody.parentNode.removeChild(cardBody);
    });
  }
}
