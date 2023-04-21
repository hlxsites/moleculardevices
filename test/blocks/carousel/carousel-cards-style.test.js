/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

describe('Carousel Base Block', () => {
  // eslint-disable-next-line no-undef
  before(async () => {
    const { decorateBlock, loadBlock } = await import('../../../scripts/lib-franklin.js');
    document.body.innerHTML = await readFile({ path: './block-cards-style.html' });
    const block = document.querySelector('div.carousel-wrapper .carousel');
    await decorateBlock(block);
    await loadBlock(block);
    await sleep();
  });

  it('Carousel card structure is correct', async () => {
    const block = document.querySelector('div.carousel-wrapper .carousel');

    // check carousel items
    const items = block.querySelectorAll('.carousel-item:not(.clone)');
    expect(items).to.exist;
    expect(items.length).to.equal(9);
    expect(block.querySelector('.carousel-item.selected')).to.equal(items[0]);

    // check clones
    expect(block.querySelectorAll('.carousel-item.clone').length).to.equal(4);

    // check card item
    const firstChild = items[0];
    expect(firstChild.querySelector('.card')).to.exist;
    expect(firstChild.querySelector('.card').children.length).to.equal(2);
  });
});
