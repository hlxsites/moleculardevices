import { button, div, h3 } from '../../scripts/dom-helpers.js';
import { toCamelCase, toClassName } from '../../scripts/lib-franklin.js';
import { loadScript } from '../../scripts/scripts.js';
import { createSalesforceForm, getDefaultForKey, RESOURCEKEYS } from './formHelper.js';

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
    /* change return url's origin */
    if (key === 'redirectUrl' && blockData[key].includes('hlxsites.hlx.page')) {
      const redirectOBJ = new URL(blockData[key]);
      const currentPageOrigin = window.location.origin;
      blockData[key] = `${currentPageOrigin}${redirectOBJ.pathname}${redirectOBJ.search}`;
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

            // change redirect url's origin
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
        createSalesforceForm(hubspotForm, formConfig);
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
  loadScript(`https://js.hs-scripts.com/20222769.js?v=${new Date().getTime()}`, callback);
}

export default async function decorate(block, index) {
  const formConfig = await extractFormData(block);
  const formHeading = formConfig.heading || '';
  const target = toClassName(formHeading) || `hubspot-form-${index}`;

  const form = div(
    h3(formHeading),
    div({ id: target, class: 'hubspot-form' }),
  );

  block.replaceWith(form);
  loadHubSpotScript(createHubSpotForm.bind(null, formConfig, target));
}
