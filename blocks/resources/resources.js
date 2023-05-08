import { div, img, a, p, h3, i } from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

const relatedResourcesHeaders = {
  Product: 'relatedProducts',
  Technology: 'relatedTechnologies',
  Application: 'relatedApplications',
};
const relatedResourcesExcludedTypes = ['Interactive Demo'];

export default async function decorate(block) {
  const template = getMetadata('template');
  const title = document.querySelector('.hero-advanced .container h1').textContent;

  const resources = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource[relatedResourcesHeaders[template]].includes(title)
        && !relatedResourcesExcludedTypes.includes(resource.type))
    .all();
  const otherResources = resources.filter(item => item.type !== 'Videos and Webinars');
  console.log(otherResources)
  const videoResources = resources.filter(item => item.type === 'Videos and Webinars');
  block.classList.add('citation-list');
  otherResources.forEach(item => {
    const resourceBlock = div(
      { class: 'resource' },
      div(
        { class: 'resource-icon' },
        img({ src: '/images/resource-icons/citation.png' }),
      ),
      div(
        { class: 'resource-info' },
        div(
          { class: 'resource-header' },
          p(item.type),
          h3(item.title),
        ),
        div(
          { class: 'resource-description' },
          item.description,
        ),
        div(
          { class: 'resource-actions' },
          p(
            { class: 'resource-link' },
            a(
              { href: item.path },
              item.c2aLink || 'Learn more',
              i({ class: 'fa fa-chevron-circle-right' }),
            ),
          ),
        ),
      ),
    );
    block.append(resourceBlock);
  });

  return block;
}
