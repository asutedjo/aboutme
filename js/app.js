/* ==========================================================================
   Academic Portfolio Content Loader, Multi-Tab Teaching System & A11y
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initAccessibilityPreferences();
  loadMarkdownContent();
  loadPortfolioData();
  initTeachingTabsSystem();
  initNexusDiagram();
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

/* 2. Lightweight Markdown-to-HTML Parser */
function parseSimpleMarkdown(mdText) {
  const lines = mdText.split(/\r?\n/);
  let html = '';
  let inList = false;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) { html += '</ul>'; inList = false; }
      return;
    }
    if (trimmed.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1>${trimmed.slice(2)}</h1>`;
    } else if (trimmed.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${trimmed.slice(3)}</h2>`;
    } else if (trimmed.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${trimmed.slice(4)}</h3>`;
    } else if (trimmed.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${trimmed.slice(2)}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${trimmed}</p>`;
    }
  });
  if (inList) html += '</ul>';
  return html;
}

async function loadMarkdownContent() {
  const containers = document.querySelectorAll('[data-markdown-src]');
  for (const el of containers) {
    const src = el.getAttribute('data-markdown-src');
    try {
      const response = await fetch(src);
      if (response.ok) {
        const text = await response.text();
        el.innerHTML = parseSimpleMarkdown(text);
      }
    } catch (err) {
      console.warn('Using embedded fallback content for:', src);
    }
  }
}

/* 3. Dynamic Multi-Tab Builder for Teaching Philosophy (teaching.html) */
async function initTeachingTabsSystem() {
  const tablistEl = document.getElementById('teaching-tablist');
  const panelsWrapper = document.getElementById('teaching-panels-wrapper');
  if (!tablistEl || !panelsWrapper) return;

  const showAllBtn = document.getElementById('toggle-all-teaching-tabs');

  // Bind embedded fallback tabs immediately
  bindAccessibleTabs(tablistEl, panelsWrapper);

  // Fetch content/teaching.md dynamically when hosted on GitHub Pages
  try {
    const res = await fetch('content/teaching.md');
    if (res.ok) {
      const mdText = await res.text();
      buildTabsFromMarkdown(mdText, tablistEl, panelsWrapper);
    }
  } catch (err) {
    console.warn('Using embedded fallback tabs for teaching.html');
  }

  // Toggle "Read All Tabs on One Page"
  if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
      const isExpanded = showAllBtn.getAttribute('aria-pressed') === 'true';
      const allPanels = panelsWrapper.querySelectorAll('.tab-panel');
      if (isExpanded) {
        showAllBtn.setAttribute('aria-pressed', 'false');
        showAllBtn.textContent = '📖 Read Full Statement on One Page';
        const selectedTab = tablistEl.querySelector('[aria-selected="true"]');
        const activeId = selectedTab ? selectedTab.getAttribute('aria-controls') : (allPanels[0] && allPanels[0].id);
        allPanels.forEach(p => {
          if (p.id === activeId) {
            p.classList.add('active');
            p.removeAttribute('hidden');
          } else {
            p.classList.remove('active');
            p.setAttribute('hidden', '');
          }
        });
        announce('Switched to tabbed view');
      } else {
        showAllBtn.setAttribute('aria-pressed', 'true');
        showAllBtn.textContent = '🗂️ Return to Tabbed View';
        allPanels.forEach(p => {
          p.classList.add('active');
          p.removeAttribute('hidden');
        });
        announce('Showing all teaching philosophy sections and courses on one page');
      }
    });
  }
}

