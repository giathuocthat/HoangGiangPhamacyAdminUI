import React from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../routes/all_routes';
// Header của trang list (tiêu đề + các nút action).
const ProductListHeader = () => {
  const route = all_routes;
  return (
    <div className="page-header">
      <div className="add-item d-flex">
        <div className="page-title">
          <h4>Product List</h4>
          <h6>Filter Sản phẩm theo:</h6>
        </div>
      </div>
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
          data-bs-target="#view-notes"
        >
          <i className="feather icon-download feather me-2" />
          Import Product
        </Link>
      </div>
    </div>
  );
};

export default ProductListHeader;
