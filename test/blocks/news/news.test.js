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
    const list = document.querySelector('div.news-wrapper .news > .list');
    expect(list, 'First-level div with class list is missing.').to.exist;

    const filter = document.querySelector('div.news-wrapper .news > .list > .list-filter');
    expect(filter, 'Second-level div with class list-filter is missing.').to.exist;

    const filterTitle = document.querySelector('div.news-wrapper .news > .list > .panel-title');
    expect(filterTitle, 'Third-level div with class panel-title is missing.').to.exist;

    const filters = document.querySelector('div.news-wrapper .news > .list > .list-filter > .filter-select');
    expect(filters, 'Third-level div with class filter-select is missing.').to.exist;

    const toggle = document.querySelector('div.news-wrapper .news > .list > .list-filter > .filter-select > button.dropdown-toggle');
    expect(toggle, 'Filter button with class dropdown-toggle is missing.').to.exist;

    const menu = document.querySelector('div.news-wrapper .news > .list > .list-filter  > .filter-select > div.dropdown-menu');
    expect(menu, 'Filter menu with class dropdown-menu is missing.').to.exist;

    const item = document.querySelectorAll('div.news-wrapper .news > .list > .list-item');
    expect(item, 'Third-level divs with class list-item are missing.').to.exist;
  });

  it('Tests pagination structure', async () => {
    const pagination = document.querySelector('div.news-wrapper .news > .list > .list-pagination');
    expect(pagination, 'First-level div with class pagination is missing.').to.exist;

    const pages = document.querySelectorAll('div.news-wrapper .news > .list > .list-pagination > nav');
    expect(pages, 'Second-level divs with class pages are missing.').to.exist;
  });
});
