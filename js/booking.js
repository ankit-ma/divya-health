// Divya Health Care - Multi-Step Interactive Booking Engine & WhatsApp Dispatch

const PRIMARY_WHATSAPP = '918796964512';
const SECONDARY_WHATSAPP = '918796964513';

// Booking state object
const bookingState = {
  currentStep: 1,
  selectedTest: null,
  collectionType: 'home', // 'home' or 'clinic'
  selectedDate: '',
  selectedDateLabel: '',
  selectedTime: '08:00 AM',
  patientName: '',
  patientPhone: '',
  patientAddress: '',
  patientNotes: '',
  whatsappConsent: true
};

// Initialize Booking Engine
document.addEventListener('DOMContentLoaded', () => {
  initBookingTriggers();
  renderDateSelector();
  renderTimeSlots();
  setupBookingFormListeners();
});

// Attach triggers for all book buttons on page
function initBookingTriggers() {
  document.addEventListener('click', (e) => {
    // Book button click
    const bookBtn = e.target.closest('[data-book-test]');
    if (bookBtn) {
      e.preventDefault();
      const testIdentifier = bookBtn.getAttribute('data-book-test');
      const mode = bookBtn.getAttribute('data-collection-type') || 'home';
      openBookingModal(testIdentifier, mode);
      return;
    }

    // Direct WhatsApp consultation / question trigger
    const waBtn = e.target.closest('[data-whatsapp-chat]');
    if (waBtn) {
      e.preventDefault();
      const reason = waBtn.getAttribute('data-whatsapp-chat') || 'Doctor Consultation';
      const testName = waBtn.getAttribute('data-test-name') || '';
      sendDirectWhatsAppInquiry(reason, testName);
      return;
    }
  });
}

// Find test from data or create default
function resolveTest(identifier) {
  if (!identifier) {
    return window.diagnosticData?.packages[0] || {
      name: 'Full Body Health Checkup',
      testCount: 18,
      price: 2500,
      originalPrice: 3500,
      discount: 1000
    };
  }

  // Check packages
  const pkg = window.diagnosticData?.packages.find(p => p.id === identifier || p.name.toLowerCase() === identifier.toLowerCase());
  if (pkg) return pkg;

  // Check individual tests
  const test = window.diagnosticData?.individualTests.find(t => t.id === identifier || t.name.toLowerCase() === identifier.toLowerCase());
  if (test) {
    return {
      ...test,
      testCount: 1,
      discount: test.originalPrice - test.price
    };
  }

  // Fallback with custom name
  return {
    name: identifier,
    testCount: 1,
    price: 2500,
    originalPrice: 3500,
    discount: 1000
  };
}

