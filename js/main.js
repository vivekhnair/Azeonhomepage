/* ==========================================================================
   AZEON AI - BASE INTERACTION & PLAYGROUND LOOP
   ========================================================================== */

class AzeonApp {
  constructor() {
    this.initCursor();
    this.initQueueInteraction();
    this.initSiftingObserver();
    this.initCalculator();
    this.initTopTicker();
    this.init3DTilt();
    this.initHeroConsoleSequence();
    this.initInteractiveDecision();
    this.initConversionModals();
    this.initKeyboardNav();
  }

  initCursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor) return;

    window.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });

    const hoverables = document.querySelectorAll(
      'a, button, input, .assurance-submit, .ledger-sheet, .ticket-slider, .decision-btn'
    );
    
    hoverables.forEach(item => {
      item.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      item.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  initQueueInteraction() {
    const stateLabel = document.querySelector('.queue-state-label');
    const backlogNum = document.querySelector('.queue-backlog-num');

    if (!stateLabel || !backlogNum) return;

    window.addEventListener('azeonStateChange', (e) => {
      if (e.detail.state === 'certainty') {
        stateLabel.innerText = 'RESOLVED';
        stateLabel.style.color = 'var(--status-resolved)';
        backlogNum.innerText = '0';
        backlogNum.style.color = 'var(--status-resolved)';
      } else {
        stateLabel.innerText = 'FRAGMENTED';
        stateLabel.style.color = 'var(--status-pending)';
        backlogNum.innerText = '12,840';
        backlogNum.style.color = 'var(--text-primary)';
      }
    });
  }

  initSiftingObserver() {
    const rows = document.querySelectorAll('.sifting-row');
    if (rows.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    rows.forEach(row => observer.observe(row));
  }

  initHeroConsoleSequence() {
    const consoleBox = document.querySelector('.hero-os-console');
    const heroSection = document.getElementById('scene-1');
    if (!consoleBox || !heroSection) return;

    const timeouts = [];
    const lines = [
      { id: '#line-1', delay: 400 },
      { id: '#line-2', delay: 900 },
      { id: '#line-3', delay: 1500 },
      { id: '#step-1', delay: 2200 },
      { id: '#step-2', delay: 3600 },
      { id: '#step-3', delay: 5000 },
      { id: '#step-4', delay: 6400 }
    ];

    const showElement = (selector) => {
      const el = document.querySelector(selector);
      if (el) {
        el.classList.add('visible');
        if (el.classList.contains('console-step')) {
          document.querySelectorAll('.console-step').forEach(s => s.classList.remove('active-step'));
          el.classList.add('active-step');
        }
      }
    };

    const finishSequence = () => {
      heroSection.classList.add('sequence-done');
      const decisionEvent = new CustomEvent('azeonDecisionStart');
      window.dispatchEvent(decisionEvent);
    };

    lines.forEach(item => {
      const t = setTimeout(() => showElement(item.id), item.delay);
      timeouts.push(t);
    });

    const finalT = setTimeout(finishSequence, 8200);
    timeouts.push(finalT);

    const skipBtn = document.querySelector('.console-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        timeouts.forEach(t => clearTimeout(t));
        lines.forEach(item => {
          const el = document.querySelector(item.id);
          if (el) el.classList.add('visible');
        });
        finishSequence();
      });
    }
  }

  initInteractiveDecision() {
    const cases = document.querySelectorAll('.case-item');
    const executeBtn = document.getElementById('decision-trigger-btn');
    const logBox = document.querySelector('.mutation-logs');
    const hashBox = document.querySelector('.ledger-hash-value');

    if (cases.length === 0 || !executeBtn || !logBox) return;

    const caseData = {
      case1: {
        rules: [
          { id: 'rule-plan', text: 'Validate account status & SLA... [ENTERPRISE]', status: 'success' },
          { id: 'rule-amount', text: 'Amount within auto-limit ($2,450 <= $5,000)... [VALID]', status: 'success' },
          { id: 'rule-geo', text: 'Geographic restriction check (US Account)... [VERIFIED]', status: 'success' }
        ],
        logs: [
          'LOG: Initializing execution trace for duplicate billing dispute.',
          'POLICY: SLA threshold verification passed.',
          'ORCHESTRATION: Calling Stripe Refund API payload {amount: 245000}...',
          'MUTATION: Stripe refund token ch_8a2d returned (200 OK).',
          'ORCHESTRATION: Synchronizing Salesforce case state...',
          'MUTATION: Case status updated to Closed (200 OK).'
        ],
        hash: 'sha256-8a9d12e9bcf23d38e2e28a011de87bdfc83ab29d91f274a7b0a7c427fa8319f'
      },
      case2: {
        rules: [
          { id: 'rule-plan', text: 'Validate account status & SLA... [HEALTH_PREMIUM]', status: 'success' },
          { id: 'rule-amount', text: 'Amount within auto-limit ($0.00)... [VALID]', status: 'success' },
          { id: 'rule-geo', text: 'Geographic restriction check (US-East)... [VERIFIED]', status: 'success' }
        ],
        logs: [
          'LOG: Decrypting patient record identifier checks.',
          'POLICY: HIPAA validation protocol checking active.',
          'ORCHESTRATION: Querying secure data isolation partition...',
          'MUTATION: PII credential strip verified (0 credentials leaked).',
          'ORCHESTRATION: Invoking EHR system state sync endpoint...',
          'MUTATION: Database record committed and secure audit log saved.'
        ],
        hash: 'sha256-f9d273ab38210381e028b12cb9287fd98a87d0c3bc9ea21237c82e219bdfc282'
      },
      case3: {
        rules: [
          { id: 'rule-plan', text: 'Validate account status & SLA... [B2B_STANDARD]', status: 'success' },
          { id: 'rule-amount', text: 'Amount exceeds auto-limit ($12,000 > $5,000)... [REQUIRES_AUTH]', status: 'warning' },
          { id: 'rule-geo', text: 'Geographic restriction check (EU Account)... [VERIFIED]', status: 'success' }
        ],
        logs: [
          'LOG: Initializing downgrade credit validation SOP.',
          'POLICY: SLA credit check threshold exceeded.',
          'MUTATION: Initiating compliance authorization request...',
          'WARNING: Autopilot execution suspended. Manager verification required.'
        ],
        hash: 'sha256-d88e23ba8912efc081be782aef0c83bd12e8cb0f892da7ef38ab2f9df8c8a1e2'
      }
    };

    let activeCaseKey = 'case1';

    const selectCase = (caseKey) => {
      activeCaseKey = caseKey;
      cases.forEach(c => {
        if (c.getAttribute('data-case') === caseKey) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      document.getElementById('rule-plan').innerHTML = '<span class="rule-icon">&#10003;</span> <span class="rule-text">Validate account status & SLA... [WAITING]</span>';
      document.getElementById('rule-amount').innerHTML = '<span class="rule-icon">&#10003;</span> <span class="rule-text">Amount within auto-limit... [WAITING]</span>';
      document.getElementById('rule-geo').innerHTML = '<span class="rule-icon">&#10003;</span> <span class="rule-text">Geographic restriction check... [WAITING]</span>';
      
      document.querySelectorAll('.policy-rule').forEach(r => {
        r.className = 'policy-rule';
      });

      logBox.innerHTML = '<div class="mutation-line">Awaiting execution trigger...</div>';
      if (hashBox) hashBox.innerText = 'Awaiting commit...';
      executeBtn.disabled = false;
    };

    cases.forEach(c => {
      c.addEventListener('click', () => {
        selectCase(c.getAttribute('data-case'));
      });
      c.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCase(c.getAttribute('data-case'));
        }
      });
    });

    executeBtn.addEventListener('click', () => {
      executeBtn.disabled = true;
      const data = caseData[activeCaseKey];
      if (!data) return;

      logBox.innerHTML = '';

      data.rules.forEach((rule, idx) => {
        setTimeout(() => {
          const el = document.getElementById(rule.id);
          if (el) {
            el.className = `policy-rule rule--${rule.status === 'success' ? 'matched' : 'failed'}`;
            el.querySelector('.rule-text').innerText = rule.text;
          }
        }, idx * 400);
      });

      setTimeout(() => {
        data.logs.forEach((logText, idx) => {
          setTimeout(() => {
            const line = document.createElement('div');
            line.className = 'mutation-line';
            if (logText.startsWith('MUTATION:')) {
              line.classList.add('line--success');
            } else if (logText.startsWith('WARNING:')) {
              line.classList.add('line--warning');
            }
            line.innerText = logText;
            logBox.appendChild(line);
            logBox.scrollTop = logBox.scrollHeight;
          }, idx * 400);
        });

        setTimeout(() => {
          if (hashBox) {
            hashBox.innerText = data.hash;
          }
          const decisionEvent = new CustomEvent('azeonDecisionStart');
          window.dispatchEvent(decisionEvent);
        }, data.logs.length * 400 + 100);

      }, 1000);
    });

    selectCase('case1');
  }

  initCalculator() {
    const slider = document.querySelector('.ticket-slider');
    const volumeDisplay = document.querySelector('.ticket-count-val');
    
    const costLegacy = document.querySelector('.cost-legacy-val');
    const costComp = document.querySelector('.cost-comp-val');
    const costAzeon = document.querySelector('.cost-azeon-val');

    if (!slider) return;

    const updateCosts = () => {
      const tickets = parseInt(slider.value);
      volumeDisplay.innerText = tickets.toLocaleString();

      const legacyTotal = tickets * 12;
      const compTotal = tickets * 4.5;
      const azeonTotal = tickets * 0.40;

      costLegacy.innerText = '$' + Math.floor(legacyTotal).toLocaleString();
      costComp.innerText = '$' + Math.floor(compTotal).toLocaleString();
      costAzeon.innerText = '$' + Math.floor(azeonTotal).toLocaleString();
    };

    slider.addEventListener('input', updateCosts);
    updateCosts();
  }

  initTopTicker() {
    const tickerWrapper = document.querySelector('.ticker-wrapper');
    if (!tickerWrapper) return;

    let tickerContent = `
      <div class="ticker-item">
        <div class="ticker-resolved-dot"></div>
        <span>CASE STUDY: Global retail leader scales to 85% autopilot resolution, saving $1.2M annually &mdash; <a class="readiness-trigger" style="color: var(--accent-teal); text-decoration: underline; cursor: pointer;">[Read Case Study]</a></span>
      </div>
      <div class="ticker-item">
        <div class="ticker-resolved-dot"></div>
        <span>EVENT UPDATE: Azeon exhibits at Customer Contact Week (CCW). Explore our key takeaways &mdash; <a class="blueprint-trigger" style="color: var(--accent-teal); text-decoration: underline; cursor: pointer;">[Read Article]</a></span>
      </div>
    `;

    // Duplicate content for continuous scrolling loop
    tickerWrapper.innerHTML = tickerContent + tickerContent + tickerContent + tickerContent;
  }

  init3DTilt() {
    const sheet = document.querySelector('.ledger-sheet');
    if (!sheet) return;

    // Check prefers-reduced-motion before implementing 3D tilt
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    sheet.addEventListener('mousemove', (e) => {
      const rect = sheet.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      
      gsap.to(sheet, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 900,
        ease: 'power2.out',
        duration: 0.5
      });
    });

    sheet.addEventListener('mouseleave', () => {
      gsap.to(sheet, {
        rotateX: 0,
        rotateY: 0,
        ease: 'power3.out',
        duration: 0.7
      });
    });
  }

  initKeyboardNav() {
    // Accessible Keyboard Navigation for Mega Menus
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isExpanded = link.getAttribute('aria-expanded') === 'true';
          
          // Collapse all menus first
          navLinks.forEach(l => {
            l.setAttribute('aria-expanded', 'false');
            const panel = document.getElementById(l.getAttribute('aria-controls'));
            if (panel) panel.style.opacity = '0';
          });

          // Toggle current
          if (!isExpanded) {
            link.setAttribute('aria-expanded', 'true');
            const panel = document.getElementById(link.getAttribute('aria-controls'));
            if (panel) {
              panel.style.opacity = '1';
              panel.style.pointerEvents = 'auto';
              panel.style.transform = 'translateY(0)';
            }
          }
        }
      });
    });

    // Close menus if clicking outside or hitting escape
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-item')) {
        navLinks.forEach(l => {
          l.setAttribute('aria-expanded', 'false');
          const panel = document.getElementById(l.getAttribute('aria-controls'));
          if (panel) {
            panel.removeAttribute('style');
          }
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navLinks.forEach(l => {
          l.setAttribute('aria-expanded', 'false');
          const panel = document.getElementById(l.getAttribute('aria-controls'));
          if (panel) {
            panel.removeAttribute('style');
          }
        });
        
        // Close modals and drawers
        document.querySelectorAll('.modal-overlay, .drawer-overlay').forEach(o => {
          o.classList.remove('active');
        });
      }
    });
  }

  initConversionModals() {
    const triggers = [
      { selector: '.watch-live-trigger', target: '#tour-modal' },
      { selector: '.blueprint-trigger', target: '#blueprint-modal' },
      { selector: '.readiness-trigger', target: '#assessment-drawer' }
    ];

    triggers.forEach(t => {
      const els = document.querySelectorAll(t.selector);
      const target = document.querySelector(t.target);
      if (!target) return;

      els.forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          target.classList.add('active');
          target.setAttribute('aria-hidden', 'false');
          
          if (t.target === '#assessment-drawer') {
            this.resetAssessment();
          }
          if (t.target === '#tour-modal') {
            this.resetTour();
          }
        });
      });
    });

    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const overlay = btn.closest('.modal-overlay, .drawer-overlay');
        if (overlay) {
          overlay.classList.remove('active');
          overlay.setAttribute('aria-hidden', 'true');
        }
      });
    });

    const overlays = document.querySelectorAll('.modal-overlay, .drawer-overlay');
    overlays.forEach(o => {
      o.addEventListener('click', (e) => {
        if (e.target === o) {
          o.classList.remove('active');
          o.setAttribute('aria-hidden', 'true');
        }
      });
    });

    // Guided Product Tour slide mechanics
    this.tourIndex = 0;
    this.tourSlides = document.querySelectorAll('.tour-slide');
    const nextBtn = document.querySelector('#tour-next');
    const prevBtn = document.querySelector('#tour-prev');

    if (nextBtn && prevBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.tourIndex < this.tourSlides.length - 1) {
          this.tourIndex++;
          this.updateTourSlides();
        } else {
          const overlay = nextBtn.closest('.modal-overlay');
          if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
          }
        }
      });

      prevBtn.addEventListener('click', () => {
        if (this.tourIndex > 0) {
          this.tourIndex--;
          this.updateTourSlides();
        }
      });
    }

    // Assessment Drawer Choice Stepper
    this.score = 0;
    this.questionIndex = 0;
    this.questions = document.querySelectorAll('.question-card');
    
    const optionButtons = document.querySelectorAll('.question-card .option-btn');
    optionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-score')) || 10;
        this.score += val;
        
        if (this.questionIndex < this.questions.length - 1) {
          this.questionIndex++;
          this.updateAssessmentCards();
        } else {
          this.showAssessmentResult();
        }
      });
    });
  }

  resetTour() {
    this.tourIndex = 0;
    this.updateTourSlides();
  }

  updateTourSlides() {
    this.tourSlides.forEach((s, idx) => {
      if (idx === this.tourIndex) s.classList.add('active');
      else s.classList.remove('active');
    });

    const prevBtn = document.querySelector('#tour-prev');
    const nextBtn = document.querySelector('#tour-next');
    if (prevBtn && nextBtn) {
      prevBtn.style.visibility = this.tourIndex === 0 ? 'hidden' : 'visible';
      nextBtn.innerText = this.tourIndex === this.tourSlides.length - 1 ? 'Finish' : 'Next →';
    }
  }

  resetAssessment() {
    this.score = 0;
    this.questionIndex = 0;
    const resultBox = document.querySelector('.assessment-result');
    if (resultBox) resultBox.style.display = 'none';
    this.updateAssessmentCards();
  }

  updateAssessmentCards() {
    this.questions.forEach((q, idx) => {
      if (idx === this.questionIndex) q.classList.add('active');
      else q.classList.remove('active');
    });
  }

  showAssessmentResult() {
    this.questions.forEach(q => q.classList.remove('active'));
    
    const resultBox = document.querySelector('.assessment-result');
    const scoreVal = document.querySelector('#score-val');
    const interpretationEl = document.querySelector('#score-interpretation');
    
    if (resultBox && scoreVal) {
      const percentage = Math.min(100, this.score);
      scoreVal.innerText = `${percentage}%`;

      // Specific next-step score interpretation language based on metrics
      if (percentage >= 80) {
        interpretationEl.innerText = "Excellent alignment. Your systems and policy rulesets are ideal candidates for immediate autonomous deployment.";
      } else if (percentage >= 50) {
        interpretationEl.innerText = "Moderate readiness. Azeon can automate key subsets of your queues, while other areas may require API wrappers and ruleset restructuring.";
      } else {
        interpretationEl.innerText = "Initial stage. We recommend structuring manual support logs and digital workflows before implementing autonomous execution pathways.";
      }

      resultBox.style.display = 'flex';
    }
  }
}

// Instantiate App
window.addEventListener('DOMContentLoaded', () => {
  window.azeonApp = new AzeonApp();
});
