// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import EditCategoryList from "../../core/modals/inventory/editcategorylist";
// import CommonFooter from "../../components/footer/commonFooter";
// import PrimeDataTable from "../../components/data-table";
// import TableTopHead from "../../components/table-top-head";
// import DeleteModal from "../../components/delete-modal";
// import SearchFromApi from "../../components/data-table/search";

// // Define interfaces for type safety















// const CategoryList = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalRecords, _setTotalRecords] = useState(5);
//   const [rows, setRows] = useState(10);
//   const [_searchQuery, setSearchQuery] = useState(undefined);


//   const handleSearch = (value) => {
//     setSearchQuery(value);
//   };
//   const dataSource = useSelector(
//     (state) => state.rootReducer.categotylist_data
//   );

//   const columns = [
//   {
//     header:
//     <label className="checkboxs">
//           <input type="checkbox" id="select-all" />
//           <span className="checkmarks" />
//         </label>,

//     body: () =>
//     <label className="checkboxs">
//           <input type="checkbox" />
//           <span className="checkmarks" />
//         </label>,

//     sortable: false,
//     key: "checked"
//   },
//   {
//     header: "Category",
//     field: "category",
//     key: "category",
//     sortable: true
//   },
//   {
//     header: "Category Slug",
//     field: "categoryslug",
//     key: "categoryslug",
//     sortable: true
//   },
//   {
//     header: "Created On",
//     field: "createdon",
//     key: "createdon",
//     sortable: true
//   },
//   {
//     header: "Status",
//     field: "status",
//     key: "status",
//     sortable: true,
//     body: (data) =>
//     <span className="badge bg-success fw-medium fs-10">{data.status}</span>

//   },
//   {
//     header: "",
//     field: "actions",
//     key: "actions",
//     sortable: false,
//     body: (_row) =>
//     <div className="edit-delete-action d-flex align-items-center">
//           <Link
//         className="me-2 p-2 d-flex align-items-center border rounded"
//         to="#"
//         data-bs-toggle="modal"
//         data-bs-target="#edit-customer">
        
//             <i className="feather icon-edit"></i>
//           </Link>
//           <Link
//         className="p-2 d-flex align-items-center border rounded"
//         to="#"
//         data-bs-toggle="modal" data-bs-target="#delete-modal">
        
//             <i className="feather icon-trash-2"></i>
//           </Link>
//         </div>

//   }];


//   return (
//     <div>
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="page-header">
//             <div className="add-item d-flex">
//               <div className="page-title">
//                 <h4 className="fw-bold">Category</h4>
//                 <h6>Manage your categories</h6>
//               </div>
//             </div>
//            <TableTopHead />
//             <div className="page-btn">
//               <Link
//                 to="#"
//                 className="btn btn-primary"
//                 data-bs-toggle="modal"
//                 data-bs-target="#add-category">
                
//                 <i className="ti ti-circle-plus me-1"></i>
//                 Add Category
//               </Link>
//             </div>
//           </div>
//           {/* /product list */}
//           <div className="card table-list-card">
//             <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//               <SearchFromApi
//                 callback={handleSearch}
//                 rows={rows}
//                 setRows={setRows} />
              
//               <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
//                 <div className="dropdown me-2">
//                   <Link
//                     to="#"
//                     className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
//                     data-bs-toggle="dropdown">
                    
//                     Status
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Active
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Inactive
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//                 <div className="dropdown">
//                   <Link
//                     to="#"
//                     className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
//                     data-bs-toggle="dropdown">
                    
//                     Sort By : Last 7 Days
//                   </Link>
//                   <ul className="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Recently Added
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Ascending
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Desending
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Last Month
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="dropdown-item rounded-1">
//                         Last 7 Days
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//             <div className="card-body">
//               <div className="table-responsive category-table">
//                 <PrimeDataTable
//                   column={columns}
//                   data={dataSource}
//                   rows={rows}
//                   setRows={setRows}
//                   currentPage={currentPage}
//                   setCurrentPage={setCurrentPage}
//                   totalRecords={totalRecords} />
                
//               </div>
//             </div>
//           </div>
//           {/* /product list */}
//         </div>
//         <CommonFooter />
//       </div>

//       {/* Add Category */}
//       <div className="modal fade" id="add-category">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header">
//                   <div className="page-title">
//                     <h4>Add Category</h4>
//                   </div>
//                   <button
//                     type="button"
//                     className="close bg-danger text-white fs-16"
//                     data-bs-dismiss="modal"
//                     aria-label="Close">
                    
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//                 <div className="modal-body">
//                   <form>
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Category<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                     <div className="mb-3">
//                       <label className="form-label">
//                         Category Slug<span className="text-danger ms-1">*</span>
//                       </label>
//                       <input type="text" className="form-control" />
//                     </div>
//                     <div className="mb-0">
//                       <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
//                         <span className="status-label">
//                           Status<span className="text-danger ms-1">*</span>
//                         </span>
//                         <input
//                           type="checkbox"
//                           id="user2"
//                           className="check"
//                           defaultChecked />
                        
