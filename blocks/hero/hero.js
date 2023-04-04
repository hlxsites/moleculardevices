import { loadScript } from '../../scripts/scripts.js';
import createBreadcrumbs from '../breadcrumbs/breadcrumbs-create.js';

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

function getUrls(text) {
  const match = text.match(/\b((https?|ftp|file):\/\/|(www|ftp)\.)[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/ig);
  // console.error(match);
  // if (match) console.error(match.length);
  if (match) return match;
  return null;
  // return match ? match.join("\n") : null;
}

// get the first valid video url
function getVideoUrl(text) {
  let videoUrl = null;
  if (getUrls(text)) {
    // console.error(getUrls(text).length);
    const hostnames = ['vids.moleculardevices.com', 'share.vidyard.com'];
    [...getUrls(text)].forEach((url) => {
      // console.error((url));
      if (isValidUrl(url)) {
        // console.error(url);
        [...hostnames].forEach((hostname) => {
          // console.error(hostname);
          if (url.includes(hostname)) {
            // console.error(`returning url: ${url}`)
            videoUrl = url;
          }
        });   
      }
    });
  }
  // console.error('null');
  return videoUrl;
}

// function isVideoDomain(text) {
//   let isVideo = false;
//   if (isValidUrl(text)) {
//     const domains = ['vids.moleculardevices.com', 'share.vidyard.com'];
//     [...domains].forEach((domain) => {
//       if (text.includes(domain)) isVideo = true;
//     })
//   }
//   return isVideo;
// }

function getVideoId(text) {
  if (getVideoUrl(text)) {
    const parts = getVideoUrl(text).split('/');
    return parts.at(-1).trim();
  }
  return null;
}

// function getVideoId(text) {
//   if (isVideoDomain(text)) {
//     const parts = text.split('/');
//     return parts.at(-1).trim();
//   }
//   return null;
// }

function buildVideo(block, div, videoId) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadScript('https://play.vidyard.com/embed/v4.js');

      const videoIcon = document.createElement('div');
      const thumbnail = document.createElement('img');
      videoIcon.append(thumbnail);

      videoIcon.classList.add('video_icon');
      thumbnail.src = '/images/play_icon.png';

      div.innerHTML = `<div id="sample">
        <div class="vidyard-player-embed" data-uuid="${videoId}" data-v="4" data-type="lightbox"></div>
      </div>`
      div.appendChild(videoIcon);

      thumbnail.addEventListener('click', () => {
        var players = VidyardV4.api.getPlayersByUUID(videoId);
        var player = players[0];
        player.showLightbox();
      });
    }
  });
  observer.observe(block);
}

export default async function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('container');
  if (block.childElementCount > 1) {
    container.classList.add('two-column');
  }

  [...block.children].forEach((div) => {
    if (getVideoId(div.textContent)) {
      div.classList.add('video-column');
      buildVideo(block, div, getVideoId(div.textContent));
    }
    container.appendChild(div);
  });

  const breadcrumbs = document.createElement('div');
  breadcrumbs.classList.add('breadcrumbs');
  await createBreadcrumbs(breadcrumbs);
  block.appendChild(breadcrumbs);
  block.appendChild(container);

  const picture = block.querySelector('picture');
  block.prepend(picture.parentElement);
}
