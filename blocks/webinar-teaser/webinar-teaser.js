import { decorateIcons } from '../../scripts/lib-franklin.js';
import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const container = block.querySelector(':scope > div > div');

  const teaserTitle = container.querySelector('h2');
  const webinarTitle = container.querySelector('h3');

  const speaker = container.querySelector('h4');
  const speakerTitle = container.querySelector('h5');

  const picture = container.querySelector('a > picture > img');
  const video = (picture) ? picture.closest('p') : '';
  if (video) {
    video.classList.add('webinar-teaser-video-link');
    const videoLink = picture.closest('a');
    videoLink.setAttribute('target', '_blank');
  }

  const registerButton = container.querySelector('p.button-container > a');
  if (registerButton) {
    registerButton.classList.add('button');
    registerButton.classList.add('secondary');
    registerButton.setAttribute('target', '_blank');
  }

  const headerDiv = div({ class: 'webinar-teaser-header' });
  headerDiv.append(teaserTitle, webinarTitle);

  const leftColDiv = div({ class: 'webinar-teaser-left-col' });

  const videoDiv = div({ class: 'webinar-teaser-video' });
  videoDiv.append(speaker, speakerTitle, video);
  leftColDiv.append(videoDiv);

  const rightColDiv = div({ class: 'webinar-teaser-right-col' });

  const contentDiv = div({ class: 'webinar-teaser-content' });
  contentDiv.append(leftColDiv);

  container.append(headerDiv, contentDiv);
  contentDiv.append(rightColDiv);

  // right column holds the rest of the content
  const description = document.querySelectorAll('.webinar-teaser > div > div > p');
  description.forEach((elem) => {
    rightColDiv.append(elem);
  });

  decorateIcons(block);
}
