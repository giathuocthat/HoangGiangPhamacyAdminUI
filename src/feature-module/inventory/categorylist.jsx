import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TreeTable } from 'primereact/treetable'; 
import { Column } from 'primereact/column';     
import EditCategoryList from "../../core/modals/inventory/editcategorylist";
import CommonFooter from "../../components/footer/commonFooter";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import './categorylist.css';

// Call categoryAPI từ service
import { categoryApi } from "../../services/api.service"; 

const CategoryList = () => {
  // ==================== STATE MANAGEMENT ====================
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState({}); 
  const [sort, setSort] = useState({ field: '', order: '' });
  
  // State phụ trợ
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0); 
  
  // State để track nodes đã được refresh từ API
  const [refreshedNodes, setRefreshedNodes] = useState(new Set());

  // State cho View Category Detail
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Tạo slug từ tên category
  const toSlug = (str) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .replace(/đ/g, 'd')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/-+/g, "-")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // ==================== MAP DATA TO TREENODES ====================
  /**
   * Map backend data to TreeTable format
   * @param {Array} backendNodes - Array of category objects from backend
   */
  const mapBackendDataToTreeNodes = (backendNodes) => {
    if (!Array.isArray(backendNodes)) return [];

    return backendNodes.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      
      return {
        key: String(item.id),
        data: {
          id: item.id,
          category: item.name || item.categoryName, 
          categoryslug: item.slug || toSlug(item.name || item.categoryName), 
          createdDate: item.createdDate ? new Date(item.createdDate).toLocaleDateString() : "N/A",
          status: item.isActive ? "Active" : "Inactive"
        },
        // Đệ quy map children
        children: hasChildren ? mapBackendDataToTreeNodes(item.children) : undefined
      };
    });
  };

  // ==================== LOAD HIERARCHY (Initial Load) ====================
  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        // Load toàn bộ hierarchy như ban đầu
        const response = await categoryApi.getCategoryHierarchy();

        if (mounted) {
          const rawData = Array.isArray(response) ? response : (response.data || []);
          
          // Map dữ liệu sang format TreeTable
          const treeNodes = mapBackendDataToTreeNodes(rawData);
          
          setCategories(treeNodes); 
          setTotalRecords(treeNodes.length);
        }

      } catch (err) {
        console.error('Fetch categories error:', err);
        setFetchError('Không thể tải danh mục. Vui lòng kiểm tra kết nối.');
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => { mounted = false; };
  }, []); 

  // ==================== REFRESH CHILDREN ON EXPAND ====================
  /**
   * Handler khi expand/collapse node
   * Khi expand một node lần đầu tiên, sẽ call API để refresh children
   */
  const onToggle = async (event) => {
    console.log('🔍 onToggle triggered - Full event:', event);
    
    const newExpandedKeys = event.value;
    const previousExpandedKeys = expandedKeys;

    // Cập nhật expandedKeys trước
    setExpandedKeys(newExpandedKeys);

    // Tìm key nào vừa được expand (có trong new nhưng không có trong previous)
    const newlyExpandedKeys = Object.keys(newExpandedKeys).filter(
      key => newExpandedKeys[key] === true && !previousExpandedKeys[key]
    );

    console.log('🔑 Previous Expanded Keys:', previousExpandedKeys);
    console.log('🔑 New Expanded Keys:', newExpandedKeys);
    console.log('🆕 Newly Expanded Keys:', newlyExpandedKeys);

    // Nếu có key mới được expand
    if (newlyExpandedKeys.length > 0) {
      for (const nodeKey of newlyExpandedKeys) {
        // Kiểm tra xem node này đã được refresh chưa
        if (!refreshedNodes.has(nodeKey)) {
          try {
            // Tìm node từ categories tree bằng key
            const node = findNodeByKey(categories, nodeKey);
            
            if (!node) {
              console.warn(`⚠️ Node not found for key: ${nodeKey}`);
              continue;
            }

            console.log('📊 Found Node:', node);
            console.log(`🔄 Calling API for category ID: ${node.data.id}`);
            console.log(`📡 API URL: /api/Category/${node.data.id}/children`);
            
            // Call API để lấy children mới nhất
            const response = await categoryApi.getChildrenCategories(node.data.id);
            console.log('✅ API Response:', response);
            
            const childrenData = Array.isArray(response) ? response : (response.data || []);
            console.log('📦 Children Data:', childrenData);
            
            // Map children data
            const childrenNodes = mapBackendDataToTreeNodes(childrenData);
            console.log('🗺️ Mapped Children Nodes:', childrenNodes);

            // Cập nhật categories state với children mới
            setCategories(prevCategories => {
              return updateNodeChildren(prevCategories, nodeKey, childrenNodes);
            });

            // Đánh dấu node này đã được refresh: Call API children mỗi lần expand tree mẹ
            //setRefreshedNodes(prev => new Set([...prev, nodeKey]));

            console.log(`✅ Successfully refreshed children for category ID: ${node.data.id}`);

          } catch (error) {
            console.error('❌ Error refreshing children:', error);
            console.error('❌ Error details:', error.message);
          }
        } else {
          console.log(`⏭️ Node ${nodeKey} already refreshed, skipping API call`);
        }
      }
    }
  };

  /**
   * Helper function: Tìm node trong tree bằng key
   * @param {Array} nodes - Danh sách nodes
   * @param {string} targetKey - Key cần tìm
   * @returns {Object|null} Node nếu tìm thấy, null nếu không
   */
  const findNodeByKey = (nodes, targetKey) => {
    for (const node of nodes) {
      if (node.key === targetKey) {
        return node;
      }
      if (node.children) {
        const found = findNodeByKey(node.children, targetKey);
        if (found) return found;
      }
    }
    return null;
  };

  // ==================== VIEW CATEGORY DETAIL ====================
  /**
   * Handler khi click icon View (con mắt)
   * @param {number} categoryId - ID của category cần xem
   */
  const handleViewCategory = async (categoryId) => {
    try {
      setViewLoading(true);
      setShowViewModal(true);
      
      console.log(`👁️ Fetching category detail for ID: ${categoryId}`);
      console.log(`📡 API URL: /api/Category/${categoryId}`);
      
      // Call API để lấy thông tin chi tiết category
      const response = await categoryApi.getCategoryById(categoryId);
      console.log('✅ Category Detail Response:', response);
      
      setSelectedCategory(response);
      
    } catch (error) {
      console.error('❌ Error fetching category detail:', error);
      setFetchError('Không thể tải thông tin category.');
    } finally {
      setViewLoading(false);
    }
  };

  /**
   * Close view modal
   */
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedCategory(null);
  };

  /**
   * Helper function: Cập nhật children của một node trong tree
   * @param {Array} nodes - Danh sách nodes hiện tại
   * @param {string} targetKey - Key của node cần update
   * @param {Array} newChildren - Children mới cần gán
   */
  const updateNodeChildren = (nodes, targetKey, newChildren) => {
    return nodes.map(node => {
      if (node.key === targetKey) {
        // Tìm thấy node cần update
        return {
          ...node,
          children: newChildren
        };
      } else if (node.children) {
        // Đệ quy tìm trong children
        return {
          ...node,
          children: updateNodeChildren(node.children, targetKey, newChildren)
        };
      }
      return node;
    });
  };

  // ==================== DATA TABLE COLUMNS CONFIG ====================
  const columns = [
    {
      header: "ID",
      field: "id",
      key: "id",
      sortable: true
    },
    {
      header: "Category",
      field: "category",
      key: "category",
      sortable: true,
    },
    {
      header: "Category Slug",
      field: "categoryslug",
      key: "categoryslug",
      sortable: true
    },
    {
      header: "Created Date",
      field: "createdDate",
      key: "createdDate",
      sortable: true
    },
    {
      header: "Status",
      field: "status",
      key: "status",
      sortable: true,
      body: (nodeData) =>
        <span className={`badge ${nodeData.status === 'Inactive' ? 'bg-danger' : 'bg-success'} fw-medium fs-10`}>
          {nodeData.status}
        </span>
    },
    {
      header: "Actions",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (nodeData) =>
        <div className="edit-delete-action d-flex align-items-center">
          <Link 
            className="me-2 p-2 d-flex align-items-center border rounded" 
            to="#"
            onClick={(e) => {
              e.preventDefault();
              handleViewCategory(nodeData.id);
            }}
            title="View Category"
          >
            <i className="feather icon-eye"></i>
          </Link>
          <Link 
            className="me-2 p-2 d-flex align-items-center border rounded" 
            to="#" 
            data-bs-toggle="modal" 
            data-bs-target="#edit-customer"
            title="Edit Category"
          >
            <i className="feather icon-edit"></i>
          </Link>
          <Link 
            className="p-2 d-flex align-items-center border rounded" 
            to="#" 
            data-bs-toggle="modal" 
            data-bs-target="#delete-modal"
            title="Delete Category"
          >
            <i className="feather icon-trash-2"></i>
          </Link>
        </div>
    }
  ];

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
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-category">
                <i className="ti ti-circle-plus me-1"></i> Add Category
              </Link>
            </div>
          </div>

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
              
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-2">
                  <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    Status
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><Link to="#" className="dropdown-item rounded-1">Active</Link></li>
                    <li><Link to="#" className="dropdown-item rounded-1">Inactive</Link></li>
                  </ul>
                </div>
                <div className="dropdown">
                  <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    {sort.field ? `${sort.field} ${sort.order}` : 'Sort By : Last 7 Days'}
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><Link to="#" className="dropdown-item rounded-1" onClick={() => setSort({ field: 'createdDate', order: 'desc' })}>Recently Added</Link></li>
                    <li><Link to="#" className="dropdown-item rounded-1" onClick={() => setSort({ field: 'category', order: 'asc' })}>Ascending</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {fetchError && (
              <div className="w-100 p-3">
                <div className="alert alert-danger" role="alert">
                  <strong>Error:</strong> {fetchError} <br/>
                  <small>Vui lòng kiểm tra API Backend.</small>
                </div>
              </div>
            )}

            <div className="card-body">
              <div className="table-responsive category-table">
                <TreeTable 
                  value={categories} 
                  loading={loading}
                  expandedKeys={expandedKeys} 
                  onToggle={onToggle}
                  tableStyle={{ minWidth: '50rem' }}
                >
                  {columns.map((col) => {
                    if (col.field === 'category') {
                      return (
                        <Column 
                          key={col.key} 
                          field={col.field} 
                          header={col.header} 
                          expander 
                          sortable={col.sortable}
                        />
                      );
                    }
                    return (
                      <Column 
                        key={col.key} 
                        field={col.field} 
                        header={col.header} 
                        body={col.body ? (node) => col.body(node.data) : undefined} 
                        sortable={col.sortable} 
                      />
                    );
                  })}
                </TreeTable>
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>
      <EditCategoryList />
      <DeleteModal />
      
      {/* View Category Detail Modal */}
      {showViewModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Category Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseViewModal}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                {viewLoading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : selectedCategory ? (
                  <div className="category-detail-view">
                    <div className="row mb-3">
                      <div className="col-md-3 fw-bold">ID:</div>
                      <div className="col-md-9">{selectedCategory.id}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-3 fw-bold">Name:</div>
                      <div className="col-md-9">{selectedCategory.name || selectedCategory.categoryName}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-3 fw-bold">Slug:</div>
                      <div className="col-md-9">{selectedCategory.slug || toSlug(selectedCategory.name || selectedCategory.categoryName)}</div>
                    </div>
                    {selectedCategory.description && (
                      <div className="row mb-3">
                        <div className="col-md-3 fw-bold">Description:</div>
                        <div className="col-md-9">{selectedCategory.description}</div>
                      </div>
                    )}
                    {selectedCategory.parentId && (
                      <div className="row mb-3">
                        <div className="col-md-3 fw-bold">Parent ID:</div>
                        <div className="col-md-9">{selectedCategory.parentId}</div>
                      </div>
                    )}
                    <div className="row mb-3">
                      <div className="col-md-3 fw-bold">Status:</div>
                      <div className="col-md-9">
                        <span className={`badge ${selectedCategory.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {selectedCategory.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-3 fw-bold">Created Date:</div>
                      <div className="col-md-9">
                        {selectedCategory.createdDate 
                          ? new Date(selectedCategory.createdDate).toLocaleString() 
                          : 'N/A'}
                      </div>
                    </div>
                    {selectedCategory.updatedDate && (
                      <div className="row mb-3">
                        <div className="col-md-3 fw-bold">Updated Date:</div>
                        <div className="col-md-9">
                          {new Date(selectedCategory.updatedDate).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {selectedCategory.children && selectedCategory.children.length > 0 && (
                      <div className="row mb-3">
                        <div className="col-md-3 fw-bold">Children Count:</div>
                        <div className="col-md-9">{selectedCategory.children.length} sub-categories</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-warning">No data available</div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;