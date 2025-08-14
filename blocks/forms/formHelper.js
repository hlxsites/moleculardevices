/* eslint-disable max-len, import/no-cycle */
import { input } from '../../scripts/dom-helpers.js';
import { toCamelCase } from '../../scripts/lib-franklin.js';
import { getCookie } from '../../scripts/scripts.js';
import {
  fieldsObj, formMapping, marketingOptin, OID, prodPrimApp, QDCRrequest,
} from './formMapping.js';

// extract data from table
export async function extractFormData(block) {
  const blockData = {};
  [...block.children].forEach((row) => {
    const key = toCamelCase(row.children[0].textContent.trim().toLowerCase());
    const valueContainer = row.children[1];
    const link = valueContainer.querySelector('a');
    const image = valueContainer.querySelector('img');
    let value;
    if (link) {
      value = link.href;
    } else if (image) {
      value = image.src;
    } else {
      value = valueContainer.textContent.trim();
    }
    blockData[key] = value;
  });
  return blockData;
}

export function getFormId(type) {
  const mapping = formMapping.find((item) => item.type === type);
  return mapping ? mapping.id : '';
}

/* get form ready */
export function getFormFieldValues(formConfig) {
  // Get the `cmp` parameters from URL or cookie
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  const cmpCookieValue = getCookie('cmp');
  const valuecmp = params.cmp || cmpCookieValue;
  const thankyouUrl = `${window.location.origin}${window.location.pathname}?page=thankyou`;
  const currentUrl = window.location.href.split('?')[0];
  // console.log(formConfig.host_name);
  return {
    cmp: valuecmp || formConfig.cmp,
    gclid__c: formConfig.gclid,
    google_analytics_medium__c: formConfig.googleAnalyticsMedium,
    google_analytics_source__c: formConfig.googleAnalyticsSource,
    keyword_ppc__c: formConfig.keywordPPC,
    product_title: formConfig.productTitle,
    product_bundle: formConfig.productBundle,
    product_bundle_image: formConfig.productBundleImage,
    product_family__c: formConfig.productFamily,
    product_image: formConfig.productImage || formConfig.resourceImageUrl,
    product_primary_application__c: formConfig.productPrimaryApplication,
    product_selection__c: formConfig.productSelection,
    qdc: formConfig.qdc,
    requested_qdc_discussion__c: formConfig.qdc,
    research_area: formConfig.researchArea,
    return_url: formConfig.redirectUrl || thankyouUrl,
    landing_page_title: formConfig.jobTitle || formConfig.title,
    latest_newsletter: formConfig.latestNewsletter,
    website: formConfig.website || formConfig.resourceUrl,
    source_url: currentUrl,
  };
}

// Function to update multiple form fields
export function updateFormFields(form, fieldValues) {
  Object.entries(fieldValues).forEach(([fieldName, value]) => {
    if (value && form.querySelector(`input[name="${fieldName}"]`)) {
      form.querySelector(`input[name="${fieldName}"]`).value = value;
    }
  });
}

/* custom form fields */
function createHiddenField(hubspotFormData, inputFieldName, inputName) {
  const fieldVal = hubspotFormData.get(inputFieldName);
  if (fieldVal && fieldVal !== undefined && fieldVal !== '') {
    const elementCompany = input({ name: inputName, value: fieldVal, type: 'hidden' });
    return elementCompany;
  }
  return 0;
}

