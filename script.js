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

// Renderizado de productos desde productos.json
const contVet = document.getElementById('veterinarios-container');
const contAgr = document.getElementById('agroquimicos-container');
const vistaGridBtn = document.getElementById('vista-grid');
const vistaListaBtn = document.getElementById('vista-lista');
let productos = [];

function crearCard(p) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <img src="${p.imagen}" alt="${p.nombre}">
    <h3>${p.nombre}</h3>
    <p>Ingrediente activo: ${p.ingrediente}</p>
    <p class="precio">$${p.precio}</p>
    <button class="ver-mas" data-producto="${p.nombre}" data-descripcion="${p.descripcion}">Ver más</button>
  `;
  return div;
}

function renderProductos() {
  if (!contVet || !contAgr) return;
  const query = buscador ? buscador.value.toLowerCase() : '';
  contVet.innerHTML = '';
  contAgr.innerHTML = '';
  productos.forEach(p => {
    if (!p.nombre.toLowerCase().includes(query)) return;
    const card = crearCard(p);
    if (p.categoria === 'veterinarios') contVet.appendChild(card); else contAgr.appendChild(card);
  });
}

fetch('productos.json')
  .then(r => r.json())
  .then(data => { productos = data; renderProductos(); });

document.addEventListener('click', e => {
  if (e.target.classList.contains('ver-mas')) {
    openModal(e.target.dataset.producto, e.target.dataset.descripcion);
  }
});


function toggleVista(lista) {
  if (!contVet || !contAgr) return;
  [contVet, contAgr].forEach(c => c.classList.toggle('lista', lista));
  if (vistaGridBtn && vistaListaBtn) {
    vistaGridBtn.classList.toggle('activo', !lista);
    vistaListaBtn.classList.toggle('activo', lista);
  }
}

if (vistaGridBtn) vistaGridBtn.addEventListener('click', () => toggleVista(false));
if (vistaListaBtn) vistaListaBtn.addEventListener('click', () => toggleVista(true));

// Buscador y filtros en lista.html
const buscador = document.getElementById('buscador');
const filtroIngrediente = document.getElementById('filtro-ingrediente');

if (buscador && contVet) {
  buscador.addEventListener('input', renderProductos);
}

function filtrarCards() {
  const texto = buscador.value.toLowerCase();
  const filtro = filtroIngrediente.value;
  document.querySelectorAll('.grid .card').forEach(card => {
    const nombre = card.querySelector('h3').textContent.toLowerCase();
    const ingText = card.querySelector('p').textContent.replace('Ingrediente activo:', '').trim();
    const coincideNombre = nombre.includes(texto);
    const coincideIng = filtro === 'Todas' || ingText === filtro;
    card.style.display = (coincideNombre && coincideIng) ? '' : 'none';
  });
}

if (buscador && filtroIngrediente) {
  buscador.addEventListener('input', filtrarCards);
  filtroIngrediente.addEventListener('change', filtrarCards);
}
