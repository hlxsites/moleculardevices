import { loadScript } from '../../scripts/scripts.js';

const getVidYardImg = (id, type = 'lightbox') => `<img
    style="width: 100%; margin: auto; display: block;"
    class="vidyard-player-embed"
    src="https://play.vidyard.com/${id}.jpg"
    data-uuid="${id}"
    data-v="4"
    data-type="${type}"
  />`;

export default function decorate(block) {
  loadScript('https://play.vidyard.com/embed/v4.js');
  const videoId = block.textContent.trim();

  block.innerHTML = getVidYardImg(videoId);
}
