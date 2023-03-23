/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

describe('Vidyard block', () => {
  // eslint-disable-next-line no-undef
  before(async () => {
    const { decorateBlock, loadBlock } = await import('../../../scripts/lib-franklin.js');
    document.body.innerHTML = await readFile({ path: './block.html' });
    const tableBlock = document.querySelector('div.vidyard-wrapper .vidyard');
    await decorateBlock(tableBlock);
    await loadBlock(tableBlock);
    await sleep();
  });

  it('Tests test video script executed', async () => {
    const container = document.querySelector('div.vidyard-wrapper .vidyard .vidyard-player-container');
    expect(container).to.exist;
    expect(container.getAttribute('uuid')).to.equal('y9bRX7E4nRiED3fkNBaFHn');
    expect(container.querySelector('iframe')).to.exist;
  });

  it('Tests test video attributes', async () => {
    const img = document.querySelector('div.vidyard-wrapper .vidyard img');
    expect(img.getAttribute('data-uuid')).to.equal('y9bRX7E4nRiED3fkNBaFHn');
    expect(img.getAttribute('data-v')).to.equal('4');
  });
});
