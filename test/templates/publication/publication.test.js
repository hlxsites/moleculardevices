/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import * as publication from '../../../templates/publication/publication.js';

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
    publication.default();
    await sleep();
  });

  it('Tests event metadata', async () => {
    const metaPubDate = document.querySelector('head meta[name="publication-date"]').getAttribute('content');
    expect(metaPubDate.trim()).to.equal('01/04/2023');

    const pubDate = document.querySelector('.event-wrapper cite');
    expect(pubDate.innerHTML.trim()).to.equal('Jan 04, 2023');
  });

  it('Tests decorating of elements', async () => {
    const title = document.querySelector('.default-content-wrapper > h1');
    expect(title.innerHTML.trim()).to.equal('Title');

    const evnt = document.querySelector('.default-content-wrapper > h1 + div.event-wrapper');
    expect(evnt.innerHTML.trim()).to.equal('<cite>Jan 04, 2023</cite>');

    const picture = document.querySelector('.default-content-wrapper > div.content-wrapper > div.picture-wrapper');
    expect(picture.innerHTML.trim()).to.equal('<p><picture><img></picture></p>');

    const textWrapper = document.querySelector('.default-content-wrapper > div.content-wrapper > div.text-wrapper');
    expect(textWrapper.innerHTML.trim()).to.equal('<p><em>text 1</em></p><p>text 2</p><p>text 3</p>');
  });
});
