/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

describe('Social Share block', () => {
  // eslint-disable-next-line no-undef
  before(async () => {
    const { decorateBlock, loadBlock } = await import('../../../scripts/lib-franklin.js');
    document.body.innerHTML = await readFile({ path: './block.html' });
    const socialShare = document.querySelector('div.social-share');
    await decorateBlock(socialShare);
    await loadBlock(socialShare);
    await sleep();
  });

  it('Tests Social Shares', async () => {
    const shareEvent = document.querySelector('.social-share');
    const socialsExpected = ['facebook', 'linkedin', 'twitter', 'youtube-play'];
    const socialsActual = shareEvent.querySelector('.button-container');
    socialsExpected.forEach((social) => {
      expect(
        socialsActual.querySelector(`li[data-type=${social}]`) !== null,
        `Did not find social share for ${social}`,
      ).to.be.true;
    });
  });
});
