import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import PaginatorDataTable from '../../components/paginator-data-table/paginator'; 
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import { brandApi } from "../../services/api.service"; 
import AddBrand from "../../core/modals/inventory/addbrand"; 

const BrandList = () => {
  // ==================== STATE MANAGEMENT ====================
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [rows, setRows] = useState(Number(searchParams.get('pageSize')) || 10);
  const [_searchQuery, setSearchQuery] = useState(searchParams.get('search') || undefined);
  const [sort, setSort] = useState({
    field: searchParams.get('sortField') || '',
    order: searchParams.get('sortOrder') || '',
  });

  const [brands, setBrands] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null); 

  // ==================== HANDLERS ====================
  const handleSearch = (value) => { 
    setSearchQuery(value); 
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleSort = (e) => {
    const sf = e.sortField;
    const so = e.sortOrder === -1 ? 'desc' : 'asc';
    setSort({ field: sf, order: so });
    setCurrentPage(1); // Reset về trang 1 khi sắp xếp
  };
  
  // ==================== CẤU HÌNH CỘT ====================
  
  const logoBodyTemplate = (rowData) => {
    const logoUrl = rowData.logoUrl || rowData.logo; 
    if (!logoUrl) return <span>No Logo</span>;
    return (
      <div className="product-image-thumb text-center">
        <img 
          src={logoUrl} 
          alt={rowData.name || 'Brand Logo'} 
          onError={(e) => e.currentTarget.src = '/placeholder-logo.png'} 
          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
        />
      </div>
    );
  };
  
  const actionBodyTemplate = (rowData) => {
      return (
          <div className="d-flex align-items-center">
              <Link to="#" 
                  className="btn btn-sm me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" 
                  data-bs-toggle="modal" 
                  data-bs-target="#edit-brand"
                  onClick={() => console.log('Edit Brand:', rowData.id)} 
              >
                  <i className="ti ti-edit fs-5 me-1"></i> Edit
              </Link>
              <Link to="#" 
                  className="btn btn-sm btn-danger fs-13 fw-medium p-2 px-3 shadow-none" 
                  data-bs-toggle="modal" 
                  data-bs-target="#delete-modal"
                  onClick={() => setBrandToDelete(rowData.id)}
              >
                  <i className="ti ti-trash fs-5 me-1"></i> Delete
              </Link>
          </div>
      );
  };
  // Các cột dữ liệu của data table
  const columns = [
    // { 
    //   field: 'checkbox', 
    //   header: <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>,
    //   body: () => <label className="checkboxs"><input type="checkbox" /><span className="checkmarks" /></label>,
    //   sortable: false,
    //   className: 'text-center'
    // },
    { 
      field: 'id', 
      header: 'ID', 
      sortable: true,
      className: 'text-center'
    },
    { 
      field: 'name',
      header: 'Brand Name', 
      sortable: true,
    },
    {
      field: "slug",
      header: "Brand Slug",
      sortable: true
    },
    { 
      field: 'logoUrl', 
      header: 'Logo', 
      body: logoBodyTemplate, 
      sortable: false,
      className: 'text-center'
    },
    { 
      field: 'createdDate', 
      header: 'Created Date', 
      sortable: true,
      body: (rowData) => {
        if (!rowData.createdDate) return 'N/A';
        return new Date(rowData.createdDate).toLocaleDateString('vi-VN');
      }
    },
    { 
      field: 'isActive', 
      header: 'Status', 
      sortable: true,
      body: (rowData) => {
        const isActive = rowData.isActive !== undefined ? rowData.isActive : rowData.status === 'Active';
        return <span className={`badge ${isActive ? 'bg-success' : 'bg-danger'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      }
    },
    { 
      field: 'action', 
      header: 'Action', 
      body: actionBodyTemplate, 
      sortable: false
    },
  ]; 

  // ==================== API CALL - FIXED ====================
  
  const loadBrands = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
        // *** FIX: Gọi API đúng theo swagger với pageNumber và pageSize ***
        const response = await brandApi.getBrands(currentPage, rows);

        // Kiểm tra cấu trúc response từ API
        console.log('API Response:', response);

        // Xử lý response - backend có thể trả về nhiều format khác nhau
        let brandsData = [];
        let total = 0;

        if (Array.isArray(response)) {
          // Trường hợp API trả về array trực tiếp
          brandsData = response;
          total = response.length;
        } else if (response.data) {
          // Trường hợp API trả về { data: [...], total: N }
          brandsData = Array.isArray(response.data) ? response.data : [];
          total = response.total || response.totalRecords || brandsData.length;
        } else {
          console.warn('Unexpected API response format:', response);
        }

        setBrands(brandsData);
        setTotalRecords(total);

    } catch (err) {
        console.error("Fetch brands error:", err);
        setFetchError(err.message || 'Lỗi tải danh sách Brand.');
        setBrands([]);
        setTotalRecords(0);
    } finally {
        setLoading(false);
    }
  }, [currentPage, rows]); // Chỉ phụ thuộc vào currentPage và rows
  
  // ==================== URL SYNC ====================
  const updateUrl = useCallback((page, rows, sort, searchQuery) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page);
    if (rows !== 10) params.set('pageSize', rows); 
    if (sort.field) {
        params.set('sortField', sort.field);
        params.set('sortOrder', sort.order);
    }
    if (searchQuery) params.set('search', searchQuery);

    const newSearch = params.toString();
    const currentSearch = location.search.replace(/^\?/, '');
    
    if (newSearch !== currentSearch) {
      navigate({ 
        pathname: location.pathname, 
        search: newSearch 
      }, { replace: true }); 
    }
  }, [navigate, location.pathname, location.search]);

  // ==================== USE EFFECTS ====================
  
  // Load brands khi dependencies thay đổi
  useEffect(() => {
    loadBrands();
  }, [loadBrands]); 

  // Sync URL khi state thay đổi
  useEffect(() => {
    updateUrl(currentPage, rows, sort, _searchQuery);
  }, [currentPage, rows, sort, _searchQuery, updateUrl]);

  // Listen to URL changes (Back/Forward buttons)
  useEffect(() => {
      const currentParams = new URLSearchParams(location.search);
      const newPage = Number(currentParams.get('page')) || 1;
      const newRows = Number(currentParams.get('pageSize')) || 10;
      const newSearchQuery = currentParams.get('search') || undefined;
      const newSortField = currentParams.get('sortField') || '';
      const newSortOrder = currentParams.get('sortOrder') || '';

      if (newPage !== currentPage) setCurrentPage(newPage);
      if (newRows !== rows) setRows(newRows);
      if (newSearchQuery !== _searchQuery) setSearchQuery(newSearchQuery);
      if (newSortField !== sort.field || newSortOrder !== sort.order) {
        setSort({ field: newSortField, order: newSortOrder });
      }
  }, [location.search]); 

  // ==================== RENDER ====================
  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4 className="fw-bold">Brand</h4>
              <h6>Manage your brands</h6>
            </div>
          </div>
          <TableTopHead />
          <div className="page-btn">
            <Link
              to="#"
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#add-brand"
            >
              <i className="ti ti-circle-plus me-1"></i> Add New Brand
            </Link>
          </div>
        </div>
        
        <div className="card table-list-card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <SearchFromApi 
              initialValue={_searchQuery} 
              callback={handleSearch} 
              rows={rows} 
              setRows={setRows} 
            />
            
            {/* Dropdown filters nếu cần */}
            <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
              <div className="dropdown">
                <Link
                  to="#"
                  className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                  data-bs-toggle="dropdown">
                  {sort.field ? `Sort: ${sort.field} (${sort.order})` : 'Sort By'}
                </Link>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link 
                      to="#" 
                      className="dropdown-item rounded-1"
                      onClick={() => handleSort({ sortField: 'createdDate', sortOrder: -1 })}
                    >
                      Recently Added
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="#" 
                      className="dropdown-item rounded-1"
                      onClick={() => handleSort({ sortField: 'name', sortOrder: 1 })}
                    >
                      Name (A-Z)
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="#" 
                      className="dropdown-item rounded-1"
                      onClick={() => handleSort({ sortField: 'name', sortOrder: -1 })}
                    >
                      Name (Z-A)
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {fetchError && (
            <div className="w-100 p-3">
              <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {fetchError}
              </div>
            </div>
          )}

          <div className="card-body">
            <PaginatorDataTable
              column={columns}
              data={brands}
              rows={rows}
              setRows={setRows}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalRecords={totalRecords}
              loading={loading}
              serverSide={true} // Bật server-side pagination
              sortField={sort.field || undefined}
              sortOrder={sort.order === 'desc' ? -1 : (sort.order === 'asc' ? 1 : undefined)}
              onSort={handleSort}
            />
          </div>
        </div>
      </div>
      
      <CommonFooter />

      {/* Modals */}
      <AddBrand onSuccess={loadBrands} />
      <DeleteModal 
        onConfirm={async () => {
          if (brandToDelete) {
            try {
              await brandApi.deleteBrand(brandToDelete);
              loadBrands(); // Reload data sau khi xóa
              setBrandToDelete(null);
            } catch (err) {
              console.error('Delete error:', err);
              alert('Xóa thất bại: ' + err.message);
            }
          }
        }}
        itemId={brandToDelete}
      />
    </div>
  );
};

export default BrandList;