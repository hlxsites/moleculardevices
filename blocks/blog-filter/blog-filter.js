const viewAllCategory = 'viewall';

function setActiveFilter(block) {
  let activeHash = window.location.hash;
  activeHash = activeHash ? activeHash.substring(1) : viewAllCategory;
  const filterLink = block.querySelector(`a[href*="#${activeHash}"`);
  if (!filterLink) {
    block.querySelector(`a[href*="#${viewAllCategory}"`).classList.add('active');
  } else { 
    filterLink.classList.add('active');
  }
}

function filterChangedViaHash(block, filters) {
  filters.forEach((r) => r.classList.remove('active'));
  setActiveFilter(block);
}

export default function decorate(block) {
  const filters = [...block.querySelectorAll('a')];

  filters.forEach((link) => {
    link.addEventListener('click', (e) => {
      filters.forEach((r) => r.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  if (block.closest('main').querySelector('.blog-list')) {
    // we are on the page where cards are displayed and filtering is enabled by hash
    window.addEventListener('hashchange', () => { filterChangedViaHash(block, filters); });
    // set initial active filter
    setActiveFilter(block);
  } else {
    // we are on different page
    // TODO
  }
}
