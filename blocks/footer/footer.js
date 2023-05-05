import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import { a, i, p } from '../../scripts/dom-helpers.js';
import { formatDate, unixDateToString } from '../../scripts/scripts.js';

function toggleNewsEvents(container, target) {
  if (!target.parentElement.classList.contains('on')) {
    const items = container.querySelectorAll('.toggle');
    [...items].forEach((item) => {
      item.classList.toggle('on');
    });
  }
}

function addEventListeners(container) {
  const h3s = container.querySelectorAll('h3');
  [...h3s].forEach((h3) => {
    h3.addEventListener('click', (e) => {
      toggleNewsEvents(container, e.target);
    });
  });
}

function renderEntry(item) {
  return (
    p(formatDate(unixDateToString(item.date)),
      document.createElement('br'),
      a({
        href: item.path,
        'aria-label': item.title,
      }, item.title),
    )
  );
}

function renderMoreLink(text, link) {
  return (
    p(
      a({
        href: link,
        'aria-label': text,
      }, text, i({
        class: 'fa fa-chevron-circle-right',
        'aria-hidden': true,
      }),
      ),
    )
  );
}

async function renderEvents(container) {
  const events = await ffetch('/query-index.json')
    .filter(({ type }) => (type === 'Event'))
    .slice(0, 3)
    .all();
  container.innerHTML = '';
  events.forEach(
    (item) => container.append(renderEntry(item)),
  );
  container.append(renderMoreLink('More Events', '/events'));
}

async function renderNews(container) {
  const news = await ffetch('/query-index.json')
    .sheet('news')
    .slice(0, 3)
    .all();
  container.innerHTML = '';
  news.forEach(
    (item) => container.append(renderEntry(item)),
  );
  container.append(renderMoreLink('More News', '/newsroom/news'));
}

async function buildNewsEvents(container) {
  [...container.children].forEach((row, j) => {
    [...row.children].forEach((column, k) => {
      column.classList.add('toggle');
      if (k === 0) {
        column.classList.add('on');
      }
      if (j === 1 && k === 0) {
        column.classList.add('news-list');
      } else if (j === 1 && k === 1) {
        column.classList.add('events-list');
      }
    });
  });

  renderNews(container.querySelector('.news-list'));
  renderEvents(container.querySelector('.events-list'));

  addEventListeners(container);
}

function decorateSocialMediaLinks(socialIconsContainer) {
  socialIconsContainer.querySelectorAll('a').forEach((iconLink) => {
    iconLink.ariaLabel = `molecular devices ${iconLink.children[0].classList[1].split('-')[2]} page`;
  });
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

  const footerWrap = document.createElement('div');
  const footerBottom = document.createElement('div');
  footerWrap.classList.add('footer-wrap');
  footerBottom.classList.add('footer-bottom');
  block.appendChild(footerWrap);
  block.appendChild(footerBottom);

  [...footer.children].forEach((row, idx) => {
    row.classList.add(`row-${idx + 1}`);
    if (idx <= 3) {
      footerWrap.appendChild(row);
    } else {
      footerBottom.appendChild(row);
    }

    if (idx === 4) {
      decorateSocialMediaLinks(row);
    }
  });

  const footerNewsEvents = block.querySelector('.footer-news-events');
  buildNewsEvents(footerNewsEvents);

  block.append(footer);
  await decorateIcons(block);
}
