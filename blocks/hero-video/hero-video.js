import { decorateIcons } from '../../scripts/lib-franklin.js';

function decorateTeaserVideo(video, target) {
  const videoTag = document.createElement('video');
  videoTag.toggleAttribute('autoplay', true);
  videoTag.toggleAttribute('muted', true);
  videoTag.toggleAttribute('loop', true);
  videoTag.setAttribute('title', video.title);
  videoTag.innerHTML = `<source src="${video.href}" type="video/mp4">`;
  target.appendChild(videoTag);
  videoTag.muted = true;
  video.remove();
}

function decorateOverlayButton(block, overlay) {
  const initialButton = overlay.querySelector('a:last-of-type');
  const button = document.createElement('button');
  button.classList.add('video-banner-btn');
  
  button.innerHTML = initialButton.innerHTML;

  button.addEventListener('click', () => {
    const fullVideoContainer = block.querySelector('.full-video-container');
    fullVideoContainer.style.display = 'block';
    fullVideoContainer.querySelector('video').play();
  })

  overlay.appendChild(button);
  initialButton.remove();
}

function createIcons(target, iconNames) {
  iconNames.forEach((iconName) => {
    const icon = document.createElement('span');
    icon.classList.add('icon');
    icon.classList.add(`${iconName}`);

    target.appendChild(icon);
  });

  decorateIcons(target);
}

function decorateFullScreenVideo(fullScreenVideoLink, target) {
  const fullVideoContainer = document.createElement('div');
  fullVideoContainer.classList.add('full-video-container');
  const video = document.createElement('video');
  video.classList.add('video-cover');
  video.innerHTML = `<source src="${fullScreenVideoLink}" type="video/mp4">`;
  video.addEventListener('click', () => {
    video.paused ? video.play() : video.pause();
  });

  const closeVideoButton = document.createElement('div');
  closeVideoButton.classList.add('');
  createIcons(closeVideoButton, ['close-video']);
  closeVideoButton.addEventListener('click', () => {
    video.pause();
    video.currentTime = 0;
    video.load();
    fullVideoContainer.style.display = 'none';
  });

  const playPauseVideoButton = document.createElement('div');
  createIcons(playPauseVideoButton, ['full-screen-play', 'full-screen-pause']);

  fullVideoContainer.appendChild(closeVideoButton);
  fullVideoContainer.appendChild(playPauseVideoButton);
  fullVideoContainer.appendChild(video);
  target.appendChild(fullVideoContainer);
}

export default function decorate(block) {
  const videoBanner = block.children[0];
  videoBanner.classList.add('hero-video-banner');

  const heroContent = videoBanner.children[0];
  heroContent.classList.add('teaser-video-container');
  
  const teaserVideoLink = heroContent.querySelector('a');
  decorateTeaserVideo(teaserVideoLink, heroContent);

  const placeholderPicture = heroContent.querySelector('picture');
  const overlay = videoBanner.children[1];
  overlay.classList = 'overlay';

  //TODO add checks
  const overlayLinks = overlay.querySelectorAll('a');
  const fullScreenVideoLink = overlayLinks[overlayLinks.length -1];
  decorateOverlayButton(block, overlay);
  decorateFullScreenVideo(fullScreenVideoLink, videoBanner);
}
