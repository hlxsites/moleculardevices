function styleCaption(elems) {
  elems.forEach((elem) => {
    const checkEm = elem.parentElement.nextElementSibling.querySelector('p > em');
    if (checkEm) {
      // support multi-line caption
      const ems = checkEm.parentElement.children;
      [...ems].forEach((em) => {
        em.classList.add('text-caption');
      });
    }
  });
}

export default function buildAutoBlocks() {
  const main = document.querySelector('.hero-container');

  // style caption in case if it is below a picture
  styleCaption(main.querySelectorAll('p > picture'));

  // style caption in case if it is below a table
  styleCaption(main.querySelectorAll('div.table'));
}
