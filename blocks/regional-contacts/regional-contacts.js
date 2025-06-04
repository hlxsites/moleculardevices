function tabQueryString(tabID) {
  const newurl = new URL(window.location);
  newurl.searchParams.set('region', tabID || 'americas');
  window.history.pushState({ path: newurl.href }, '', newurl.href);
}

function idFromRegion(country) {
  return country.id.split('-')[0];
}

/* ================ TAB HANDLER ===================== */
function tabHandler(event) {
  event.preventDefault();

  const tabID = decodeURI(this.href.split('#')[1]);
  const tabContents = document.querySelectorAll('.tab-content');
  const tabCount = this.parentElement.children.length;

  tabQueryString(tabID);

  /* eslint no-plusplus: "error" */
  for (let i = 0; i < tabCount; i += 1) {
    this.parentElement.children[i].classList.remove('active');
    if (tabContents[i].id === tabID) {
      tabContents[i].style.display = 'block';
    } else {
      tabContents[i].style.display = 'none';
    }
  }

  this.classList.add('active');
}
/* ================ TAB HANDLER ===================== */

/* ================ CREATE TAB BUTTONS ===================== */
function createTabButtons(tabWrapper, tabName, tabId, tabClassName, index) {
  const tabBtn = document.createElement('a');

  tabBtn.textContent = tabName;
  tabBtn.href = `#${tabId}`;
  tabBtn.classList.add(tabClassName);

  if (index === 0) {
    tabBtn.classList.add('active');
    document.getElementById(tabId).style.display = 'block';
  }

  tabBtn.addEventListener('click', tabHandler);
  tabWrapper.appendChild(tabBtn);
}
/* ================ CREATE TAB BUTTONS ===================== */

/* ================ Accordian HANDLER ===================== */
function accordianHandler() {
  const siblings = this.parentElement.parentElement.children;
  const siblingsCount = siblings.length;

  if (this.querySelector('i.fa').classList.contains('fa-plus')) {
    for (let i = 0; i < siblingsCount; i += 1) {
      siblings[i].querySelector('i.fa').classList.add('fa-plus');
      siblings[i].querySelector('i.fa').classList.remove('fa-minus');
      siblings[i].children[1].classList.remove('active');
    }

    this.nextElementSibling.classList.add('active');
    this.querySelector('i.fa').classList.remove('fa-plus');
    this.querySelector('i.fa').classList.add('fa-minus');

    // Scroll to the clicked accordion button with offset
    setTimeout(() => {
      const yOffset = -80;
      const y = this.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, 100);
  } else {
    this.querySelector('i.fa').classList.remove('fa-minus');
    this.querySelector('i.fa').classList.add('fa-plus');
    this.nextElementSibling.classList.remove('active');
  }
}
/* ================ Accordian HANDLER ===================== */

/* ================ CREATE Accordian BUTTONS ===================== */
function createAccordian(tab, plusIcon, index) {
  if (index === 0) {
    plusIcon.classList.remove('fa-plus');
    plusIcon.classList.add('fa-minus');
    tab.nextElementSibling.classList.add('active');
    tabQueryString(tab.parentElement.id);
  }

  tab.appendChild(plusIcon);
  tab.addEventListener('click', accordianHandler);
}

/* ================ CREATE Accordian BUTTONS ===================== */
const parent = document.querySelector('.regional-contacts-wrapper');
const nextChild = parent.querySelector('.regional-contacts');
const regionalTabs = parent.querySelectorAll('.regional-contacts > div > div:first-child');

/* create tab wrapper */
const tabWrapper = document.createElement('div');
tabWrapper.classList.add('tab-wrapper');
parent.insertBefore(tabWrapper, nextChild);

const countryNames = [];

regionalTabs.forEach((tab, index) => {
  const country = tab.querySelector('h3');
  const countryName = country.textContent;
  const countryId = idFromRegion(country);
  const tabParents = tab.parentElement;
  const grandParents = tab.parentElement.parentElement;

  const tabAccordianWrapper = document.createElement('div');
  const plusIcon = document.createElement('i');

  tabAccordianWrapper.classList.add('tab-accordian-wrapper');
  plusIcon.classList.add('fa', 'fa-plus');

  if (!countryNames.includes(countryId)) {
    const tabClassName = 'tab-btn';
    countryNames.push(countryId);

    tab.classList.add('accordian-btn');
    tab.parentElement.id = countryId;

    [...tabParents.children].forEach((tabItem, i) => {
      if (i !== 0) {
        tabAccordianWrapper.appendChild(tabItem);
      }
    });

    tabParents.appendChild(tabAccordianWrapper);

    if (window.innerWidth > 768) {
      /* hide tab contents */
      tab.parentElement.classList.add('tab-content');
      tab.parentElement.style.display = 'none';

      /* create tab buttons */
      createTabButtons(tabWrapper, countryName, countryId, tabClassName, index);
    } else {
      tab.parentElement.classList.add('accordian-content');
      /* create accordian buttons */
      createAccordian(tab, plusIcon, index);
    }
  } else {
    /* remove duplicate country data */
    /* eslint no-plusplus: "error" */
    for (let i = 0; i < grandParents.children.length; i += 1) {
      if (grandParents.children[i].id === countryId) {
        [...tabParents.children].forEach((tabItem, ind) => {
          if (ind !== 0) {
            grandParents.children[i].children[1].appendChild(tabItem);
            tabParents.remove();
          }
        });
      }
    }
  }
});

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const tabID = params.region
  ? params.region
  : document.querySelector('.regional-contacts .tab-content').id;

if (tabID) {
  if (document.querySelector(`a[href="#${tabID}"]`)) {
    document.querySelector(`a[href="#${tabID}"]`).click();
    tabQueryString(tabID);
  }
}
/* ================ TAB HANDLER ===================== */
