import { div, ol } from '../../scripts/dom-helpers.js';
import { getFirstBackgroundImage, preloadLCPImage } from '../../scripts/scripts.min.js';
import { loadBreadcrumbs } from '../hero/hero.js';

function decorateTeaser(video, teaserPicture, target) {
  if (!video) return;

  const videoTag = document.createElement('video');
  videoTag.classList.add('video-cover');
  videoTag.muted = true;
  videoTag.loop = true;
  videoTag.playsInline = true; // required for autoplay on iOS
  videoTag.preload = 'none';
  videoTag.setAttribute('title', video.title);

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

  const placeholderPicture = heroContent.querySelector('picture').cloneNode(true);
  if (placeholderPicture) {
    placeholderPicture.classList.add('placeholder-image');
    block.appendChild(placeholderPicture);
  }

  setTimeout(() => {
    if (teaserVideoLink) {
      decorateTeaser(teaserVideoLink, teaserPicture, heroContent);
    }
  }, 1200);

  const overlay = videoBanner.children[1];
  overlay.classList = 'overlay';

  const fullScreenVideoLink = overlay.querySelector('a:last-of-type');
  if (fullScreenVideoLink) {
    decorateOverlayButton(fullScreenVideoLink, overlay, fullScreenVideoLink.href);
    fullScreenVideoLink.remove();
  }
}
