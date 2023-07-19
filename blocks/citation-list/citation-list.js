import { createCarousel } from '../carousel/carousel.js';
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
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

let placeholders = {};

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
        img({ src: '/images/resource-icons/citation.png' }),
        h2({ class: 'card-data-count' }, cardDataCount),
        h3({ class: 'card-data-label' }, placeholders.citations || 'Citations'),
      ),
      p(
        { class: 'card-citations-link' },
        a(
          { href: topic.path },
          placeholders.viewCitation || 'View Citation',
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

  const topicsList = [];
  placeholders = await fetchPlaceholders();

  topicItems.forEach((topic) => {
    const card = buildTopicCard(topic);
    topicsList.push(card);
  });

  const carousel = await createCarousel(
    block,
    topicsList,
    {
      infiniteScroll: true,
      navButtons: false,
      dotButtons: false,
      autoScroll: false,
      renderItem: (item) => item,
    },
  );

  window.matchMedia('only screen and (max-width: 767px)').onchange = (e) => {
    if (e.matches) {
      carousel.setInitialScrollingPosition();
    }
  };
}
