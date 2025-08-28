import {
  div, a, p, h3, span, button,
} from '../../scripts/dom-helpers.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { createHubSpotForm, loadHubSpotScript } from '../forms/forms.js';
import { decorateIcons, socialShareBlock } from '../social-share/social-share.js';

const formType = 'submit-story';
const modalId = `${formType}-modal`;
const overlayId = `${formType}-modal-overlay`;
const formId = `${formType}-form`;

function toggleModal(show) {
  document.getElementById(modalId)?.classList.toggle('show', show);
  document.getElementById(overlayId)?.classList.toggle('show', show);
  document.body.classList.toggle('modal-open', show);
}

function handleShowModal(e) {
  e.preventDefault();
  toggleModal(true);
  loadHubSpotScript(() => {
    createHubSpotForm({
      formType,
      redirectUrl: 'null',
    });
  });
}

function handleHideModal(e) {
  e.preventDefault();
  toggleModal(false);
}

function createModal() {
  const modal = div({ class: modalId, id: modalId },
    button({
      class: `${formType}-modal-close`,
      id: `${formType}-modal-close`,
      onclick: handleHideModal,
    }, 'x'),
    div({ class: `${formType}-modal-wrapper` },
      div({ class: 'hubspot-form show-label', id: formId }),
    ),
  );

  const overlay = div({
    class: overlayId,
    id: overlayId,
    onclick: handleHideModal,
  });

  document.body.append(modal, overlay);
}

export default async function decorate(block) {
  const shareMessage = block.querySelector('h3')?.textContent || '';
  block.innerHTML = '';

  const placeholders = await fetchPlaceholders();
  const shareText = placeholders.shareThisStory || 'Share this story';
  const submitText = placeholders.submitYourStory || 'Submit your story';

  // Social block
  const socials = ['facebook', 'linkedin', 'twitter'];
  const shareSocialBlock = socialShareBlock(shareText, socials);
  decorateIcons(shareSocialBlock);

  // Share message block
  const shareMessageBlock = div({ class: 'share-message' }, h3(shareMessage));

  // Submit button block
  const shareButtonBlock = div({ class: 'share-button' },
    p({ class: 'button-container' },
      a({
        class: 'button primary',
        href: '#',
        'aria-label': submitText,
        onclick: handleShowModal,
      }, submitText, span({ class: 'button-border' })),
    ),
  );

  block.append(shareSocialBlock, shareMessageBlock, shareButtonBlock);

  // Modal
  createModal();

  return block;
}
