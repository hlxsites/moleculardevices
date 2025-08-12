/* eslint-disable linebreak-style */
import { createHubSpotForm, loadHubSpotScript } from '../../blocks/forms/forms.js';
import { getRFQDataByFamilyID } from '../../blocks/quote-request/quote-request.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
import {
  a, div, h2, p,
} from '../../scripts/dom-helpers.js';

const formType = 'product-rfq';

function rfqThankyouMessage() {
  const thankyouWrapper = div({ class: 'submitted-message' });
  const heading1 = h2('Thank you!');
  const para1 = p('We have received your request for quote and would like to thank you for contacting us. We have sent you an email to confirm your details.');
  const para2 = p('A sales rep will be contacting you within 24-business hours. If you require immediate attention, please feel free to', a({ href: '/contact', title: 'contact us' }, 'contact us.'));
  const heading2 = h2('Have a great day!');
  const emailIcon = createOptimizedPicture('/images/e-mail-thankyou-icon.png', 'E-mail Icon', true);
  const para3 = p('Return to Molecular Devices', a({ href: '/', title: 'home page' }, 'home page.'));
  thankyouWrapper.appendChild(heading1);
  thankyouWrapper.appendChild(para1);
  thankyouWrapper.appendChild(para2);
  thankyouWrapper.appendChild(heading2);
  thankyouWrapper.appendChild(emailIcon);
  thankyouWrapper.appendChild(para3);
  return thankyouWrapper;
}

export default async function buildAutoBlocks() {
  let formLoaded = false;

  const initForm = async () => {
    if (formLoaded) return true;

    const formBlock = document.getElementById(`${formType}-form`);
    if (!formBlock) return false;

    const pageParam = (new URLSearchParams(window.location.search)).get('page');
    if (pageParam && pageParam === 'thankyou') {
      const thankyouMessage = rfqThankyouMessage();
      const formSection = formBlock.closest('.section');
      formSection.classList.add('product-rfq-thankyou-section');
      formSection.classList.remove('columns-2');
      formSection.firstElementChild.remove();
      formBlock.parentElement.replaceWith(thankyouMessage);
      formLoaded = true;
      return true;
    }

    formLoaded = true;

    const familyID = getMetadata('family-id');
    const RFQData = await getRFQDataByFamilyID(familyID);

    const formConfig = {
      ...RFQData,
      formType,
      formId: RFQData?.formId || formType || '',
    };

    loadHubSpotScript(createHubSpotForm.bind(null, formConfig));
    return true;
  };

  if (await initForm()) return;

  const observer = new MutationObserver(async () => {
    if (formLoaded) return;
    if (await initForm()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
