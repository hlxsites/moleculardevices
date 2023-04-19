import addCarouselForMobile from './citation-list-carousel.js';
import ffetch from '../../scripts/ffetch.js';
import {
  div,
  img,
  i,
  h2,
  h3,
  p,
  a,
} from '../../scripts/dom-helpers.js';

function buildTopicCard(topic) {
  const cardDataCount = `${topic.count}+`;

  const card = div(
    { class: 'card' },
    div(
      { class: 'card-title' },
      topic.title,
    ),
    div(
      { class: 'card-body' },
      div(
        { class: 'card-data' },
        img({ src: '/images/citation.png' }),
        h2({ class: 'card-data-count' }, cardDataCount),
        h3({ class: 'card-data-label' }, 'Citations'),
      ),
      p(
        { class: 'card-citations-link' },
        a(
          { href: topic.path },
          'View Citation',
          i({ class: 'fa fa-arrow-circle-o-right' }),
        ),
      ),
    ),
  );

  return card;
}

export default async function decorate(block) {
  const topicItems = await ffetch('/resources/citations/query-index.json')
    .all();

  const topicsListContainer = div({ class: 'topics-list-container' });

  topicItems.forEach((topic) => {
    const card = buildTopicCard(topic);

    const flexItem = div({ class: 'flex-item' });
    flexItem.append(card);

    topicsListContainer.append(flexItem);
  });

  // Add carousel functionality for mobile devices
  addCarouselForMobile(topicsListContainer);

  block.append(topicsListContainer);

  return block;
}
