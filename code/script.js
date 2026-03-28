/* JS: script.js
   Implements product rendering, cart functionality, event handlers, and form validation.
*/

/*product catalog*/
const PRODUCTS = [
  {id: 'p1', title: 'Nebula Tee', price: 24.99, img: 'Assets/tee4.JPEG', desc: 'Vibrant nebula print on soft cotton.'},
  {id: 'p2', title: 'Minimal Lines', price: 19.99, img: 'Assets/tee3.JPEG', desc: 'Clean geometric design.'},
  {id: 'p3', title: 'Island Vibes', price: 27.50, img: 'Assets/tee2.JPEG', desc: 'Locally inspired tropical print.'},
  {id: 'p4', title: 'Retro Badge', price: 22.00, img: 'Assets/tee1.JPEG', desc: 'Vintage badge style graphic.'}
];

/* Utility: get cart from localStorage (JS: DOM & Data handling) */
function getCart(){
  const raw = localStorage.getItem('iw_cart');
  return raw ? JSON.parse(raw) : {};
}

/* Utility: save cart to localStorage */
function saveCart(cart){
  localStorage.setItem('iw_cart', JSON.stringify(cart));
}

/* IA2 Function: addToCart
   Purpose: add product to cart or increment quantity.
   Creator: Student
*/
function addToCart(productId, qty = 1, size = 'M'){
  const cart = getCart();
  if(cart[productId]) cart[productId].qty += qty;
  else {
    const prod = PRODUCTS.find(p => p.id === productId);
    // NOTE: size is stored, but cart quantities are still keyed only by productId
    cart[productId] = {id: prod.id, title: prod.title, price: prod.price, qty, size};
  }
  saveCart(cart);
  updateCartCount();
}

/* IA2 Function: removeFromCart
   Purpose: remove a product entry from cart.
*/
function removeFromCart(productId){
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
  updateCartCount();
}

/* IA2 Function: clearCart */
function clearCart(){
  localStorage.removeItem('iw_cart');
  updateCartCount();
}

/* IA2 Function: calculateCartTotals
   Purpose: compute subtotal, discount, tax and total.
   Rules for demo:
     - Discount: 10% if subtotal >= $50
     - Tax: 8% on (subtotal - discount)
*/
function calculateCartTotals(){
  const cart = getCart();
  let subtotal = 0;
  Object.values(cart).forEach(item => subtotal += item.price * item.qty);
  const discount = subtotal >= 50 ? +(subtotal * 0.10).toFixed(2) : 0;
  const taxedBase = subtotal - discount;
  const tax = +(taxedBase * 0.08).toFixed(2);
  const total = +(taxedBase + tax).toFixed(2);
  return {subtotal: +subtotal.toFixed(2), discount, tax, total};
}

/* IA2 Function: updateCartCount - update cart count in header */
function updateCartCount(){
  const cart = getCart();
  let count = 0;
  Object.values(cart).forEach(i => count += i.qty);
  const nodes = document.querySelectorAll('#cart-count');
  nodes.forEach(n => n.textContent = count);
}

