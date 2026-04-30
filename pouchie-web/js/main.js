const mobileMenu = document.querySelector('[data-mobile-menu]');
const openMenuButton = document.querySelector('[data-menu-open]');
const closeMenuButton = document.querySelector('[data-menu-close]');
const toast = document.querySelector('[data-toast]');
const cartCountElements = document.querySelectorAll('[data-cart-count]');

let cartCount = Number(localStorage.getItem('pouchieCartCount') || 0);

function updateCartCount() {
  cartCountElements.forEach((el) => {
    el.textContent = String(cartCount);
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

openMenuButton?.addEventListener('click', () => {
  mobileMenu?.classList.add('open');
});

closeMenuButton?.addEventListener('click', () => {
  mobileMenu?.classList.remove('open');
});

document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
  button.addEventListener('click', () => {
    cartCount += 1;
    localStorage.setItem('pouchieCartCount', String(cartCount));
    updateCartCount();
    showToast('Produkt byl přidán do košíku. Košík je zatím pouze ukázkový.');
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