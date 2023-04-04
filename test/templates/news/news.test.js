/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import * as news from '../../../templates/news/news.js';

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

describe('News Template', () => {
  // eslint-disable-next-line no-undef
  before(async () => {
    document.head.innerHTML = await readFile({ path: './document.html' });
    document.body.innerHTML = await readFile({ path: './document.html' });
    news.default();
    await sleep();
  });

  it('Tests event metadata', async () => {
    const metaPubDate = document.querySelector('head meta[name="publication-date"]').getAttribute('content');
    expect(metaPubDate.trim()).to.equal('01/04/2023');

    const pubDate = document.querySelector('.event-container cite');
    expect(pubDate.innerHTML.trim()).to.equal('Jan 04, 2023');
  });

  it('Tests decorating of elements', async () => {
    const title = document.querySelector('.event-container > .event-title');
    expect(title.innerHTML.trim()).to.equal('Title');

    const pubDate = document.querySelector('.event-container >  .event-date');
    expect(pubDate.innerHTML.trim()).to.equal('Jan 04, 2023');

    const picture = document.querySelector('.event-container > .left-col');
    expect(picture.innerHTML.trim()).to.equal('<p><picture><img></picture></p>');

    const textWrapper = document.querySelector('.event-container > .right-col');
    expect(textWrapper.innerHTML.trim()).to.equal('<p>text 1</p><p><em>text 2</em></p><p><picture><img></picture></p><p class="text-caption"><em>text 3</em></p><p>text 4</p>');
  });
});
