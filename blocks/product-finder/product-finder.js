import ffetch from '../../scripts/ffetch.js';
import {
  toClassName,
} from '../../scripts/lib-franklin.js';
import {
  a, div, img, span,
} from '../../scripts/dom-helpers.js';
import { createCard } from '../card/card.js';

const url = '/product-finder/product-finder.json';

function renderCardItem(item, progressStep, callback) {
  return (
    div(
      { class: 'card icon-card' },
      a(
        {
          class: 'icon-link',
          id: item.id,
          href: progressStep === 'step-1' ? '#step-2' : '#step-3',
          'data-tab': item.title,
          onclick: callback,
        },
        span({ class: 'icon-img' },
          img({
            src: item.image,
            alt: item.title,
          }),
        ),
        span({ class: 'icon-title' }, item.title),
      ),
    )
  );
}

async function renderCards(listArr, progressStep, callback) {
  const list = div({ class: 'product-finder-list' });

  listArr.forEach((item) => {
    item.title = progressStep === 'step-1' ? item.type : item.category;
    item.id = toClassName(item.title);
  });

  const cardRenderer = await createCard({
    renderItem: renderCardItem,
  });
  listArr.forEach((rfq) => {
    list.append(cardRenderer.renderItem(rfq, progressStep, callback));
  });
  return list;
}

/* step one */
async function stepOne(callback) {
  const stepNum = 'step-1';
  const root = document.getElementById(stepNum);

  const rfqTypes = await ffetch(url).sheet('types').all();
  root.append(await renderCards(rfqTypes, stepNum, callback));
}

export default async function decorate(block) {
  const progressSteps = block.querySelectorAll('ul li');
  progressSteps.forEach((progressStep) => {
    progressStep.prepend(
      a({ class: 'progress-step' }),
    );
  });

  block.appendChild(
    div(
      div({
        id: 'step-1',
        class: 'product-finder-step-wrapper',
      }),
      div({
        id: 'step-2',
        class: 'product-finder-step-wrapper',
        style: 'display: none;',
      }),
      div({
        id: 'step-3',
        class: 'product-finder-step-wrapper',
        style: 'display: none;',
      }),
    ),
  );
  stepOne();
}
