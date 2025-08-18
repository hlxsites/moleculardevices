/* eslint-disable import/no-cycle */
import { createHubSpotForm, loadHubSpotScript } from '../../blocks/forms/forms.js';
import { getRFQDataByFamilyID } from '../../blocks/quote-request/quote-request.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
import {
  a, div, h2, p,
} from '../../scripts/dom-helpers.js';
import { scrollToFranklinSection } from '../../scripts/utilities.js';

const formType = 'product-rfq';
export const productThankyouSection = `${formType}-thankyou-section`;

function rfqThankyouMessage() {
  const thankyouWrapper = div({ class: 'submitted-message forms' });
  const heading1 = h2('Thank you!');
  const para1 = p('We have received your request for quote and would like to thank you for contacting us. We have sent you an email to confirm your details.');
  const para2 = p('A sales rep will be contacting you within 24-business hours. If you require immediate attention, please feel free to ', a({ href: '/contact', title: 'contact us' }, 'contact us.'));
  const heading2 = h2('Have a great day!');
  const emailIcon = createOptimizedPicture('/images/e-mail-thankyou-icon.png', 'E-mail Icon', true);
  const para3 = p('Return to Molecular Devices ', a({ href: '/', title: 'home page' }, 'home page.'));
  thankyouWrapper.appendChild(heading1);
  thankyouWrapper.appendChild(para1);
  thankyouWrapper.appendChild(para2);
  thankyouWrapper.appendChild(heading2);
  thankyouWrapper.appendChild(emailIcon);
  thankyouWrapper.appendChild(para3);
  return thankyouWrapper;
}

export default async function decorateProductRFQForm() {
  let formLoaded = false;

  const initForm = async (observer) => {
    if (formLoaded) return true;

    const formBlock = document.querySelector(`#${formType}-form, .${formType}-form`);
    if (!formBlock) return false;

    const pageParam = new URLSearchParams(window.location.search).get('page');

    // Thank You Message
    if (pageParam && pageParam?.toLowerCase() === 'thankyou') {
      const formSection = formBlock.closest('.section');
      formSection.id = productThankyouSection;
      if (!formSection) return false;

      formSection.classList.add(productThankyouSection);
      formSection.classList.remove('columns-2');
      formSection.innerHTML = '';
      formSection.appendChild(rfqThankyouMessage());

      setTimeout((scrollToFranklinSection(formSection, -100)), 1000);

      formLoaded = true;
      if (observer) observer.disconnect();
      return true;
    }

    // Load Form
    const familyID = getMetadata('family-id') || '';
    if (!familyID) {
      // eslint-disable-next-line no-console
      console.error('No family ID found for RFQ form');
      if (observer) observer.disconnect();
      return false;
    }

    const RFQData = await getRFQDataByFamilyID(familyID);
    const formConfig = { formType, ...RFQData };

    loadHubSpotScript(createHubSpotForm.bind(null, formConfig));

    formLoaded = true;
    if (observer) observer.disconnect();
    return true;
  };

  const observer = new MutationObserver(async () => {
    await initForm(observer);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