// Open Booking Modal
function openBookingModal(testIdentifier, defaultCollectionType = 'home') {
  const test = resolveTest(testIdentifier);
  bookingState.selectedTest = test;
  bookingState.collectionType = defaultCollectionType;
  bookingState.currentStep = 1;

  // Update Test Summary in Step 1
  const testNameEl = document.getElementById('modalTestName');
  const testCountEl = document.getElementById('modalTestCount');
  const testPriceEl = document.getElementById('modalTestPrice');
  const testOrigEl = document.getElementById('modalTestOriginalPrice');
  const testSaveEl = document.getElementById('modalTestSave');

  if (testNameEl) testNameEl.textContent = test.name;
  if (testCountEl) testCountEl.textContent = `${test.testCount || 1} Tests Included`;
  if (testPriceEl) testPriceEl.textContent = `₹${test.price.toLocaleString('en-IN')}`;
  if (testOrigEl) testOrigEl.textContent = `₹${(test.originalPrice || test.price).toLocaleString('en-IN')}`;
  if (testSaveEl) {
    const saveAmt = (test.originalPrice || test.price) - test.price;
    if (saveAmt > 0) {
      testSaveEl.textContent = `Save ₹${saveAmt.toLocaleString('en-IN')}`;
      testSaveEl.style.display = 'inline-flex';
    } else {
      testSaveEl.style.display = 'none';
    }
  }

  // Set collection mode cards
  updateCollectionModeUI(bookingState.collectionType);

  // Populate test picker options in modal
  populateTestSelectDropdown(test.id || test.name);

  // Go to step 1
  goToStep(1);

  // Show modal
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Close Booking Modal
function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Step navigation
function goToStep(stepNumber) {
  bookingState.currentStep = stepNumber;

  // Update step indicators
  const stepItems = document.querySelectorAll('.booking-step-indicator .step-item');
  stepItems.forEach((item, index) => {
    const stepNum = index + 1;
    item.classList.remove('active', 'completed');
    if (stepNum === stepNumber) {
      item.classList.add('active');
    } else if (stepNum < stepNumber) {
      item.classList.add('completed');
    }
  });

  // Switch step views
  const stepPanels = document.querySelectorAll('.booking-step-panel');
  stepPanels.forEach(panel => {
    panel.classList.remove('active');
  });

  const activePanel = document.getElementById(`bookingStep${stepNumber}`);
  if (activePanel) {
    activePanel.classList.add('active');
  }

  // If entering step 3, update address field requirement depending on collection mode
  if (stepNumber === 3) {
    const addressContainer = document.getElementById('stepAddressContainer');
    const addressInput = document.getElementById('patientAddress');
    if (bookingState.collectionType === 'home') {
      if (addressContainer) addressContainer.style.display = 'block';
      if (addressInput) addressInput.required = true;
    } else {
      // Clinic visit
      if (addressContainer) addressContainer.style.display = 'block';
      if (addressInput) {
        addressInput.placeholder = 'Optional / Your locality (e.g. West Vinod Nagar)';
        addressInput.required = false;
      }
    }
  }

  // If entering step 4, generate confirmation and preview message
  if (stepNumber === 4) {
    renderBookingConfirmation();
  }
}

// Collection Mode Select
function updateCollectionModeUI(type) {
  bookingState.collectionType = type;
  const homeCard = document.getElementById('optHomeCollection');
  const clinicCard = document.getElementById('optClinicVisit');

  if (homeCard && clinicCard) {
    if (type === 'home') {
      homeCard.classList.add('selected');
      clinicCard.classList.remove('selected');
    } else {
      clinicCard.classList.add('selected');
      homeCard.classList.remove('selected');
    }
  }
}

// Populate test dropdown for quick change
function populateTestSelectDropdown(activeId) {
  const select = document.getElementById('testSelectDropdown');
  if (!select || !window.diagnosticData) return;

  select.innerHTML = '';

  const optGroupPackages = document.createElement('optgroup');
  optGroupPackages.label = 'Health Checkup Packages';
  window.diagnosticData.packages.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (₹${p.price})`;
    if (p.id === activeId || p.name === activeId) opt.selected = true;
    optGroupPackages.appendChild(opt);
  });
  select.appendChild(optGroupPackages);

  const optGroupTests = document.createElement('optgroup');
  optGroupTests.label = 'Individual Pathology Tests';
  window.diagnosticData.individualTests.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.name} (₹${t.price})`;
    if (t.id === activeId || t.name === activeId) opt.selected = true;
    optGroupTests.appendChild(opt);
  });
  select.appendChild(optGroupTests);

  select.onchange = (e) => {
    const selected = resolveTest(e.target.value);
    bookingState.selectedTest = selected;
    document.getElementById('modalTestName').textContent = selected.name;
    document.getElementById('modalTestCount').textContent = `${selected.testCount || 1} Tests Included`;
    document.getElementById('modalTestPrice').textContent = `₹${selected.price.toLocaleString('en-IN')}`;
    const origEl = document.getElementById('modalTestOriginalPrice');
    if (origEl) origEl.textContent = `₹${(selected.originalPrice || selected.price).toLocaleString('en-IN')}`;
  };
}

