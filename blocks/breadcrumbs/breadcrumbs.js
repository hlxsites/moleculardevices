import { ol } from '../../scripts/dom-helpers.js';
import createBreadcrumbs from './breadcrumbs-create.js';

export default async function decorate(block) {
  block.replaceChildren(ol());
  await createBreadcrumbs(block);
}
