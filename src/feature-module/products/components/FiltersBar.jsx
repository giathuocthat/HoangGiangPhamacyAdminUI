import React from 'react';
import { Link } from 'react-router-dom';
// Nhóm dropdown filters + badges + “Clear All Filters”.
const FiltersBar = ({ meta, filters, setFilters, sort, setSort, setCurrentPage }) => {
  const clearFilter = (key) => {
    setFilters((f) => ({ ...f, [key]: '' }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({ category: '', brand: '', product: '', createdby: '' });
    setSort({ field: '', order: '' });
    setCurrentPage(1);
  };

  return (
    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
      <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
        <div className="dropdown me-2">
          <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
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
          <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
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
          <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
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
          <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
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
          <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
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

      {(filters.category || filters.brand || filters.product || filters.createdby || sort.field) && (
        <div className="w-100 mt-2 d-flex align-items-center flex-wrap gap-2">
          <div className="filter-badges d-flex align-items-center flex-wrap">
            {filters.product ? (
              <span className="badge bg-secondary me-2">
                Product: {filters.product}
                <button type="button" className="btn-close btn-close-white btn-sm ms-2" aria-label="Clear" onClick={() => clearFilter('product')}></button>
              </span>
            ) : null}
            {filters.category ? (
              <span className="badge bg-secondary me-2">
                Category: {filters.category}
                <button type="button" className="btn-close btn-close-white btn-sm ms-2" aria-label="Clear" onClick={() => clearFilter('category')}></button>
              </span>
            ) : null}
            {filters.brand ? (
              <span className="badge bg-secondary me-2">
                Brand: {filters.brand}
                <button type="button" className="btn-close btn-close-white btn-sm ms-2" aria-label="Clear" onClick={() => clearFilter('brand')}></button>
              </span>
            ) : null}
            {filters.createdby ? (
              <span className="badge bg-secondary me-2">
                Created By: {filters.createdby}
                <button type="button" className="btn-close btn-close-white btn-sm ms-2" aria-label="Clear" onClick={() => clearFilter('createdby')}></button>
              </span>
            ) : null}
            {sort.field ? (
              <span className="badge bg-info text-dark me-2">
                Sort: {sort.field} {sort.order}
                <button type="button" className="btn-close btn-close-white btn-sm ms-2" aria-label="Clear" onClick={() => setSort({ field: '', order: '' })}></button>
              </span>
            ) : null}
          </div>
          <div className="ms-auto">
            <button className="btn btn-outline-danger btn-sm" onClick={clearAllFilters}>Clear All Filters</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersBar;
