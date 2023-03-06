/* ================ TAB HANDLER ===================== */
function createTabButtons(tabWrapper, tabName, tabClassName, index) {
  const tabBtn = document.createElement('a');

  tabBtn.textContent = tabName;
  tabBtn.href = '#' + tabName.toLowerCase();
  tabBtn.classList.add(tabClassName);

  if (index === 0) {
    tabBtn.classList.add('active');
    document.getElementById(tabName.toLowerCase()).style.display = 'block';
  }

  tabBtn.addEventListener('click', tabHandler);
  tabWrapper.appendChild(tabBtn);
}

function tabHandler(event) {
  event.preventDefault();

  const tabID = this.href.split('#')[1];
  const tabContents = document.querySelectorAll('.tab-content');
  const tabCount = this.parentElement.children.length;

  /*eslint no-plusplus: "error"*/
  for (let i = 0; i < tabCount; i++) {
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

/* ================ Accordian HANDLER ===================== */
function createAccordian(tab, plusIcon, index) {
    if (index === 0) {
      plusIcon.classList.remove('fa-plus');
      plusIcon.classList.add('fa-minus');
      tab.nextElementSibling.classList.add('active');
    }

  tab.appendChild(plusIcon);
  tab.addEventListener('click', accordianHandler);
}

function accordianHandler() {
    const tabSibling = this.nextElementSibling;
//     const btnHeight = this.clientHeight;
//   var height = tabSibling.clientHeight;
//   console.log(btnHeight);

  if (this.children[0].classList.contains('fa-plus')) {
    tabSibling.classList.add('active');
    // tabSibling.style.height = height + 'px';
    this.children[0].classList.remove('fa-plus');
    this.children[0].classList.add('fa-minus');
  } else {
    this.children[0].classList.remove('fa-minus');
    this.children[0].classList.add('fa-plus');
    // tabSibling.style.height = btnHeight + 'px';
    tabSibling.classList.remove('active');
  }
}
/* ================ Accordian HANDLER ===================== */

const regionalTabs = document.querySelectorAll(
  '.regional-contacts-wrapper .regional-contacts > div > div:first-child',
);
const parent = document.querySelector('.regional-contacts-wrapper');
const nextChild = document.querySelector(
  '.regional-contacts-wrapper .regional-contacts',
);

/* create tab wrapper */
const tabWrapper = document.createElement('div');
tabWrapper.classList.add('tab-wrapper');
parent.insertBefore(tabWrapper, nextChild);

const countryNames = [];

regionalTabs.forEach(function (tab, index) {
  const country = tab.textContent;
  const tabParents = tab.parentElement;
  const grandParents = tab.parentElement.parentElement;

  const tabAccordianWrapper = document.createElement('div');
  const clearFloat = document.createElement('div');
  const plusIcon = document.createElement('i');

  tabAccordianWrapper.classList.add('tab-accordian-wrapper');

  clearFloat.style.clear = 'both';
  clearFloat.style.float = 'none';

  plusIcon.classList.add('fa', 'fa-plus');

  if (!countryNames.includes(country)) {
    const tabClassName = 'tab-btn';
    countryNames.push(country);

    tab.classList.add('accordian-btn');
    tab.parentElement.id = country.toLowerCase();

    [...tabParents.children].forEach(function (tabItem, index) {
      if (index !== 0) {
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
    /*eslint no-plusplus: "error"*/
    for (let i = 0; i < grandParents.children.length; i++) {
      if (grandParents.children[i].id === country.toLowerCase()) {
        [...tabParents.children].forEach(function (tabItem, index) {
          if (index !== 0) {
            //   tabAccordianWrapper.appendChild(tabItem);
            // grandParents.children[i].appendChild(clearFloat);
            grandParents.children[i].children[1].appendChild(tabItem);
            tabParents.remove();
          }
        });
      }
    }
  }
});
/* ================ TAB HANDLER ===================== */
