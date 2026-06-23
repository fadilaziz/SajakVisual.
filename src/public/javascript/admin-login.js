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

  // Slider Logic
  const slides = document.querySelectorAll('.slide');
  let currentSlide = 0;

  if (slides.length > 0) {
    setInterval(() => {
      // Hilangkan class active dari slide saat ini
      slides[currentSlide].classList.remove('active');

      // Pindah ke slide berikutnya (looping kembali ke 0 jika di akhir)
      currentSlide = (currentSlide + 1) % slides.length;

      // Tambahkan class active ke slide baru
      slides[currentSlide].classList.add('active');
    }, 5000); // Ganti gambar setiap 5 detik
  }

  // Form Logic
  const loginForm = document.getElementById('admin-login-form');
  const submitBtn = document.getElementById('submit-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!email || !password) {
        alert('Email dan password harus diisi.');
        return;
      }

      // Animasi loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Memproses...';
      submitBtn.disabled = true;

      try {
        // Fetch to backend for admin login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Berhasil login
          submitBtn.innerHTML = 'Berhasil!';
          // Redirect ke dashboard admin
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 1000);
        } else {
          // Gagal login
          alert(data.message || 'Login gagal. Periksa kembali email dan password Anda.');
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});
