import { useState, useEffect } from 'react';
import { customerApi, businessTypeApi, provinceApi, wardApi } from '../../../services/api.service';
import CommonSelect from '../../../components/select/common-select';

const CreateCustomerModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    businessTypeId: null,
    addressLine: '',
    provinceId: null,
    wardId: null,
    recipientName: '',
    addressPhoneNumber: '',
  });

  const [businessTypes, setBusinessTypes] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load master data when modal is shown
  useEffect(() => {
    const modalElement = document.getElementById('create-customer-modal');

    const handleModalShown = () => {
      console.log('Modal opened - loading business types and provinces...');
      loadBusinessTypes();
      loadProvinces();
    };

    if (modalElement) {
      modalElement.addEventListener('shown.bs.modal', handleModalShown);
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener('shown.bs.modal', handleModalShown);
      }
    };
  }, []);

  // Load wards when province changes
  useEffect(() => {
    if (formData.provinceId) {
      loadWards(formData.provinceId);
    } else {
      setWards([]);
      setFormData(prev => ({ ...prev, wardId: null }));
    }
  }, [formData.provinceId]);

  const loadBusinessTypes = async () => {
    try {
      const response = await businessTypeApi.getAll();
      // BusinessType API returns { data: items, pagination: {...} }
      const types = response.data || [];
      setBusinessTypes(types.map(t => ({ label: t.name, value: t.id })));
    } catch (error) {
      console.error('Error loading business types:', error);
    }
  };

  const loadProvinces = async () => {
    try {
      const response = await provinceApi.getAll();
      // Province API returns array directly
      const provinceList = Array.isArray(response) ? response : [];
      setProvinces(provinceList.map(p => ({ label: p.name, value: p.id })));
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const loadWards = async (provinceId) => {
    try {
      const response = await wardApi.getByProvince(provinceId);
      // Ward API returns array directly
      const wardList = Array.isArray(response) ? response : [];
      setWards(wardList.map(w => ({ label: w.name, value: w.id })));
    } catch (error) {
      console.error('Error loading wards:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.businessTypeId) {
      newErrors.businessTypeId = 'Loại hình kinh doanh là bắt buộc';
    }

    if (!formData.addressLine.trim()) {
      newErrors.addressLine = 'Địa chỉ là bắt buộc';
    }

    if (!formData.provinceId) {
      newErrors.provinceId = 'Tỉnh/Thành phố là bắt buộc';
    }

    if (!formData.wardId) {
      newErrors.wardId = 'Phường/Xã là bắt buộc';
    }

    if (formData.addressPhoneNumber && !/^[0-9]{10,11}$/.test(formData.addressPhoneNumber)) {
      newErrors.addressPhoneNumber = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await customerApi.createCustomer(formData);

      // Show success message
      alert('Tạo khách hàng thành công!');

      // Reset form
      resetForm();

      // Close modal
      const modalElement = document.getElementById('create-customer-modal');
      if (modalElement && window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }

      // Callback with created customer
      if (onSuccess && response.data) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo khách hàng';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      businessTypeId: null,
      addressLine: '',
      provinceId: null,
      wardId: null,
      recipientName: '',
      addressPhoneNumber: '',
    });
    setErrors({});
  };

  return (
    <div className="modal fade" id="create-customer-modal" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">
              <i className="ti ti-user-plus me-2"></i>
              Thêm khách hàng mới
            </h4>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={resetForm}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {/* Basic Info */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Họ tên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Nhập họ tên"
                      maxLength={100}
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback">{errors.fullName}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                      maxLength={20}
                    />
                    {errors.phoneNumber && (
                      <div className="invalid-feedback">{errors.phoneNumber}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Nhập email"
                      maxLength={255}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Loại hình kinh doanh <span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={businessTypes}
                      value={formData.businessTypeId}
                      onChange={(e) => handleSelectChange('businessTypeId', e.value)}
                      placeholder="Chọn loại hình KD"
                      className={errors.businessTypeId ? 'is-invalid' : ''}
                    />
                    {errors.businessTypeId && (
                      <div className="invalid-feedback d-block">{errors.businessTypeId}</div>
                    )}
                  </div>
                </div>

                {/* Address Info */}
                <div className="col-12">
                  <hr className="my-3" />
                  <h6 className="mb-3">Địa chỉ</h6>
                </div>

                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Địa chỉ <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.addressLine ? 'is-invalid' : ''}`}
                      name="addressLine"
                      value={formData.addressLine}
                      onChange={handleInputChange}
                      placeholder="Số nhà, tên đường..."
                      maxLength={500}
                    />
                    {errors.addressLine && (
                      <div className="invalid-feedback">{errors.addressLine}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Tỉnh/Thành phố <span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={provinces}
                      value={formData.provinceId}
                      onChange={(e) => handleSelectChange('provinceId', e.value)}
                      placeholder="Chọn tỉnh/thành phố"
                      className={errors.provinceId ? 'is-invalid' : ''}
                    />
                    {errors.provinceId && (
                      <div className="invalid-feedback d-block">{errors.provinceId}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Phường/Xã <span className="text-danger">*</span>
                    </label>
                    <CommonSelect
                      options={wards}
                      value={formData.wardId}
                      onChange={(e) => handleSelectChange('wardId', e.value)}
                      placeholder="Chọn phường/xã"
                      disabled={!formData.provinceId}
                      className={errors.wardId ? 'is-invalid' : ''}
                    />
                    {errors.wardId && (
                      <div className="invalid-feedback d-block">{errors.wardId}</div>
                    )}
                  </div>
                </div>

                {/* Recipient Info (Optional) */}
                <div className="col-12">
                  <hr className="my-3" />
                  <h6 className="mb-3">Thông tin người nhận hàng (không bắt buộc)</h6>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Tên người nhận hàng</label>
                    <input
                      type="text"
                      className="form-control"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      placeholder="Để trống nếu trùng với khách hàng"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">SĐT người nhận</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.addressPhoneNumber ? 'is-invalid' : ''}`}
                      name="addressPhoneNumber"
                      value={formData.addressPhoneNumber}
                      onChange={handleInputChange}
                      placeholder="Để trống nếu trùng với SĐT khách hàng"
                      maxLength={20}
                    />
                    {errors.addressPhoneNumber && (
                      <div className="invalid-feedback">{errors.addressPhoneNumber}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={resetForm}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <i className="ti ti-plus me-1"></i>
                    Tạo khách hàng
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
