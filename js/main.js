// ── Košík – Pouchie ────────────────────────────────────────────────────────
const CART_STORAGE_KEY = 'pouchieCart';

const SHIPPING_OPTIONS = {
  zasilkovna:      { label: 'Zásilkovna',                     price: 79 },
  'osobni-brno':   { label: 'Osobní odběr – Brno',           price: 0  },
  'osobni-prerov': { label: 'Osobní odběr – Přerov a okolí', price: 0  }
};

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }
function formatPrice(price) { return `${price.toLocaleString('cs-CZ')} Kč`; }
function getCartCount() { return getCart().reduce((t, i) => t + i.quantity, 0); }
function getCartTotalPrice() { return getCart().reduce((t, i) => t + (Number(i.price)||0) * i.quantity, 0); }

function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = String(count));
}

function showToast(message) {
  const toast = document.querySelector('[data-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  const price = parseInt(String(product.price).replace(/\D/g,''), 10) || 0;
  if (existing) { existing.quantity += 1; existing.price = price; }
  else cart.push({ id: product.id, name: product.name, color: product.color, price, image: product.image, quantity: 1 });
  saveCart(cart);
  updateCartCount();
  showToast('Produkt byl přidán do košíku.');
}

function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
  updateCartCount();
  renderCartPage();
  showToast('Produkt byl odebrán z košíku.');
}

function changeQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) { removeFromCart(productId); return; }
  saveCart(cart);
  updateCartCount();
  renderCartPage();
}

function getSelectedShipping() {
  const radio = document.querySelector('[data-shipping-option]:checked');
  if (!radio || !SHIPPING_OPTIONS[radio.value]) return null;
  return { key: radio.value, ...SHIPPING_OPTIONS[radio.value] };
}

function updateGrandTotal() {
  const productsTotal = getCartTotalPrice();
  const shipping = getSelectedShipping();
  const shippingPrice = shipping ? shipping.price : 0;
  const grandTotal = productsTotal + shippingPrice;

  const shippingLine = document.querySelector('[data-shipping-summary-line]');
  const shippingLabel = document.querySelector('[data-shipping-label]');
  const shippingPriceEl = document.querySelector('[data-shipping-price]');
  const grandTotalEl = document.querySelector('[data-cart-grand-total]');

  if (shipping && shippingLine) {
    shippingLine.classList.add('visible');
    if (shippingLabel) shippingLabel.textContent = shipping.label;
    if (shippingPriceEl) shippingPriceEl.textContent = shipping.price === 0 ? 'Zdarma' : formatPrice(shipping.price);
  } else if (shippingLine) {
    shippingLine.classList.remove('visible');
  }
  if (grandTotalEl) grandTotalEl.textContent = formatPrice(grandTotal);

  const recapProducts = document.querySelector('[data-recap-products]');
  const recapShipping = document.querySelector('[data-recap-shipping]');
  const recapTotal = document.querySelector('[data-recap-total]');
  if (recapProducts) recapProducts.textContent = formatPrice(productsTotal);
  if (recapShipping) recapShipping.textContent = shipping ? (shipping.price === 0 ? 'Zdarma' : formatPrice(shipping.price)) : '—';
  if (recapTotal) recapTotal.textContent = formatPrice(grandTotal);
}

