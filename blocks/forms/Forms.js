import { button, div } from '../../scripts/dom-helpers.js';
import { loadScript } from '../../scripts/scripts.js';

/* EXTRACT DATA FROM TABLE  ***/
async function extractTableData(table) {
  const tableData = {};
  table.querySelectorAll('tbody tr').forEach((row) => {
    const key = row.cells[0].textContent.trim().toLowerCase();
    const value = row.cells[1].textContent.trim();
    tableData[key] = value;
  });
  return tableData;
}

/* CREATE HUBSPOT FORM */
function createHubSpotForm(formConfig) {
  if (window.hbspt) {
    hbspt.forms.create({ // eslint-disable-line
      portalId: formConfig.portalid,
      formId: formConfig.formid,
      target: `#${formConfig.target}`,
      onFormSubmit: () => {
        window.location.href = formConfig.redirecturl;
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

function loadHubSpotScript(callback) {
  loadScript('//js.hsforms.net/forms/v2.js', callback, 'text/javascript', true, false);
}

export default async function decorate(block) {
  const table = block.querySelector('table');
  const formConfig = await extractTableData(table);
  const form = div({ id: formConfig.target, class: 'content' });
  if (table) {
    table.replaceWith(form);
  }
  loadHubSpotScript(createHubSpotForm.bind(null, formConfig));
}
