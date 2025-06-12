
document.addEventListener('DOMContentLoaded', () => {
  // Menú móvil
  const toggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggle) {
    toggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      toggle.classList.toggle('open');
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

  // Canal de comunicación entre pestañas para actualizar precios
  const bc = new BroadcastChannel('actualizacion-precios');

  // Modal de productos
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  const closeBtn = document.getElementById('closeBtn');

  function openModal(producto, descripcion) {
    modalTitle.textContent = producto;
    modalText.textContent = descripcion || '';
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  } else {
    console.warn('closeBtn no encontrado en el DOM');
  }

  window.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Contenedores de productos
  const contVet = document.getElementById('veterinarios-container');
  const contAgr = document.getElementById('agroquimicos-container');
  const contProductos = document.getElementById('productos-container');
  const contLista = document.getElementById('lista-container');
  const vistaGridBtn = document.getElementById('vista-grid');
  const vistaListaBtn = document.getElementById('vista-lista');
  const adminTable = document.getElementById('admin-table');
  const categoriaSelect = document.getElementById('categoriaSelect');
  const productForm = document.getElementById('product-form');
  let productos = [];

  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('categoria') || '';
  const displayCat = catParam.charAt(0).toUpperCase() + catParam.slice(1).toLowerCase();
  const titleEl = document.getElementById('lista-title');
  if (titleEl) titleEl.textContent = displayCat;

  async function renderAdminList() {
    const resp = await fetch('/api/productos');
    const productos = await resp.json();
    const tbody = document.querySelector('#admin-table tbody');
    const cats = Array.from(
      new Set(productos.map(p => p.categoria).filter(cat => typeof cat === 'string' && cat.trim() !== ''))
    );
    tbody.innerHTML = '';
    productos.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" value="${p.nombre}" data-field="nombre" /></td>
        <td><input type="number" step="0.01" value="${p.precio}" data-field="precio" /></td>
        <td>
          <select data-field="categoria">
            ${cats.map(cat =>
              `<option value="${cat}" ${p.categoria===cat?'selected':''}>` +
              `${cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}` +
              `</option>`
            ).join('')}
          </select>
        </td>
        <td><input type="text" value="${p.imagen}" data-field="imagen" /></td>
        <td>
          <button class="btn-save" data-id="${p.id}">Guardar</button>
          <button class="btn-delete" data-id="${p.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function populateCategorySelect() {
    const sel = document.getElementById('categoriaSelect');
    fetch('/api/productos')
      .then(r => r.json())
      .then(products => {
        const cats = Array.from(
          new Set(products.map(p => p.categoria).filter(cat => typeof cat === 'string' && cat.trim() !== ''))
        );
        sel.innerHTML = '<option value="">Selecciona categoría</option>';
        cats.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
          sel.appendChild(opt);
        });
      });
  }

  function crearCard(p) {
    const div = document.createElement('div');
    div.className = 'card';
    const displayCat = p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1).toLowerCase();
    div.innerHTML = `
      <img src="/images/${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>Ingrediente activo: ${p.ingrediente}</p>
      <p class="categoria">${displayCat}</p>
      <p class="precio">Precio: ${p.precio}</p>
      <button class="ver-mas" data-producto="${p.nombre}">Ver más</button>
    `;
    return div;
  }

  function renderProductos() {
    const query = buscador ? buscador.value.toLowerCase() : '';
    if (contProductos) {
      const cont = document.getElementById('productos-container');
      cont.innerHTML = '';
      productos.forEach(p => {
        if (!p.nombre.toLowerCase().includes(query)) return;
        const displayCat = p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1).toLowerCase();
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="/images/${p.imagen}" alt="${p.nombre}">
          <h3>${p.nombre}</h3>
          <p class="categoria">${displayCat}</p>
          <p class="precio">${new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(p.precio)}</p>
        `;
        const link = document.createElement('a');
        link.href = `lista.html?categoria=${encodeURIComponent(p.categoria)}`;
        link.appendChild(card);
        cont.appendChild(link);
      });
    } else if (contLista) {
      contLista.innerHTML = '';
      productos.forEach(p => {
        if (!p.nombre.toLowerCase().includes(query)) return;
        contLista.appendChild(crearCard(p));
      });
    } else if (contVet || contAgr) {
      contVet && (contVet.innerHTML = '');
      contAgr && (contAgr.innerHTML = '');
      productos.forEach(p => {
        if (!p.nombre.toLowerCase().includes(query)) return;
        const card = crearCard(p);
        if (p.categoria === 'veterinarios' && contVet) contVet.appendChild(card);
        else if (contAgr) contAgr.appendChild(card);
      });
    }
  }

  async function fetchProductos() {
    const res = await fetch('/api/productos');
    productos = await res.json();
    if (contLista) {
      const productosFiltrados = productos.filter(p => p.categoria === catParam);
      const cont = document.getElementById('lista-container');
      cont.innerHTML = '';
      productosFiltrados.forEach(p => {
        cont.appendChild(crearCard(p));
      });
    } else {
      renderProductos();
    }
  }

  fetchProductos();

  // Escucha mensajes de otras pestañas con precios actualizados
  bc.onmessage = e => {
    productos = e.data;
    renderProductos();
  };

  document.addEventListener('click', e => {
    if (e.target.classList.contains('ver-mas')) {
      openModal(e.target.dataset.producto, e.target.dataset.descripcion);
    }
  });

  function toggleVista(lista) {
    if (contVet || contAgr) {
      contVet && contVet.classList.toggle('lista', lista);
      contAgr && contAgr.classList.toggle('lista', lista);
    } else if (contLista) {
      contLista.classList.toggle('lista', lista);
    }
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

  if (buscador) {
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

  // Guardar cambios
  if (adminTable) {
    adminTable.addEventListener('click', async e => {
      if (e.target.classList.contains('btn-save')) {
        const id = e.target.dataset.id;
        const tr = e.target.closest('tr');
        const body = {};
        tr.querySelectorAll('[data-field]').forEach(inp => {
          const field = inp.dataset.field;
          const value = inp.value;
          body[field] = field === 'precio' ? parseFloat(value) : value;
        });
        await fetch(`/api/productos/${id}`, {
          method: 'PUT',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(body)
        });
        renderAdminList();
      }
    });

    // Eliminar
    adminTable.addEventListener('click', async e => {
      if (e.target.classList.contains('btn-delete')) {
        const id = e.target.dataset.id;
        await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        renderAdminList();
      }
    });
  }

  if (productForm) {
    productForm.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(productForm);
      const data = Object.fromEntries(formData.entries());
      data.categoria = categoriaSelect ? categoriaSelect.value : data.categoria;
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id ? `/api/productos/${data.id}` : '/api/productos';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      productForm.reset();
      renderAdminList();
    });
  }

  // Carga de precios desde Excel en admin.html
  const inputFile = document.getElementById('input-file');
  const cargarExcelBtn = document.getElementById('cargarExcel');

  if (cargarExcelBtn && inputFile) {
    cargarExcelBtn.addEventListener('click', async () => {
      const file = inputFile.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        const data = reader.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        for (const row of rows) {
          const precioNum = parseFloat(row['Precio']);
          const payload = {
            nombre: row['Nombre'],
            precio: isNaN(precioNum) ? 0 : precioNum,
            categoria: row['Categoría'],
            imagen: row['Imagen']
          };

          try {
            const res = await fetch('/api/productos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) console.log('Subido:', payload.nombre);
            else console.error('Error:', payload.nombre, res.statusText);
          } catch (err) {
            console.error(err);
          }
        }
        renderAdminList();
      };
      reader.readAsArrayBuffer(file);
    });
  }

  if (adminTable) {
    renderAdminList();
  }
  populateCategorySelect();
});

