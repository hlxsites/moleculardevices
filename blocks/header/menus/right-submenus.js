function buildCardsMenu(submenuContent) {
  // query for cards-submenu div
  const cardsMenuWrapper = submenuContent.querySelector('.cards-submenu');
  cardsMenuWrapper.classList.add('right-submenu');

  // for each div inside cards-submenu add the class right-submenu-row flex-space-between
  const cardsMenuRows = [...cardsMenuWrapper.querySelectorAll('div')];
  cardsMenuRows.forEach((row) => {
    row.classList.add('right-submenu-row', 'flex-space-between');
  });
  return cardsMenuWrapper;
}
