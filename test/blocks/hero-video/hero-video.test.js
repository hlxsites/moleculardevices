/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

describe('Hero Video Block', () => {
  // eslint-disable-next-line no-undef
  before(async () => {
    const { decorateBlock, loadBlock } = await import('../../../scripts/lib-franklin.js');
    document.body.innerHTML = await readFile({ path: './block.html' });
    const tableBlock = document.querySelector('div.hero-video-wrapper .hero-video');
    await decorateBlock(tableBlock);
    await loadBlock(tableBlock);
    await sleep();
  });

  it('Block structure is correct', async () => {
    const block = document.querySelector('div.hero-video-wrapper .hero-video');
    const videos = block.querySelectorAll('video');
    expect(videos.length).to.equal(2);
    expect(block.querySelector('.hero-video-banner'), 'Video Banner container is missing').to.exist;
    expect(block.querySelector('.teaser-video-container', 'Teaser Video Container is missing')).to.exist;
    expect(block.querySelector('.overlay', 'Teaser Overlay is missing')).to.exist;
    expect(block.querySelector('.full-video-container'), 'Full Video Container is missing').to.exist;

    const teaserVideoContainer = block.querySelector('.teaser-video-container');
    // the video should be before the image
    expect(teaserVideoContainer.children[0].tagName).to.equal('VIDEO');
    expect(teaserVideoContainer.children[1].tagName).to.equal('PICTURE');

    expect(block.querySelector('.overlay button'), 'Overlay Button Missing').to.exist;
    expect(block.querySelector('.overlay a'), 'Link should be tranformed in a button').to.not.exist;
    expect(block.querySelector('.overlay button svg'), 'Button icon is missing').to.exist;

    expect(block.querySelector('.full-video-container .play-pause-fullscreen-button'), 'Play/Pause button is missing').to.exist;
    expect(block.querySelectorAll('.play-pause-fullscreen-button svg').length, 'Play/Pause icons are missing').to.equal(2);
    expect(block.querySelector('.full-video-container .close-video'), 'Close video button is missing').to.exist;
    expect(block.querySelector('.close-video svg'), 'Close video button icon is missing').to.exist;
  });
});
