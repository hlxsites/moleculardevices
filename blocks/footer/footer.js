import {
  readBlockConfig, decorateIcons, decorateBlock, fetchPlaceholders,
} from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import {
  a, div, i, iframe, p,
} from '../../scripts/dom-helpers.js';
import {
  decorateExternalLink, formatDate, loadScript, unixDateToString,
} from '../../scripts/scripts.js';

let placeholders = {};

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
    .sheet('events')
    .filter((item) => item.eventEnd * 1000 > Date.now())
    .all();
  const sortedEvents = events.sort((first, second) => first.eventStart - second.eventStart)
    .slice(0, 3);
  container.innerHTML = '';
  sortedEvents.forEach((item) => {
    item.date = item.eventStart;
    container.append(renderEntry(item));
  });
  container.append(renderMoreLink(placeholders.moreEvents || 'More Events', '/events'));
}

async function renderNews(container) {
  const news = await ffetch('/query-index.json')
    .sheet('news')
    .chunks(5)
    .slice(0, 3)
    .all();
  container.innerHTML = '';
  news.forEach(
    (item) => container.append(renderEntry(item)),
  );
  container.append(renderMoreLink(placeholders.moreNews || 'More News', '/newsroom/news'));
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

function iframeResizeHandler(formUrl, id, container) {
  const resizerPromise = new Promise((resolve) => {
    loadScript('/scripts/iframeResizer.min.js', () => { resolve(); });
  });

  container.querySelector('iframe').addEventListener('load', async () => {
    if (formUrl) {
      await resizerPromise;
      /* global iFrameResize */
      iFrameResize({ log: false }, id);
    }
  });
}

async function buildNewsletter(container) {
  const newsletterId = 'enewsletter';
  if (container.querySelector(`#${newsletterId} iframe`)) {
    return; // newsletter already present
  }

  const formId = 'enewsletterSubscribeForm';
  const formUrl = 'https://info.moleculardevices.com/newsletter-signup';
  const form = (
    div({
      id: newsletterId,
      class: 'hubspot-iframe-wrapper',
      loading: 'lazy',
    },
    div(
      iframe({
        id: formId,
        src: formUrl,
        loading: 'lazy',
        title: 'Newsletter',
      }),
    ),
    )
  );
  // add submission form from hubspot
  container.querySelector(`#${newsletterId}`).replaceWith(form);
  iframeResizeHandler(formUrl, `#${formId}`, container);
  // remove terms from plain footer, they are provided as part of the iframe
  container.querySelector(`#${newsletterId} + p`).remove();
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

  placeholders = await fetchPlaceholders();

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

  buildNewsEvents(block.querySelector('.footer-news-events'));
  block.querySelectorAll('.footer-contact').forEach((contactBlock) => decorateBlock(contactBlock));

  block.append(footer);
  block.querySelectorAll('a').forEach(decorateExternalLink);
  await decorateIcons(block);

  /*
   Creating the Newsletter has high TBT due to a high number of external scripts it brings.
   However it is an important business piece, so we make all the effort to give a good
   experience to user:
   1. We lazy load it 3 seconds later, but if the user reaches the footer before that
   2. We quickly load it with an intersection observer
   In most cases it is expected that the newsletter is already present when the user has
   scrolled down to it.
  */
  const newsletterContainter = block.querySelector('.footer-newsletter-form');

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      buildNewsletter(newsletterContainter);
    }
  });
  observer.observe(newsletterContainter);

  setTimeout(() => {
    observer.disconnect();
    buildNewsletter(newsletterContainter);
  }, 3000);
}
