import { supabase } from './supabase.js';
import imgTehManis from './assets/cabi-teh-manis.png';
import imgAirMineral from './assets/cabi-air-mineral.png';
import imgMenuFrozen from './assets/menu-frozen.jpeg';

const imgMap = {
  '/assets/Cabi + Teh Manis.png': imgTehManis,
  '/assets/Cabi + Air Mineral.png': imgAirMineral,
  '/assets/Menu Frozen.jpeg': imgMenuFrozen
};

// Initialize Feather icons
feather.replace();

let locations = [];
let mockMenu = [];
let currentLocation = null;
let cart = {}; // { itemId: quantity }
let deliveryMode = 'pickup'; // 'pickup' or 'delivery'

async function initData() {
  // Fetch Locations
  const { data: locs } = await supabase.from('locations').select('*');
  if (locs) locations = locs.map(l => ({...l, desc: l.description, stocks: {}}));

  // Fetch Menus
  const { data: menus } = await supabase.from('menus').select('*');
  if (menus) {
    mockMenu = menus.map(m => ({
      ...m,
      longDescription: m.long_description,
      cookingMethod: m.cooking_method,
      image: imgMap[m.image_url] || m.image_url
    }));
  }

  // Fetch Stocks
  const { data: stocks } = await supabase.from('location_stocks').select('*');
  if (stocks) {
    stocks.forEach(s => {
      const loc = locations.find(l => l.id === s.location_id);
      if (loc) {
        loc.stocks[s.menu_id] = s.stock;
      }
    });
  }

  renderWelcomeLocations();
}

// Start app
initData();



// Elements
const menuContainer = document.getElementById('menu-container');
const cartBar = document.getElementById('cart-bar');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const locModal = document.getElementById('location-modal');
const locDrawer = document.getElementById('location-drawer');
const locContainer = document.getElementById('locations-container');
const locText = document.getElementById('current-location-text');
const bannerText = document.getElementById('banner-text');

// Welcome Overlay Logic
function renderWelcomeLocations() {
  const container = document.getElementById('welcome-locations-container');
  if(!container) return;
  container.innerHTML = '';
  locations.forEach(loc => {
    const btn = document.createElement('button');
    btn.className = `flex justify-between items-center p-4 rounded-2xl border border-gray-100 hover:border-primary transition-all text-left w-full bg-white hover:shadow-md mb-3`;
    btn.onclick = () => {
      document.getElementById('welcome-overlay').classList.add('-translate-y-full');
      selectLocation(loc.id);
    };

    btn.innerHTML = `
      <div class="flex-shrink-0 mr-4 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EA4335" class="w-8 h-8 drop-shadow-md">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <div class="flex flex-col w-full pr-2">
        <div class="flex justify-between items-center mb-1">
          <span class="font-bold text-gray-800 text-lg">${loc.name}</span>
          <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">${loc.distance}</span>
        </div>
        <span class="text-xs text-gray-600 font-medium mb-2">${loc.desc}</span>
        <div class="flex items-start gap-1.5 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <i data-feather="info" class="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500"></i>
          <span>${loc.guidance}</span>
        </div>
      </div>
      <div class="flex-shrink-0 ml-2">
        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><i data-feather="arrow-right" class="w-4 h-4"></i></div>
      </div>
    `;
    container.appendChild(btn);
  });
  feather.replace();
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;  
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
}

window.sortByNearest = function() {
    if(!navigator.geolocation) {
        return alert("Browser kamu tidak mendukung fitur GPS.");
    }
    
    const btn = document.getElementById('btn-sort-gps');
    if(!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-feather="loader" class="w-4 h-4 text-primary animate-spin"></i> Mencari lokasimu...';
    feather.replace();
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            
            locations.forEach(loc => {
                if(loc.latitude && loc.longitude) {
                    const distKm = calculateDistance(userLat, userLon, loc.latitude, loc.longitude);
                    loc.calculatedDistance = distKm;
                    loc.distance = distKm < 1 ? Math.round(distKm * 1000) + ' meter' : distKm.toFixed(1) + ' km';
                } else {
                    loc.calculatedDistance = 999;
                }
            });
            
            locations.sort((a, b) => (a.calculatedDistance || 999) - (b.calculatedDistance || 999));
            
            renderWelcomeLocations();
            renderLocations();
            
            const newBtn = document.getElementById('btn-sort-gps');
            if(newBtn) {
                newBtn.innerHTML = '<i data-feather="check" class="w-4 h-4 text-green-500"></i> Berhasil diurutkan!';
                newBtn.classList.replace('text-gray-700', 'text-green-600');
                feather.replace();
            }
        },
        (error) => {
            console.error(error);
            alert("Gagal mendapatkan lokasi. Pastikan kamu memberi izin GPS.");
            btn.innerHTML = originalText;
            feather.replace();
        }
    );
}

