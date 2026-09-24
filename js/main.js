/**
 * CurveQz — Swiss Editorial Interactive Engine
 * Client script for smooth navigation, Recipe BOM Explorer, and tactile feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log(
    '%cCurveQz%c — AI-Powered Demand Forecasting & Inventory Optimization (PIM)',
    'color: #3A694A; font-weight: bold; font-size: 14px;',
    'color: #563E32; font-size: 13px;'
  );

  // Smooth scroll for internal navigation with exact dynamic navbar offset
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      }
    });
  });

  /* ========================================================
     RECIPE BOM EXPLORER (Product Feature Component)
     ======================================================== */
  const bomData = {
    basil: [
      { name: 'เนื้อหมูบดอนามัย', portion: '150 กรัม', shelf: '2 วัน', risk: 'high', riskText: 'เสี่ยงสูง (สด)', rule: 'สั่งแบบ Daily Batch ตรวจวันหมดอายุทุกเช้า' },
      { name: 'ใบกะเพราสดคัดใบ', portion: '20 กรัม', shelf: '1-2 วัน', risk: 'high', riskText: 'เสี่ยงสูงมาก', rule: 'รับจากตลาดสดรอบเช้า ไม่ค้างคืนข้ามวัน' },
      { name: 'พริกขี้หนูจินดาแดง', portion: '10 กรัม', shelf: '5 วัน', risk: 'med', riskText: 'เสี่ยงปานกลาง', rule: 'สำรองสต็อกไม่เกิน 3 วัน รักษาความแห้ง' },
      { name: 'กระเทียมไทยแกะกลีบ', portion: '10 กรัม', shelf: '14 วัน', risk: 'low', riskText: 'ความเสี่ยงต่ำ', rule: 'สั่งซื้อเป็นรอบสัปดาห์ เก็บในที่อากาศถ่ายเท' },
      { name: 'ซอสผัดกะเพราปรุงสำเร็จ', portion: '25 มล.', shelf: '45 วัน', risk: 'low', riskText: 'ความเสี่ยงต่ำ', rule: 'สต็อกขวดแก้ว บันทึกรอบ First-In First-Out' }
    ],
    curry: [
      { name: 'เนื้อสะโพกไก่หั่นเต๋า', portion: '160 กรัม', shelf: '2 วัน', risk: 'high', riskText: 'เสี่ยงสูง (สด)', rule: 'แช่เย็น 0-4°C สั่งซื้อวันต่อวันตามรอบพยากรณ์' },
      { name: 'พริกแกงเผ็ดตำมือ', portion: '35 กรัม', shelf: '7 วัน', risk: 'med', riskText: 'เสี่ยงปานกลาง', rule: 'สั่งซื้อรอบ 3 วัน เก็บในภาชนะปิดมิดชิด' },
      { name: 'ถั่วฝักยาวสดหั่นท่อน', portion: '40 กรัม', shelf: '3 วัน', risk: 'high', riskText: 'เสี่ยงสูง', rule: 'ตรวจความกรอบหน้างาน ไม่แช่น้ำขัง' },
      { name: 'ใบมะกรูดฉีกเส้น', portion: '5 กรัม', shelf: '4 วัน', risk: 'med', riskText: 'เสี่ยงปานกลาง', rule: 'ห่อกระดาษซับความชื้นก่อนแช่ตู้เย็น' }
    ],
    tomyum: [
      { name: 'กุ้งขาวสดไซส์มาตรฐาน', portion: '120 กรัม', shelf: '1-2 วัน', risk: 'high', riskText: 'เสี่ยงสูงมาก', rule: 'ดองน้ำแข็งอุณหภูมิใกล้ 0°C สั่งวันต่อวัน' },
      { name: 'เห็ดฟาง / เห็ดนางฟ้า', portion: '50 กรัม', shelf: '2 วัน', risk: 'high', riskText: 'เสี่ยงสูงมาก', rule: 'สั่งเช้าใช้หมดเย็น เห็ดเปลี่ยนสีเร็ว' },
      { name: 'ชุดสมุนไพร ข่า ตะไคร้', portion: '30 กรัม', shelf: '7 วัน', risk: 'med', riskText: 'เสี่ยงปานกลาง', rule: 'สั่งซื้อรอบ 4-5 วัน ล้างและหั่นพร้อมใช้' },
      { name: 'น้ำมะนาวแท้คั้นสด', portion: '25 มล.', shelf: '2 วัน', risk: 'high', riskText: 'เสี่ยงสูง', rule: 'คั้นสดรอบวันเพื่อรักษากลิ่นหอมธรรมชาติ' }
    ]
  };

  const bomTableBody = document.getElementById('bomTableBody');
  const bomTabs = document.querySelectorAll('.bom-tab');

  function renderBom(dishKey) {
    if (!bomTableBody) return;
    const items = bomData[dishKey] || [];
    
    bomTableBody.innerHTML = items.map((item) => `
      <tr>
        <td style="font-weight: 600; color: var(--color-brown-ink);">${item.name}</td>
        <td><span class="portion-val">${item.portion}</span></td>
        <td><span class="shelf-badge">${item.shelf}</span></td>
        <td>
          <span class="risk-tag ${item.risk}">
            <span>●</span> ${item.riskText}
          </span>
        </td>
        <td style="color: var(--color-brown-body); font-size: 13px;">${item.rule}</td>
      </tr>
    `).join('');
  }

  bomTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      bomTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const dish = tab.getAttribute('data-dish');
      renderBom(dish);
    });
  });

  // Initial render of BOM table
  renderBom('basil');

  /* ========================================================
     ROSTER TABLE HOVER FEEDBACK
     ======================================================== */
  const rosterRows = document.querySelectorAll('.roster-table tbody tr');
  rosterRows.forEach((row) => {
    row.addEventListener('mouseenter', () => {
      row.style.backgroundColor = 'var(--color-base-subtle)';
    });
    row.addEventListener('mouseleave', () => {
      row.style.backgroundColor = 'transparent';
    });
  });
});
