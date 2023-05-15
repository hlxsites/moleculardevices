import {
  div, img, a, p, h3, i, h2,
} from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { getMetadata } from '../../scripts/lib-franklin.js';
import { embedVideo, fetchFragment } from '../../scripts/scripts.js';
import resourceMapping from './resource-mapping.js';

const relatedResourcesHeaders = {
  Product: 'relatedProducts',
  Technology: 'relatedTechnologies',
  Application: 'relatedApplications',
};

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

  const otherResourcesBlock = div({ class: 'resources-section' });
  otherResources.forEach((item) => {
    const resourceType = item.type;
    const resourceImage = resourceMapping[item.type]?.image;
    const resourceBlock = div(
      { class: `resource type-${resourceMapping[item.type]?.image || 'document'}` },
      div(
        { class: 'resource-icon' },
        img({ src: `/images/resource-icons/${resourceImage || 'document'}.png` }),
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
      const videoElement = videoFragment.querySelector('p:last-of-type a');
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
