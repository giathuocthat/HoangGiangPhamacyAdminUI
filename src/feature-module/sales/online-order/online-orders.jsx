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
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      sorter: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
      render: (text) => (
        <Link to={`#`} className="fw-semibold text-primary">
          {text}
        </Link>
      )
    },
    {
      title: "Tên khách hàng",
      dataIndex: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (text) => (
        <div className="d-flex align-items-center">

          <span>{text || 'Khách'}</span>
        </div>
      )
    },
    {
      title: "Số điện thoại",
      dataIndex: "customerPhone",
      sorter: (a, b) => a.customerPhone.localeCompare(b.customerPhone)
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
      render: (text) => formatDate(text)
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "orderStatus",
      render: (text) => (
        <span className={`badge ${getStatusBadgeClass(text)}`}>
          {text}
        </span>
      ),
      sorter: (a, b) => a.orderStatus.localeCompare(b.orderStatus)
    },
    {
      title: "Trạng thái thanh toán",
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
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (text) => (
        <span className="fw-semibold">{formatCurrency(text)}</span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: "Thao tác",
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
            Sửa
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
                <h4>Đơn hàng trực tuyến</h4>
                <h6>Quản lý đơn hàng trực tuyến</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="/create-order"
                className="btn btn-primary"
              >
                <i className="ti ti-circle-plus me-1"></i> Tạo đơn hàng
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
                  <option value="10">10 / trang</option>
                  <option value="25">25 / trang</option>
                  <option value="50">50 / trang</option>
                  <option value="100">100 / trang</option>
                </select>

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={fetchOrders}
                  disabled={loading}
                >
                  <i className="ti ti-refresh me-1"></i>
                  Làm mới
                </button>
              </div>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-2 text-muted">Đang tải đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="custom-datatable-filter table-responsive">
                  <OrderDatatable
                    columns={columns}
                    dataSource={[]}
                    showSearch={true}
                    onSearch={handleSearch}
                    searchValue={searchQuery}
                    searchPlaceholder="Tìm theo mã đơn, số điện thoại hoặc email..."
                    pagination={false}
                  />
                  <div className="text-center py-5">
                    <i className="ti ti-package" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                    <p className="text-muted mt-3">
                      {searchQuery ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
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
                    searchPlaceholder="Tìm theo mã đơn, số điện thoại hoặc email..."
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
                    Hiển thị {((currentPage - 1) * pageSize) + 1} đến{' '}
                    {Math.min(currentPage * pageSize, totalRecords)} trong tổng số {totalRecords} đơn hàng
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
