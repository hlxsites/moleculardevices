/* eslint-disable import/no-cycle */
import { createHubSpotForm, loadHubSpotScript } from '../../blocks/forms/forms.js';
import { getRFQDataByFamilyID } from '../../blocks/quote-request/quote-request.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
import {
  a, div, h2, p,
} from '../../scripts/dom-helpers.js';

const formType = 'product-rfq';
export const productThankyouSection = `${formType}-thankyou-section`;
const SCROLL_OFFSET = -100;

function rfqThankyouMessage() {
  return div({ class: 'submitted-message forms' },
    h2('Thank you!'),
    p('We have received your request for quote and would like to thank you for contacting us. We have sent you an email to confirm your details.'),
    p('A sales rep will be contacting you within 24-business hours. If you require immediate attention, please feel free to ',
      a({ href: '/contact', title: 'contact us' }, 'contact us.')),
    h2('Have a great day!'),
    createOptimizedPicture('/images/e-mail-thankyou-icon.png', 'E-mail Icon', true),
    p('Return to Molecular Devices ', a({ href: '/', title: 'home page' }, 'home page.')),
  );
}

/**
 * Waits until a section's data-section-status becomes "loaded"
 * @param {HTMLElement} section
 * @returns {Promise<void>}
 */
function waitForSectionLoad(section) {
  return new Promise((resolve) => {
    if (section.dataset.sectionStatus === 'loaded') {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (section.dataset.sectionStatus === 'loaded') {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(section, { attributes: true, attributeFilter: ['data-section-status'] });
  });
}

/**
 * Scroll smoothly to a section
 */
function scrollToSection(section, offset = SCROLL_OFFSET) {
  const y = section.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

export default async function decorateProductRFQForm() {
  let formLoaded = false;

  async function initForm() {
    if (formLoaded) return;
    const formBlock = document.querySelector(`#${formType}-form, .${formType}-form`);
    if (!formBlock) return;

    const formSection = formBlock.closest('.section');
    if (!formSection) return;

    const pageParam = new URLSearchParams(window.location.search).get('page');

    // Thank You page flow
    if (pageParam?.toLowerCase() === 'thankyou') {
      formSection.id = productThankyouSection;
      formSection.classList.add(productThankyouSection);
      formSection.classList.remove('columns-2');
      formSection.replaceChildren(rfqThankyouMessage());

      // wait until section loaded then scroll
      await waitForSectionLoad(formSection);
      requestAnimationFrame(() => scrollToSection(formSection));

      formLoaded = true;
      return;
    }

    // Load HubSpot Form
    const familyID = getMetadata('family-id') || '';
    if (!familyID) {
      // eslint-disable-next-line no-console
      console.error('[RFQ Form] No family ID found on page metadata, skipping RFQ form initialization.');
      return;
    }

    const RFQData = await getRFQDataByFamilyID(familyID);
    const formConfig = { formType, ...RFQData };

    await waitForSectionLoad(formSection);
    loadHubSpotScript(() => createHubSpotForm(formConfig));

    formLoaded = true;
  }

  // Global observer ensures form gets initialized when block arrives in DOM
  const observer = new MutationObserver(() => { initForm(); });
  observer.observe(document.body, { childList: true, subtree: true });

  // Try immediately in case form is already there
  initForm();
}
