/* ==========================================================================
   Academic Portfolio Core Application Scripts
   Dr. Armanto Sutedjo — Educational Researcher & Learning Innovation Leader
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAccessibilityPreferences();
  loadPortfolioData();
  initTeachingTabsSystem();
  initResearchTabsSystem();
  initPublicationsTabsSystem();
  initWorkshopTabsSystem();
  initServiceTabsSystem();
});

function announce(msg) {
  const el = document.getElementById('sr-announcer');
  if (el) el.textContent = msg;
}

/* 1. Persistent Accessibility Settings across all HTML pages */
function initAccessibilityPreferences() {
  const savedTheme = localStorage.getItem('portfolio_theme');
  const savedContrast = localStorage.getItem('portfolio_contrast');
  const savedFont = localStorage.getItem('portfolio_font');

  const themeBtn = document.getElementById('toggle-theme');
  const contrastBtn = document.getElementById('toggle-contrast');
  const fontBtn = document.getElementById('toggle-font');

  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    if (themeBtn) themeBtn.setAttribute('aria-pressed', 'true');
  }
  if (savedContrast === 'high') {
    document.body.setAttribute('data-contrast', 'high');
    if (contrastBtn) contrastBtn.setAttribute('aria-pressed', 'true');
  }
  if (savedFont === 'hyperlegible') {
    document.body.setAttribute('data-font', 'hyperlegible');
    if (fontBtn) fontBtn.setAttribute('aria-pressed', 'true');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('portfolio_theme', 'light');
        themeBtn.setAttribute('aria-pressed', 'false');
        announce('Dark mode disabled');
      } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('portfolio_theme', 'dark');
        themeBtn.setAttribute('aria-pressed', 'true');
        announce('Dark mode enabled');
      }
    });
  }

  if (contrastBtn) {
    contrastBtn.addEventListener('click', () => {
      const isHigh = document.body.getAttribute('data-contrast') === 'high';
      if (isHigh) {
        document.body.removeAttribute('data-contrast');
        localStorage.setItem('portfolio_contrast', 'normal');
        contrastBtn.setAttribute('aria-pressed', 'false');
        announce('High contrast disabled');
      } else {
        document.body.setAttribute('data-contrast', 'high');
        localStorage.setItem('portfolio_contrast', 'high');
        contrastBtn.setAttribute('aria-pressed', 'true');
        announce('High contrast enabled');
      }
    });
  }

  if (fontBtn) {
    fontBtn.addEventListener('click', () => {
      const isHyper = document.body.getAttribute('data-font') === 'hyperlegible';
      if (isHyper) {
        document.body.removeAttribute('data-font');
        localStorage.setItem('portfolio_font', 'standard');
        fontBtn.setAttribute('aria-pressed', 'false');
        announce('Standard font enabled');
      } else {
        document.body.setAttribute('data-font', 'hyperlegible');
        localStorage.setItem('portfolio_font', 'hyperlegible');
        fontBtn.setAttribute('aria-pressed', 'true');
        announce('Atkinson Hyperlegible font enabled');
      }
    });
  }
}

/* 2. Generic Accessible Tab Binder Function */
function bindTabSystem(tablistId, panelsWrapperId, toggleAllBtnId) {
  const tablistEl = document.getElementById(tablistId);
  const panelsWrapper = document.getElementById(panelsWrapperId);
  if (!tablistEl || !panelsWrapper) return;

  const tabs = Array.from(tablistEl.querySelectorAll('[role="tab"]'));
  const panels = Array.from(panelsWrapper.children).filter(el => el.getAttribute('role') === 'tabpanel' || el.classList.contains('tab-panel'));

  function activateTab(tab, setFocus = true) {
    tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    panels.forEach(p => {
      p.classList.remove('active');
      p.setAttribute('hidden', '');
    });

    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    if (setFocus) tab.focus();

    const targetId = tab.getAttribute('aria-controls');
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.removeAttribute('hidden');
    }

    const showAllBtn = document.getElementById(toggleAllBtnId);
    if (showAllBtn) {
      showAllBtn.setAttribute('aria-pressed', 'false');
      showAllBtn.textContent = '📖 Read All on One Page';
    }

    announce(`Selected tab: ${tab.textContent.trim()}`);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(tab, false);
    });
    tab.addEventListener('keydown', e => {
      let newIndex = null;
      if (e.key === 'ArrowRight') newIndex = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft') newIndex = (index - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') newIndex = 0;
      if (e.key === 'End') newIndex = tabs.length - 1;
      if (newIndex !== null) {
        e.preventDefault();
        activateTab(tabs[newIndex], true);
      }
    });
  });

  panelsWrapper.querySelectorAll('.tab-step-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTabId = btn.getAttribute('data-goto-tab');
      const targetTab = document.getElementById(targetTabId);
      if (targetTab) {
        activateTab(targetTab, true);
      }
    });
  });

  const showAllBtn = document.getElementById(toggleAllBtnId);
  if (showAllBtn) {
    showAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = showAllBtn.getAttribute('aria-pressed') === 'true';
      if (isExpanded) {
        showAllBtn.setAttribute('aria-pressed', 'false');
        showAllBtn.textContent = '📖 Read All on One Page';
        const activeTab = tablistEl.querySelector('[aria-selected="true"]') || tabs[0];
        activateTab(activeTab, false);
      } else {
        showAllBtn.setAttribute('aria-pressed', 'true');
        showAllBtn.textContent = '🗂️ Return to Tabbed View';
        panels.forEach(p => {
          p.classList.add('active');
          p.removeAttribute('hidden');
        });
      }
    });
  }
}

