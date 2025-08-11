/* eslint-disable linebreak-style */
import { getFormId } from '../../blocks/forms/formMapping.js';
import { createHubSpotForm, loadHubSpotScript } from '../../blocks/forms/forms.js';
import { getRFQDataByFamilyID } from '../../blocks/quote-request/quote-request.js';
import { getMetadata, toClassName } from '../../scripts/lib-franklin.js';

const formType = 'product-rfq';

export default async function buildAutoBlocks() {
  // get RFQ required field value on product page
  const productBundle = getMetadata('product_bundle');
  const productBundleImage = getMetadata('product_bundle_image');
  const productFamily = getMetadata('product_family__c');
  const productImage = getMetadata('thumbnail');
  const productPrimaryApplication = getMetadata('bundle-thumbnail') || '';
  const productSelection = getMetadata('bundle-thumbnail') || '';
  const qdc = getMetadata('bundle-thumbnail') || '';
  const website = getMetadata('bundle-thumbnail') || '';
  const familyID = getMetadata('family-id');
  const rgqData = await getRFQDataByFamilyID(familyID);
  console.log(rgqData);

  const block = document.getElementsByClassName(formType)[0];
  const targetID = toClassName(block.querySelector('h3')?.textContent);
  console.log(targetID);
  if (targetID) {
    const formConfig = {
      formId: getFormId(formType),
      latestNewsletter: null,
      redirectUrl: null,
      id: targetID,
      productBundle,
      productBundleImage,
      productFamily,
      productImage,
      productPrimaryApplication,
      productSelection,
      qdc,
      website,
    };
    loadHubSpotScript(createHubSpotForm.bind(null, formConfig, targetID));
  }
}
