import createBreadcrumbs from './breadcrumbs-create.js';

export default async function decorate(block) {
  await createBreadcrumbs(block);
}
