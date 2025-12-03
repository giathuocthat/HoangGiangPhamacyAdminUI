import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../../services/api.service'; // Import API service
import ImageLightbox from '../../components/image-lightbox';
import { toast } from 'react-toastify';
import { all_routes } from '../../routes/all_routes';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const route = all_routes;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State cho Lightbox ảnh
  const [lightbox, setLightbox] = useState({ open: false, index: 0, images: [] });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Gọi API lấy chi tiết sản phẩm
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Gọi API getProductById từ api.service.js
        const data = await productApi.getProductById(id);
        setProduct(data);

        // Xử lý danh sách ảnh cho Lightbox
        let imgList = [];
        if (data.images && data.images.length > 0) {
            // Sắp xếp theo displayOrder nếu có
            imgList = data.images.sort((a, b) => a.displayOrder - b.displayOrder).map(img => img.imageUrl);
        } else if (data.thumbnailUrl) {
            imgList = [data.thumbnailUrl];
        }
        setLightbox(prev => ({ ...prev, images: imgList }));

      } catch (error) {
        console.error("Error fetching product detail:", error);
        toast.error("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // Hàm mở Lightbox
  const openLightbox = (index) => {
    setLightbox(prev => ({ ...prev, open: true, index: index }));
  };

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <div className="page-wrapper"><div className="content"><div className="spinner-border text-primary" role="status"></div> Loading...</div></div>;
  if (!product) return <div className="page-wrapper"><div className="content"><h3>Không tìm thấy sản phẩm</h3></div></div>;

  // Lấy giá từ biến thể đầu tiên (nếu có)
  const displayPrice = product.productVariants && product.productVariants.length > 0 
    ? product.productVariants[0].price 
    : 0;

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Chi tiết sản phẩm</h4>
              <h6>Quản lý thông tin chi tiết thuốc & dược phẩm</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <div className="page-btn">
                <Link to={route.productlist} className="btn btn-secondary">
                  <i className="feather icon-arrow-left me-2" /> Quay lại
                </Link>
                {/* Nút Edit nhanh ngay trên trang Detail */}
                <Link to={`/edit-product/${product.id}`} className="btn btn-warning ms-2 text-white">
                  <i className="feather icon-edit me-2" /> Chỉnh sửa
                </Link>
              </div>
            </li>
          </ul>
        </div>

        <div className="row">
          {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
          <div className="col-lg-4 col-md-12">
            <div className="card">
              <div className="card-body">
                <div className="product-image-gallery">
                  {/* Ảnh chính */}
                  <div className="main-image mb-3 text-center border rounded p-2 bg-white">
                     <img 
                        src={lightbox.images[selectedImageIndex] || '/assets/img/product/product-placeholder.jpg'} 
                        alt={product.name} 
                        className="img-fluid" 
                        style={{ maxHeight: '350px', objectFit: 'contain', cursor: 'pointer' }}
                        onClick={() => openLightbox(selectedImageIndex)}
                     />
                  </div>
                  {/* Thumbnails */}
                  {lightbox.images.length > 1 && (
                    <div className="d-flex overflow-auto gap-2">
                      {lightbox.images.map((img, idx) => (
                        <div 
                            key={idx} 
                            className={`border rounded p-1 ${idx === selectedImageIndex ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer', minWidth: '60px' }}
                            onClick={() => setSelectedImageIndex(idx)}
                        >
                          <img src={img} alt="thumb" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Thông tin trạng thái */}
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Thông tin hệ thống</h5>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item d-flex justify-content-between">
                            <span className="text-muted">ID Sản phẩm:</span>
                            <span className="fw-bold">#{product.id}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                            <span className="text-muted">Trạng thái:</span>
                            {product.isActive ? 
                                <span className="badge bg-success">Đang hoạt động</span> : 
                                <span className="badge bg-danger">Ngừng kinh doanh</span>
                            }
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                            <span className="text-muted">Thuốc kê đơn:</span>
                            {product.isPrescriptionDrug ? 
                                <span className="badge bg-warning text-dark">Có (Rx)</span> : 
                                <span className="badge bg-info">Không</span>
                            }
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                            <span className="text-muted">Ngày tạo:</span>
                            <span>{new Date(product.createdDate).toLocaleDateString('vi-VN')}</span>
                        </li>
                    </ul>
                </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <div className="col-lg-8 col-md-12">
            <div className="card">
              <div className="card-body">
                {/* Tên & Giá */}
                <h3 className="mb-2">{product.name}</h3>
                <div className="d-flex align-items-center mb-3">
                    <h4 className="text-primary mb-0 me-3">{formatCurrency(displayPrice)}</h4>
                    <span className="text-muted">/ Đơn vị tính (Hộp/Vỉ)</span>
                </div>
                
                <div className="row mb-4">
                    <div className="col-md-6">
                        <p className="mb-1"><span className="text-muted">Thương hiệu:</span> <strong>{product.brand?.name || 'N/A'}</strong></p>
                        <p className="mb-1"><span className="text-muted">Danh mục:</span> <strong>{product.category?.name || 'N/A'}</strong></p>
                    </div>
                    <div className="col-md-6">
                         <p className="mb-1"><span className="text-muted">Số đăng ký:</span> <strong>{product.registrationNumber || 'Đang cập nhật'}</strong></p>
                         <p className="mb-1"><span className="text-muted">Slug:</span> <span className="fst-italic text-muted">{product.slug}</span></p>
                    </div>
                </div>

                <hr />

                {/* Mô tả ngắn */}
                <div className="mb-4">
                    <h5 className="fw-bold">Mô tả ngắn</h5>
                    <p className="text-secondary">{product.shortDescription || 'Chưa có mô tả ngắn'}</p>
                </div>

                {/* Thông tin dược lý (Quan trọng) */}
                <div className="medical-info-section bg-light p-3 rounded">
                    <div className="mb-3">
                        <h6 className="fw-bold text-dark"><i className="feather icon-activity me-2" />Thành phần (Ingredients)</h6>
                        <p>{product.ingredients || 'Đang cập nhật'}</p>
                    </div>
                    
                    <div className="mb-3">
                        <h6 className="fw-bold text-dark"><i className="feather icon-book-open me-2" />Hướng dẫn sử dụng (Usage)</h6>
                        <p style={{ whiteSpace: 'pre-line' }}>{product.usageInstructions || 'Đang cập nhật'}</p>
                    </div>

                    <div className="mb-3">
                        <h6 className="fw-bold text-danger"><i className="feather icon-alert-triangle me-2" />Chống chỉ định (Contraindications)</h6>
                        <p className="text-danger" style={{ whiteSpace: 'pre-line' }}>{product.contraindications || 'Không có'}</p>
                    </div>

                    <div className="mb-0">
                        <h6 className="fw-bold text-dark"><i className="feather icon-package me-2" />Bảo quản (Storage)</h6>
                        <p>{product.storageInstructions || 'Nơi khô ráo, thoáng mát'}</p>
                    </div>
                </div>

                {/* Mô tả đầy đủ (HTML) */}
                {product.fullDescription && (
                    <div className="mt-4">
                        <h5 className="fw-bold mb-3">Chi tiết sản phẩm</h5>
                        <div 
                            className="product-description-content"
                            dangerouslySetInnerHTML={{ __html: product.fullDescription }} 
                        />
                    </div>
                )}
              </div>
            </div>
            
            {/* Thông tin Variants (Nếu cần hiển thị chi tiết các loại quy cách) */}
            {product.productVariants && product.productVariants.length > 0 && (
                 <div className="card mt-3">
                    <div className="card-header">
                        <h5 className="card-title">Quy cách & Giá bán</h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="bg-light">
                                    <tr>
                                        <th>SKU</th>
                                        <th>Giá bán</th>
                                        <th>Giá gốc</th>
                                        <th>Tồn kho</th>
                                        <th>Kích thước/Cân nặng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.productVariants.map((variant, index) => (
                                        <tr key={index}>
                                            <td>{variant.sku}</td>
                                            <td className="fw-bold text-primary">{formatCurrency(variant.price)}</td>
                                            <td className="text-decoration-line-through text-muted">
                                                {variant.originalPrice ? formatCurrency(variant.originalPrice) : '-'}
                                            </td>
                                            <td>{variant.stockQuantity}</td>
                                            <td>
                                                {variant.weight ? `${variant.weight}kg` : ''} 
                                                {variant.dimensions ? ` - ${variant.dimensions}` : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Component */}
      <ImageLightbox
        open={lightbox.open}
        images={lightbox.images}
        index={lightbox.index}
        onClose={() => setLightbox(prev => ({ ...prev, open: false }))}
        onPrev={() => setLightbox(prev => ({ ...prev, index: (prev.index + prev.images.length - 1) % prev.images.length }))}
        onNext={() => setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }))}
      />
    </div>
  );
};

export default ProductDetail;