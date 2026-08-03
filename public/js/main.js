document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navRight = document.querySelector('.nav-right');

  // Toggle mobile menu visibility on click
  menuToggle.addEventListener('click', () => {
    navRight.classList.toggle('is-active');
  });

  // Only run if both elements exist on the current page
    if (menuToggle && navRight) {
        menuToggle.addEventListener('click', () => {
            // Toggles an "active" class on both elements when clicked
            menuToggle.classList.toggle('active');
            navRight.classList.toggle('active');
        });
    }

  // Optional: Close the menu if a user clicks outside of it
  document.addEventListener('click', (event) => {
    const isClickInside = navRight.contains(event.target) || menuToggle.contains(event.target);
    if (!isClickInside && navRight.classList.contains('is-active')) {
      navRight.classList.remove('is-active');
    }
  });
});