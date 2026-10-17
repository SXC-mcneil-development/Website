(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Sticky nav background + mobile toggle ----
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // ---- Scroll-reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // ---- Availability: load units.json, render cards, wire site-plan hotspots ----
  const unitGrid = document.getElementById('unitGrid');
  const workforceNote = document.getElementById('workforceNote');
  const availLotLabel = document.getElementById('availLotLabel');
  const unitTypeSelect = document.getElementById('unitType');

  const renderUnits = (unitTypes) => {
    unitGrid.innerHTML = unitTypes
      .map((u) => {
        // Only show details once real figures exist in units.json — no placeholders.
        const details = [
          u.sqft && `<li>${u.sqft} sq ft</li>`,
          u.count && `<li>${u.count} units available</li>`,
        ].filter(Boolean);
        return `
      <div class="unit-card">
        <h3>${u.label}</h3>
        <div class="rent">${u.rentDisplay}</div>
        ${details.length ? `<ul>${details.join('')}</ul>` : ''}
        <button class="btn btn-outline" data-unit="${u.id}">Inquire — ${u.label}</button>
      </div>`;
      })
      .join('');

    unitGrid.querySelectorAll('[data-unit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (unitTypeSelect) unitTypeSelect.value = btn.dataset.unit;
        document.getElementById('contact').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        document.getElementById('name')?.focus({ preventScroll: true });
      });
    });
  };

  fetch('data/units.json')
    .then((res) => res.json())
    .then((data) => {
      renderUnits(data.unitTypes || []);
      if (workforceNote && data.workforceHousing) {
        workforceNote.textContent = data.workforceHousing.note || '';
      }
    })
    .catch(() => {
      unitGrid.innerHTML = '<p>Unit availability is temporarily unavailable. Please call (617) 780-1627.</p>';
    });

  // Site-plan hotspots (Lot B / Lot C) — both share the same Jan 1 release data.
  document.querySelectorAll('.lot-hotspot').forEach((hotspot) => {
    hotspot.addEventListener('click', () => {
      document.querySelectorAll('.lot-hotspot').forEach((h) => h.classList.remove('is-active'));
      hotspot.classList.add('is-active');
      if (availLotLabel) availLotLabel.textContent = hotspot.dataset.lot;
      document.getElementById('availStatus')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    });
  });

  // ---- Gallery lightbox ----
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('[data-full]').forEach((btn) => {
    btn.addEventListener('click', () => {
      lightboxImg.src = btn.dataset.full;
      lightboxImg.alt = btn.querySelector('img')?.alt || '';
      lightboxCaption.textContent = btn.dataset.caption || '';
      lightbox.hidden = false;
      lightboxClose.focus();
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
  };
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  // ---- Inquiry form: unit pre-fill via ?unit= and graceful fetch submit ----
  const params = new URLSearchParams(window.location.search);
  const presetUnit = params.get('unit');
  if (presetUnit && unitTypeSelect) unitTypeSelect.value = presetUnit;

  const form = document.getElementById('inquiryForm');
  const formSuccess = document.getElementById('formSuccess');
  const formError = document.getElementById('formError');

  // Delivers to both ryan@mcneil-development.com (form action) and
  // sxc@mcneil-development.com (via the hidden _cc field below) through
  // FormSubmit.co — a signup-free static-form backend. The FIRST submission
  // triggers a one-time activation email to ryan@mcneil-development.com that
  // must be clicked before delivery starts flowing. See README.
  const AJAX_ENDPOINT = 'https://formsubmit.co/ajax/ryan@mcneil-development.com';

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      formError?.classList.remove('is-visible');
      formSuccess?.classList.remove('is-visible');

      const data = new FormData(form);
      try {
        const res = await fetch(AJAX_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
        if (!res.ok) throw new Error(`FormSubmit responded ${res.status}`);
        form.reset();
        formSuccess?.classList.add('is-visible');
      } catch (err) {
        // Network/endpoint failure — fall back to a pre-filled mailto to both
        // addresses so the inquiry isn't lost.
        const subject = encodeURIComponent('Toombs Court leasing inquiry');
        const body = encodeURIComponent(
          Array.from(data.entries())
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n')
        );
        window.location.href = `mailto:ryan@mcneil-development.com,sxc@mcneil-development.com?subject=${subject}&body=${body}`;
        formError?.classList.add('is-visible');
      }
    });
  }
})();
