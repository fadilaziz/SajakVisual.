console.log(`
╭──────────────────────────────────────────────────╮
│                                                  │
│   SajakVisual - SaaS Digital Invitation          │
│   Developed by: Muhamad Faidil Aziz              │
│   © 2026 SajakVisual. All rights reserved.       │
│   System is running smoothly...                  │
│                                                  │
╰──────────────────────────────────────────────────╯
`);

document.addEventListener('DOMContentLoaded', () => {
  // Helper to format currency
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Theme Toggle Interaction
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
  const htmlEl = document.documentElement;

  if (themeToggle && themeIcon) {
    // Check local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      htmlEl.classList.add('dark');
      themeIcon.classList.replace('ph-moon', 'ph-sun');
    }

    themeToggle.addEventListener('click', () => {
      // Add global transition class for smooth color changes
      document.body.classList.add('theme-switching');

      // Add a small rotation animation
      themeIcon.style.transform = 'rotate(180deg)';
      themeIcon.style.transition = 'transform 0.3s ease';
      
      setTimeout(() => {
        themeIcon.style.transform = 'rotate(0deg)';
        document.body.classList.remove('theme-switching');
      }, 300);

      if (htmlEl.classList.contains('dark')) {
        htmlEl.classList.remove('dark');
        themeIcon.classList.replace('ph-sun', 'ph-moon');
        localStorage.setItem('theme', 'light');
      } else {
        htmlEl.classList.add('dark');
        themeIcon.classList.replace('ph-moon', 'ph-sun');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // Setup Filter Dropdown Interaction
  const filterBtnToggle = document.getElementById('filter-btn-toggle');
  const filterDropdown = document.getElementById('filter-dropdown');

  if (filterBtnToggle && filterDropdown) {
    filterBtnToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent closing immediately
      filterBtnToggle.style.transform = 'scale(0.9)';
      setTimeout(() => {
        filterBtnToggle.style.transform = 'scale(1)';
        filterDropdown.classList.toggle('active');
      }, 150);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!filterBtnToggle.contains(e.target) && !filterDropdown.contains(e.target)) {
        filterDropdown.classList.remove('active');
      }
    });
  }

  // Add click ripple or tactile feedback to cards
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    card.addEventListener('mousedown', () => {
      card.style.transform = 'translateY(0) scale(0.98)';
    });

    card.addEventListener('mouseup', () => {
      card.style.transform = 'translateY(-4px) scale(1)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Auto Slide Banner
  const bannerTrack = document.getElementById('banner-track');

  if (bannerTrack) {
    const slides = bannerTrack.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideCount = slides.length;
    let slideInterval;

    // Swipe Variables
    let startX = 0;
    let endX = 0;
    let isDragging = false;

    const updateSlider = (index) => {
      bannerTrack.style.transform = `translateX(-${index * 100}%)`;
    };

    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % slideCount;
      updateSlider(currentSlide);
    };

    const prevSlide = () => {
      currentSlide = (currentSlide - 1 + slideCount) % slideCount;
      updateSlider(currentSlide);
    };

    const startSlide = () => {
      slideInterval = setInterval(nextSlide, 4000); // 4 seconds
    };

    const stopSlide = () => {
      clearInterval(slideInterval);
    };

    // Touch events for swiping
    bannerTrack.addEventListener(
      'touchstart',
      (e) => {
        stopSlide();
        startX = e.touches[0].clientX;
        isDragging = true;
      },
      { passive: true }
    );

    bannerTrack.addEventListener(
      'touchmove',
      (e) => {
        if (!isDragging) return;
        endX = e.touches[0].clientX;
      },
      { passive: true }
    );

    bannerTrack.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const swipeDistance = endX - startX;

      // Threshold for swipe (e.g., 50px)
      if (Math.abs(swipeDistance) > 50 && endX !== 0) {
        if (swipeDistance > 0) {
          // Swipe Right (Go to Previous Slide)
          prevSlide();
        } else {
          // Swipe Left (Go to Next Slide)
          nextSlide();
        }
      }

      // Reset endX
      endX = 0;
      startSlide();
    });

    // Pause on hover (for desktop)
    const bannerSlider = bannerTrack.parentElement;
    bannerSlider.addEventListener('mouseenter', stopSlide);
    bannerSlider.addEventListener('mouseleave', startSlide);

    startSlide();
  }

  if (!document.body.classList.contains('manual-loading')) {
    document.body.classList.remove('loading-state');
  }

  // Fetch and Render Product Cards
  const productGrid = document.getElementById('product-grid');
  // State to hold all fetched products
  let allProducts = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  const renderPagination = (totalItems, filteredProducts) => {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return; // Hide pagination if only 1 page

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="ph ph-caret-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderProducts(filteredProducts, false);
        const header = document.querySelector('.section-header');
        if (header) header.scrollIntoView({ behavior: 'smooth' });
      }
    });
    paginationContainer.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        currentPage = i;
        renderProducts(filteredProducts, false);
        const header = document.querySelector('.section-header');
        if (header) header.scrollIntoView({ behavior: 'smooth' });
      });
      paginationContainer.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="ph ph-caret-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProducts(filteredProducts, false);
        const header = document.querySelector('.section-header');
        if (header) header.scrollIntoView({ behavior: 'smooth' });
      }
    });
    paginationContainer.appendChild(nextBtn);
  };

  // Function to render products based on data array
  const renderProducts = (productsToRender, resetPage = true) => {
    if (resetPage) currentPage = 1;

    if (!productGrid) return;
    productGrid.innerHTML = '';
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) paginationContainer.innerHTML = '';

    if (productsToRender && productsToRender.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentItems = productsToRender.slice(startIndex, endIndex);

      currentItems.forEach((product, index) => {
        const article = document.createElement('article');
        article.className = 'product-card card-loaded';
        article.style.animationDelay = `${index * 50}ms`;

        // Use actual preview image if available, else fallback (using template-2 as default since others aren't uploaded yet)
        const imageUrl = '/img/template/template-2.webp';

        article.innerHTML = `
          <div
            class="product-image"
            style="
              background-image: url('${imageUrl}');
              background-size: cover;
              background-position: top;
            "
          ></div>
          <div class="product-info">
            <h3>${product.nama_template}</h3>
            <span class="category">${product.kategori}</span>
            <div class="price-row">
              <span class="price">${formatRupiah(product.harga)}</span>
            </div>
            <div class="action-row">
              <button class="btn-detail">Detail</button>
            </div>
          </div>
        `;

        // Add click ripple/tactile feedback
        article.addEventListener('mousedown', () => {
          article.style.transform = 'translateY(0) scale(0.98)';
        });
        article.addEventListener('mouseup', () => {
          article.style.transform = 'translateY(-4px) scale(1)';
        });
        article.addEventListener('mouseleave', () => {
          article.style.transform = '';
        });

        // Detail Modal click listener
        const btnDetail = article.querySelector('.btn-detail');
        if (btnDetail) {
          btnDetail.addEventListener('click', () => {
            openDetailModal(product);
          });
        }

        productGrid.appendChild(article);
      });
      renderPagination(productsToRender.length, productsToRender);
    } else {
      productGrid.innerHTML = `
        <p style="grid-column: span 2; text-align: center; padding: 20px; color: var(--muted-foreground);">
          Belum ada produk yang cocok.
        </p>
      `;
    }
  };

  // Fetch Products
  if (productGrid) {
    fetch(`/api/templates`)
      .then((response) => response.json())
      .then((products) => {
        if (products.data) {
          allProducts = products.data;
          renderProducts(allProducts);
        } else {
          renderProducts([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        productGrid.innerHTML = `
          <p style="grid-column: span 2; text-align: center; padding: 20px; color: var(--destructive);">
            Gagal memuat produk.
          </p>
        `;
      });
  }

  // Search Functionality
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const filtered = allProducts.filter((p) => {
        return (
          p.nama_template.toLowerCase().includes(searchTerm) ||
          p.kategori.toLowerCase().includes(searchTerm)
        );
      });
      renderProducts(filtered);
    });
  }

  // Filter Categories Functionality
  if (filterDropdown) {
    const filterItems = filterDropdown.querySelectorAll('.filter-dropdown-item');
    filterItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const category = item.textContent.trim();
        // Remove active state from others
        filterItems.forEach(i => i.style.color = 'var(--text-secondary)');
        item.style.color = 'var(--primary)';

        if (category === 'Terbaru' || category === 'Semua') {
          renderProducts(allProducts); // or sort by latest if date exists
        } else {
          const filtered = allProducts.filter((p) => p.kategori.toLowerCase() === category.toLowerCase());
          renderProducts(filtered);
        }
        
        // Hide dropdown
        filterDropdown.classList.remove('active');
      });
    });
  }

  // Reveal on Scroll Animation
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Remove the inline transition delay after the first animation so it doesn't delay on subsequent state changes
          setTimeout(() => {
            entry.target.style.transitionDelay = '0ms';
          }, 1000);
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // Sticky Header Scrolled State
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      },
      { passive: true }
    );
  }

  // ==========================================
  // Bottom Sheet Modal Logic
  // ==========================================
  const detailSheetOverlay = document.getElementById('detail-sheet-overlay');
  const detailSheet = document.getElementById('detail-sheet');

  window.openDetailModal = function (product) {
    if (!detailSheet || !detailSheetOverlay) return;

    // Populate Data
    document.getElementById('sheet-title').textContent = product.nama_template;
    document.getElementById('sheet-category').textContent = product.kategori;
    document.getElementById('sheet-price').textContent = formatRupiah(product.harga);
    // Generate a simple description since it doesn't exist in data.json
    document.getElementById('sheet-desc').textContent =
      `Desain undangan digital elegan dengan nuansa ${product.kategori.toLowerCase()}. Cocok untuk membuat momen spesialmu lebih berkesan.`;

    // In a real app we'd use product.image, but using the template fallback for now to match the card
    const imageUrl = product.image ? product.image : '/img/template/template-2.webp';
    document.getElementById('sheet-image').style.backgroundImage = `url('${imageUrl}')`;

    // Handle Beli button
    const btnBeli = document.getElementById('sheet-btn-beli');
    if (btnBeli) {
      btnBeli.onclick = () => {
        window.location.href = `/checkout?id=${encodeURIComponent(product.id)}&title=${encodeURIComponent(product.nama_template)}&price=${encodeURIComponent(product.harga)}`;
      };
    }

    //Handeke Demo button
    const btnDemo = document.getElementById('sheet-btn-demo');
    if (btnDemo) {
      btnDemo.onclick = () => {
        window.location.href = `/undangan/template?slug=${encodeURIComponent(product.slug)}`;
      };
    }

    // Open Modal
    detailSheetOverlay.classList.add('active');
    detailSheet.classList.add('sheet-open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Hide bottom nav
    const bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
      bottomNav.classList.add('nav-hidden');
    }
  };

  const closeDetailModal = () => {
    detailSheetOverlay.classList.remove('active');
    detailSheet.classList.remove('sheet-open');
    detailSheet.style.transform = ''; // Reset any swipe transform
    document.body.style.overflow = '';

    // Show bottom nav
    const bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
      bottomNav.classList.remove('nav-hidden');
    }
  };

  if (detailSheetOverlay) {
    detailSheetOverlay.addEventListener('click', closeDetailModal);
  }

  // Swipe to close logic
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  if (detailSheet) {
    detailSheet.addEventListener(
      'touchstart',
      (e) => {
        // Don't drag if we are scrolling the content area, unless we are at the top
        const content = document.querySelector('.bottom-sheet-content');
        if (e.target.closest('.bottom-sheet-content') && content.scrollTop > 0) {
          return;
        }
        startY = e.touches[0].clientY;
        isDragging = true;
        detailSheet.style.transition = 'none'; // Remove transition for smooth dragging
      },
      { passive: true }
    );

    detailSheet.addEventListener(
      'touchmove',
      (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;

        // Only allow dragging downwards
        if (deltaY > 0) {
          detailSheet.style.transform = `translateY(${deltaY}px)`;
        }
      },
      { passive: false }
    );

    detailSheet.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      detailSheet.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';

      const deltaY = currentY - startY;
      // If swiped down more than 100px, close the sheet
      if (deltaY > 100) {
        closeDetailModal();
      } else {
        // Otherwise, snap back to top
        detailSheet.style.transform = '';
      }

      // Reset values
      startY = 0;
      currentY = 0;
    });
  }
});
