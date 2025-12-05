import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { orderApi } from "../../../services/api.service";
import { pdf, printer } from "../../../utils/imagepath";
import { formatCreatedDate } from "../../../utils/helpFunctions";

const OrderDetailModal = ({ order, onStatusUpdated, isViewMode = false }) => {
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (order?.id) {
      fetchOrderDetail(order.id);
    }
  }, [order?.id]);

  // Define valid status transitions
  const getValidNextStatuses = (currentStatus) => {
    const statusMap = {
      'Pending': ['Confirmed', 'Cancelled'],
      'Confirmed': ['Shipping', 'Cancelled'],
      'Shipping': ['Completed', 'Cancelled'],
      'Completed': [],
      'Cancelled': []
    };
    return statusMap[currentStatus] || [];
  };

  const fetchOrderDetail = async (orderId) => {
    setLoading(true);
    try {
      const response = await orderApi.getOrderById(orderId);
      console.log('Order detail response:', response);

      // Handle response structure
      const data = response.data || response;
      setOrderDetail(data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      setOrderDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!order?.id) return;

    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await orderApi.updateOrderStatus(order.id, newStatus);
      console.log('Update status response:', response);

      // Update local state
      const updatedData = response.data || response;
      setOrderDetail(updatedData);

      // Notify parent component
      if (onStatusUpdated) {
        onStatusUpdated(updatedData);
      }

      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!order) return null;

  const displayOrder = orderDetail || order;

  

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Pending': 'badge-cyan',
      'Processing': 'badge-warning',
      'Completed': 'badge-success',
      'Cancelled': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getPaymentStatusBadgeClass = (status) => {
    const statusMap = {
      'Unpaid': 'badge-soft-danger',
      'Paid': 'badge-soft-success',
      'Partial': 'badge-soft-warning',
      'Refunded': 'badge-soft-info'
    };
    return statusMap[status] || 'badge-soft-secondary';
  };

  return (
    <div className="modal fade" id="order-detail-modal">
      <div className="modal-dialog sales-details-modal">
        <div className="modal-content">
          <div className="page-header p-4 border-bottom mb-0">
            <div className="add-item d-flex align-items-center">
              <div className="page-title modal-datail">
                <h4 className="mb-0 me-2">{isViewMode ? 'Xem chi tiết Đơn hàng' : 'Manage Order'}</h4>
              </div>
            </div>
            <ul className="table-top-head">
              <li>
                <Link
                  to="#"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Pdf"
                >
                  <img src={pdf} alt="img" />
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Print"
                >
                  <img src={printer} alt="img" />
                </Link>
              </li>
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                <i className="feather icon-arrow-left me-2" /> Quay lại "Danh sách Đơn hàng"
              </Link>
            </div>
          </div>

          <div className="card border-0">
            <div className="card-body pb-0">
              <div
                className="invoice-box table-height"
                style={{
                  maxWidth: 1600,
                  width: "100%",
                  padding: 0,
                  fontSize: 14,
                  color: "#555"
                }}
              >
                <div className="row sales-details-items d-flex">
                  <div className="col-md-6 details-item">
                    <h6>Thông tin Chủ đơn hàng</h6>
                    <h4 className="mb-1">{displayOrder.customerName || 'Guest'}</h4>
                    <p className="mb-0">
                      Số điện thoại: <span>{displayOrder.customerPhone || 'N/A'}</span>
                    </p>
                    {displayOrder.customerEmail && (
                      <p className="mb-0">
                        Email: <span>{displayOrder.customerEmail}</span>
                      </p>
                    )}
                    {displayOrder.shippingAddress && (
                      <p className="mb-0">
                        Địa chỉ: <span>{displayOrder.shippingAddress}</span>
                      </p>
                    )}
                  </div>

                  <div className="col-md-6 details-item">
                    <h6>Thông tin đơn hàng</h6>
                    <p className="mb-0">
                      Số hiệu đơn hàng:{" "}
                      <span className="fs-16 text-primary ms-2">
                        {displayOrder.orderNumber}
                      </span>
                    </p>
                    <p className="mb-0">
                      Ngày tạo:{" "}
                      <span className="ms-2 text-gray-9">
                        {formatCreatedDate(displayOrder.createdDate)}
                      </span>
                    </p>
                    <p className="mb-0">
                      Tình trạng đơn hàng:{" "}
                      <span className={`badge ${getStatusBadgeClass(displayOrder.orderStatus)} ms-2`}>
                        {displayOrder.orderStatus}
                      </span>
                    </p>
                    <p className="mb-0">
                      Tình trạng thanh toán:{" "}
                      <span className={`badge ${getPaymentStatusBadgeClass(displayOrder.paymentStatus)} badge-xs shadow-none d-inline-flex align-items-center ms-2`}>
                        <i className="ti ti-point-filled me-1" />
                        {displayOrder.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Status Update Section - Only show if NOT in View Mode */}
                {!isViewMode && getValidNextStatuses(displayOrder.orderStatus).length > 0 && (
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="alert alert-info d-flex align-items-center justify-content-between">
                        <div>
                          <strong>Update Order Status:</strong>
                          <span className="ms-2">Current status is <strong>{displayOrder.orderStatus}</strong></span>
                        </div>
                        <div className="d-flex gap-2">
                          {getValidNextStatuses(displayOrder.orderStatus).map((status) => (
                            <button
                              key={status}
                              type="button"
                              className={`btn btn-sm ${
                                status === 'Cancelled' ? 'btn-danger' : 'btn-primary'
                              }`}
                              onClick={() => handleUpdateStatus(status)}
                              disabled={updatingStatus}
                            >
                              {updatingStatus ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                  Updating...
                                </>
                              ) : (
                                <>Change to {status}</>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <h5 className="order-text mt-4">Tóm tắt đơn hàng</h5>
                <div className="table-responsive no-pagination mb-3">
                  <table className="table datanew">
                    <thead>
                      <tr>
                        <th>Tên sản phẩm</th>
                        <th>Variant SKU</th>
                        <th>Số lượng</th>
                        <th>Giá tiền mỗi đơn vị</th>
                        <th>Tổng giá tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="text-center">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <span className="ms-2">Loading order items...</span>
                          </td>
                        </tr>
                      ) : orderDetail?.orderItems && orderDetail.orderItems.length > 0 ? (
                        orderDetail.orderItems.map((item, index) => (
                          <tr key={index}>
                            <td>{item.productName || 'N/A'}</td>
                            <td>{item.variantSKU || 'N/A'}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.unitPrice)}</td>
                            <td>{formatCurrency(item.totalLineAmount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-6 ms-auto">
                  <div className="total-order w-100 max-widthauto m-auto mb-4">
                    <ul className="border-1 rounded-1">
                      <li className="border-bottom">
                        <h4 className="border-end">Tổng phụ (Sub Total)</h4>
                        <h5>{formatCurrency(displayOrder.subTotal || displayOrder.totalAmount)}</h5>
                      </li>
                      <li className="border-bottom">
                        <h4 className="border-end">Phí giao hàng</h4>
                        <h5>{formatCurrency(displayOrder.shippingFee || 0)}</h5>
                      </li>
                      <li className="border-bottom">
                        <h4 className="border-end">Giảm giá</h4>
                        <h5>{formatCurrency(displayOrder.discountAmount || 0)}</h5>
                      </li>
                      <li className="border-bottom">
                        <h4 className="border-end">Số tiền tổng cộng (Grand Total)</h4>
                        <h5>{formatCurrency(displayOrder.totalAmount)}</h5>
                      </li>
                      <li className="border-bottom">
                        <h4 className="border-end">Đã trả</h4>
                        <h5>{formatCurrency(displayOrder.paymentStatus === 'Paid' ? displayOrder.totalAmount : 0)}</h5>
                      </li>
                      <li className="border-bottom">
                        <h4 className="border-end">Còn thiếu (Due)</h4>
                        <h5>{formatCurrency(displayOrder.paymentStatus === 'Paid' ? 0 : displayOrder.totalAmount)}</h5>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary me-2"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            {/* Ẩn nút Save khi ở chế độ view */}
            {!isViewMode && (
              <button type="button" className="btn btn-primary" data-bs-dismiss="modal">
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
