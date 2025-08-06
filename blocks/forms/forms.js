/* eslint-disable import/no-cycle */
import {
  button, div, h3, li, p, ul,
} from '../../scripts/dom-helpers.js';
import { loadCSS, toClassName } from '../../scripts/lib-franklin.js';
import { loadScript, toTitleCase } from '../../scripts/scripts.js';
import {
  extractFormData, getFormFieldValues,
  getFormId, handleFormSubmit, updateFormFields,
} from './formHelper.js';
import { formMapping } from './formMapping.js';

/* create hubspot form */
export function createHubSpotForm(formConfig, target, type = '') {
  try {
    hbspt.forms.create({ // eslint-disable-line
      region: formConfig.region || 'na1',
      portalId: formConfig.portalId || '20222769',
      formId: formConfig.formId || getFormId(type),
      target: `#${target}`,
      onFormReady: (form) => {
        // Handle Salesforce hidden fields
        const fieldValues = getFormFieldValues(formConfig);
        //console.log(JSON.stringify(fieldValues));
        if(type ==='rfq'){
          fieldValues.product_image = (fieldValues.product_image != "") ? 'https://www.moleculardevices.com/'+fieldValues.product_image : 'NA';// to do.. get dynamic path for root
          fieldValues.product_bundle_image = (fieldValues.product_bundle_image != "") ? 'https://www.moleculardevices.com/'+fieldValues.product_bundle_image : 'NA';// to do.. get dynamic path for root
          fieldValues.cmp = '701Rn00000OJ0zY'; // to do.. cmp to be replaced with actaul RFQ cmp or url parameter
           //console.log(fieldValues.product_image);
        }
        updateFormFields(form, fieldValues);

        // Customize the submit button
        const submitInput = form.querySelector('input[type="submit"]');
        if (submitInput) {
          const submitButton = button({
            type: 'submit',
            class: 'button primary',
          }, formConfig.cta || submitInput.value || 'Submit');
          submitInput.replaceWith(submitButton);

          const CTAColor = form?.closest('.section')?.getAttribute('data-cta-color');
          if (CTAColor) submitButton.setAttribute('style', `background-color: ${CTAColor}`);
        }
      },
      onFormSubmit: (hubspotForm) => {
        handleFormSubmit(hubspotForm, formConfig, type);
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
  const blockClasses = block.classList.value.split(' ');
  const formTypes = formMapping.map((item) => item.type);
  const formType = formTypes.find((type) => blockClasses.find((cls) => cls === type));

  const form = div(
    h3(formHeading),
    div({
      id: target,
      class: 'hubspot-form',
    }),
  );

  block.innerHTML = '';
  block.appendChild(form);
  //console.log('formType'+formType);
  
  if (formType) {

    loadHubSpotScript(createHubSpotForm.bind(null, formConfig, target, formType));
  } else {
    const formTypeList = ul({ class: 'no-type-msg' }, p('Please add one of the following type to the block:'));
    formMapping.map((item) => formTypeList.appendChild(li(toTitleCase(item.type))));
    block.appendChild(formTypeList);
  }
}