/* create salesforce form */
export function createSalesforceForm(hubspotFormData, qdc, returnURL, subscribe) {
  const iframe = document.createElement('iframe');
  iframe.name = 'salesforceIframe';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';
  form.target = 'salesforceIframe';

  // Your org ID
  const elementOID = input({ name: 'oid', value: OID, type: 'hidden' });
  form.appendChild(elementOID);

  // generate a form from Customize | Leads | Web-to-Lead to figure out more
  fieldsObj.forEach(({ inputName, inputFieldName }) => {
    const inputField = createHiddenField(hubspotFormData, inputFieldName, inputName);
    if (inputField && inputField !== 0) {
      form.appendChild(inputField);
    }
  });

  /* qdc */
  const elementqdcrequest = input({ name: QDCRrequest, value: qdc, type: 'hidden' });
  form.appendChild(elementqdcrequest);

  /* subscribe */
  const elementmarketingoptin = input({ name: marketingOptin, value: subscribe, type: 'hidden' });
  form.appendChild(elementmarketingoptin);

  // SFDC redirects to returnURL in the response to the form post
  if (returnURL !== 'null') {
    const elementRetURL = input({ name: 'retURL', value: returnURL, type: 'hidden' });
    form.appendChild(elementRetURL);
  }

  const primaryApplicationText = hubspotFormData.get('product_primary_application__c');
  const productAndPrimaryFtype = hubspotFormData.get('product_and_primary_application_na___service_contracts'); // test case
  let primaryApplication = '';
  if (productAndPrimaryFtype) {
    const checkboxes = hubspotFormData.get('product_and_primary_application_na___service_contracts');
    for (let i = 0; i < checkboxes.length; i += 1) {
      if (checkboxes[i].checked) {
        primaryApplication += `${checkboxes[i].value} , `;
      }
    }
  } else if (primaryApplicationText !== '' && primaryApplicationText !== undefined) {
    primaryApplication = primaryApplicationText;
  }
  const elementprodprimapp = input({ name: prodPrimApp, value: primaryApplication, type: 'hidden' });
  form.appendChild(elementprodprimapp);

  return { form, iframe };
}

export function handleFormSubmit(hubspotForm, formConfig, type) {
  if (!hubspotForm || !(hubspotForm instanceof HTMLFormElement)) {
    // eslint-disable-next-line no-console
    console.error('Invalid HubSpot form detected.');
    return;
  }

  //  Form Validation Before Submission
  if (!hubspotForm.checkValidity()) {
    // eslint-disable-next-line no-console
    console.error('HubSpot Form validation failed!');
    return;
  }

  //  Prevent Multiple Submissions
  const submitButton = hubspotForm.querySelector('input[type="submit"], button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
  }

  const hubspotFormData = new FormData(hubspotForm);

  /* qdc */
  const qdcCall = hubspotForm.querySelector('input[name="requested_a_salesperson_to_call__c"]');
  const qdc = qdcCall && qdcCall.checked
    ? 'Call'
    : hubspotFormData.get('requested_qdc_discussion__c') || formConfig.qdc || '';

  /* subscribe */
  let subscribe = hubspotForm.querySelector('input[name="subscribe"]');
  subscribe = subscribe && subscribe.checked ? 'true' : 'false';

  /* returnURL */
  let returnURL = hubspotFormData.get('return_url') || formConfig.redirectUrl;
  if (returnURL && returnURL !== 'null') {
    const hsmduri = returnURL;
    const hsmdkey = 'rfq';
    const hsmdvalue = qdc;
    const re = new RegExp(`([?&])${hsmdkey}=.*?(&|$)`, 'i');
    const separator = hsmduri.includes('?') ? '&' : '?';

    if (hsmduri.match(re)) {
      returnURL = hsmduri.replace(re, `$1${hsmdkey}=${hsmdvalue}$2`);
    } else {
      returnURL = `${hsmduri}${separator}${hsmdkey}=${hsmdvalue}`;
    }
    returnURL = `${returnURL}&subscribe=${subscribe}`;
  }

  const allowedValues = ['Call', 'Demo', 'Quote'];
  if (allowedValues.includes(qdc)) {
    const { form, iframe } = createSalesforceForm(hubspotFormData, qdc, returnURL, subscribe);
    document.body.appendChild(form);

    iframe.onload = () => {
      if (returnURL && returnURL !== 'null') {
        window.top.location.href = returnURL;

        hubspotForm.reset(); // Reset form after successful submission
        setTimeout(() => {
          iframe.remove();
          form.remove();
        }, 1000);
      }
    };

    form.submit();
  } else if (returnURL && returnURL !== 'null') {
    setTimeout(() => { window.top.location.href = returnURL; }, 2000);
  }

  if (type === 'newsletter' || type === 'lab-notes') {
    // eslint-disable-next-line no-undef, quote-props
    dataLayer.push({ 'event': 'new_subscriber' });
  }
}
