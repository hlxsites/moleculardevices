/* eslint-disable import/no-cycle */
import {
  button, div, h3, li, p, ul,
} from '../../scripts/dom-helpers.js';
import { loadCSS } from '../../scripts/lib-franklin.js';
import { loadScript, toTitleCase } from '../../scripts/scripts.js';
import {
  extractFormData, getFormFieldValues,
  getFormId, handleFormSubmit, updateFormFields,
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
  loadScript(`https://js.hsforms.net/forms/v2.js?v=${new Date().getTime()}`, callback);
}

export default async function decorate(block) {
  const formConfig = await extractFormData(block);
  const formHeading = formConfig.heading || '';
  const blockClasses = block.classList.value.split(' ');
  const formTypes = formMapping.map((item) => item.type);
  const formType = formTypes.find((type) => blockClasses.find((cls) => cls === type));

  formConfig.formType = formType;
  const target = `${formConfig.formType}-form`;

  const form = div(
    h3(formHeading),
    div({
      id: target,
      class: 'hubspot-form',
    }),
  );

  block.innerHTML = '';
  block.appendChild(form);

  if (formType) {
    loadHubSpotScript(createHubSpotForm.bind(null, formConfig));

    window.addEventListener('message', (event) => {
      if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormReady') {
        requestAnimationFrame(() => {
          const submitInput = form.querySelector('input[type="submit"]');
          if (submitInput) {
            // submitInput.className = 'button primary';
            submitInput.value = formConfig.cta || 'Submit';
          }
        });
      }
    });
  } else {
    const formTypeList = ul({ class: 'no-type-msg' }, p('Please add one of the following type to the block:'));
    formMapping.map((item) => formTypeList.appendChild(li(toTitleCase(item.type))));
    block.appendChild(formTypeList);
  }
}
