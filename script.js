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

function attachModalEvents() {
  document.querySelectorAll('.ver-mas').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const descEl = card.querySelector('.descripcion');
      const desc = descEl ? descEl.textContent : btn.dataset.descripcion;
      openModal(btn.dataset.producto, desc);
    });
  });

}

});
 main

// Buscador y filtros en lista.html
const buscador = document.getElementById('buscador');
const filtroIngrediente = document.getElementById('filtro-ingrediente');

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


// Cargar productos desde JSON
function crearCard(prod) {
  const card = document.createElement('div');
  card.className = 'card';

  const img = document.createElement('img');
  img.src = prod.imagen;
  img.alt = prod.nombre;
  card.appendChild(img);

  const h3 = document.createElement('h3');
  h3.textContent = prod.nombre;
  card.appendChild(h3);

  const pIng = document.createElement('p');
  pIng.textContent = `Ingrediente activo: ${prod.ingrediente}`;
  card.appendChild(pIng);

  const precio = document.createElement('p');
  precio.className = 'precio';
  precio.textContent = `Precio: $${prod.precio}`;
  card.appendChild(precio);

  if (prod.mostrarDescripcion) {
    const pDesc = document.createElement('p');
    pDesc.className = 'descripcion';
    pDesc.textContent = prod.descripcion;
    card.appendChild(pDesc);
  }

  const btn = document.createElement('button');
  btn.className = 'ver-mas';
  btn.dataset.producto = prod.nombre;
  btn.dataset.descripcion = prod.descripcion;
  btn.textContent = 'Ver más';
  card.appendChild(btn);

  return card;
}

async function cargarProductos() {
  const contVet = document.querySelector('.grid.veterinarios');
  const contAgro = document.querySelector('.grid.agroquimicos');
  const listaCont = document.getElementById('lista-container');
  const ingrSet = new Set();

  try {
    const res = await fetch('productos.json');
    const data = await res.json();
    data.forEach(p => {
      ingrSet.add(p.ingrediente);
      if (contVet && p.categoria === 'veterinarios') {
        contVet.appendChild(crearCard(p));
      }
      if (contAgro && p.categoria === 'agroquimicos') {
        contAgro.appendChild(crearCard(p));
      }
      if (listaCont) {
        listaCont.appendChild(crearCard(p));
      }
    });

    if (filtroIngrediente && ingrSet.size) {
      filtroIngrediente.innerHTML = '<option value="Todas">Todas</option>' +
        Array.from(ingrSet).map(i => `<option value="${i}">${i}</option>`).join('');
    }

    attachModalEvents();
    if (buscador && filtroIngrediente) filtrarCards();
  } catch (e) {
    console.error('Error cargando productos', e);
  }
}

cargarProductos();
 main
