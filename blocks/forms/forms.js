import {
  button, div, h3, input,
} from '../../scripts/dom-helpers.js';
import { toCamelCase, toClassName } from '../../scripts/lib-franklin.js';
import { loadScript } from '../../scripts/scripts.js';
import {
  fieldsObj, getDefaultForKey, marketingOptin, OID, prodPrimApp, QDCRrequest, RESOURCEKEYS,
} from './formHelper.js';

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

  RESOURCEKEYS.forEach((key) => {
    if (!blockData[key]) {
      blockData[key] = getDefaultForKey(key);
    }
  });
  return blockData;
}

/* create hubspot form */
function createHubSpotForm(formConfig, target) {
  try {
    hbspt.forms.create({ // eslint-disable-line
      region: formConfig.region,
      portalId: formConfig.portalId,
      formId: formConfig.formId,
      target: `#${target}`,
      onFormReady: (form) => {
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
            const mResearchArea = formConfig.researchArea;
            const mPrimaryApplication = formConfig.productPrimaryApplication;
            const mRequestedQdcDiscussionC = formConfig.qdc;
            const mCmp = formConfig.cmp || valuecmp;
            const mReturnUrl = formConfig.redirectUrl;

            // Update the form with SFDC values if they exist
            if (form.querySelector('input[name="return_url"]') && mReturnUrl !== '') {
              form.querySelector('input[name="return_url"]').value = mReturnUrl;
            }
            if (form.querySelector('input[name="product_family__c"]') && mProductFamily !== '') {
              form.querySelector('input[name="product_family__c"]').value = mProductFamily;
            }
            if (form.querySelector('input[name="research_area"]') && mResearchArea !== '') {
              form.querySelector('input[name="research_area"]').value = mResearchArea;
            }

            if (form.querySelector('input[name="product_primary_application__c"]') && mPrimaryApplication !== '') {
              form.querySelector('input[name="product_primary_application__c"]').value = mPrimaryApplication;
            }
            if (form.querySelector('input[name="requested_qdc_discussion__c"]') && mRequestedQdcDiscussionC !== '') {
              form.querySelector('input[name="requested_qdc_discussion__c"]').value = mRequestedQdcDiscussionC;
            }

            if (form.querySelector('input[name="cmp"]') && mCmp) {
              form.querySelector('input[name="cmp"]').value = mCmp;
            }

            // Customize the submit button
            const submitInput = form.querySelector('input[type="submit"]');
            if (submitInput) {
              const submitButton = button({
                type: 'submit',
                class: 'button primary',
              }, submitInput.value || 'Submit');
              submitInput.replaceWith(submitButton);
            }
          }
        });
      },
      onFormSubmit: (hubspotForm) => {
        setTimeout(() => {
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

          /* qdc */ // test case
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

          // Append the form to the body
          document.body.appendChild(form);

          const allowedValues = ['Call', 'Demo', 'Quote'];
          if (allowedValues.includes(qdc)) {
            form.submit();
          } else {
            setTimeout(() => { window.top.location.href = returnURL; }, 200);
          }
          /* END */
        }, 1000);
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('HubSpot form API is not available:', e);
    setTimeout(() => createHubSpotForm(formConfig, target), 200);
  }
}

/* load hubspot script */
function loadHubSpotScript(callback) {
  loadScript(`https://js.hsforms.net/forms/v2.js?v=${new Date().getTime()}`, callback);
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