function renderCartPage() {
  const cartItemsContainer = document.querySelector('[data-cart-items]');
  const cartEmpty = document.querySelector('[data-cart-empty]');
  const cartLayout = document.querySelector('[data-cart-layout]');
  const cartTotalItems = document.querySelector('[data-cart-total-items]');
  const cartTotalPrice = document.querySelector('[data-cart-total-price]');
  const grandTotalEl = document.querySelector('[data-cart-grand-total]');

  if (!cartItemsContainer || !cartEmpty || !cartLayout) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartEmpty.style.display = 'block';
    cartLayout.style.display = 'none';
    cartItemsContainer.innerHTML = '';
    if (cartTotalItems) cartTotalItems.textContent = '0';
    if (cartTotalPrice) cartTotalPrice.textContent = '0 Kč';
    if (grandTotalEl) grandTotalEl.textContent = '0 Kč';
    return;
  }

  cartEmpty.style.display = 'none';
  cartLayout.style.display = 'grid';

  cartItemsContainer.innerHTML = cart.map(item => {
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
      </tr>`;
  }).join('');

  if (cartTotalItems) cartTotalItems.textContent = String(getCartCount());
  if (cartTotalPrice) cartTotalPrice.textContent = formatPrice(getCartTotalPrice());
  if (grandTotalEl) grandTotalEl.textContent = formatPrice(getCartTotalPrice());

  document.querySelectorAll('[data-remove-from-cart]').forEach(btn =>
    btn.addEventListener('click', () => removeFromCart(btn.dataset.removeFromCart)));
  document.querySelectorAll('[data-qty-minus]').forEach(btn =>
    btn.addEventListener('click', () => changeQuantity(btn.dataset.qtyMinus, -1)));
  document.querySelectorAll('[data-qty-plus]').forEach(btn =>
    btn.addEventListener('click', () => changeQuantity(btn.dataset.qtyPlus, 1)));
}

function goToStep(step) {
  document.querySelectorAll('[data-checkout-step]').forEach(el => el.style.display = 'none');
  const stepEl = document.querySelector(`[data-checkout-step="${step}"]`);
  if (stepEl) stepEl.style.display = 'block';
  document.querySelectorAll('[data-step]').forEach(el => {
    const n = parseInt(el.dataset.step);
    el.classList.remove('active', 'done');
    if (n === step) el.classList.add('active');
    if (n < step) el.classList.add('done');
  });
  if (step === 3) { updateGrandTotal(); updateCodVisibility(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showCheckout() {
  const cartLayout = document.querySelector('[data-cart-layout]');
  const checkoutSection = document.querySelector('[data-checkout-section]');
  if (cartLayout) cartLayout.style.display = 'none';
  if (checkoutSection) checkoutSection.classList.add('visible');
  goToStep(1);
}

function hideCheckout() {
  const cartLayout = document.querySelector('[data-cart-layout]');
  const checkoutSection = document.querySelector('[data-checkout-section]');
  if (cartLayout) cartLayout.style.display = 'grid';
  if (checkoutSection) checkoutSection.classList.remove('visible');
  renderCartPage();
}

function validateStep1() {
  let valid = true;
  const fields = [
    { id: 'firstName', check: v => v.trim().length > 0 },
    { id: 'lastName',  check: v => v.trim().length > 0 },
    { id: 'email',     check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'phone',     check: v => v.replace(/\s/g,'').length >= 9 },
    { id: 'street',    check: v => v.trim().length > 0 },
    { id: 'city',      check: v => v.trim().length > 0 },
    { id: 'zip',       check: v => v.replace(/\s/g,'').length >= 5 }
  ];
  fields.forEach(({ id, check }) => {
    const input = document.getElementById(id);
    if (!input) return;
    const group = input.closest('.form-group');
    if (!check(input.value)) {
      valid = false;
      group?.classList.add('has-error');
      input.classList.add('error');
    } else {
      group?.classList.remove('has-error');
      input.classList.remove('error');
    }
  });
  return valid;
}

function validateStep2() {
  if (!document.querySelector('[data-shipping-option]:checked')) {
    showToast('Vyberte způsob dopravy.');
    return false;
  }
  return true;
}

function validateStep3() {
  if (!document.querySelector('[data-payment-option]:checked')) {
    showToast('Vyberte způsob platby.');
    return false;
  }
  return true;
}

function updateCodVisibility() {
  const shippingVal = document.querySelector('[data-shipping-option]:checked')?.value;
  const codOption = document.getElementById('dobrika-option');
  if (!codOption) return;
  if (shippingVal !== 'zasilkovna') {
    codOption.style.opacity = '0.4';
    codOption.style.pointerEvents = 'none';
    const codRadio = codOption.querySelector('input[type="radio"]');
    if (codRadio?.checked) codRadio.checked = false;
  } else {
    codOption.style.opacity = '1';
    codOption.style.pointerEvents = 'auto';
  }
}

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2,5).toUpperCase();
  return `PCH-${ts}-${rand}`;
}

function submitOrder() {
  if (!validateStep3()) return;
  const shipping = getSelectedShipping();
  const paymentVal = document.querySelector('[data-payment-option]:checked')?.value;
  const productsTotal = getCartTotalPrice();
  const shippingPrice = shipping ? shipping.price : 0;
  const grandTotal = productsTotal + shippingPrice;
  const orderNumber = generateOrderNumber();

  const order = {
    orderNumber,
    customer: {
      firstName: document.getElementById('firstName')?.value,
      lastName:  document.getElementById('lastName')?.value,
      email:     document.getElementById('email')?.value,
      phone:     document.getElementById('phone')?.value,
      street:    document.getElementById('street')?.value,
      city:      document.getElementById('city')?.value,
      zip:       document.getElementById('zip')?.value
    },
    shipping: shipping ? { key: shipping.key, label: shipping.label, price: shipping.price } : null,
    payment: paymentVal,
    items: getCart(),
    productsTotal,
    shippingPrice,
    grandTotal,
    createdAt: new Date().toISOString()
  };

  console.log('Objednávka:', order);

  // TODO: fetch('/api/create-order', { method: 'POST', body: JSON.stringify(order) })

  const checkoutSection = document.querySelector('[data-checkout-section]');
  const orderConfirm = document.querySelector('[data-order-confirm]');
  const confirmPaymentInfo = document.querySelector('[data-confirm-payment-info]');
  const confirmOrderNumber = document.querySelector('[data-confirm-order-number]');

  if (checkoutSection) checkoutSection.style.display = 'none';
  if (orderConfirm) orderConfirm.classList.add('visible');
  if (confirmOrderNumber) confirmOrderNumber.textContent = `Číslo objednávky: ${orderNumber}`;
  if (confirmPaymentInfo) {
    if (paymentVal === 'bank') confirmPaymentInfo.textContent = 'Platební údaje pro bankovní převod vám zašleme e-mailem.';
    else if (paymentVal === 'cod') confirmPaymentInfo.textContent = 'Platbu uhradíte při převzetí zásilky na Zásilkovně.';
    else if (paymentVal === 'card') confirmPaymentInfo.textContent = 'Za chvíli vás přesměrujeme na platební bránu.';
  }

  saveCart([]);
  updateCartCount();
}

function initOptionCards() {
  document.querySelectorAll('[data-option-card]').forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    if (!radio) return;
    card.addEventListener('click', () => {
      document.querySelectorAll(`[data-option-card] input[name="${radio.name}"]`).forEach(r => {
        r.closest('[data-option-card]')?.classList.remove('selected');
      });
      card.classList.add('selected');
      if (radio.name === 'shipping') { updateGrandTotal(); updateCodVisibility(); }
    });
  });
}

// ── Init po načtení DOM ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  document.querySelector('[data-menu-open]')?.addEventListener('click', () => mobileMenu?.classList.add('open'));
  document.querySelector('[data-menu-close]')?.addEventListener('click', () => mobileMenu?.classList.remove('open'));

  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => addToCart({
      id:    btn.dataset.productId,
      name:  btn.dataset.productName,
      color: btn.dataset.productColor,
      price: btn.dataset.productPrice,
      image: btn.dataset.productImage
    }));
  });

  document.querySelector('[data-go-to-checkout]')?.addEventListener('click', () => {
    if (getCart().length === 0) return;
    showCheckout();
  });

  document.querySelector('[data-back-to-cart]')?.addEventListener('click', hideCheckout);

  document.querySelectorAll('[data-next-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.dataset.nextStep);
      if (nextStep === 2 && !validateStep1()) return;
      if (nextStep === 3 && !validateStep2()) return;
      goToStep(nextStep);
    });
  });

  document.querySelectorAll('[data-prev-step]').forEach(btn => {
    btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.prevStep)));
  });

  document.querySelector('[data-submit-order]')?.addEventListener('click', submitOrder);

  document.querySelectorAll('[data-placeholder-form]').forEach(form => {
    form.addEventListener('submit', e => { e.preventDefault(); showToast('Formulář je zatím pouze ukázkový.'); });
  });

  ['firstName','lastName','email','phone','street','city','zip'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', function() {
      this.classList.remove('error');
      this.closest('.form-group')?.classList.remove('has-error');
    });
  });

  updateCartCount();
  renderCartPage();
  initOptionCards();
});
