/* eslint-disable import/no-cycle */
import {
  button, div, h3, li, p, ul,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture, getMetadata, loadCSS } from '../../scripts/lib-franklin.js';
import { loadScript, toTitleCase } from '../../scripts/scripts.js';
import { scrollToSection } from '../../scripts/utilities.js';
import decorateProductPage, { productThankyouSection, rfqThankyouMessage } from '../../templates/product/product.js';
import PRODUCT_FORM_DATA from '../../templates/product/ProductFormData.js';
import {
  extractFormData, getFormFieldValues, getFormId, handleFormSubmit, initHTMLDateInput,
  updateFormFields,
} from './formHelper.js';
import { formMapping } from './formMapping.js';

/* create hubspot form */
export async function createHubSpotForm(formConfig) {
  try {
    if (window.hbspt?.forms) {
      window.hbspt?.forms.create({
        region: formConfig.region || 'na1',
        portalId: formConfig.portalId || '20222769',
        formId: getFormId(formConfig.formType),
        target: `#${formConfig.formType}-form`,

        onFormReady: async (form) => {
          // Handle Salesforce hidden fields
          const fieldValues = await getFormFieldValues(formConfig);
          updateFormFields(form, fieldValues);

          // Customize the submit button
          const submitInput = form.querySelector('input[type="submit"]');
          submitInput.value = formConfig.cta || submitInput.value || 'Submit';
          if (submitInput) {
            const submitButton = button({
              type: 'submit',
              class: 'button primary',
            }, formConfig.cta || submitInput.value || 'Submit');
            submitInput.replaceWith(submitButton);
          }
        },
        onFormSubmit: (hubspotForm) => {
          handleFormSubmit(hubspotForm, formConfig, formConfig.type);
        },
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('HubSpot form API is not available:', e);
    setTimeout(() => createHubSpotForm(formConfig), 200);
  }
}

/* load hubspot script */
export function loadHubSpotScript(callback) {
  loadCSS('/blocks/forms/forms.css');
  if (window.hbspt?.forms) {
    callback();
    return;
  }

  if (!document.querySelector('script[src*="js.hsforms.net/forms/v2.js"]')) {
    loadScript('https://js.hsforms.net/forms/v2.js', callback);
  } else {
    const check = setInterval(() => {
      if (window.hbspt?.forms) {
        clearInterval(check);
        callback();
      }
    }, 100);
  }
}

export default async function decorate(block) {
  const WAVE_SECTION = 'wave-section';
  const category = getMetadata('category');
  const template = getMetadata('template');
  const hasWaveSection = block.closest(`.${WAVE_SECTION}`);
  const formConfig = await extractFormData(block);
  const blockClasses = block.classList.value.split(' ');
  const formTypes = formMapping.map((item) => item.type);
  const formType = formTypes.find((type) => blockClasses.find((cls) => cls === type));
  const hasBookTimeOption = blockClasses.find((cls) => cls === 'book-time');

  let formHeading = formConfig.heading || '';

  formConfig.formType = formType;
  const target = `${formConfig.formType || 'unknown-type'}-form`;

  /* product page form */
  if (template.includes('Product')) {
    const data = PRODUCT_FORM_DATA
      .find((formData) => formData.type.toLowerCase().includes(category.toLowerCase()));
    formHeading = data.formTitle || '';
  }

  const form = div(
    formHeading ? h3(formHeading) : '',
    div({
      id: target,
      class: 'hubspot-form',
    }),
  );

  if (!block.querySelector(`#${target}`)) {
    block.innerHTML = '';
    block.appendChild(form);
  }

  if (template.includes('Product')) {
    decorateProductPage();
  } else if (formType) {
    loadHubSpotScript(createHubSpotForm.bind(null, formConfig));
  } else {
    const formTypeList = ul({ class: 'type-not-found-msg' }, p('Please add one of the following type to the block:'));
    formMapping.map((item) => formTypeList.appendChild(li(toTitleCase(item.type))));
    block.appendChild(formTypeList);
  }

  // show date/time field for event
  window.addEventListener('message', (event) => {
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormReady') {
      if (formConfig.formType === 'events') {
        const dateInput = block?.querySelector('.hs-dateinput input[type="text"]');
        const meetingDateInput = block?.querySelector('[name="meeting_date_text"]');
        const meetingTimeInput = block?.querySelector('[name="meeting_time"]');

        const minDate = new Date(getMetadata('event-start')).toISOString().split('T')[0];

        if (!hasBookTimeOption) {
          meetingDateInput.closest('.hs-form-field').style.display = 'none';
          meetingTimeInput.closest('.hs-form-field').style.display = 'none';
          meetingDateInput.value = 'NA';
          // meetingTimeInput.value = 'NA';
        } else {
          const dateLabel = dateInput?.closest('.hs-form-field')?.querySelector('label').textContent;
          dateInput?.setAttribute('placeholder', dateLabel);
          initHTMLDateInput(meetingDateInput, {
            placeholder: dateLabel,
            min: minDate,
          });
        }
      }
    }
  });

  /* add wave to category-form section */
  if (hasWaveSection) {
    const blockSection = block.closest('section');

    // Thank You page flow
    const pageParam = new URLSearchParams(window.location.search).get('page');
    if (pageParam?.toLowerCase() === 'thankyou') {
      blockSection.id = productThankyouSection;
      blockSection.classList.add(productThankyouSection);
      blockSection.classList.remove('columns-2');
      blockSection.replaceChildren(rfqThankyouMessage());
      requestAnimationFrame(() => scrollToSection(blockSection));
    }

    /* add wave image */
    const waveImage = createOptimizedPicture('/images/wave-footer-bg-top.png', 'wave', false, [
      { media: '(min-width: 992px)', width: '1663' },
      { width: '900' },
    ]);
    blockSection.appendChild(div({ class: 'wave' }, waveImage));
    blockSection.classList.add(WAVE_SECTION);
    block.classList.remove(WAVE_SECTION);
  }
}
