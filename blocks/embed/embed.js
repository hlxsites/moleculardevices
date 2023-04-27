const getDefaultEmbed = (url) => {
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
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
  const embedHTML =  `<div class="twitter-timeline twitter-timeline-rendered" style="display: flex; max-width: 100%; margin-top: 0px; margin-bottom: 0px;">
    <iframe
      id="twitter-feed"
      scrolling="no"
      frameborder="0"
      allowtransparency="true"
      allowfullscreen="true"
      class=""
      style="position: static; visibility: visible; width: 390px; height: 1210px; display: block; flex-grow: 1;"
      title="Twitter Timeline"
      src="${url.href}"
    ></iframe>
  </div>
  `
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
    }
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);
  if (config) {
    block.innerHTML = config.embed(url, autoplay);
    block.classList = `block embed embed-${config.match[0]}`;
  } else {
    block.innerHTML = getDefaultEmbed(url);
    block.classList = 'block embed';
  }
  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {
  const link = block.querySelector('a').href;
  block.textContent = '';

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadEmbed(block, link);
    }
  });
  observer.observe(block);
}
