import ffetch from '../../scripts/ffetch.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function getSelectOptions(rows) {
  return rows.map((value) => `<option value='${value}'>${value}</option>`);
}

function queryString() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  return params;
}

function searchDistributorForm(countryList, productFamilyList) {
  return `
            <div class="form">
              <div class="form-group">
                <div class="fields">
                  <div class="select-wrapper">
                    <select name="country" id="country" class="form-control" required="">
                      <option value="" selected>Select Region/Country</option>
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

function createExternalLink(val) {
  return `<a href='${val}' target="_blank">${val}</a>`;
}

function wrapWithStrong(val) {
  return `<strong>${val}</strong>`;
}

function replaceHTMLTag(add) {
  let str = '';
  /* eslint operator-linebreak: ["error", "none"] */
  if (add.indexOf('http') > -1) {
    str += add
      .split(' ')
      .map((a) => (a.includes('http') ? createExternalLink(a) : wrapWithStrong(a)))
      .join(' ');
  } else if (add.indexOf('@') > -1) {
    str += add
      .split(' ')
      .map((a) => (!a.includes(':') ? ` <a href='mailto:${a}'>${a}</a> ` : wrapWithStrong(a)))
      .join(' ');
  } else {
    str += `${add
      .split(': ')
      .map((a, index) => (index === 0 ? wrapWithStrong(a) : a))
      .join(': ')}\n`;
  }
  return str;
}

function scrollToForm() {
  const getInTouchBlock = document.querySelector('.get-in-touch');
  window.scroll({
    top: getInTouchBlock.offsetTop,
    behavior: 'smooth',
  });
}

function hideResult() {
  if (window.location.pathname !== '/contact-search') {
    document.querySelector('.search-result').style.display = 'none';
  }
}

function redirectToContactSearch(distributorsMap, productFamilyMap) {
  const countryName = document.getElementById('country').value;
  const primeProduct = document.getElementById('product_family').value;
  window.open(`/contact-search?country=${distributorsMap[countryName]}&product_family=${primeProduct ? productFamilyMap[primeProduct] : ''}`, '_blank');
  Event.preventDefault();
}

export default async function decorate(block) {
  const params = queryString();

  const distributors = await ffetch('/contact/local-distibutors.json').withFetch(fetch).all();
  const productFamilyList = await ffetch('/contact/local-distibutors.json')
    .sheet('PF')
    .all();
  const distributorsMap = {};
  const productFamilyMap = {};
  distributors.forEach(
    (distributor) => {
      distributorsMap[distributor.DisplayCountry] = distributor.Country;
    });
  productFamilyList.forEach(
    (family) => {
      productFamilyMap[family.DisplayPrimaryProducts] = family.PrimaryProducts;
    });

  let countryList = '';
  if (window.location.pathname === '/contact') {
    countryList = [
      ...new Set(
        distributors
          .filter(({ Region }) => Region.toLowerCase().includes(params.region.toLowerCase()) > 0)
          .map(({ DisplayCountry }) => DisplayCountry),
      ),
    ];
  } else {
    const countryName = params.country;
    if (countryName) {
      const region = distributors.filter(
        (dist) => dist.Country === countryName)[0].Region.toLowerCase();
      countryList = [
        ...new Set(
          distributors
            .filter(({ Region }) => Region.toLowerCase().includes(region) > 0)
            .map(({ DisplayCountry }) => DisplayCountry),
        ),
      ];
    } else {
      countryList = [...new Set(distributors.map(({ DisplayCountry }) => DisplayCountry))];
    }
  }

  const searchButtton = document.querySelector('.tab-wrapper');

  if (searchButtton) {
    searchButtton.addEventListener('click', () => {
      const params2 = queryString();
      const countryList2 = [
        ...new Set(
          distributors
            .filter(({ Region }) => Region.toLowerCase().includes(params2.region.toLowerCase()) > 0)
            .map(({ DisplayCountry }) => DisplayCountry),
        ),
      ];
      const formWrapper = getSelectOptions(countryList2);
      /* eslint operator-linebreak: ["error", "before"] */
      document.getElementById(
        'country',
      ).innerHTML = `<option value="">Select Region/Country</option>${formWrapper}`;
    });
  }
  const renderAddress = () => {
    const displayCountryName = document.getElementById('country').value;
    const displayProductFamily = document.getElementById('product_family').value;
    let countryName = distributorsMap[displayCountryName];
    let productFamily = displayProductFamily ? productFamilyMap[displayProductFamily] : '';

    if (!countryName && params.country) {
      countryName = params.country;
      productFamily = params.product_family;
      [document.getElementById('country').value] = Object.entries(distributorsMap).find(([, value]) => value === params.country);
      [document.getElementById('product_family').value] = Object.entries(productFamilyMap).find(([, value]) => value === params.product_family) || [''];
    }
    if (!countryName) {
      countryName = 'united-states';
      document.querySelector('#country').value = 'United States';
    }

    const filterdata = distributors
      .filter(({ Country }) => Country === countryName)
      .filter(({ PrimaryProducts }) => PrimaryProducts.includes(productFamily) > 0);

    let finalHtml = '';
    const resultHeading = document.createElement('h3');
    const searchResultEl = document.querySelector('.local-distributor .search-result');
    if (!filterdata.length) {
      resultHeading.classList.add('no-result');
      resultHeading.textContent = 'NO RESULT FOUND';
    }

    filterdata.forEach((row) => {
      const primeProduct = row.DisplayPrimaryProducts.replace(/,/g, ' | ').replace(/-/g, ', ');

      const customClass = row.Type.split(' ').join('-').toLowerCase();

      let newStr = '';
      row.Address.split('\n').forEach((add) => {
        if (add.indexOf(':') > -1) {
          newStr += replaceHTMLTag(add);
        } else {
          newStr += `${add}\n`;
        }
      });

      if (row.Email) {
        newStr += `<strong>Email:</strong>  <a href="mailto:${row.Email}">${(row.Email)}</a>\n`;
      }
      if (row.Link) {
        if (row.Link === 'https://mdc.custhelp.com/app/ask') {
          newStr += `<a href="${row.Link}" target="_blank" rel="noopener noreferrer">Online Support Request <span class="icon icon-external-link"></span></a>\n`;
        } else {
          newStr += `<strong>Website:</strong> <a href="${row.Link}" target="_blank" rel="noopener noreferrer">${row.Link} <span class="icon icon-external-link"></span></a>\n`;
        }
      }

      const molAddress = `${newStr.replace(/\n/g, '<br>')}<br>`;

      if (row.PrimaryProducts.length <= 1 && row.Address.trim().length <= 1) {
        resultHeading.classList.add('no-result');
        resultHeading.textContent = 'NO RESULT FOUND';
      } else {
        resultHeading.textContent = displayCountryName;
        finalHtml += `
                      <div class="search-result-content ${customClass}-result">
                        <div class="type">${row.Type}</div>
                        ${!productFamily ? `<div class=productfamily>${primeProduct}</div>` : ''}
                        <div class="address">
                          ${molAddress}
                          <p>
                            <a href="javascript:void(0);" title="Contact your local ${row.Type} Team">
                              Contact your local ${row.Type} Team <span class="icon icon-chevron-right-outline"></span>
                            </a>
                          </p>
                        </div>
                      </div>
                    `;
      }
    });
    searchResultEl.innerHTML = finalHtml;
    searchResultEl.insertBefore(resultHeading, searchResultEl.firstChild);
    const localLinks = document.querySelectorAll("a[title*='Contact your local ']");
    localLinks.forEach((link) => link.addEventListener('click', scrollToForm));
  };

  const heading = block.querySelector('h5');
  const cloneHeading = heading.cloneNode(true);
  heading.remove();
  block.insertBefore(cloneHeading, block.firstChild);

  const searchResult = document.createElement('div');
  searchResult.setAttribute('class', 'search-result');
  const formWrapper = searchDistributorForm(countryList,
    productFamilyList.map((family) => family.DisplayPrimaryProducts));
  document.querySelector('.local-distributor > div').lastElementChild.innerHTML = formWrapper;
  document.querySelector('.local-distributor').appendChild(searchResult);
  const searchButton = document.querySelector('#searchButton > button');

  searchButton.addEventListener('click', () => {
    // eslint-disable-next-line no-unused-expressions
    window.location.pathname === '/contact' ? redirectToContactSearch(distributorsMap, productFamilyMap) : renderAddress();
    decorateIcons(block);
  });

  hideResult();
  renderAddress();

  await decorateIcons(block);
}