// Modal Logic
window.toggleLocationModal = function () {
  const isOpen = !locModal.classList.contains('pointer-events-none');
  if (isOpen) {
    locDrawer.classList.add('translate-y-full');
    locModal.classList.remove('opacity-100');
    setTimeout(() => {
      locModal.classList.add('pointer-events-none', 'opacity-0');
    }, 300);
  } else {
    renderLocations();
    locModal.classList.remove('pointer-events-none', 'opacity-0');
    locModal.classList.add('opacity-100');
    setTimeout(() => {
      locDrawer.classList.remove('translate-y-full');
    }, 10);
  }
}

window.selectLocation = function (locId) {
  currentLocation = locations.find(l => l.id === locId);
  locText.textContent = currentLocation.name;
  bannerText.textContent = `Stok di ${currentLocation.name} sangat terbatas siang ini.`;

  // Persist selected location
  localStorage.setItem('cabi_selected_location', String(locId));
  
  if(!locModal.classList.contains('pointer-events-none')) {
    toggleLocationModal();
  }

  // Reset cart when location changes because stock limits are different
  cart = {};
  updateCartUI();
  renderMenu();
}

function renderLocations() {
  locContainer.innerHTML = '';
  locations.forEach(loc => {
    const isSelected = currentLocation && loc.id === currentLocation.id;
    const btn = document.createElement('button');
    btn.className = `flex justify-between items-center p-4 rounded-2xl border transition-all text-left w-full ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`;
    btn.onclick = () => selectLocation(loc.id);

    btn.innerHTML = `
      <div class="flex-shrink-0 mr-4 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EA4335" class="w-8 h-8 drop-shadow-md ${!isSelected ? 'opacity-50 grayscale' : ''}">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <div class="flex flex-col w-full pr-2">
        <div class="flex justify-between items-center mb-1">
          <span class="font-bold text-gray-800 text-lg">${loc.name}</span>
          <span class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">${loc.distance}</span>
        </div>
        <span class="text-xs text-gray-600 font-medium mb-2">${loc.desc}</span>
        <div class="flex items-start gap-1.5 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <i data-feather="info" class="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500"></i>
          <span>${loc.guidance}</span>
        </div>
      </div>
      <div class="flex-shrink-0 ml-2">
        ${isSelected ? '<i data-feather="check-circle" class="w-6 h-6 text-green-500"></i>' : '<div class="w-6 h-6 rounded-full border-2 border-gray-200"></div>'}
      </div>
    `;
    locContainer.appendChild(btn);
  });
  feather.replace();
}

// Menu Detail Modal
const menuModal = document.getElementById('menu-modal');
const menuDrawer = document.getElementById('menu-drawer');
window.toggleMenuModal = function() {
  const isOpen = !menuModal.classList.contains('pointer-events-none');
  if (isOpen) {
    menuDrawer.classList.add('translate-y-full');
    menuModal.classList.remove('opacity-100');
    setTimeout(() => {
      menuModal.classList.add('pointer-events-none', 'opacity-0');
    }, 300);
  } else {
    menuModal.classList.remove('pointer-events-none', 'opacity-0');
    menuModal.classList.add('opacity-100');
    setTimeout(() => {
      menuDrawer.classList.remove('translate-y-full');
    }, 10);
  }
}

