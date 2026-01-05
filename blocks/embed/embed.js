import { toClassName } from '../../scripts/lib-franklin.js';
import { getCookie, isVideo, loadScript } from '../../scripts/scripts.js';
import { div } from '../../scripts/dom-helpers.js';

/* Utilities */
const loadedScripts = new Set();

function loadOnce(src, ...args) {
  if (loadedScripts.has(src)) return;
  loadedScripts.add(src);
  loadScript(src, ...args);
}

function applyPadding(block) {
  const wrapper = block.querySelector('iframe').parentElement;
  if (!wrapper) return;

  const classes = [...block.classList];

  const getPadding = (prefix) => {
    const cls = classes.find((c) => c.startsWith(prefix));
    return cls ? `${cls.split('-').pop()}%` : null;
  };

  const padding = {
    base: getPadding('padding-top-'),
    md: getPadding('padding-top-md-'),
    lg: getPadding('padding-top-lg-'),
  };

  const apply = () => {
    let value = padding.base;

    if (window.innerWidth >= 900 && padding.lg) {
      value = padding.lg;
    } else if (window.innerWidth >= 600 && padding.md) {
      value = padding.md;
    }

    if (value) {
      wrapper.style.paddingTop = value;
      wrapper.style.position = 'relative';
    }
  };

  apply();
  window.addEventListener('resize', apply, { passive: true });
}

/* Default Embed */
const getDefaultEmbed = (url) => {
  const embedHTML = `<div style="width: 100%; position: relative;">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
        scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;

  return embedHTML;
};

/* Vendor Embeds */
const embedHubspot = (url) => {
  loadOnce('/scripts/iframeResizer.min.js');

  const cmpCookieValue = getCookie('cmp');
  const embededURL = new URL(url.href.replaceAll('%20', ' '));
  embededURL.searchParams.set('source_url', window.location.href);

  if (cmpCookieValue && embededURL.searchParams.has('cmp')) {
    embededURL.searchParams.set('cmp', cmpCookieValue);
  }

  return `<iframe src="${embededURL}" id='iframeContent' loading="lazy" class="iframe-content"></iframe>`;
};

function decorateHubspot(block) {
  const iframe = block.querySelector('#iframeContent');
  if (!iframe) return;

  iframe.addEventListener('load', () => {
    /* global iFrameResize */
    iFrameResize({ log: false }, iframe);
  });
}

function embedSpotify(url) {
  const embedHTML = `<iframe style="border-radius:12px" src="${url.href}" width="100%" height="232" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  return embedHTML;
}

const embedSoundcloud = (url) => {
  const embedHTML = `<div style="left: 0; width: 100%; height: 166px; position: relative;">
        <iframe src="${url.href}"
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
        frameborder="0" loading="lazy"></iframe>
      </div>`;
  return embedHTML;
};

const embedTwitterFeed = (url) => {
  loadOnce('https://platform.twitter.com/widgets.js', null, null, true);
  const embedHTML = `
    <a
      class="twitter-timeline"
      data-chrome="nofooter noborders"
      data-tweet-limit="3"
      href="${url}">
    </a>
  `;

  return embedHTML;
};

const embedFacebookFeed = (url) => {
  loadOnce('https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0', null, null, true);
  const embedHTML = `
  <div id="fb-root"></div>
  <div class="fb-page" data-href="${url}" data-tabs="timeline" data-width="385" data-height="600" data-small-header="true" data-adapt-container-width="true" data-hide-cover="true" data-show-facepile="true">
    <blockquote cite="${url}" class="fb-xfbml-parse-ignore"><a href="${url}">Molecular Devices LLC</a></blockquote>
  </div>
  `;

  return embedHTML;
};

export function embedCerosFrame(url) {
  loadOnce('https://view.ceros.com/scroll-proxy.min.js');
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

  const modalDiv = div({ class: 'flippingbook-modal-overlay', 'aria-hidden': true });
  const divContent = `<div><span class="close-button"></span><iframe allowfullscreen src="${url.href}" scrolling="no" loading="lazy" title="Content from ${url.hostname}"></iframe></div>`;
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

function embedYouTube(url) {
  const videoId = url.searchParams.get('v')
    || url.pathname.split('/').pop();

  if (!videoId) return getDefaultEmbed(url);

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return `
    <div style="width: 100%; position: relative; padding-top: 56.25%;">
      <iframe
        src="${embedUrl}"
        loading="lazy"
        allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="Content from ${url.hostname}"
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
        frameborder="0">
      </iframe>
    </div>
  `;
}

/* Loader */
export const loadEmbed = (block, link) => {
  if (block.classList.contains('embed-is-loaded')) return;

  const EMBEDS_CONFIG = [
    { match: ['soundcloud'], embed: embedSoundcloud },
    { match: ['twitter'], embed: embedTwitterFeed },
    { match: ['facebook'], embed: embedFacebookFeed },
    { match: ['ceros'], embed: embedCerosFrame },
    { match: ['flippingbook'], embed: embedFlippingBook, decorate: decorateFlippingBook },
    { match: ['indd.adobe'], embed: embedAdobeIndesign },
    { match: ['info.moleculardevices.com'], embed: embedHubspot, decorate: decorateHubspot },
    { match: ['open.spotify.com'], embed: embedSpotify },
    { match: ['youtube.com', 'youtu.be'], embed: embedYouTube },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);

  const embedBlock = div();
  embedBlock.innerHTML = config ? config.embed(url) : getDefaultEmbed(url);
  block.append(embedBlock);
  block.classList.add('block', 'embed', 'embed-is-loaded');

  if (config?.match?.length) {
    block.classList.add(`embed-${toClassName(config.match[0])}`);
  }

  applyPadding(block);

  if (config && typeof config.decorate === 'function') {
    config.decorate(block, url);
  }
};

/* Block Decorator */
export default function decorate(block) {
  const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const link = block.querySelector('a')?.href;

  if (!link) return;

  if (isVideo(new URL(link))) {
    block.classList.add('video');
    return;
  }

  block.textContent = '';
  headings.forEach((h) => block.prepend(h));

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadEmbed(block, link);
    }
  });

  observer.observe(block);
}
