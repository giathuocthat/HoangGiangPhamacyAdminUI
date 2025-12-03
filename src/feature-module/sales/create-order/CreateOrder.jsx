import { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerSearchBox from './CustomerSearchBox';
import CustomerInfoDisplay from './CustomerInfoDisplay';
import CreateCustomerModal from './CreateCustomerModal';
import CommonFooter from '../../../components/footer/commonFooter';
import TableTopHead from '../../../components/table-top-head';

const CreateOrder = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
  };

  const handleCustomerCreated = (newCustomer) => {
    // Auto-populate the newly created customer
    setSelectedCustomer(newCustomer);
  };

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Tạo đơn hàng mới</h4>
                <h6>Thêm đơn hàng mới vào hệ thống</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="/sales/pos-order"
                className="btn btn-secondary"
              >
                <i className="ti ti-arrow-left me-1"></i>
                Quay lại
              </Link>
            </div>
          </div>

          {/* Customer Section */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="ti ti-user-search me-2"></i>
                Thông tin khách hàng
              </h5>
            </div>
            <div className="card-body">
              {!selectedCustomer ? (
                <CustomerSearchBox
                  onCustomerSelect={handleCustomerSelect}
                />
              ) : (
                <CustomerInfoDisplay
                  customer={selectedCustomer}
                  onClear={handleClearCustomer}
                />
              )}
            </div>
          </div>

          {/* Order Details Section - Only show when customer is selected */}
          {selectedCustomer && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="ti ti-shopping-cart me-2"></i>
                  Chi tiết đơn hàng
                </h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info" role="alert">
                  <i className="ti ti-info-circle me-2"></i>
                  Phần chọn sản phẩm và thanh toán sẽ được phát triển ở giai đoạn tiếp theo.
                </div>

                {/* Placeholder for future order form */}
                <div className="text-center py-5">
                  <i className="ti ti-package" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                  <p className="text-muted mt-3">Chức năng đang được phát triển...</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {selectedCustomer && (
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => window.history.back()}
                  >
                    <i className="ti ti-x me-1"></i>
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled
                  >
                    <i className="ti ti-check me-1"></i>
                    Tạo đơn hàng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <CommonFooter />
      </div>

      {/* Create Customer Modal */}
      <CreateCustomerModal
        onSuccess={handleCustomerCreated}
      />
    </div>
  );
};

export default CreateOrder;