// Render dynamic next 7 days for Step 2
function renderDateSelector() {
  const container = document.getElementById('dateSelectorContainer');
  if (!container) return;

  container.innerHTML = '';
  const now = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + i);

    const dayName = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : daysOfWeek[targetDate.getDay()]);
    const dateNum = targetDate.getDate();
    const monthName = months[targetDate.getMonth()];
    const dateValue = `${dateNum} ${monthName} ${targetDate.getFullYear()}`;

    const dateCard = document.createElement('div');
    dateCard.className = `date-slot-pill ${i === 0 ? 'selected' : ''}`;
    dateCard.dataset.dateValue = dateValue;
    dateCard.dataset.dateLabel = `${dayName}, ${dateNum} ${monthName}`;

    dateCard.innerHTML = `
      <span class="day-title">${dayName}</span>
      <span class="day-number">${dateNum}</span>
      <span class="month-name">${monthName}</span>
    `;

    dateCard.addEventListener('click', () => {
      document.querySelectorAll('.date-slot-pill').forEach(el => el.classList.remove('selected'));
      dateCard.classList.add('selected');
      bookingState.selectedDate = dateValue;
      bookingState.selectedDateLabel = `${dayName}, ${dateNum} ${monthName}`;
    });

    if (i === 0) {
      bookingState.selectedDate = dateValue;
      bookingState.selectedDateLabel = `${dayName}, ${dateNum} ${monthName}`;
    }

    container.appendChild(dateCard);
  }
}

// Render time slot pills for Step 2
function renderTimeSlots() {
  const container = document.getElementById('timeSlotsContainer');
  if (!container) return;

  const slots = [
    '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', 
    '11:00 AM', '12:00 PM', '04:00 PM', '05:00 PM', '06:30 PM'
  ];

  container.innerHTML = '';
  slots.forEach((slot, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `time-slot-btn ${slot === '08:00 AM' ? 'selected' : ''}`;
    btn.textContent = slot;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      bookingState.selectedTime = slot;
    });

    container.appendChild(btn);
  });
}

// Setup Booking Form Listeners & Validation
function setupBookingFormListeners() {
  // Step 1: Collection mode toggles
  const homeCard = document.getElementById('optHomeCollection');
  const clinicCard = document.getElementById('optClinicVisit');

  if (homeCard) {
    homeCard.addEventListener('click', () => updateCollectionModeUI('home'));
  }
  if (clinicCard) {
    clinicCard.addEventListener('click', () => updateCollectionModeUI('clinic'));
  }

  // Step 1 Next Button
  const btnStep1Next = document.getElementById('btnStep1Next');
  if (btnStep1Next) {
    btnStep1Next.addEventListener('click', () => goToStep(2));
  }

  // Step 2 Next Button
  const btnStep2Next = document.getElementById('btnStep2Next');
  if (btnStep2Next) {
    btnStep2Next.addEventListener('click', () => goToStep(3));
  }

  // Step 2 Back Button
  const btnStep2Back = document.getElementById('btnStep2Back');
  if (btnStep2Back) {
    btnStep2Back.addEventListener('click', () => goToStep(1));
  }

  // Step 3 Back Button
  const btnStep3Back = document.getElementById('btnStep3Back');
  if (btnStep3Back) {
    btnStep3Back.addEventListener('click', () => goToStep(2));
  }

  // Step 3 Form Submit (Confirm Booking)
  const form = document.getElementById('bookingDetailsForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('patientName').value.trim();
      const phone = document.getElementById('patientPhone').value.trim();
      const address = document.getElementById('patientAddress')?.value.trim() || 'At Clinic';
      const notes = document.getElementById('patientNotes')?.value.trim() || 'None';
      const consent = document.getElementById('patientConsent')?.checked ?? true;

      if (!name || !phone) {
        alert('Please fill in your name and WhatsApp contact number.');
        return;
      }

      if (phone.replace(/\D/g, '').length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }

      bookingState.patientName = name;
      bookingState.patientPhone = phone;
      bookingState.patientAddress = address;
      bookingState.patientNotes = notes;
      bookingState.whatsappConsent = consent;

      // Proceed to Step 4
      goToStep(4);

      // Trigger automatic launch after a short smooth delay or let user click button
      setTimeout(() => {
        openWhatsAppDirectly();
      }, 900);
    });
  }

  // Close modal button
  const closeBtns = document.querySelectorAll('.close-modal-btn');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeBookingModal);
  });

  // Location helper button
  const fillLocBtn = document.getElementById('btnFillDefaultLocation');
  if (fillLocBtn) {
    fillLocBtn.addEventListener('click', () => {
      const addressInput = document.getElementById('patientAddress');
      if (addressInput) {
        addressInput.value = 'West Vinod Nagar, Gali No. 7, Near Shanti Marg, Delhi 110092';
        addressInput.focus();
      }
    });
  }
}

