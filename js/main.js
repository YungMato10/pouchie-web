const mobileMenu = document.querySelector('[data-mobile-menu]');
const openMenuButton = document.querySelector('[data-menu-open]');
const closeMenuButton = document.querySelector('[data-menu-close]');
const toast = document.querySelector('[data-toast]');
const cartCountElements = document.querySelectorAll('[data-cart-count]');

const CART_STORAGE_KEY = 'pouchieCart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(price) {
  return `${price.toLocaleString('cs-CZ')} Kč`;
}

function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

function getCartTotalPrice() {
  return getCart().reduce((total, item) => {
    const price = Number(item.price) || 0;
    return total + price * item.quantity;
  }, 0);
}

function updateCartCount() {
  const count = getCartCount();

  cartCountElements.forEach((el) => {
    el.textContent = String(count);
  });
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

function addToCart(product) {
  const cart = getCart();
  const existingProduct = cart.find((item) => item.id === product.id);
  const cleanPrice = parseInt(String(product.price).replace(/\D/g, ''), 10) || 0;

  if (existingProduct) {
    existingProduct.quantity += 1;
    existingProduct.price = cleanPrice;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      color: product.color,
      price: cleanPrice,
      image: product.image,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartCount();
  showToast('Produkt byl přidán do košíku.');
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  updateCartCount();
  renderCartPage();
  showToast('Produkt byl odebrán z košíku.');
}

function changeQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find((product) => product.id === productId);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart(cart);
  updateCartCount();
  renderCartPage();
}

function renderCartPage() {
  const cartItemsContainer = document.querySelector('[data-cart-items]');
  const cartEmpty = document.querySelector('[data-cart-empty]');
  const cartLayout = document.querySelector('[data-cart-layout]');
  const cartTotalItems = document.querySelector('[data-cart-total-items]');
  const cartTotalPrice = document.querySelector('[data-cart-total-price]');

  if (!cartItemsContainer || !cartEmpty || !cartLayout) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartEmpty.style.display = 'block';
    cartLayout.style.display = 'none';
    cartItemsContainer.innerHTML = '';

    if (cartTotalItems) {
      cartTotalItems.textContent = '0';
    }

    if (cartTotalPrice) {
      cartTotalPrice.textContent = '0 Kč';
    }

    return;
  }

  cartEmpty.style.display = 'none';
  cartLayout.style.display = 'grid';

  cartItemsContainer.innerHTML = cart.map((item) => {
    const itemTotal = item.price * item.quantity;

    return `
      <tr>
        <td>
          <div class="cart-item-info">
            <img class="cart-item-image" src="${item.image}" alt="${item.name} ${item.color}">

            <div>
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-variant">${item.color}</div>
              <button class="cart-remove-btn" type="button" data-remove-from-cart="${item.id}">Odebrat</button>
            </div>
          </div>
        </td>

        <td>
          <div class="qty-control">
            <button class="qty-btn" type="button" data-qty-minus="${item.id}">−</button>
            <input class="qty-input" value="${item.quantity}" type="number" min="1" readonly>
            <button class="qty-btn" type="button" data-qty-plus="${item.id}">+</button>
          </div>
        </td>

        <td>${formatPrice(itemTotal)}</td>
      </tr>
    `;
  }).join('');

  const totalItems = getCartCount();
  const totalPrice = getCartTotalPrice();

  if (cartTotalItems) {
    cartTotalItems.textContent = String(totalItems);
  }

  if (cartTotalPrice) {
    cartTotalPrice.textContent = formatPrice(totalPrice);
  }

  document.querySelectorAll('[data-remove-from-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      removeFromCart(button.dataset.removeFromCart);
    });
  });

  document.querySelectorAll('[data-qty-minus]').forEach((button) => {
    button.addEventListener('click', () => {
      changeQuantity(button.dataset.qtyMinus, -1);
    });
  });

  document.querySelectorAll('[data-qty-plus]').forEach((button) => {
    button.addEventListener('click', () => {
      changeQuantity(button.dataset.qtyPlus, 1);
    });
  });
}

openMenuButton?.addEventListener('click', () => {
  mobileMenu?.classList.add('open');
});

closeMenuButton?.addEventListener('click', () => {
  mobileMenu?.classList.remove('open');
});

document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
  button.addEventListener('click', () => {
    const product = {
      id: button.dataset.productId,
      name: button.dataset.productName,
      color: button.dataset.productColor,
      price: button.dataset.productPrice,
      image: button.dataset.productImage
    };

    addToCart(product);
  });
});

document.querySelectorAll('[data-placeholder-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Formulář je zatím pouze ukázkový.');
  });
});

document.querySelectorAll('[data-placeholder-checkout]').forEach((button) => {
  button.addEventListener('click', () => {
    showToast('Objednávka zatím není napojená na checkout.');
  });
});

updateCartCount();
renderCartPage();
