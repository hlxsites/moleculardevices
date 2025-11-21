import {
  decorateIcons, decorateBlock, getMetadata, createOptimizedPicture,
} from '../../scripts/lib-franklin.js';
import { div, p } from '../../scripts/dom-helpers.js';
import { decorateExternalLink } from '../../scripts/scripts.js';
import { SITE_LOGO_ALT_VALUE, SITE_LOGO_URL } from '../header/header.js';
import {
  appendFooterStructure, buildNewsEvents, buildNewsletter, decorateFooterRows,
} from './footerHelper.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  block.textContent = '';

  const template = getMetadata('template');
  const footerPath = template === 'Landing Page' ? '/footer-landing-page' : (getMetadata('footer') || '/footer');
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});
  const html = await resp.text();

  const footer = div();
  footer.innerHTML = html;

  const currentYear = new Date().getFullYear();

  const footerSiteLogo = p({ class: 'footer-site-logo' },
    createOptimizedPicture(SITE_LOGO_URL, SITE_LOGO_ALT_VALUE),
  );
  const copyrightInfo = p(`\u00A9${currentYear} Molecular Devices, LLC. All rights reserved.`);

  footer.querySelector('.site-logo')?.appendChild(footerSiteLogo);
  footer.querySelector('.copyright-text')?.appendChild(copyrightInfo);

  if (template === 'Landing Page') {
    const footerWrapper = div({ class: 'footer-landing-page' });
    const container = div({ class: 'container' });
    const rows = Array.from(footer.children);
    rows.forEach((row) => {
      container.appendChild(row);
    });
    footerWrapper.appendChild(container);
    footer.appendChild(footerWrapper);
  } else {
    const { wrapContainer, bottomContainer } = appendFooterStructure(block);

    const rows = [...footer.children];
    decorateFooterRows(rows, wrapContainer, bottomContainer, currentYear);

    await buildNewsEvents(block.querySelector('.footer-news-events'));
    block.querySelectorAll('.footer-contact').forEach((contactBlock) => decorateBlock(contactBlock));
  }

  block.append(footer);
  block.querySelectorAll('a').forEach(decorateExternalLink);
  decorateIcons(block);

  block.querySelectorAll('a > picture').forEach((link) => {
    link.parentElement.setAttribute('target', '_blank');
  });

  /* newsletter */
  const newsletter = block.querySelector('.footer-newsletter-form');
  if (newsletter) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        buildNewsletter(newsletter);
      }
    });
    observer.observe(newsletter);

    setTimeout(() => {
      observer.disconnect();
      buildNewsletter(newsletter);
    }, 3000);
  }
}
