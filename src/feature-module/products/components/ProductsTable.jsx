import React, { useEffect, useState } from 'react';
import PrimeDataTable from '../../../components/data-table';
import { fetchProducts } from '../services/api';

// Generic ProductsTable component used by pages. It performs server-side fetch
// using the centralized service and renders the PrimeDataTable wrapper.
const ProductsTable = ({
  columns,
  currentPage,
  setCurrentPage,
  rows,
  setRows,
  filters = {},
  sort = {},
  onSort,
  setTotalRecords,
  onOpenLightbox,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const doFetch = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const payload = await fetchProducts({ page: currentPage, rows, filters, sort });
        const rowsFromApi = Array.isArray(payload) ? payload : (payload.data || []);

        const mapped = rowsFromApi.map((r, idx) => {
          const imgField = r['Hình ảnh'] || r['Image'] || r['images'] || '';
          let images = [];
          if (imgField) images = String(imgField).split(',').map(s => s.trim()).filter(Boolean);
          const productImage = images.length ? images[0] : '';
          return {
            id: r.ID || r.id || ((payload.page || 1) - 1) * (payload.rows || rows) + idx + 1,
            sku: r.SKU || r.Sku || r.sku || '',
            product: r['Tên'] || r['Name'] || r.name || '',
            productImage,
            images,
            category: r['Danh mục'] || r['Danh muc'] || r['Category'] || '',
            brand: r['Thương hiệu'] || r['Brand'] || '',
            price: r['Giá thông thường'] || r['Price'] || r.price || '',
            unit: r['Giá trị thuộc tính 1'] || r['Tên thuộc tính 1'] || r['attribute 1'] || '',
            qty: r['Tồn kho'] || r['Stock'] || r.stock || '',
            createdby: r.createdby || '',
            img: r.img || ''
          };
        });

        if (mounted) {
          setData(mapped);
          setTotalRecords && setTotalRecords(payload.total || mapped.length);
        }
      } catch (err) {
        console.error('ProductsTable fetch error', err);
        if (mounted) setFetchError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    doFetch();
    return () => { mounted = false; };
  }, [currentPage, rows, JSON.stringify(filters), JSON.stringify(sort)]);

  // expose fetch error via console; parent can show errors if needed
  useEffect(() => { if (fetchError) console.warn('ProductsTable error:', fetchError); }, [fetchError]);

  return (
    <PrimeDataTable
      column={columns}
      data={data}
      totalRecords={undefined}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      rows={rows}
      setRows={setRows}
      loading={loading}
      isPaginationEnabled={true}
      serverSide={true}
      sortField={sort.field || undefined}
      sortOrder={sort.order === 'desc' ? -1 : (sort.order === 'asc' ? 1 : undefined)}
      onSort={onSort}
    />
  );
};

export default ProductsTable;
