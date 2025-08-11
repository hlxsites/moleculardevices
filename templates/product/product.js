/* eslint-disable linebreak-style */
import { createHubSpotForm, loadHubSpotScript } from '../../blocks/forms/forms.js';
import { getRFQDataByFamilyID } from '../../blocks/quote-request/quote-request.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

const formType = 'product-rfq';

export default async function buildAutoBlocks() {
  let formLoaded = false;

  const initForm = async () => {
    if (formLoaded) return true;

    const block = document.getElementById(`${formType}-form`);
    if (!block) return false;

    formLoaded = true;

    const familyID = getMetadata('family-id');
    const RFQData = await getRFQDataByFamilyID(familyID);
    const formConfig = {
      ...RFQData,
      formType,
      formId: RFQData?.formId || formType || '',
      redirectUrl: RFQData?.redirectUrl ?? null,
    };

    loadHubSpotScript(createHubSpotForm.bind(null, formConfig));
    return true;
  };

  if (await initForm()) return;

  const observer = new MutationObserver(async () => {
    if (formLoaded) return;
    if (await initForm()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
