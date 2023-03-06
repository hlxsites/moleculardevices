/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

describe('Table block', () => {
  // eslint-disable-next-line no-undef
  before(async () => {
    const { decorateBlock, loadBlock } = await import('../../../scripts/lib-franklin.js');
    document.body.innerHTML = await readFile({ path: './block.html' });
    const tableBlock = document.querySelector('div.table-wrapper .table');
    await decorateBlock(tableBlock);
    await loadBlock(tableBlock);
    await sleep();
  });

  it('Tests text alignments', async () => {
    const col = document.querySelector('div.table-wrapper .table tbody td.vertical-align-top');
    expect(col.innerHTML.trim()).to.equal('Flex');
    expect(col.classList.contains('text-align-right')).to.be.true;
    expect(document.querySelectorAll('table tr').length).to.equal(6);
  });

  it('Tests merging of cells', async () => {
    const col = document.querySelector('div.table-wrapper .table tbody td[colspan]');
    expect(col.innerHTML.trim()).to.equal('Timing');
  });
});
