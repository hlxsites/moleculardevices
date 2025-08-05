import { toCamelCase } from '../../scripts/lib-franklin.js';

// extract data from table
export async function extractFormData(block) {
  const blockData = {};
  [...block.children].forEach((row) => {
    const key = toCamelCase(row.children[0].textContent.trim().toLowerCase());
    const valueContainer = row.children[1];
    const link = valueContainer.querySelector('a');
    const image = valueContainer.querySelector('img');
    let value;
    if (link) value = link.href;
    else if (image) value = image.src;
    else value = valueContainer.textContent.trim();
    blockData[key] = value;
  });
  return blockData;
}

// form mappings
export const formMapping = [
  { type: 'rfq', id: '09ad331d-27c6-470a-86d4-7d6c4b141bc8' },
  { type: 'app-note', id: 'd6f54803-6515-4313-a7bd-025dfa5cbb5f' },
  { type: 'scientific-poster', id: '837f6e47-0292-4586-8447-297325ff50c1' },
  { type: 'ebook', id: '90a9217a-7e3f-474e-a7a2-8e34d895ef45' },
  { type: 'video-and-webinars', id: '9dc88e8e-68f7-4dcc-82b1-de8c4672797c' },
  { type: 'infographics', id: '17750eb2-f0d3-4584-a534-85b6d7a1dd53' },
  { type: 'lab-notes', id: '9530db8b-2803-469c-a178-9b74f9cb504a' },
  { type: 'newsletter', id: '3b6b0bc3-c874-403c-aa73-ee006b7eb8eb' },
  { type: 'inquiry-with-thankyou', id: '5461143e-c315-40cf-9a92-dd8515e61d4c' },
  { type: 'inquiry', id: 'bbca06dd-57d2-433b-a8c1-d5cd18b4ce28' },
  { type: 'share-story', id: '5d062792-bb0b-4f11-bc26-f3d3422ae4ec' },
  { type: 'promo', id: '014f34d1-570e-49d9-b1a6-c630c5ef609f' },
  { type: 'ebook-promo', id: 'b83700e4-f00b-4b92-9124-fab2968f60b5' },
  { type: 'app-note-promo', id: 'ed0daf7c-99c6-4fd8-aa32-13d4e053fa64' },
  { type: 'product-promo', id: 'cb509c1d-3c9d-4d8a-ac06-11f6e8fd14d0' },
];

export function getFormId(type) {
  return formMapping.find((item) => item.type === type)?.id || '';
}

export const OID = '00D70000000IRvr';
export const timelineValue = '00N70000003iu0b';
export const serialLotNumber = '00N70000003TZlz';
export const productFamily = '00N70000001oP3y';
export const productSelection = '00N0g000003c6tn';
export const fseSalesRepInsideSales = '00N70000003RaEK';
export const prodPrimApp = '00N700000030jhQ';
export const customSolutionsOpportunity = '00N70000003ScgU';
export const preQualifiedForSalesrep = '00N0g000003YFXF';
export const QDCRrequest = '00N70000003iu65';
export const marketingOptin = '00N70000003ipQF';

export const fieldsObj = [
  { inputName: 'first_name', inputFieldName: 'firstname' },
  { inputName: 'last_name', inputFieldName: 'lastname' },
  { inputName: 'email', inputFieldName: 'email' },
  { inputName: 'phone', inputFieldName: 'phone' },
  { inputName: 'company', inputFieldName: 'company' },
  { inputName: 'country', inputFieldName: 'country' },
  { inputName: 'country', inputFieldName: 'country_code' },
  { inputName: 'state', inputFieldName: 'state_dropdown' },
  { inputName: 'state', inputFieldName: 'state' },
  { inputName: 'zip', inputFieldName: 'zip' },
  { inputName: timelineValue, inputFieldName: 'timeline__c' },
  { inputName: 'jobtitle', inputFieldName: 'jobtitle' },
  { inputName: 'city', inputFieldName: 'city' },
  { inputName: 'Danaher_Partner_Rep__c', inputFieldName: 'danaher_partner_rep__c' },
  { inputName: 'Danaher_Partner_Rep_Email__c', inputFieldName: 'danaher_partner_rep_email__c' },
  { inputName: 'EU_Lead_Finder_Agent__c', inputFieldName: 'eu_lead_finder_agent__c' },
  { inputName: 'Contact_Region__c', inputFieldName: 'contact_region__c' },
  { inputName: 'Region__c', inputFieldName: 'region__c' },
  { inputName: 'na_lead_finder_agent__c', inputFieldName: 'na_lead_finder_agent__c' },
  { inputName: serialLotNumber, inputFieldName: 'serial_lot_number__c' },
  { inputName: productFamily, inputFieldName: 'product_family__c' },
  { inputName: productSelection, inputFieldName: 'product_selection__c' },
  { inputName: 'description', inputFieldName: 'description' },
  { inputName: fseSalesRepInsideSales, inputFieldName: 'fse_sales_rep_inside_sales__c' },
  { inputName: fseSalesRepInsideSales, inputFieldName: 'eu_fse_sales_rep_inside_sales' },
  { inputName: fseSalesRepInsideSales, inputFieldName: 'us_fas' },
  { inputName: fseSalesRepInsideSales, inputFieldName: 'eu_fas' },
  { inputName: customSolutionsOpportunity, inputFieldName: 'custom_solutions_opportunity__c' },
  { inputName: preQualifiedForSalesrep, inputFieldName: 'pre_qualified_for_salesrep__c' },
  { inputName: 'Lead_Source_2__c', inputFieldName: 'lead_source_2__c' },
  { inputName: 'Source_Url__c', inputFieldName: 'source_url' },
  { inputName: 'GCLID__c', inputFieldName: 'gclid__c' },
  { inputName: 'Keyword_PPC__c', inputFieldName: 'keyword_ppc__c' },
  { inputName: 'Google_Analytics_Medium__c', inputFieldName: 'google_analytics_medium__c' },
  { inputName: 'Google_Analytics_Source__c', inputFieldName: 'google_analytics_source__c' },
  { inputName: 'Campaign_ID', inputFieldName: 'cmp' },
  { inputName: 'cmp', inputFieldName: 'cmp' },
];
