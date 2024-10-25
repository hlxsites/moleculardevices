import { input } from '../../scripts/dom-helpers.js';

/* Helper functions */
export const RESOURCEKEYS = ['heading', 'region', 'portalId', 'formId', 'redirectUrl', 'productFamily', 'productPrimaryApplication', 'cmp'];

export function getDefaultForKey(key) {
  switch (key) {
    case 'heading':
      return '';
    case 'region':
      return 'na1';
    case 'portalId':
      return '20222769 ';
    case 'redirectUrl':
      return 'https://www.moleculardevices.com/';
    default:
      return '';
  }
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
  { newName: 'phone', fieldName: '0-2/phone' },
  { newName: 'company', fieldName: 'company' },
  { newName: 'country', fieldName: 'country' },
  { newName: 'country', fieldName: 'country_code' }, // TEST CASE
  { newName: 'state', fieldName: 'state_dropdown' }, // TEST CASE
  { newName: 'state', fieldName: 'state' }, // TEST CASE
  { newName: 'zip', fieldName: 'zip' },
  { newName: timelineValue, fieldName: 'timeline__c' },
  { newName: 'title', fieldName: 'jobtitle' },
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
  const hubspotFormData = new FormData(hubspotForm);
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';

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
  const qdcCall = hubspotForm.querySelector('input[name="requested_a_salesperson_to_call__c"]').checked;
  let qdc = '';

  if (qdcCall) {
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
  let subscribe = hubspotForm.querySelector('input[name="subscribe"]').checked;
  if (!subscribe) { subscribe = 'false'; }
  const elementmarketingoptin = input({ name: marketingOptin, value: subscribe, type: 'hidden' });
  form.appendChild(elementmarketingoptin);

  // SFDC redirects to returnURL in the response to the form post
  let returnURL = hubspotFormData.get('return_url');
  if (!returnURL) {
    returnURL = formConfig.redirectUrl;
  }

  if (returnURL) {
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
  const elementRetURL = input({ name: 'retURL', value: returnURL, type: 'hidden' });
  form.appendChild(elementRetURL);

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

  const allowedValues = ['Call', 'Demo', 'Quote'];
  if (allowedValues.includes(qdc)) {
    form.submit();
  } else {
    setTimeout(() => { window.top.location.href = returnURL; }, 200);
  }
}
