/* eslint-disable import/no-cycle */
import {
  button, div, h3, li, p, ul,
} from '../../scripts/dom-helpers.js';
import { loadCSS, toClassName, getMetadata } from '../../scripts/lib-franklin.js';
import { loadScript, toTitleCase, getCookie } from '../../scripts/scripts.js';
import { prepImageUrl } from '../quote-request/quote-request.js';
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
        console.log(fieldValues);
        console.log(formConfig);

        //* *******  Rajneesh changes starts here  ********************* /
        // console.log(JSON.stringify(fieldValues));
        // let productImage = prepImageUrl(fieldValues.product_image);
        // let productBImage = prepImageUrl(fieldValues.product_bundle_image);
        // if (type === 'rfq') {
        //   const cmpValue = getCookie('cmp') ? getCookie('cmp') : TEMP_CMP_ID;
        //   fieldValues.product_image = (fieldValues.product_image != "")
        //     ? productImage : 'NA';// to do..to be moved on product template module
        //   fieldValues.product_bundle_image = (fieldValues.product_bundle_image != "")
        //     ? productBImage : 'NA';// to do.. to be moved on product template module
        //   fieldValues.requested_qdc_discussion__c = 'Quote'; // Always send lead to SFDC
        //   fieldValues.cmp = cmpValue;
        //   // to do.. cmp to be replaced with actaul RFQ cmp or url parameter
        //   //console.log(fieldValues.product_image);
        // }
        //* *******  Rajneesh changes ends here  ********************* /

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
  let target = toClassName(formHeading) || `hubspot-form-${index}`;
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

  if (formType) {
    const isExistClass = document.querySelectorAll(`#${toClassName(formHeading)}`);
    if (isExistClass.length > 1); target = `${target}-${isExistClass.length}`;
    loadHubSpotScript(createHubSpotForm.bind(null, formConfig, target, formType));
  } else {
    const formTypeList = ul({ class: 'no-type-msg' }, p('Please add one of the following type to the block:'));
    formMapping.map((item) => formTypeList.appendChild(li(toTitleCase(item.type))));
    block.appendChild(formTypeList);
  }
}
