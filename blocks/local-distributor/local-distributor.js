import ffetch from '../../scripts/ffetch.js';

function getSelectOptions(rows) {
  return rows.map((value) => `<option value='${value}'>${value}</option>`);
}

function searchDistributorForm(countryList, productFamilyList) {
  return `
            <div class="form">
              <div class="form-group">
                <div class="fields">
                  <div class="select-wrapper">
                    <select name="country" id="country" class="form-control" required="">
                      <option value="">Select Region/Country</option>
                      ${getSelectOptions(countryList)}
                    </select>
                    <span class="fa fa-chevron-down"></span>
                  </div>
                  <div class="select-wrapper">
                    <select name="product_family" id="product_family" class="form-control">
                      <option value="">Select Product Group</option>
                      ${getSelectOptions(productFamilyList)}
                    </select>
                    <span class="fa fa-chevron-down"></span>
                  </div>
                </div>
                <div class="button" id="searchButton">
                  <button>SEARCH</button>
                </div>
              </div>
            </div>
          `;
}

function replaceHTMLTag(element, replaceWith) {
  return element.replace(element, replaceWith);
}

function addNewElement(className, element, parentEl) {
  const tagName = document.createElement(element);
  tagName.setAttribute('class', className);
  document.querySelector(parentEl).appendChild(tagName);
}

function renderAddress(distributors) {
  let countryName = document.getElementById('country').value;
  const productFamily = document.getElementById('product_family').value;
  let finalHtml = '';
  const resultHeading = document.createElement('h3');
  const searchResultEl = document.querySelector('.local-distributor .search-result');

  if (!countryName) {
    countryName = 'United States';
    document.querySelector('#country').value = countryName;
  }

  const filterdata = distributors
    .filter(({ Country }) => Country.includes(countryName) > 0)
    .filter(({ PrimaryProducts }) => PrimaryProducts.includes(productFamily) > 0);

  filterdata.forEach((row) => {
    const primeProduct = row.PrimaryProducts.replace(/,/g, ' | ');
    const customClass = row.Type.split(' ').join('-').toLowerCase();
    const supportLink = row.Link
      ? `<a href="${row.Link}" target="_blank" rel="noopener noreferrer">Online Support Request</a>`
      : '';

    let newStr = '';
    row.Address.split(' ').forEach((add) => {
      if (add.indexOf(':') > -1) {
        if (add.indexOf('http') > -1) {
          newStr += replaceHTMLTag(add, ` <a href='${add}'>${add}</a> `);
        } else {
          newStr += replaceHTMLTag(add, ` <strong>${add}</strong> `);
        }
      } else if (add.indexOf('@') > -1) {
        newStr += replaceHTMLTag(add, ` <a href='mailto:${add}'>${add}</a> `);
      } else {
        newStr += `${add} `;
      }
    });
    const molAddress = `${newStr.replace(/\n/g, '<br>')}<br>`;

    if ((row.PrimaryProducts.length && row.Address.trim().length) === 0) {
      resultHeading.textContent = 'NO RESULT FOUND';
    } else {
      resultHeading.textContent = row.Country;
      finalHtml += `
                    <div class="search-result-content ${customClass}-result">
                      <div class="type">${row.Type}</div>
                      <div class="productfamily">${primeProduct}</div>
                      <div class="address">
                        ${molAddress}
                        ${supportLink}
                      </div>
                      <p><a href="javascript:void(0)" class='modal-link'>Contact your local ${row.Type} Team</a></p>
                    </div>
                  `;
    }
  });
  searchResultEl.innerHTML = finalHtml;
  searchResultEl.insertBefore(resultHeading, searchResultEl.firstChild);
}

function modalHtml(formUrl) {
  return `
            <div class="contact-modal" id="contactModal">
              <div class="contact-modal-dialog">
                  <button type="button" class="contact-modal-close">
                    <svg viewBox="0 0 20.71 20.71">
                      <polygon fill="#fff" points="20.71 0.71 20 0 10.35 9.65 0.71 0 0 0.71 9.65 10.35 0 20 0.71 20.71 10.35 11.06 20 20.71 20.71 20 11.06 10.35 20.71 0.71"></polygon>
                    </svg>
                  </button>
                  <div class="contact-modal-content">
                    <iframe id="contact_form_send_email" src="${formUrl}" frameborder="0"></iframe>
                  </div>
              </div>
            </div>
            <div class="contact-modal-overlay"></div>
          `;
}

function showModalHandler() {
  const modal = document.getElementById('contactModal');
  const overlay = modal.nextElementSibling;

  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = '17px';

  modal.classList.add('show');
  overlay.classList.add('show');
}

function hideModalHandler() {
  const modal = document.getElementById('contactModal');
  const overlay = modal.nextElementSibling;

  document.body.style.overflow = 'auto';
  document.body.style.paddingRight = '0';

  modal.classList.remove('show');
  overlay.classList.remove('show');
}

export default async function decorate(block) {
  const distributors = await ffetch('/cotact/local-distibutors.json').withFetch(fetch).all();

  const productFamilyList = await ffetch('/cotact/local-distibutors.json')
    .sheet('PF')
    .map(({ PrimaryProducts }) => PrimaryProducts)
    .all();

  const countryList = [...new Set(distributors.map(({ Country }) => Country))];

  /* Main Heading */
  const heading = block.querySelector('h5');
  const cloneHeading = heading.cloneNode(true);
  heading.remove();
  block.insertBefore(cloneHeading, block.firstChild);

  /* Search result */
  addNewElement('search-result', 'div', '.local-distributor');

  /* Filter Form */
  const formWrapper = searchDistributorForm(countryList, productFamilyList);
  document.querySelector('.local-distributor > div').lastElementChild.innerHTML = formWrapper;

  /* Filter Data */
  const searchButton = document.getElementById('searchButton');
  searchButton.addEventListener('click', renderAddress.bind(null, distributors), false);
  renderAddress(distributors);

  /* Modal Form */
  const modalFormUrl = 'https://info.moleculardevices.com/send-an-email?product_primary_application__c=&country=US';
  const modalRoot = modalHtml(modalFormUrl);
  document.body.insertAdjacentHTML('beforeend', modalRoot.trim());

  const modalLinks = document.querySelectorAll('.modal-link');
  const modalCloseBtn = document.getElementsByClassName('contact-modal-close')[0];
  const modalOverlay = document.getElementsByClassName('contact-modal-overlay')[0];
  modalLinks.forEach((link) => link.addEventListener('click', showModalHandler));
  modalCloseBtn.addEventListener('click', hideModalHandler);
  modalOverlay.addEventListener('click', hideModalHandler);
}
