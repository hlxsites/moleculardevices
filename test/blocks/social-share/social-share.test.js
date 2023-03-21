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
    document.head.innerHTML = await readFile({ path: './head.html' });
    document.body.innerHTML = await readFile({ path: './block.html' });
    const socialShare = document.querySelector('div.social-share');
    await decorateBlock(socialShare);
    await loadBlock(socialShare);
    await sleep();
  });

  it('Tests basic', async () => {
    const socialShare = await readFile({ path: './social-share.html' });
    const shareEvent = document.querySelector('.social-share');
    expect(shareEvent.innerHTML.trim()).to.equal(socialShare);
  });
});
