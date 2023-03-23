export default async function decorateTemplate(main) {
  const sections = [...main.querySelectorAll('div.section')].slice(1);
  const namedSections = sections.filter((section) => section.hasAttribute('data-name'));

  let index = 0;
  sections.forEach((section) => {
    if (index < namedSections.length) {
      section.classList.add('tabs');
      section.setAttribute('aria-labelledby', namedSections[index].id);
      if (section.hasAttribute('data-name')) {
        index += 1;
      }
    }
  });
}
