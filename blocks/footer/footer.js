import {
  decorateIcons, decorateBlock, getMetadata, createOptimizedPicture,
  toClassName,
} from '../../scripts/lib-franklin.min.js';
import {
  a, div, i, li, p, ul,
} from '../../scripts/dom-helpers.js';
import {
  decorateExternalLink, decorateLinkedPictures, formatDate,
  getData, toCapitalize, unixDateToString,
} from '../../scripts/scripts.js';
import { SITE_LOGO_ALT_VALUE, SITE_LOGO_URL } from '../header/header.js';
import { getLatestNewsletter } from '../../templates/blog/blog.js';
import { createHubSpotForm, loadHubSpotScript } from '../forms/forms.js';
import { decorateFooterSocialIcons, socialShareBlock } from '../social-share/social-share.js';

/* ================= utility helpers ================= */
const clear = (el) => { el.innerHTML = ''; };

const addChevron = (text, link) => (p(
  a({ href: link, 'aria-label': text },
    text,
    i({ class: 'fa fa-chevron-circle-right', 'aria-hidden': true })),
));

export const formatEntry = (item) => p(formatDate(unixDateToString(item.date)),
  document.createElement('br'),
  a({ href: item.path, 'aria-label': item.title }, item.title),
);

function toggleSection(container, target) {
  if (!target.parentElement.classList.contains('on')) {
    container.querySelectorAll('.toggle').forEach((item) => item.classList.toggle('on'));
  }
}

export function initToggleBehavior(container) {
  container.querySelectorAll('h3').forEach((heading) => {
    heading.addEventListener('click', (e) => toggleSection(container, e.target));
  });
}

/* news and events */
async function renderEvents(container) {
  const { events } = await getData();
  const sortedEvents = events.slice(0, 3);

  clear(container);

  sortedEvents.forEach((item) => {
    item.date = item.eventStart;
    container.append(formatEntry(item));
  });

  container.append(addChevron('More Events', '/events'));
}

async function renderNews(container) {
  const data = await getData();
  const news = data.news.slice(0, 3);
  clear(container);
  news.forEach((item) => container.append(formatEntry(item)));
  container.append(addChevron('More News', '/newsroom/news'));
}

export async function buildNewsEvents(container) {
  if (!container) return;

  [...container.children].forEach((row, rowIdx) => {
    [...row.children].forEach((col, colIdx) => {
      col.classList.add('toggle');
      if (colIdx === 0) col.classList.add('on');
      if (rowIdx === 1 && colIdx === 0) col.classList.add('news-list');
      if (rowIdx === 1 && colIdx === 1) col.classList.add('events-list');
    });
  });

  const newsEl = container.querySelector('.news-list');
  const eventsEl = container.querySelector('.events-list');

  await Promise.all([
    renderNews(newsEl),
    renderEvents(eventsEl),
  ]);

  initToggleBehavior(container);
}

/* newsletters */
async function getNewslettersList() {
  const data = await getData();
  const newsletters = data.newsletters.slice(0, 3);

  const list = ul({ class: 'newsletter-list' });

  newsletters.forEach((newsletter) => {
    let title = newsletter.path.split('/').pop();
    title = toCapitalize(title).replace(/-/g, ' ');
    list.appendChild(li(
      a({ href: newsletter.gatedURL },
        title,
        i({ class: 'fa fa-chevron-circle-right' }),
      )));
  });

  return list;
}

export async function buildNewsletter(container) {
  const newsletterId = 'enewsletter';
  if (container.querySelector(`#${newsletterId} form`)) return; // newsletter already present

  const formType = 'newsletter';
  const formHeading = 'Lab Notes eNewsletter';

  const form = div({ class: toClassName(`${formHeading}-wrapper`) },
    div({ id: newsletterId, class: 'enewsletter-wrapper', loading: 'lazy' },
      div({ class: 'hubspot-form', id: `${formType}-form` }),
    ),
  );
  // add submission form from hubspot
  container.querySelector(`#${newsletterId}`).replaceWith(form);

  const [latestNewsletter, newsletterList] = await Promise.all([
    getLatestNewsletter(),
    getNewslettersList(),
  ]);

  const formConfig = {
    formType,
    latestNewsletter,
    redirectUrl: 'null',
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        obs.disconnect();
        (window.requestIdleCallback || setTimeout)(() => {
          loadHubSpotScript(createHubSpotForm.bind(null, formConfig));
        });
      }
    });
  });

  observer.observe(container.querySelector(`#${newsletterId}`));

  const isNewsletterListExist = document.querySelector('.newsletter-list');
  if (!isNewsletterListExist) {
    const newsletterContainer = container.querySelector(`#${newsletterId}`);
    newsletterContainer.insertAdjacentElement('afterend', newsletterList);
  }
}

