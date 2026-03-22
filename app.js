/**
 * Lagos AUTO Doctor — app.js
 * Features: Nav toggle, scroll effects, form validation, animations
 */

'use strict';

/* ============================================================
   1. UTILITIES
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   2. NAVBAR: scroll effect + mobile menu toggle
   ============================================================ */
(function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');

  // Scroll: add .scrolled class when page is scrolled
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial check

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  $$('.nav-link', navLinks).forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  const navCta = $('.nav-cta', navLinks);
  if (navCta) navCta.addEventListener('click', closeMenu);

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
    }
  });

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Active nav link highlighting on scroll
  const sections = $$('section[id], div[id]');
  const navLinkEls = $$('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => sectionObserver.observe(sec));
})();


/* ============================================================
   3. SMOOTH SCROLLING for all internal anchor links
   ============================================================ */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;

    e.preventDefault();

    const navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 70;

    const top = target.getBoundingClientRect().top + window.scrollY - navH - 10;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();


/* ============================================================
   4. SCROLL ANIMATIONS using IntersectionObserver
   ============================================================ */
(function initScrollAnimations() {
  const animatables = $$('[data-animate]');
  if (!animatables.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  animatables.forEach(el => observer.observe(el));
})();


/* ============================================================
   5. CONTACT FORM VALIDATION
   ============================================================ */
(function initContactForm() {
  const form       = $('#contactForm');
  if (!form) return;

  const nameInput  = $('#name');
  const phoneInput = $('#phone');
  const msgInput   = $('#message');
  const submitBtn  = $('#submitBtn');
  const formSuccess = $('#formSuccess');

  const errorEls = {
    name:    $('#nameError'),
    phone:   $('#phoneError'),
    message: $('#messageError'),
  };

  // Validation rules
  const rules = {
    name: {
      validate: v => v.trim().length >= 2,
      msg: 'Please enter your full name (at least 2 characters).'
    },
    phone: {
      validate: v => /^[\d\s\+\-\(\)]{7,16}$/.test(v.trim()),
      msg: 'Please enter a valid phone number (e.g. 0801 234 5678).'
    },
    message: {
      validate: v => v.trim().length >= 10,
      msg: 'Please enter a message (at least 10 characters).'
    }
  };

  // Real-time validation on blur
  nameInput.addEventListener('blur',  () => validateField('name',    nameInput));
  phoneInput.addEventListener('blur', () => validateField('phone',   phoneInput));
  msgInput.addEventListener('blur',   () => validateField('message', msgInput));

  // Clear error on input
  nameInput.addEventListener('input',  () => clearError('name',    nameInput));
  phoneInput.addEventListener('input', () => clearError('phone',   phoneInput));
  msgInput.addEventListener('input',   () => clearError('message', msgInput));

  function validateField(key, input) {
    const rule  = rules[key];
    const valid = rule.validate(input.value);
    if (!valid) {
      showError(key, input, rule.msg);
    } else {
      clearError(key, input);
    }
    return valid;
  }

  function showError(key, input, msg) {
    errorEls[key].textContent = msg;
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(key, input) {
    errorEls[key].textContent = '';
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formSuccess.hidden = true;

    // Run all validations
    const validName  = validateField('name',    nameInput);
    const validPhone = validateField('phone',   phoneInput);
    const validMsg   = validateField('message', msgInput);

    if (!validName || !validPhone || !validMsg) {
      // Focus first errored field
      const firstError = [nameInput, phoneInput, msgInput]
        .find(inp => inp.classList.contains('error'));
      if (firstError) firstError.focus();
      return;
    }

    // Simulate form submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      await simulateSubmit({
        name:    nameInput.value.trim(),
        phone:   phoneInput.value.trim(),
        service: $('#service') ? $('#service').value : '',
        message: msgInput.value.trim(),
      });

      // Success
      formSuccess.hidden = false;
      form.reset();
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Reset success after 6s
      setTimeout(() => { formSuccess.hidden = true; }, 6000);

    } catch (err) {
      alert('Something went wrong. Please call us directly on +234 801 234 5678.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Send Message
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>`;
    }
  });

  /**
   * Simulates an async form submission (replace with real endpoint as needed)
   */
  function simulateSubmit(data) {
    console.log('Form submission data:', data);
    return new Promise((resolve) => setTimeout(resolve, 1400));
  }
})();


/* ============================================================
   6. FOOTER: dynamic year
   ============================================================ */
(function setYear() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();


/* ============================================================
   7. SERVICE CARDS: staggered entrance animation
   ============================================================ */
(function staggerServiceCards() {
  const cards = $$('.service-card');
  cards.forEach((card, i) => {
    if (!card.hasAttribute('data-delay')) {
      card.style.transitionDelay = `${(i % 3) * 0.1}s`;
    }
  });
})();


/* ============================================================
   8. HERO COUNTER ANIMATION
   ============================================================ */
(function initCounters() {
  const statNums = $$('.stat-num');
  if (!statNums.length) return;

  const targets = statNums.map(el => {
    const raw = el.textContent.trim();
    const num = parseInt(raw.replace(/\D/g, ''), 10);
    const suffix = raw.replace(/[\d]/g, '');
    return { el, num, suffix, started: false };
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = targets.find(t => t.el === entry.target);
      if (!target || target.started) return;
      target.started = true;
      animateCounter(target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.8 });

  statNums.forEach(el => observer.observe(el));

  function animateCounter({ el, num, suffix }) {
    const duration = 1800;
    const start    = performance.now();
    const easeOut  = t => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value    = Math.round(easeOut(progress) * num);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
})();


/* ============================================================
   9. FLOATING WHATSAPP BUTTON: hide on form section scroll
   ============================================================ */
(function initFloatWhatsapp() {
  const floatBtn = $('.float-whatsapp');
  if (!floatBtn) return;

  const contactSection = $('#contact');
  if (!contactSection) return;

  const obs = new IntersectionObserver((entries) => {
    const inView = entries[0].isIntersecting;
    floatBtn.style.opacity = inView ? '0' : '1';
    floatBtn.style.pointerEvents = inView ? 'none' : 'auto';
  }, { threshold: 0.3 });

  obs.observe(contactSection);
})();


/* ============================================================
   10. ACCESSIBILITY: skip-to-main link (keyboard users)
   ============================================================ */
(function initSkipLink() {
  const skip = document.createElement('a');
  skip.href = '#home';
  skip.textContent = 'Skip to main content';
  skip.style.cssText = `
    position: fixed; top: -100px; left: 12px; z-index: 9999;
    background: var(--red); color: white; padding: 10px 18px;
    border-radius: 0 0 8px 8px; font-family: var(--font-head);
    font-size: 0.85rem; letter-spacing: 0.05em; transition: top 0.2s;
  `;
  skip.addEventListener('focus', () => { skip.style.top = '0'; });
  skip.addEventListener('blur',  () => { skip.style.top = '-100px'; });
  document.body.prepend(skip);
})();
