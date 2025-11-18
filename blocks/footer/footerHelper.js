import {
  a, p, i, ul, li, div,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { toClassName } from '../../scripts/lib-franklin.js';
import {
  decorateLinkedPictures, formatDate, toCapitalize, unixDateToString,
} from '../../scripts/scripts.js';
import { getLatestNewsletter } from '../../templates/blog/blog.js';
import { createHubSpotForm, loadHubSpotScript } from '../forms/forms.js';
import { getNewsData } from '../news/news.js';
import { decorateFooterSocialIcons, socialShareBlock } from '../social-share/social-share.js';

/* utility helpers */
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
  const events = await ffetch('/query-index.json')
    .sheet('events')
    .filter((item) => item.eventEnd * 1000 > Date.now())
    .all();

  const sortedEvents = events
    .sort((first, second) => first.eventStart - second.eventStart).slice(0, 3);

  clear(container);

  sortedEvents.forEach((item) => {
    item.date = item.eventStart;
    container.append(formatEntry(item));
  });

  container.append(addChevron('More Events', '/events'));
}

async function renderNews(container) {
  const news = await getNewsData(3);
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

  await renderNews(container.querySelector('.news-list'));
  await renderEvents(container.querySelector('.events-list'));
  initToggleBehavior(container);
}

/* newsletters */
async function getNewslettersList() {
  const newsletters = await ffetch('/query-index.json')
    .sheet('newsletters')
    .limit(3)
    .all();

  const list = ul({ class: 'newsletter-list' });

  newsletters.forEach((newsletter) => {
    let title = newsletter.path.split('/').pop();
    title = toCapitalize(title).replace(/-/g, ' ');
    list.appendChild(li(a({ href: newsletter.gatedURL }, title, i({ class: 'fa fa-chevron-circle-right' }))));
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

  const formConfig = {
    formType,
    latestNewsletter: await getLatestNewsletter(),
    redirectUrl: 'null',
  };

  loadHubSpotScript(createHubSpotForm.bind(null, formConfig));

  const newsletterList = await getNewslettersList();
  const isNewsletterListExist = document.querySelector('.newsletter-list');

  if (!isNewsletterListExist) {
    container.querySelector(`#${newsletterId}`).insertAdjacentElement('afterend', newsletterList);
  }
}

/* social icon */
function footerSocialIcons(element, className) {
  const parentEl = element.querySelector(className);
  const socials = ['linkedin-in', 'facebook-f', 'youtube'];
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