function initTeachingTabsSystem() {
  bindTabSystem('teaching-tablist', 'teaching-panels-wrapper', 'toggle-all-teaching-tabs');
}

function initResearchTabsSystem() {
  bindTabSystem('research-tablist', 'research-panels-wrapper', 'toggle-all-research-tabs');
}

function initServiceTabsSystem() {
  bindTabSystem('service-tablist', 'service-panels-wrapper', 'toggle-all-service-tabs');
}

function initWorkshopTabsSystem() {
  bindTabSystem('workshop-tablist', 'workshop-panels-wrapper', 'toggle-all-workshop-tabs');
}

function initPublicationsTabsSystem() {
  bindTabSystem('pubs-tablist', 'pubs-panels-wrapper', 'toggle-all-pubs-tabs');
}

/* 3. Dynamic JSON Loader for Grants, Publications, and Education */
async function loadPortfolioData() {
  try {
    const res = await fetch('content/portfolio-data.json');
    if (!res.ok) return;
    const data = await res.json();

    // Education list (on index.html)
    const eduContainer = document.getElementById('education-list');
    if (eduContainer && data.education) {
      eduContainer.innerHTML = data.education.map(e => `
        <tr>
          <td><strong>${e.year}</strong></td>
          <td>${e.degree}</td>
          <td>${e.institution}</td>
        </tr>
      `).join('');
    }

    // Grants Table (on research.html)
    const grantsContainer = document.getElementById('grants-table-body');
    if (grantsContainer && data.grants) {
      grantsContainer.innerHTML = data.grants.map(g => `
        <tr>
          <td><strong>${g.period}</strong></td>
          <td>${g.title}</td>
          <td>${g.agency}</td>
          <td><span class="badge">${g.role}</span></td>
          <td>${g.amount}</td>
          <td>${g.status}</td>
        </tr>
      `).join('');
    }

    // Publications lists inside publication tabs (on publications.html)
    if (data.publications) {
      const renderCard = p => `
        <article class="pub-item" style="margin-bottom:1.25rem;">
          <div style="font-size:0.78rem; font-weight:700; text-transform:uppercase; color:var(--accent);">
            ${p.type_label} • ${p.year}
          </div>
          <h3 style="font-size:1.08rem; margin:0.3rem 0; color:var(--text-main);">${p.title}</h3>
          <p style="font-size:0.92rem; color:var(--text-muted); margin-bottom:0.25rem;">${p.authors}</p>
          <p style="font-size:0.9rem; font-style:italic; color:var(--text-light);">${p.venue}</p>
          ${p.doi ? `<p style="margin-top:0.5rem;"><a href="${p.doi}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); font-weight:600; font-size:0.88rem;">Access Publication / DOI ↗</a></p>` : ''}
        </article>
      `;

      const jList = document.getElementById('list-pub-journal');
      const cList = document.getElementById('list-pub-conference');
      const rList = document.getElementById('list-pub-review');
      const aList = document.getElementById('list-pub-all');

      if (jList) jList.innerHTML = data.publications.filter(p => p.category === 'journal').map(renderCard).join('');
      if (cList) cList.innerHTML = data.publications.filter(p => p.category === 'conference').map(renderCard).join('');
      if (rList) rList.innerHTML = data.publications.filter(p => p.category === 'review').map(renderCard).join('');
      if (aList) aList.innerHTML = data.publications.map(renderCard).join('');
    }
  } catch (err) {
    console.warn('Could not load portfolio-data.json:', err);
  }
}
