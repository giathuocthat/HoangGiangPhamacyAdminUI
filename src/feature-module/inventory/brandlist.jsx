import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import PaginatorDataTable from '../../components/paginator-data-table/paginator'; 
import TableTopHead from "../../components/table-top-head";
import SearchFromApi from "../../components/data-table/search";
import { brandApi } from "../../services/api.service"; 

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
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // ==================== HANDLERS ====================
  const handleSearch = (value) => { 
    setSearchQuery(value); 
    setCurrentPage(1);
  };

  const handleSort = (e) => {
    const sf = e.sortField;
    const so = e.sortOrder === -1 ? 'desc' : 'asc';
    setSort({ field: sf, order: so });
    setCurrentPage(1);
  };

  // ==================== MODAL ACTIONS ====================
  const handleViewBrand = (brandId) => {
    setSelectedBrand(brandId);
    setShowViewModal(true);
  };

  const handleEditBrand = (brandId) => {
    setSelectedBrand(brandId);
    setShowEditModal(true);
  };

  const handleDeleteBrand = (brandId) => {
    setSelectedBrand(brandId);
    setShowDeleteModal(true);
  };

  const handleAddBrand = () => {
    setShowAddModal(true);
  };

  // ==================== CẤU HÌNH CỘT ====================
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="d-flex align-items-center">
        <button 
          className="btn btn-sm me-2 btn-info fs-13 fw-medium p-2 px-3 shadow-none" 
          onClick={() => handleViewBrand(rowData.id)}
        >
          <i className="ti ti-eye fs-5 me-1"></i> View
        </button>
        <button 
          className="btn btn-sm me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" 
          onClick={() => handleEditBrand(rowData.id)}
        >
          <i className="ti ti-edit fs-5 me-1"></i> Edit
        </button>
        <button 
          className="btn btn-sm btn-danger fs-13 fw-medium p-2 px-3 shadow-none" 
          onClick={() => handleDeleteBrand(rowData.id)}
        >
          <i className="ti ti-trash fs-5 me-1"></i> Delete
        </button>
      </div>
    );
  };

  const columns = [
    { field: 'id', header: 'ID', sortable: true, className: 'text-center'},
    { field: 'name', header: 'Tên thương hiệu', sortable: true },
    { field: "slug", header: "Brand Slug", sortable: true },
    { field: "countryOfOrigin", header: "Xuất xứ", sortable: true },
    { 
      field: 'createdDate', 
      header: 'Ngày tạo', 
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
    { field: 'action', header: 'Action', body: actionBodyTemplate, sortable: false },
  ]; 

  // ==================== API CALL ====================
  const loadBrands = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await brandApi.getBrands(currentPage, rows);
      console.log('API Response:', response);

      let brandsData = [];
      let total = 0;

      if (Array.isArray(response)) {
        brandsData = response;
        total = response.length;
      } else if (response.data) {
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
  }, [currentPage, rows]);
  
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
  useEffect(() => {
    loadBrands();
  }, [loadBrands]); 

  useEffect(() => {
    updateUrl(currentPage, rows, sort, _searchQuery);
  }, [currentPage, rows, sort, _searchQuery, updateUrl]);

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
            <button
              className="btn btn-primary"
              onClick={handleAddBrand}
            >
              <i className="ti ti-circle-plus me-1"></i> Add New Brand
            </button>
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
              serverSide={true}
              sortField={sort.field || undefined}
              sortOrder={sort.order === 'desc' ? -1 : (sort.order === 'asc' ? 1 : undefined)}
              onSort={handleSort}
            />
          </div>
        </div>
      </div>
      
      <CommonFooter />

      {/* MODALS */}
      {showAddModal && <AddBrandModal onClose={() => setShowAddModal(false)} onSuccess={loadBrands} />}
      {showViewModal && <ViewBrandModal brandId={selectedBrand} onClose={() => setShowViewModal(false)} />}
      {showEditModal && <EditBrandModal brandId={selectedBrand} onClose={() => setShowEditModal(false)} onSuccess={loadBrands} />}
      {showDeleteModal && <DeleteBrandModal brandId={selectedBrand} onClose={() => setShowDeleteModal(false)} onSuccess={loadBrands} />}
    </div>
  );
};

