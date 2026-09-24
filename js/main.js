/*
 * CurveQz — สคริปต์ของหน้าเว็บ
 * ข้อมูลทีมและเมนูอยู่ใน js/data.js (ต้องโหลดก่อนไฟล์นี้)
 *
 * 1. เลื่อนหน้าแบบนุ่มนวลเมื่อกดลิงก์ในแถบเมนู
 * 2. สร้างตารางวัตถุดิบ + ปุ่มสลับเมนู จาก MENUS
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

/* ---------- 2. ตารางวัตถุดิบต่อหนึ่งจาน ---------- */
function renderBomRows(menu) {
  const body = document.getElementById('bomTableBody');
  if (!body) return;

  body.innerHTML = menu.items.map((item) => `
    <tr>
      <td class="bom-name">${escapeHtml(item.name)}</td>
      <td><span class="portion-val">${escapeHtml(item.portion)}</span></td>
      <td><span class="shelf-badge">${escapeHtml(item.shelf)}</span></td>
      <td><span class="risk-tag ${escapeHtml(item.risk)}"><span aria-hidden="true">●</span> ${escapeHtml(item.riskText)}</span></td>
      <td class="bom-rule">${escapeHtml(item.rule)}</td>
    </tr>
  `).join('');
}

function setupBomExplorer() {
  const tabs = document.getElementById('bomTabs');
  if (!tabs || typeof MENUS === 'undefined' || MENUS.length === 0) return;

  tabs.innerHTML = MENUS.map((menu, i) => `
    <button type="button" class="bom-tab${i === 0 ? ' active' : ''}" data-index="${i}">
      ${escapeHtml(menu.label)}
    </button>
  `).join('');

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.bom-tab');
    if (!btn) return;
    tabs.querySelectorAll('.bom-tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    renderBomRows(MENUS[Number(btn.dataset.index)]);
  });

  renderBomRows(MENUS[0]);
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
