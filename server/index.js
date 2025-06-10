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

