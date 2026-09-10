// Divya Health Care - Main Application Script
// Dynamic Features: Live Hero Slider, Live Assistance Widget, Real-Time Activity Toaster

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initLiveAssistant();
  initActivityToaster();
  initHeroQuickBook();
  renderPopularPackages();
  renderCategoryPills();
  setupLiveSearch();
  setupPackageDetailModal();
  setupFAQAccordion();
  setupMobileNav();
  setupPrescriptionModal();
  setupScrollEffects();
});

/* ==========================================================================
   1. DYNAMIC HERO PHOTO SLIDER / CAROUSEL
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slider-slide');
  const dotsContainer = document.getElementById('heroSliderDots');
  const prevBtn = document.getElementById('heroSlidePrev');
  const nextBtn = document.getElementById('heroSlideNext');
  const captionEl = document.getElementById('heroSliderCaption');
  const badgeEl = document.getElementById('heroSliderBadge');

  if (!slides.length) return;

  const slideData = [
    {
      badge: 'NABL Quality Protocols',
      caption: 'Certified DMLT Phlebotomists taking sample in clinic'
    },
    {
      badge: 'Zero Contamination',
      caption: 'Sterile vacuum-sealed vacutainers & barcoded kits'
    },
    {
      badge: 'Free Doorstep Service',
      caption: 'Painless single-prick sample collection across East Delhi'
    },
    {
      badge: 'Advanced Pathology Lab',
      caption: 'Automated calibrated testing with WhatsApp digital reports'
    }
  ];

  let currentSlide = 0;
  let slideInterval = null;

  // Build Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(index);
        restartInterval();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function goToSlide(index) {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.slider-dot') : [];
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });

    currentSlide = index;

    // Update dynamic text badge and caption
    if (slideData[index]) {
      if (badgeEl) {
        badgeEl.textContent = slideData[index].badge;
        badgeEl.style.animation = 'none';
        badgeEl.offsetHeight; // trigger reflow
        badgeEl.style.animation = 'fadeInUp 0.4s ease';
      }
      if (captionEl) {
        captionEl.textContent = slideData[index].caption;
      }
    }
  }

  function nextSlide() {
    const nextIdx = (currentSlide + 1) % slides.length;
    goToSlide(nextIdx);
  }

  function prevSlide() {
    const prevIdx = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevIdx);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      restartInterval();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      restartInterval();
    });
  }

  function startInterval() {
    slideInterval = setInterval(nextSlide, 3800);
  }

  function restartInterval() {
    clearInterval(slideInterval);
    startInterval();
  }

  // Pause on hover
  const sliderFrame = document.querySelector('.hero-slider-container');
  if (sliderFrame) {
    sliderFrame.addEventListener('mouseenter', () => clearInterval(slideInterval));
    sliderFrame.addEventListener('mouseleave', () => startInterval());
  }

  startInterval();
}

/* ==========================================================================
   2. HERO QUICK BOOKING INLINE WIDGET
   ========================================================================== */
