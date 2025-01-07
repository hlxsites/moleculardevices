/* eslint-disable import/no-cycle */
import {
  a, button, div, h3, label,
} from '../../scripts/dom-helpers.js';
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

            const privacy = document.querySelector('label.privacy, .privacy>label');
            if (!privacy) {
              const privacyMsg = label({ class: 'privacy' },
                'By submitting your details, you confirm that you have reviewed and agree with the Molecular Devices ',
                a({
                  href: 'https://www.moleculardevices.com/privacy', title: 'Privacy Policy', target: '_blank', rel: 'noopener',
                }, 'Privacy Policy'),
                ', and that you understand your privacy choices as they pertain to your personal data as provided in the ',
                a({
                  href: 'https://www.moleculardevices.com/privacy', title: 'Privacy Policy', target: '_blank', rel: 'noopener',
                }, 'Privacy Policy'),
                ' under “Your Privacy Choices”.');
              form.appendChild(privacyMsg);
            }
          }
        });
      },
      onFormSubmit: (hubspotForm) => {
        createSalesforceForm(hubspotForm, formConfig);
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
