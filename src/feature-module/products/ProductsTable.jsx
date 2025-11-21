import React, { useEffect, useState } from "react";
import PrimeDataTable from "../../components/data-table";

// This component now fetches products from the local API server at /api/products
// (see server/index.js). It also demonstrates a simple 'add sample product' POST.

const ProductsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addSampleProduct = async () => {
    setLoading(true);
    try {
      const sample = { name: 'New product', sku: `SKU-${Date.now()}`, price: 0, stock: 0 };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sample)
      });
      if (!res.ok) throw new Error('Create failed');
      await fetchData();
    } catch (err) {
      console.error('Failed to add sample product', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Name', field: 'name' },
    { header: 'SKU', field: 'sku' },
    { header: 'Price', field: 'price' },
    { header: 'Stock', field: 'stock' }
  ];

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Products (from API)</h5>
        <div>
          <button className="btn btn-sm btn-primary me-2" onClick={addSampleProduct}>
            Add sample product
          </button>
          <button className="btn btn-sm btn-secondary" onClick={fetchData}>
            Refresh
          </button>
        </div>
      </div>

      <PrimeDataTable
        column={columns}
        data={data}
        totalRecords={data.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        rows={rows}
        setRows={setRows}
        loading={loading}
        isPaginationEnabled={true}
      />
    </div>
  );
};

export default ProductsTable;