function initHeroQuickBook() {
  const form = document.getElementById('heroQuickBookForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const testSelect = document.getElementById('heroTestSelect');
    const phoneInput = document.getElementById('heroPhoneInput');
    const localitySelect = document.getElementById('heroLocalitySelect');

    const testName = testSelect ? testSelect.value : 'Full Body Health Checkup';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const locality = localitySelect ? localitySelect.value : 'West Vinod Nagar';

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      alert('Please enter your 10-digit WhatsApp mobile number.');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // Direct WhatsApp home collection dispatch
    const msg = 
`*Fast Home Sample Collection Request*
*DIVYA HEALTH CARE - East Delhi*
━━━━━━━━━━━━━━━━━━━━
🧪 *Test / Package:* ${testName}
📍 *Area / Locality:* ${locality}
📞 *Mobile Number:* ${phone}
🛵 *Request:* Please dispatch phlebotomist for home collection.
━━━━━━━━━━━━━━━━━━━━
Please confirm available morning time slots. Thank you!`;

    const waUrl = `https://wa.me/918796964512?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  });
}

/* ==========================================================================
   3. LIVE ASSISTANCE WIDGET (Bottom-Right Live Chat)
   ========================================================================== */
function initLiveAssistant() {
  const toggleBtn = document.getElementById('liveAssistantToggle');
  const chatBox = document.getElementById('liveAssistantDrawer');
  const closeBtn = document.getElementById('closeAssistantBtn');
  const promptBubble = document.getElementById('assistantGreetingBubble');
  const closePromptBtn = document.getElementById('closePromptBubble');

  if (!toggleBtn || !chatBox) return;

  // Show friendly prompt bubble after 3.5s
  setTimeout(() => {
    if (promptBubble && !chatBox.classList.contains('active')) {
      promptBubble.classList.add('visible');
    }
  }, 3500);

  if (closePromptBtn) {
    closePromptBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      promptBubble.classList.remove('visible');
    });
  }

  // Toggle Chat Box
  toggleBtn.addEventListener('click', () => {
    const isOpen = chatBox.classList.toggle('active');
    if (promptBubble) promptBubble.classList.remove('visible');
    if (isOpen) {
      toggleBtn.classList.add('chat-open');
    } else {
      toggleBtn.classList.remove('chat-open');
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatBox.classList.remove('active');
      toggleBtn.classList.remove('chat-open');
    });
  }

  // Assistant Quick Option Actions
  document.querySelectorAll('.asst-quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      chatBox.classList.remove('active');
      toggleBtn.classList.remove('chat-open');

      if (action === 'book-home') {
        window.openBookingModal('Full Body Health Checkup', 'home');
      } else if (action === 'upload-rx') {
        const rxModal = document.getElementById('prescriptionModal');
        if (rxModal) rxModal.classList.add('active');
      } else if (action === 'fasting-advice') {
        window.sendDirectWhatsAppInquiry('Fasting Advice');
      } else if (action === 'whatsapp-direct') {
        window.sendDirectWhatsAppInquiry('Live Support');
      }
    });
  });
}

/* ==========================================================================
   4. REAL-TIME ACTIVITY TOASTER (Social Proof & Live Updates)
   ========================================================================== */
function initActivityToaster() {
  const toaster = document.getElementById('liveActivityToaster');
  if (!toaster) return;

  const activities = [
    {
      icon: 'fa-solid fa-motorcycle',
      title: 'Home Collection Booked',
      text: 'Amit S. from Mandawali booked <strong>Full Body Checkup</strong>',
      time: 'Just now'
    },
    {
      icon: 'fa-solid fa-file-circle-check',
      title: 'Report Delivered',
      text: 'Thyroid & CBC report sent on WhatsApp to West Vinod Nagar',
      time: '2 mins ago'
    },
    {
      icon: 'fa-solid fa-user-nurse',
      title: 'Phlebotomist Dispatched',
      text: 'Sample collection underway in <strong>Mayur Vihar Phase 2</strong>',
      time: '4 mins ago'
    },
    {
      icon: 'fa-solid fa-star',
      title: '5-Star Review',
      text: 'Sunita M.: <em>"Painless home blood collection, received report in 12h!"</em>',
      time: '6 mins ago'
    },
    {
      icon: 'fa-solid fa-dumbbell',
      title: 'Gym Profile Booked',
      text: 'Rajesh K. booked <strong>Gym Performance Profile</strong> (IP Extension)',
      time: '8 mins ago'
    }
  ];

  let currentIdx = 0;

  function showNextActivity() {
    const item = activities[currentIdx];
    currentIdx = (currentIdx + 1) % activities.length;

    const iconEl = toaster.querySelector('.toast-icon i');
    const titleEl = toaster.querySelector('.toast-title');
    const textEl = toaster.querySelector('.toast-text');
    const timeEl = toaster.querySelector('.toast-time');

    if (iconEl) iconEl.className = item.icon;
    if (titleEl) titleEl.textContent = item.title;
    if (textEl) textEl.innerHTML = item.text;
    if (timeEl) timeEl.textContent = item.time;

    toaster.classList.add('visible');

    // Hide after 5 seconds
    setTimeout(() => {
      toaster.classList.remove('visible');
    }, 5500);
  }

  // First show after 4 seconds, then repeat every 15 seconds
  setTimeout(() => {
    showNextActivity();
    setInterval(showNextActivity, 15000);
  }, 4000);

  // Close button
  const closeBtn = toaster.querySelector('.toast-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toaster.classList.remove('visible');
    });
  }
}

/* ==========================================================================
   5. POPULAR PACKAGES (Clean UI Cards - No Ad Photos)
   ========================================================================== */
function renderPopularPackages() {
  const container = document.getElementById('popularPackagesContainer');
  if (!container || !window.diagnosticData) return;

  container.innerHTML = '';
  const popularList = window.diagnosticData.packages.slice(0, 4);

  popularList.forEach((pkg) => {
    const card = document.createElement('div');
    card.className = `package-card ${pkg.badge === 'Most Popular' ? 'featured' : ''}`;

    const tagsHtml = pkg.featuredTags.map(tag => `<span class="pkg-tag">${tag}</span>`).join('');

    card.innerHTML = `
      ${pkg.badge ? `<div class="package-badge">${pkg.badge}</div>` : ''}
      <div class="package-card-header">
        <div class="pkg-icon-wrap">
          <i class="${getCategoryIcon(pkg.category)}"></i>
        </div>
        <div class="pkg-header-text">
          <h3 class="package-title">${pkg.name}</h3>
          <span class="package-test-count">${pkg.testCount} Tests Included</span>
        </div>
      </div>
      
      <p class="package-description">${pkg.tagline}</p>

      <div class="package-pricing">
        <div class="pricing-wrap">
          <span class="current-price">₹${pkg.price.toLocaleString('en-IN')}</span>
          <span class="original-price">₹${pkg.originalPrice.toLocaleString('en-IN')}</span>
        </div>
        <span class="save-badge">Save ₹${pkg.discount.toLocaleString('en-IN')}</span>
      </div>

      <div class="package-tags-wrap">
        ${tagsHtml}
      </div>

      <div class="package-footer-actions">
        <button type="button" class="btn-primary-book" data-book-test="${pkg.id}">
          <span>Book Now</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
        <button type="button" class="btn-outline-details" onclick="openPackageDetailModal('${pkg.id}')">
          Details
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

/* ==========================================================================
   6. CATEGORY PILLS
   ========================================================================== */
function renderCategoryPills() {
  const container = document.getElementById('categoryPillsGrid');
  if (!container || !window.diagnosticData) return;

  container.innerHTML = '';
  const categories = [
    { id: 'full-body', name: 'Full Body', icon: 'fa-solid fa-person', count: '4 Packages' },
    { id: 'blood', name: 'Blood Test', icon: 'fa-solid fa-droplet', count: '10+ Tests' },
    { id: 'thyroid', name: 'Thyroid', icon: 'fa-solid fa-shield-virus', count: 'T3, T4, TSH' },
    { id: 'diabetes', name: 'Diabetes', icon: 'fa-solid fa-cubes-stacked', count: 'HbA1c, Sugar' },
    { id: 'vitamins', name: 'Vitamins', icon: 'fa-solid fa-capsules', count: 'D3, B12' },
    { id: 'fitness', name: 'Fitness', icon: 'fa-solid fa-dumbbell', count: 'Gym Profile' }
  ];

  categories.forEach(cat => {
    const pill = document.createElement('a');
    pill.href = `tests.html?category=${cat.id}`;
    pill.className = 'category-grid-item';
    pill.innerHTML = `
      <div class="cat-icon-circle">
        <i class="${cat.icon}"></i>
      </div>
      <span class="cat-name">${cat.name}</span>
      <span class="cat-count">${cat.count}</span>
    `;
    container.appendChild(pill);
  });
}

function getCategoryIcon(catId) {
  switch (catId) {
    case 'full-body': return 'fa-solid fa-person-circle-check';
    case 'fitness': return 'fa-solid fa-dumbbell';
    case 'diabetes': return 'fa-solid fa-cubes-stacked';
    case 'heart': return 'fa-solid fa-heart-pulse';
    case 'thyroid': return 'fa-solid fa-shield-virus';
    case 'vitamins': return 'fa-solid fa-capsules';
    default: return 'fa-solid fa-vial-virus';
  }
}

/* ==========================================================================
   7. LIVE SEARCH
   ========================================================================== */
function setupLiveSearch() {
  const searchInput = document.getElementById('testLiveSearchInput');
  const searchResults = document.getElementById('liveSearchResults');
  const quickTags = document.querySelectorAll('.quick-search-tag');

  if (!searchInput || !window.diagnosticData) return;

  const allItems = [
    ...window.diagnosticData.packages.map(p => ({ ...p, type: 'Package' })),
    ...window.diagnosticData.individualTests.map(t => ({ ...t, type: 'Individual Test' }))
  ];

  quickTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const keyword = tag.getAttribute('data-tag');
      searchInput.value = keyword;
      executeSearch(keyword);
    });
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    executeSearch(query);
  });

  function executeSearch(query) {
    if (!searchResults) return;

    if (!query || query.length < 2) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }

    const matches = allItems.filter(item => {
      const inName = item.name.toLowerCase().includes(query);
      const inTags = item.featuredTags ? item.featuredTags.some(t => t.toLowerCase().includes(query)) : false;
      const inDesc = item.description ? item.description.toLowerCase().includes(query) : false;
      return inName || inTags || inDesc;
    }).slice(0, 6);

    if (matches.length === 0) {
      searchResults.innerHTML = `
        <div class="no-search-results">
          <p>No tests found for "<strong>${escapeHtml(query)}</strong>"</p>
          <button type="button" class="btn-ask-wa" data-whatsapp-chat="Custom Test Inquiry" data-test-name="${escapeHtml(query)}">
            <i class="fa-brands fa-whatsapp"></i> Ask on WhatsApp for this test
          </button>
        </div>
      `;
    } else {
      searchResults.innerHTML = matches.map(item => `
        <div class="search-result-item" onclick="handleSearchResultClick('${item.id}', '${item.type}')">
          <div class="result-left">
            <span class="result-badge ${item.type === 'Package' ? 'badge-pkg' : 'badge-test'}">${item.type}</span>
            <strong class="result-name">${item.name}</strong>
          </div>
          <div class="result-right">
            <span class="result-price">₹${item.price.toLocaleString('en-IN')}</span>
            <button type="button" class="btn-book-sm" data-book-test="${item.id}">Book</button>
          </div>
        </div>
      `).join('');
    }

    searchResults.classList.add('active');
  }

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults?.contains(e.target)) {
      searchResults?.classList.remove('active');
    }
  });
}

