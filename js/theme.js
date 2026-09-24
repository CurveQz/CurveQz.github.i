/*
 * ธีมมืด/สว่าง
 *
 * ไฟล์นี้โหลดใน <head> แบบไม่มี defer เพื่อให้ตั้งธีมก่อนหน้าเว็บวาด
 * ไม่งั้นคนที่ใช้ธีมมืดจะเห็นหน้าขาวแวบหนึ่งก่อนเปลี่ยน
 *
 * ลำดับการเลือกธีม:
 *   1. ถ้าเคยกดปุ่มเลือกไว้ -> ใช้ค่าที่จำไว้ (localStorage)
 *   2. ถ้าไม่เคย -> ตามที่เครื่องตั้งไว้ และเปลี่ยนตามถ้าเครื่องเปลี่ยน
 */
(function () {
  var KEY = 'curveqz-theme';
  var root = document.documentElement;
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  // localStorage อาจใช้ไม่ได้ (โหมดไม่ระบุตัวตน / ปิด cookie) -> ห้ามทำให้หน้าพัง
  function getSaved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) { /* ไม่เป็นไร */ }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#161718' : '#FFFFFF');
    var btn = document.getElementById('themeToggle');
    if (btn) {
      var dark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด');
      btn.title = btn.getAttribute('aria-label');
    }
  }

  apply(getSaved() || (systemDark.matches ? 'dark' : 'light'));

  // เครื่องเปลี่ยนธีม (เช่นโหมดมืดอัตโนมัติตอนกลางคืน) -> เปลี่ยนตาม ถ้ายังไม่เคยกดเลือกเอง
  systemDark.addEventListener('change', function (e) {
    if (!getSaved()) apply(e.matches ? 'dark' : 'light');
  });

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    apply(root.getAttribute('data-theme'));   // อัปเดต aria ของปุ่มหลังปุ่มมีอยู่จริง
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      save(next);
      apply(next);
    });
  });
})();