function buildTabsFromMarkdown(mdText, tablistEl, panelsWrapper) {
  const coursesPanel = document.getElementById('panel-courses');
  const lines = mdText.split(/\r?\n/);

  let pageTitle = 'Teaching Philosophy & Graduate Instruction';
  const sections = [];
  let currentSection = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      pageTitle = trimmed.slice(2).trim();
    } else if (trimmed.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        title: trimmed.slice(3).trim(),
        bodyLines: []
      };
    } else {
      if (currentSection) {
        currentSection.bodyLines.push(line);
      }
    }
  });
  if (currentSection) sections.push(currentSection);

  const headingEl = document.getElementById('teaching-main-heading');
  if (headingEl) headingEl.textContent = pageTitle;

  if (!sections.length) return;

  // Build Tab Buttons matching the exact ## titles + final "Courses Taught" tab
  let tabsHtml = '';
  sections.forEach((sec, idx) => {
    const isSelected = idx === 0 ? 'true' : 'false';
    const tabIndex = idx === 0 ? '0' : '-1';
    tabsHtml += `
      <button type="button" role="tab" class="tab-btn"
        id="tab-sec-${idx + 1}"
        aria-selected="${isSelected}"
        aria-controls="panel-sec-${idx + 1}"
        tabindex="${tabIndex}">
        ${sec.title}
      </button>
    `;
  });

  tabsHtml += `
    <button type="button" role="tab" class="tab-btn"
      id="tab-courses"
      aria-selected="false"
      aria-controls="panel-courses"
      tabindex="-1">
      Courses Taught
    </button>
  `;
  tablistEl.innerHTML = tabsHtml;

  // Build Tab Panels
  panelsWrapper.innerHTML = '';
  sections.forEach((sec, idx) => {
    const panelDiv = document.createElement('section');
    panelDiv.id = `panel-sec-${idx + 1}`;
    panelDiv.setAttribute('role', 'tabpanel');
    panelDiv.setAttribute('aria-labelledby', `tab-sec-${idx + 1}`);
    panelDiv.setAttribute('tabindex', '0');
    panelDiv.className = idx === 0 ? 'tab-panel active markdown-body' : 'tab-panel markdown-body';
    if (idx !== 0) panelDiv.setAttribute('hidden', '');

    const bodyHtml = parseSimpleMarkdown(sec.bodyLines.join('\n'));
    const prevBtn = idx > 0
      ? `<button type="button" class="btn btn-secondary tab-step-btn" data-goto-tab="tab-sec-${idx}">← Previous: ${sections[idx - 1].title}</button>`
      : `<span></span>`;
    const nextTarget = idx < sections.length - 1 ? `tab-sec-${idx + 2}` : 'tab-courses';
    const nextLabel = idx < sections.length - 1 ? `Next: ${sections[idx + 1].title} →` : `Next: Courses Taught →`;

    panelDiv.innerHTML = `
      <h2>${sec.title}</h2>
      ${bodyHtml}
      <div class="tab-footer-nav">
        ${prevBtn}
        <button type="button" class="btn btn-primary tab-step-btn" data-goto-tab="${nextTarget}">${nextLabel}</button>
      </div>
    `;
    panelsWrapper.appendChild(panelDiv);
  });

  // Append Courses Taught panel at the end
  if (coursesPanel) {
    coursesPanel.classList.remove('active');
    coursesPanel.setAttribute('hidden', '');
    const prevBtnInCourses = coursesPanel.querySelector('.tab-step-btn');
    if (prevBtnInCourses && sections.length) {
      prevBtnInCourses.setAttribute('data-goto-tab', `tab-sec-${sections.length}`);
      prevBtnInCourses.textContent = `← Previous: ${sections[sections.length - 1].title}`;
    }
    panelsWrapper.appendChild(coursesPanel);
  }

  bindAccessibleTabs(tablistEl, panelsWrapper);
}

function bindAccessibleTabs(tablistEl, panelsWrapper) {
  const tabs = Array.from(tablistEl.querySelectorAll('[role="tab"]'));
  const panels = Array.from(panelsWrapper.querySelectorAll('[role="tabpanel"]'));

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

    const showAllBtn = document.getElementById('toggle-all-teaching-tabs');
    if (showAllBtn) {
      showAllBtn.setAttribute('aria-pressed', 'false');
      showAllBtn.textContent = '📖 Read Full Statement on One Page';
    }

    announce(`Selected tab: ${tab.textContent.trim()}`);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab, false));
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
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-goto-tab');
      const targetTab = document.getElementById(targetTabId);
      if (targetTab) {
        activateTab(targetTab, true);
      }
    });
  });
}

