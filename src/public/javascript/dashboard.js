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

  // Fetch Dashboard Data (Mock implementation for now)
  const fetchDashboardData = async () => {
    try {
      // In a real scenario, you'd fetch from '/api/admin/dashboard-stats'
      // Example: const res = await fetch('/api/admin/dashboard-stats');
      // const data = await res.json();

      // Mock data for visual purpose
      const mockData = {
        totalRevenue: 25000000,
        totalBuyers: 145,
        totalSuccess: 142,
        history: [
          {
            invoice: 'INV-001',
            name: 'Alif Ramadhan',
            date: '2026-06-23',
            status: 'Success',
            total: 150000,
          },
          {
            invoice: 'INV-002',
            name: 'Siti Nurhaliza',
            date: '2026-06-22',
            status: 'Success',
            total: 300000,
          },
          {
            invoice: 'INV-003',
            name: 'Budi Santoso',
            date: '2026-06-21',
            status: 'Success',
            total: 150000,
          },
          {
            invoice: 'INV-004',
            name: 'Anya Geraldine',
            date: '2026-06-20',
            status: 'Success',
            total: 450000,
          },
        ],
      };

      // Animate Numbers
      animateValue('total-revenue', 0, mockData.totalRevenue, 1500, true);
      animateValue('total-buyers', 0, mockData.totalBuyers, 1500);
      animateValue('total-success', 0, mockData.totalSuccess, 1500);

      // Populate Table
      const tbody = document.getElementById('history-table-body');
      tbody.innerHTML = ''; // clear loading state

      mockData.history.forEach((item) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${item.invoice}</strong></td>
          <td>${item.name}</td>
          <td>${item.date}</td>
          <td><span class="status-badge success">Berhasil</span></td>
          <td>Rp ${item.total.toLocaleString('id-ID')}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (window.notify) window.notify.show('Gagal memuat data dashboard', 'error');
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
        const res = await fetch('/api/auth/logout', {
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
  fetch('/api/auth/ping')
    .then((res) => {
      if (!res.ok) {
        if (window.notify)
          window.notify.show('Sesi Anda telah berakhir, silakan login kembali.', 'error');
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
