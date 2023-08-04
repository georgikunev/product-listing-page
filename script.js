// set the number of products to display per page
const productsPerPage = 8;
// track the current page number and total count of products
let currentPage = 1;
let totalProductsCount = 0;

// function to generate product cards
function generateProductCard(product) {
  // check if the product has a discount
  const hasDiscount = "discountPrice" in product;
  // generate the HTML markup for the product card based on whether it has a discount or not
  return `
    <div class="product-box">
      <div class="product">
        <img src="${product.imageUrl}" alt="${
    product.name
  }" class="product-image">
        <div class="product-info">
        <div class="name-description">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        </div>
        <div class="price-container">
        ${
          hasDiscount
            ? `
        <div class="discounted-price-container">
          <p class="discounted-price">${product.discountPrice}</p>
        </div>
        <div class="original-price-container">
          <p class="original-price">${product.price}</p>
        </div>
        `
            : `
        <div class="original-price-container">
          <p>${product.price}</p>
        </div>
        `
        }
      </div>
        </div>
        <div class="ratings">
    <span class="star" data-rating="1"></span>
    <span class="star" data-rating="2"></span>
    <span class="star" data-rating="3"></span>
    <span class="star" data-rating="4"></span>
    <span class="star" data-rating="5"></span>
  </div>
        
      </div>
      <div class="add-to-cart-container">
      <button class="add-to-cart-button" onclick="addToCart('${
        product.name
      }')">Add to Cart</button>
    </div>
    </div>
  `;
}
// function to load products based on category, sorting, and filters
async function loadProducts(
  category,
  sortBy,
  selectedPrices = [],
  selectedColors = []
) {
  // fetch the product data from a JSON file (products.json)
  const response = await fetch("products.json");
  const data = await response.json();
  const products = data[category];
  const productsSection = document.getElementById("products");

  // clear existing products if it's the first page
  if (currentPage === 1) {
    productsSection.innerHTML = ""; // clear existing products if it's the first page
  }

  // display a message if no products are found for the selected category
  if (!products || products.length === 0) {
    productsSection.innerHTML = "<p>No products found for this category.</p>";
    return;
  }

  totalProductsCount = products.length;

  // filter products based on selected price and color filters
  // and sort the filtered products
  filteredProducts = products.filter((product) => {
    const productPrice =
      "discountPrice" in product
        ? extractPrice(product.discountPrice)
        : extractPrice(product.price);
    const productColor = product.color.toLowerCase(); // get the color of the product

    const priceMatch =
      selectedPrices.length === 0 ||
      selectedPrices.some((priceRange) => {
        const [minPrice, maxPrice] = priceRange;
        return productPrice >= minPrice && productPrice <= maxPrice;
      });

    const colorMatch =
      selectedColors.length === 0 || selectedColors.includes(productColor);

    return priceMatch && colorMatch;
  });

  sortProducts(filteredProducts, sortBy);

  // determine the range of products to display on the current page
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(
    startIndex + productsPerPage,
    filteredProducts.length
  );

  // generate and insert HTML markup for the product cards on the current page
  for (let i = startIndex; i < endIndex; i++) {
    const productCard = generateProductCard(filteredProducts[i]);
    productsSection.insertAdjacentHTML("beforeend", productCard);
  }

  // disable the "Load More" button if there are no more products to load
  if (endIndex >= totalProductsCount) {
    document.getElementById("load-more").setAttribute("disabled", "true");
  } else {
    document.getElementById("load-more").removeAttribute("disabled");
  }

  // update the product counter to show the number of products displayed
  updateProductCounter();

  // add click event listeners to the star ratings of products
  addStarClickListeners();
}

//function for mobile view
function toggleFilters() {
  var filtersWindow = document.querySelector(".filters-window");
  filtersWindow.classList.toggle("show-filters");
}

document.addEventListener("click", function (event) {
  var filtersWindow = document.querySelector(".filters-window");
  var filtersBox = document.querySelector(".filters-box");

  // check if the click target is outside the filter window and the filter box
  if (
    !filtersWindow.contains(event.target) &&
    !filtersBox.contains(event.target)
  ) {
    // if it is, slide back the filter window
    filtersWindow.classList.remove("show-filters");
  }
});

// function to handle the "Load More" button click event
function handleLoadMore() {
  currentPage += 1; // increase the current page by 1
  const selectedCategory = document.getElementById("category-dropdown").value;
  const sortBy = document.getElementById("sort").value;

  // load more products with the next page number and current filters
  loadProducts(selectedCategory, sortBy, selectedPrices, selectedColors);

  // check the number of products displayed after loading more
  const productsSection = document.getElementById("products");
  const currentProductsCount = productsSection.childElementCount;
  const remainingProducts = totalProductsCount - currentProductsCount;

  // disable the "Load More" button if there are no more products to load
  if (remainingProducts <= 0) {
    document.getElementById("load-more").setAttribute("disabled", "true");
  }
}

// add event listener for the "Load More" button
document.getElementById("load-more").addEventListener("click", handleLoadMore);

// function to handle the click event of the star ratings
function handleStarClick(event) {
  const clickedRating = parseInt(event.target.getAttribute("data-rating"));
  const stars = event.target.parentElement.querySelectorAll(".star");

  // update star appearances accordingly
  stars.forEach((star, index) => {
    if (index < clickedRating) {
      star.classList.add("star-filled");
    } else {
      star.classList.remove("star-filled");
    }
  });

  // here, we can also send an API request to update the rating on the server if needed.
}

