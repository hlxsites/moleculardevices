/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

describe('News block', () => {
  // eslint-disable-next-line no-undef
  before(async () => {
    const { decorateBlock, loadBlock } = await import('../../../scripts/lib-franklin.js');
    document.body.innerHTML = await readFile({ path: './block.html' });
    const block = document.querySelector('div.news-wrapper .news');
    await decorateBlock(block);
    await loadBlock(block);
    await sleep();
  });

  it('Tests list structure', async () => {
    const list = document.querySelector('.news > .list');
    expect(list, 'List is missing.').to.exist;

    const filter = document.querySelector('.news > .list > .filter');
    expect(filter, 'Filter is missing.').to.exist;

    const filterTitle = document.querySelector('.news > .list > .filter > .panel-title');
    expect(filterTitle, 'Panel title is missing.').to.exist;

    const filters = document.querySelector('.news > .list > .filter > .select');
    expect(filters, 'Filter selection is missing.').to.exist;

    const toggle = document.querySelector('.news > .list > .filter > .select > .dropdown-toggle');
    expect(toggle, 'Filter dropdown-toggle is missing.').to.exist;

    const menu = document.querySelector('.news > .list > .filter  > .select > .dropdown-menu');
    expect(menu, 'Filter menu is missing.').to.exist;

    const item = document.querySelectorAll('.news > .list > items > .item');
    expect(item, 'List items are missing.').to.exist;

    const itemImage = document.querySelectorAll('.news > .list > items > .item > .image');
    expect(itemImage, 'List image is missing.').to.exist;

    const itemContent = document.querySelectorAll('.news > .list > items > .item > .content');
    expect(itemContent, 'List content is missing.').to.exist;
  });

  it('Tests pagination structure', async () => {
    const pagination = document.querySelector('.news > .list > .pagination');
    expect(pagination, 'Pagination is missing.').to.exist;

    const pages = document.querySelectorAll('.news > .list > .pagination > .pager-item');
    expect(pages, 'Pager items are missing.').to.exist;
  });
});
