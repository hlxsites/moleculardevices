import { div, ol } from '../../scripts/dom-helpers.js';
import { getFirstBackgroundImage, preloadLCPImage } from '../../scripts/scripts.js';
import { loadBreadcrumbs } from '../hero/hero.js';

function decorateTeaser(video, teaserPicture, target) {
  if (!video) return;

  const videoTag = document.createElement('video');
  videoTag.classList.add('video-cover');
  videoTag.muted = true;
  videoTag.loop = true;
  videoTag.playsInline = true; // required for autoplay on iOS
  videoTag.setAttribute('title', video.title);

  if (teaserPicture) {
    videoTag.poster = teaserPicture.src;
  }
  videoTag.preload = 'none';

  const mql = window.matchMedia('only screen and (max-width: 768px)');
  if (!mql.matches || !teaserPicture) {
    videoTag.autoplay = true;
  }

  videoTag.innerHTML = `<source src="${video.href}" type="video/mp4">`;
  target.prepend(videoTag);
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

  const homePromoSection = document.body.querySelector('.home-promo');
  if (isHomepage && homePromoSection) {
    const imageSrc = getFirstBackgroundImage(homePromoSection);
    preloadLCPImage(imageSrc);
  }

  const videoBanner = block.children[0];
  videoBanner.classList.add('hero-video-banner');

  const heroContent = videoBanner.children[0];
  heroContent.classList.add('teaser-video-container');

  const teaserVideoLink = heroContent.querySelector('a');
  const teaserPicture = heroContent.querySelector('img');

  // if (teaserPicture) {
  //   teaserPicture.loading = 'eager';
  //   teaserPicture.fetchPriority = 'high';
  //   teaserPicture.decoding = 'async';
  // }

  const placeholderPicture = heroContent.querySelector('picture').cloneNode(true);
  if (placeholderPicture) {
    placeholderPicture.classList.add('placeholder-image');
    block.appendChild(placeholderPicture);
  }

  // preloadLCPImage(teaserPicture.src);
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];

    if (lastEntry) {
      observer.disconnect();

      setTimeout(() => {
        decorateTeaser(teaserVideoLink, teaserPicture, heroContent);
      }, 300);
    }
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });

  const overlay = videoBanner.children[1];
  overlay.classList = 'overlay';

  const fullScreenVideoLink = overlay.querySelector('a:last-of-type');
  if (fullScreenVideoLink) {
    decorateOverlayButton(fullScreenVideoLink, overlay, fullScreenVideoLink.href);
    fullScreenVideoLink.remove();
  }
}
