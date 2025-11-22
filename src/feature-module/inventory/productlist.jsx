import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Brand from "../../core/modals/inventory/brand";
import { all_routes } from "../../routes/all_routes";
import PrimeDataTable from "../../components/data-table";
import { user30 } from "../../utils/imagepath";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import ImageLightbox from "../../components/image-lightbox";

// static test data removed — product list is sourced from `/api/products` (server-side paginated)

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState(undefined);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [meta, setMeta] = useState({ categories: [], brands: [], products: [], createdBy: [] });
  const [filters, setFilters] = useState({ category: '', brand: '', product: '', createdby: '' });
  const [sort, setSort] = useState({ field: '', order: '' });
  
  const clearAllFilters = () => {
    setFilters({ category: '', brand: '', product: '', createdby: '' });
    setSort({ field: '', order: '' });
    setCurrentPage(1);
  };

  const clearFilter = (key) => {
    setFilters((f) => ({ ...f, [key]: '' }));
    setCurrentPage(1);
  };
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Router helpers to sync state with URL
  const location = useLocation();
  const navigate = useNavigate();

  // On mount / URL change: read query params into state
  useEffect(() => {
    const qs = new URLSearchParams(location.search || '');
    const p = parseInt(qs.get('page') || '1', 10) || 1;
    const r = parseInt(qs.get('rows') || String(rows), 10) || rows;
    const category = qs.get('category') || '';
    const brand = qs.get('brand') || '';
    const productQ = qs.get('product') || '';
    const createdbyQ = qs.get('createdby') || '';
    const sortFieldQ = qs.get('sortField') || '';
    const sortOrderQ = qs.get('sortOrder') || '';

    setCurrentPage(p);
    setRows(r);
    setFilters({ category, brand, product: productQ, createdby: createdbyQ });
    setSort({ field: sortFieldQ, order: sortOrderQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // When state changes, push (replace) a new URL so filters are shareable
  useEffect(() => {
    const qs = new URLSearchParams();
    if (currentPage && currentPage !== 1) qs.set('page', String(currentPage));
    if (rows && rows !== 10) qs.set('rows', String(rows));
    if (filters.category) qs.set('category', filters.category);
    if (filters.brand) qs.set('brand', filters.brand);
    if (filters.product) qs.set('product', filters.product);
    if (filters.createdby) qs.set('createdby', filters.createdby);
    if (sort.field) qs.set('sortField', sort.field);
    if (sort.order) qs.set('sortOrder', sort.order);

    const newSearch = qs.toString();
    const currentSearch = (location.search || '').replace(/^\?/, '');
    if (newSearch !== currentSearch) {
      const url = newSearch ? `${location.pathname}?${newSearch}` : `${location.pathname}`;
      navigate(url, { replace: true });
    }
  }, [currentPage, rows, filters, sort, navigate, location.pathname, location.search]);

  const route = all_routes;
  const columns = [
  {
    header: "ID",
    field: "id",
    key: "id",
    sortable: true,
    className: "id-col"
  },
  {
    header:
    <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>,

    body: () =>
    <label className="checkboxs">
          <input type="checkbox" />
          <span className="checkmarks" />
        </label>,

    sortable: false,
    key: "checked"
  },
  {
    header: "SKU",
    field: "sku",
    key: "sku",
    sortable: true
  },
  {
    header: "Product",
    field: "product",
    key: "product",
    sortable: true,
    body: (data) =>
    <div className="d-flex align-items-center">
          <Link to="#" className="avatar avatar-md me-2" onClick={(e) => { e.preventDefault(); openLightbox(data.images || [data.productImage], 0); }}>
            <img alt="" src={data.productImage} />
          </Link>
          <Link to={`${route.productdetails}/${encodeURIComponent(data.id)}`}>{data.product}</Link>
        </div>

  },
  {
    header: "Category",
    field: "category",
    key: "category",
    sortable: true
  },
  {
    header: "Brand",
    field: "brand",
    key: "brand",
    sortable: true
  },
  {
    header: "Price",
    field: "price",
    key: "price",
    sortable: true
  },
  {
    header: "Unit",
    field: "unit",
    key: "unit",
    sortable: true
  },
  {
    header: "Qty",
    field: "qty",
    key: "qty",
    sortable: true
  },
  {
    header: "Created By",
    field: "createdby",
    key: "createdby",
    sortable: true,
    body: (data) =>
    <span className="userimgname">
          <Link to="/profile" className="product-img">
            <img alt="" src={data.img} />
          </Link>
          <Link to="/profile">{data.createdby}</Link>
        </span>

  },
  {
    header: "",
    field: "actions",
    key: "actions",
    sortable: false,
    body: (_row) =>
    <div className="edit-delete-action d-flex align-items-center">
          <Link
        className="me-2 p-2 d-flex align-items-center border rounded"
        to="#"
        data-bs-toggle="modal"
        data-bs-target="#edit-customer">
        
            <i className="feather icon-edit"></i>
          </Link>
          <Link
        className="p-2 d-flex align-items-center border rounded"
        to="#"
        data-bs-toggle="modal" data-bs-target="#delete-modal">
        
            <i className="feather icon-trash-2"></i>
          </Link>
        </div>

  }];

  // Lightbox state
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const openLightbox = (images = [], index = 0) => setLightbox({ open: true, images, index });
  const closeLightbox = () => setLightbox({ open: false, images: [], index: 0 });

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        setFetchError(null);
        const qs = new URLSearchParams({ page: String(currentPage), rows: String(rows) });
        if (filters.category) qs.set('category', filters.category);
        if (filters.brand) qs.set('brand', filters.brand);
        if (filters.product) qs.set('product', filters.product);
        if (filters.createdby) qs.set('createdby', filters.createdby);
        if (sort.field) qs.set('sortField', sort.field);
        if (sort.order) qs.set('sortOrder', sort.order);
        const relativeUrl = `/api/products?${qs.toString()}`;
        let res;
        try {
          res = await fetch(relativeUrl);
        } catch (err) {
          // network error on relative fetch, try direct backend
          console.warn('Relative fetch failed, trying direct backend', err);
          res = await fetch(`http://localhost:3000/api/products?${qs.toString()}`);
        }

        if (!res.ok) {
          // try fallback to backend if proxied returned 4xx/5xx
          if (res.status >= 400) {
            try {
              const res2 = await fetch(`http://localhost:3000/api/products?${qs.toString()}`);
              if (res2.ok) res = res2;
            } catch (err) {
              // ignore
            }
          }
        }

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          const msg = `GET ${res.url} -> ${res.status} ${res.statusText} ${text ? '\nResponse: ' + text.slice(0, 1000) : ''}`;
          console.error(msg);
          setFetchError(msg);
          if (mounted) setProducts([]);
          return;
        }

        const payload = await res.json();
        const rowsFromApi = Array.isArray(payload) ? payload : (payload.data || []);

        const mapped = rowsFromApi.map((r, idx) => {
          // map CSV headers to UI fields and parse images
          const imgField = r['Hình ảnh'] || r['Image'] || r['images'] || '';
          let images = [];
          if (imgField) {
            images = String(imgField).split(',').map(s => s.trim()).filter(Boolean);
          }
          const productImage = images.length ? images[0] : '';

          return {
            id: r.ID || r.id || (payload.page - 1) * payload.rows + idx + 1,
            sku: r.SKU || r.Sku || '',
            product: r['Tên'] || r['Name'] || r.name || '',
            productImage,
            images,
            category: r['Danh mục'] || r['Danh muc'] || r['Category'] || '',
            brand: r['Thương hiệu'] || r['Brand'] || '',
            price: r['Giá thông thường'] || r['Price'] || '',
            unit: r['Giá trị thuộc tính 1'] || r['Tên thuộc tính 1'] || r['attribute 1'] || '',
            qty: r['Tồn kho'] || r['Stock'] || '',
            createdby: '',
            img: user30
          };
        });

        if (mounted) {
          setProducts(mapped);
          setTotalRecords(payload.total || mapped.length);
        }
      } catch (err) {
        console.error('Fetch products error', err);
        setFetchError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => { mounted = false; };
  }, [currentPage, rows, filters, sort]);

  // fetch metadata for dropdowns
  useEffect(() => {
    let mounted = true;
    const fetchMeta = async () => {
      try {
        // meta is optional; failures here shouldn't show the big page error.
        let res;
        try {
          res = await fetch('/api/products/meta');
        } catch (err) {
          console.warn('Relative meta fetch failed, trying backend directly', err);
          try { res = await fetch('http://localhost:3000/api/products/meta'); } catch(e){ res = null; }
        }

        if (res && res.ok) {
          const m = await res.json();
          if (mounted) setMeta(m);
        } else {
          console.warn('Meta endpoint not available; continuing without meta dropdowns');
          if (mounted) setMeta({ categories: [], brands: [], products: [], createdBy: [] });
        }
      } catch (err) {
        console.warn('Fetch meta error (ignored)', err);
        if (mounted) setMeta({ categories: [], brands: [], products: [], createdBy: [] });
      }
    };
    fetchMeta();
    return () => { mounted = false; };
  }, []);



  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Product List</h4>
                <h6>Manage your products</h6>
              </div>
              {(filters.category || filters.brand || filters.product || filters.createdby || sort.field) &&
              <div className="w-100 mt-2 d-flex align-items-center flex-wrap gap-2">
                <div className="filter-badges d-flex align-items-center flex-wrap">
                  {filters.product ? (
                    <span className="badge bg-secondary me-2">Product: {filters.product} <button type="button" className="btn-close btn-close-white btn-sm ms-2" aria-label="Clear" onClick={() => clearFilter('product')}></button></span>
                  ) : null}
                  {filters.category ? (
                    <span className="badge bg-secondary me-2">Category: {filters.category} <button type="button" className="btn-close btn-close-white btn-sm ms-2" aria-label="Clear" onClick={() => clearFilter('category')}></button></span>
                  ) : null}
                  {filters.brand ? (
                    <span className="badge bg-secondary me-2">Brand: {filters.brand} <button type="button" className="btn-close btn-close-white btn-sm ms-2" aria-label="Clear" onClick={() => clearFilter('brand')}></button></span>
                  ) : null}
                  {filters.createdby ? (
                    <span className="badge bg-secondary me-2">Created By: {filters.createdby} <button type="button" className="btn-close btn-close-white btn-sm ms-2" aria-label="Clear" onClick={() => clearFilter('createdby')}></button></span>
                  ) : null}
                  {sort.field ? (
                    <span className="badge bg-info text-dark me-2">Sort: {sort.field} {sort.order} <button type="button" className="btn-close btn-close-white btn-sm ms-2" aria-label="Clear" onClick={() => setSort({ field: '', order: '' })}></button></span>
                  ) : null}
                </div>
                <div className="ms-auto">
                  <button className="btn btn-outline-danger btn-sm" onClick={clearAllFilters}>Clear All Filters</button>
                </div>
              </div>
              }
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link to={route.addproduct} className="btn btn-primary">
                <i className="ti ti-circle-plus me-1"></i>
                Add New Product
              </Link>
            </div>
            <div className="page-btn import">
              <Link
                to="#"
                className="btn btn-secondary color"
                data-bs-toggle="modal"
                data-bs-target="#view-notes">
                
                <i className="feather icon-download feather me-2" />
                Import Product
              </Link>
            </div>
          </div>
          {/* /product list */}
          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows} />
              
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown">
                    {filters.product || 'Product'}
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1" onClick={() => { setFilters(f => ({ ...f, product: '' })); setCurrentPage(1); }}>
                        All Products
                      </Link>
                    </li>
                    {meta.products && meta.products.map((p) => (
                      <li key={p}>
                        <Link to="#" className="dropdown-item rounded-1" onClick={() => { setFilters(f => ({ ...f, product: p })); setCurrentPage(1); }}>
                          {p}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown">
                    {filters.createdby || 'Created By'}
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1" onClick={() => { setFilters(f => ({ ...f, createdby: '' })); setCurrentPage(1); }}>
                        All
                      </Link>
                    </li>
                    {meta.createdBy && meta.createdBy.map((c) => (
                      <li key={c}>
                        <Link to="#" className="dropdown-item rounded-1" onClick={() => { setFilters(f => ({ ...f, createdby: c })); setCurrentPage(1); }}>
                          {c}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown">
                    {filters.category || 'Category'}
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1" onClick={() => { setFilters(f => ({ ...f, category: '' })); setCurrentPage(1); }}>
                        All Categories
                      </Link>
                    </li>
                    {meta.categories && meta.categories.map((c) => (
                      <li key={c}>
                        <Link to="#" className="dropdown-item rounded-1" onClick={() => { setFilters(f => ({ ...f, category: c })); setCurrentPage(1); }}>
                          {c}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown">
                    {filters.brand || 'Brand'}
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1" onClick={() => { setFilters(f => ({ ...f, brand: '' })); setCurrentPage(1); }}>
                        All Brands
                      </Link>
                    </li>
                    {meta.brands && meta.brands.map((b) => (
                      <li key={b}>
                        <Link to="#" className="dropdown-item rounded-1" onClick={() => { setFilters(f => ({ ...f, brand: b })); setCurrentPage(1); }}>
                          {b}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown">
                    {sort.field ? `${sort.field} ${sort.order}` : 'Sort By : Last 7 Days'}
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1" onClick={() => { setSort({ field: 'id', order: 'desc' }); setCurrentPage(1); }}>
                        Recently Added
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1" onClick={() => { setSort({ field: 'product', order: 'asc' }); setCurrentPage(1); }}>
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1" onClick={() => { setSort({ field: 'product', order: 'desc' }); setCurrentPage(1); }}>
                        Desending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1" onClick={() => { setSort({ field: 'id', order: 'asc' }); setCurrentPage(1); }}>
                        Oldest
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1" onClick={() => { setSort({ field: '', order: '' }); setCurrentPage(1); }}>
                        Clear Sort
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              {fetchError && (
                <div className="w-100 mt-2">
                  <div className="alert alert-danger" role="alert">
                    <strong>Data load error:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{fetchError}</pre>
                  </div>
                </div>
              )}
            </div>
            <div className="card-body">
              {/* /Filter */}
              <div className="table-responsive">
                {/* <Table columns={columns} dataSource={productlistdata} /> */}
                <PrimeDataTable
                  column={columns}
                  data={products}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={totalRecords}
                  loading={loading}
                  serverSide={true}
                  // map current sort to PrimeReact props (sortOrder numeric: 1 asc, -1 desc)
                  sortField={sort.field || undefined}
                  sortOrder={sort.order === 'desc' ? -1 : (sort.order === 'asc' ? 1 : undefined)}
                  onSort={(e) => {
                    // e.sortField and e.sortOrder (1 or -1)
                    const sf = e.sortField;
                    const so = e.sortOrder === -1 ? 'desc' : 'asc';
                    setSort({ field: sf, order: so });
                    setCurrentPage(1);
                  }} />
                
              </div>
            </div>
          </div>
          {/* /product list */}
          <Brand />
        </div>
      </div>
     <ImageLightbox
       open={lightbox.open}
       images={lightbox.images}
       index={lightbox.index}
       onClose={() => closeLightbox()}
       onPrev={() => setLightbox((s) => ({ ...s, index: Math.max(0, s.index - 1) }))}
       onNext={() => setLightbox((s) => ({ ...s, index: Math.min((s.images||[]).length - 1, s.index + 1) }))}
     />
     <DeleteModal />
    </>);

};

export default ProductList;