import { toClassName } from '../../scripts/lib-franklin.js';
import { isVideo, loadScript } from '../../scripts/scripts.js';
import { div } from '../../scripts/dom-helpers.js';

const getDefaultEmbed = (url) => {
  const embedHTML = `<div style="left: 0; width: 100%; position: relative;">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
        scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;

  return embedHTML;
};

function decorateHubspot(block) {
  const iframeID = block.querySelector('#iframeContent');
  if (iframeID) {
    iframeID.addEventListener('load', () => {
      iFrameResize({ log: false }, iframeID);
    });
  }
}

const embedHubspot = (url) => {
  // clean up hubspot url query paramaters
  loadScript('/scripts/iframeResizer.min.js');
  const urlStr = url.href.replaceAll('%20', ' ');
  const formID = 'iframeContent';
  const embedHTML = `<iframe src="${urlStr}" id='${formID}' loading="lazy" class="iframe-content"></iframe>`;
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

const embedFacebookFeed = (url) => {
  const embedHTML = `
  <div id="fb-root"></div>
  <div class="fb-page" data-href="${url}" data-tabs="timeline" data-width="385" data-height="600" data-small-header="true" data-adapt-container-width="true" data-hide-cover="true" data-show-facepile="true">
    <blockquote cite="${url}" class="fb-xfbml-parse-ignore"><a href="${url}">Molecular Devices LLC</a></blockquote>
  </div>
  `;
  loadScript('https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0', null, null, true);

  return embedHTML;
};

export function embedCerosFrame(url) {
  const embedHTML = `
  <div style="left: 0; width: 100%; position: relative;">
  <iframe
      allowfullscreen
      src="${url.href}"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      frameborder="0"
      class="ceros-experience"
      scrolling="no"
      loading="lazy"
      title="Content from ${url.hostname}"
  ></iframe>
  </div>
  `;
  loadScript('https://view.ceros.com/scroll-proxy.min.js');
  return embedHTML;
}

function embedFlippingBook(url) {
  return `
<div class="flippingbook-mobile">
    <a href="${url.href}" title="View Publication" target="_blank">
        <img src="https://online.flippingbook.com/Thumbnail.aspx?url=${encodeURIComponent(url.href)}&size=400" alt="Flippingbook thumbnail" >
        <img src="/icons/flippingbook.svg" class="book-icon" >
    </a>
</div>
<div class="flippingbook-desktop">
  <iframe
      allowfullscreen
      src="${url.href}"
      scrolling="no"
      loading="lazy"
      title="Content from ${url.hostname}"
  ></iframe>
</div>
  `;
}

function decorateFlippingBook(block, url) {
  if (!block.classList.contains('desktop-modal') || window.innerWidth < 430) {
    return;
  }

  const divContent = `<div>
<span class="close-button"></span>
<iframe
    allowfullscreen
    src="${url.href}"
    scrolling="no"
    loading="lazy"
    title="Content from ${url.hostname}"
></iframe></div>`;
  const modalDiv = div({
    class: 'flippingbook-modal-overlay',
    'aria-hidden': true,
  });
  modalDiv.innerHTML = divContent;
  document.body.append(modalDiv);

  modalDiv.querySelector('.close-button').addEventListener('click', (e) => {
    e.preventDefault();
    modalDiv.setAttribute('aria-hidden', true);
  });

  block.querySelector('.flippingbook-mobile')
    .addEventListener('click', (e) => {
      e.preventDefault();
      modalDiv.removeAttribute('aria-hidden');
    });
}

function embedAdobeIndesign(url) {
  return `<div class="adobe-indesign" style="left: 0; height: 566px; width: 100%; max-width: 800px; position: relative;">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen
        scrolling="no" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;
}

const loadEmbed = (block, link) => {
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
    {
      match: ['facebook'],
      embed: embedFacebookFeed,
    },
    {
      match: ['ceros'],
      embed: embedCerosFrame,
    },
    {
      match: ['flippingbook'],
      embed: embedFlippingBook,
      decorate: decorateFlippingBook,
    },
    {
      match: ['indd.adobe'],
      embed: embedAdobeIndesign,
    },
    {
      match: ['info.moleculardevices.com'],
      embed: embedHubspot,
      decorate: decorateHubspot,
    },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);
  const embedBlock = document.createElement('div');
  embedBlock.innerHTML = config ? config.embed(url) : getDefaultEmbed(url);
  block.append(embedBlock);
  block.classList.add('block', 'embed', 'embed-is-loaded');
  const className = toClassName(config.match[0]);
  if (config) block.classList.add(`embed-${className}`);

  if (config.decorate) {
    config.decorate(block, url);
  }
};

export default function decorate(block) {
  const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6, h7');
  const link = block.querySelector('a').href;

  if (isVideo(new URL(link))) {
    block.classList.add('video');
  } else {
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
}
