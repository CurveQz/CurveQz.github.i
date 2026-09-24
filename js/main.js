/*
 * CurveQz — สคริปต์ของหน้าเว็บ
 * ข้อมูลทีมและเมนูอยู่ใน js/data.js (ต้องโหลดก่อนไฟล์นี้)
 *
 * 1. เลื่อนหน้าแบบนุ่มนวลเมื่อกดลิงก์ในแถบเมนู
 * 2. สร้างตารางวัตถุดิบ + ปุ่มสลับเมนู + เครื่องคำนวณจำนวนจาน จาก MENUS
 * 3. สร้างตารางทีม จาก TEAM
 * 4. กราฟหน้าแรก: ชี้/แตะแล้วบอกเวลาและช่วงของวัน
 * 5. เมนูบอกว่ากำลังอ่านส่วนไหน
 * 6. เนื้อหาค่อยๆ เผยขึ้นตอนเลื่อนถึง
 * 7. เตรียมตารางให้กลายเป็นการ์ดบนมือถือ
 */

// กัน HTML แปลกๆ หลุดเข้าไปในหน้า ถ้ามีคนพิมพ์ < หรือ & ใน data.js
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- 1. Smooth scroll (หักความสูงแถบเมนูที่ติดด้านบน) ---------- */
function setupSmoothScroll() {
  const header = document.querySelector('header');

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      const target = id && id !== '#' ? document.querySelector(id) : null;
      if (!target) return;

      e.preventDefault();
      const offset = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      history.pushState(null, '', id);
    });
  });
}

/* ---------- 2. ตารางวัตถุดิบ + เครื่องคำนวณจำนวนจาน ---------- */
const BOM_MAX_QTY = 999;
const bomState = { menu: 0, qty: 50 };

// เลขไทยแบบมีคอมมา ทศนิยมไม่เกิน 1-2 ตำแหน่ง (0.4, 7.5, 1,250)
function formatNumber(n) {
  return n.toLocaleString('th-TH', { maximumFractionDigits: n < 10 ? 2 : 1 });
}

// 7500 กรัม -> "7.5 กก." / 1250 มล. -> "1.25 ลิตร"
function formatAmount(value, unit) {
  if (unit === 'กรัม' && value >= 1000) return `${formatNumber(value / 1000)} กก.`;
  if (unit === 'มล.' && value >= 1000) return `${formatNumber(value / 1000)} ลิตร`;
  return `${formatNumber(value)} ${unit}`;
}

function renderBomRows({ animate = false } = {}) {
  const body = document.getElementById('bomTableBody');
  const menu = MENUS[bomState.menu];
  if (!body || !menu) return;

  body.innerHTML = menu.items.map((item) => `
    <tr>
      <td class="bom-name">${escapeHtml(item.name)}</td>
      <td><span class="portion-val">${escapeHtml(formatAmount(item.amount, item.unit))}</span></td>
      <td class="bom-total"><span class="total-val${animate ? ' bump' : ''}">${escapeHtml(formatAmount(item.amount * bomState.qty, item.unit))}</span></td>
      <td><span class="shelf-badge">${escapeHtml(item.shelf)}</span></td>
      <td><span class="risk-tag ${escapeHtml(item.risk)}"><span aria-hidden="true">●</span> ${escapeHtml(item.riskText)}</span></td>
      <td class="bom-rule">${escapeHtml(item.rule)}</td>
    </tr>
  `).join('');

  document.dispatchEvent(new CustomEvent('bom:rendered'));
}

function setQty(value, opts) {
  const n = Math.round(Number(value));
  bomState.qty = Number.isFinite(n) ? Math.min(Math.max(n, 0), BOM_MAX_QTY) : 0;
  const input = document.getElementById('bomQty');
  if (input && input.value !== String(bomState.qty)) input.value = bomState.qty;   // แก้ช่องว่าง/เกินขอบให้เป็นเลขที่ใช้จริง
  renderBomRows(opts);
}

function setupBomExplorer() {
  const tabs = document.getElementById('bomTabs');
  if (!tabs || typeof MENUS === 'undefined' || MENUS.length === 0) return;

  // ปุ่มเลือกเมนู (สร้างจาก MENUS)
  tabs.innerHTML = MENUS.map((menu, i) => `
    <button type="button" class="bom-tab${i === 0 ? ' active' : ''}" data-index="${i}" aria-pressed="${i === 0}">
      ${escapeHtml(menu.label)}
    </button>
  `).join('');

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.bom-tab');
    if (!btn) return;
    tabs.querySelectorAll('.bom-tab').forEach((t) => {
      t.classList.toggle('active', t === btn);
      t.setAttribute('aria-pressed', String(t === btn));
    });
    bomState.menu = Number(btn.dataset.index);
    renderBomRows();          // จำนวนจานคงเดิมตอนสลับเมนู
  });

  // ช่องกรอกจำนวนจาน + ปุ่ม −/+
  const input = document.getElementById('bomQty');
  if (input) {
    bomState.qty = Number(input.value) || 0;
    input.addEventListener('input', () => {
      if (input.value === '') return;            // กำลังลบเพื่อพิมพ์ใหม่ อย่าเพิ่งคำนวณ
      setQty(input.value, { animate: true });
    });
    input.addEventListener('blur', () => setQty(input.value));
  }
  document.querySelectorAll('.stepper-btn').forEach((btn) => {
    btn.addEventListener('click', () => setQty(bomState.qty + Number(btn.dataset.step), { animate: true }));
  });

  renderBomRows();
}

