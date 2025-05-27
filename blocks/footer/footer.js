import {
  decorateIcons, decorateBlock, fetchPlaceholders, getMetadata,
  createOptimizedPicture,
  toClassName,
} from '../../scripts/lib-franklin.js';
import ffetch from '../../scripts/ffetch.js';
import {
  a, div, i, li, p, ul,
} from '../../scripts/dom-helpers.js';
import {
  decorateExternalLink, decorateLinkedPictures, formatDate, unixDateToString,
} from '../../scripts/scripts.js';
import { getNewsData } from '../news/news.js';
import { getFormId } from '../forms/formHelper.js';
import { createHubSpotForm, loadHubSpotScript } from '../forms/forms.js';
import { getLatestNewsletter } from '../../templates/blog/blog.js';

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
  const headings = container.querySelectorAll('h3');
  [...headings].forEach((heading) => {
    heading.addEventListener('click', (e) => {
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
  const news = await getNewsData(3);
  container.innerHTML = '';
  news.forEach(
    (item) => container.append(renderEntry(item)),
  );
  container.append(renderMoreLink(placeholders.moreNews || 'More News', '/newsroom/news'));
}

async function buildNewsEvents(container) {
  if (!container) return;
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

function capitalize(sting) {
  return sting[0].toUpperCase() + sting.slice(1);
}

async function getNewslettersList() {
  const newsletters = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource.type === 'Newsletter')
    .limit(3)
    .all();

  const list = ul({ class: 'newsletter-list' });
  newsletters.forEach((newsletter) => {
    let title = newsletter.path.split('/').slice(-1)[0];
    title = capitalize(title).split('-').join(' ');
    list.appendChild(li(a({ href: newsletter.gatedURL }, title, i({ class: 'fa fa-chevron-circle-right' }))));
  });
  return list;
}

async function buildNewsletter(container) {
  const newsletterId = 'enewsletter';
  if (container.querySelector(`#${newsletterId} form`)) {
    return; // newsletter already present
  }

  const formID = 'enewsletterSubscribeForm';
  const formType = 'newsletter';
  const formHeading = 'Lab Notes eNewsletter';

  const form = div({ class: toClassName(`${formHeading}-wrapper`) },
    div({
      id: newsletterId,
      class: 'enewsletter-wrapper',
      loading: 'lazy',
    }, div(
      {
        class: 'hubspot-form',
        id: formID,
      },
    )),
  );
  // add submission form from hubspot
  container.querySelector(`#${newsletterId}`).replaceWith(form);

  const formConfig = {
    formId: getFormId(formType),
    latestNewsletter: await getLatestNewsletter(),
    redirectUrl: null,
  };

  loadHubSpotScript(createHubSpotForm.bind(null, formConfig, formID, formType));

  const newsletterList = await getNewslettersList();
  const isNewsletterListExist = document.querySelector('.newsletter-list');

  if (!isNewsletterListExist) {
    container.querySelector(`#${newsletterId}`).insertAdjacentElement('afterend', newsletterList);
  }
}

/* decorate social icons */
function decorateSocialIcons(element, className) {
  element.querySelectorAll(`${className} a`).forEach((link) => {
    const social = link.children[0].classList[1].split('-').pop();
    link.setAttribute('aria-label', `Share to ${social}`);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  block.textContent = '';

  const template = getMetadata('template');
  let footerPath = getMetadata('footer') || '/footer';
  if (template === 'Landing Page') {
    footerPath = '/footer-landing-page';
  }

  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});
  const html = await resp.text();
  const footer = div();
  footer.innerHTML = html;

  const currentYear = new Date().getFullYear();
  const siteLogoPath = '/images/header-menus/logo.svg';
  const footerSiteLogo = p(
    { class: 'footer-site-logo' },
    a({ href: window.location.origin, title: 'Molecular Devices' },
      createOptimizedPicture(siteLogoPath, 'Molecular Devices'),
    ));
  const copyrightInfo = p(`\u00A9${currentYear} Molecular Devices, LLC. All rights reserved.`);
  footer.querySelector('.site-logo').appendChild(footerSiteLogo);
  footer.querySelector('.copyright-text').appendChild(copyrightInfo);

  if (template === 'Landing Page') {
    const footerWrapper = div({ class: 'footer-landing-page' });
    const container = div({ class: 'container' });
    const rows = Array.from(footer.children);
    rows.forEach((row) => {
      container.appendChild(row);
    });
    footerWrapper.appendChild(container);
    footer.appendChild(footerWrapper);
  } else {
    const footerWrap = div({ class: 'footer-wrap' });
    const footerBottom = div({ class: 'footer-bottom' });
    const wrapContainer = div({ class: 'container' });
    const bottomContainer = div({ class: 'container' });
    footerWrap.appendChild(wrapContainer);
    footerBottom.appendChild(bottomContainer);
    block.appendChild(footerWrap);
    block.appendChild(footerBottom);

    placeholders = await fetchPlaceholders();

    const rows = Array.from(footer.children);
    rows.forEach((row, idx) => {
      decorateLinkedPictures(row);
      row.classList.add(`row-${idx + 1}`);
      if (row.querySelector('.section-metadata')) {
        row.querySelector('.section-metadata').remove();
      }

      if (idx <= 3) {
        wrapContainer.appendChild(row);
      } else {
        bottomContainer.appendChild(row);
      }

      if (idx === 3) {
        const innerWrapper = div({ class: `row-${idx + 1}-inner-wrapper` });
        while (row.firstChild) {
          innerWrapper.appendChild(row.firstChild);
        }
        row.appendChild(innerWrapper);
        decorateSocialIcons(row, '.social-media-list');
      }

      if (idx === 4) {
        const row4 = rows[4];
        if (row4) {
          rows[3].appendChild(row4);
        }
      }

      if (idx === 7) {
        const row7 = rows[7];
        if (row7) {
          const copyrightInfoZH = p(a({ href: 'https://beian.miit.gov.cn/#/Integrated/index' }, `\u00A9${currentYear} Molecular Devices, 美谷分子仪器（上海）有限公司版权所有 沪ICP备05056171号-1`));
          row7.querySelector('.footer-contact').appendChild(copyrightInfoZH);
        }
      }
    });

    buildNewsEvents(block.querySelector('.footer-news-events'));
    block.querySelectorAll('.footer-contact').forEach((contactBlock) => decorateBlock(contactBlock));
  }

  block.append(footer);
  block.querySelectorAll('a').forEach(decorateExternalLink);
  decorateIcons(block);
  block.querySelectorAll('a > picture').forEach((link) => {
    link.parentElement.setAttribute('target', '_blank');
  });

  /*
   Creating the Newsletter has high TBT due to a high number of external scripts it brings.
   However it is an important business piece, so we make all the effort to give a good
   experience to user:
   1. We lazy load it 3 seconds later, but if the user reaches the footer before that
   2. We quickly load it with an intersection observer
   In most cases it is expected that the newsletter is already present when the user has
   scrolled down to it.
  */
  const newsletterContainer = block.querySelector('.footer-newsletter-form');
  if (newsletterContainer) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        buildNewsletter(newsletterContainer);
      }
    });
    observer.observe(newsletterContainer);

    setTimeout(() => {
      observer.disconnect();
      buildNewsletter(newsletterContainer);
    }, 3000);
  }
}