// ==================== ADD BRAND MODAL ====================
const AddBrandModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    countryOfOrigin: "",
    website: "",
    logoUrl: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateSlug = (brandName) => {
    const generatedSlug = brandName
      .toLowerCase()
      .replace(/đ/g, 'd')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/-+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    return generatedSlug;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "name") {
      // Auto-generate slug when name changes
      const generatedSlug = handleGenerateSlug(value);
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generatedSlug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // API POST /api/Brand
      await brandApi.post('/brand', formData);
      alert('Thêm thương hiệu thành công!');
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Error creating brand:', err);
      setError(err.message || 'Thêm thương hiệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Brand</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Brand <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    name="slug"
                    value={formData.slug}
                    readOnly
                    disabled
                    placeholder="Auto-generated from brand name"
                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                  />
                  <small className="form-text text-muted">Slug sẽ tự động tạo từ tên thương hiệu</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Country of Origin</label>
                  <input
                    type="text"
                    className="form-control"
                    name="countryOfOrigin"
                    value={formData.countryOfOrigin}
                    onChange={handleChange}
                    placeholder="Enter country"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    className="form-control"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Logo URL</label>
                  <input
                    type="url"
                    className="form-control"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                  />
                  {formData.logoUrl && (
                    <div className="mt-2 text-center">
                      <img src={formData.logoUrl} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} 
                        onError={(e) => e.currentTarget.src = '/placeholder-logo.png'} />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isActive">Status (Active)</label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== VIEW BRAND MODAL ====================
const ViewBrandModal = ({ brandId, onClose }) => {
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (brandId) loadBrandDetails();
  }, [brandId]);

  const loadBrandDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandApi.getBrandById(brandId);
      setBrand(response.data || response);
    } catch (err) {
      console.error('Error loading brand:', err);
      setError(err.message || 'Không thể tải thông tin thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Chi tiết thương hiệu</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {!loading && !error && brand && (
                <div className="brand-details">
                  <div className="row mb-3">
                    <div className="col-4"><strong>ID:</strong></div>
                    <div className="col-8">{brand.id}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4"><strong>Tên thương hiệu:</strong></div>
                    <div className="col-8">{brand.name}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4"><strong>Slug:</strong></div>
                    <div className="col-8">{brand.slug || 'N/A'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4"><strong>Xuất xứ:</strong></div>
                    <div className="col-8">{brand.countryOfOrigin || 'N/A'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4"><strong>Website:</strong></div>
                    <div className="col-8">
                      {brand.website ? (
                        <a href={brand.website} target="_blank" rel="noopener noreferrer">{brand.website}</a>
                      ) : 'N/A'}
                    </div>
                  </div>
                  {(brand.logoUrl || brand.logo) && (
                    <div className="row mb-3">
                      <div className="col-4"><strong>Logo:</strong></div>
                      <div className="col-8">
                        <img src={brand.logoUrl || brand.logo} alt={brand.name} 
                          style={{ maxWidth: '150px', height: 'auto' }}
                          onError={(e) => e.currentTarget.src = '/placeholder-logo.png'} />
                      </div>
                    </div>
                  )}
                  <div className="row mb-3">
                    <div className="col-4"><strong>Ngày tạo:</strong></div>
                    <div className="col-8">
                      {brand.createdDate ? new Date(brand.createdDate).toLocaleString('vi-VN') : 'N/A'}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-4"><strong>Trạng thái:</strong></div>
                    <div className="col-8">
                      <span className={`badge ${brand.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== EDIT BRAND MODAL ====================
const EditBrandModal = ({ brandId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    countryOfOrigin: "",
    website: "",
    logoUrl: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingBrand, setLoadingBrand] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateSlug = (brandName) => {
    const generatedSlug = brandName
      .toLowerCase()
      .replace(/đ/g, 'd')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/-+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    return generatedSlug;
  };

  useEffect(() => {
    if (brandId) loadBrandDetails();
  }, [brandId]);

  const loadBrandDetails = async () => {
    setLoadingBrand(true);
    setError(null);
    try {
      const response = await brandApi.getBrandById(brandId);
      const brand = response.data || response;
      
      setFormData({
        name: brand.name || "",
        slug: brand.slug || "",
        countryOfOrigin: brand.countryOfOrigin || "",
        website: brand.website || "",
        logoUrl: brand.logoUrl || brand.logo || "",
        isActive: brand.isActive !== undefined ? brand.isActive : true,
      });
    } catch (err) {
      console.error('Error loading brand:', err);
      setError(err.message || 'Không thể tải thông tin thương hiệu');
    } finally {
      setLoadingBrand(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "name") {
      // Auto-generate slug when name changes
      const generatedSlug = handleGenerateSlug(value);
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generatedSlug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await brandApi.updateBrand(brandId, formData);
      alert('Cập nhật thương hiệu thành công!');
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Error updating brand:', err);
      setError(err.message || 'Cập nhật thương hiệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Chỉnh sửa thương hiệu</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {loadingBrand && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                {!loadingBrand && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Tên thương hiệu <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="name" value={formData.name}
                        onChange={handleChange} placeholder="Nhập tên thương hiệu" required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Slug</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="slug" 
                        value={formData.slug}
                        readOnly
                        disabled
                        placeholder="Auto-generated from brand name"
                        style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                      />
                      <small className="form-text text-muted">Slug sẽ tự động cập nhật khi thay đổi tên thương hiệu</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Xuất xứ</label>
                      <input type="text" className="form-control" name="countryOfOrigin" value={formData.countryOfOrigin}
                        onChange={handleChange} placeholder="Nhập xuất xứ" />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Website</label>
                      <input type="url" className="form-control" name="website" value={formData.website}
                        onChange={handleChange} placeholder="https://example.com" />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Logo URL</label>
                      <input type="url" className="form-control" name="logoUrl" value={formData.logoUrl}
                        onChange={handleChange} placeholder="https://example.com/logo.png" />
                      {formData.logoUrl && (
                        <div className="mt-2 text-center">
                          <img src={formData.logoUrl} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px' }}
                            onError={(e) => e.currentTarget.src = '/placeholder-logo.png'} />
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <input type="checkbox" className="form-check-input" id="isActiveEdit" name="isActive"
                          checked={formData.isActive} onChange={handleChange} />
                        <label className="form-check-label" htmlFor="isActiveEdit">Kích hoạt</label>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={loading || loadingBrand}>
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== DELETE BRAND MODAL ====================
const DeleteBrandModal = ({ brandId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await brandApi.deleteBrand(brandId);
      alert('Xóa thương hiệu thành công!');
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Xóa thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Xác nhận xóa</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa thương hiệu này không?</p>
              <p className="text-danger">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Hủy
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandList;