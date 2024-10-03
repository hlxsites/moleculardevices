import {
  button, div, h3, input,
} from '../../scripts/dom-helpers.js';
import { toCamelCase, toClassName } from '../../scripts/lib-franklin.js';
import { loadScript } from '../../scripts/scripts.js';

/* Helper functions */
const keys = ['heading', 'region', 'portalId', 'formId', 'redirectUrl', 'productFamily', 'productPrimaryApplication', 'cmp'];
function getDefaultForKey(key) {
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
const timelineValue = '00N70000003iu0b';
const serialLotNumber = '00N70000003TZlz';
const productFamily = '00N70000001oP3y';
const productSelection = '00N0g000003c6tn';
const fseSalesRepInsideSales = '00N70000003RaEK';
const euFseSalesRepInsideSales = '00N70000003RaEK';
const usFas = '00N70000003RaEK';
const euFas = '00N70000003RaEK';
const customSolutionsOpportunity = '00N70000003ScgU';
const preQualifiedForSalesrep = '00N0g000003YFXF';
const QDCRrequest = '00N70000003iu65';
const marketingOptin = '00N70000003ipQF';
const prodPrimApp = '00N700000030jhQ';
const fields = [
  { newName: 'first_name', fieldName: 'firstname' },
  { newName: 'last_name', fieldName: 'lastname' },
  { newName: 'email', fieldName: 'email' },
  { newName: 'phone', fieldName: '0-2/phone' },
  { newName: 'company', fieldName: 'company' },
  { newName: 'country', fieldName: 'country' },
  { newName: 'country_code', fieldName: 'country_code' }, // TEST CASE
  { newName: 'state', fieldName: 'state_dropdown, state' }, // TEST CASE
  { newName: 'zip', fieldName: 'zip' },
  { newName: timelineValue, fieldName: 'timelineValue' },
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
  { newName: productFamily, fieldName: 'product_family__c' }, // TEST CASE
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
/* extract data from table  */
async function extractFormData(block) {
  const blockData = {};
  [...block.children].forEach((row) => {
    const key = toCamelCase(row.children[0].textContent.trim().toLowerCase());
    const value = row.children[1].textContent.trim();
    blockData[key] = value;
  });

  keys.forEach((key) => {
    if (!blockData[key]) {
      blockData[key] = getDefaultForKey(key);
    }
  });
  return blockData;
}

/* create hubspot form */
function createHubSpotForm(formConfig, target) {
  // console.log(formConfig);
  if (window.hbspt) {
    hbspt.forms.create({ // eslint-disable-line
      portalId: formConfig.portalId,
      formId: formConfig.formId,
      target: `#${target}`,
      onFormReady: (hubspotForm) => {
        // Handle Salesforce hidden fields via message event listener
        window.addEventListener('message', (event) => {
          if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormReady') {
            // Get the cmp parameters
            const params = new Proxy(new URLSearchParams(window.location.search), {
              get: (searchParams, prop) => searchParams.get(prop),
            });
            const valuecmp = params.cmp;

            // Salesforce form fields
            const mProductFamily = formConfig.productFamily;
            const mPrimaryApplication = formConfig.productPrimaryApplication;
            const mCmp = valuecmp || formConfig.cmp;

            // Update the form with SFDC values if they exist
            if (hubspotForm.querySelector('input[name="product_family__c"]') && mProductFamily !== '') {
              hubspotForm.querySelector('input[name="product_family__c"]').value = mProductFamily;
            }
            if (hubspotForm.querySelector('input[name="product_primary_application__c"]') && mPrimaryApplication !== '') {
              hubspotForm.querySelector('input[name="product_primary_application__c"]').value = mPrimaryApplication;
            }
            if (hubspotForm.querySelector('input[name="cmp"]') && mCmp) {
              hubspotForm.querySelector('input[name="cmp"]').value = mCmp;
            }
          }
        });

        // Customize the submit button
        const submitInput = hubspotForm.querySelector('input[type="submit"]');
        if (submitInput) {
          const submitButton = button({
            type: 'submit',
            class: 'button primary',
          }, submitInput.value || 'Submit');
          submitInput.replaceWith(submitButton);
        }
      },
      onFormSubmit: (hubspotForm) => {
        // console.log(hubspotForm);
        const hubspotFormData = new FormData(hubspotForm);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';

        // Your org ID
        const elementOID = input({ name: 'oid', value: '00D70000000IRvr', type: 'hidden' });
        form.appendChild(elementOID);

        // generate a form from Customize | Leads | Web-to-Lead to figure out more
        fields.forEach(({ newName, fieldName }) => {
          const inputField = createCustomField(hubspotFormData, fieldName, newName);
          if (inputField && inputField !== 0) {
            form.appendChild(inputField);
          }
        });

        let qdc = hubspotFormData.get('requested_a_salesperson_to_call__c');
        if (qdc !== undefined && qdc !== '') { qdc = 'Call'; }
        const elementqdcrequest = input({ name: QDCRrequest, value: qdc, type: 'hidden' });
        form.appendChild(elementqdcrequest);

        let subscribe = hubspotFormData.get('subscribe');
        if (subscribe === undefined && subscribe === '') { subscribe = 'Call'; }
        const elementmarketingoptin = input({ name: marketingOptin, value: subscribe, type: 'hidden' });
        form.appendChild(elementmarketingoptin);

        // SFDC redirects to retURL in the response to the form post
        let returnURL = hubspotFormData.get('return_url');
        if (returnURL !== undefined && returnURL !== '') {
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
        } else {
          returnURL = new URL(formConfig.redirectUrl).pathname;
        }
        const elementRetURL = input({ name: 'retURL', value: returnURL, type: 'hidden' });
        form.appendChild(elementRetURL);

        // test case
        const primaryApplicationText = hubspotFormData.get('product_primary_application__c');
        const productAndPrimaryFtype = hubspotFormData.get('product_and_primary_application_na___service_contracts');
        let primaryApplication = '';
        if (productAndPrimaryFtype) {
          const checkboxes = hubspotForm.getElementsByName('product_and_primary_application_na___service_contracts');
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

        // console.log(form);
        document.body.appendChild(form);

        // console.log(qdc);
        const allowedValues = ['Call', 'Demo', 'Quote'];
        if (allowedValues.includes(qdc)) {
          form.submit();
        }

        // /* redircted to thank you page */
        // window.location.href = new URL(formConfig.redirectUrl).pathname;
      },
    });
  } else {
    // eslint-disable-next-line no-console
    console.error('HubSpot form API is not available.');
  }
}

/* load hubspot script */
function loadHubSpotScript(callback) {
  loadScript('//js.hsforms.net/forms/v2.js', callback, 'text/javascript', true, false);
}

export default async function decorate(block, index) {
  const formConfig = await extractFormData(block);
  const formHeading = formConfig.heading || '';
  const target = toClassName(formHeading) || `hubspot-form-${index}`;

  const form = div(
    h3(formHeading),
    div({
      id: target,
      class: 'hubspot-form',
    }),
  );

  block.replaceWith(form);
  loadHubSpotScript(createHubSpotForm.bind(null, formConfig, target));
}
