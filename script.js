// Menú móvil
const toggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (toggle) {
  toggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

// Animación con IntersectionObserver
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => obs.observe(el));

// Modal de productos
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const closeBtn = document.querySelector('.close');

function openModal(producto, descripcion) {
  modalTitle.textContent = producto;
  modalText.textContent = descripcion;
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
}

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

document.querySelectorAll('.ver-mas').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.card');
    const descEl = card.querySelector('.descripcion');
    const desc = descEl ? descEl.textContent : btn.dataset.descripcion;
    openModal(btn.dataset.producto, desc);
  });
});
