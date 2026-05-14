import { supabase } from './supabase.js';

feather.replace();

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return alert(message); // fallback
    const icons = { success: 'check-circle', error: 'alert-circle', info: 'info', warning: 'alert-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i data-feather="${icons[type] || 'info'}" style="width:20px;height:20px;flex-shrink:0"></i><span>${message}</span>`;
    container.appendChild(toast);
    feather.replace();
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}



let locations = [];
let mockMenu = [];
let stocks = [];
let currentAdmin = null;

// Expose functions to window so they can be called from HTML onclick attributes
// Check session on load
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if(session) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
        document.getElementById('admin-section').classList.add('flex');
        loadData();
    }
});

window.login = async function() {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    
    if(!email || !pass) return alert('Email dan password harus diisi');

    const loginBtn = document.getElementById('login-btn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i data-feather="loader" class="w-5 h-5 animate-spin"></i> Memproses...';
    feather.replace();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
    });

    if (error) {
        showToast('Login gagal: ' + error.message, 'error');
        loginBtn.innerHTML = originalText;
        feather.replace();
    } else {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
        document.getElementById('admin-section').classList.add('flex');
        loadData();
    }
}

// Add Enter key support
document.getElementById('admin-pass').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        login();
    }
});

window.logout = async function() {
    await supabase.auth.signOut();
    const emailInput = document.getElementById('admin-email');
    if(emailInput) emailInput.value = '';
    document.getElementById('admin-pass').value = '';
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('admin-section').classList.remove('flex');
    document.getElementById('login-section').classList.remove('hidden');
}

async function loadData() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if(!session) return logout();

        // Get admin data mapping
        const { data: adminData, error: adminErr } = await supabase.from('admins').select('*').eq('id', session.user.id).single();
        if(adminErr || !adminData) {
            showToast('Akun ini belum di-assign ke cabang manapun.', 'error');
            return logout();
        }
        currentAdmin = adminData;

        // Fetch Stats from Transactions (Only Selesai for this location)
        const { data: trxData } = await supabase.from('transactions')
            .select('total_price')
            .eq('location_id', currentAdmin.location_id)
            .eq('status', 'Selesai');
        
        let totalTrx = trxData ? trxData.length : 0;
        let totalRevenue = trxData ? trxData.reduce((sum, trx) => sum + (trx.total_price || 0), 0) : 0;
        
        document.getElementById('total-trx').textContent = totalTrx;
        document.getElementById('total-revenue').textContent = 'Rp ' + totalRevenue.toLocaleString('id-ID');

        // Fetch Locations, Menus, Stocks for this admin's location ONLY
        const [locRes, menuRes, stockRes] = await Promise.all([
            supabase.from('locations').select('*').eq('id', currentAdmin.location_id),
            supabase.from('menus').select('*'),
            supabase.from('location_stocks').select('*').eq('location_id', currentAdmin.location_id)
        ]);
        
        locations = locRes.data || [];
        if(locations.length > 0) {
            document.getElementById('admin-loc-name').innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Lokasi: ${locations[0].name}`;
        }
        
        fetchOrders();

        locations = locRes.data || [];
        mockMenu = menuRes.data || [];
        stocks = stockRes.data || [];

        const container = document.getElementById('stock-container');
        container.innerHTML = '';

        locations.forEach(loc => {
            const locDiv = document.createElement('div');
            locDiv.className = 'bg-gray-50 rounded-2xl p-5 border border-gray-200';
            
            let html = `<div class="flex items-center gap-2 mb-4">
                            <i data-feather="map-pin" class="w-4 h-4 text-[#F15A24]"></i>
                            <h4 class="font-bold text-gray-800">${loc.name}</h4>
                        </div>
                        <div class="space-y-3">`;
            
            mockMenu.forEach(menu => {
                // Find stock entry
                const stockEntry = stocks.find(s => s.location_id === loc.id && s.menu_id === menu.id);
                const stockVal = stockEntry ? stockEntry.stock : 0;
                
                html += `
                    <div class="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                        <span class="text-sm font-medium text-gray-600 truncate mr-2">${menu.name}</span>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] uppercase font-bold text-gray-400">Stok</span>
                            <input type="number" id="stock-${loc.id}-${menu.id}" value="${stockVal}" class="w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center text-sm font-bold focus:outline-none focus:border-[#FFB000] focus:ring-1 focus:ring-[#FFB000] transition-all">
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
            locDiv.innerHTML = html;
            container.appendChild(locDiv);
        });

        renderMenuList();
        feather.replace();
    } catch (error) {
        console.error("Error loading data:", error);
        showToast('Gagal memuat data dari database.', 'error');
    }
}

