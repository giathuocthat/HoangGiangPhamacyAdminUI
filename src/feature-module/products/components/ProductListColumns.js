import React from 'react';
import { Link } from 'react-router-dom';
// Nhận route và handler mở lightbox, trả về mảng cấu hình cột.
export const buildProductColumns = ({ onOpenLightbox, route }) => ([
  {
    header: 'ID',
    field: 'id',
    key: 'id',
    sortable: true,
    className: 'id-col',
  },
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
    key: 'checked',
  },
  {
    header: 'SKU',
    field: 'sku',
    key: 'sku',
    sortable: true,
  },
  {
    header: 'Product',
    field: 'product',
    key: 'product',
    sortable: true,
    body: (data) => (
      <div className="d-flex align-items-center">
        <Link
          to="#"
          className="avatar avatar-md me-2"
          onClick={(e) => {
            e.preventDefault();
            onOpenLightbox(data.images || [data.productImage], 0);
          }}
        >
          <img alt="" src={data.productImage} />
        </Link>
        <Link to={`${route.productdetails}/${encodeURIComponent(data.id)}`}>{data.product}</Link>
      </div>
    ),
  },
  {
    header: 'Category',
    field: 'category',
    key: 'category',
    sortable: true,
  },
  {
    header: 'Brand',
    field: 'brand',
    key: 'brand',
    sortable: true,
  },
  {
    header: 'Price',
    field: 'price',
    key: 'price',
    sortable: true,
  },
  {
    header: 'Unit',
    field: 'unit',
    key: 'unit',
    sortable: true,
  },
  {
    header: 'Qty',
    field: 'qty',
    key: 'qty',
    sortable: true,
  },
  {
    header: 'Created By',
    field: 'createdby',
    key: 'createdby',
    sortable: true,
    body: (data) => (
      <span className="userimgname">
        <Link to="/profile" className="product-img">
          <img alt="" src={data.img} />
        </Link>
        <Link to="/profile">{data.createdby}</Link>
      </span>
    ),
  },
  {
    header: '',
    field: 'actions',
    key: 'actions',
    sortable: false,
    body: () => (
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
    ),
  },
]);

export default buildProductColumns;
