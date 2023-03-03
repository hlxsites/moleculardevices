function decorateVideo(video, target) {
  const videoTag = document.createElement('video');
  videoTag.toggleAttribute('autoplay', true);
  videoTag.toggleAttribute('muted', true);
  videoTag.toggleAttribute('loop', true);
  videoTag.setAttribute('title', video.title);
  videoTag.innerHTML = `<source src="${video.href}" type="video/mp4">`;
  target.appendChild(videoTag);
  videoTag.muted = true;
}

function decorateOverlayButton(overlay) {
  const initialButton = overlay.querySelector('a:last-of-type');
  const button = document.createElement('button');
  button.classList.add('video-banner-btn');
  
  button.innerHTML = initialButton.innerHTML;
  overlay.appendChild(button);

  initialButton.remove();
}

export default function decorate(block) {
  const videoBanner = block.children[0];
  videoBanner.classList.add('hero-video-banner');

  const heroContent = videoBanner.children[0];
  heroContent.classList.add('teaser-video-container');
  
  const teaserVideoLink = heroContent.querySelector('a');
  decorateVideo(teaserVideoLink, heroContent);
  teaserVideoLink.remove();

  const placeholderPicture = heroContent.querySelector('picture');
  const overlay = videoBanner.children[1];
  overlay.classList = 'overlay';

  //TODO add checks
  const fullScreenVideoLink = overlay.querySelector('a:last-of-type').href;
  console.log(fullScreenVideoLink);
  decorateOverlayButton(overlay);
}
