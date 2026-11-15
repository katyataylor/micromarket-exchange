// Nav toggle for EJS-rendered pages (mobile hamburger menu + account dropdown).
// Note: server.ts serves the React (TSX) build exclusively; this file is
// retained for any static/EJS context that may reference it directly.
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#root[data-page]')) {
    return;
  }

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

  const accountItem = document.querySelector('.nav-account-item');
  const accountTrigger = document.querySelector('.nav-account-trigger');
  const accountMenu = document.querySelector('.nav-account-menu');

  if (accountItem && accountTrigger && accountMenu) {
    const setDropdownOpen = (isOpen) => {
      accountItem.classList.toggle('is-open', isOpen);
      accountTrigger.setAttribute('aria-expanded', String(isOpen));
      accountMenu.hidden = !isOpen;
    };

    accountTrigger.addEventListener('click', () => {
      const nextOpen = accountTrigger.getAttribute('aria-expanded') !== 'true';
      setDropdownOpen(nextOpen);
    });

    accountMenu.addEventListener('mouseleave', () => setDropdownOpen(false));
    accountItem.addEventListener('mouseleave', () => setDropdownOpen(false));
  }
});
