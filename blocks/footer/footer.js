import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

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

  const footerWrap = document.createElement('div');
  const footerBottom = document.createElement('div');
  footerWrap.classList.add('footer-wrap');
  footerBottom.classList.add('footer-bottom');

  [...footer.children].forEach((row, i) => {
    row.classList.add(`row-${i + 1}`);
    if (i <= 3) {
      footerWrap.appendChild(row);
    } else {
      footerBottom.appendChild(row);
    }
  });

  block.appendChild(footerWrap);
  block.appendChild(footerBottom);

  await decorateIcons(footer);
  block.append(footer);
}
