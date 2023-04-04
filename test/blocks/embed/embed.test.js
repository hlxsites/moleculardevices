/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

describe('Embed block for Sound cloud', () => {
  // eslint-disable-next-line no-undef
  before(async () => {
    const { decorateBlock, loadBlock } = await import('../../../scripts/lib-franklin.js');
    document.body.innerHTML = await readFile({ path: './block.html' });
    const embedBlock = document.querySelector('div.embed-wrapper .embed');
    await decorateBlock(embedBlock);
    await loadBlock(embedBlock);
    await sleep();
  });

  it('Tests test iframe configuration', async () => {
    const container = document.querySelector('div.embed-wrapper .embed-soundcloud');
    expect(container).to.exist;

    const wrapper = container.querySelector('div');
    expect(wrapper).to.exist;
    expect(wrapper.style.height).to.equal('166px');

    const iframe = container.querySelector('iframe');
    expect(iframe).to.exist;
    expect(iframe.src).to.contain('soundcloud');
  });
});
