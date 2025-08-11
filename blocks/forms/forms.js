/* eslint-disable import/no-cycle */
import {
  button, div, h3, li, p, ul,
} from '../../scripts/dom-helpers.js';
import { loadCSS, toClassName } from '../../scripts/lib-franklin.js';
import { loadScript, toTitleCase } from '../../scripts/scripts.js';
import {
  extractFormData, getFormFieldValues, handleFormSubmit, updateFormFields,
} from './formHelper.js';
import { formMapping, getFormId } from './formMapping.js';

/* create hubspot form */
let hubspotFormRetryTimeout;
export function createHubSpotForm(formConfig) {
  const configFormID = getFormId(formConfig.formType);

  if (configFormID) {
    if (hubspotFormRetryTimeout) {
      clearTimeout(hubspotFormRetryTimeout);
      hubspotFormRetryTimeout = null;
    }

    hbspt.forms.create({ // eslint-disable-line
      region: formConfig.region || 'na1',
      portalId: formConfig.portalId || '20222769',
      formId: getFormId(formConfig.formType),
      target: `#${formConfig.formType}-form`,

      onFormReady: (form) => {
        // Handle Salesforce hidden fields
        const fieldValues = getFormFieldValues(formConfig);
        updateFormFields(form, fieldValues);

        // Customize the submit button
        const submitInput = form.querySelector('input[type="submit"]');
        if (submitInput) {
          const submitButton = button(
            { type: 'submit', class: 'button primary' },
            formConfig.cta || submitInput.value || 'Submit',
          );
          submitInput.replaceWith(submitButton);

          const CTAColor = form?.closest('.section')?.getAttribute('data-cta-color');
          if (CTAColor) {
            submitButton.setAttribute('style', `background-color: ${CTAColor}`);
          }
        }
      },
      onFormSubmit: (hubspotForm) => {
        handleFormSubmit(hubspotForm, formConfig);
      },
    });
  } else {
    hubspotFormRetryTimeout = setTimeout(() => createHubSpotForm(formConfig), 200);
  }
}

/* load hubspot script */
let hubspotLoaded = false;
export function loadHubSpotScript(callback) {
  loadCSS('/blocks/forms/forms.css');

  if (hubspotLoaded) {
    callback();
    return;
  }

  loadScript(`https://js.hsforms.net/forms/v2.js?v=${new Date().getTime()}`, () => {
    hubspotLoaded = true;
    callback();
  });
}

export default async function decorate(block) {
  const formConfig = await extractFormData(block);
  const formHeading = formConfig.heading || '';
  const blockClasses = block.classList.value.split(' ');
  const formTypes = formMapping.map((item) => item.type);
  const formType = formTypes.find((type) => blockClasses.find((cls) => cls === type));

  const form = div(
    h3({ id: toClassName(formHeading) }, formHeading),
    div({
      id: `${formType}-form`,
      class: 'hubspot-form',
    }),
  );

  block.innerHTML = '';
  block.appendChild(form);

  if (formType) {
    loadHubSpotScript(createHubSpotForm.bind(null, formConfig));
  } else {
    const formTypeList = ul({ class: 'no-type-msg' }, p('Please add one of the following type to the block:'));
    formMapping.map((item) => formTypeList.appendChild(li(toTitleCase(item.type))));
    block.appendChild(formTypeList);
  }
}
