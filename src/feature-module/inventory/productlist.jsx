import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Thêm toast để thông báo

// Services and Components
import { productApi } from "../../services/api.service";
import PaginatorDataTable from '../../components/paginator-data-table/paginator';
import CommonFooter from "../../components/footer/commonFooter";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import ImageLightbox from "../../components/image-lightbox"; 
import formatCreatedDate from "../../utils/helpFunctions";
// Modals
import Brand from "../../core/modals/inventory/brand"; 

// ==================== HELPER FUNCTION: FORMAT DATE ====================
/**
 * Định dạng chuỗi ngày tháng sang định dạng: dd/mm/yyyy - Thứ - HH:MM:SS (theo múi giờ địa phương)
 * @param {string} dateString 
 * @returns {string} Ngày tháng đã định dạng hoặc 'N/A'
 */

const ProductList = () => {
  // ==================== INITIALIZATION & STATE MANAGEMENT ====================
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  // Khởi tạo State từ URL
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [rows, setRows] = useState(Number(searchParams.get('rows')) || 10);
  const [_searchQuery, setSearchQuery] = useState(searchParams.get('search') || undefined);
  
  // FIX: Thay đổi sắp xếp mặc định sang ID GIẢM DẦN (newest first)
  const [sort, setSort] = useState({
    field: searchParams.get('sortField') || 'id', 
    order: searchParams.get('sortOrder') || 'desc', 
  });

  const [products, setProducts] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  // State quản lý lightbox (xem ảnh lớn) và delete modal
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const [itemToDelete, setItemToDelete] = useState(null); 

  // ==================== API CALL & DATA FETCHING ====================
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await productApi.getPagedProducts(
        currentPage,
        rows,
        _searchQuery,
        sort.field,
        sort.order
      );

      // Giả định API trả về { products: [...], pagination: { totalCount: X, ... } }
      const data = Array.isArray(response) ? response : (response.products || response.data);
      const total = response.pagination?.totalCount || response.totalRecords || (Array.isArray(response) ? response.length : data.length);
      
      setProducts(data);
      setTotalRecords(total);

    } catch (error) {
      console.error("Error fetching products:", error);
      setFetchError(error.message || "Lỗi khi tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, rows, _searchQuery, sort.field, sort.order]);

  useEffect(() => {
    // Cập nhật URL khi state thay đổi
    const params = new URLSearchParams();
    params.set('page', currentPage);
    params.set('rows', rows);
    if (_searchQuery) params.set('search', _searchQuery);
    if (sort.field) params.set('sortField', sort.field);
    if (sort.order) params.set('sortOrder', sort.order);
    navigate(`?${params.toString()}`, { replace: true });

    fetchData();
  }, [fetchData, currentPage, rows, _searchQuery, sort.field, sort.order, navigate]);

  // ==================== HANDLERS ====================
  
  // Xử lý chuyển trang
  const onPageChange = (event) => setCurrentPage(event.page + 1); 

  // Xử lý sắp xếp
  const handleSort = (e) => {
    // e.sortOrder: 1 (asc) hoặc -1 (desc)
    const order = e.sortOrder === 1 ? 'asc' : (e.sortOrder === -1 ? 'desc' : '');
    setSort({ field: e.sortField, order: order });
    setCurrentPage(1); // Reset về trang 1 khi sắp xếp
  };

  // Mở modal xóa
  const openDeleteModal = (item) => setItemToDelete(item);

  // Xử lý xóa sản phẩm
  const handleDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      // Giả định productApi.deleteProduct nhận Product ID
      await productApi.deleteProduct(itemToDelete.id); 
      toast.success(`Đã xóa sản phẩm: ${itemToDelete.name}`);
      setItemToDelete(null); // Đóng modal
      
      // Lấy lại dữ liệu sau khi xóa
      fetchData(); 
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Lỗi xóa sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lightbox
  const openLightbox = (images, startIndex) => setLightbox({ open: true, images, index: startIndex });
  const closeLightbox = () => setLightbox({ open: false, images: [], index: 0 });

  // ==================== TABLE COLUMNS DEFINITION (Cần chỉnh sửa cho phù hợp với data trả về) ====================

  const renderImageColumn = (rowData) => {
    const images = rowData.images || [];
    const mainImage = images.find(img => img.displayOrder === 1) || { imageUrl: rowData.thumbnailUrl };
    
    if (!mainImage.imageUrl) return <span className="text-muted">No Image</span>;

    // Chỉ lấy 1 ảnh (hoặc nhiều hơn nếu muốn mở lightbox nhiều ảnh)
    const gallery = images.map(img => img.imageUrl).filter(url => url); 
    const startIndex = gallery.findIndex(url => url === mainImage.imageUrl);

    return (
        <img 
            src={mainImage.imageUrl} 
            alt={rowData.name} 
            style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }} 
            className="rounded"
            onClick={() => openLightbox(gallery, startIndex)} // Mở lightbox
        />
    );
  };
  
  const renderPriceColumn = (rowData) => {
      // Giả định giá nằm trong productVariants, lấy giá của variant đầu tiên
      const variant = rowData.productVariants?.length > 0 ? rowData.productVariants[0] : null;
      if (!variant) return 'N/A';
      return `${variant.price.toLocaleString('vi-VN')} VNĐ`;
  };

  const renderActionColumn = (rowData) => (
    <div className="action-links d-flex justify-content-center align-items-center">
      {/* 1. Icon Xem chi tiết (Màu xanh dương) */}
      <Link 
        to={`/product-details/${rowData.id}`} 
        className="me-3 text-info" 
        title="Xem chi tiết"
      >
        <i className="feather icon-eye" style={{ fontSize: '1.2rem' }} />
      </Link>

      {/* 2. Icon Chỉnh sửa (Màu cam/vàng) - Link tới trang Edit */}
      <Link 
        to={`/edit-product/${rowData.id}`} 
        className="me-3 text-warning" 
        title="Chỉnh sửa"
      >
        <i className="feather icon-edit" style={{ fontSize: '1.2rem' }} />
      </Link>

      {/* 3. Icon Xóa (Màu đỏ - Ngoài cùng bên phải) */}
      <Link 
        to="#" 
        className="text-danger" 
        onClick={(e) => {
          e.preventDefault();
          openDeleteModal(rowData);
        }} 
        title="Xóa"
      >
        <i className="feather icon-trash-2" style={{ fontSize: '1.2rem' }} />
      </Link>
    </div>
  );
  
  const renderBrandColumn = (rowData) => {
    // Kiểm tra brand có tồn tại không trước khi truy cập .name
    return rowData.brand ? rowData.brand.name : 'N/A';
  };

  const renderCategoryColumn = (rowData) => {
    // Kiểm tra category có tồn tại không trước khi truy cập .name
    return rowData.category ? rowData.category.name : 'N/A';
  };
  
  // Hàm render cột Ngày tạo sử dụng formatCreatedDate
  const renderCreatedDateColumn = (rowData) => {
    return formatCreatedDate(rowData.createdDate);
  };


  const columns = [
    { field: 'id', header: 'ID', sortable: true, style: { width: '5%' } },
    { field: 'thumbnailUrl', header: 'Ảnh sản phẩm', body: renderImageColumn, style: { width: '10%' } },
    { field: 'name', header: 'Tên sản phẩm', sortable: true, style: { width: '20%' } },
    { field: 'brand', header: 'Thương hiệu', sortable: true, body: renderBrandColumn, style: { width: '15%' } },
    { field: 'category', header: 'Danh mục', sortable: true, body: renderCategoryColumn, style: { width: '15%' } },
    //{ field: 'ingredients', header: 'Thành phần', sortable: true, style: { width: '10%' } },
    { field: 'createdDate', header: 'Ngày tạo', sortable: true, body: renderCreatedDateColumn, style: { width: '15%' } },
    { header: 'Action', body: renderActionColumn, style: { width: '10%', textAlign: 'center' } },
  ];

  // ==================== RENDER ====================
  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Danh sách Sản phẩm</h4>
            </div>
          </div>
          <ul className="table-top-head">
            <SearchFromApi 
                searchQuery={_searchQuery} 
                setSearchQuery={setSearchQuery} 
                setCurrentPage={setCurrentPage} 
            />
          </ul>
        </div>

        {/* Product Table Card */}
        <div className="card">
          {fetchError && <div className="w-100 p-3"><div className="alert alert-danger">{fetchError}</div></div>}

          <div className="card-body">
            <PaginatorDataTable
              column={columns}
              data={products}
              rows={rows}
              setRows={setRows}
              currentPage={currentPage}
              setCurrentPage={onPageChange} // Dùng onPageChange đã xử lý (page + 1)
              totalRecords={totalRecords}
              loading={loading}
              serverSide={true}
              // map current sort to PrimeReact props (sortOrder numeric: 1 asc, -1 desc)
              sortField={sort.field || undefined}
              sortOrder={sort.order === 'desc' ? -1 : (sort.order === 'asc' ? 1 : undefined)}
              onSort={handleSort}
            />
          </div>
        </div>
      </div>
      
      <CommonFooter />

      {/* Modals (giữ lại cấu trúc theme) */}
      <Brand />

      {/* Delete Modal */}
      {itemToDelete && (
        <DeleteModal 
          show={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          itemName={itemToDelete.name}
          message={`Bạn có chắc muốn xóa sản phẩm ${itemToDelete.name} không?`}
        />
      )}

      {/* Image Lightbox Component */}
      <ImageLightbox
        open={lightbox.open}
        images={lightbox.images}
        index={lightbox.index}
        onClose={closeLightbox}
      />
    </div>
  );
};

export default ProductList;