import { div, ol } from '../../scripts/dom-helpers.js';
import { preloadLCPImage } from '../../scripts/scripts.js';
import { loadBreadcrumbs } from '../hero/hero.js';

function decorateTeaser(video, teaserPicture, target) {
  if (!video && !teaserPicture) {
    // nothing to decorate
    return;
  }

  const videoTag = document.createElement('video');
  videoTag.classList.add('video-cover');
  videoTag.toggleAttribute('muted', true);
  videoTag.toggleAttribute('loop', true);
  videoTag.setAttribute('title', video.title);

  const mql = window.matchMedia('only screen and (max-width: 768px)');
  if (mql.matches && teaserPicture) {
    videoTag.setAttribute('preload', 'metadata');
  } else {
    videoTag.toggleAttribute('autoplay', true);
  }

  mql.onchange = (e) => {
    if (!e.matches && !videoTag.hasAttribute('autoplay')) {
      videoTag.toggleAttribute('autoplay', true);
      videoTag.play();
    }
  };

  videoTag.innerHTML = `<source src="${video.href}" type="video/mp4">`;
  target.prepend(videoTag);
  videoTag.muted = true;
  video.remove();
}

function decorateOverlayButton(fullScreenVideoLink, overlay, fullScreenVideoLinkHref) {
  const button = document.createElement('a');
  button.classList.add('video-banner-btn');
  button.href = fullScreenVideoLinkHref;

  button.innerHTML = fullScreenVideoLink.innerHTML;
  overlay.appendChild(button);
}

export default function decorate(block) {
  const isHomepage = window.location.pathname === '/';
  if (!isHomepage) {
    const breadcrumbs = div({ class: 'breadcrumbs' }, ol());
    block.parentElement.prepend(breadcrumbs);
    loadBreadcrumbs(breadcrumbs);
  }

  const videoBanner = block.children[0];
  videoBanner.classList.add('hero-video-banner');

  const heroContent = videoBanner.children[0];
  heroContent.classList.add('teaser-video-container');

  const teaserVideoLink = heroContent.querySelector('a');
  const teaserPicture = heroContent.querySelector('img');

  teaserPicture.loading = 'eager';
  teaserPicture.fetchPriority = 'high';
  teaserPicture.decoding = 'async';

  const placeholderPicture = heroContent.querySelector('picture').cloneNode(true);

  if (placeholderPicture) {
    placeholderPicture.classList.add('placeholder-image');
    block.appendChild(placeholderPicture);
  }

  preloadLCPImage(teaserPicture.src);
  decorateTeaser(teaserVideoLink, teaserPicture, heroContent);

  const overlay = videoBanner.children[1];
  overlay.classList = 'overlay';

  const fullScreenVideoLink = overlay.querySelector('a:last-of-type');
  if (!fullScreenVideoLink) {
    return;
  }
  const fullScreenVideoLinkHref = fullScreenVideoLink.href;
  decorateOverlayButton(fullScreenVideoLink, overlay, fullScreenVideoLinkHref);
}
