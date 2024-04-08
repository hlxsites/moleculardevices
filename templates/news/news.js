import { formatDate } from '../../scripts/scripts.js';
import { loadEmbed } from '../../blocks/embed/embed.js';
import {
  a,
  div, i, p, span, strong,
} from '../../scripts/dom-helpers.js';

import {
  getMetadata, buildBlock,
} from '../../scripts/lib-franklin.js';

function decorateTitle(parentElem, titleElem) {
  titleElem.classList.add('event-title');
  if (titleElem) {
    parentElem.append(titleElem);
  }
}

function decorateCite(parentElem) {
  const dt = getMetadata('publication-date');
  if (dt) {
    const cite = span({ class: 'event-date' }, formatDate(dt));
    parentElem.append(cite);
  }
}

function decorateStrong(elems) {
  elems.forEach((elem) => {
    const parent = elem.parentElement;
    if (parent.children.length === 1) {
      parent.classList.add('text-strong');
    }
  });
}

function decorateCaption(elems) {
  elems.forEach((elem) => {
    const parent = elem.parentElement;
    const next = parent.nextElementSibling;
    if (parent && next && next.querySelector('p > em')) {
      next.classList.add('text-caption');
    }
  });
}

function decorateReadMore(linkElem) {
  if (linkElem) {
    linkElem.classList.add('ext');
    linkElem.setAttribute('target', '_blank');
    linkElem.setAttribute('rel', 'noopener noreferrer');

    const extLinkBtn = i({ class: 'fa fa-external-link', 'aria-hidden': 'true' });
    linkElem.append(extLinkBtn);
  }
}

function decorateEmbed(elems) {
  elems.forEach((elem) => {
    const embedUrl = elem.querySelector('a');
    loadEmbed(elem, embedUrl.href);
    embedUrl.remove();
  });
}

export function decorateAutoBlock(content) {
  const isFullArticlePage = getMetadata('publication-type') === 'Full Article';
  const signatureCTA = 'Inspired by what you’ve read? Let’s connect!';
  const contactURL = 'https://www.moleculardevices.com/contact?region=americas#get-in-touch';

  if (!content) {
    return;
  }

  if (isFullArticlePage) {
    const publisher = getMetadata('publisher');
    const gatedUrl = getMetadata('article-url');
    const creditParagraph = div({ style: 'margin-block: 30px;' },
      p(strong(
        i('This article was originally published on', a({ href: gatedUrl }, ` ${publisher}`), ' and reprinted here with permission.'),
      )),
      p(a({ href: contactURL, class: 'button primary' }, signatureCTA)),
    );
    content.append(creditParagraph);
  } else {
    const contentWrapper = span({ class: 'event-container' });

    decorateTitle(contentWrapper, content.querySelector('h1'));
    decorateCite(contentWrapper);

    const hasLeftCol = content.querySelector('p:first-child picture');
    const pic = div();
    if (hasLeftCol) {
      pic.classList.add('left-col');
      contentWrapper.append(pic);
    }

    const txt = div({ class: 'right-col' });

    let isInleftCol = hasLeftCol;
    [...content.children].forEach((child) => {
      if (isInleftCol && child.matches('p') && child.querySelector('picture')) {
        pic.append(child);
      } else if (!child.matches('h1') && !child.matches('cite')) {
        isInleftCol = false;
        txt.append(child);
      }
    });

    contentWrapper.append(txt);
    content.append(contentWrapper);

    decorateEmbed(contentWrapper.querySelectorAll('.embed'));
    decorateStrong(contentWrapper.querySelectorAll('.right-col p > strong'));
    decorateCaption(contentWrapper.querySelectorAll('.left-col p > picture'));
    decorateCaption(contentWrapper.querySelectorAll('.right-col p > picture'));

    decorateReadMore(contentWrapper.querySelector('p:last-child a'));
  }
}

export default function buildAutoBlocks() {
  const container = document.querySelector('main div');
  decorateAutoBlock(container);
  container.append(buildBlock('social-share', '<p>Share this news</p>'));
}
