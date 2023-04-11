import { loadScript } from '../../scripts/scripts.js';

export default function decorate(block) {
  const videoUrl = block.querySelector('a');
  if (videoUrl) {
    const videoId = videoUrl.href.substring(videoUrl.href.lastIndexOf('/') + 1);
    const thumbnail = block.querySelector('img');
    if (thumbnail) {
      loadScript('https://play.vidyard.com/embed/v4.js');
      thumbnail.style = 'width: 100%; margin: auto; display: block;';
      thumbnail.classList.add('vidyard-player-embed');
      thumbnail.setAttribute('data-uuid', videoId);
      thumbnail.setAttribute('data-v', '4');
      thumbnail.setAttribute('data-width', block.classList.contains('lightbox') ? '700' : '');
      thumbnail.setAttribute('data-height', block.classList.contains('lightbox') ? '394' : '');
      thumbnail.setAttribute('data-autoplay', block.classList.contains('lightbox') ? '1' : '0');
      thumbnail.setAttribute(
        'data-type',
        block.classList.contains('lightbox') ? 'lightbox' : 'inline',
      );
      videoUrl.remove();
    } else {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          loadScript('https://play.vidyard.com/embed/v4.js');
          block.innerHTML = `<img style="width: 100%; margin: auto; display: block;"
            class="vidyard-player-embed"
            src="https://play.vidyard.com/${videoId}.jpg"
            data-uuid="${videoId}"
            data-v="4"
            data-width="${block.classList.contains('lightbox') ? '700' : ''}"
            data-height="${block.classList.contains('lightbox') ? '394' : ''}"
            data-autoplay="${block.classList.contains('lightbox') ? '1' : '0'}"
            data-type="${block.classList.contains('lightbox') ? 'lightbox' : 'inline'}"/>`;
        }
      });
      observer.observe(block);
    }
  }
}
