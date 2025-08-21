/* eslint-disable import/no-cycle */
import { createHubSpotForm, loadHubSpotScript } from '../../blocks/forms/forms.js';
import { getRFQDataByFamilyID } from '../../blocks/quote-request/quote-request.js';
import { createOptimizedPicture, getMetadata, toClassName } from '../../scripts/lib-franklin.js';
import {
  a, div, h2, p,
} from '../../scripts/dom-helpers.js';
import PRODUCT_FORM_DATA from './ProductFormData.js';
import { scrollToSection } from '../../scripts/utilities.js';

const formType = 'product-rfq';
export const productThankyouSection = `${formType}-thankyou-section`;

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

async function decorateDefaultContent(data) {
  const wrapper = div({ class: 'default-content-wrapper' });
  const headingEl = h2(data.heading);
  const bodyEls = data.bodyContent.map((text) => p(text));
  const section = div(
    { class: 'default-content-item' },
    headingEl,
    ...bodyEls,
  );
  wrapper.appendChild(section);
  return wrapper;
}

let formLoaded = false;
let formLoading = false;

async function initForm() {
  if (formLoaded || formLoading) return;
  formLoading = true;

  const formBlock = document.querySelector(`#${formType}-form, .${formType}-form`);
  if (!formBlock) {
    formLoading = false;
    return;
  }

  const formSection = formBlock.closest('.section');
  if (!formSection) {
    formLoading = false;
    return;
  }

  const pageParam = new URLSearchParams(window.location.search).get('page');

  // Thank You page flow
  if (pageParam?.toLowerCase() === 'thankyou') {
    formSection.id = productThankyouSection;
    formSection.classList.add(productThankyouSection);
    formSection.classList.remove('columns-2');
    formSection.replaceChildren(rfqThankyouMessage());

    requestAnimationFrame(() => scrollToSection(formSection));

    formLoaded = true;
    formLoading = false;
    return;
  }

  // Load HubSpot Form
  const familyID = getMetadata('family-id') || '';
  if (!familyID) {
    // eslint-disable-next-line no-console
    console.error('[RFQ Form] No family ID found on page metadata, skipping RFQ form initialization.');
    formLoading = false;
    return;
  }

  const category = getMetadata('category');
  formSection.classList.add(`${toClassName(category)}-form-section`);
  const defaultWrapper = formSection.querySelector('.default-content-wrapper');
  const data = PRODUCT_FORM_DATA.find((formData) => formData.type === category);
  if (!defaultWrapper) formSection.prepend(await decorateDefaultContent(data));

  const RFQData = await getRFQDataByFamilyID(familyID);
  const formConfig = {
    formType,
    ...RFQData,
    cta: 'Request more information',
    heading: data.formTitle,
  };

  loadHubSpotScript(() => createHubSpotForm(formConfig));

  formLoaded = true;
  formLoading = false;
}

export default async function decorateProductPage() {
  const template = getMetadata('template');

  if (template) {
    const observer = new MutationObserver(() => {
      if (!formLoaded && !formLoading) {
        initForm().then(() => {
          if (formLoaded) observer.disconnect();
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    initForm();
  }
}
