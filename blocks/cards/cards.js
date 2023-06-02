import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { a } from '../../scripts/dom-helpers.js';

// prettier-ignore
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  if (block.classList.contains('image-link')) {
    block.querySelectorAll('li').forEach((li) => {
      const link = li.querySelector('a');
      const picture = li.querySelector('picture');
      const pictureClone = picture.cloneNode(true);
      const newLink = a({ href: link.href }, pictureClone);
      picture.parentNode.replaceChild(newLink, picture);
    });
  }
}
