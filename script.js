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

// Canal de comunicación entre pestañas para actualizar precios en tiempo real
const bc = new BroadcastChannel('actualizacion-precios');

// Modal de productos
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const closeBtn = document.querySelector('.close');

function openModal(producto, descripcion) {
  modalTitle.textContent = producto;
  modalText.textContent = descripcion || '';
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
    <img src="images/${p.nombre}.jpg" alt="${p.nombre}">
    <h3>${p.nombre}</h3>
    <p>Ingrediente activo: ${p.ingrediente}</p>
    <p class="precio">Precio: ${p.precio}</p>
    <button class="ver-mas" data-producto="${p.nombre}">Ver más</button>
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

document.addEventListener('DOMContentLoaded', async () => {
  const almacenados = localStorage.getItem('productos-actualizados');
  if (almacenados) {
    productos = JSON.parse(almacenados);
  } else {
    productos = await fetch('productos.json').then(r => r.json());
  }
  renderProductos();
});

// Escucha mensajes de otras pestañas con precios actualizados
bc.onmessage = e => {
  productos = e.data;
  localStorage.setItem('productos-actualizados', JSON.stringify(productos));
  renderProductos();
};

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

// --- Carga de precios desde Excel en admin.html ---
const excelInput = document.getElementById('excelFile');
const cargarExcelBtn = document.getElementById('cargarExcel');

async function procesarExcel(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  rows.forEach(row => {
    const nombre = row.nombre || row.Nombre;
    const precio = row.precio || row.Precio;
    if (!nombre || precio === undefined) return;
    const prod = productos.find(p => p.nombre === nombre);
    if (prod) prod.precio = precio;
  });
  localStorage.setItem('productos-actualizados', JSON.stringify(productos));
  bc.postMessage(productos);
  renderProductos();
}

if (cargarExcelBtn && excelInput) {
  cargarExcelBtn.addEventListener('click', () => {
    const file = excelInput.files[0];
    if (file) procesarExcel(file);
  });
}

const input = document.getElementById('excelFile');
const btn = document.getElementById('cargarExcel');
const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

btn?.addEventListener('click', () => {
  if (!input?.files?.length) return alert('Selecciona un archivo Excel primero');
  const reader = new FileReader();
  reader.onload = e => {
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Limpiar cada grid (veterinarios y agroquímicos)
    document.querySelectorAll('.grid').forEach(grid => grid.innerHTML = '');

    // Crear tarjetas desde el Excel
    rows.forEach(r => {
      const key = r.Categoría?.toLowerCase() === 'veterinarios' ? 'veterinarios' : 'agroquimicos';
      const container = document.querySelector(`.grid.${key}`);
      if (!container) return;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="images/${r.Nombre.trim()}.jpg" alt="${r.Nombre.trim()}">
        <h3>${r.Nombre.trim()}</h3>
        <p>Ingrediente activo: ${r.Ingrediente}</p>
        <p class="precio">${formatter.format(r.Precio)}</p>
        <button class="ver-mas" data-producto="${r.Nombre.trim()}">Ver más</button>
      `;
      container.appendChild(card);
    });
  };
  reader.readAsArrayBuffer(input.files[0]);
});

