/**
 * CurveQz — Applied IT & Enterprise Machine Learning
 * Client-side script for interactive feedback and smooth navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log(
    '%cCurveQz%c — AI-Powered Demand Forecasting & Inventory Optimization (PIM)',
    'color: #3A694A; font-weight: bold; font-size: 14px;',
    'color: #563E32; font-size: 13px;'
  );

  // Smooth scroll for internal navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    });
  });

  // Table row focus feedback
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
