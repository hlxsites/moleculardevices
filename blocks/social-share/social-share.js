import { getMetadata } from '../../scripts/lib-franklin.js';
import {
  a, div, i, li, p, span, ul,
} from '../../scripts/dom-helpers.js';

function getURL() {
  return encodeURIComponent(window.location.href);
}

function getTitle() {
  const h1 = document.querySelector('h1');
  return h1 ? encodeURIComponent(h1.textContent) : '';
}

function onSocialShareClick(event) {
  event.preventDefault();
  const href = event.currentTarget.getAttribute('href');
  if (!href) return;
  window.open(href, 'popup', 'width=800,height=700,scrollbars=no,resizable=no');
}

function decorateLink(social, type, icon, url) {
  icon.setAttribute('aria-label', type);
  if (!url) return;

  social.append(
    a({
      href: url,
      'aria-label': `Share to ${type}`,
      target: '_blank',
      rel: 'noopener noreferrer',
      onclick: onSocialShareClick,
    }, icon),
  );
}

export function decorateIcons(element) {
  const template = getMetadata('template').toLowerCase();
  const theme = getMetadata('theme');
  const url = getURL();
  const title = getTitle();

  element.querySelectorAll('li').forEach((social) => {
    const type = social.getAttribute('data-type');
    const icon = social.querySelector('i');
    const xIcon = span({ class: 'icon icon-x-white' });
    const xIconTeal = span({ class: 'icon icon-x-blue' });
    const updatedXIcon = (template === 'blog' || theme === 'Full Article')
      ? xIcon
      : xIconTeal;

    switch (type) {
      case 'facebook':
        decorateLink(social, 'Facebook', icon, `https://www.facebook.com/sharer/sharer.php?u=${url}`);
        break;
      case 'linkedin':
        decorateLink(social, 'LinkedIn', icon, `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`);
        break;
      case 'twitter':
        decorateLink(social, 'X', updatedXIcon, `https://www.x.com/intent/post?&url=${url}&text=${title}`);
        icon.remove();
        break;
      case 'youtube-play':
        decorateLink(social, 'Youtube', icon, 'https://www.youtube.com/user/MolecularDevicesInc');
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn('Unhandled social type:', type);
        break;
    }
  });
}

export function socialShareBlock(title, socials) {
  return div({ class: 'share-event' },
    p(title),
    div({ class: 'social-links' },
      ul({ class: 'button-container' },
        ...socials.map((social) => li({ class: `share-${social}`, 'data-type': social },
          i({ class: `fa fa-${social}` }),
        ),
        ),
      ),
    ),
  );
}

function blogHideSocialShareOnHero(block) {
  const heroBlock = document.querySelector('div.hero');
  block.classList.add('social-share-hidden');
  if (!heroBlock) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      block.classList.add('social-share-hidden');
    } else {
      block.classList.remove('social-share-hidden');
    }
  });
  observer.observe(heroBlock);
}

export default function decorate(block) {
  const template = getMetadata('template').toLowerCase();
  const theme = getMetadata('theme');

  let title = '';
  if (block.querySelector('.social-share p')) {
    title = block.querySelector('.social-share p').innerHTML;
  }

  const socials = (template === 'blog' || theme === 'Full Article')
    ? ['linkedin', 'facebook', 'twitter', 'youtube-play']
    : ['facebook', 'linkedin', 'twitter', 'youtube-play'];

  block.innerHTML = '';
  block.appendChild(socialShareBlock(title, socials));

  decorateIcons(block);
  if (template === 'blog' || theme === 'Full Article') {
    blogHideSocialShareOnHero(block);
  }
}