/* 4. Dynamic JSON Loader for Grants, Publications, Courses, Education, Service */
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

    // Publications List (on publications.html)
    const pubsContainer = document.getElementById('publications-list');
    if (pubsContainer && data.publications) {
      const renderPubs = (filter = 'all') => {
        const filtered = data.publications.filter(p => filter === 'all' || p.category === filter);
        pubsContainer.innerHTML = filtered.map(p => `
          <article class="pub-item">
            <div style="font-size:0.78rem; font-weight:700; text-transform:uppercase; color:var(--accent);">
              ${p.type_label} • ${p.year}
            </div>
            <h3 style="font-size:1.08rem; margin:0.3rem 0;">${p.title}</h3>
            <p style="font-size:0.92rem; color:var(--text-muted); margin-bottom:0.25rem;">${p.authors}</p>
            <p style="font-size:0.9rem; font-style:italic; color:var(--text-light);">${p.venue}</p>
            ${p.doi ? `<p style="margin-top:0.5rem;"><a href="${p.doi}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); font-weight:600; font-size:0.88rem;">Access Publication / DOI ↗</a></p>` : ''}
          </article>
        `).join('');
        announce(`Showing ${filtered.length} publications`);
      };
      renderPubs('all');

      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderPubs(btn.getAttribute('data-filter'));
        });
      });
    }

    // Courses List inside "Courses Taught" tab (on teaching.html)
    const coursesContainer = document.getElementById('courses-list');
    if (coursesContainer && data.courses) {
      coursesContainer.innerHTML = data.courses.map(c => `
        <article class="course-card">
          <div class="course-meta-row">
            <span style="font-family:var(--font-mono); font-size:0.9rem; font-weight:700; color:var(--accent);">
              ${c.code} • ${c.terms}
            </span>
            <span class="badge">${c.level || 'Graduate Course Level'}</span>
          </div>
          <h3 style="font-size:1.2rem; color:var(--text-main); margin-bottom:0.4rem;">${c.title}</h3>
          <p style="font-size:0.95rem; color:var(--text-muted); margin-bottom:0.75rem;">${c.description}</p>
          ${c.tools ? `<p style="font-size:0.84rem; color:var(--text-light);"><strong>Core Technologies &amp; Frameworks:</strong> ${c.tools}</p>` : ''}
        </article>
      `).join('');
    }

    // Service Lists (on service.html)
    if (data.service) {
      const jList = document.getElementById('service-journals');
      const cList = document.getElementById('service-conferences');
      const uList = document.getElementById('service-committees');
      if (jList) jList.innerHTML = data.service.journals.map(i => `<li>${i}</li>`).join('');
      if (cList) cList.innerHTML = data.service.conferences.map(i => `<li>${i}</li>`).join('');
      if (uList) uList.innerHTML = data.service.committees.map(i => `<li>${i}</li>`).join('');
    }
  } catch (err) {
    console.warn('Could not load portfolio-data.json dynamically:', err);
  }
}

/* 5. Interactive Research-Teaching Nexus Logic (nexus.html) */
function initNexusDiagram() {
  const nodes = document.querySelectorAll('.diagram-node');
  if (!nodes.length) return;

  const nexusMap = {
    'r1': {
      pair: 't1',
      title: 'Pillar 1: Institutional Readiness, AI-TPACK & Ethical AI Adoption',
      theory: 'Cross-institutional policy analysis (Studies in Technology Enhanced Learning, 2025), AI-TPACK (Frontiers in Education, 2026), and TAM2 student perception models.',
      pedagogy: 'Learners evaluate where generative and predictive systems add value, test AI outputs against empirical evidence, and uphold human oversight.',
      evidence: 'Published journal studies, IRB-approved TAM2 survey research, and campus-wide AI Playground workshops.'
    },
    'r2': {
      pair: 't2',
      title: 'Pillar 2: Multi-Agent Simulated Classrooms (ArguMath) & Game-Based Learning',
      theory: 'Design-Based Research (DBR), human-computer interaction, and naturalistic inquiry in STEM digital game-based learning (Springer, 2021).',
      pedagogy: 'Backward design, iterative prototyping, and peer critique in graduate courses (LDTC 621 & LDTC 642) and veterinary clinical extraction.',
      evidence: 'AIED 2026 ArguMath paper ($25k grant), Veterinary AI Tutor study, and graduate student design portfolios.'
    },
    'r3': {
      pair: 't3',
      title: 'Pillar 3: Learner Self-Regulation, Metacognition & Learning Analytics',
      theory: 'Self-Regulated Learning (SRL), metacognitive scaffolding via Gemini + Canvas, and analytics-informed course redesign.',
      pedagogy: 'Flexible learning pathways and formative analytics check-ins that build transferable professional judgment.',
      evidence: 'Principal Investigator on $24,000 Galloway Foundation Grant (2026–2027) and enterprise Canvas analytics initiatives.'
    }
  };

  function selectDimension(key) {
    const info = nexusMap[key];
    if (!info) return;

    nodes.forEach(n => n.setAttribute('aria-selected', 'false'));
    const leftNode = document.getElementById(`node-${key}`);
    const rightNode = document.getElementById(`node-${info.pair}`);
    if (leftNode) leftNode.setAttribute('aria-selected', 'true');
    if (rightNode) rightNode.setAttribute('aria-selected', 'true');

    document.getElementById('nexus-title').textContent = info.title;
    document.getElementById('nexus-theory').textContent = info.theory;
    document.getElementById('nexus-pedagogy').textContent = info.pedagogy;
    document.getElementById('nexus-evidence').textContent = info.evidence;
    announce(`Selected ${info.title}`);
  }

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const dim = node.getAttribute('data-dim');
      selectDimension(dim);
    });
  });
}
