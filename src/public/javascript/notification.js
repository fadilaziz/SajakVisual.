// notification.js
class NotificationHandler {
  constructor() {
    this.container = document.getElementById('notification-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Menampilkan notifikasi baru
   * @param {string} message - Pesan yang ingin ditampilkan
   * @param {string} type - 'success', 'error', atau 'info'
   * @param {number} duration - Durasi tampil dalam milidetik
   */
  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;

    let iconHtml = '';
    if (type === 'success') {
      iconHtml = '<i class="ph ph-check-circle"></i>';
    } else if (type === 'error') {
      iconHtml = '<i class="ph ph-warning-circle"></i>';
    } else {
      iconHtml = '<i class="ph ph-info"></i>';
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconHtml}</div>
      <div class="toast-content">${message}</div>
    `;

    this.container.appendChild(toast);

    // Animasi keluar setelah durasi yang ditentukan
    setTimeout(() => {
      toast.classList.add('hide');
      toast.addEventListener('animationend', () => {
        if (toast.parentNode === this.container) {
          this.container.removeChild(toast);
        }
      });
    }, duration);
  }

  /**
   * Helper untuk menangani API Response secara otomatis.
   * Jika respon API memiliki format standar { success: true/false, message: "..." },
   * metode ini bisa langsung dipakai.
   * 
   * @param {Response} response - Object response dari fetch
   * @param {Object} data - Hasil parse response.json()
   */
  handleApiResponse(response, data) {
    // Jika responsenya dari server dengan status di atas 400 atau success = false
    if (!response.ok || data.success === false) {
      this.show(data.message || data.error || 'Terjadi kesalahan sistem.', 'error');
      return false; // mengindikasikan error
    }
    
    // Jika ada pesan sukses, tampilkan
    if (data.message) {
      this.show(data.message, 'success');
    }
    return true; // mengindikasikan sukses
  }

  /**
   * Fungsi fetch kustom yang secara otomatis me-wrap API response handling.
   * Cocok digunakan untuk me-replace penggunaan `fetch` di aplikasi.
   */
  async fetchWithNotify(url, options = {}) {
    try {
      const response = await fetch(url, options);
      
      // Deteksi jika server mengembalikan non-JSON (contoh: html error page)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         if (!response.ok) {
           this.show('Terjadi kesalahan dari server.', 'error');
           throw new Error('Non-JSON error response');
         }
         return await response.text();
      }

      const data = await response.json();
      
      this.handleApiResponse(response, data);

      if (!response.ok) {
        throw new Error(data.message || 'Server error');
      }

      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        this.show('Koneksi terputus. Gagal terhubung ke server.', 'error');
      } else if (error.message !== 'Non-JSON error response' && error.message !== 'Server error') {
        // Fallback untuk error lain yang bukan dilempar dari block catch atas
        console.error(error);
      }
      throw error;
    }
  }
}

// Inisiasi secara global
window.notify = new NotificationHandler();
