import { button, div, h3 } from '../../scripts/dom-helpers.js';
import { toCamelCase, toClassName } from '../../scripts/lib-franklin.js';
import { loadScript } from '../../scripts/scripts.js';

/* Helper functions */
const keys = ['heading', 'region', 'portalId', 'formId', 'redirectUrl'];
function getDefaultForKey(key) {
  switch (key) {
    case 'region':
      return 'na1';
    case 'heading':
      return '';
    case 'redirectUrl':
      return 'https://www.moleculardevices.com/';
    default:
      return '';
  }
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
      onFormSubmit: () => {
        window.location.href = formConfig.redirectUrl;
      },
      onFormReady: ($form) => {
        const submitInput = $form.querySelector('input[type="submit"]');
        if (submitInput) {
          const submitButton = button({
            type: 'submit',
            class: 'button primary',
          }, submitInput.value || 'Submit');
          submitInput.replaceWith(submitButton);
        }
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
