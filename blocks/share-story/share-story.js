import {
  div, a, p, h3, span, button,
} from '../../scripts/dom-helpers.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { getFormId } from '../forms/formHelper.js';
import { createHubSpotForm, loadHubSpotScript } from '../forms/forms.js';
import { decorateIcons, socialShareBlock } from '../social-share/social-share.js';

function showSubmitStoryModal(e) {
  e.preventDefault();
  document.getElementById('submit-story-modal').classList.add('show');
  document.getElementById('submit-story-modal-overlay').classList.add('show');
  document.body.classList.add('modal-open');
  const formConfig = {
    redirectUrl: 'null',
    formId: getFormId('share-story'),
  };

  loadHubSpotScript(createHubSpotForm.bind(null, formConfig, 'submit-story-form'));
}

function hideSubmitStoryModal(e) {
  e.preventDefault();
  document.getElementById('submit-story-modal').classList.remove('show');
  document.getElementById('submit-story-modal-overlay').classList.remove('show');
  document.body.classList.remove('modal-open');
}

export default async function decorate(block) {
  const shareMessage = block.querySelector('h3').textContent;
  block.innerHTML = '';
  const placeholders = await fetchPlaceholders();

  const socials = ['facebook', 'linkedin', 'twitter'];
  const shareSocialBlock = socialShareBlock(placeholders.shareThisStory || 'share this story', socials);
  decorateIcons(shareSocialBlock);
  const shareMessageBlock = div({ class: 'share-message' },
    h3(shareMessage),
  );
  const shareButtonBlock = div({ class: 'share-button' },
    p({ class: 'button-container' },
      a({
        class: 'button primary',
        href: '#',
        'aria-label': placeholders.submitYourStory || 'Submit your story',
        target: '_blank',
        rel: 'noopener noreferrer',
        onclick: showSubmitStoryModal,
      }, placeholders.submitYourStory
      || 'Submit your story', span({ class: 'button-border' }),
      ),
    ),
  );

  block.append(shareSocialBlock);
  block.append(shareMessageBlock);
  block.append(shareButtonBlock);

  // submit story modal
  const modal = div({ class: 'submit-story-modal', id: 'submit-story-modal' });
  const modalCloseButton = button({
    class: 'submit-story-modal-close',
    id: 'submit-story-modal-close',
    onclick: hideSubmitStoryModal,
  });
  modalCloseButton.innerHTML = '&times;';
  const formID = 'submit-story-form';
  const modalContent = div({ class: 'submit-story-modal-wrapper' },
    div({
      class: 'hubspot-form show-label',
      id: formID,
    }),
  );
  modal.append(modalCloseButton);
  modal.append(modalContent);
  const modalOverlay = div({
    class: 'submit-story-modal-overlay',
    id: 'submit-story-modal-overlay',
    onclick: hideSubmitStoryModal,
  });
  document.body.appendChild(modal);
  document.body.appendChild(modalOverlay);

  return block;
}
