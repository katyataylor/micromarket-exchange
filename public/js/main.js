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

  initRegistrationToggle();
});

function initRegistrationToggle() {
  const cards = document.querySelectorAll('[data-membership]');
  if (!cards.length) return;

  function renumberSteps() {
    let step = 0;
    document.querySelectorAll('.w-bubble-container').forEach((section) => {
      const numberEl = section.querySelector('.number');
      if (!numberEl) return;
      if (section.style.display === 'none') return;
      step++;
      numberEl.textContent = step;
    });
  }

  function selectMembership(type) {
    const isTrade = type === 'trade';

    cards.forEach((card) => {
      card.classList.toggle('selected', card.dataset.membership === type);
    });

    document.querySelectorAll('.trade-only').forEach((el) => {
      el.style.display = isTrade ? '' : 'none';
    });

    document.querySelectorAll('.viewonly-only').forEach((el) => {
      el.style.display = isTrade ? 'none' : '';
    });

    // Swap label text for fields that differ between membership types
    document.querySelectorAll('[data-trade-label]').forEach((el) => {
      el.textContent = isTrade ? el.dataset.tradeLabel : el.dataset.viewonlyLabel;
    });

    // Swap placeholder text for inputs that differ between membership types
    document.querySelectorAll('[data-trade-placeholder]').forEach((el) => {
      el.placeholder = isTrade ? el.dataset.tradePlaceholder : el.dataset.viewonlyPlaceholder;
    });

    renumberSteps();
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => selectMembership(card.dataset.membership));

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMembership(card.dataset.membership);
      }
    });
  });

  // Trade membership is the default on page load
  selectMembership('trade');
}
