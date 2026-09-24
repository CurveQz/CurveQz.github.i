/*
 * CurveQz — สคริปต์ของหน้าเว็บ
 * ข้อมูลทีมและเมนูอยู่ใน js/data.js (ต้องโหลดก่อนไฟล์นี้)
 *
 * 1. เลื่อนหน้าแบบนุ่มนวลเมื่อกดลิงก์ในแถบเมนู
 * 2. สร้างตารางวัตถุดิบ + ปุ่มสลับเมนู + เครื่องคำนวณจำนวนจาน จาก MENUS
 * 3. สร้างตารางทีม จาก TEAM
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
      window.scrollTo({ top, behavior: 'smooth' });
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

document.addEventListener('DOMContentLoaded', () => {
  setupSmoothScroll();
  setupBomExplorer();
  renderTeam();
});
