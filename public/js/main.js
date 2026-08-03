document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navRight = document.querySelector('.nav-right');

  // Toggle mobile menu visibility on click
  menuToggle.addEventListener('click', () => {
    navRight.classList.toggle('is-active');
  });

  // Optional: Close the menu if a user clicks outside of it
  document.addEventListener('click', (event) => {
    const isClickInside = navRight.contains(event.target) || menuToggle.contains(event.target);
    if (!isClickInside && navRight.classList.contains('is-active')) {
      navRight.classList.remove('is-active');
    }
  });
});