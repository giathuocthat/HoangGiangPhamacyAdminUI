import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { orderApi } from "../../../services/api.service";
import OnlineorderModal from "./onlineorderModal";
import OrderDetailModal from "./OrderDetailModal";
import CommonFooter from "../../../components/footer/commonFooter";
import TableTopHead from "../../../components/table-top-head";
import DeleteModal from "../../../components/delete-modal";
import OrderDatatable from "../../../components/custom/order-datatable";

const OnlineOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch orders when page, pageSize, or searchQuery changes
  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, searchQuery]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderApi.getOrders(
        currentPage,
        pageSize,
        searchQuery || null
      );

      console.log('Orders response:', response);

      // Handle response structure
      const data = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || {};

      setOrders(data);
      setTotalRecords(pagination.totalCount || data.length);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchValue) => {
    setSearchQuery(searchValue);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusUpdated = (updatedOrder) => {
    // Update the order in the list
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id
          ? { ...order, orderStatus: updatedOrder.orderStatus }
          : order
      )
    );
  };

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

  const columns = [
    {
      title: "Order Number",
      dataIndex: "orderNumber",
      sorter: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
      render: (text) => (
        <Link to={`#`} className="fw-semibold text-primary">
          {text}
        </Link>
      )
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (text) => (
        <div className="d-flex align-items-center">
          <div className="avatar avatar-md me-2 bg-light-info rounded-circle d-flex align-items-center justify-content-center">
            <span className="fw-semibold text-info">
              {text?.charAt(0)?.toUpperCase() || 'G'}
            </span>
          </div>
          <span>{text || 'Guest'}</span>
        </div>
      )
    },
    {
      title: "Phone",
      dataIndex: "customerPhone",
      sorter: (a, b) => a.customerPhone.localeCompare(b.customerPhone)
    },
    {
      title: "Date",
      dataIndex: "createdDate",
      sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
      render: (text) => formatDate(text)
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      render: (text) => (
        <span className={`badge ${getStatusBadgeClass(text)}`}>
          {text}
        </span>
      ),
      sorter: (a, b) => a.orderStatus.localeCompare(b.orderStatus)
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      render: (text) => (
        <span className={`badge badge-xs shadow-none ${getPaymentStatusBadgeClass(text)}`}>
          <i className="ti ti-point-filled me-1"></i>
          {text}
        </span>
      ),
      sorter: (a, b) => a.paymentStatus.localeCompare(b.paymentStatus)
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (text) => (
        <span className="fw-semibold">{formatCurrency(text)}</span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: "Actions",
      dataIndex: "action",
      render: (_, record) => (
        <div className="text-center">
          <Link
            to="#"
            className="btn btn-sm btn-outline-primary me-2"
            data-bs-toggle="modal"
            data-bs-target="#order-detail-modal"
            onClick={() => setSelectedOrder(record)}
          >
            <i className="feather icon-edit me-1"></i>
            Edit
          </Link>
        </div>
      )
    }
  ];


  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Online Orders</h4>
                <h6>Manage Your Online Orders</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="/create-order"
                className="btn btn-primary"
              >
                <i className="ti ti-circle-plus me-1"></i> Create Order
              </Link>
            </div>
          </div>

          {/* Order List */}
          <div className="card table-list-card manage-stock">
            <div className="card-header d-flex align-items-center justify-content-end flex-wrap row-gap-3">
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </select>

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={fetchOrders}
                  disabled={loading}
                >
                  <i className="ti ti-refresh me-1"></i>
                  Refresh
                </button>
              </div>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="custom-datatable-filter table-responsive">
                  <OrderDatatable
                    columns={columns}
                    dataSource={[]}
                    showSearch={true}
                    onSearch={handleSearch}
                    searchValue={searchQuery}
                    searchPlaceholder="Search by order number, phone, or email..."
                    pagination={false}
                  />
                  <div className="text-center py-5">
                    <i className="ti ti-package" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                    <p className="text-muted mt-3">
                      {searchQuery ? 'No orders found matching your search.' : 'No orders available.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="custom-datatable-filter table-responsive">
                  <OrderDatatable
                    columns={columns}
                    dataSource={orders}
                    showSearch={true}
                    onSearch={handleSearch}
                    searchValue={searchQuery}
                    searchPlaceholder="Search by order number, phone, or email..."
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      total: totalRecords,
                      onChange: (page) => setCurrentPage(page)
                    }}
                  />
                </div>
              )}
            </div>

            {/* Pagination Info */}
            {!loading && orders.length > 0 && (
              <div className="card-footer">
                <div className="d-flex justify-content-between align-items-center">
                  <p className="mb-0 text-muted">
                    Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                    {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} orders
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <CommonFooter />
      </div>

      <OnlineorderModal />
      <OrderDetailModal order={selectedOrder} onStatusUpdated={handleStatusUpdated} />
      <DeleteModal />
    </div>
  );
};

export default OnlineOrder;
