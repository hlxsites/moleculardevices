import ffetch from '../../scripts/ffetch.js';
import { fetchFragment } from '../../scripts/scripts.js';

const RFQ_DATA_URL = '/quote-request/global-rfq.json';

export const rfqTypes = await ffetch(RFQ_DATA_URL).sheet('types').all();
export const rfqCategories = await ffetch(RFQ_DATA_URL).sheet('categories').all();

export async function getRFQDataByFamilyID(pid) {
  if (!pid) return false;
  const productRfq = await ffetch('/query-index.json')
    .sheet('rfq')
    .withFetch(fetch)
    .filter(({ familyID }) => familyID === pid)
    .first();
  return productRfq;
}

export async function getRFQDataByTitle(name) {
  if (!name) return false;
  const productRfq = await ffetch('/query-index.json')
    .sheet('rfq')
    .withFetch(fetch)
    .filter(({ title }) => title === name)
    .first();
  return productRfq;
}

export async function getRelatedProductsFromFragment(path) {
  const html = await fetchFragment(path, false);
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.querySelector('meta[name="related-products"]')?.content || '';
}
