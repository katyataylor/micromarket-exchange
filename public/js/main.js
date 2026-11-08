// Nav toggle for EJS-rendered pages (mobile hamburger menu).
// Note: server.ts serves the React (TSX) build exclusively; this file is
// retained for any static/EJS context that may reference it directly.
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navRight = document.querySelector('.nav-right');

  if (menuToggle && navRight) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navRight.classList.toggle('is-active');
      navRight.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
      const isClickInside = navRight.contains(event.target) || menuToggle.contains(event.target);
      if (!isClickInside && navRight.classList.contains('is-active')) {
        menuToggle.classList.remove('active');
        navRight.classList.remove('is-active', 'active');
      }
    });
  }
});