/* ---------- 3. ตารางทีม ---------- */
function renderTeam() {
  const body = document.getElementById('rosterBody');
  if (!body || typeof TEAM === 'undefined') return;

  body.innerHTML = TEAM.map((m) => `
    <tr>
      <td class="roster-avatar-cell">
        <img src="assets/team/${escapeHtml(m.photo)}" alt="${escapeHtml(m.name)}" class="roster-avatar"
             loading="lazy" decoding="async" width="54" height="54" />
      </td>
      <td><span class="role-badge">${escapeHtml(m.role)}</span></td>
      <td>
        <strong>${escapeHtml(m.name)}</strong><br />
        <span class="student-id">${escapeHtml(m.studentId)}</span>
      </td>
      <td>
        ${escapeHtml(m.duty)}
        <div class="tech-tags">
          ${m.tags.map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </td>
    </tr>
  `).join('');
}

/* ---------- 4. กราฟหน้าแรก: ชี้/แตะแล้วบอกเวลา ---------- */
// [ตำแหน่ง x ใน viewBox 0-1000, เวลาเป็นนาทีนับจากเที่ยงคืน]
// ต้องตรงกับจุดพีคในกราฟ SVG และตำแหน่งป้ายเวลาใน css/hero.css
const CHART_TIME = [[0, 6 * 60], [380, 12 * 60 + 30], [740, 19 * 60], [1000, 22 * 60]];
const CHART_PHASES = [
  [11 * 60, 'ช่วงเตรียมของ'],
  [14 * 60, 'ช่วงพีคกลางวัน'],
  [17 * 60 + 30, 'ช่วงบ่าย'],
  [21 * 60, 'ช่วงพีคเย็น'],
  [Infinity, 'ใกล้ปิดร้าน'],
];

function xToMinutes(x) {
  for (let i = 1; i < CHART_TIME.length; i++) {
    const [x0, t0] = CHART_TIME[i - 1];
    const [x1, t1] = CHART_TIME[i];
    if (x <= x1) return t0 + ((x - x0) / (x1 - x0)) * (t1 - t0);
  }
  return CHART_TIME[CHART_TIME.length - 1][1];
}

function formatClock(minutes) {
  const m = Math.round(minutes / 5) * 5;            // ปัดทีละ 5 นาที อ่านง่ายกว่า
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function setupChartHover() {
  const canvas = document.querySelector('.schematic-canvas');
  const svg = canvas && canvas.querySelector('svg');
  const curve = svg && svg.querySelector('path.chart-demand');
  if (!curve) return;

  // เก็บจุดบนเส้นไว้ล่วงหน้า 200 จุด หาค่า y จาก x ได้เร็ว
  const len = curve.getTotalLength();
  const samples = Array.from({ length: 201 }, (_, i) => curve.getPointAtLength((len * i) / 200));
  const yAt = (x) => {
    const i = samples.findIndex((pt) => pt.x >= x);
    if (i <= 0) return samples[Math.max(i, 0)].y;
    const a = samples[i - 1], b = samples[i];
    return a.y + ((x - a.x) / (b.x - a.x || 1)) * (b.y - a.y);
  };

  canvas.insertAdjacentHTML('beforeend', `
    <div class="chart-hover" hidden>
      <span class="chart-hover-line"></span>
      <span class="chart-hover-dot"></span>
      <span class="chart-hover-tip"></span>
    </div>`);
  const hover = canvas.querySelector('.chart-hover');
  const line = hover.querySelector('.chart-hover-line');
  const dot = hover.querySelector('.chart-hover-dot');
  const tip = hover.querySelector('.chart-hover-tip');

  const show = (e) => {
    const box = svg.getBoundingClientRect();
    const outer = canvas.getBoundingClientRect();
    const px = Math.min(Math.max(e.clientX - box.left, 0), box.width);
    const vx = (px / box.width) * 1000;
    const vb = svg.viewBox.baseVal;
    const py = (yAt(vx) / vb.height) * box.height;
    const left = box.left - outer.left + px;
    const top = box.top - outer.top;

    const minutes = xToMinutes(vx);
    const phase = CHART_PHASES.find(([end]) => minutes < end)[1];

    line.style.left = `${left}px`;
    line.style.top = `${top}px`;
    line.style.height = `${box.height}px`;
    dot.style.left = `${left}px`;
    dot.style.top = `${top + py}px`;
    tip.textContent = `${formatClock(minutes)} · ${phase}`;
    hover.hidden = false;                       // ต้องแสดงก่อน ถึงจะวัดความกว้างกล่องได้
    // กันกล่องข้อความล้นขอบซ้ายขวา
    const half = tip.offsetWidth / 2 + 4;
    tip.style.left = `${Math.min(Math.max(left, half), outer.width - half)}px`;
    tip.style.top = `${top + py}px`;
  };

  svg.addEventListener('pointermove', show);
  svg.addEventListener('pointerdown', show);
  // เมาส์: ซ่อนเมื่อออกจากกราฟ / นิ้ว: ค้างไว้ให้อ่าน แล้วซ่อนเมื่อแตะที่อื่น
  svg.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hover.hidden = true; });
  document.addEventListener('pointerdown', (e) => { if (!svg.contains(e.target)) hover.hidden = true; });
}

