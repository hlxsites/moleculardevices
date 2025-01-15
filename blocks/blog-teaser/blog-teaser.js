import {
  a, div, h3, i, p, span,
} from '../../scripts/dom-helpers.js';
import {
  createOptimizedPicture,
  fetchPlaceholders,
  getMetadata,
} from '../../scripts/lib-franklin.js';
import { fetchFragment, formatDate, sortDataByDate } from '../../scripts/scripts.js';
import ffetch from '../../scripts/ffetch.js';

function renderBlockTeaser(blogData) {
  /* eslint-disable indent */
  return div(
    { class: 'blog-teaser-item' },
    div(
      { class: 'blog-teaser-thumb' },
      a({ href: blogData.path }, createOptimizedPicture(blogData.thumbnail, blogData.header)),
    ),
    div(
      { class: 'blog-teaser-caption' },
      h3(a({ href: blogData.path }, blogData.header)),
      div(
        { class: 'metadata' },
        blogData.publicationDate
          ? div(
            i({ class: 'fa fa-calendar' }),
            span(
              { class: 'blog-publish-date' },
              formatDate(blogData.publicationDate, { month: 'long' }),
            ),
          )
          : '',
        blogData.author
          ? div(i({ class: 'fa fa-user' }), span({ class: 'blog-author' }, blogData.author))
          : '',
      ),
      p(blogData.description),
      p(
        { class: 'button-container' },
        a(
          {
            href: blogData.path,
            'aria-label': blogData.c2aButtonText,
            class: 'button primary',
          },
          blogData.c2aButtonText,
        ),
      ),
    ),
  );
  /* eslint-enable indent */
}

export default async function decorate(block) {
  const featuredPostUrl = getMetadata('featured-post');
  const placeholders = await fetchPlaceholders();
  const blogPostLinks = [];
  block.innerHTML = '';
  const isFeaturedBlock = block.classList.contains('featured');

  if (isFeaturedBlock) {
    const link = a({ href: (new URL(featuredPostUrl)).pathname });
    blogPostLinks.push(link);
  } else {
    let data = [];
    const recentPostLinks = await ffetch('/query-index.json')
      .sheet('blog')
      .filter((post) => featuredPostUrl.indexOf(post.path) === -1)
      .chunks(5)
      .limit(3)
      .all();
    const publications = await ffetch('/query-index.json')
      .sheet('publications')
      .filter((resource) => resource.publicationType === 'Full Article')
      .limit(3)
      .all();
    data = [...publications, ...recentPostLinks];
    data = sortDataByDate(data).slice(0, 3);
    data.forEach((post) => {
      const link = a({ href: post.path });
      blogPostLinks.push(link);
    });
  }

  const blogPosts = {};
  await Promise.all(
    blogPostLinks.map(async (blogPostLink) => {
      const fragmentHtml = await fetchFragment(blogPostLink.href, false);
      if (fragmentHtml) {
        const fragmentElement = div();
        fragmentElement.innerHTML = fragmentHtml;
        const header = fragmentElement.querySelector('h1').textContent;
        const thumbnail = fragmentElement
          .querySelector('meta[name="thumbnail"]')
          .getAttribute('content');
        const description = fragmentElement
          .querySelector('meta[name="description"]')
          .getAttribute('content');

        const c2aButtonText = fragmentElement.querySelector('meta[name="card-c2a"]')
          ? fragmentElement.querySelector('meta[name="card-c2a"]').getAttribute('content')
          : placeholders.readMore || 'Read More';

        const publicationDate = fragmentElement.querySelector('meta[name="publication-date"]')
          ? fragmentElement.querySelector('meta[name="publication-date"]').getAttribute('content')
          : '';

        const author = fragmentElement.querySelector('meta[name="author"]')
          ? fragmentElement.querySelector('meta[name="author"]').getAttribute('content')
          : '';

        blogPosts[blogPostLink.href] = {
          path: blogPostLink.href,
          header,
          thumbnail,
          description,
          c2aButtonText,
          publicationDate,
          author,
        };
      }
    }),
  );

  blogPostLinks.forEach((blogPostLink) => {
    block.append(renderBlockTeaser(blogPosts[blogPostLink.href]));
  });
}
