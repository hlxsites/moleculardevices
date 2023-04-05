/* global describe it */
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line object-curly-newline
import { domEl, div, a, p, h3 } from '../../scripts/dom-helpers.js';

describe('Dom Helpers', () => {
  it('Simple DOM El', () => {
    const result = domEl('p', 'Simple text');
    expect(result.tagName).to.equal('P');
    expect(result.textContent).to.equal('Simple text');
  });

  it('DOM with attribute', () => {
    const result = domEl('p', { class: 'paragraph' }, 'Simple text');
    expect(result.tagName).to.equal('P');
    expect(result.getAttribute('class')).to.equal('paragraph');
    expect(result.textContent).to.equal('Simple text');
  });

  it('Paragraph with attribute and text', () => {
    const result = p({ class: 'paragraph' }, 'Simple text');
    expect(result.tagName).to.equal('P');
    expect(result.getAttribute('class')).to.equal('paragraph');
    expect(result.textContent).to.equal('Simple text');
  });

  it('Complex test', () => {
    const result = domEl('main',
      div({ class: 'card' },
        a({ href: '/path/to/resource' },
          div({ class: 'card-caption' },
            h3('This is a title'),
            p({ class: 'card-description' }, 'This is a description'),
            p({ class: 'button-container' },
              a({ href: '/path/to/resource', 'aria-label': 'Read More', class: 'button primary' }, 'Read More'),
            ),
          ),
        ),
      ),
    );

    expect(result.tagName).to.equal('MAIN');
    expect(result.children.length).to.equal(1);
    expect(result.children[0].tagName).to.equal('DIV');
    expect(result.children[0].getAttribute('class')).to.equal('card');
    expect(result.children[0].children.length).to.equal(1);
    expect(result.children[0].children[0].tagName).to.equal('A');
    expect(result.children[0].children[0].getAttribute('href')).to.equal('/path/to/resource');
    expect(result.children[0].children[0].children.length).to.equal(1);

    const cardCaption = result.children[0].children[0].children[0];
    expect(cardCaption.tagName).to.equal('DIV');
    expect(cardCaption.children.length).to.equal(3);
    expect(cardCaption.getAttribute('class')).to.equal('card-caption');

    expect(cardCaption.children[0].children.length).to.equal(0);
    expect(cardCaption.children[0].tagName).to.equal('H3');
    expect(cardCaption.children[0].textContent).to.equal('This is a title');

    expect(cardCaption.children[1].tagName).to.equal('P');
    expect(cardCaption.children[1].getAttribute('class')).to.equal('card-description');
    expect(cardCaption.children[1].textContent).to.equal('This is a description');

    expect(cardCaption.children[2].tagName).to.equal('P');
    expect(cardCaption.children[2].getAttribute('class')).to.equal('button-container');
    expect(cardCaption.children[2].children.length).to.equal(1);

    const button = cardCaption.children[2].children[0];
    expect(button.getAttribute('href')).to.equal('/path/to/resource');
    expect(button.getAttribute('aria-label')).to.equal('Read More');
    expect(button.classList[0]).to.equal('button');
    expect(button.classList[1]).to.equal('primary');
    expect(button.textContent).to.equal('Read More');
  });
});
