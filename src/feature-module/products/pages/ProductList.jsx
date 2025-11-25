import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Brand from "../../../core/modals/inventory/brand";
import { all_routes } from "../../../routes/all_routes";
import ProductsTable from "../components/ProductsTable";
import TableTopHead from "../../../components/table-top-head";
import DeleteModal from "../../../components/delete-modal";
import SearchFromApi from "../../../components/data-table/search";
import ImageLightbox from "../../../components/image-lightbox";
import ProductListHeader from "../components/ProductListHeader";
import FiltersBar from "../components/FiltersBar";
import { buildProductColumns } from "../components/ProductListColumns";

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState(undefined);
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
  const columns = buildProductColumns({ onOpenLightbox: (images, index) => openLightbox(images, index), route });

  // Lightbox state
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const openLightbox = (images = [], index = 0) => setLightbox({ open: true, images, index });
  const closeLightbox = () => setLightbox({ open: false, images: [], index: 0 });

  // products fetching is now handled by ProductsTable (component) which calls
  // the centralized service. Keep meta fetch here for dropdowns.

  // fetch metadata for dropdowns
  useEffect(() => {
    let mounted = true;
    const loadMeta = async () => {
      try {
        const { fetchMeta } = await import('../services/api');
        const m = await fetchMeta();
        if (mounted) setMeta(m);
      } catch (err) {
        console.warn('Fetch meta error (ignored)', err);
        if (mounted) setMeta({ categories: [], brands: [], products: [], createdBy: [] });
      }
    };
    loadMeta();
    return () => { mounted = false; };
  }, []);



  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <ProductListHeader />
          <TableTopHead />
          {/* /product list */}
          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
              <FiltersBar
                meta={meta}
                filters={filters}
                setFilters={setFilters}
                sort={sort}
                setSort={setSort}
                setCurrentPage={setCurrentPage}
              />
            </div>
            <div className="card-body">
              {/* /Filter */}
              <div className="table-responsive">
                {/* <Table columns={columns} dataSource={productlistdata} /> */}
                <ProductsTable
                  columns={columns}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  rows={rows}
                  setRows={setRows}
                  filters={filters}
                  sort={sort}
                  onSort={(e) => {
                    const sf = e.sortField;
                    const so = e.sortOrder === -1 ? 'desc' : 'asc';
                    setSort({ field: sf, order: so });
                    setCurrentPage(1);
                  }}
                  setTotalRecords={setTotalRecords}
                  onOpenLightbox={openLightbox}
                />
                
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
