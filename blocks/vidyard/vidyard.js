import { loadScript } from '../../scripts/scripts.js';

const getVidYardImg = (id, thumbnail, type = 'lightbox') => `<img
    style="width: 100%; margin: auto; display: block;"
    class="vidyard-player-embed"
    src="${thumbnail ? thumbnail : 'https://play.vidyard.com/' + id + '.jpg'}"
    data-uuid="${id}"
    data-v="4"
    data-type="${type}"
  />`;

export default function decorate(block) {
  loadScript('https://play.vidyard.com/embed/v4.js');

  const videoUrl = block.querySelector('a').href;
  const videoId = videoUrl.substring(videoUrl.lastIndexOf('/') + 1);
  const thumbnail = block.querySelector('img');

  block.innerHTML = getVidYardImg(
    videoId,
    thumbnail ? thumbnail.src : null,
    block.classList.contains('lightbox') ? 'lightbox' : 'inline',
  );
}
