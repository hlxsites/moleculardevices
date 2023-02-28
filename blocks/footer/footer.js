import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

function switchGroup(selectionTitle, position) {
  [...selectionTitle.parentElement.children].forEach((h3) => {
    h3.classList.add('off');
    h3.classList.remove('on');
  });
  selectionTitle.classList.add('on');
  selectionTitle.classList.remove('off');
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

  const newsTitle = footer.querySelector('.footer-news-events h3:nth-of-type(1)');
  newsTitle.innerHTML = `<a>${newsTitle.textContent}</a>`;
  newsTitle.querySelector('a').addEventListener('click', () => {
    switchGroup(newsTitle, 1);
  });

  const eventsTitle = footer.querySelector('.footer-news-events h3:nth-of-type(2)');
  eventsTitle.innerHTML = `<a>${eventsTitle.textContent}</a>`;
  eventsTitle.querySelector('a').addEventListener('click', () => {
    switchGroup(eventsTitle, 2);
  });

  const blockDiv = newsTitle.parentElement.parentElement.parentElement;
  let i;
  for (i = 1; i < blockDiv.children.length; i += 1) {
    const div = blockDiv.children[i];
    const pars = div.querySelectorAll('p');
    pars.item(pars.length - 1).innerHTML
        += "<span class='icon-icon_link'></span>";
  }

  await decorateIcons(footer);
  block.append(footer);
}
