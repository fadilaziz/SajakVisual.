document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  if (themeToggle) {
    const icon = themeToggle.querySelector('i');

    if (localStorage.getItem('theme') === 'dark') {
      body.classList.add('dark');
      icon.classList.replace('ph-moon', 'ph-sun');
    }

    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark');
      if (body.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
        icon.classList.replace('ph-moon', 'ph-sun');
      } else {
        localStorage.setItem('theme', 'light');
        icon.classList.replace('ph-sun', 'ph-moon');
      }
    });
  }

  // Logout Logic
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch(`${BASE_URL_SAJAKVISUAL}/api/auth/logout`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          if (window.notify) window.notify.show(data.message, 'success');
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 1000);
        } else {
          if (window.notify) window.notify.show(data.message, 'error');
        }
      } catch (error) {
        if (window.notify) window.notify.show('Gagal logout', 'error');
      }
    });
  }

  // State
  let allOrders = [];

  // DOM Elements
  const tbody = document.getElementById('orders-table-body');
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  
  // Modal Elements
  const modal = document.getElementById('detail-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalBody = document.getElementById('modal-body-content');

  // Open Modal
  const openModal = (order) => {
    let statusHtml = '';
    if (order.status === 'SUCCESS') {
      statusHtml = '<span class="status-badge success">Berhasil</span>';
    } else if (order.status === 'PENDING') {
      statusHtml = '<span class="status-badge warning">Tertunda</span>';
    } else {
      statusHtml = '<span class="status-badge error">Gagal</span>';
    }

    const dateObj = new Date(order.created_at);
    const dateString = dateObj.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    modalBody.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Nomor Invoice</span>
        <span class="detail-value flex-align">
          <strong>${order.no_invoice}</strong>
          <button class="btn-copy" onclick="navigator.clipboard.writeText('${order.no_invoice}').then(() => { if(window.notify) window.notify.show('Invoice disalin', 'success'); })" title="Salin Invoice">
            <i class="ph ph-copy"></i>
          </button>
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status Pembayaran</span>
        <span class="detail-value">${statusHtml}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Nama Pelanggan</span>
        <span class="detail-value">${order.nama}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">${order.email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">No. WhatsApp</span>
        <span class="detail-value">${order.no_wa || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Tanggal Pesanan</span>
        <span class="detail-value">${dateString}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Template ID</span>
        <span class="detail-value">${order.template_id}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-label">Total Pembayaran</span>
        <span class="detail-value total">Rp ${order.jumlah_total.toLocaleString('id-ID')}</span>
      </div>
      ${(order.qris_url && order.status !== 'SUCCESS') ? `
        <div class="detail-qris-container">
          <span class="detail-label">Bukti/Gambar QRIS</span><br/>
          <a href="${order.qris_url}" target="_blank">
            <img src="${order.qris_image || order.qris_url}" alt="QRIS" class="detail-qris-img" />
          </a>
        </div>
      ` : ''}
    `;
    modal.classList.add('active');
  };

  // Close Modal
  const closeModal = () => {
    modal.classList.remove('active');
  };

  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Render Table
  const renderTable = (data) => {
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Data tidak ditemukan</td></tr>';
      return;
    }

    data.forEach((item) => {
      const tr = document.createElement('tr');

      let statusHtml = '';
      if (item.status === 'SUCCESS') {
        statusHtml = '<span class="status-badge success">Berhasil</span>';
      } else if (item.status === 'PENDING') {
        statusHtml = '<span class="status-badge warning">Tertunda</span>';
      } else {
        statusHtml = '<span class="status-badge error">Gagal</span>';
      }

      const dateObj = new Date(item.created_at);
      const dateString = dateObj.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      // For mobile data-label
      tr.innerHTML = `
        <td data-label="Invoice ID"><strong>${item.no_invoice}</strong></td>
        <td data-label="Nama Pelanggan">${item.nama}</td>
        <td data-label="Tanggal">${dateString}</td>
        <td data-label="Status">${statusHtml}</td>
        <td data-label="Total">Rp ${item.jumlah_total.toLocaleString('id-ID')}</td>
        <td class="action-th" data-label="Aksi">
          <button class="btn-detail" data-id="${item.id}">
            <i class="ph ph-eye"></i> Detail
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach Event Listeners to Detail buttons
    const detailButtons = document.querySelectorAll('.btn-detail');
    detailButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const selectedOrder = allOrders.find(o => o.id === id);
        if (selectedOrder) {
          openModal(selectedOrder);
        }
      });
    });
  };

  // Filter & Search Logic
  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const statusVal = statusFilter.value;

    const filtered = allOrders.filter(order => {
      const matchesSearch = (order.no_invoice && order.no_invoice.toLowerCase().includes(searchTerm)) ||
                            (order.nama && order.nama.toLowerCase().includes(searchTerm));
      const matchesStatus = statusVal === 'ALL' || order.status === statusVal;
      return matchesSearch && matchesStatus;
    });

    renderTable(filtered);
  };

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);

  // Fetch Orders
  const fetchOrdersData = async () => {
    try {
      // Changed to relative URL for stability across environments
      const res = await fetch(`${BASE_URL_SAJAKVISUAL}/api/orders`);
      if (!res.ok) {
        throw new Error('Gagal memuat data pesanan');
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Sesi tidak valid, harap login kembali.');
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Gagal memuat data dari API');
      }

      allOrders = json.data || [];
      // Sort newest first
      allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      renderTable(allOrders);
    } catch (error) {
      console.error('Failed to load orders data:', error);
      if (window.notify) window.notify.show(error.message || 'Gagal memuat pesanan', 'error');
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Gagal memuat data</td></tr>`;
    }
  };

  fetchOrdersData();

  // Ping to renew session admin every 15 minutes
  const keepSessionAlive = () => {
    fetch(`${BASE_URL_SAJAKVISUAL}/api/auth/ping`)
      .then((res) => {
        if (!res.ok) {
          if (window.notify) window.notify.show('Sesi Anda telah berakhir, silakan login kembali.', 'error');
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        }
      })
      .catch((err) => {
        console.error('Gagal memperpanjang sesi', err);
      });
  };

  setInterval(keepSessionAlive, 15 * 60 * 1000);
});
