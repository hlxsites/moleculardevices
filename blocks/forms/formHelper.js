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
  { newName: 'first_name', fieldName: 'firstname' },
  { newName: 'last_name', fieldName: 'lastname' },
  { newName: 'email', fieldName: 'email' },
  { newName: 'phone', fieldName: 'phone' },
  { newName: 'phone', fieldName: '0-2/phone' },
  { newName: 'company', fieldName: 'company' },
  { newName: 'country', fieldName: 'country' },
  { newName: 'country', fieldName: 'country_code' }, // TEST CASE
  { newName: 'state', fieldName: 'state_dropdown' }, // TEST CASE
  { newName: 'state', fieldName: 'state' }, // TEST CASE
  { newName: 'zip', fieldName: 'zip' },
  { newName: timelineValue, fieldName: 'timeline__c' },
  { newName: 'jobtitle', fieldName: 'jobtitle' },
  { newName: 'city', fieldName: 'city' },
  { newName: 'Danaher_Partner_Rep__c', fieldName: 'danaher_partner_rep__c' },
  { newName: 'Danaher_Partner_Rep_Email__c', fieldName: 'danaher_partner_rep_email__c' },
  { newName: 'EU_Lead_Finder_Agent__c', fieldName: 'eu_lead_finder_agent__c' },
  { newName: 'Contact_Region__c', fieldName: 'contact_region__c' },
  { newName: 'Region__c', fieldName: 'region__c' },
  { newName: 'na_lead_finder_agent__c', fieldName: 'na_lead_finder_agent__c' },
  { newName: serialLotNumber, fieldName: 'serial_lot_number__c' },
  { newName: serialLotNumber, fieldName: 'serial_lot_number__c' },
  { newName: productFamily, fieldName: 'product_family__c' },
  { newName: productSelection, fieldName: 'product_selection__c' },
  { newName: 'description', fieldName: 'description' },
  { newName: fseSalesRepInsideSales, fieldName: 'fse_sales_rep_inside_sales__c' },
  { newName: euFseSalesRepInsideSales, fieldName: 'eu_fse_sales_rep_inside_sales' },
  { newName: usFas, fieldName: 'us_fas' },
  { newName: euFas, fieldName: 'eu_fas' },
  { newName: customSolutionsOpportunity, fieldName: 'custom_solutions_opportunity__c' },
  { newName: preQualifiedForSalesrep, fieldName: 'pre_qualified_for_salesrep__c' },
  { newName: 'Lead_Source_2__c', fieldName: 'lead_source_2__c' },
  { newName: 'GCLID__c', fieldName: 'gclid__c' },
  { newName: 'Keyword_PPC__c', fieldName: 'keyword_ppc__c' },
  { newName: 'Google_Analytics_Medium__c', fieldName: 'google_analytics_medium__c' },
  { newName: 'Google_Analytics_Source__c', fieldName: 'google_analytics_source__c' },
  { newName: 'Campaign_ID', fieldName: 'cmp' },
  { newName: 'cmp', fieldName: 'cmp' },
];

/* custom form fields */
function createCustomField(hubspotFormData, fieldName, newName) {
  const fieldVal = hubspotFormData.get(fieldName);
  if (fieldVal && fieldVal !== undefined && fieldVal !== '') {
    const elementCompany = input({ name: newName, value: fieldVal, type: 'hidden' });
    return elementCompany;
  }
  return 0;
}

/* create salesforce form */
export function createSalesforceForm(hubspotForm, formConfig) {
  const iframe = document.createElement('iframe');
  iframe.name = 'salesforceIframe';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const hubspotFormData = new FormData(hubspotForm);
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';
  form.target = 'salesforceIframe';

  // Your org ID
  const elementOID = input({ name: 'oid', value: OID, type: 'hidden' });
  form.appendChild(elementOID);

  // generate a form from Customize | Leads | Web-to-Lead to figure out more
  fieldsObj.forEach(({ newName, fieldName }) => {
    const inputField = createCustomField(hubspotFormData, fieldName, newName);
    if (inputField && inputField !== 0) {
      form.appendChild(inputField);
    }
  });

  /* qdc */
  const qdcCall = hubspotForm.querySelector('input[name="requested_a_salesperson_to_call__c"]');
  let qdc = '';

  if (qdcCall && qdcCall.checked === true) {
    qdc = 'Call';
  } else {
    qdc = hubspotFormData.get('requested_qdc_discussion__c') || ''; // test case
  }
  if (qdc === '') {
    qdc = formConfig.qdc || '';
  }

  const elementqdcrequest = input({ name: QDCRrequest, value: qdc, type: 'hidden' });
  form.appendChild(elementqdcrequest);

  /* subscribe */
  let subscribe = hubspotForm.querySelector('input[name="subscribe"]');
  if (subscribe && subscribe.checked) {
    subscribe = 'true';
  } else {
    subscribe = 'false';
  }
  // if (!subscribe) { subscribe = 'false'; }
  const elementmarketingoptin = input({ name: marketingOptin, value: subscribe, type: 'hidden' });
  form.appendChild(elementmarketingoptin);

  // SFDC redirects to returnURL in the response to the form post
  let returnURL = hubspotFormData.get('return_url') || formConfig.redirectUrl;

  if (returnURL && returnURL !== 'null') {
    const hsmduri = returnURL;
    const hsmdkey = 'rfq';
    const hsmdvalue = qdc;

    const re = new RegExp(`([?&])${hsmdkey}=.*?(&|$)`, 'i');
    const separator = hsmduri.indexOf('?') !== -1 ? '&' : '?';

    if (hsmduri.match(re)) {
      returnURL = hsmduri.replace(re, `$1${hsmdkey}=${hsmdvalue}$2`);
    } else {
      returnURL = `${hsmduri}${separator}${hsmdkey}=${hsmdvalue}`;
    }

    returnURL = `${returnURL}&subscribe=${subscribe}`;
  }
  if (returnURL !== 'null') {
    const elementRetURL = input({ name: 'retURL', value: returnURL, type: 'hidden' });
    form.appendChild(elementRetURL);
  }

  const primaryApplicationText = hubspotFormData.get('product_primary_application__c');
  const productAndPrimaryFtype = hubspotFormData.get('product_and_primary_application_na___service_contracts'); // test case
  let primaryApplication = '';
  if (productAndPrimaryFtype) {
    const checkboxes = hubspotForm.get('product_and_primary_application_na___service_contracts');
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

  document.body.appendChild(form);
  iframe.onload = () => {
    if (returnURL && returnURL !== 'null') {
      window.top.location.href = returnURL;
    }
  };

  const allowedValues = ['Call', 'Demo', 'Quote'];
  if (allowedValues.includes(qdc)) {
    form.submit();
  } else if (returnURL && returnURL !== 'null') {
    setTimeout(() => { window.top.location.href = returnURL; }, 2000);
  }
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
