/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import * as publication from '../../../templates/publication/publication.js';

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

describe('Publication Template', () => {
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

    const pubDate = document.querySelector('cite');
    expect(pubDate.innerHTML.trim()).to.equal('Jan 04, 2023');
  });

  it('Tests decorating of elements', async () => {
    const title = document.querySelector('.default-content-wrapper > h1');
    expect(title.innerHTML.trim()).to.equal('Title');

    const evnt = document.querySelector('.default-content-wrapper > cite');
    expect(evnt.innerHTML.trim()).to.equal('Jan 04, 2023');

    const picture = document.querySelector('.default-content-wrapper > .content-wrapper > .left-col');
    expect(picture.innerHTML.trim()).to.equal('<p><picture><img></picture></p>');

    const textWrapper = document.querySelector('.default-content-wrapper > .content-wrapper > .right-col');
    expect(textWrapper.innerHTML.trim()).to.equal('<p>text 1</p><p><em>text 2</em></p><p><picture><img></picture></p><p class="text-caption"><em>text 3</em></p><p>text 4</p>');
  });

  it('Tests Social Shares', async () => {
    const shareEvent = document.querySelector('.social-share');
    const socialsExpected = ['facebook', 'linkedin', 'twitter', 'envelope'];
    const socialsActual = shareEvent.querySelector('.button-container');
    socialsExpected.forEach((social) => {
      // eslint-disable-next-line no-unused-expressions
      expect(
        socialsActual.querySelector(`li[data-type=${social}]`) !== null,
        `Did not find social share for ${social}`,
      ).to.be.true;
    });
  });
});
