/* eslint-disable import/no-cycle */
import { decorateModal } from '../../blocks/modal/modal.js';
import {
  div, img, iframe, h3, p, h5,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { getMetadata } from '../../scripts/lib-franklin.js';
import { iframeResizeHandler } from '../../scripts/scripts.js';

async function addNewsletterInParams(formURL) {
  const queryParams = new URLSearchParams(window.location.search);
  const cmpID = queryParams.get('cmp') || '';
  const resources = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource.type === 'Newsletter')
    .limit(1)
    .all();
  const latestNewsletter = resources[0]?.gatedURL || '';
  return `${formURL}?latest_newsletter=${latestNewsletter}&cmp=${cmpID}`;
}

export async function newsletterModal(formURL, iframeID) {
  const iframeSrc = await addNewsletterInParams(formURL);

  const leftColumn = div(
    { class: 'col col-left' },
    img({ src: '/images/spectra-lab-notes.png', alt: 'Spectra' }),
    p("Each month, we'll share trends our customers are setting in science and breakthroughs we're enabling together with promises of a brighter, healthier future."),
  );

  const rightColumn = div(
    { class: 'col col-right' },
    div(
      { class: 'iframe-wrapper' },
      div(
        h3('Join our journey'),
        h3('of scientific discovery'),
        iframe({
          src: iframeSrc,
          id: iframeID,
          loading: 'lazy',
          title: 'Modal Newsletter',
        }),
      ),
    ),
  );

  const modalBody = div(
    { class: 'modal-form' },
    div(
      { class: 'columns columns-2-cols' },
      leftColumn,
      rightColumn,
    ),
  );

  await decorateModal(formURL, iframeID, modalBody, 'newsletter-inner-wrapper', true);
}

export default async function decorate() {
  const newsletterMetaData = getMetadata('newsletter-modal');
  const hasNewsletterMetaData = newsletterMetaData.toLowerCase() === 'hide';

  const spectraNewsletter = document.querySelector('.spectra-newsletter-column');
  const formURL = 'https://info.moleculardevices.com/lab-notes-popup';
  const modalIframeID = 'newsletter-modal';

  if (spectraNewsletter) {
    const sidebarIframeID = 'newsletter-sidebar';
    const iframeSrc = await addNewsletterInParams(formURL);
    const sidebar = div(
      { class: 'spectra-newsletter' },
      h3('Join our journey of scientific discovery'),
      h5('Each month, we’ll share trends our customers are setting in science and breakthroughs we’re enabling together with promises of a brighter, healthier future.'),
      iframe({
        src: iframeSrc,
        id: sidebarIframeID,
        loading: 'lazy',
        title: 'Newsletter',
      }),
    );

    spectraNewsletter.appendChild(sidebar);
    iframeResizeHandler(formURL, sidebarIframeID, spectraNewsletter);
  }

  if (!hasNewsletterMetaData) {
    setTimeout(() => newsletterModal(formURL, modalIframeID), 1000);
  }

  // add social share block
  const blogCarousel = document.querySelector('.recent-blogs-carousel');
  if (blogCarousel) {
    const blogCarouselSection = blogCarousel.parentElement;
    const socialShareSection = div(div({ class: 'social-share' }));
    blogCarouselSection.parentElement.insertBefore(socialShareSection, blogCarouselSection);
  }
}
