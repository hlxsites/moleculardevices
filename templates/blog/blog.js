/* eslint-disable import/no-cycle */
import {
  div, img, h3, p, h5,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { createHubSpotForm, loadHubSpotScript } from '../../blocks/forms/forms.js';
import { decorateModal } from '../../blocks/modal/modal.js';
import { sortDataByDate } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

export async function newsletterModal(iframeID) {
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
        div({
          class: 'hubspot-form',
          id: iframeID,
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

  const formConfig = {
    formId: '9530db8b-2803-469c-a178-9b74f9cb504a',
  };

  loadHubSpotScript(createHubSpotForm.bind(null, formConfig, iframeID));
  await decorateModal(modalBody, 'newsletter-inner-wrapper', true);
}

export async function getBlogAndPublications() {
  let data = [];
  const publications = await ffetch('/query-index.json')
    .sheet('publications')
    .filter((resource) => resource.publicationType === 'Full Article')
    .all();

  const blogs = await ffetch('/query-index.json')
    .sheet('blog')
    .all();

  data = [...publications, ...blogs];
  return sortDataByDate(data);
}

export default async function decorate() {
  const newsletterMetaData = getMetadata('newsletter-modal');
  const hasNewsletterMetaData = newsletterMetaData.toLowerCase() === 'hide';

  const spectraNewsletter = document.querySelector('.spectra-newsletter-column');
  const modalIframeID = 'newsletter-modal';

  if (spectraNewsletter) {
    const sidebarIframeID = 'newsletter-sidebar';
    const sidebar = div(
      { class: 'spectra-newsletter' },
      h3('Join our journey of scientific discovery'),
      h5('Each month, we’ll share trends our customers are setting in science and breakthroughs we’re enabling together with promises of a brighter, healthier future.'),
      div({
        class: 'contact-quote-request hubspot-form',
        id: sidebarIframeID,
      }),
    );
    const formConfig = {
      formId: '9530db8b-2803-469c-a178-9b74f9cb504a',
    };

    loadHubSpotScript(createHubSpotForm.bind(null, formConfig, sidebarIframeID));
    spectraNewsletter.appendChild(sidebar);
  }

  if (!hasNewsletterMetaData) {
    setTimeout(() => newsletterModal(modalIframeID), 1000);
  }

  // add social share block
  const blogCarousel = document.querySelector('.recent-blogs-carousel');
  if (blogCarousel) {
    const blogCarouselSection = blogCarousel.parentElement;
    const socialShareSection = div(div({ class: 'social-share' }));
    blogCarouselSection.parentElement.insertBefore(socialShareSection, blogCarouselSection);
  }
}
