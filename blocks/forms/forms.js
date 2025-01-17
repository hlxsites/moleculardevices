/* eslint-disable import/no-cycle */
import { button, div, h3 } from '../../scripts/dom-helpers.js';
import { loadCSS, toClassName } from '../../scripts/lib-franklin.js';
import { loadScript } from '../../scripts/scripts.js';
import {
  createSalesforceForm, extractFormData, formMapping, getFormFieldValues,
  getFormId, updateFormFields,
} from './formHelper.js';

/* create hubspot form */
export function createHubSpotForm(formConfig, target, type = '') {
  try {
    hbspt.forms.create({ // eslint-disable-line
      region: formConfig.region || 'na1',
      portalId: formConfig.portalId || '20222769',
      formId: formConfig.formId || getFormId(type),
      target: `#${target}`,
      onFormReady: (form) => {
        // Handle Salesforce hidden fields via message event listener
        window.addEventListener('message', (event) => {
          if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormReady') {
            const fieldValues = getFormFieldValues(formConfig);
            updateFormFields(form, fieldValues);

            // Customize the submit button
            const submitInput = form.querySelector('input[type="submit"]');
            if (submitInput) {
              const submitButton = button({
                type: 'submit',
                class: 'button primary',
              }, submitInput.value || 'Submit');
              submitInput.replaceWith(submitButton);
            }
          }
        });
      },
      onFormSubmit: (hubspotForm) => {
        createSalesforceForm(hubspotForm, formConfig);
        if (type === 'newsletter') {
          // eslint-disable-next-line no-undef
          console.log('Form submitted');
          dataLayer.push({ 'event': 'new_subscriber' });
        }
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('HubSpot form API is not available:', e);
    setTimeout(() => createHubSpotForm(formConfig, target, type), 200);
  }
}

/* load hubspot script */
export function loadHubSpotScript(callback) {
  loadCSS('/blocks/forms/forms.css');
  loadScript(`https://js.hsforms.net/forms/v2.js?v=${new Date().getTime()}`, callback);
}

export default async function decorate(block, index) {
  const formConfig = await extractFormData(block);
  const formHeading = formConfig.heading || '';
  const target = toClassName(formHeading) || `hubspot-form-${index}`;
  const blockClasses = block.classList.value;
  const formTypes = formMapping.map((item) => item.type);
  const formType = formTypes.filter((type) => blockClasses.includes(type))[0];

  const form = div(
    h3(formHeading),
    div({
      id: target,
      class: 'hubspot-form',
    }),
  );

  block.innerHTML = '';
  block.appendChild(form);
  loadHubSpotScript(createHubSpotForm.bind(null, formConfig, target, formType));
}
