/* ==========================================================================
   GohnWood Interactive Layer
   Pure vanilla JS, zero dependencies, prefers-reduced-motion compliant.
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. Scroll Progress, Adaptive Translucent Nav & Mobile Menu
     ------------------------------------------------------------------------ */
  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('scroll-progress');
  const heroEl = document.querySelector('.hero');
  const navLinks = Array.from(document.querySelectorAll('.site-nav .nav-link'));
  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  function updateScrollUI() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
    if (progressBar) {
      progressBar.style.width = pct + '%';
    }

    if (header && heroEl) {
      const heroBottom = heroEl.offsetHeight - header.offsetHeight;
      header.classList.toggle('is-light', scrollY >= heroBottom);
    }

    let currentId = '';
    const marker = scrollY + window.innerHeight * 0.35;
    for (const sec of sections) {
      if (sec.offsetTop <= marker) {
        currentId = sec.id;
      }
    }
    for (const link of navLinks) {
      link.classList.toggle('is-active', link.dataset.section === currentId);
    }
  }

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        updateScrollUI();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
  updateScrollUI();

  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', () => {
      const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
      mobileBtn.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
    });
    mobileNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. Scroll Reveal (Once per element)
     ------------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------------
     3. Expandable Partner License Drawers
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.drawer-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls');
      const panel = document.getElementById(targetId);
      if (!panel) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });
  });

  /* ------------------------------------------------------------------------
     4. Hero Algorithmic Topographic & Parcel-Survey Canvas
     ------------------------------------------------------------------------ */
  const heroCanvas = document.getElementById('hero-canvas');
  const coordsEl = document.getElementById('hero-coords');

  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let heroVisible = true;
    let time = 0;

    // Critically-damped spring state for pointer offset
    let targetX = 0.5;
    let targetY = 0.5;
    let curX = 0.5;
    let curY = 0.5;

    function resizeHero() {
      const rect = heroCanvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      heroCanvas.width = Math.round(width * dpr);
      heroCanvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawHeroFrame();
    }

    function drawHeroFrame() {
      ctx.clearRect(0, 0, width, height);

      // Subtle architectural survey grid
      const gridSize = 72;
      ctx.strokeStyle = 'rgba(232, 224, 209, 0.045)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = (width % gridSize) / 2; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = (height % gridSize) / 2; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Fine intersection crosshairs
      ctx.strokeStyle = 'rgba(176, 138, 71, 0.14)';
      const tick = 3;
      ctx.beginPath();
      for (let x = (width % gridSize) / 2; x < width; x += gridSize * 2) {
        for (let y = (height % gridSize) / 2; y < height; y += gridSize * 2) {
          ctx.moveTo(x - tick, y);
          ctx.lineTo(x + tick, y);
          ctx.moveTo(x, y - tick);
          ctx.lineTo(x, y + tick);
        }
      }
      ctx.stroke();

      // Algorithmic topographic contour ribbons
      const numLines = 18;
      const stepX = 18;
      const pxOffset = (curX - 0.5) * 42;
      const pyOffset = (curY - 0.5) * 28;

      for (let i = 0; i < numLines; i++) {
        const norm = i / (numLines - 1);
        const baseY = height * (0.14 + norm * 0.74);
        const isGoldBand = i % 3 === 0;

        ctx.beginPath();
        for (let x = -stepX; x <= width + stepX; x += stepX) {
          const nx = x / Math.max(width, 1);
          const wave1 = Math.sin(nx * 4.4 + time * 0.25 + norm * 3.1) * 26;
          const wave2 = Math.cos(nx * 2.1 - time * 0.18 + norm * 5.2) * 18;
          const wave3 = Math.sin((nx - curX) * 6.0) * Math.exp(-Math.pow((norm - curY) * 2.6, 2)) * 22;
          const y = baseY + wave1 + wave2 + wave3 + pyOffset * (0.4 + norm * 0.6);
          if (x === -stepX) {
            ctx.moveTo(x + pxOffset * 0.25, y);
          } else {
            ctx.lineTo(x + pxOffset * 0.25, y);
          }
        }

        ctx.strokeStyle = isGoldBand
          ? 'rgba(176, 138, 71, 0.20)'
          : 'rgba(232, 224, 209, 0.065)';
        ctx.lineWidth = isGoldBand ? 1.15 : 0.8;
        ctx.stroke();
      }
    }

    function animateHero() {
      if (!heroVisible) return;
      time += 0.008;
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;
      drawHeroFrame();
      window.requestAnimationFrame(animateHero);
    }

    if (heroEl && !prefersReducedMotion) {
      heroEl.addEventListener('pointermove', (e) => {
        const rect = heroEl.getBoundingClientRect();
        targetX = (e.clientX - rect.left) / rect.width;
        targetY = (e.clientY - rect.top) / rect.height;
        if (coordsEl) {
          const lat = (30.2672 + (1 - targetY) * 9.6854).toFixed(4);
          const lon = (97.7431 - targetX * 22.5779).toFixed(4);
          coordsEl.textContent = `${lat}\u00b0 N  ${lon}\u00b0 W \u00b7 NATIONWIDE PRACTICE`;
        }
      });
    }

    if ('IntersectionObserver' in window && heroEl) {
      const heroObs = new IntersectionObserver(
        (entries) => {
          heroVisible = entries[0].isIntersecting;
          if (heroVisible && !prefersReducedMotion) {
            window.requestAnimationFrame(animateHero);
          }
        },
        { threshold: 0.05 }
      );
      heroObs.observe(heroEl);
    }

    window.addEventListener('resize', resizeHero, { passive: true });
    resizeHero();
    if (!prefersReducedMotion) {
      window.requestAnimationFrame(animateHero);
    }
  }

  /* ------------------------------------------------------------------------
     5. Interactive Method Switchboard & Empirical Data Canvas
     ------------------------------------------------------------------------ */
  const methodCanvas = document.getElementById('method-canvas');
  const methodTabs = Array.from(document.querySelectorAll('.method-tab'));
  const canvasTag = document.getElementById('canvas-tag');
  const canvasMetric = document.getElementById('canvas-metric');
  const canvasLegend = document.getElementById('canvas-legend');
  const methodCopy = document.getElementById('method-copy');
  const methodEyebrow = document.getElementById('method-eyebrow');
  const methodHeading = document.getElementById('method-heading');
  const methodLead = document.getElementById('method-lead');
  const methodPoints = document.getElementById('method-points');

  const MODES = {
    market: {
      tag: 'MODEL 01 \u00b7 EMPIRICAL MARKET DISTRIBUTION',
      metric: 'N = 148 TRANSACTIONS',
      eyebrow: 'PRINCIPLE',
      heading: 'A few comps is a candle. We bring the whole market.',
      lead: 'Appraisal is not the isolated measurement of a building. It is the disciplined interpretation of a market, with the subject property posed as a query to that market.',
      points: [
        'Pre-model market distributions before selecting comparables, narrowing judgment to what the evidence supports.',
        'Corroborate facts across independent documentary records so every input is reproducible on cross-examination.',
        'Deliver concise, table-forward reports where every adjustment is transparent and earned by convergence.'
      ],
      legend: [
        { color: '#b08a47', label: 'Empirical Market Density' },
        { color: '#fbf8f2', label: 'Subject Query' },
        { color: 'rgba(232,224,209,0.45)', label: 'Interquartile Band' }
      ]
    },
    cohort: {
      tag: 'MODEL 02 \u00b7 FRONT-END COHORT EQUITY (STANDARDS 5 & 6)',
      metric: 'COD 6.4% \u00b7 64 COMMERCIAL PARCELS',
      eyebrow: 'PUBLIC SECTOR',
      heading: 'Single-property rigor across an entire commercial roll.',
      lead: 'We bridge USPAP Standards 5 and 6 mass valuation with Standards 1 and 2 litigation defensibility, tightening roll equity before notices ever go out.',
      points: [
        'Model full commercial cohorts (hotels, multifamily, retail, industrial) using ground-up income and expense structures.',
        'Align market value with statutory equal-and-uniform equity to eliminate recurring appeal vulnerabilities.',
        'Build sensitivity-tested cap-rate and operating-expense benchmarks directly from verified empirical datasets.'
      ],
      legend: [
        { color: 'rgba(232,224,209,0.32)', label: 'Prior Uncalibrated Dispersion' },
        { color: '#b08a47', label: 'GohnWood Cohort Calibration' },
        { color: '#fbf8f2', label: '1.00 Equity Parity Line' }
      ]
    },
    bookends: {
      tag: 'MODEL 03 \u00b7 PROPRIETARY AI & HUMAN BOOKENDS',
      metric: '100% PRINCIPAL JUDGMENT',
      eyebrow: 'ARCHITECTURE',
      heading: 'Humans own the bookends. Systems accelerate the middle.',
      lead: 'AI excels within a defined frame, never at choosing the frame. Our principals own legal framing, reconciliation, and testimony; proprietary pipelines handle scale.',
      points: [
        'Bookend 1 (Principals): Governing law, property rights, valuation problem definition, and methodology.',
        'Middle (Proprietary Engine): Document ingestion, public-record verification, market modeling, and QC audits.',
        'Bookend 2 (Principals): Comparable selection, value reconciliation, signed conclusions, and courtroom testimony.'
      ],
      legend: [
        { color: '#b08a47', label: 'Partner Bookends (Law & Judgment)' },
        { color: '#e8e0d1', label: 'Proprietary Agent Engine (Scale & QC)' }
      ]
    }
  };

  // Deterministic pseudo-random helper so charts stay crisp and consistent
  function seeded(seed) {
    let s = seed % 2147483647;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  let currentMode = 'market';
  let animProgress = 1;
  let methodRaf = null;

  function renderMethodCanvas(mode, t) {
    if (!methodCanvas) return;
    const ctx = methodCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = methodCanvas.clientWidth || 640;
    const cssH = Math.round(cssW * 0.53);
    methodCanvas.width = Math.round(cssW * dpr);
    methodCanvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = cssW;
    const h = cssH;
    const pad = { top: 24, right: 24, bottom: 38, left: 42 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(232, 224, 209, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }

    const ease = 1 - Math.pow(1 - t, 3);

    if (mode === 'market') {
      // Interquartile shaded band
      const iqLeft = pad.left + plotW * 0.34;
      const iqRight = pad.left + plotW * 0.68;
      ctx.fillStyle = 'rgba(232, 224, 209, 0.06)';
      ctx.fillRect(iqLeft, pad.top, iqRight - iqLeft, plotH);

      // Market kernel density curve
      ctx.beginPath();
      const samples = 120;
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const x = pad.left + u * plotW;
        const g1 = Math.exp(-Math.pow((u - 0.51) / 0.16, 2));
        const g2 = 0.24 * Math.exp(-Math.pow((u - 0.72) / 0.11, 2));
        const density = (g1 + g2) / 1.15;
        const y = pad.top + plotH - density * plotH * 0.84 * ease;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#b08a47';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Fill under curve
      ctx.lineTo(pad.left + plotW, pad.top + plotH);
      ctx.lineTo(pad.left, pad.top + plotH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
      grad.addColorStop(0, 'rgba(176, 138, 71, 0.28)');
      grad.addColorStop(1, 'rgba(176, 138, 71, 0.01)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Individual transaction ticks along baseline
      const rand = seeded(42);
      ctx.fillStyle = 'rgba(232, 224, 209, 0.45)';
      for (let i = 0; i < 64; i++) {
        const u = Math.min(0.96, Math.max(0.04, 0.51 + (rand() + rand() + rand() - 1.5) * 0.26));
        const x = pad.left + u * plotW;
        ctx.fillRect(x, pad.top + plotH - 5, 1.5, 5);
      }

      // Subject property vertical query line
      const subjX = pad.left + plotW * 0.54;
      ctx.strokeStyle = '#fbf8f2';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(subjX, pad.top + 8);
      ctx.lineTo(subjX, pad.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fbf8f2';
      ctx.beginPath();
      ctx.arc(subjX, pad.top + plotH - 0.82 * plotH * ease, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = '#fbf8f2';
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillText('SUBJECT QUERY', subjX + 8, pad.top + 18);

      ctx.fillStyle = '#9a9ea2';
      ctx.fillText('LOWER TAIL', pad.left, h - 14);
      ctx.fillText('MARKET MEDIAN', pad.left + plotW * 0.43, h - 14);
      ctx.fillText('UPPER TAIL', w - pad.right - 64, h - 14);
    } else if (mode === 'cohort') {
      // 1.00 Equity parity horizontal line
      const midY = pad.top + plotH * 0.5;
      ctx.strokeStyle = '#fbf8f2';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, midY);
      ctx.lineTo(w - pad.right, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Target equity corridor (+/- 8%)
      const bandH = plotH * 0.18;
      ctx.fillStyle = 'rgba(176, 138, 71, 0.12)';
      ctx.fillRect(pad.left, midY - bandH / 2, plotW, bandH);

      const rand = seeded(108);
      for (let i = 0; i < 48; i++) {
        const u = 0.04 + (i / 47) * 0.92;
        const x = pad.left + u * plotW;
        const wideErr = (rand() - 0.5) * plotH * 0.78;
        const tightErr = wideErr * 0.24;

        // Prior uncalibrated ghost dot
        ctx.fillStyle = 'rgba(232, 224, 209, 0.22)';
        ctx.beginPath();
        ctx.arc(x, midY + wideErr, 3, 0, Math.PI * 2);
        ctx.fill();

        // Connecting pull line
        const curY = midY + wideErr + (tightErr - wideErr) * ease;
        ctx.strokeStyle = 'rgba(176, 138, 71, 0.22)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x, midY + wideErr);
        ctx.lineTo(x, curY);
        ctx.stroke();

        // Calibrated GohnWood parcel point
        ctx.fillStyle = '#c59f5b';
        ctx.beginPath();
        ctx.arc(x, curY, 3.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(34, 36, 38, 0.85)';
      ctx.fillRect(pad.left + 2, midY - bandH / 2 - 18, 76, 14);
      ctx.fillStyle = '#fbf8f2';
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillText('1.00 PARITY', pad.left + 6, midY - bandH / 2 - 7);
      ctx.fillStyle = '#9a9ea2';
      ctx.fillText('SMALLER ASSETS', pad.left, h - 14);
      ctx.fillText('INSTITUTIONAL ASSETS', w - pad.right - 130, h - 14);
      ctx.fillText('1.30', 8, pad.top + 8);
      ctx.fillText('1.00', 8, midY + 3);
      ctx.fillText('0.70', 8, pad.top + plotH);
    } else if (mode === 'bookends') {
      // Three architectural stages connected by precision rails
      const stages = [
        {
          code: 'BOOKEND 01',
          title: 'Partner Framing',
          lines: ['Governing Law', 'Property Rights', 'Problem Scope'],
          gold: true
        },
        {
          code: 'MIDDLE ENGINE',
          title: 'Proprietary AI',
          lines: ['Record Ingestion', 'Corroboration', 'Market Modeling'],
          gold: false
        },
        {
          code: 'BOOKEND 02',
          title: 'Partner Judgment',
          lines: ['Reconciliation', 'Signed Report', 'Court Testimony'],
          gold: true
        }
      ];

      const gap = Math.max(14, plotW * 0.05);
      const boxW = (plotW - gap * 2) / 3;
      const boxH = plotH * 0.72;
      const boxY = pad.top + (plotH - boxH) / 2;

      // Connecting rails
      const railY = boxY + boxH / 2;
      ctx.strokeStyle = 'rgba(176, 138, 71, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pad.left + boxW, railY);
      ctx.lineTo(pad.left + boxW + gap * ease, railY);
      ctx.moveTo(pad.left + boxW * 2 + gap, railY);
      ctx.lineTo(pad.left + boxW * 2 + gap + gap * ease, railY);
      ctx.stroke();

      stages.forEach((st, idx) => {
        const bx = pad.left + idx * (boxW + gap);
        ctx.fillStyle = st.gold ? 'rgba(176, 138, 71, 0.14)' : 'rgba(232, 224, 209, 0.06)';
        ctx.strokeStyle = st.gold ? '#b08a47' : 'rgba(232, 224, 209, 0.32)';
        ctx.lineWidth = st.gold ? 1.5 : 1;

        ctx.beginPath();
        ctx.rect(bx, boxY, boxW, boxH);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = st.gold ? '#c59f5b' : '#9a9ea2';
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.fillText(st.code, bx + 12, boxY + 22);

        ctx.fillStyle = '#fbf8f2';
        ctx.font = '400 13px Optima, Georgia, serif';
        ctx.fillText(st.title, bx + 12, boxY + 44);

        ctx.fillStyle = 'rgba(232, 224, 209, 0.78)';
        ctx.font = '400 10.5px Georgia, serif';
        st.lines.forEach((ln, li) => {
          ctx.fillText('\u00b7 ' + ln, bx + 12, boxY + 72 + li * 20);
        });
      });

      ctx.fillStyle = '#9a9ea2';
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillText('ZERO AI JUDGMENT \u00b7 FULL DOCUMENTARY AUDIT TRAIL', pad.left, h - 14);
    }
  }

  function setMethodMode(mode, animate) {
    const data = MODES[mode];
    if (!data) return;
    currentMode = mode;

    methodTabs.forEach((tab) => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    if (canvasTag) canvasTag.textContent = data.tag;
    if (canvasMetric) canvasMetric.textContent = data.metric;

    if (canvasLegend) {
      canvasLegend.innerHTML = data.legend
        .map(
          (item) =>
            `<span class="legend-item"><span class="legend-swatch" style="background:${item.color}"></span>${item.label}</span>`
        )
        .join('');
    }

    if (methodCopy) {
      methodCopy.classList.add('is-swapping');
      window.setTimeout(() => {
        if (methodEyebrow) methodEyebrow.textContent = data.eyebrow;
        if (methodHeading) methodHeading.textContent = data.heading;
        if (methodLead) methodLead.textContent = data.lead;
        if (methodPoints) {
          methodPoints.innerHTML = data.points.map((pt) => `<li>${pt}</li>`).join('');
        }
        methodCopy.classList.remove('is-swapping');
      }, prefersReducedMotion ? 0 : 120);
    }

    if (methodRaf) window.cancelAnimationFrame(methodRaf);
    if (!animate || prefersReducedMotion) {
      animProgress = 1;
      renderMethodCanvas(mode, 1);
      return;
    }

    animProgress = 0;
    const start = performance.now();
    const duration = 520;
    function step(now) {
      animProgress = Math.min(1, (now - start) / duration);
      renderMethodCanvas(mode, animProgress);
      if (animProgress < 1) {
        methodRaf = window.requestAnimationFrame(step);
      }
    }
    methodRaf = window.requestAnimationFrame(step);
  }

  methodTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.dataset.mode !== currentMode) {
        setMethodMode(tab.dataset.mode, true);
      }
    });
  });

  window.addEventListener('resize', () => renderMethodCanvas(currentMode, 1), { passive: true });
  setMethodMode('market', false);

  /* ------------------------------------------------------------------------
     6. Zero-Backend Engagement Inquiry Composer
     ------------------------------------------------------------------------ */
  const inquiryForm = document.getElementById('inquiry-form');
  const copyBriefBtn = document.getElementById('copy-brief-btn');
  const formStatus = document.getElementById('form-status');

  function buildInquiryPayload() {
    const matterType = document.getElementById('matter-type').value;
    const name = document.getElementById('sender-name').value.trim();
    const jurisdiction = document.getElementById('jurisdiction').value.trim();
    const recipientVal = document.getElementById('recipient').value;
    const summary = document.getElementById('matter-summary').value.trim();

    let to = 'justin@gohnwood.com,josh@gohnwood.com';
    if (recipientVal === 'josh') to = 'josh@gohnwood.com';
    if (recipientVal === 'justin') to = 'justin@gohnwood.com';

    const subject = `GohnWood Inquiry: ${matterType}${jurisdiction ? ' (' + jurisdiction + ')' : ''}`;
    const bodyLines = [
      `Matter Type: ${matterType}`,
      name ? `From: ${name}` : null,
      jurisdiction ? `Jurisdiction: ${jurisdiction}` : null,
      '',
      summary || 'Please let us know a good time to discuss this matter and run a conflicts check.'
    ].filter((line) => line !== null);

    return { to, subject, body: bodyLines.join('\n') };
  }

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const { to, subject, body } = buildInquiryPayload();
      const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      if (formStatus) {
        formStatus.textContent = 'Opening email draft in your default mail client.';
      }
    });
  }

  if (copyBriefBtn) {
    copyBriefBtn.addEventListener('click', async () => {
      const { to, subject, body } = buildInquiryPayload();
      const fullText = `To: ${to}\nSubject: ${subject}\n\n${body}`;
      try {
        await navigator.clipboard.writeText(fullText);
        if (formStatus) {
          formStatus.textContent = 'Inquiry brief copied to clipboard.';
        }
      } catch (_err) {
        if (formStatus) {
          formStatus.textContent = 'Copy failed. Use Open Email Draft or email justin@gohnwood.com directly.';
        }
      }
    });
  }
})();
