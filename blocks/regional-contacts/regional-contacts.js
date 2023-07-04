function tabQueryString(tabID) {
  const newurl = new URL(window.location);
  newurl.searchParams.set('region', tabID);
  window.history.pushState({ path: newurl.href }, '', newurl.href);
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
function createTabButtons(tabWrapper, tabName, tabClassName, index) {
  const tabBtn = document.createElement('a');

  tabBtn.textContent = tabName;
  tabBtn.href = `#${tabName.toLowerCase()}`;
  tabBtn.classList.add(tabClassName);

  if (index === 0) {
    tabBtn.classList.add('active');
    document.getElementById(tabName.toLowerCase()).style.display = 'block';
  }

  tabBtn.addEventListener('click', tabHandler);
  tabWrapper.appendChild(tabBtn);
}
/* ================ CREATE TAB BUTTONS ===================== */

/* ================ Accordian HANDLER ===================== */
function accordianHandler() {
  const siblings = this.parentElement.parentElement.children;
  const siblingsCount = siblings.length;

  if (this.children[0].classList.contains('fa-plus')) {
    /* eslint no-plusplus: "error" */
    for (let i = 0; i < siblingsCount; i += 1) {
      siblings[i].children[0].children[0].classList.add('fa-plus');
      siblings[i].children[0].children[0].classList.remove('fa-minus');
      siblings[i].children[1].classList.remove('active');
    }
    this.nextElementSibling.classList.add('active');
    this.children[0].classList.remove('fa-plus');
    this.children[0].classList.add('fa-minus');
  } else {
    this.children[0].classList.remove('fa-minus');
    this.children[0].classList.add('fa-plus');
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
  const country = tab.textContent;
  const tabParents = tab.parentElement;
  const grandParents = tab.parentElement.parentElement;

  const tabAccordianWrapper = document.createElement('div');
  const plusIcon = document.createElement('i');

  tabAccordianWrapper.classList.add('tab-accordian-wrapper');
  plusIcon.classList.add('fa', 'fa-plus');

  if (!countryNames.includes(country)) {
    const tabClassName = 'tab-btn';
    countryNames.push(country);

    tab.classList.add('accordian-btn');
    tab.parentElement.id = country.toLowerCase();

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
      createTabButtons(tabWrapper, country, tabClassName, index);
    } else {
      tab.parentElement.classList.add('accordian-content');
      /* create accordian buttons */
      createAccordian(tab, plusIcon, index);
    }
  } else {
    /* remove duplicate country data */
    /* eslint no-plusplus: "error" */
    for (let i = 0; i < grandParents.children.length; i += 1) {
      if (grandParents.children[i].id === country.toLowerCase()) {
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
const tabID = params.region ?
  params.region :
  document.querySelector('.regional-contacts .tab-content').id;

document.querySelector(`a[href="#${tabID}"]`).click();
tabQueryString(tabID);

const localTeamText = document.querySelectorAll('.tab-accordian-wrapper div:nth-child(odd) li');
const txt = 'Contact Local Team';

/* eslint operator-linebreak: ["error", "after"] */
const updatedTxt =
  '<a href="javascript:void(0);" title="Contact Local Team">Contact Local Team</a>';

/* eslint no-return-assign: "error" */
localTeamText.forEach(
  (localText) => (localText.innerHTML = localText.innerHTML.replaceAll(txt, updatedTxt)),
);
/* ================ TAB HANDLER ===================== */
