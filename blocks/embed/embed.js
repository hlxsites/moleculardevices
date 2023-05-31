import { loadScript } from '../../scripts/scripts.js';

const getDefaultEmbed = (url) => {
  const embedHTML = `<div style="left: 0; width: 100%; position: relative;">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
        scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;

  return embedHTML;
};

const embedSoundcloud = (url) => {
  const embedHTML = `<div style="left: 0; width: 100%; height: 166px; position: relative;">
        <iframe src="${url.href}" 
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
        frameborder="0" loading="lazy"></iframe>
      </div>`;
  return embedHTML;
};

const embedTwitterFeed = (url) => {
  const embedHTML = `
    <a
      class="twitter-timeline"
      data-chrome="nofooter noborders"
      data-tweet-limit="3"
      href="${url}">
    </a>
  `;
  loadScript('https://platform.twitter.com/widgets.js', null, null, true);

  return embedHTML;
};

const loadEmbed = (block, link, autoplay) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ['soundcloud'],
      embed: embedSoundcloud,
    },
    {
      match: ['twitter'],
      embed: embedTwitterFeed,
    },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);
  const embedBlock = document.createElement('div');
  embedBlock.innerHTML = config ? config.embed(url, autoplay) : getDefaultEmbed(url);
  block.append(embedBlock);
  block.classList.add('block, embed, embed-is-loaded');
  if (config) block.classList.add(config.match[0]);
};

export default function decorate(block) {
  const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6, h7');
  const link = block.querySelector('a').href;
  block.textContent = '';

  [...headings].forEach((heading) => {
    block.prepend(heading);
  });

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadEmbed(block, link);
    }
  });
  observer.observe(block);
}
