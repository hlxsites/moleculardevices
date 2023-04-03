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
    document.body.innerHTML = await readFile({ path: './block.html' });
    const block = document.querySelector('div.carousel-wrapper .carousel');
    await decorateBlock(block);
    await loadBlock(block);
    await sleep();
  });

  it('Carousel structure is correct', async () => {
    const block = document.querySelector('div.carousel-wrapper .carousel');
    const blockWrapper = document.querySelector('div.carousel-wrapper');

    // check carousel items
    const items = block.querySelectorAll('.carousel-item:not(.clone)');
    expect(items).to.exist;
    expect(items.length).to.equal(3);
    expect(block.querySelector('.carousel-item.selected')).to.equal(items[0]);

    // check clones
    expect(block.querySelectorAll('.carousel-item.clone').length).to.equal(4);

    // check dot buttons
    const dotButtons = blockWrapper.querySelectorAll('.carousel-dot-button');
    expect(dotButtons).to.exist;
    expect(dotButtons.length).to.equal(3);

    // check nav buttons
    expect(blockWrapper.querySelectorAll('.carousel-nav-button').length, 'Nav Buttons').to.equal(2);
    expect(blockWrapper.querySelector('.carousel-nav-right'), 'Right Nav Button').to.exist;
    expect(blockWrapper.querySelector('.carousel-nav-left'), 'Left Nav Button').to.exist;

    // check carousel rendered items
    expect(block.querySelectorAll('.carousel-item:not(.clone) .carousel-item-image').length, 'Image Containers').to.equal(3);
    expect(block.querySelectorAll('.carousel-item:not(.clone) img').length, 'Images').to.equal(3);
    expect(block.querySelectorAll('.carousel-item:not(.clone) .carousel-item-text', 'Text content').length).to.equal(3);

    expect(block.querySelectorAll('.carousel-item .carousel-item-image').length).to.equal(7);
    expect(block.querySelectorAll('.carousel-item img').length).to.equal(7);
    expect(block.querySelectorAll('.carousel-item .carousel-item-text').length).to.equal(7);
  });

  it('Carousel dot button usage', async () => {
    const block = document.querySelector('div.carousel-wrapper .carousel');
    const blockWrapper = document.querySelector('div.carousel-wrapper');

    const items = block.querySelectorAll('.carousel-item:not(.clone)');
    expect(block.querySelector('.carousel-item.selected')).to.equal(items[0]);

    const dotButtons = blockWrapper.querySelectorAll('.carousel-dot-button');
    dotButtons[2].click();
    await sleep(300);

    expect(block.querySelector('.carousel-item.selected')).to.equal(items[2]);

    dotButtons[1].click();
    await sleep(300);

    expect(block.querySelector('.carousel-item.selected')).to.equal(items[1]);

    dotButtons[0].click();
    await sleep(300);

    expect(block.querySelector('.carousel-item.selected')).to.equal(items[0]);
  });

  it('Right Nav Button usage', async () => {
    const block = document.querySelector('div.carousel-wrapper .carousel');
    const blockWrapper = document.querySelector('div.carousel-wrapper');

    const items = block.querySelectorAll('.carousel-item:not(.clone)');
    expect(items).to.exist;
    expect(items.length).to.equal(3);
    expect(block.querySelector('.carousel-item.selected')).to.equal(items[0]);

    const rightNavButton = blockWrapper.querySelector('.carousel-nav-right');
    rightNavButton.click();
    await sleep(300);

    expect(block.querySelector('.carousel-item.selected')).to.equal(items[1]);

    rightNavButton.click();
    await sleep(300);

    expect(block.querySelector('.carousel-item.selected')).to.equal(items[2]);

    rightNavButton.click();
    await sleep(300);

    expect(block.querySelector('.carousel-item.selected')).to.equal(items[0]);
  });

  it('Left Nav Button usage', async () => {
    const block = document.querySelector('div.carousel-wrapper .carousel');
    const blockWrapper = document.querySelector('div.carousel-wrapper');

    const items = block.querySelectorAll('.carousel-item:not(.clone)');
    expect(items).to.exist;
    expect(items.length).to.equal(3);
    expect(block.querySelector('.carousel-item.selected')).to.equal(items[0]);

    const leftNavButton = blockWrapper.querySelector('.carousel-nav-left');
    leftNavButton.click();
    await sleep(300);

    expect(block.querySelector('.carousel-item.selected')).to.equal(items[2]);

    leftNavButton.click();
    await sleep(300);

    expect(block.querySelector('.carousel-item.selected')).to.equal(items[1]);

    leftNavButton.click();
    await sleep(300);

    expect(block.querySelector('.carousel-item.selected')).to.equal(items[0]);
  });
});
