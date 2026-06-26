document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  if (themeToggle) {
    const icon = themeToggle.querySelector('i');

    // Check Local Storage for theme preference
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

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${BASE_URL_SAJAKVISUAL}/api/orders`);
      if (!res.ok) {
        throw new Error('Gagal memuat data');
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Sesi tidak valid, harap login kembali.');
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Gagal memuat data dari API');
      }

      const orders = json.data || [];

      let totalRevenue = 0;
      let totalBuyers = orders.length;
      let totalSuccess = 0;

      orders.forEach((item) => {
        if (item.status === 'SUCCESS') {
          totalRevenue += item.jumlah_total;
          totalSuccess++;
        }
      });

      // Animate Numbers
      animateValue('total-revenue', 0, totalRevenue, 1500, true);
      animateValue('total-buyers', 0, totalBuyers, 1500);
      animateValue('total-success', 0, totalSuccess, 1500);

      // Populate Table
      const tbody = document.getElementById('history-table-body');
      tbody.innerHTML = ''; // clear loading state

      const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      if (sortedOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Belum ada transaksi</td></tr>';
        return;
      }

      sortedOrders.forEach((item) => {
        const tr = document.createElement('tr');

        let statusHtml = '';
        if (item.status === 'SUCCESS') {
          statusHtml = '<span class="status-badge success">Berhasil</span>';
        } else if (item.status === 'PENDING') {
          statusHtml = '<span class="status-badge warning">Tertunda</span>';
        } else {
          statusHtml = '<span class="status-badge error">Batal</span>';
        }

        const dateObj = new Date(item.created_at);
        const dateString = dateObj.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        tr.innerHTML = `
          <td><strong>${item.no_invoice}</strong></td>
          <td>${item.nama}</td>
          <td>${dateString}</td>
          <td>${statusHtml}</td>
          <td>Rp ${item.jumlah_total.toLocaleString('id-ID')}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (window.notify)
        window.notify.show(error.message || 'Gagal memuat data dashboard', 'error');
      document.getElementById('history-table-body').innerHTML = `
        <tr><td colspan="5" class="empty-state">Gagal memuat data</td></tr>
      `;
    }
  };

  //Logout
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch(`${BASE_URL_SAJAKVISUAL}/api/auth/logout`, {
          method: 'POST',
        });
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
        console.error('Failed to logout:', error);
        if (window.notify) window.notify.show('Gagal logout', 'error');
      }
    });
  }

  fetchDashboardData();
});

// Helper to animate numbers
function animateValue(id, start, end, duration, isCurrency = false) {
  const obj = document.getElementById(id);
  if (!obj) return;

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    // easeOutQuart
    const easeProgress = 1 - Math.pow(1 - progress, 4);

    let current = Math.floor(easeProgress * (end - start) + start);

    if (isCurrency) {
      obj.innerHTML = 'Rp ' + current.toLocaleString('id-ID');
    } else {
      obj.innerHTML = current;
    }

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

//Ping to renew session admin every 15 minutes
const keepSessionAlive = () => {
  fetch(`${BASE_URL_SAJAKVISUAL}/api/auth/ping`)
    .then((res) => {
      if (!res.ok) {
        if (window.notify) {
          window.notify.show('Sesi Anda telah berakhir, silakan login kembali.', 'error');
        }
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      }
    })
    .catch((err) => {
      console.error('Gagal memperpanjang sesi', err);
      if (window.notify) window.notify.show('Koneksi terputus. Gagal memperpanjang sesi.', 'error');
    });
};

setInterval(keepSessionAlive, 15 * 60 * 1000);
