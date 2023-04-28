import { loadScript } from '../../scripts/scripts.js';

export function isVideo(url) {
  let isVideo = false;
  const hostnames = ['vids.moleculardevices.com', 'share.vidyard.com'];
  [...hostnames].forEach((hostname) => {
    if (url.hostname.includes(hostname)) {
      isVideo = true;
    }
  });
  return isVideo;
}

export function buildVideo(block, div, url) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadScript('https://play.vidyard.com/embed/v4.js');

      const videoId = url.pathname.split('/').at(-1).trim();
      const videoIcon = document.createElement('div');
      const thumbnail = document.createElement('img');
      videoIcon.append(thumbnail);
      videoIcon.classList.add('video-icon');
      thumbnail.src = '/images/play_icon.png';

      div.innerHTML = `<div id="sample">
        <div class="vidyard-player-embed" data-uuid="${videoId}" data-v="4" data-type="lightbox" data-autoplay="2"></div>
      </div>`;
      div.appendChild(videoIcon);

      thumbnail.addEventListener('click', () => {
        // eslint-disable-next-line no-undef
        const players = VidyardV4.api.getPlayersByUUID(videoId);
        const player = players[0];
        player.showLightbox();
      });
    }
  });
  observer.observe(block);
}