//                         <label htmlFor="user2" className="checktoggle" />
//                       </div>
//                     </div>
//                   </form>
//                 </div>
//                 <div className="modal-footer">
//                   <button
//                     type="button"
//                     className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
//                     data-bs-dismiss="modal">
                    
//                     Cancel
//                   </button>
//                   <Link
//                     to="#"
//                     data-bs-dismiss="modal"
//                     className="btn btn-primary fs-13 fw-medium p-2 px-3">
                    
//                     Add Category
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* /Add Category */}

//       <EditCategoryList />
//       <DeleteModal />
//     </div>);

// };

// export default CategoryList;

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EditCategoryList from "../../core/modals/inventory/editcategorylist";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";

// Import service layer
import categoryService from "../../category/services/categoryService";

const CategoryList = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [filters, setFilters] = useState({ 
    status: '', 
    search: '' 
  });
  const [sort, setSort] = useState({ field: '', order: '' });

  // Router helpers
  const location = useLocation();
  const navigate = useNavigate();

  // Filter actions
  const clearAllFilters = () => {
    setFilters({ status: '', search: '' });
    setSort({ field: '', order: '' });
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setFilters(f => ({ ...f, search: value }));
    setCurrentPage(1);
  };

  // Sync state with URL params
  useEffect(() => {
    const qs = new URLSearchParams(location.search || '');
    const p = parseInt(qs.get('page') || '1', 10) || 1;
    const r = parseInt(qs.get('rows') || String(rows), 10) || rows;
    const status = qs.get('status') || '';
    const search = qs.get('search') || '';
    const sortFieldQ = qs.get('sortField') || '';
    const sortOrderQ = qs.get('sortOrder') || '';

    setCurrentPage(p);
    setRows(r);
    setFilters({ status, search });
    setSort({ field: sortFieldQ, order: sortOrderQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Update URL when state changes
  useEffect(() => {
    const qs = new URLSearchParams();
    if (currentPage && currentPage !== 1) qs.set('page', String(currentPage));
    if (rows && rows !== 10) qs.set('rows', String(rows));
    if (filters.status) qs.set('status', filters.status);
    if (filters.search) qs.set('search', filters.search);
    if (sort.field) qs.set('sortField', sort.field);
    if (sort.order) qs.set('sortOrder', sort.order);

    const newSearch = qs.toString();
    const currentSearch = (location.search || '').replace(/^\?/, '');
    if (newSearch !== currentSearch) {
      const url = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
      navigate(url, { replace: true });
    }
  }, [currentPage, rows, filters, sort, navigate, location.pathname, location.search]);

  // Table columns
  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: () => (
        <label className="checkboxs">
          <input type="checkbox" />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: "checked"
    },
    {
      header: "Category",
      field: "category",
      key: "category",
      sortable: true
    },
    {
      header: "Category Slug",
      field: "categoryslug",
      key: "categoryslug",
      sortable: true
    },
    {
      header: "Product Count",
      field: "productCount",
      key: "productCount",
      sortable: true,
      body: (data) => (
        <span className="badge bg-info fw-medium fs-10">
          {data.productCount || 0} products
        </span>
      )
    },
    {
      header: "Created On",
      field: "createdon",
      key: "createdon",
      sortable: true
    },
    {
      header: "Status",
      field: "status",
      key: "status",
      sortable: true,
      body: (data) => (
        <span className={`badge ${data.status === 'Active' ? 'bg-success' : 'bg-secondary'} fw-medium fs-10`}>
          {data.status}
        </span>
      )
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action d-flex align-items-center">
          <Link
            className="me-2 p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#edit-customer"
          >
            <i className="feather icon-edit"></i>
          </Link>
          <Link
            className="p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#delete-modal"
          >
            <i className="feather icon-trash-2"></i>
          </Link>
        </div>
      )
    }
  ];

  // ✅ FETCH CATEGORIES - Sử dụng service layer
  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        // Call service layer
        const payload = await categoryService.fetchCategories({
          page: currentPage,
          rows,
          filters,
          sort
        });

        if (!mounted) return;

        // Extract data array từ response
        const rowsFromApi = Array.isArray(payload) 
          ? payload 
          : (payload.data || []);

        // Map data sang UI format
        const mappedData = categoryService.mapCategoryData(rowsFromApi);

        setCategories(mappedData);
        setTotalRecords(payload.total || mappedData.length);

      } catch (err) {
        console.error('Load categories error:', err);
        if (mounted) {
          setFetchError(err.message || String(err));
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [currentPage, rows, filters, sort]);

  // Reset page khi rows thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Category</h4>
                <h6>Manage your categories</h6>
              </div>

              {/* Active Filters Badge */}
              {(filters.status || filters.search || sort.field) && (
                <div className="w-100 mt-2 d-flex align-items-center flex-wrap gap-2">
                  <div className="filter-badges d-flex align-items-center flex-wrap">
                    {filters.status && (
                      <span className="badge bg-secondary me-2">
                        Status: {filters.status}
                        <button 
                          type="button" 
                          className="btn-close btn-close-white btn-sm ms-2" 
                          aria-label="Clear" 
                          onClick={() => setFilters(f => ({ ...f, status: '' }))}
                        />
                      </span>
                    )}
                    {filters.search && (
                      <span className="badge bg-secondary me-2">
                        Search: {filters.search}
                        <button 
                          type="button" 
                          className="btn-close btn-close-white btn-sm ms-2" 
                          aria-label="Clear" 
                          onClick={() => {
                            setFilters(f => ({ ...f, search: '' }));
                            setSearchQuery('');
                          }}
                        />
                      </span>
                    )}
                    {sort.field && (
                      <span className="badge bg-info text-dark me-2">
                        Sort: {sort.field} {sort.order}
                        <button 
                          type="button" 
                          className="btn-close btn-close-white btn-sm ms-2" 
                          aria-label="Clear" 
                          onClick={() => setSort({ field: '', order: '' })}
                        />
                      </span>
                    )}
                  </div>
                  <div className="ms-auto">
                    <button 
                      className="btn btn-outline-danger btn-sm" 
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <TableTopHead />

            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-category"
              >
                <i className="ti ti-circle-plus me-1"></i>
                Add Category
              </Link>
            </div>
          </div>

          {/* Category List Card */}
          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />

              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                {/* Status Filter */}
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    {filters.status || 'Status'}
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => {
                          setFilters(f => ({ ...f, status: '' }));
                          setCurrentPage(1);
                        }}
                      >
                        All Status
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => {
                          setFilters(f => ({ ...f, status: 'Active' }));
                          setCurrentPage(1);
                        }}
                      >
                        Active
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => {
                          setFilters(f => ({ ...f, status: 'Inactive' }));
                          setCurrentPage(1);
                        }}
                      >
                        Inactive
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Sort Dropdown */}
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    {sort.field ? `${sort.field} ${sort.order}` : 'Sort By : Last 7 Days'}
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => {
                          setSort({ field: 'createdon', order: 'desc' });
                          setCurrentPage(1);
                        }}
                      >
                        Recently Added
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => {
                          setSort({ field: 'category', order: 'asc' });
                          setCurrentPage(1);
                        }}
                      >
                        Ascending (A-Z)
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => {
                          setSort({ field: 'category', order: 'desc' });
                          setCurrentPage(1);
                        }}
                      >
                        Descending (Z-A)
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => {
                          setSort({ field: 'productCount', order: 'desc' });
                          setCurrentPage(1);
                        }}
                      >
                        Most Products
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="#" 
                        className="dropdown-item rounded-1"
                        onClick={() => {
                          setSort({ field: '', order: '' });
                          setCurrentPage(1);
                        }}
                      >
                        Clear Sort
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Error Display */}
              {fetchError && (
                <div className="w-100 mt-2">
                  <div className="alert alert-danger" role="alert">
                    <strong>Data load error:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>
                      {fetchError}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="card-body">
              <div className="table-responsive category-table">
                <PrimeDataTable
                  column={columns}
                  data={categories}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={totalRecords}
                  loading={loading}
                  serverSide={true}
                  sortField={sort.field || undefined}
                  sortOrder={sort.order === 'desc' ? -1 : (sort.order === 'asc' ? 1 : undefined)}
                  onSort={(e) => {
                    const sf = e.sortField;
                    const so = e.sortOrder === -1 ? 'desc' : 'asc';
                    setSort({ field: sf, order: so });
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>

      {/* Add Category Modal */}
      <div className="modal fade" id="add-category">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header">
                  <div className="page-title">
                    <h4>Add Category</h4>
                  </div>
                  <button
                    type="button"
                    className="close bg-danger text-white fs-16"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label className="form-label">
                        Category<span className="text-danger ms-1">*</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Category Slug<span className="text-danger ms-1">*</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="mb-0">
                      <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                        <span className="status-label">
                          Status<span className="text-danger ms-1">*</span>
                        </span>
                        <input
                          type="checkbox"
                          id="user2"
                          className="check"
                          defaultChecked
                        />
                        <label htmlFor="user2" className="checktoggle" />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <Link
                    to="#"
                    data-bs-dismiss="modal"
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                  >
                    Add Category
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditCategoryList />
      <DeleteModal />
    </div>
  );
};

export default CategoryList;