window.saveStocks = async function() {
    const saveBtn = document.querySelector('button[onclick="saveStocks()"]');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i data-feather="loader" class="w-5 h-5 animate-spin"></i> Menyimpan...';
    feather.replace();

    try {
        let updates = [];
        
        locations.forEach(loc => {
            mockMenu.forEach(menu => {
                const input = document.getElementById(`stock-${loc.id}-${menu.id}`);
                if(input) {
                    const newStock = parseInt(input.value) || 0;
                    updates.push({
                        location_id: loc.id,
                        menu_id: menu.id,
                        stock: newStock
                    });
                }
            });
        });

        // Supabase upsert
        for (let update of updates) {
            // First check if it exists
            const existing = stocks.find(s => s.location_id === update.location_id && s.menu_id === update.menu_id);
            
            if (existing) {
                await supabase.from('location_stocks')
                    .update({ stock: update.stock })
                    .match({ location_id: update.location_id, menu_id: update.menu_id });
            } else {
                await supabase.from('location_stocks')
                    .insert([update]);
            }
        }
        
        showToast('Stok berhasil diperbarui! ✅', 'success');
        loadData();
    } catch (error) {
        console.error("Error saving stocks:", error);
        showToast('Gagal menyimpan stok.', 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        feather.replace();
    }
}

// --- MENU CRUD ---
window.renderMenuList = function() {
    const tbody = document.getElementById('menu-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    mockMenu.forEach(menu => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors group';
        tr.innerHTML = `
            <td class="px-4 py-4 whitespace-nowrap font-medium text-gray-900">${menu.id}</td>
            <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                    <img src="${menu.image_url || '/assets/logo-cabi.png'}" class="w-10 h-10 rounded-lg object-cover bg-gray-100" onerror="this.src='./assets/logo-cabi.png'">
                    <div>
                        <div class="font-bold text-gray-800">${menu.name}</div>
                        <div class="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">${menu.description || '-'}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap font-bold text-[#F15A24]">Rp ${menu.price.toLocaleString('id-ID')}</td>
            <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="openMenuModal(${menu.id})" class="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg mr-2 transition-colors inline-block">
                    <i data-feather="edit-2" class="w-4 h-4"></i>
                </button>
                <button onclick="deleteMenu(${menu.id})" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors inline-block">
                    <i data-feather="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.openMenuModal = function(id = null) {
    const modal = document.getElementById('menu-form-modal');
    const drawer = document.getElementById('menu-form-drawer');
    const title = document.getElementById('menu-modal-title');
    
    if (id) {
        title.textContent = "Edit Menu";
        const menu = mockMenu.find(m => m.id === id);
        if (menu) {
            document.getElementById('form-menu-id').value = menu.id;
            document.getElementById('form-menu-name').value = menu.name || '';
            document.getElementById('form-menu-price').value = menu.price || 0;
            document.getElementById('form-menu-desc').value = menu.description || '';
            document.getElementById('form-menu-longdesc').value = menu.long_description || '';
            document.getElementById('form-menu-cooking').value = menu.cooking_method || '';
            
            document.getElementById('form-menu-image-hidden').value = menu.image_url || '';
            document.getElementById('form-menu-image-file').value = '';
            
            const previewContainer = document.getElementById('current-image-preview');
            const previewImg = document.getElementById('form-image-preview-img');
            if (menu.image_url) {
                previewImg.src = menu.image_url;
                previewContainer.classList.remove('hidden');
            } else {
                previewContainer.classList.add('hidden');
            }
        }
    } else {
        title.textContent = "Tambah Menu Baru";
        document.getElementById('form-menu-id').value = '';
        document.getElementById('form-menu-name').value = '';
        document.getElementById('form-menu-price').value = '';
        document.getElementById('form-menu-desc').value = '';
        document.getElementById('form-menu-longdesc').value = '';
        document.getElementById('form-menu-cooking').value = '';
        
        document.getElementById('form-menu-image-hidden').value = '';
        document.getElementById('form-menu-image-file').value = '';
        document.getElementById('current-image-preview').classList.add('hidden');
    }
    
    modal.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        drawer.classList.remove('scale-95');
        drawer.classList.add('scale-100');
    }, 10);
}

window.closeMenuModal = function() {
    const modal = document.getElementById('menu-form-modal');
    const drawer = document.getElementById('menu-form-drawer');
    
    drawer.classList.remove('scale-100');
    drawer.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('opacity-0', 'pointer-events-none');
    }, 300);
}

window.saveMenu = async function() {
    const btn = document.getElementById('save-menu-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Menyimpan...';
    feather.replace();

    const id = document.getElementById('form-menu-id').value;
    const name = document.getElementById('form-menu-name').value.trim();
    const price = parseInt(document.getElementById('form-menu-price').value) || 0;
    const description = document.getElementById('form-menu-desc').value.trim();
    const long_description = document.getElementById('form-menu-longdesc').value.trim();
    const cooking_method = document.getElementById('form-menu-cooking').value.trim();

    if (!name || price <= 0) {
        showToast('Nama Menu dan Harga harus diisi!', 'warning');
        btn.innerHTML = originalText;
        feather.replace();
        return;
    }

    try {
        let image_url = document.getElementById('form-menu-image-hidden').value;
        const fileInput = document.getElementById('form-menu-image-file');

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `menu_${Date.now()}.${fileExt}`;
            
            btn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Mengupload...';
            feather.replace();

            const { data, error } = await supabase.storage.from('menu-images').upload(fileName, file);
            if (error) {
                console.error("Error upload:", error);
                showToast('Gagal mengupload foto. Pastikan bucket sudah ada.', 'error');
                btn.innerHTML = originalText;
                feather.replace();
                return;
            }
            
            const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(fileName);
            image_url = urlData.publicUrl;
        }

        btn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Menyimpan...';
        feather.replace();

        let newMenu = { name, price, image_url, description, long_description, cooking_method };

        
        let result;
        if (id) {
            // Update existing
            newMenu.id = parseInt(id);
            result = await supabase.from('menus').update(newMenu).match({ id: newMenu.id });
        } else {
            // Generate new ID (max id + 1)
            // Generate unique ID using timestamp to avoid conflicts with deleted rows
            newMenu.id = Date.now();
            result = await supabase.from('menus').insert([newMenu]);
        }

        if (result && result.error) {
            throw result.error;
        }

        closeMenuModal();
        showToast('Menu berhasil disimpan! 🎉', 'success');
        await loadData();
    } catch (error) {
        console.error("Error saving menu:", error);
        showToast('Gagal menyimpan menu: ' + (error.message || 'Unknown error'), 'error');
    } finally {
        btn.innerHTML = originalText;
        feather.replace();
    }
}

window.deleteMenu = async function(id) {
    if (!confirm("Yakin ingin menghapus menu ini? Semua stok terkait di setiap lokasi juga akan terhapus.")) return;

    try {
        await supabase.from('menus').delete().match({ id });
        showToast('Menu berhasil dihapus!', 'success');
        await loadData();
    } catch (error) {
        console.error("Error deleting menu:", error);
        showToast('Gagal menghapus menu.', 'error');
    }
}

window.switchTab = function(tab) {
    const stockView = document.getElementById('stock-view');
    const ordersView = document.getElementById('orders-view');
    const tabStock = document.getElementById('tab-stock');
    const tabOrders = document.getElementById('tab-orders');

    if(tab === 'stock') {
        stockView.classList.remove('hidden');
        ordersView.classList.add('hidden');
        tabStock.className = "flex-1 py-3 bg-[#F15A24] text-white font-bold rounded-2xl transition-all shadow-md shadow-[#F15A24]/20";
        tabOrders.className = "flex-1 py-3 bg-white text-gray-600 font-bold rounded-2xl border border-gray-200 transition-all hover:bg-gray-50 relative";
    } else {
        stockView.classList.add('hidden');
        ordersView.classList.remove('hidden');
        tabOrders.className = "flex-1 py-3 bg-[#F15A24] text-white font-bold rounded-2xl transition-all shadow-md shadow-[#F15A24]/20 relative";
        tabStock.className = "flex-1 py-3 bg-white text-gray-600 font-bold rounded-2xl border border-gray-200 transition-all hover:bg-gray-50";
        fetchOrders();
    }
}

window.fetchOrders = async function() {
    if(!currentAdmin) return;
    try {
        const { data: orders, error } = await supabase.from('transactions')
            .select('*')
            .eq('status', 'Pending')
            .eq('location_id', currentAdmin.location_id)
            .order('created_at', { ascending: true });
            
        if(error) throw error;
        
        const badge = document.getElementById('pending-badge');
        if(orders.length > 0) {
            badge.textContent = orders.length;
            badge.classList.remove('scale-0', 'hidden');
        } else {
            badge.classList.add('scale-0');
        }
        
        renderOrders(orders);
    } catch(err) {
        console.error(err);
    }
}

function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    if(!container) return;
    container.innerHTML = '';
    
    if(orders.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">Tidak ada pesanan tertunda.</div>';
        return;
    }
    
    orders.forEach(order => {
        let itemsHtml = '';
        if(order.items) {
            Object.keys(order.items).forEach(menuId => {
                const qty = order.items[menuId];
                const menu = mockMenu.find(m => m.id == menuId);
                if(menu) {
                    itemsHtml += `<div class="text-sm text-gray-700 font-bold">- ${qty}x ${menu.name}</div>`;
                }
            });
        } else {
            itemsHtml = `<div class="text-sm text-gray-400 italic">Detail tidak tersedia</div>`;
        }

        const locName = locations.find(l => l.id === order.location_id)?.name || order.location_id;
        
        const card = document.createElement('div');
        card.className = "p-5 rounded-2xl border border-gray-200 bg-white flex flex-col md:flex-row justify-between gap-4 shadow-sm hover:shadow-md transition-shadow";
        card.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-3">
                    <span class="bg-[#F15A24]/10 text-[#F15A24] px-2 py-0.5 rounded-md text-xs font-black tracking-wider">${order.order_id || 'UNKNOWN'}</span>
                    <span class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-xs font-bold"><i data-feather="clock" class="w-3 h-3 inline pb-0.5"></i> ${order.pickup_time}</span>
                </div>
                <h4 class="font-black text-gray-800 text-lg mb-1">${order.customer_name}</h4>
                <p class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider"><i data-feather="map-pin" class="w-3 h-3 inline pb-0.5"></i> ${locName}</p>
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-3">
                    ${itemsHtml}
                </div>
                <p class="font-black text-[#F15A24] text-lg">Rp ${order.total_price.toLocaleString('id-ID')}</p>
            </div>
            <div class="flex flex-col gap-3 justify-center min-w-[160px] md:border-l md:border-gray-100 md:pl-5">
                <button onclick="confirmOrder('${order.id}')" class="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2 text-sm"><i data-feather="check-circle" class="w-4 h-4"></i> Terima Pesanan</button>
                <button onclick="rejectOrder('${order.id}')" class="w-full bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"><i data-feather="x-circle" class="w-4 h-4"></i> Tolak Pesanan</button>
            </div>
        `;
        container.appendChild(card);
    });
    feather.replace();
}