/* ---------- 5. เมนูบอกว่ากำลังอ่านส่วนไหน ---------- */
function setupScrollSpy() {
  const header = document.querySelector('header');
  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const pairs = links
    .map((link) => [link, document.querySelector(link.getAttribute('href'))])
    .filter(([, section]) => section);
  if (!pairs.length) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const line = (header ? header.offsetHeight : 0) + 120;   // เส้นอ้างอิงใต้แถบเมนู
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = null;
    for (const [link, section] of pairs) {
      if (section.getBoundingClientRect().top <= line) current = link;
    }
    if (atBottom) current = pairs[pairs.length - 1][0];      // section สุดท้ายสั้น อาจไม่ถึงเส้น
    for (const [link] of pairs) {
      const on = link === current;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------- 6. เนื้อหาค่อยๆ เผยขึ้นตอนเลื่อนถึง ----------
   ใส่ class .reveal ด้วย JS เท่านั้น -> ถ้า JS ไม่ทำงาน เนื้อหายังแสดงครบ
   ไม่ทำเลยถ้าผู้ใช้ตั้งเครื่องให้ลดการเคลื่อนไหว */
const REVEAL_TARGETS = [
  '.metric-item', '.section-header', '.lead-text', '.problem-card', '.spec-table-wrapper',
  '.vision-block', '.objective-card', '.pipeline-node', '.bom-explorer-card',
  '.factor-breakdown-card', '.table-responsive',
].join(', ');

function setupReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const items = [...document.querySelectorAll(REVEAL_TARGETS)];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  items.forEach((el) => {
    // การ์ดที่อยู่ในกริดเดียวกันโผล่ไล่กันทีละนิด (สูงสุด 0.28 วินาที)
    const siblings = [...el.parentElement.children].filter((c) => c.matches(REVEAL_TARGETS));
    const i = siblings.indexOf(el);
    if (siblings.length > 1) el.style.setProperty('--reveal-delay', `${Math.min(i, 4) * 70}ms`);
    el.classList.add('reveal');
    observer.observe(el);
  });
}

/* ---------- 7. ตารางกลายเป็นการ์ดบนมือถือ ----------
   CSS ใน responsive.css เปลี่ยน layout ส่วน JS แค่เตรียมของให้:
   - data-label: ชื่อคอลัมน์ ไว้แสดงเป็นป้ายเล็กในการ์ด
   - role: ตอนใช้ display:block บางเบราว์เซอร์จะลืมว่าเป็นตาราง
           ใส่ role ไว้ screen reader จะยังอ่านเป็นตารางได้ */
function prepareStackTables() {
  document.querySelectorAll('.stack-table').forEach((table) => {
    const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    table.setAttribute('role', 'table');
    table.querySelectorAll('thead, tbody').forEach((g) => g.setAttribute('role', 'rowgroup'));
    table.querySelectorAll('tr').forEach((tr) => tr.setAttribute('role', 'row'));
    table.querySelectorAll('th').forEach((th) => th.setAttribute('role', 'columnheader'));
    table.querySelectorAll('tbody tr').forEach((tr) => {
      [...tr.children].forEach((td, i) => {
        td.setAttribute('role', 'cell');
        if (heads[i]) td.dataset.label = heads[i];
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('bom:rendered', prepareStackTables);   // ตารางวัตถุดิบถูกสร้างใหม่ทุกครั้งที่เปลี่ยนเมนู/จำนวนจาน
  setupSmoothScroll();
  setupBomExplorer();
  renderTeam();
  setupChartHover();
  setupScrollSpy();
  setupReveal();
  prepareStackTables();
});
