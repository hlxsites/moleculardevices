function getProductDetails(item) {
  fetch(`https://shop.moleculardevices.com/products/${item}.js`, {
    mode: 'cors',
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).then((data) => {
    // eslint-disable-next-line no-console
    console.log(data);
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn(`Could not load product details for item ${item}, got status ${err.status}.`, err.statusText);
  });
}

export default function decorate(block) {
  const products = [...block.querySelectorAll('.ordering-options > div > div')].map((div) => div.innerHTML.split(', '));
  // eslint-disable-next-line no-console
  console.log(products);
  products.forEach((product) => {
    product.forEach((item) => {
      getProductDetails(item);
    });
  });
}
