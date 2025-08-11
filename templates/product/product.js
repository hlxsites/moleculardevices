/* eslint-disable linebreak-style */
import { getFormId } from '../../blocks/forms/formMapping.js';
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

    const productBundle = getMetadata('product_bundle') || getMetadata('bundle-products');
    const productBundleImage = getMetadata('product_bundle_image');
    const productFamily = getMetadata('product_family__c');
    const productImage = getMetadata('thumbnail');
    const productPrimaryApplication = getMetadata('bundle-thumbnail') || '';
    const productSelection = getMetadata('product_selection__c') || '';
    const qdc = getMetadata('qdc') || '';
    const website = getMetadata('website') || '';
    const familyID = getMetadata('family-id');
    const formID = `${formType}-form`;

    const RFQData = await getRFQDataByFamilyID(familyID);
    console.log('RFQ Data:', RFQData);

    const formConfig = {
      formId: getFormId(formType),
      id: formID,
      redirectUrl: RFQData.redirectUrl || '',
      productBundle: RFQData.productBundle || productBundle || '',
      productBundleImage: RFQData.bundleThumbnail || productBundleImage || '',
      productFamily: RFQData.productFamily || productFamily || '',
      productImage: RFQData.productImage || productImage || '',
      productPrimaryApplication: RFQData.productPrimaryApplication || productPrimaryApplication || '',
      productSelection: RFQData.productSelection || productSelection || '',
      qdc: RFQData.qdc || qdc || '',
      website: RFQData.website || website || '',
    };
    console.log('formConfig:', formConfig);

    loadHubSpotScript(() => createHubSpotForm(formConfig, formID));
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
