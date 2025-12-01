process.env.NODE_ENV = 'test';

const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Use an in-memory virtual CSV via fs stubs, addressed by CSV_PATH env
const tmpCsvPath = path.join(__dirname, '..', 'data', 'products.test.csv');
process.env.CSV_PATH = tmpCsvPath;

// Initial virtual CSV content
const initialCsv = `id,name,price\n1,Item A,10\n2,Item B,20`;

// Stub fs to operate on a virtual CSV string for isolation
let virtualContent;
let originalReadFile;
let originalWriteFile;
let originalConsoleError;

beforeAll(() => {
  originalReadFile = fs.readFile;
  originalWriteFile = fs.writeFile;
  originalConsoleError = console.error;
  virtualContent = initialCsv;

  fs.readFile = (file, enc, cb) => {
    if (file === tmpCsvPath) return cb(null, virtualContent);
    return originalReadFile(file, enc, cb);
  };
  fs.writeFile = (file, content, enc, cb) => {
    if (file === tmpCsvPath) {
      virtualContent = content;
      return cb(null);
    }
    return originalWriteFile(file, content, enc, cb);
  };

  console.error = jest.fn();
});

afterAll(() => {
  fs.readFile = originalReadFile;
  fs.writeFile = originalWriteFile;
  console.error = originalConsoleError;
});

// Import after stubbing env and fs
const { app } = require('./index');

describe('Products API (CSV-backed)', () => {
  test('GET /api/Product returns all products with total', async () => {
    const res = await request(app).get('/api/Product').expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total', 2);
    expect(res.body.data).toEqual([
      { id: '1', name: 'Item A', price: '10' },
      { id: '2', name: 'Item B', price: '20' }
    ]);
  });

  test('POST /api/Product creates product with incremental id', async () => {
    const res = await request(app)
      .post('/api/Product')
      .send({ name: 'Item C', price: '30' })
      .expect(201);
    expect(res.body.data).toMatchObject({ id: '3', name: 'Item C', price: '30' });

    const res2 = await request(app).get('/api/Product').expect(200);
    expect(res2.body.total).toBe(3);
  });

  test('PUT /api/Product/:id updates a product and preserves id', async () => {
    const res = await request(app)
      .put('/api/Product/2')
      .send({ price: '25' })
      .expect(200);
    expect(res.body.data).toMatchObject({ id: '2', name: 'Item B', price: '25' });
  });

  test('PUT /api/Product/:id returns 404 when not found', async () => {
    const res = await request(app)
      .put('/api/Product/999')
      .send({ price: '25' })
      .expect(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  test('DELETE /api/Product/:id deletes product and returns success', async () => {
    await request(app).delete('/api/Product/1').expect(200);

    const res2 = await request(app).get('/api/Product').expect(200);
    expect(res2.body.total).toBe(2); // after prior POST we had 3, deleting id 1 leaves 2
    expect(res2.body.data.find((p) => p.id === '1')).toBeUndefined();
  });

  // New behaviors
  test('POST assigns id as max(existingIds)+1 when CSV has non-numeric ids', async () => {
    // Seed with a row having non-numeric id
    virtualContent = `id,name,price\nA,Alpha,5\n2,Item B,20`;
    const res = await request(app)
      .post('/api/Product')
      .send({ name: 'Next', price: '15' })
      .expect(201);
    expect(res.body.data.id).toBe('3');
  });

  test('PUT only updates specified fields and keeps other fields intact', async () => {
    // Reset to known state
    virtualContent = initialCsv;
    const res = await request(app)
      .put('/api/Product/1')
      .send({ price: '11' })
      .expect(200);
    expect(res.body.data).toEqual({ id: '1', name: 'Item A', price: '11' });
  });

  test('DELETE returns 404 when id not found', async () => {
    virtualContent = initialCsv;
    const res = await request(app).delete('/api/Product/999').expect(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  test('GET returns 500 when readCsv fails and logs error', async () => {
    // Force read failure by making fs.readFile return error for our path
    const err = new Error('boom');
    fs.readFile = (file, enc, cb) => {
      if (file === tmpCsvPath) return cb(err);
      return originalReadFile(file, enc, cb);
    };
    const res = await request(app).get('/api/Product').expect(500);
    expect(res.body).toEqual({ error: 'Failed to read products' });
    expect(console.error).toHaveBeenCalled();

    // restore working stub
    fs.readFile = (file, enc, cb) => {
      if (file === tmpCsvPath) return cb(null, virtualContent);
      return originalReadFile(file, enc, cb);
    };
  });

  test('POST returns 500 when writeCsv fails and logs error', async () => {
    virtualContent = initialCsv;
    // Make write fail for our csv
    fs.writeFile = (file, content, enc, cb) => {
      if (file === tmpCsvPath) return cb(new Error('disk full'));
      return originalWriteFile(file, content, enc, cb);
    };
    const res = await request(app)
      .post('/api/Product')
      .send({ name: 'Broken', price: '0' })
      .expect(500);
    expect(res.body).toEqual({ error: 'Failed to create product' });
    expect(console.error).toHaveBeenCalled();

    // restore write stub
    fs.writeFile = (file, content, enc, cb) => {
      if (file === tmpCsvPath) {
        virtualContent = content;
        return cb(null);
      }
      return originalWriteFile(file, content, enc, cb);
    };
  });
});
