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

    const pubDate = document.querySelector('cite');
    expect(pubDate.innerHTML.trim()).to.equal('Jan 04, 2023');
  });

  it('Tests decorating of elements', async () => {
    const title = document.querySelector('.default-content-wrapper > h1');
    expect(title.innerHTML.trim()).to.equal('Title');

    const evnt = document.querySelector('.default-content-wrapper > cite');
    expect(evnt.innerHTML.trim()).to.equal('Jan 04, 2023');

    const picture = document.querySelector('.default-content-wrapper > .content-2col > .left-col');
    expect(picture.innerHTML.trim()).to.equal('<picture><img></picture>');

    const textWrapper = document.querySelector('.default-content-wrapper > .content-2col > .right-col');
    expect(textWrapper.innerHTML.trim()).to.equal('<p><em>text 1</em></p><p>text 2</p><p>text 3</p>');
  });
});
