import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { a, div as divHelper, div, li as liHelper, p, } from '../../scripts/dom-helpers.js';
import { isVideo, loadScript } from '../../scripts/scripts.js';

export function embedVideo(link, url, type) {
  const videoId = url.pathname.substring(url.pathname.lastIndexOf('/') + 1).replace('.html', '');
  console.log('videoId', videoId);
  loadScript('https://play.vidyard.com/embed/v4.js');
  link.parentElement.innerHTML = `<img style="width: 100%; margin: auto; display: block;"
      class="vidyard-player-embed"
      src="https://play.vidyard.com/${videoId}.jpg"
      data-uuid="${videoId}"
      data-v="4"
      data-width="${type === 'lightbox' ? '700' : ''}"
      data-height="${type === 'lightbox' ? '394' : ''}"
      data-autoplay="${type === 'lightbox' ? '1' : '0'}"
      data-type="${type === 'lightbox' ? 'lightbox' : 'inline'}"/>`;
}

// prettier-ignore
export default function decorate(block) {
  /*
<p class="button-container"></p>
<div class="video-wrapper">
  <div class="video-container">
    <a href="https://vids.moleculardevices.com/watch/KPtbYfqE5nuduV2eJiKuTL?">View video</a>
  </div>
  <p class="video-title">View video</p>
</div>


<p class="button-container">
  <strong>
    <a href="/technology/digital-confocal-option-2d-real-time-deconvolution" title="Learn more" class="button primary">Learn more
      <span class="button-border"></span>
    </a>
  </strong>
</p>
 */
  block.querySelectorAll('a').forEach((link) => {
    const url = new URL(link.href);
    // decorate video links
    if (isVideo(url)) {
      //const wrapper = div({ class: 'video-wrapper' }, div({ class: 'video-container' }, a({ href: link.href }, link.textContent)));
      embedVideo(link, url, 'lightbox');
    }
  });
/*  block.querySelectorAll('div.video-wrapper').forEach((wrapper) => {
    console.log('video container', wrapper);
    const link = wrapper.querySelector('a');
    const previous = wrapper.previousElementSibling;
    if (previous !== null && previous.classList.contains('button-container') && previous.innerHTML.trim() === '') {
      console.log('matches!', link.outerHTML);
      /*previous.innerHTML = link.outerHTML;
      wrapper.remove();

      const videoContainer = wrapper.querySelector('.video-container');
      const url = new URL(link);
      videoButton(videoContainer, link, url);
    } else {
      // TODO see if we can validate this in any way
      console.error('previous not button-container', previous, wrapper, wrapper.parentElement, wrapper.parentElement.parentElement);
    }
  });
*/
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const wrappingDiv = divHelper({ class: 'cards-card-wrapper' });
    wrappingDiv.innerHTML = row.innerHTML;
    [...wrappingDiv.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });

    const li = liHelper(wrappingDiv);

    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]))
  });
  block.textContent = '';
  block.append(ul);

  if (block.classList.contains('image-link')) {
    block.querySelectorAll('li').forEach((li) => {
      const link = li.querySelector('a');
      const picture = li.querySelector('picture');
      const pictureClone = picture.cloneNode(true);
      const newLink = a({ href: link.href }, pictureClone);
      picture.parentNode.replaceChild(newLink, picture);
    });
  }


/*
  block.querySelectorAll('a').forEach((link) => {
    const url = new URL(link);
    if (isVideo(url)) {
      console.log("it is video (cards)!", url);
      const videoContainer = link.closest('div');
      videoContainer.classList.add('video-column');
      const videoIcon = button({ class: 'video-icon' }, imgHelper({ src: '/images/play_icon.png' }));
      videoContainer.appendChild(videoIcon);
      videoButton(videoContainer, videoContainer.querySelector('img'), url);
      link.remove();
    }
  });

 */
}
