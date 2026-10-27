/* ==========================================================================
   Plain-Text Content Loader (.md & .json) + Accessibility Preferences
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initAccessibilityPreferences();
  loadMarkdownContent();
  loadPortfolioData();
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

/* 2. Lightweight Markdown-to-HTML Parser for content/*.md files */
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
      console.warn('Fallback text remained in place for:', src);
    }
  }
}

/* 3. Dynamic JSON Loader for Grants, Publications, Courses, Education, Service */
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

    // Courses List (on teaching.html)
    const coursesContainer = document.getElementById('courses-list');
    if (coursesContainer && data.courses) {
      coursesContainer.innerHTML = data.courses.map(c => `
        <div class="pub-item">
          <div style="font-family:var(--font-mono); font-size:0.85rem; font-weight:700; color:var(--accent);">
            ${c.code} (${c.terms})
          </div>
          <h3 style="font-size:1.1rem; margin:0.25rem 0;">${c.title}</h3>
          <p style="font-size:0.95rem; color:var(--text-muted);">${c.description}</p>
        </div>
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

/* 4. Interactive Research-Teaching Nexus Logic (nexus.html) */
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
      pedagogy: 'Backward design, iterative prototyping, and peer critique in graduate studios (LDTC 621 & LDTC 642) and veterinary clinical extraction.',
      evidence: 'AIED 2026 ArguMath paper ($25k grant), Veterinary AI Tutor study, and graduate student studio portfolios.'
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
