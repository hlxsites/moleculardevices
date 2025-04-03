/* eslint-disable max-len, import/no-cycle */
import { input } from '../../scripts/dom-helpers.js';
import { toCamelCase } from '../../scripts/lib-franklin.js';
import { getCookie } from '../../scripts/scripts.js';

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

// get form id
export const formMapping = [
  { type: 'rfq', id: '09ad331d-27c6-470a-86d4-7d6c4b141bc8' }, // rfq master form
  // { type: 'app-note', id: '46645e42-ae08-4d49-9338-e09efb4c4035' }, // old app note master form
  { type: 'app-note', id: 'd6f54803-6515-4313-a7bd-025dfa5cbb5f' }, // New app note master form
  // { type: 'scientific-poster', id: '342c229a-9e0d-4f52-b4c4-07f067d39c31' }, // old poster master form
  { type: 'scientific-poster', id: '837f6e47-0292-4586-8447-297325ff50c1' }, // new poster master form
  // { type: 'ebook', id: '65148a5b-995e-436d-8cdc-cc915923feaa' }, // old ebook master form
  { type: 'ebook', id: '90a9217a-7e3f-474e-a7a2-8e34d895ef45' }, // new ebook master form
  // { type: 'video-and-webinars', id: 'aabb1ced-8add-4de4-b198-6db60a82de85' }, // old videos and webinars master form
  { type: 'video-and-webinars', id: '9dc88e8e-68f7-4dcc-82b1-de8c4672797c' }, // new videos and webinars master form
  { type: 'infographics', id: '17750eb2-f0d3-4584-a534-85b6d7a1dd53' }, // new infographics master form
  { type: 'lab-notes', id: '9530db8b-2803-469c-a178-9b74f9cb504a' },
  { type: 'newsletter', id: '3b6b0bc3-c874-403c-aa73-ee006b7eb8eb' },
  { type: 'inquiry-with-thankyou', id: '5461143e-c315-40cf-9a92-dd8515e61d4c' },
  { type: 'inquiry', id: 'bbca06dd-57d2-433b-a8c1-d5cd18b4ce28' },
  // { type: 'share-story', id: 'a1086f3a-ed6e-47d1-9694-17f8c0a28612' },
  { type: 'share-story', id: '5d062792-bb0b-4f11-bc26-f3d3422ae4ec' },
  { type: 'promo', id: '014f34d1-570e-49d9-b1a6-c630c5ef609f' },
  { type: 'ebook-promo', id: 'b83700e4-f00b-4b92-9124-fab2968f60b5' },
  { type: 'app-note-promo', id: 'ed0daf7c-99c6-4fd8-aa32-13d4e053fa64' },
  { type: 'product-promo', id: 'cb509c1d-3c9d-4d8a-ac06-11f6e8fd14d0' },
];

export function getFormId(type) {
  const mapping = formMapping.find((item) => item.type === type);
  return mapping ? mapping.id : '';
}

/* custom field */
export const OID = '00D70000000IRvr';
export const timelineValue = '00N70000003iu0b';
export const serialLotNumber = '00N70000003TZlz';
export const productFamily = '00N70000001oP3y';
export const productSelection = '00N0g000003c6tn';
export const fseSalesRepInsideSales = '00N70000003RaEK';
export const euFseSalesRepInsideSales = '00N70000003RaEK';
export const usFas = '00N70000003RaEK';
export const euFas = '00N70000003RaEK';
export const customSolutionsOpportunity = '00N70000003ScgU';
export const preQualifiedForSalesrep = '00N0g000003YFXF';
export const QDCRrequest = '00N70000003iu65';
export const marketingOptin = '00N70000003ipQF';
export const prodPrimApp = '00N700000030jhQ';
export const fieldsObj = [
  { inputName: 'first_name', inputFieldName: 'firstname' },
  { inputName: 'last_name', inputFieldName: 'lastname' },
  { inputName: 'email', inputFieldName: 'email' },
  { inputName: 'phone', inputFieldName: 'phone' },
  { inputName: 'phone', inputFieldName: '0-2/phone' },
  { inputName: 'company', inputFieldName: 'company' },
  { inputName: 'country', inputFieldName: 'country' },
  { inputName: 'country', inputFieldName: 'country_code' }, // TEST CASE
  { inputName: 'state', inputFieldName: 'state_dropdown' }, // TEST CASE
  { inputName: 'state', inputFieldName: 'state' }, // TEST CASE
  { inputName: 'zip', inputFieldName: 'zip' },
  { inputName: timelineValue, inputFieldName: 'timeline__c' },
  { inputName: 'jobtitle', inputFieldName: 'jobtitle' },
  { inputName: 'city', inputFieldName: 'city' },
  { inputName: 'Danaher_Partner_Rep__c', inputFieldName: 'danaher_partner_rep__c' },
  { inputName: 'Danaher_Partner_Rep_Email__c', inputFieldName: 'danaher_partner_rep_email__c' },
  { inputName: 'EU_Lead_Finder_Agent__c', inputFieldName: 'eu_lead_finder_agent__c' },
  { inputName: 'Contact_Region__c', inputFieldName: 'contact_region__c' },
  { inputName: 'Region__c', inputFieldName: 'region__c' },
  { inputName: 'na_lead_finder_agent__c', inputFieldName: 'na_lead_finder_agent__c' },
  { inputName: serialLotNumber, inputFieldName: 'serial_lot_number__c' },
  { inputName: serialLotNumber, inputFieldName: 'serial_lot_number__c' },
  { inputName: productFamily, inputFieldName: 'product_family__c' },
  { inputName: productSelection, inputFieldName: 'product_selection__c' },
  { inputName: 'description', inputFieldName: 'description' },
  { inputName: fseSalesRepInsideSales, inputFieldName: 'fse_sales_rep_inside_sales__c' },
  { inputName: euFseSalesRepInsideSales, inputFieldName: 'eu_fse_sales_rep_inside_sales' },
  { inputName: usFas, inputFieldName: 'us_fas' },
  { inputName: euFas, inputFieldName: 'eu_fas' },
  { inputName: customSolutionsOpportunity, inputFieldName: 'custom_solutions_opportunity__c' },
  { inputName: preQualifiedForSalesrep, inputFieldName: 'pre_qualified_for_salesrep__c' },
  { inputName: 'Lead_Source_2__c', inputFieldName: 'lead_source_2__c' },
  { inputName: 'GCLID__c', inputFieldName: 'gclid__c' },
  { inputName: 'Keyword_PPC__c', inputFieldName: 'keyword_ppc__c' },
  { inputName: 'Google_Analytics_Medium__c', inputFieldName: 'google_analytics_medium__c' },
  { inputName: 'Google_Analytics_Source__c', inputFieldName: 'google_analytics_source__c' },
  { inputName: 'Campaign_ID', inputFieldName: 'cmp' },
  { inputName: 'cmp', inputFieldName: 'cmp' },
];

/* get form ready */
export function getFormFieldValues(formConfig) {
  // Get the `cmp` parameters from URL or cookie
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  const cmpCookieValue = getCookie('cmp');
  const valuecmp = params.cmp || cmpCookieValue;
  const thankyouUrl = `${window.location.origin}${window.location.pathname}?page=thankyou`;

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
