
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

  // Lista fija de categorías a mostrar en el front
  const categoriesList = [
    'MEDICAMENTOS',
    'GARRAPATICIDAS MOSQUICIDAS',
    'INSECTICIDAS',
    'BIOLÓGICOS',
    'ALIMENTO PERROS Y GATOS',
    'PESTICIDAS',
    'ASPERSORAS',
    'REFACCIONES',
    'MASCOTAS',
    'SALES MINERALES',
    'FERRETERIA',
    'SEMILLAS',
    'FERTILIZANTES',
    'FUNGICIDAS',
    'HERBICIDAS',
    'COADYUVANTE',
    'IMPLEMENTOS',
    'INSTRUMENTAL',
    'TALABARTERÍA',
    'MAQUINARIA',
    'ALIMENTOS BALANCEADOS',
    'FORRAJES',
    'RATICIDA',
  'SERVICIOS'
  ];

  const categoryImages = {
    'MEDICAMENTOS': 'medicamentos.png',
    'GARRAPATICIDAS MOSQUICIDAS': 'garrapaticidas.png',
    'INSECTICIDAS': 'insecticidas.png',
    'BIOLÓGICOS': 'biologicos.png',
    'ALIMENTO PERROS Y GATOS': 'alimento_perros_gatos.png',
    'PESTICIDAS': 'pesticidas.png',
    'ASPERSORAS': 'aspersoras.png',
    'REFACCIONES': 'refacciones.png',
    'MASCOTAS': 'mascotas.png',
    'SALES MINERALES': 'sales_minerales.png',
    'FERRETERÍA': 'ferreteria.png',
    'SEMILLAS': 'semillas.png',
    'FERTILIZANTES': 'fertilizantes.png',
    'FUNGICIDAS': 'fungicidas.png',
    'HERBICIDAS': 'herbicidas.png',
    'COADYUVANTE': 'coadyuvante.png',
    'IMPLEMENTOS': 'implementos.png',
    'INSTRUMENTAL': 'instrumental.png',
    'TALABARTERÍA': 'talabarteria.png',
    'MAQUINARIA': 'maquinaria.png',
    'ALIMENTOS BALANCEADOS': 'alimentos_balanceados.png',
    'FORRAJES': 'forrajes.png',
    'RATICIDA': 'raticida.png',
    'SERVICIOS': 'servicios.png'
  };

  // Función para formatear cada palabra con inicial mayúscula
  function formatLabel(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Render de tarjetas de categorías en index.html
  function renderCategories() {
    const cont = document.getElementById('categories-container');
    if (!cont) return;
    cont.innerHTML = '';
    categoriesList.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'card category-card';
      // imagen de categoría
      const img = document.createElement('img');
      img.src = `/images/categories/${categoryImages[cat] || 'default.png'}`;
      img.alt = formatLabel(cat);
      card.appendChild(img);
      const label = formatLabel(cat);
      const title = document.createElement('h3');
      title.textContent = label;
      card.appendChild(title);
      const link = document.createElement('a');
      link.href = `lista.html?categoria=${encodeURIComponent(cat)}`;
      link.appendChild(card);
      cont.appendChild(link);
    });
  }

  const contCategorias = document.getElementById('categories-container');
  if (contCategorias) {
    renderCategories();
  }

  // Contenedores de productos
  const contVet = document.getElementById('veterinarios-container');
  const contAgr = document.getElementById('agroquimicos-container');
  const contProductos = document.getElementById('productos-container');
  const contLista = document.getElementById('lista-container');
  const vistaGridBtn = document.getElementById('vista-grid');
  const vistaListaBtn = document.getElementById('vista-lista');
  const adminTable = document.getElementById('admin-table');
  const selectAllCb = document.getElementById('selectAll');
  const categoriaSelect = document.getElementById('categoriaSelect');
  const productForm = document.getElementById('product-form');
  let productos = [];
  let gridCols = 2;

  function gridContainers() {
    return [contCategorias, contVet, contAgr, contLista].filter(Boolean);
  }

  function setGridCols(cols) {
    gridCols = cols;
    gridContainers().forEach(c => {
      if (!c.classList.contains('lista')) {
        c.style.setProperty('--grid-cols', cols);
      }
    });
  }

  setGridCols(gridCols);

  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('categoria') || '';
  const displayCat = catParam.charAt(0).toUpperCase() + catParam.slice(1).toLowerCase();
  const titleEl = document.getElementById('lista-title');
  if (titleEl) {
    titleEl.textContent = displayCat;
    const current = document.querySelector('.current-category');
    if (current && current !== titleEl) current.textContent = titleEl.textContent;
  }

  async function renderAdminList() {
    const resp = await fetch('/api/productos');
    const productos = await resp.json();
    const tbody = document.querySelector('#admin-table tbody');
    const cats = categoriesList;
    tbody.innerHTML = '';
    productos.forEach(p => {
      const tr = document.createElement('tr');
      tr.dataset.id = p.id;
      tr.innerHTML = `
        <td><input type="checkbox" class="row-select" /></td>
        <td><input type="text" value="${p.nombre}" data-field="nombre" /></td>
        <td><input type="number" step="0.01" value="${p.precio}" data-field="precio" /></td>
        <td>
          <select data-field="categoria">
            ${cats.map(cat => `
              <option value="${cat}" ${p.categoria===cat?'selected':''}>
                ${cat.charAt(0).toUpperCase()+cat.slice(1).toLowerCase()}
              </option>`).join('')}
          </select>
        </td>
        <td><input type="text" value="${p.imagen}" data-field="imagen" /></td>
      `;
      tbody.appendChild(tr);
    });
    if (selectAllCb) selectAllCb.checked = false;
  }

  function populateCategorySelect() {
    const sel = document.getElementById('categoriaSelect');
    sel.innerHTML = '<option value="">Selecciona categoría</option>';
    categoriesList.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = formatLabel(cat);
      sel.appendChild(opt);
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
    if (contProductos) {
      const cont = document.getElementById('productos-container');
      cont.innerHTML = '';
      productos.forEach(p => {
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
        contLista.appendChild(crearCard(p));
      });
    } else if (contVet || contAgr) {
      contVet && (contVet.innerHTML = '');
      contAgr && (contAgr.innerHTML = '');
      productos.forEach(p => {
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
      const productosFiltrados = productos.filter(p =>
        p.categoria && p.categoria.toUpperCase() === catParam.toUpperCase()
      );
      const cont = document.getElementById('lista-container');
      cont.innerHTML = '';
      productosFiltrados.forEach(p => {
        cont.appendChild(crearCard(p));
      });
    } else {
      renderProductos();
    }
  }

  if (contLista || contVet || contAgr || contProductos || adminTable) {
    fetchProductos();
  }

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
    gridContainers().forEach(c => c.classList.toggle('lista', lista));
    if (!lista) setGridCols(gridCols);
    if (vistaGridBtn && vistaListaBtn) {
      vistaGridBtn.classList.toggle('activo', !lista);
      vistaListaBtn.classList.toggle('activo', lista);
    }
  }

  if (vistaGridBtn) {
    vistaGridBtn.addEventListener('click', () => {
      const anyLista = gridContainers().some(c => c.classList.contains('lista'));
      if (anyLista) {
        toggleVista(false);
      } else {
        setGridCols(gridCols === 2 ? 4 : 2);
      }
    });
  }
  if (vistaListaBtn) vistaListaBtn.addEventListener('click', () => toggleVista(true));


  // Guardar cambios
  if (adminTable) {
    const guardarTablaBtn = document.getElementById('guardarTabla');
    const eliminarSeleccionadosBtn = document.getElementById('eliminarSeleccionados');

    guardarTablaBtn.addEventListener('click', async () => {
      const rows = adminTable.querySelectorAll('tbody tr');
      for (const tr of rows) {
        const id = tr.dataset.id;
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
      }
      renderAdminList();
    });

    eliminarSeleccionadosBtn.addEventListener('click', async () => {
      const rows = adminTable.querySelectorAll('tbody tr');
      for (const tr of rows) {
        const cb = tr.querySelector('.row-select');
        if (cb && cb.checked) {
          const id = tr.dataset.id;
          await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        }
      }
      renderAdminList();
    });

    if (selectAllCb) {
      selectAllCb.addEventListener('change', () => {
        const checked = selectAllCb.checked;
        adminTable.querySelectorAll('.row-select').forEach(cb => cb.checked = checked);
      });
    }
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
  const excelOption = document.getElementById('excelOption');

  if (cargarExcelBtn && inputFile) {
    cargarExcelBtn.addEventListener('click', async () => {
      const file = inputFile.files[0];
      if (!file) return;

      const option = excelOption ? excelOption.value : 'combine';
      const reader = new FileReader();
      reader.onload = async () => {
        const data = reader.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const current = await fetch('/api/productos').then(r => r.json());

        const parsedRows = rows.map(r => ({
          nombre: r.Nombre,
          precio: r.Precio != null ? r.Precio : 0,
          categoria: (r.Categoria || r['Categoría'] || '').trim().toUpperCase(),
          imagen: r.Imagen
        }));

        let finalData = [];

        if (option === 'clear') {
          finalData = parsedRows;
        } else if (option === 'combine') {
          finalData = current.concat(parsedRows);
        } else if (option === 'overwrite') {
          finalData = [...current];
          parsedRows.forEach(p => {
            const idx = finalData.findIndex(e => e.nombre === p.nombre);
            if (idx >= 0) {
              finalData[idx] = p;
            } else {
              finalData.push(p);
            }
          });
        }

        const seen = new Map();
        finalData.forEach(p => {
          const key = `${p.nombre}|${p.precio}`;
          if (!seen.has(key)) seen.set(key, p);
        });
        finalData = Array.from(seen.values());

        await fetch('/api/productos', { method: 'DELETE' });
        for (const p of finalData) {
          await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p)
          });
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