function addStarClickListeners() {
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("click", handleStarClick);
  });
}

// function to handle the category change event in the dropdown
function handleCategoryChange() {
  currentPage = 1; // reset the current page to 1 when category changes
  const selectedCategory = this.value;
  loadProducts(selectedCategory);

  // update the category name and description elements
  const categoryNameElement = document.getElementById("category-name");
  const categoryDescriptionElement = document.getElementById(
    "category-description"
  );
  categoryNameElement.textContent = this.options[this.selectedIndex].text;
  categoryDescriptionElement.textContent =
    this.options[this.selectedIndex].text;
}

// add event listener for the "DOMContentLoaded" eventq
document.addEventListener("DOMContentLoaded", function () {
  const categoryDropdown = document.getElementById("category-dropdown");
  // add a default option to the category dropdown
  const defaultOption = document.createElement("option");
  defaultOption.value = "electric"; // we can set this to a specific value if needed
  defaultOption.textContent = "All Categories";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  categoryDropdown.insertBefore(defaultOption, categoryDropdown.firstChild);

  // get the selected sorting option
  const sortBy = document.getElementById("sort").value;

  // load products with the initial selected category and sorting option
  loadProducts(categoryDropdown.value, sortBy, selectedPrices);
});

// load products for the initial category selection
loadProducts(document.getElementById("category-dropdown").value);

// add event listener for the "change" event on the category dropdown
document
  .getElementById("category-dropdown")
  .addEventListener("change", handleCategoryChange);

// function to update the product counter display
function updateProductCounter() {
  const productsSection = document.getElementById("products");
  const currentProductsCount = productsSection.childElementCount;

  const counterElement = document.getElementById("product-counter");
  counterElement.textContent = `${currentProductsCount} out of ${totalProductsCount} products`;
}
// update the product counter initially
updateProductCounter();

// function to simulate adding a product to the cart
function addToCart(productName) {
  alert(`Product "${productName}" added to cart`);
}

// function to sort the products based on the selected sorting option
function sortProducts(products, sortBy) {
  switch (sortBy) {
    case "name-asc":
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      products.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      products.sort((a, b) => {
        const priceA =
          "discountPrice" in a
            ? extractPrice(a.discountPrice)
            : extractPrice(a.price);
        const priceB =
          "discountPrice" in b
            ? extractPrice(b.discountPrice)
            : extractPrice(b.price);
        return priceA - priceB;
      });
      break;
    case "price-desc":
      products.sort((a, b) => {
        const priceA =
          "discountPrice" in a
            ? extractPrice(a.discountPrice)
            : extractPrice(a.price);
        const priceB =
          "discountPrice" in b
            ? extractPrice(b.discountPrice)
            : extractPrice(b.price);
        return priceB - priceA;
      });
      break;
    default:
      break;
  }
}

// function to extract the numeric price from the product price string
function extractPrice(price) {
  return parseFloat(price.replace(/[^0-9.-]/g, ""));
}

// event listener for sorting dropdown
document.getElementById("sort").addEventListener("change", () => {
  const selectedCategory = document.getElementById("category-dropdown").value;
  const sortBy = document.getElementById("sort").value;
  currentPage = 1; // reset the current page to 1 when sorting changes
  loadProducts(selectedCategory, sortBy);
});

// initialize the selected price range and color filters
let selectedPrices = [];
let selectedColors = [];

// function to handle the change event of the price range checkboxes
function handleCheckboxChange() {
  // get the selected price ranges from the checkboxes
  const priceCheckboxes = document.querySelectorAll('input[name="price"]');
  selectedPrices = Array.from(priceCheckboxes)
    .filter((checkbox) => checkbox.checked && checkbox.value !== "over-1500")
    .map((checkbox) => {
      const priceRange = checkbox.value.split("-");
      return [parseFloat(priceRange[0]), parseFloat(priceRange[1])];
    });
  // load the products with the selected price ranges

  const over1500Checkbox = document.getElementById("over-1500");
  if (over1500Checkbox.checked) {
    // add the over $1500 price range to the selected prices
    selectedPrices.push([1500, Number.MAX_VALUE]);
  }

  // get the selected colors from the checkboxes
  const colorCheckboxes = document.querySelectorAll('input[name="color"]');
  selectedColors = Array.from(colorCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value.toLowerCase());

  const sortBy = document.getElementById("sort").value;

  const selectedCategory = document.getElementById("category-dropdown").value;

  currentPage = 1; // reset the current page to 1 when filters change

  loadProducts(selectedCategory, sortBy, selectedPrices, selectedColors);
}

// add event listeners to the price checkboxes
const priceCheckboxes = document.querySelectorAll('input[name="price"]');
priceCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", handleCheckboxChange);
});

// add event listeners to the color checkboxes
const colorCheckboxes = document.querySelectorAll('input[name="color"]');
colorCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", handleCheckboxChange);
});

// add event listener to the sorting dropdown to handle checkbox change
document
  .getElementById("sort")
  .addEventListener("change", handleCheckboxChange);

// initial loading of products with no price filters
loadProducts(document.getElementById("category-dropdown").value, "default", []);