/* social icon */
function footerSocialIcons(element, className) {
  const parentEl = element.querySelector(className);
  const socials = ['linkedin-in', 'facebook-f', 'x-twitter', 'youtube'];
  parentEl.appendChild(socialShareBlock('', socials));
}

/* footer builder */
export function appendFooterStructure(block) {
  const wrapper = div({ class: 'footer-wrap' });
  const bottom = div({ class: 'footer-bottom' });

  const wrapContainer = div({ class: 'container' });
  const bottomContainer = div({ class: 'container' });

  wrapper.appendChild(wrapContainer);
  bottom.appendChild(bottomContainer);

  block.append(wrapper, bottom);

  return { wrapContainer, bottomContainer };
}

function decorateChinaComplianceRow(row, currentYear) {
  const externalLogoWrapper = div({ class: 'external-logo-wrapper' });
  row.querySelectorAll('p').forEach((logo) => externalLogoWrapper.appendChild(logo));
  row.prepend(externalLogoWrapper);

  const zhText = `©${currentYear} Molecular Devices, 美谷分子仪器（上海）有限公司版权所有 沪ICP备05056171号-1`;
  const zhLink = a({ href: 'https://beian.miit.gov.cn/#/Integrated/index' }, zhText);

  row.querySelector('.footer-contact')?.appendChild(p(zhLink));
}

export function decorateFooterRows(rows, wrapContainer, bottomContainer, currentYear) {
  rows.forEach((row, idx) => {
    decorateLinkedPictures(row);
    row.classList.add(`row-${idx + 1}`);
    row.querySelector('.section-metadata')?.remove();

    const isTop = idx <= 3;
    const target = isTop ? wrapContainer : bottomContainer;
    target.appendChild(row);

    if (idx === 3) {
      const inner = div({ class: `row-${idx + 1}-inner-wrapper` });
      while (row.firstChild) inner.appendChild(row.firstChild);
      row.appendChild(inner);
      footerSocialIcons(row, '.social-media-list');
      decorateFooterSocialIcons(row);
    }

    if (idx === 4) rows[3]?.appendChild(rows[4]);
    if (idx === 7) decorateChinaComplianceRow(row, currentYear);
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const template = getMetadata('template');
  const footerPath = template === 'Landing Page' ? '/footer-landing-page' : (getMetadata('footer') || '/footer');
  const footerPromise = fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  block.textContent = '';
  const currentYear = new Date().getFullYear();

  const footerSiteLogo = p({ class: 'footer-site-logo' },
    createOptimizedPicture(SITE_LOGO_URL, SITE_LOGO_ALT_VALUE, true, [
      { media: '(min-width: 992px)', width: 220, height: 65 },
      { width: 220, height: 65 },
    ]),
  );
  const copyrightInfo = p(`\u00A9${currentYear} Molecular Devices, LLC. All rights reserved.`);

  const resp = await footerPromise;
  const html = await resp.text();
  const footer = div();
  footer.innerHTML = html;

  footer.querySelector('.site-logo')?.appendChild(footerSiteLogo);
  footer.querySelector('.copyright-text')?.appendChild(copyrightInfo);

  if (template === 'Landing Page') {
    const footerWrapper = div({ class: 'footer-landing-page' });
    const container = div({ class: 'container' });
    const rows = Array.from(footer.children);
    rows.forEach((row) => container.appendChild(row));
    footerWrapper.appendChild(container);
    footer.appendChild(footerWrapper);
  } else {
    const { wrapContainer, bottomContainer } = appendFooterStructure(block);

    const rows = [...footer.children];
    decorateFooterRows(rows, wrapContainer, bottomContainer, currentYear);

    const newsSection = block.querySelector('.footer-news-events');
    if (newsSection) {
      const newsObserver = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          newsObserver.disconnect();
          buildNewsEvents(newsSection);
        }
      });
      newsObserver.observe(newsSection);
    }
    block.querySelectorAll('.footer-contact').forEach((contactBlock) => decorateBlock(contactBlock));
  }

  block.append(footer);
  block.querySelectorAll('a').forEach(decorateExternalLink);
  decorateIcons(block);

  block.querySelectorAll('a > picture').forEach((link) => {
    link.parentElement.setAttribute('target', '_blank');
  });

  /* newsletter */
  const newsletter = block.querySelector('.footer-newsletter-form');
  if (newsletter) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        buildNewsletter(newsletter);
      }
    });
    observer.observe(newsletter);
  }
}
