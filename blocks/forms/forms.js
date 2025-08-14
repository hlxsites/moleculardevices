/* eslint-disable import/no-cycle */
import {
  button, div, h3, li, p, ul,
} from '../../scripts/dom-helpers.js';
import { loadCSS, toClassName, getMetadata } from '../../scripts/lib-franklin.js';
import { loadScript } from '../../scripts/scripts.js';
import { prepImageUrl, getRFQDataByFamilyID } from '../quote-request/quote-request.js';
import {
  extractFormData, formMapping, getFormFieldValues,
  getFormId, handleFormSubmit, updateFormFields,
} from './formHelper.js';


/* create hubspot form */
export function createHubSpotForm(formConfig, target, type = '') {
    console.log('formid '+getFormId(type));
     console.log('target '+target);
  try {
    hbspt.forms.create({ // eslint-disable-line
      region: formConfig.region || 'na1',
      portalId: formConfig.portalId || '20222769',
      formId: formConfig.formId || getFormId(type),
      target: `#${target}`,
      onFormReady: (form) => {
        // Handle Salesforce hidden fields
        const fieldValues = getFormFieldValues(formConfig);
        updateFormFields(form, fieldValues);

        // Customize the submit button
        const submitInput = form.querySelector('input[type="submit"]');
        if (submitInput) {
          const submitButton = button({
            type: 'submit',
            class: 'button primary',
          }, formConfig.cta || submitInput.value || 'Submit');
          submitInput.replaceWith(submitButton);
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

/* Converts any string to Title Case */
export function toTitleCase(str) {
  return str.toLowerCase().replace(/(?:^|\s|[_-])\w/g, (match) => match.toUpperCase());
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
  
  // Rajneesh new changes
        if (formType === 'product-rfq') {

        //const queryParams = new URLSearchParams(window.location.search);
        const pid = getMetadata('family-id');
       // console.log('piDDD '+pid);
        let rfqData = await getRFQDataByFamilyID(pid);
        //console.log('formConfig '+JSON.stringify(rfqData));
        let sfdcProductFamily = '';
        let sfdcProductSelection = '';
        let sfdcPrimaryApplication = '';
        let productFamily = '';
        let primaryProductFamily = '';
        let productImage = 'NA';
        let bundleThumbnail = 'NA';
        let productBundle = '';

       //console.log('bundleThumbnail1 '+rfqData.bundleThumbnail);
        // prepare the product image url
          if (rfqData.thumbnail && rfqData.thumbnail !== '0') {
            productImage = prepImageUrl(rfqData.thumbnail) ;
          }
          if (rfqData.bundleThumbnail && rfqData.bundleThumbnail !== '0') {
            bundleThumbnail  = prepImageUrl(rfqData.bundleThumbnail) ;
          }
          if (rfqData.title) {
            sfdcProductSelection  = rfqData.title;
          }
           if (rfqData.productFamily) {
            sfdcProductFamily  = rfqData.productFamily;
          }
          formConfig.productImage = productImage;
          formConfig.productBundleImage = bundleThumbnail;
          formConfig.productSelection = sfdcProductSelection;
          formConfig.productPrimaryApplication = sfdcProductSelection;
          formConfig.productFamily = sfdcProductFamily;
          
        //console.log('productImage '+formConfig.productImage);
        //console.log('bundleThumbnail2 '+formConfig.productBundleImage);
       
        }
  // Rajneesh new changes ends here

  if (formType) {
    loadHubSpotScript(createHubSpotForm.bind(null, formConfig, target, formType));
  } else {
    const formTypeList = ul({ class: 'no-type-msg' }, p('Please add one of the following type to the block:'));
    formMapping.map((item) => formTypeList.appendChild(li(toTitleCase(item.type))));
    block.appendChild(formTypeList);
  }
}