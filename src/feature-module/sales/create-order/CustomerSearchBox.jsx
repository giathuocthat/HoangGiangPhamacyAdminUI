import { useState, useEffect, useRef } from 'react';
import { customerApi } from '../../../services/api.service';

const CustomerSearchBox = ({ onCustomerSelect }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searched, setSearched] = useState(false);
  const searchRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phoneNumber.trim().length >= 3) {
        handleSearch();
      } else {
        setSearchResults([]);
        setSearched(false);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [phoneNumber]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    setSearched(true);
    try {
      const response = await customerApi.searchByPhone(phoneNumber);
      const customers = response.data || [];
      setSearchResults(customers);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching customers:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    onCustomerSelect(customer);
    setPhoneNumber('');
    setSearchResults([]);
    setShowDropdown(false);
    setSearched(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  return (
    <div className="customer-search-box" ref={searchRef}>
      <label className="form-label">Tìm kiếm khách hàng</label>
      <div className="input-group mb-3">
        <input
          type="tel"
          className="form-control"
          placeholder="Nhập số điện thoại khách hàng..."
          value={phoneNumber}
          onChange={handleInputChange}
          autoComplete="off"
        />
        <button
          className="btn btn-primary"
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#create-customer-modal"
          title="Thêm khách hàng mới"
        >
          <i className="ti ti-plus"></i>
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-2">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Đang tìm kiếm...</span>
          </div>
          <span className="ms-2 text-muted">Đang tìm kiếm...</span>
        </div>
      )}

      {showDropdown && !isLoading && searchResults.length > 0 && (
        <div className="search-results-dropdown card position-absolute w-100" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
          <div className="list-group list-group-flush">
            {searchResults.map((customer) => (
              <button
                key={customer.id}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() => handleSelectCustomer(customer)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{customer.fullName}</h6>
                    <p className="mb-1 text-muted small">{customer.phoneNumber}</p>
                    {customer.address && (
                      <p className="mb-0 text-muted small">
                        {customer.address.addressLine}, {customer.address.wardName}, {customer.address.provinceName}
                      </p>
                    )}
                  </div>
                  <span className="badge bg-info">{customer.businessTypeName}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {searched && !isLoading && searchResults.length === 0 && phoneNumber.trim().length >= 3 && (
        <div className="alert alert-info" role="alert">
          <i className="ti ti-info-circle me-2"></i>
          Không tìm thấy khách hàng với số điện thoại này. Bấm nút <strong>+</strong> để tạo khách hàng mới.
        </div>
      )}
    </div>
  );
};

export default CustomerSearchBox;