window.confirmOrder = async function(id) {
    if(!confirm("Yakin ingin menerima pesanan ini? Stok akan otomatis dikurangi.")) return;
    
    // Find and disable the button
    const btn = document.querySelector(`button[onclick="confirmOrder('${id}')"]`);
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Memproses...';
        btn.disabled = true;
        feather.replace();
    }

    try {
        const { data: order } = await supabase.from('transactions').select('*').eq('id', id).single();
        if(!order) return;
        
        // Deduct stock logic
        if(order.items) {
            for(let menuId of Object.keys(order.items)) {
                const qty = order.items[menuId];
                
                const { data: stockData } = await supabase.from('location_stocks')
                    .select('stock')
                    .match({ location_id: order.location_id, menu_id: menuId })
                    .single();
                    
                if(stockData) {
                    const newStock = Math.max(0, stockData.stock - qty);
                    await supabase.from('location_stocks')
                        .update({ stock: newStock })
                        .match({ location_id: order.location_id, menu_id: menuId });
                }
            }
        }
        
        // Update transaction status
        await supabase.from('transactions').update({ status: 'Selesai' }).eq('id', id);
        
        showToast('Pesanan dikonfirmasi & stok dikurangi! ✅', 'success');
        fetchOrders();
        loadData();
    } catch(err) {
        console.error(err);
        showToast('Gagal mengkonfirmasi pesanan.', 'error');
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            feather.replace();
        }
    }
}

window.rejectOrder = async function(id) {
    if(!confirm("Yakin ingin menolak pesanan ini?")) return;
    
    const btn = document.querySelector(`button[onclick="rejectOrder('${id}')"]`);
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Menolak...';
        btn.disabled = true;
        feather.replace();
    }

    try {
        await supabase.from('transactions').update({ status: 'Ditolak' }).eq('id', id);
        showToast('Pesanan telah ditolak.', 'info');
        fetchOrders();
    } catch(err) {
        console.error(err);
        showToast('Gagal menolak pesanan.', 'error');
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            feather.replace();
        }
    }
}
