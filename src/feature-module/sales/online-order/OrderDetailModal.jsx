import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { orderApi } from "../../../services/api.service";
import { pdf, printer } from "../../../utils/imagepath";

const OrderDetailModal = ({ order, onStatusUpdated }) => {
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  useEffect(() => {
    if (order?.id) {
      fetchOrderDetail(order.id);
    }
  }, [order?.id]);

  // Define valid status transitions
  const getValidNextStatuses = (currentStatus) => {
    const statusMap = {
      'Pending': ['Confirmed', 'Cancelled'],
      'Confirmed': ['Processing', 'Cancelled'],
      'Processing': ['InTransit', 'Cancelled'],
      'InTransit': ['Shipping', 'Cancelled'],
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

  const handleStatusClick = (newStatus) => {
    setPendingStatus(newStatus);
    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!order?.id || !pendingStatus) return;

    setShowConfirmModal(false);
    setUpdatingStatus(true);

    try {
      const response = await orderApi.updateOrderStatus(order.id, pendingStatus);
      console.log('Update status response:', response);

      // Update local state
      const updatedData = response.data || response;
      setOrderDetail(updatedData);

      // Notify parent component
      if (onStatusUpdated) {
        onStatusUpdated(updatedData);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
      setPendingStatus(null);
    }
  };

  const cancelStatusUpdate = () => {
    setShowConfirmModal(false);
    setPendingStatus(null);
  };

  if (!order) return null;

  const displayOrder = orderDetail || order;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Pending': 'badge-cyan',
      'Confirmed': 'badge-info',
      'Processing': 'badge-warning',
      'InTransit': 'badge-purple',
      'Shipping': 'badge-primary',
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
    <>
      <div className="modal fade" id="order-detail-modal">
        <div className="modal-dialog sales-details-modal">
          <div className="modal-content">
            <div className="page-header p-4 border-bottom mb-0">
              <div className="add-item d-flex align-items-center">
                <div className="page-title modal-datail">
                  <h4 className="mb-0 me-2">Order Details</h4>
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
                  <i className="feather icon-arrow-left me-2" /> Back to Orders
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
                      <h6>Customer Info</h6>
                      <h4 className="mb-1">{displayOrder.customerName || 'Guest'}</h4>
                      <p className="mb-0">
                        Phone: <span>{displayOrder.customerPhone || 'N/A'}</span>
                      </p>
                      {displayOrder.customerEmail && (
                        <p className="mb-0">
                          Email: <span>{displayOrder.customerEmail}</span>
                        </p>
                      )}
                    </div>

                    <div className="col-md-6 details-item">
                      <h6>Order Info</h6>
                      <p className="mb-0">
                        Order Number:{" "}
                        <span className="fs-16 text-primary ms-2">
                          {displayOrder.orderNumber}
                        </span>
                      </p>
                      <p className="mb-0">
                        Date:{" "}
                        <span className="ms-2 text-gray-9">
                          {formatDate(displayOrder.createdDate)}
                        </span>
                      </p>
                      <p className="mb-0">
                        Order Status:{" "}
                        <span className={`badge ${getStatusBadgeClass(displayOrder.orderStatus)} ms-2`}>
                          {displayOrder.orderStatus}
                        </span>
                      </p>
                      <p className="mb-0">
                        Payment Status:{" "}
                        <span className={`badge ${getPaymentStatusBadgeClass(displayOrder.paymentStatus)} badge-xs shadow-none d-inline-flex align-items-center ms-2`}>
                          <i className="ti ti-point-filled me-1" />
                          {displayOrder.paymentStatus}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Status Update Section */}
                  {getValidNextStatuses(displayOrder.orderStatus).length > 0 && (
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
                                className={`btn btn-sm ${status === 'Cancelled' ? 'btn-danger' : 'btn-primary'}`}
                                onClick={() => handleStatusClick(status)}
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

                  <h5 className="order-text mt-4">Order Summary</h5>
                  <div className="table-responsive no-pagination mb-3">
                    <table className="table datanew">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Variant SKU</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total</th>
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
                          <h4 className="border-end">Sub Total</h4>
                          <h5>{formatCurrency(displayOrder.subTotal || displayOrder.totalAmount)}</h5>
                        </li>
                        <li className="border-bottom">
                          <h4 className="border-end">Shipping Fee</h4>
                          <h5>{formatCurrency(displayOrder.shippingFee || 0)}</h5>
                        </li>
                        <li className="border-bottom">
                          <h4 className="border-end">Discount</h4>
                          <h5>{formatCurrency(displayOrder.discountAmount || 0)}</h5>
                        </li>
                        <li className="border-bottom">
                          <h4 className="border-end">Grand Total</h4>
                          <h5>{formatCurrency(displayOrder.totalAmount)}</h5>
                        </li>
                        <li className="border-bottom">
                          <h4 className="border-end">Paid</h4>
                          <h5>{formatCurrency(displayOrder.paymentStatus === 'Paid' ? displayOrder.totalAmount : 0)}</h5>
                        </li>
                        <li className="border-bottom">
                          <h4 className="border-end">Due</h4>
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
              <button type="button" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Status Change</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelStatusUpdate}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to change the order status from{' '}
                  <strong>{displayOrder.orderStatus}</strong> to{' '}
                  <strong>{pendingStatus}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelStatusUpdate}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmStatusUpdate}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailModal;