function handleSearchResultClick(itemId, type) {
  if (type === 'Package') {
    openPackageDetailModal(itemId);
  } else {
    window.openBookingModal(itemId, 'home');
  }
  const searchResults = document.getElementById('liveSearchResults');
  if (searchResults) searchResults.classList.remove('active');
}

/* ==========================================================================
   8. PACKAGE DETAIL MODAL (Real Lab Photo Only)
   ========================================================================== */
function setupPackageDetailModal() {
  const modal = document.getElementById('packageDetailModal');
  if (!modal) return;

  modal.querySelectorAll('.close-pkg-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  const tabs = modal.querySelectorAll('.modal-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetTabId = tab.getAttribute('data-tab');
      modal.querySelectorAll('.tab-content-panel').forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`tab-${targetTabId}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });
}

function openPackageDetailModal(packageId) {
  const pkg = window.diagnosticData?.packages.find(p => p.id === packageId) || window.diagnosticData?.packages[0];
  if (!pkg) return;

  const modal = document.getElementById('packageDetailModal');
  if (!modal) return;

  document.getElementById('pkgModalTitle').textContent = pkg.name;
  document.getElementById('pkgModalTestCount').textContent = `${pkg.testCount} Tests Included`;
  document.getElementById('pkgModalPrice').textContent = `₹${pkg.price.toLocaleString('en-IN')}`;
  document.getElementById('pkgModalOriginalPrice').textContent = `₹${pkg.originalPrice.toLocaleString('en-IN')}`;
  document.getElementById('pkgModalDiscount').textContent = `Save ₹${pkg.discount.toLocaleString('en-IN')}`;
  
  // Real photo only
  const imgEl = document.getElementById('pkgModalImage');
  if (imgEl) {
    imgEl.src = pkg.image || 'Taking test2.jpg';
    imgEl.alt = `${pkg.name} Diagnostic Profile`;
  }

  const aboutEl = document.getElementById('tab-about');
  if (aboutEl) {
    aboutEl.innerHTML = `
      <p class="tab-desc">${pkg.about}</p>
      <div class="pkg-quick-features">
        <div class="q-feature"><i class="fa-solid fa-clock-rotate-left"></i> <span>Report Time: <strong>${pkg.reportTime}</strong></span></div>
        <div class="q-feature"><i class="fa-solid fa-vial"></i> <span>Sample Required: <strong>${pkg.sampleType}</strong></span></div>
        <div class="q-feature"><i class="fa-solid fa-bowl-food"></i> <span>Preparation: <strong>${pkg.fastingRequired}</strong></span></div>
        <div class="q-feature"><i class="fa-solid fa-motorcycle"></i> <span>Collection: <strong>Free Home Collection Available</strong></span></div>
      </div>
    `;
  }

  const testsListEl = document.getElementById('tab-tests');
  if (testsListEl) {
    testsListEl.innerHTML = `
      <div class="tests-checklist-grid">
        ${pkg.testsIncluded.map(test => `
          <div class="test-item-row">
            <i class="fa-solid fa-circle-check"></i>
            <span>${test}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  const prepEl = document.getElementById('tab-prep');
  if (prepEl) {
    prepEl.innerHTML = `
      <div class="preparation-guidelines">
        <h4><i class="fa-solid fa-notes-medical"></i> Patient Instructions:</h4>
        <ul>
          ${pkg.preparation.map(instruction => `<li>${instruction}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  const sampleEl = document.getElementById('tab-sample');
  if (sampleEl) {
    sampleEl.innerHTML = `
      <div class="sample-type-details">
        <div class="sample-badge"><i class="fa-solid fa-flask-vial"></i> ${pkg.sampleType}</div>
        <p>Our DMLT-certified phlebotomist arrives with sterilized, vacuum-sealed vacutainer blood tubes and barcoded collection containers for 100% hygienic, zero-contamination sample handling.</p>
      </div>
    `;
  }

  const bookBtn = document.getElementById('btnPkgModalBook');
  if (bookBtn) {
    bookBtn.onclick = () => {
      modal.classList.remove('active');
      window.openBookingModal(pkg.id, 'home');
    };
  }

  const askDocBtn = document.getElementById('btnPkgModalAskDoc');
  if (askDocBtn) {
    askDocBtn.onclick = () => {
      window.sendDirectWhatsAppInquiry('Doctor Consultation', pkg.name);
    };
  }

  modal.querySelectorAll('.modal-tab-btn').forEach((t, i) => {
    t.classList.toggle('active', i === 1);
  });
  modal.querySelectorAll('.tab-content-panel').forEach(p => {
    p.classList.toggle('active', p.id === 'tab-tests');
  });

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* ==========================================================================
   9. FAQ ACCORDION, MOBILE DRAWER, & UTILS
   ========================================================================== */
function setupFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-accordion-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(el => el.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

function setupMobileNav() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const closeDrawer = document.getElementById('closeMobileDrawer');

  if (!menuToggle || !mobileDrawer) return;

  menuToggle.addEventListener('click', () => {
    mobileDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  if (closeDrawer) {
    closeDrawer.addEventListener('click', () => {
      mobileDrawer.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  mobileDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileDrawer.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

function setupPrescriptionModal() {
  const openBtn = document.getElementById('btnUploadPrescription');
  const modal = document.getElementById('prescriptionModal');
  if (!openBtn || !modal) return;

  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  modal.querySelectorAll('.close-rx-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  const sendRxBtn = document.getElementById('btnSendRxWhatsApp');
  if (sendRxBtn) {
    sendRxBtn.addEventListener('click', () => {
      const patientName = document.getElementById('rxPatientName')?.value.trim() || 'Patient';
      const locality = document.getElementById('rxLocality')?.value.trim() || 'West Vinod Nagar, Delhi';
      const msg = `*Doctor Prescription Upload*\nHello Divya Health Care,\nMy Name: ${patientName}\nLocation: ${locality}\nI am attaching my prescription photo in this chat. Please share total test cost and home collection schedule.`;
      const waUrl = `https://wa.me/918796964512?text=${encodeURIComponent(msg)}`;
      modal.classList.remove('active');
      document.body.style.overflow = '';
      window.open(waUrl, '_blank');
    });
  }
}

function setupScrollEffects() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 76;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.openPackageDetailModal = openPackageDetailModal;
window.handleSearchResultClick = handleSearchResultClick;
