import {
  div, a, p, h3, i, h2, span, ul, li, img,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
import { embedVideo, fetchFragment } from '../../scripts/scripts.js';
import resourceMapping from './resource-mapping.js';

const relatedResourcesHeaders = {
  Product: 'relatedProducts',
  Technology: 'relatedTechnologies',
  Application: 'relatedApplications',
};

function handleFilterClick(e) {
  e.preventDefault();
  const { target } = e;
  const selected = target.getAttribute('aria-selected') === 'true';
  if (!selected) {
    const resourceType = target.getAttribute('aria-labelledby');
    const allFilters = document.querySelectorAll('.filter a');
    allFilters.forEach((item) => item.setAttribute('aria-selected', false));
    target.setAttribute('aria-selected', true);
    if (resourceType === 'View All') {
      const filteredResources = document.querySelectorAll('.filtered-item');
      filteredResources.forEach((item) => item.setAttribute('aria-hidden', false));
    } else {
      // hide all displayed items
      const filteredResources = document.querySelectorAll('.filtered-item');
      filteredResources.forEach((item) => item.setAttribute('aria-hidden', true));
      // show filtered items
      const selectedResources = document.querySelectorAll(`.filtered-item[aria-labelledby="${resourceType}"]`);
      selectedResources.forEach((item) => item.setAttribute('aria-hidden', false));
    }
  }
}

export default async function decorate(block) {
  const template = getMetadata('template');
  const title = document.querySelector('.hero .container h1, .hero-advanced .container h1').textContent;
  const includedResourceTypes = Object.keys(resourceMapping);

  const resources = await ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource[relatedResourcesHeaders[template]].includes(title)
        && includedResourceTypes.includes(resource.type))
    .all();
  const otherResources = resources.filter((item) => !['Videos and Webinars', 'Citation'].includes(item.type));
  const videoResources = resources.filter((item) => item.type === 'Videos and Webinars');

  const filtersBlock = ul({ class: 'filters' });
  const filters = [...new Set(otherResources.map((item) => item.type))]
    .filter((item) => item !== 'Citation');
  filters.push('Videos and Webinars');
  const sortedFilters = filters.sort((x, y) => (x.toLowerCase() < y.toLowerCase() ? -1 : 1));
  sortedFilters.unshift('View All');

  sortedFilters.forEach((filter, idx) => {
    filtersBlock.append(li({ class: 'filter' },
      span({ class: 'filter-divider' }, idx === 0 ? '' : '|'),
      a({
        'aria-labelledby': filter,
        href: '#',
        'aria-selected': idx === 0,
        onclick: handleFilterClick,
      }, filter),
    ));
  });

  block.append(filtersBlock);

  const otherResourcesBlock = div({ class: 'resources-section' });
  otherResources.forEach((item) => {
    const resourceType = item.type;
    const resourceImage = resourceMapping[item.type]?.image;
    const resourceBlock = div(
      {
        class: 'resource filtered-item',
        'aria-hidden': false,
        'aria-labelledby': resourceType,
      },
      div(
        { class: 'resource-icon' },
        img({ src: `/images/resource-icons/${resourceImage}.png`, alt: resourceImage, width: 60, height: 60 }),
        // createOptimizedPicture(`/images/resource-icons/${resourceImage}.png`, resourceImage, false, [{ width: '60' }]),
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
          item.description && item.description !== '0' ? item.description : '',
        ),
        div(
          { class: 'resource-actions' },
          p(
            { class: 'resource-link' },
            a(
              { href: item.path },
              `${resourceMapping[resourceType].action} ${resourceType}`,
              i({ class: 'fa fa-chevron-circle-right' }),
            ),
          ),
        ),
      ),
    );
    otherResourcesBlock.append(resourceBlock);
  });

  block.append(otherResourcesBlock);

  if (videoResources.length > 0) {
    const videoResourcesBlock = div({
      class: 'videos-container filtered-item',
      'aria-hidden': false,
      'aria-labelledby': 'Videos and Webinars',
    });
    videoResourcesBlock.append(h2({ class: 'video-resources-title' }, 'Videos & Webinars'));

    const videosContainerBlock = div({ class: 'resources-section' });

    await Promise.all(videoResources.map(async (item) => {
      const videoFragmentHtml = await fetchFragment(item.path);
      const videoFragment = document.createElement('div');
      videoFragment.innerHTML = videoFragmentHtml;
      const videoElement = videoFragment.querySelector('p a[href^="https://share.vidyard.com/watch/"]');
      const videoHref = videoElement?.href;
      if (videoElement && videoHref && videoHref.startsWith('https://')) {
        const videoURL = new URL(videoHref);
        const videoWrapper = div({ class: 'video-wrapper' },
          div({ class: 'video-container' },
            a({ href: videoHref }, videoHref),
          ),
          p({ class: 'video-title' }, item.title),
        );
        embedVideo(videoWrapper.querySelector('a'), videoURL, 'lightbox');
        videosContainerBlock.append(videoWrapper);
      }
    }));

    videoResourcesBlock.append(videosContainerBlock);
    block.append(videoResourcesBlock);
  }

  return block;
}
