const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const ExcelJS = require('exceljs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/productos
app.get('/api/productos', (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
  db.all('SELECT * FROM productos ORDER BY nombre', [], (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/productos
app.post('/api/productos', (req, res) => {
  const { nombre, ingrediente, precio, categoria, imagen } = req.body;
  const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
  const sql = `INSERT INTO productos (nombre, ingrediente, precio, categoria, imagen) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [nombre, ingrediente, precio, categoria, imagen], function (err) {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// PUT /api/productos/:id
app.put('/api/productos/:id', (req, res) => {
  const { nombre, ingrediente, precio, categoria, imagen } = req.body;
  const { id } = req.params;
  const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
  const sql = `UPDATE productos SET nombre = ?, ingrediente = ?, precio = ?, categoria = ?, imagen = ? WHERE id = ?`;
  db.run(sql, [nombre, ingrediente, precio, categoria, imagen, id], function (err) {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// DELETE /api/productos/:id
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
  db.run('DELETE FROM productos WHERE id = ?', [id], function (err) {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// GET /api/exportar
app.get('/api/exportar', async (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
  db.all('SELECT nombre, ingrediente, precio, categoria FROM productos ORDER BY nombre', [], async (err, rows) => {
    db.close();
    if (err) return res.status(500).send(err.message);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Productos');
    ws.columns = [
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Ingrediente', key: 'ingrediente', width: 30 },
      { header: 'Precio', key: 'precio', width: 15 },
      { header: 'Categoría', key: 'categoria', width: 20 }
    ];
    rows.forEach(r => ws.addRow(r));

    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition','attachment; filename="lista_precios.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));