window.openMenuDetail = function(id) {
  const item = mockMenu.find(m => m.id === id);
  if(!item) return;

  document.getElementById('detail-name').textContent = item.name;
  document.getElementById('detail-price').textContent = 'Rp ' + item.price.toLocaleString('id-ID');
  document.getElementById('detail-image').src = item.image || './assets/menu-frozen.jpeg';
  document.getElementById('detail-longdesc').textContent = item.longDescription || item.description || 'Tidak ada deskripsi rinci.';
  document.getElementById('detail-cooking').textContent = item.cookingMethod || 'Bisa langsung dinikmati atau hangatkan sesuai selera.';
  
  toggleMenuModal();
}

// Render Menu
function renderMenu() {
  menuContainer.innerHTML = '';

  mockMenu.forEach(item => {
    const itemStock = currentLocation.stocks[item.id] || 0;
    const qtyInCart = cart[item.id] || 0;
    const remainingStock = itemStock - qtyInCart;
    const isSoldOut = itemStock === 0;

    // Determine Stock Badge UI
    let stockBadgeHTML = '';
    if (isSoldOut) {
      stockBadgeHTML = `<span class="mt-2 inline-block px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full border border-red-200">Stok Habis di Sini</span>`;
    } else if (itemStock <= 5) {
      stockBadgeHTML = `<span class="mt-2 inline-block px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full border border-orange-200 flex items-center gap-1 w-fit"><i data-feather="flame" class="w-3 h-3"></i> Sisa ${itemStock} porsi!</span>`;
    } else {
      stockBadgeHTML = `<span class="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full border border-green-200">Stok Tersedia</span>`;
    }

    // Create card
    const card = document.createElement('div');
    card.className = `bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md ${isSoldOut ? 'opacity-60 grayscale-[50%]' : ''}`;

    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" onclick="openMenuDetail(${item.id})" class="w-24 h-24 object-cover rounded-xl bg-gray-50 flex-shrink-0 border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
      <div class="flex flex-col justify-between flex-grow">
        <div>
          <div class="flex justify-between items-start">
            <h4 onclick="openMenuDetail(${item.id})" class="font-bold text-gray-800 text-sm leading-tight cursor-pointer hover:text-primary transition-colors">${item.name}</h4>
          </div>
          <p class="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">${item.description}</p>
          ${stockBadgeHTML}
        </div>
        <div class="flex justify-between items-center mt-3">
          <span class="font-extrabold text-primary text-sm">Rp ${item.price.toLocaleString('id-ID')}</span>
          <div class="flex items-center gap-2">
            ${qtyInCart > 0 ? `
              <button onclick="updateCart(${item.id}, -1)" class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-90 transition-all">
                <i data-feather="minus" class="w-3 h-3"></i>
              </button>
              <span class="text-sm font-bold w-4 text-center">${qtyInCart}</span>
            ` : ''}
            
            ${isSoldOut ? `
              <button disabled class="px-3 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-xs cursor-not-allowed">
                Habis
              </button>
            ` : `
              <button onclick="updateCart(${item.id}, 1)" ${remainingStock <= 0 ? 'disabled' : ''} class="w-8 h-8 ${remainingStock <= 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-orange-600 shadow-sm shadow-orange-500/30'} rounded-full flex items-center justify-center text-white active:scale-90 transition-all">
                <i data-feather="plus" class="w-4 h-4"></i>
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    menuContainer.appendChild(card);
  });

  feather.replace(); // Re-render icons in newly added HTML
}

// Update Cart Logic
window.updateCart = function (itemId, change) {
  const itemStock = currentLocation.stocks[itemId] || 0;

  const currentQty = cart[itemId] || 0;
  const newQty = currentQty + change;

  // Validate limits (Cannot exceed stock, cannot go below 0)
  if (newQty > itemStock) return;
  if (newQty < 0) return;

  cart[itemId] = newQty;

  if (cart[itemId] === 0) {
    delete cart[itemId];
  }

  renderMenu();
  updateCartUI();
};

function updateCartUI() {
  let totalItems = 0;
  let totalPrice = 0;

  Object.keys(cart).forEach(id => {
    const item = mockMenu.find(m => m.id == id);
    if (item) {
      totalItems += cart[id];
      totalPrice += cart[id] * item.price;
    }
  });

  // Update badge
  if (totalItems > 0) {
    cartCount.textContent = totalItems;
    cartCount.classList.remove('scale-0');
    cartCount.classList.add('scale-100');
    
    // Animate cart icon
    const cartIcon = document.getElementById('cart-icon-container');
    if (cartIcon) {
      cartIcon.classList.remove('animate-cart-bump');
      void cartIcon.offsetWidth; // trigger reflow
      cartIcon.classList.add('animate-cart-bump');
    }

    // Show cart bar
    cartBar.classList.remove('translate-y-full');
  } else {
    cartCount.classList.remove('scale-100');
    cartCount.classList.add('scale-0');

    // Hide cart bar
    cartBar.classList.add('translate-y-full');
  }

  // Update total price
  cartTotal.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
}

// Initial render moved to initData()


// Checkout Logic
const checkoutModal = document.getElementById('checkout-modal');
const checkoutDrawer = document.getElementById('checkout-drawer');
const checkoutLocText = document.getElementById('checkout-loc-text');
const checkoutTotalText = document.getElementById('checkout-total-text');
const checkoutName = document.getElementById('checkout-name');
const checkoutTime = document.getElementById('checkout-time');

window.toggleCheckoutModal = function () {
  const isOpen = !checkoutModal.classList.contains('pointer-events-none');

  if (isOpen) {
    checkoutDrawer.classList.add('translate-y-full');
    checkoutModal.classList.remove('opacity-100');
    setTimeout(() => {
      checkoutModal.classList.add('pointer-events-none', 'opacity-0');
    }, 300);
  } else {
    // Populate Data
    let totalPrice = 0;
    Object.keys(cart).forEach(id => {
      const item = mockMenu.find(m => m.id == id);
      if (item) totalPrice += cart[id] * item.price;
    });

    checkoutLocText.textContent = currentLocation.name;
    checkoutTotalText.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;

    checkoutModal.classList.remove('pointer-events-none', 'opacity-0');
    checkoutModal.classList.add('opacity-100');
    setTimeout(() => {
      checkoutDrawer.classList.remove('translate-y-full');
    }, 10);
  }
};

// Delivery Mode Toggle
window.setDeliveryMode = function(mode) {
  deliveryMode = mode;
  const btnPickup = document.getElementById('btn-pickup');
  const btnDelivery = document.getElementById('btn-delivery');
  const addressWrap = document.getElementById('delivery-address-wrap');
  const timeWrap = document.getElementById('pickup-time-wrap');

  if (mode === 'delivery') {
    btnDelivery.className = 'flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-2 border-primary bg-primary/10 text-primary';
    btnPickup.className = 'flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-2 border-gray-200 bg-white text-gray-500';
    addressWrap.classList.remove('hidden');
    timeWrap.classList.add('hidden');
  } else {
    btnPickup.className = 'flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-2 border-primary bg-primary/10 text-primary';
    btnDelivery.className = 'flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-2 border-gray-200 bg-white text-gray-500';
    addressWrap.classList.add('hidden');
    timeWrap.classList.remove('hidden');
  }
  feather.replace();
};

let currentWaUrl = '';

window.processCheckout = async function () {
  const name = checkoutName.value.trim() || 'Teman Cabi';
  const pickupTime = checkoutTime.value || 'Secepatnya';

  // Format WA Message & Calculate Total
  let orderDetails = '';
  let totalPrice = 0;
  
  Object.keys(cart).forEach(id => {
    const item = mockMenu.find(m => m.id == id);
    if (item) {
      orderDetails += `- ${cart[id]}x ${item.name} (Rp ${(cart[id] * item.price).toLocaleString('id-ID')})%0A`;
      totalPrice += cart[id] * item.price;
    }
  });

  // Show loading indicator
  const checkoutBtn = document.querySelector('#checkout-drawer button[onclick="processCheckout()"]');
  const originalBtnContent = checkoutBtn.innerHTML;
  checkoutBtn.innerHTML = '<i data-feather="loader" class="w-5 h-5 mr-2 animate-spin"></i> Memproses...';
  checkoutBtn.disabled = true;
  feather.replace();

  try {
    const orderId = 'CAB-' + Math.floor(1000 + Math.random() * 9000);

    // Save transaction to Supabase (STATUS: PENDING, STOCK NOT DEDUCTED YET)
    const { error } = await supabase.from('transactions').insert([{
      order_id: orderId,
      location_id: currentLocation.id,
      customer_name: name,
      total_price: totalPrice,
      pickup_time: pickupTime,
      status: 'Pending',
      items: cart
    }]);

    if(error) throw error;

    const text = deliveryMode === 'delivery'
      ? `Halo Admin Cabi! 👋%0A%0ASaya *${name}* mau pesan *DELIVERY* dari *${currentLocation.name}*.%0A*Order ID:* ${orderId}%0A*Alamat:* ${(document.getElementById('checkout-address')?.value?.trim()) || 'Belum diisi'}%0A%0A*Pesanan:*%0A${orderDetails}%0A*Total: Rp ${totalPrice.toLocaleString('id-ID')}*%0A%0ABerikut saya lampirkan bukti transfernya. Terima kasih!`
      : `Halo Admin Cabi! 👋%0A%0ASaya *${name}* mau ambil pesanan di *${currentLocation.name}*.%0A*Order ID:* ${orderId}%0A*Waktu Pengambilan:* ${pickupTime}%0A%0A*Pesanan:*%0A${orderDetails}%0A*Total: Rp ${totalPrice.toLocaleString('id-ID')}*%0A%0ABerikut saya lampirkan bukti transfernya. Terima kasih!`;
    currentWaUrl = `https://wa.me/${currentLocation.phone}?text=${text}`;

    // Close Checkout Modal
    toggleCheckoutModal();
    
    // Open Success Modal
    document.getElementById('success-order-id').textContent = orderId;
    document.getElementById('success-total').textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;

    const modal = document.getElementById('success-modal');
    const drawer = document.getElementById('success-drawer');
    modal.classList.remove('pointer-events-none', 'opacity-0');
    modal.classList.add('opacity-100');
    setTimeout(() => {
      drawer.classList.remove('translate-y-full');
    }, 10);

    // Reset Cart locally
    cart = {};
    updateCartUI();
    renderMenu();
    checkoutName.value = '';
    deliveryMode = 'pickup';
    const addrField = document.getElementById('checkout-address');
    if (addrField) addrField.value = '';
    
    // Simpan Nama Panggilan di localStorage biar order berikutnya otomatis keisi
    localStorage.setItem('cabi_customer_name', name);
  } catch (error) {
    console.error("Error checkout:", error);
    alert("Gagal memproses pesanan. Pastikan tabel transactions sudah memiliki kolom order_id dan status.");
  } finally {
    checkoutBtn.innerHTML = originalBtnContent;
    checkoutBtn.disabled = false;
    feather.replace();
  }
};

window.sendWA = function() {
  window.open(currentWaUrl, '_blank');
};

window.closeSuccessModal = function() {
  const modal = document.getElementById('success-modal');
  const drawer = document.getElementById('success-drawer');
  drawer.classList.add('translate-y-full');
  modal.classList.remove('opacity-100');
  setTimeout(() => {
    modal.classList.add('pointer-events-none', 'opacity-0');
  }, 300);
  
  // Tetap di lokasi yang sama (nggak balik ke welcome)
  // User bisa ganti lokasi manual lewat tombol lokasi
};

// Coba auto-fill nama panggilan
document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('cabi_customer_name');
    if(savedName) checkoutName.value = savedName;
});

// Auto-refresh stok saat tab kembali aktif (read-only, aman)
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && currentLocation) {
        try {
            const { data: freshStocks } = await supabase.from('location_stocks').select('*');
            if (freshStocks) {
                locations.forEach(loc => loc.stocks = {});
                freshStocks.forEach(s => {
                    const loc = locations.find(l => l.id === s.location_id);
                    if (loc) loc.stocks[s.menu_id] = s.stock;
                });
                renderMenu(); // Re-render dengan stok terbaru
            }
        } catch(e) {
            console.log('Silent refresh failed:', e);
        }
    }
});
