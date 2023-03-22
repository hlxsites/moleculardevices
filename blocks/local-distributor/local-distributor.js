import ffetch from '../../scripts/ffetch.js';

export default async function decorate(block) {
  const heading = block.querySelector('h5');
  const cloneHeading = heading.cloneNode(true);
  heading.remove();
  block.insertBefore(cloneHeading, block.firstChild);

  const searchResult = document.createElement('div');
  searchResult.setAttribute('class', 'search-result');

  const distributors = await ffetch('/local-distibutors.json').withFetch(fetch).all();

  const countryList = [...new Set(distributors.map(({ Country }) => Country))];
  const countrySelectOptions = countryList.map(
    (value) => `<option value='${value}'>${value}</option>`,
  );

  const renderAddress = () => {
    let countryName = document.getElementById('country').value;
    const productFamily = document.getElementById('product_family').value;

    if (!countryName) {
      countryName = 'United States';
      document.querySelector('#country').value = countryName;
    }

    const filterdata = distributors
      .filter(({ Country }) => Country.includes(countryName) > 0)
      .filter(({ PrimaryProducts }) => PrimaryProducts.includes(productFamily) > 0);

    let finalHtml = '';
    const resultHeading = document.createElement('h3');
    const searchResultEl = document.querySelector('.local-distributor .search-result');
    filterdata.forEach((row) => {
      resultHeading.textContent = row.Country;
      const primeProduct = row.PrimaryProducts.replace(/,/g, ' | ');

      const customClass = row.Type.split(' ').join('-').toLowerCase();

      const supportLink = row.Link
        ? `<a href="${row.Link}" target="_blank" rel="noopener noreferrer">Online Support Request</a>`
        : '';

      let newStr = '';
      row.Address.split(' ').forEach((add) => {
        if (add.indexOf(':') > -1) {
          newStr += add.replace(add, ` <strong>${add}</strong> `);
        } else {
          newStr += add;
        }
      });
      const molAddress = `${newStr.replace(/\n/g, '<br>')}<br>`;

      /* eslint no-tabs: ["error", { allowIndentationTabs: true }] */
      finalHtml += `
					<div class="search-result-content ${customClass}-result">
						<div class="type">${row.Type}</div>
            <div class="productfamily">${primeProduct}</div>
            <div class="address">
              ${molAddress}
              ${supportLink}
            </div>
						<p><a href="#">Contact your local ${row.Type} Team</a></p>
					</div>
				`;
    });
    searchResultEl.innerHTML = finalHtml;
    searchResultEl.insertBefore(resultHeading, searchResultEl.firstChild);
  };

  /* eslint no-tabs: ["error", { allowIndentationTabs: true }] */
  const formWrapper = `
		<div class="form">
			<div class="form-group">
				<div class="fields">
					<div class="select-wrapper">
						<select name="country" id="country" class="form-control" required="">
							<option value="">Select Region/Country</option>
							${countrySelectOptions}
						</select>
						<span class="fa fa-chevron-down"></span>
					</div>
					<div class="select-wrapper">
						<select name="product_family" id="product_family" class="form-control">
							<option value="">Select Product Group</option>
							<option value="Assay Kits, Media, Reagents"> Assay Kits, Media, Reagents</option>
							<option value="Axon/Patch Clamp"> Axon/Patch Clamp</option>
							<option value="Cellular Imaging Systems"> Cellular Imaging Systems</option>
							<option value="Clone Screening Systems"> Clone Screening Systems</option>
							<option value="MetaMorph"> MetaMorph</option>
							<option value="Microplate Readers"> Microplate Readers</option>
							<option value="Threshold High Throughput Screening"> Threshold High Throughput Screening</option>
							<option value="Washers and Handlers"> Washers and Handlers</option>
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

  document.querySelector('.local-distributor > div').lastElementChild.innerHTML = formWrapper;
  document.querySelector('.local-distributor').appendChild(searchResult);
  const searchButton = document.getElementById('searchButton');
  searchButton.addEventListener('click', renderAddress);
  renderAddress();
}
