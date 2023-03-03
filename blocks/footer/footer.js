import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

function switchGroup(selectionTitle, position) {
  [...selectionTitle.parentElement.children].forEach((h3) => {
    if (h3 !== selectionTitle) {
      h3.classList.add('off');
      h3.classList.remove('on');
    } else {
      h3.classList.add('on');
      h3.classList.remove('off');
    }
  });
  const blockDiv = selectionTitle.closest('.footer-news-events');
  [...blockDiv.children].forEach((div) => {
    div.classList.add('off');
    div.classList.remove('on');
  });
  blockDiv.children[0].classList.add('on');
  blockDiv.children[0].classList.remove('off');
  blockDiv.children[position].classList.add('on');
  blockDiv.children[position].classList.remove('off');
}

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;

  const titles = footer.querySelectorAll('.footer-news-events h3');
  [...titles].forEach((title, i) => {
    const a = document.createElement('a');
    a.textContent = title.textContent;
    a.setAttribute('aria-label', title.textContent);
    title.textContent = '';
    title.append(a);
    title.querySelector('a').addEventListener('click', () => {
      switchGroup(title, i + 1);
    });
  });

  const blockDiv = footer.querySelector('.footer-news-events');
  [...blockDiv.children].forEach((div) => {
    const pars = div.querySelectorAll('p');
    const par = pars.item(pars.length - 1);
    if (par) {
      par.innerHTML
        += "<span class='icon-icon_link'></span>";
    }
  });

  await decorateIcons(footer);
  block.append(footer);
}