/* IA2 - DOM: renderProducts - show product cards on index.html */
function renderProducts(){
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="title">${p.title}</div>
      <div class="small">${p.desc}</div>
      <div class="price">$${p.price.toFixed(2)}</div>
      <div style="margin-top:auto;display:flex;gap:0.5rem">
        <button class="btn add-btn" data-id="${p.id}">Add to cart</button>
        <a class="btn btn--ghost" href="code/product.html?id=${p.id}">View</a>
      </div>
    `;
    grid.appendChild(card);
  });

  // IA2 - JS: Event Delegation for add buttons
  grid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      addToCart(id, 1);
      // feedback
      btn.textContent = 'Added';
      setTimeout(()=> btn.textContent = 'Add to cart', 900);
    });
  });
}

/* IA2 - DOM: renderProductDetail - on product.html */
function renderProductDetail(){
  const container = document.getElementById('product-detail');
  if(!container) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || 'p1';
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];

  container.innerHTML = `
    <img src="${p.img}" alt="${p.title}">
    <div>
      <h2>${p.title}</h2>
      <p class="small">${p.desc}</p>
      <div class="price">$${p.price.toFixed(2)}</div>

      <div style="margin-top:0.5rem">
        <label>
          Size:
          <select id="prod-size" style="padding:0.4rem;margin-left:0.5rem">
            <option value="S">Small (S)</option>
            <option value="M" selected>Medium (M)</option>
            <option value="L">Large (L)</option>
          </select>
        </label>

        <div style="margin-top:0.5rem">
          <label>
            Quantity:
            <input id="prod-qty" type="number" min="1" value="1" style="width:70px;padding:0.4rem;margin-left:0.5rem">
          </label>
        </div>
      </div>

      <div style="margin-top:0.75rem">
        <button id="add-to-cart-btn" class="btn btn--accent">Add to cart</button>
      </div>
    </div>
  `;

  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const qty = parseInt(document.getElementById('prod-qty').value) || 1;
    const size = document.getElementById('prod-size').value;
    addToCart(p.id, qty, size);
    alert('Added to cart.');
  });
}

/* IA2 - DOM: renderCart - builds cart table on cart.html */
function renderCart(){
  const area = document.getElementById('cart-area');
  if(!area) return;
  const cart = getCart();
  if(Object.keys(cart).length === 0){
    area.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  let html = `<table class="table"><thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Sub-total</th><th></th></tr></thead><tbody>`;
  Object.values(cart).forEach(item => {
    const sizeText = item.size ? ` (${item.size})` : '';
    html += `<tr data-id="${item.id}">
      <td>${item.title}${sizeText}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td><input class="qty-input" type="number" min="1" value="${item.qty}" style="width:70px;padding:0.25rem"></td>
      <td>$${(item.price * item.qty).toFixed(2)}</td>
      <td><button class="btn btn--ghost remove-btn">Remove</button></td>
    </tr>`;
  });
  html += `</tbody></table>`;

  const totals = calculateCartTotals();
  html += `<div style="margin-top:1rem;text-align:right">
    <div>Subtotal: $${totals.subtotal.toFixed(2)}</div>
    <div>Discount: $${totals.discount.toFixed(2)}</div>
    <div>Tax: $${totals.tax.toFixed(2)}</div>
    <div style="font-weight:700">Total: $${totals.total.toFixed(2)}</div>
  </div>`;

  area.innerHTML = html;

  // Event listeners: quantity change
  area.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const tr = e.target.closest('tr');
      const id = tr.dataset.id;
      let val = parseInt(e.target.value);
      if(isNaN(val) || val < 1){ val = 1; e.target.value = 1; }
      const cart = getCart();
      cart[id].qty = val;
      saveCart(cart);
      renderCart();
      updateCartCount();
    });
  });

  // Remove buttons
  area.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      const id = tr.dataset.id;
      removeFromCart(id);
      renderCart();
    });
  });
}

/* IA2 - DOM: renderCheckoutSummary - summary in checkout page */
function renderCheckoutSummary(){
  const el = document.getElementById('summary');
  if(!el) return;
  const totals = calculateCartTotals();
  let html = '<h3>Order Summary</h3>';
  const cart = getCart();
  if(Object.keys(cart).length === 0){
    html += '<p>Your cart is empty.</p>';
  } else {
    html += '<ul>';
    Object.values(cart).forEach(i => {
      const sizeText = i.size ? ` (${i.size})` : '';
      html += `<li>${i.title}${sizeText} x ${i.qty} — $${(i.price * i.qty).toFixed(2)}</li>`;
    });
    html += `</ul><div class="small">Subtotal: $${totals.subtotal.toFixed(2)}</div><div class="small">Discount: $${totals.discount.toFixed(2)}</div><div class="small">Tax: $${totals.tax.toFixed(2)}</div><div style="font-weight:700">Total: $${totals.total.toFixed(2)}</div>`;
    // Pre-fill amount field
    const amtInput = document.getElementById('ship-amount');
    if(amtInput) amtInput.value = totals.total.toFixed(2);
  }
  el.innerHTML = html;
}

/* IA2 - Utility: populate cart count on initial load on any page */
document.addEventListener('DOMContentLoaded', updateCartCount);