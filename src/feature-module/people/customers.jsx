import { useState, useEffect } from "react";
import { Link } from "react-router";
import PrimeDataTable from "../../components/data-table";
import SearchFromApi from "../../components/data-table/search";
import DeleteModal from "../../components/delete-modal";
import CommonSelect from "../../components/select/common-select";
import TableTopHead from "../../components/table-top-head";
import { user41 } from "../../utils/imagepath";

// Import API services
import { customerApi, provinceApi, wardApi, businessTypeApi } from "../../services/api.service";

const Customers = () => {
  // ==================== STATE MANAGEMENT ====================
  // Data & Pagination
  const [listData, setListData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Dropdown Options từ API
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

  // Form Data cho Add Customer
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    addressLine: "",
    addressPhoneNumber: "",
    recipientName: "",
    provinceId: null,
    wardId: null,
    businessTypeId: null,
    isActive: true
  });

  // Form Validation & Submission
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View & Edit Customer States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Form Data
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    addressLine: "",
    addressPhoneNumber: "",
    recipientName: "",
    provinceId: null,
    wardId: null,
    businessTypeId: null,
    isActive: true
  });

  // ==================== FETCH CUSTOMERS DATA ====================
  useEffect(() => {
    // Chỉ fetch customers khi dropdown options đã sẵn sàng
    if (!loadingDropdowns && provinces.length > 0 && businessTypes.length > 0) {
      fetchCustomers();
    }
  }, [currentPage, rows, searchQuery, loadingDropdowns, provinces.length, businessTypes.length]);

  const fetchCustomers = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      console.log('🔄 Fetching customers...', { currentPage, rows, searchQuery });
      
      const response = await customerApi.getCustomers(currentPage, rows, searchQuery);
      console.log('✅ Customers Response:', response);

      if (response.data) {
        const customers = response.data.data || response.data;
        const pagination = response.data.pagination;

        console.log('📦 Raw customers:', customers);
        console.log('📋 Dropdown options:', { provinces, businessTypes, wards: wards.length });

        // Map data sang format table với mapping từ dropdown
        const mappedData = customers.map(customer => {
          // *** FIX 1: Đảm bảo lấy thông tin từ object 'address' nếu có
          const address = customer.address || {}; 

          // Dùng String ID để so sánh và map
          const provinceIdStr = String(address.provinceId || customer.provinceId || '');
          const wardIdStr = String(address.wardId || customer.wardId || '');
          const businessTypeIdStr = String(customer.businessTypeId || '');

          // Tìm tên từ dropdown options bằng cách so sánh String ID
          const matchedBusinessType = businessTypes.find(bt => String(bt.value) === businessTypeIdStr);
          const matchedProvince = provinces.find(p => String(p.value) === provinceIdStr);
          // Wards list không nhất quán, nhưng vẫn cố gắng map nếu có
          const matchedWard = wards.find(w => String(w.value) === wardIdStr); 
          
          return {
            id: customer.id,
            customer: customer.fullName,
            email: customer.email,
            phone: customer.phoneNumber,
            // Lấy thông tin người nhận/SĐT nhận từ object address
            recipientName: address.recipientName,
            addressPhoneNumber: address.phoneNumber,
            // Priority: API response (businessType?.name/businessTypeName) > dropdown mapping > N/A
            businessType: customer.businessType?.name || customer.businessTypeName || matchedBusinessType?.label || "N/A",
            // *** FIX 2: Ưu tiên lấy từ address.provinceName, sau đó mới đến mapping ID
            province: address.provinceName || address.province?.name || matchedProvince?.label || "N/A",
            // *** FIX 3: Ưu tiên lấy từ address.wardName, sau đó mới đến mapping ID
            ward: address.wardName || address.ward?.name || matchedWard?.label || "N/A",
            status: customer.isActive ? "Active" : "Inactive",
            avatar: user41
          };
        });

        console.log('✅ Mapped data:', mappedData);

        setListData(mappedData);
        setTotalRecords(pagination?.totalCount || customers.length);
      } else {
        setListData([]);
        setTotalRecords(0);
      }

    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      setFetchError('Không thể tải danh sách khách hàng. Vui lòng thử lại.');
      setListData([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FETCH DROPDOWN OPTIONS (PROVINCE, BUSINESS TYPE) ====================
  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  const fetchDropdownOptions = async () => {
    setLoadingDropdowns(true);

    try {
      console.log('🔄 Fetching dropdown options...');

      const [provincesRes, businessTypesRes] = await Promise.all([
        provinceApi.getProvinces(),
        businessTypeApi.getBusinessTypes()
      ]);

      // Map Provinces
      const provincesData = Array.isArray(provincesRes) ? provincesRes : (provincesRes.data || []);
      const mappedProvinces = provincesData.map(p => ({
        label: p.name,
        // *** Chuyển ID sang String khi tạo option để đảm bảo nhất quán ***
        value: String(p.id) 
      }));

      // Map Business Types
      const businessTypesData = Array.isArray(businessTypesRes) ? businessTypesRes : (businessTypesRes.data || []);
      const mappedBusinessTypes = businessTypesData.map(bt => ({
        label: bt.name,
        // *** Chuyển ID sang String khi tạo option để đảm bảo nhất quán ***
        value: String(bt.id)
      }));

      setProvinces(mappedProvinces);
      setBusinessTypes(mappedBusinessTypes);

    } catch (error) {
      console.error('❌ Error fetching dropdown options:', error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // ==================== FETCH WARDS BY PROVINCE ====================
  const fetchWardsByProvince = async (provinceId) => {
    if (!provinceId) {
      setWards([]);
      return;
    }

    setLoadingWards(true);
    
    try {
      console.log(`🔄 Fetching wards for province ID: ${provinceId}`);
      
      const wardsRes = await wardApi.getWardsByProvinceId(provinceId);

      // Map Wards
      const wardsData = Array.isArray(wardsRes) ? wardsRes : (wardsRes.data || []);
      const mappedWards = wardsData.map(w => ({
        label: w.name,
        // *** Chuyển ID sang String khi tạo option để đảm bảo nhất quán ***
        value: String(w.id)
      }));

      setWards(mappedWards);
      console.log(`✅ Loaded ${mappedWards.length} wards for province ${provinceId}`);

    } catch (error) {
      console.error('❌ Error fetching wards:', error);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  // ==================== FORM HANDLERS (ADD) ====================
  const handleInputChange = (field, value) => {
    // Giá trị dropdown luôn là String do đã map ở trên
    const finalValue = ['provinceId', 'wardId', 'businessTypeId'].includes(field) ? String(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [field]: finalValue
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // CRITICAL: Khi province thay đổi, reset ward và fetch Wards mới
    if (field === 'provinceId') {
      
      // Reset ward selection
      setFormData(prev => ({
        ...prev,
        wardId: null
      }));

      // Clear ward error if any
      if (formErrors.wardId) {
        setFormErrors(prev => ({
          ...prev,
          wardId: null
        }));
      }

      // Fetch wards for new province
      fetchWardsByProvince(finalValue);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName?.trim()) {
      errors.fullName = "Họ và tên khách hàng là bắt buộc";
    }

    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = "Số điện thoại là bắt buộc";
    }

    if (!formData.email?.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!formData.addressLine?.trim()) {
      errors.addressLine = "Địa chỉ là bắt buộc";
    }

    if (!formData.addressPhoneNumber?.trim()) {
      errors.addressPhoneNumber = "Số điện thoại người nhận là bắt buộc";
    }

    if (!formData.recipientName?.trim()) {
      errors.recipientName = "Tên người nhận là bắt buộc";
    }

    if (!formData.provinceId) {
      errors.provinceId = "Vui lòng chọn tỉnh thành";
    }

    if (!formData.wardId) {
      errors.wardId = "Vui lòng chọn phường";
    }

    if (!formData.businessTypeId) {
      errors.businessTypeId = "Vui lòng chọn loại hình doanh nghiệp";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitAddCustomer = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      console.warn('⚠️ Form validation failed:', formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔄 Submitting new customer...', formData);

      // Chuẩn bị data theo CreateCustomerDto (provinceId, wardId, businessTypeId là String)
      const customerData = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        addressLine: formData.addressLine.trim(),
        addressPhoneNumber: formData.addressPhoneNumber.trim(),
        recipientName: formData.recipientName.trim(),
        provinceId: formData.provinceId,
        wardId: formData.wardId,
        businessTypeId: formData.businessTypeId
      };

      console.log('📡 Posting to API:', customerData);

      // Call API
      const response = await customerApi.createCustomer(customerData);
      console.log('✅ Customer created successfully:', response);

      // Lấy tên từ dropdown options để hiển thị (Optimistic Update)
      // Dùng String(p.value) vì value trong state provinces đã là String
      const selectedProvince = provinces.find(p => String(p.value) === customerData.provinceId);
      const selectedWard = wards.find(w => String(w.value) === customerData.wardId);
      const selectedBusinessType = businessTypes.find(bt => String(bt.value) === customerData.businessTypeId);

      // Thêm customer mới vào table ngay lập tức
      const newCustomer = {
        id: response.id || Date.now(), // Dùng response.id hoặc temp ID
        customer: customerData.fullName,
        email: customerData.email,
        phone: customerData.phoneNumber,
        businessType: selectedBusinessType?.label || "N/A",
        // Lấy tên Tỉnh/Phường từ dropdown cho optimistic update
        province: selectedProvince?.label || "N/A", 
        ward: selectedWard?.label || "N/A",
        recipientName: customerData.recipientName,
        addressPhoneNumber: customerData.addressPhoneNumber,
        status: "Active",
        avatar: user41
      };

      // Thêm vào đầu danh sách
      setListData(prev => [newCustomer, ...prev]);
      setTotalRecords(prev => prev + 1);

      console.log('✅ Added new customer to table (Optimistic Update):', newCustomer);

      // Close modal bằng cách trigger click vào nút close
      const closeButton = document.querySelector('#add-customer [data-bs-dismiss="modal"]');
      if (closeButton) {
        closeButton.click();
      }

      // ** FIX 4: Buộc tải lại toàn bộ danh sách sau khi đóng modal để đảm bảo sync (Final Sync) **
      console.log('🔄 Triggering full customer list refresh after successful creation...');
      await fetchCustomers();
      // ------------------------------------

      // Reset form
      resetForm();

      // Show success message
      alert('✅ Thêm khách hàng thành công!');

    } catch (error) {
      console.error('❌ Error creating customer:', error);
      alert(`Lỗi: ${error.message || 'Không thể thêm khách hàng'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      addressLine: "",
      addressPhoneNumber: "",
      recipientName: "",
      provinceId: null,
      wardId: null,
      businessTypeId: null,
      isActive: true
    });
    setFormErrors({});
    setWards([]); // Reset wards khi đóng modal
  };

  // ==================== VIEW CUSTOMER ====================
  const handleViewCustomer = async (customerId) => {
    try {
      setViewLoading(true);
      setShowViewModal(true);
      
      console.log(`👁️ Fetching customer detail for ID: ${customerId}`);
      
      const response = await customerApi.getCustomerById(customerId);
      console.log('✅ Customer Detail Response:', response);
      
      // Xử lý response
      const customerData = response.data || response;
      setSelectedCustomer(customerData);

      // Fetch wards for selected province for display in modal
      const provinceId = customerData.address?.provinceId || customerData.provinceId;
      if (provinceId) {
        await fetchWardsByProvince(String(provinceId));
      }
      
    } catch (error) {
      console.error('❌ Error fetching customer detail:', error);
      alert(`Lỗi: ${error.message || 'Không thể tải thông tin khách hàng'}`);
      setShowViewModal(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedCustomer(null);
    setWards([]); // Reset wards khi đóng modal
  };

  // ==================== EDIT CUSTOMER ====================
  const handleEditCustomer = async (customerId) => {
    try {
      setEditLoading(true);
      setShowEditModal(true);
      
      console.log(`📝 Fetching customer for edit, ID: ${customerId}`);
      
      const response = await customerApi.getCustomerById(customerId);
      console.log('✅ Customer Data for Edit:', response);
      
      const customerData = response.data || response;
      const address = customerData.address || {};
      
      // Populate edit form - Ensure IDs are cast to String to match dropdown options
      setEditFormData({
        fullName: customerData.fullName || "",
        phoneNumber: customerData.phoneNumber || "",
        email: customerData.email || "",
        // Lấy thông tin address từ object address
        addressLine: address.addressLine || "",
        addressPhoneNumber: address.phoneNumber || "",
        recipientName: address.recipientName || "",
        // Dùng ID từ address hoặc từ cấp ngoài, và chuyển sang String
        provinceId: address.provinceId ? String(address.provinceId) : (customerData.provinceId ? String(customerData.provinceId) : null),
        wardId: address.wardId ? String(address.wardId) : (customerData.wardId ? String(customerData.wardId) : null),
        businessTypeId: customerData.businessTypeId ? String(customerData.businessTypeId) : null,
        isActive: customerData.isActive ?? true
      });

      setSelectedCustomer(customerData);

      // Fetch wards for selected province
      const provinceId = address.provinceId || customerData.provinceId;
      if (provinceId) {
        await fetchWardsByProvince(String(provinceId));
      }
      
    } catch (error) {
      console.error('❌ Error fetching customer for edit:', error);
      alert(`Lỗi: ${error.message || 'Không thể tải thông tin khách hàng'}`);
      setShowEditModal(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditInputChange = (field, value) => {
    // Giá trị dropdown luôn là String do đã map ở trên
    const finalValue = ['provinceId', 'wardId', 'businessTypeId'].includes(field) ? String(value) : value;

    setEditFormData(prev => ({
      ...prev,
      [field]: finalValue
    }));

    // Clear error
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Handle province change
    if (field === 'provinceId') {
      setEditFormData(prev => ({
        ...prev,
        wardId: null
      }));
      fetchWardsByProvince(finalValue);
    }
  };

  const handleSubmitEditCustomer = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    // Validate
    if (!validateEditForm()) {
      console.warn('⚠️ Edit form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔄 Updating customer...', editFormData);

      // Data gửi đi (provinceId, wardId, businessTypeId là String)
      const updateData = {
        fullName: editFormData.fullName.trim(),
        phoneNumber: editFormData.phoneNumber.trim(),
        email: editFormData.email.trim(),
        addressLine: editFormData.addressLine.trim(),
        addressPhoneNumber: editFormData.addressPhoneNumber.trim(),
        recipientName: editFormData.recipientName.trim(),
        provinceId: editFormData.provinceId,
        wardId: editFormData.wardId,
        businessTypeId: editFormData.businessTypeId
      };

      const response = await customerApi.updateCustomer(selectedCustomer.id, updateData);
      console.log('✅ Customer updated successfully:', response);

      // Close modal
      handleCloseEditModal();

      // Refresh list
      await fetchCustomers();

      alert('✅ Cập nhật khách hàng thành công!');

    } catch (error) {
      console.error('❌ Error updating customer:', error);
      alert(`Lỗi: ${error.message || 'Không thể cập nhật khách hàng'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.fullName?.trim()) {
      errors.fullName = "Họ và tên khách hàng là bắt buộc";
    }

    if (!editFormData.phoneNumber?.trim()) {
      errors.phoneNumber = "Số điện thoại là bắt buộc";
    }

    if (!editFormData.email?.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!editFormData.addressLine?.trim()) {
      errors.addressLine = "Địa chỉ là bắt buộc";
    }

    if (!editFormData.addressPhoneNumber?.trim()) {
      errors.addressPhoneNumber = "Số điện thoại người nhận là bắt buộc";
    }

    if (!editFormData.recipientName?.trim()) {
      errors.recipientName = "Tên người nhận là bắt buộc";
    }

    if (!editFormData.provinceId) {
      errors.provinceId = "Vui lòng chọn tỉnh thành";
    }

    if (!editFormData.wardId) {
      errors.wardId = "Vui lòng chọn phường";
    }

    if (!editFormData.businessTypeId) {
      errors.businessTypeId = "Vui lòng chọn loại hình doanh nghiệp";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCustomer(null);
    setEditFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      addressLine: "",
      addressPhoneNumber: "",
      recipientName: "",
      provinceId: null,
      wardId: null,
      businessTypeId: null,
      isActive: true
    });
    setFormErrors({});
    setWards([]);
  };

  // ==================== SEARCH HANDLER ====================
  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // ==================== TABLE COLUMNS ====================
  const columns = [
    {
      header: "Họ và tên Khách hàng",
      field: "customer",
      key: "customer",
      body: (data) => (
        <div className="d-flex align-items-center">
          <div>
            <Link to="#" className="fw-medium">{data.customer}</Link>
            {data.recipientName && (
              <div className="text-muted small">Người nhận: {data.recipientName}</div>
            )}
          </div>
        </div>
      )
    },
    { 
      header: "Email", 
      field: "email", 
      key: "email" 
    },
    { 
      header: "Số điện thoại", 
      field: "phone", 
      key: "phone",
      body: (data) => (
        <div>
          <div>{data.phone}</div>
          {data.addressPhoneNumber && data.addressPhoneNumber !== data.phone && (
            <div className="text-muted small">SĐT nhận: {data.addressPhoneNumber}</div>
          )}
        </div>
      )
    },
    { 
      header: "Loại hình doanh nghiệp", 
      field: "businessType", 
      key: "businessType" 
    },
    { 
      header: "Tỉnh thành", 
      field: "province", 
      key: "province" 
    },
    { 
      header: "Phường", 
      field: "ward", 
      key: "ward" 
    },
    {
      header: "Status",
      field: "status",
      key: "status",
      body: (data) => (
        <span className={`d-inline-flex align-items-center p-1 pe-2 rounded-1 text-white bg-${data.status === "Active" ? "success" : "danger"} fs-10`}>
          <i className="ti ti-point-filled me-1 fs-11"></i>
          {data.status}
        </span>
      )
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action d-flex align-items-center">
          <Link 
            className="me-2 p-2 d-flex align-items-center border rounded" 
            to="#"
            onClick={(e) => {
              e.preventDefault();
              handleViewCustomer(row.id);
            }}
            title="View Customer"
          >
            <i className="feather icon-eye"></i>
          </Link>
          <Link 
            className="me-2 p-2 d-flex align-items-center border rounded" 
            to="#"
            onClick={(e) => {
              e.preventDefault();
              handleEditCustomer(row.id);
            }}
            title="Edit Customer"
          >
            <i className="feather icon-edit"></i>
          </Link>
          <Link 
            className="p-2 d-flex align-items-center border rounded" 
            to="#" 
            data-bs-toggle="modal" 
            data-bs-target="#delete-modal"
            title="Delete Customer"
          >
            <i className="feather icon-trash-2"></i>
          </Link>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Customers</h4>
                <h6>Manage your customers</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary text-white"
                data-bs-toggle="modal"
                data-bs-target="#add-customer"
                onClick={resetForm}>
                <i className="ti ti-circle-plus me-1" />
                Add Customer
              </Link>
            </div>
          </div>

          {/* Error Alert */}
          {fetchError && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error:</strong> {fetchError}
              <button type="button" className="btn-close" onClick={() => setFetchError(null)}></button>
            </div>
          )}

          {/* Customer List */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
              
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown">
                  <Link to="#" className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    Status
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li><Link to="#" className="dropdown-item rounded-1">Active</Link></li>
                    <li><Link to="#" className="dropdown-item rounded-1">Inactive</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Đang tải khách hàng...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <PrimeDataTable
                    column={columns}
                    data={listData}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0 text-gray-9">2014 - 2025 © DreamsPOS. All Right Reserved</p>
          <p>Designed &amp; Developed by <Link to="#" className="text-primary">Dreams</Link></p>
        </div>
      </div>

      {/* Add Customer Modal */}
      <div className="modal fade" id="add-customer">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Add Customer</h4>
              </div>
              <button 
                type="button" 
                className="close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
                onClick={resetForm}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <form onSubmit={handleSubmitAddCustomer}>
              <div className="modal-body">
                {loadingDropdowns && (
                  <div className="alert alert-info">
                    <i className="ti ti-loader"></i> Đang tải dữ liệu dropdown...
                  </div>
                )}

                <div className="row">
                  {/* Họ và tên Khách hàng */}
                  <div className="col-lg-12 mb-3">
                    <label className="form-label">
                      Họ và tên Khách hàng <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.fullName ? 'is-invalid' : ''}`}
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Nhập họ và tên"
                    />
                    {formErrors.fullName && <div className="invalid-feedback">{formErrors.fullName}</div>}
                  </div>

                  {/* Số điện thoại */}
                  <div className="col-lg-12 mb-3">
                    <label className="form-label">
                      Số điện thoại <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${formErrors.phoneNumber ? 'is-invalid' : ''}`}
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                    {formErrors.phoneNumber && <div className="invalid-feedback">{formErrors.phoneNumber}</div>}
                  </div>

                  {/* Email */}
                  <div className="col-lg-12 mb-3">
                    <label className="form-label">
                      Email <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Nhập email"
                    />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>

                  {/* Địa chỉ */}
                  <div className="col-lg-12 mb-3">
                    <label className="form-label">
                      Địa chỉ <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.addressLine ? 'is-invalid' : ''}`}
                      value={formData.addressLine}
                      onChange={(e) => handleInputChange('addressLine', e.target.value)}
                      placeholder="Nhập địa chỉ"
                    />
                    {formErrors.addressLine && <div className="invalid-feedback">{formErrors.addressLine}</div>}
                  </div>

                  {/* Địa chỉ nhận hàng */}
                  <div className="col-lg-12 mb-3">
                    <label className="form-label">
                      Số điện thoại người nhận <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.addressPhoneNumber ? 'is-invalid' : ''}`}
                      value={formData.addressPhoneNumber}
                      onChange={(e) => handleInputChange('addressPhoneNumber', e.target.value)}
                      placeholder="Nhập số điện thoại người nhận"
                    />
                    {formErrors.addressPhoneNumber && <div className="invalid-feedback">{formErrors.addressPhoneNumber}</div>}
                  </div>

                  {/* Tên người nhận */}
                  <div className="col-lg-12 mb-3">
                    <label className="form-label">
                      Tên người nhận <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.recipientName ? 'is-invalid' : ''}`}
                      value={formData.recipientName}
                      onChange={(e) => handleInputChange('recipientName', e.target.value)}
                      placeholder="Nhập tên người nhận"
                    />
                    {formErrors.recipientName && <div className="invalid-feedback">{formErrors.recipientName}</div>}
                  </div>

                  {/* Tỉnh thành */}
                  <div className="col-lg-6 mb-3">
                    <label className="form-label">
                      Tỉnh thành <span className="text-danger ms-1">*</span>
                    </label>
                    <CommonSelect
                      className="w-100"
                      options={provinces}
                      value={formData.provinceId}
                      onChange={(e) => handleInputChange('provinceId', e.value)}
                      placeholder="Select province"
                      filter={true}
                    />
                    {formErrors.provinceId && <div className="text-danger small mt-1">{formErrors.provinceId}</div>}
                  </div>

                  {/* Phường */}
                  <div className="col-lg-6 mb-3">
                    <label className="form-label">
                      Phường <span className="text-danger ms-1">*</span>
                    </label>
                    <CommonSelect
                      className="w-100"
                      options={wards}
                      value={formData.wardId}
                      onChange={(e) => handleInputChange('wardId', e.value)}
                      placeholder={
                        !formData.provinceId 
                          ? "Chọn tỉnh thành trước" 
                          : loadingWards 
                            ? "Đang tải..." 
                            : wards.length === 0 
                              ? "Không có phường" 
                              : "Select ward"
                      }
                      filter={true}
                      disabled={!formData.provinceId || loadingWards}
                    />
                    {formErrors.wardId && <div className="text-danger small mt-1">{formErrors.wardId}</div>}
                    {!formData.provinceId && (
                      <div className="text-muted small mt-1">
                        <i className="ti ti-info-circle"></i> Vui lòng chọn tỉnh thành trước
                      </div>
                    )}
                  </div>

                  {/* Loại hình doanh nghiệp */}
                  <div className="col-lg-12 mb-3">
                    <label className="form-label">
                      Loại hình doanh nghiệp <span className="text-danger ms-1">*</span>
                    </label>
                    <CommonSelect
                      className="w-100"
                      options={businessTypes}
                      value={formData.businessTypeId}
                      onChange={(e) => handleInputChange('businessTypeId', e.value)}
                      placeholder="Select Business Type"
                      filter={true}
                    />
                    {formErrors.businessTypeId && <div className="text-danger small mt-1">{formErrors.businessTypeId}</div>}
                  </div>

                  {/* Status Toggle */}
                  <div className="col-lg-12">
                    <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                      <span className="status-label">Status</span>
                      <input
                        type="checkbox"
                        id="user1"
                        className="check"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      />
                      <label htmlFor="user1" className="checktoggle"></label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                  data-bs-dismiss="modal"
                  onClick={resetForm}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary fs-13 fw-medium p-2 px-3"
                  disabled={isSubmitting || loadingDropdowns}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : (
                    'Add Customer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* View Customer Modal */}
      {showViewModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thông tin chi tiết Khách hàng</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseViewModal}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                {viewLoading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : selectedCustomer ? (
                  <div className="customer-detail-view">
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">ID:</div>
                      <div className="col-md-8">{selectedCustomer.id}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">Họ và tên:</div>
                      <div className="col-md-8">{selectedCustomer.fullName}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">Email:</div>
                      <div className="col-md-8">{selectedCustomer.email}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">Số điện thoại:</div>
                      <div className="col-md-8">{selectedCustomer.phoneNumber}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">Địa chỉ:</div>
                      <div className="col-md-8">{selectedCustomer.address?.addressLine || "N/A"}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">Tên người nhận:</div>
                      <div className="col-md-8">{selectedCustomer.address?.recipientName || "N/A"}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">SĐT người nhận:</div>
                      <div className="col-md-8">{selectedCustomer.address?.phoneNumber || "N/A"}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">Tỉnh thành:</div>
                      <div className="col-md-8">
                        {/* Lấy từ address.provinceName, nếu không có thì map từ ID */}
                        {selectedCustomer.address?.provinceName || 
                         selectedCustomer.provinceName || 
                         provinces.find(p => p.value === String(selectedCustomer.address?.provinceId || selectedCustomer.provinceId))?.label || 
                         "N/A"}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">Phường:</div>
                      <div className="col-md-8">
                        {/* Lấy từ address.wardName, nếu không có thì map từ ID */}
                        {selectedCustomer.address?.wardName || 
                         selectedCustomer.wardName || 
                         wards.find(w => w.value === String(selectedCustomer.address?.wardId || selectedCustomer.wardId))?.label || 
                         "N/A"}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">Loại hình doanh nghiệp:</div>
                      <div className="col-md-8">
                        {selectedCustomer.businessTypeName || 
                         selectedCustomer.businessType?.name || 
                         businessTypes.find(bt => bt.value === String(selectedCustomer.businessTypeId))?.label || 
                         "N/A"}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4 fw-bold">Status:</div>
                      <div className="col-md-8">
                        <span className={`badge ${selectedCustomer.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {selectedCustomer.createdDate && (
                      <div className="row mb-3">
                        <div className="col-md-4 fw-bold">Created Date:</div>
                        <div className="col-md-8">
                          {new Date(selectedCustomer.createdDate).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-warning">No data available</div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Customer</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseEditModal}
                  aria-label="Close"
                />
              </div>

              <form onSubmit={handleSubmitEditCustomer}>
                <div className="modal-body">
                  {editLoading ? (
                    <div className="text-center p-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      {/* Họ và tên */}
                      <div className="col-lg-12 mb-3">
                        <label className="form-label">
                          Họ và tên <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.fullName ? 'is-invalid' : ''}`}
                          value={editFormData.fullName}
                          onChange={(e) => handleEditInputChange('fullName', e.target.value)}
                        />
                        {formErrors.fullName && <div className="invalid-feedback">{formErrors.fullName}</div>}
                      </div>

                      {/* Số điện thoại */}
                      <div className="col-lg-6 mb-3">
                        <label className="form-label">
                          Số điện thoại <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className={`form-control ${formErrors.phoneNumber ? 'is-invalid' : ''}`}
                          value={editFormData.phoneNumber}
                          onChange={(e) => handleEditInputChange('phoneNumber', e.target.value)}
                        />
                        {formErrors.phoneNumber && <div className="invalid-feedback">{formErrors.phoneNumber}</div>}
                      </div>

                      {/* Email */}
                      <div className="col-lg-6 mb-3">
                        <label className="form-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                          value={editFormData.email}
                          onChange={(e) => handleEditInputChange('email', e.target.value)}
                        />
                        {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                      </div>

                      {/* Địa chỉ */}
                      <div className="col-lg-12 mb-3">
                        <label className="form-label">
                          Địa chỉ <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.addressLine ? 'is-invalid' : ''}`}
                          value={editFormData.addressLine}
                          onChange={(e) => handleEditInputChange('addressLine', e.target.value)}
                        />
                        {formErrors.addressLine && <div className="invalid-feedback">{formErrors.addressLine}</div>}
                      </div>

                      {/* Tên người nhận */}
                      <div className="col-lg-6 mb-3">
                        <label className="form-label">
                          Tên người nhận <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.recipientName ? 'is-invalid' : ''}`}
                          value={editFormData.recipientName}
                          onChange={(e) => handleEditInputChange('recipientName', e.target.value)}
                        />
                        {formErrors.recipientName && <div className="invalid-feedback">{formErrors.recipientName}</div>}
                      </div>

                      {/* SĐT người nhận */}
                      <div className="col-lg-6 mb-3">
                        <label className="form-label">
                          SĐT người nhận <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.addressPhoneNumber ? 'is-invalid' : ''}`}
                          value={editFormData.addressPhoneNumber}
                          onChange={(e) => handleEditInputChange('addressPhoneNumber', e.target.value)}
                        />
                        {formErrors.addressPhoneNumber && <div className="invalid-feedback">{formErrors.addressPhoneNumber}</div>}
                      </div>

                      {/* Tỉnh thành */}
                      <div className="col-lg-6 mb-3">
                        <label className="form-label">
                          Tỉnh thành <span className="text-danger">*</span>
                        </label>
                        <CommonSelect
                          className="w-100"
                          options={provinces}
                          value={editFormData.provinceId}
                          onChange={(e) => handleEditInputChange('provinceId', e.value)}
                          placeholder="Select province"
                          filter={true}
                        />
                        {formErrors.provinceId && <div className="text-danger small mt-1">{formErrors.provinceId}</div>}
                      </div>

                      {/* Phường */}
                      <div className="col-lg-6 mb-3">
                        <label className="form-label">
                          Phường <span className="text-danger">*</span>
                        </label>
                        <CommonSelect
                          className="w-100"
                          options={wards}
                          value={editFormData.wardId}
                          onChange={(e) => handleEditInputChange('wardId', e.value)}
                          placeholder={
                            !editFormData.provinceId 
                              ? "Chọn tỉnh thành trước" 
                              : loadingWards 
                                ? "Đang tải..." 
                                : "Select ward"
                          }
                          filter={true}
                          disabled={!editFormData.provinceId || loadingWards}
                        />
                        {formErrors.wardId && <div className="text-danger small mt-1">{formErrors.wardId}</div>}
                      </div>

                      {/* Loại hình doanh nghiệp */}
                      <div className="col-lg-12 mb-3">
                        <label className="form-label">
                          Loại hình doanh nghiệp <span className="text-danger">*</span>
                        </label>
                        <CommonSelect
                          className="w-100"
                          options={businessTypes}
                          value={editFormData.businessTypeId}
                          onChange={(e) => handleEditInputChange('businessTypeId', e.value)}
                          placeholder="Select Business Type"
                          filter={true}
                        />
                        {formErrors.businessTypeId && <div className="text-danger small mt-1">{formErrors.businessTypeId}</div>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseEditModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || editLoading}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <DeleteModal />
    </>
  );
};

export default Customers;