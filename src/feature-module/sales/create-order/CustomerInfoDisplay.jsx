const CustomerInfoDisplay = ({ customer, onClear }) => {
  if (!customer) return null;

  return (
    <div className="card customer-info-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="ti ti-user me-2"></i>
          Thông tin khách hàng
        </h5>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onClear}
        >
          <i className="ti ti-refresh me-1"></i>
          Thay đổi
        </button>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label text-muted small">Họ tên</label>
              <p className="fw-semibold mb-0">{customer.fullName}</p>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small">Số điện thoại</label>
              <p className="fw-semibold mb-0">
                <i className="ti ti-phone me-2"></i>
                {customer.phoneNumber}
              </p>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small">Email</label>
              <p className="fw-semibold mb-0">
                {customer.email ? (
                  <>
                    <i className="ti ti-mail me-2"></i>
                    {customer.email}
                  </>
                ) : (
                  <span className="text-muted">Chưa có</span>
                )}
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label text-muted small">Loại hình kinh doanh</label>
              <p className="fw-semibold mb-0">
                <span className="badge bg-info">{customer.businessTypeName}</span>
              </p>
            </div>
            {customer.address && (
              <>
                <div className="mb-3">
                  <label className="form-label text-muted small">Địa chỉ</label>
                  <p className="fw-semibold mb-0">
                    <i className="ti ti-map-pin me-2"></i>
                    {customer.address.addressLine}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">Khu vực</label>
                  <p className="fw-semibold mb-0">
                    {customer.address.wardName}, {customer.address.provinceName}
                  </p>
                </div>
                {customer.address.recipientName && customer.address.recipientName !== customer.fullName && (
                  <div className="mb-3">
                    <label className="form-label text-muted small">Người nhận hàng</label>
                    <p className="fw-semibold mb-0">
                      {customer.address.recipientName}
                      {customer.address.phoneNumber && customer.address.phoneNumber !== customer.phoneNumber && (
                        <span className="text-muted ms-2">({customer.address.phoneNumber})</span>
                      )}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoDisplay;
