import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const csvPath = path.join(__dirname, '..', 'data', 'Products.csv');

async function readCsv() {
  try {
    const content = await fs.readFile(csvPath, 'utf8');
    const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
    return parsed.data;
  } catch (err) {
    // If file not found, return empty array
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}
  
async function writeCsv(rows) {
  const csv = Papa.unparse(rows);
  await fs.mkdir(path.dirname(csvPath), { recursive: true });
  await fs.writeFile(csvPath, csv, 'utf8');
}

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    let rows = await readCsv();

    // Filtering params
    const { page = '1', rows: rowsPerPage = '10', category, brand, product, createdby, sortField, sortOrder } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const perPage = parseInt(rowsPerPage, 10) || 10;

    // helper to read a value from multiple possible headers
    const readField = (r, keys) => {
      for (const k of keys) {
        if (r[k] !== undefined && r[k] !== null) return String(r[k]);
      }
      return '';
    };

    // Apply filters (case-insensitive substring match)
    if (category) {
      const q = String(category).toLowerCase();
      rows = rows.filter((r) => readField(r, ['Danh mục', 'Danh muc', 'Category', 'category']).toLowerCase().includes(q));
    }
    if (brand) {
      const q = String(brand).toLowerCase();
      rows = rows.filter((r) => readField(r, ['Thương hiệu', 'Thuong hieu', 'Brand', 'brand']).toLowerCase().includes(q));
    }
    if (product) {
      const q = String(product).toLowerCase();
      rows = rows.filter((r) => readField(r, ['Tên', 'Name', 'name', 'product']).toLowerCase().includes(q));
    }
    if (createdby) {
      const q = String(createdby).toLowerCase();
      rows = rows.filter((r) => readField(r, ['CreatedBy', 'createdby', 'created_by', 'Người tạo']).toLowerCase().includes(q));
    }

    // Sorting
    if (sortField) {
      const fieldMap = {
        id: ['ID', 'id'],
        sku: ['SKU', 'Sku', 'sku'],
        product: ['Tên', 'Name', 'name'],
        category: ['Danh mục', 'Danh muc', 'Category'],
        brand: ['Thương hiệu', 'Thuong hieu', 'Brand'],
        price: ['Giá thông thường', 'Gia', 'Price'],
        qty: ['Tồn kho', 'Stock', 'Qty']
      };
      const keys = fieldMap[sortField] || [sortField];
      rows.sort((a, b) => {
        const va = readField(a, keys);
        const vb = readField(b, keys);
        // numeric compare when both are numeric
        const na = Number(String(va).replace(/[^0-9.-]+/g, ''));
        const nb = Number(String(vb).replace(/[^0-9.-]+/g, ''));
        let cmp = 0;
        if (!Number.isNaN(na) && !Number.isNaN(nb)) cmp = na - nb;
        else cmp = String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' });
        return sortOrder === 'desc' ? -cmp : cmp;
      });
    }

    const total = rows.length;
    const start = (pageNum - 1) * perPage;
    const end = start + perPage;
    const pageRows = rows.slice(start, end);

    res.json({ data: pageRows, total, page: pageNum, rows: perPage });
  } catch (err) {
    console.error('Read CSV error', err);
    res.status(500).json({ error: 'Failed to read products' });
  }
});

// POST create product (append/rewrites CSV)
// GET meta values for dropdowns
app.get('/api/products/meta', async (req, res) => {
  try {
    const rows = await readCsv();
    const unique = (arr) => Array.from(new Set(arr.filter(Boolean))).sort((a,b) => a.localeCompare(b));

    const categories = unique(rows.map(r => r['Danh mục'] || r['Danh muc'] || r['Category'] || ''));
    const brands = unique(rows.map(r => r['Thương hiệu'] || r['Thuong hieu'] || r['Brand'] || ''));
    const products = unique(rows.map(r => r['Tên'] || r['Name'] || r['name'] || ''));
    const createdBy = unique(rows.map(r => r['CreatedBy'] || r['createdby'] || r['created_by'] || r['Người tạo'] || ''));

    res.json({ categories, brands, products, createdBy });
  } catch (err) {
    console.error('Meta CSV error', err);
    res.status(500).json({ error: 'Failed to read metadata' });
  }
});

// POST create product (append/rewrites CSV)
app.post('/api/products', async (req, res) => {
  try {
    const rows = await readCsv();
    const payload = req.body || {};

    // determine ID field naming
    const hasIDHeader = rows.length ? Object.prototype.hasOwnProperty.call(rows[0], 'ID') : true;
    const idKeys = ['ID', 'id'];
    const maxId = rows.reduce((m, r) => {
      for (const k of idKeys) {
        if (r[k] !== undefined && r[k] !== null) {
          const n = Number(String(r[k]).replace(/[^0-9.-]+/g, '')) || 0;
          return Math.max(m, n);
        }
      }
      return m;
    }, 0);

    const newId = maxId + 1;
    const newRow = { ...payload };
    if (hasIDHeader) newRow['ID'] = String(newId);
    else newRow['id'] = String(newId);

    rows.push(newRow);
    await writeCsv(rows);
    res.status(201).json({ data: newRow });
  } catch (err) {
    console.error('Create CSV error', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product by id
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const rows = await readCsv();
    const idx = rows.findIndex((r) => String(r.ID || r.id || '') === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const idKey = rows[idx].ID !== undefined ? 'ID' : 'id';
    rows[idx] = { ...rows[idx], ...req.body, [idKey]: id };
    await writeCsv(rows);
    res.json({ data: rows[idx] });
  } catch (err) {
    console.error('Update CSV error', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product by id
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const rows = await readCsv();
    const filtered = rows.filter((r) => String(r.ID || r.id || '') !== id);
    if (filtered.length === rows.length) return res.status(404).json({ error: 'Not found' });
    await writeCsv(filtered);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete CSV error', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  console.log(`Serving CSV from: ${csvPath}`);
});

export { app, readCsv, writeCsv, server };
