document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = 'http://localhost:3000';  // URL de la API local

  const cartItemsList = document.getElementById('cart-items');
  const totalPriceElement = document.getElementById('total-price');
  const discountCodeInput = document.getElementById('discount-code');
  const discountInfo = document.getElementById('discount-info');
  const applyDiscountButton = document.getElementById('apply-discount');
  const checkoutButton = document.getElementById('checkout-button');
  const clearCartButton = document.getElementById('clear-cart');
  const cartModal = document.getElementById('cart-modal');
  const cartIcon = document.getElementById('cart-icon');
  const closeModalButton = document.getElementById('close-modal');
  const cartCount = document.getElementById('cart-count');

  // Descuento
  const DISCOUNT_CODE = 'DESCUENTO10';
  let discount = 0;

  // Función para obtener los productos desde la API
  const getProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/products`);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  // Función para obtener el carrito desde la API
  const getCart = async () => {
    try {
      const response = await fetch(`${apiUrl}/cart`);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      return [];
    }
  };

  // Función para actualizar el carrito en la API
  const updateCartInAPI = async (cart) => {
    try {
      await fetch(`${apiUrl}/cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cart),
      });
    } catch (error) {
      console.error('Error al actualizar el carrito en la API:', error);
    }
  };

  // Renderizar carrito
  const renderCart = async () => {
    const cart = await getCart();
    const products = await getProducts();
    
    cartItemsList.innerHTML = '';
    let totalPrice = 0;

    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      const li = document.createElement('li');
      li.innerHTML = `${product.name} - $${product.price} x ${item.quantity} 
        <button class="remove-item" data-id="${item.id}">Eliminar</button>
        <button class="remove-one" data-id="${item.id}">Eliminar uno</button>`;

      // Deshabilitar botón "eliminar uno" si cantidad es 1
      const removeOneButton = li.querySelector('.remove-one');
      if (item.quantity === 1) {
        removeOneButton.disabled = true;
      }

      cartItemsList.appendChild(li);
      totalPrice += product.price * item.quantity;
    });

    // Mostrar total con descuento
    totalPrice = totalPrice * (1 - discount);
    totalPriceElement.textContent = totalPrice.toFixed(2);
    cartCount.textContent = cart.length;
  };

  // Función para abrir y cerrar el modal
  const toggleModal = () => {
    cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
  };

  // Mostrar carrito 
  cartIcon.addEventListener('click', toggleModal);

  // Cerrar el modal
  closeModalButton.addEventListener('click', toggleModal);

  // agregar producto al carrito
  const addToCart = async (productId) => {
    const product = await getProducts().then(products => products.find(p => p.id === productId));
    const cart = await getCart();

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }

    await updateCartInAPI(cart);
    renderCart();
  };

  // eliminar producto del carrito
  const removeFromCart = async (productId) => {
    const cart = await getCart();
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
      cart.splice(index, 1);
      await updateCartInAPI(cart);
      renderCart();
    }
  };

  // eliminar uno de un producto
  const removeOneFromCart = async (productId) => {
    const cart = await getCart();
    const item = cart.find(i => i.id === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
      await updateCartInAPI(cart);
      renderCart();
    } else {
      await removeFromCart(productId);
    }
  };

  // vaciar el carrito
  const clearCart = async () => {
    await updateCartInAPI([]);
    renderCart();
  };

  // aplicar descuento
  const applyDiscount = () => {
    const code = discountCodeInput.value.trim().toUpperCase();
    if (code === DISCOUNT_CODE) {
      discount = 0.1;  
      discountInfo.textContent = "¡Descuento aplicado! 10% de descuento";
    } else {
      discount = 0;
      discountInfo.textContent = "Código inválido. Intenta nuevamente.";
    }
    renderCart();
  };

  // Checkout 
  const checkout = async () => {
    const total = parseFloat(totalPriceElement.textContent);
    if (total > 0) {
      alert(`¡Gracias por tu compra! Total final: $${total.toFixed(2)}`);
      await clearCart();
    } else {
      alert("Tu carrito está vacío. Agrega productos antes de realizar la compra.");
    }
  };

  // Event listeners para agregar productos al carrito
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(e.target.closest('.product').dataset.id);
      addToCart(productId);
    });
  });

  // Event listeners para eliminar productos del carrito
  cartItemsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
      const productId = parseInt(e.target.dataset.id);
      removeFromCart(productId);
    } else if (e.target.classList.contains('remove-one')) {
      const productId = parseInt(e.target.dataset.id);
      removeOneFromCart(productId);
    }
  });

  // Event listeners para aplicar el descuento
  applyDiscountButton.addEventListener('click', applyDiscount);

  // Event listener para el checkout
  checkoutButton.addEventListener('click', checkout);

  // Event listener para vaciar el carrito
  clearCartButton.addEventListener('click', clearCart);

  // Renderizar el carrito al cargar la página
  renderCart();
});
