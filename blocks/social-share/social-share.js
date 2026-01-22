import { getMetadata } from '../../scripts/lib-franklin.js';
import {
  a, div, i, li, p, ul,
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

function buildFullUrl(pathOrUrl) {
  const pathName = new URL(decodeURIComponent(pathOrUrl)).pathname;
  return `https://www.moleculardevices.com${pathName}`;
}

function decorateLink(social, type, icon, url) {
  const isFooterSocialList = social.closest('.social-media-list');
  icon.setAttribute('aria-label', type);
  if (!url) return;

  const linkProps = {
    href: url,
    'aria-label': `Share to ${type}`,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  if (!isFooterSocialList) linkProps.onclick = onSocialShareClick;

  social.append(a(linkProps, icon));
}

export function decorateSocialIcons(element) {
  const rawUrl = getURL();
  const title = encodeURIComponent(getTitle() || '');
  const fullUrl = encodeURIComponent(buildFullUrl(rawUrl));

  element.querySelectorAll('li').forEach((social) => {
    const type = social.getAttribute('data-type');
    const icon = social.querySelector('i');

    switch (type) {
      case 'facebook-f':
        decorateLink(social, 'Facebook', icon, `https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`);
        break;

      case 'linkedin-in':
        decorateLink(social, 'LinkedIn', icon, `https://www.linkedin.com/sharing/share-offsite/?url=${fullUrl}`);
        break;

      case 'x-twitter':
        decorateLink(social, 'X', icon, `https://www.x.com/intent/post?url=${fullUrl}&text=${title}`);
        break;

      case 'youtube':
        decorateLink(social, 'Youtube', icon, 'https://www.youtube.com/user/MolecularDevicesInc');
        break;

      case 'whatsapp':
        decorateLink(social, 'WhatsApp', icon, `https://wa.me/?text=${title}%20${fullUrl}`);
        break;

      case 'email':
        decorateLink(social, 'Email', icon, `mailto:?subject=${title}&body=${fullUrl}`);
        break;

      default:
        // eslint-disable-next-line no-console
        console.warn('Unhandled social type:', type);
    }
  });
}

export function decorateFooterSocialIcons(element) {
  element.querySelectorAll('li').forEach((social) => {
    const type = social.getAttribute('data-type');
    if (!type) return;

    const icon = social.querySelector('i');

    switch (type) {
      case 'facebook-f':
        decorateLink(social, 'Facebook', icon, 'https://www.facebook.com/MolecularDevices');
        break;
      case 'linkedin-in':
        decorateLink(social, 'LinkedIn', icon, 'https://www.linkedin.com/company/molecular-devices');
        break;
      case 'x-twitter':
        decorateLink(social, 'X', icon, 'https://x.com/moldev');
        break;
      case 'youtube':
        decorateLink(social, 'Youtube', icon, 'https://www.youtube.com/user/MolecularDevicesInc');
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn('Unhandled social type:', type);
    }
  });
}

export function socialShareBlock(title, socials) {
  return div({ class: 'share-event' },
    title ? p(title) : '',
    div({ class: 'social-links' },
      ul({ class: 'button-container' },
        ...socials.map((social) => li({ class: `share-${social}`, 'data-type': social },
          i({ class: `fa-brands fa-${social}` }),
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
    ? ['linkedin-in', 'facebook-f', 'x-twitter', 'youtube']
    : ['facebook-f', 'linkedin-in', 'x-twitter', 'youtube'];

  block.innerHTML = '';
  block.appendChild(socialShareBlock(title, socials));

  decorateSocialIcons(block);
  if (template === 'blog' || theme === 'Full Article') {
    blogHideSocialShareOnHero(block);
  }
}
