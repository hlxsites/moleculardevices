function styleCaption(elems) {
  elems.forEach((elem) => {
    const checkEm = elem.parentElement.nextElementSibling.querySelector('p > em');
    if (checkEm) {
      const ems = checkEm.parentElement.children;
      [...ems].forEach((em) => {
        em.classList.add('text-caption');
      });
    }
  });
}

export default function buildAutoBlocks() {
  const main = document.querySelector('.hero-container');
  styleCaption(main.querySelectorAll('p > picture'));
  styleCaption(main.querySelectorAll('div.table'));
}
