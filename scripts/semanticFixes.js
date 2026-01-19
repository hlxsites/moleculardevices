function normalizeH1(main) {
  const h1s = main.querySelectorAll('h1');
  h1s.forEach((h1, index) => {
    if (index > 0) {
      const h2 = document.createElement('h2');
      h2.innerHTML = h1.innerHTML;
      [...h1.attributes].forEach((a) => h2.setAttribute(a.name, a.value));
      h1.replaceWith(h2);
    }
  });
}

function normalizeHeadingHierarchy(main) {
  let lastLevel = 1;

  main.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((heading) => {
    const level = Number(heading.tagName[1]);
    if (level > lastLevel + 1) {
      const corrected = document.createElement(`h${lastLevel + 1}`);
      corrected.innerHTML = heading.innerHTML;
      heading.replaceWith(corrected);
      lastLevel += 1;
    } else {
      lastLevel = level;
    }
  });
}

function sanitizeFragments(main) {
  main.querySelectorAll('.fragment').forEach((fragment) => {
    fragment.querySelectorAll('h1').forEach((h1) => {
      const h2 = document.createElement('h2');
      h2.innerHTML = h1.innerHTML;
      h1.replaceWith(h2);
    });

    fragment.querySelectorAll('main, header').forEach((el) => {
      el.replaceWith(...el.childNodes);
    });
  });
}

function normalizeInteractiveElements(main) {
  main.querySelectorAll('div[onclick]').forEach((div) => {
    const button = document.createElement('button');
    button.innerHTML = div.innerHTML;
    [...div.attributes].forEach((a) => {
      if (a.name !== 'onclick') button.setAttribute(a.name, a.value);
    });
    div.replaceWith(button);
  });
}

const BLOCK_SEMANTICS = {
  hero: 'section',
  cards: 'section',
  blog: 'section',
  sidebar: 'aside',
};

function enforceBlockWrappers(main) {
  Object.entries(BLOCK_SEMANTICS).forEach(([blockName, tag]) => {
    main.querySelectorAll(`.${blockName}.block`).forEach((block) => {
      if (block.parentElement.tagName.toLowerCase() !== tag) {
        const wrapper = document.createElement(tag);
        wrapper.classList.add(`${blockName}-wrapper`);
        block.replaceWith(wrapper);
        wrapper.appendChild(block);
      }
    });
  });
}

export default function postDecorateSemanticFixes(main) {
  normalizeH1(main);
  normalizeHeadingHierarchy(main);
  enforceBlockWrappers(main);
  sanitizeFragments(main);
  normalizeInteractiveElements(main);
}