// Format the WhatsApp message string
function buildWhatsAppBookingMessage() {
  const test = bookingState.selectedTest || { name: 'Full Body Health Checkup', price: 2500 };
  const modeText = bookingState.collectionType === 'home' ? 'Home Sample Collection 🛵' : 'Visit Diagnostic Clinic 🏥';

  const message = 
`*New Test Appointment Booking*
*DIVYA HEALTH CARE - West Vinod Nagar, Delhi*
━━━━━━━━━━━━━━━━━━━━
🧪 *Test / Package:* ${test.name}
💰 *Price:* ₹${test.price.toLocaleString('en-IN')}
📍 *Collection Mode:* ${modeText}
📅 *Preferred Date:* ${bookingState.selectedDateLabel || bookingState.selectedDate}
⏰ *Time Slot:* ${bookingState.selectedTime}
━━━━━━━━━━━━━━━━━━━━
👤 *Patient Name:* ${bookingState.patientName}
📞 *Mobile Number:* ${bookingState.patientPhone}
🏠 *Address:* ${bookingState.patientAddress || 'West Vinod Nagar, Delhi'}
📝 *Special Note:* ${bookingState.patientNotes}
━━━━━━━━━━━━━━━━━━━━
Please confirm my appointment and share sample preparation guidelines. Thank you!`;

  return message;
}

// Render Step 4 UI
function renderBookingConfirmation() {
  const msg = buildWhatsAppBookingMessage();
  const previewEl = document.getElementById('whatsappMessagePreview');
  if (previewEl) {
    previewEl.innerHTML = msg.replace(/\n/g, '<br>').replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  }

  // Setup Step 4 CTA button
  const sendBtn = document.getElementById('btnSendOnWhatsApp');
  if (sendBtn) {
    sendBtn.onclick = () => openWhatsAppDirectly();
  }
}

// Open WhatsApp with pre-filled message
function openWhatsAppDirectly() {
  const text = buildWhatsAppBookingMessage();
  const encodedText = encodeURIComponent(text);
  const waUrl = `https://wa.me/${PRIMARY_WHATSAPP}?text=${encodedText}`;
  window.open(waUrl, '_blank');
}

// Direct WhatsApp Inquiry from any CTA or Doctor Card
function sendDirectWhatsAppInquiry(topic, testName = '') {
  let message = '';
  if (testName) {
    message = `Hello Divya Health Care, I would like to inquire about the *${testName}*. Please provide details and booking slots.`;
  } else if (topic === 'Doctor Consultation') {
    message = `Hello Divya Health Care team, I am not sure which health test I need. Can I speak with your medical professional for guidance?`;
  } else if (topic === 'Home Collection') {
    message = `Hello! I want to request a free home sample collection in East Delhi / West Vinod Nagar. Please assist me with available phlebotomist timings.`;
  } else if (topic === 'Prescription') {
    message = `Hello Divya Health Care, I have a doctor prescription for blood tests. I am sharing it here to get the test cost and schedule home collection.`;
  } else {
    message = `Hello Divya Health Care, I have a query regarding diagnostic tests and home sample collection.`;
  }

  const waUrl = `https://wa.me/${PRIMARY_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

// Expose globally
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.sendDirectWhatsAppInquiry = sendDirectWhatsAppInquiry;
window.goToStep = goToStep;
