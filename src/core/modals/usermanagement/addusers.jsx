import CommonSelect from "../../../components/select/common-select";
import { useState } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../../../services/user.service";
import { Modal } from 'bootstrap';
import { ListBox } from "primereact/listbox";
import { Dropdown } from "primereact/dropdown";

const AddUsers = () => {
  const status = [
    { value: "Choose", label: "Choose" },
    { value: "Admin", label: "Admin" },
    { value: "Sale", label: "Sale" }];

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmPassword] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    passWord: "",
    confirmPassword: "",
    fullName: "",
    phone: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleToggleConfirmPassword = () => {
    setConfirmPassword((prevShowPassword) => !prevShowPassword);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.userName || !formData.email || !formData.passWord || !formData.confirmPassword || !formData.phone) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");
      return;
    }

    // Password confirmation
    if (formData.passWord !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    // Password strength validation
    if (formData.passWord.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for API
      const userData = {
        userName: formData.userName,
        email: formData.email,
        passWord: formData.passWord,
        fullName: formData.fullName,
        phone: formData.phone
      };

      // Call API to create user
      const response = await userApi.createUser(userData);

      console.log("User created successfully:", response);
      setSuccess("Tạo người dùng thành công!");

      // Reset form
      setFormData({
        userName: "",
        email: "",
        passWord: "",
        confirmPassword: "",
        fullName: "",
        phone: ""
      });
      setSelectedStatus(null);

      setTimeout(() => {
        const buttonElement = document.getElementById('closeModal');
        if (buttonElement) {
          buttonElement.click();
        } else {
          console.error("Button with ID 'closeModal' not found.");
        }
      }, 1500);
      setSuccess("");

    } catch (err) {
      console.error("Create user error:", err);
      setError(err.data.errors[0] || "Tạo người dùng thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Add User */}
      <div className="modal fade" id="add-units">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Add User</h4>
                  </div>
                  <button
                    id="closeModal"
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close">

                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleSubmit}>
                    {/* Success/Error Messages */}
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="alert alert-success" role="alert">
                        {success}
                      </div>
                    )}

                    <div className="row">
                      <div className="col-lg-12">
                        <div className="new-employee-field">
                          <span>Avatar</span>
                          <div className="profile-pic-upload mb-2">
                            <div className="profile-pic">
                              <span>
                                <i className="feather icon-plus-circle plus-down-add" />
                                Profile Photo
                              </span>
                            </div>
                            <div className="input-blocks mb-0">
                              <div className="image-upload mb-0">
                                <input type="file" />
                                <div className="image-uploads">
                                  <h4>Change Image</h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>User Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="userName"
                            className="form-control"
                            value={formData.userName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            placeholder="Enter username"
                          />
                        </div>
                      </div>
                      {/* <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Full Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="fullName"
                            className="form-control"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            placeholder="Enter full name"
                          />
                        </div>
                      </div> */}
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Phone <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="phone"
                            className="form-control"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Email <span className="text-danger">*</span></label>
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            placeholder="Enter email"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Role</label>

                          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.value)} className="form-control">
                            {status.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          {/* 
                          <CommonSelect
                            className="w-100"
                            options={status}
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.value)}
                            placeholder="Choose"
                            filter={false} /> */}

                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Password <span className="text-danger">*</span></label>
                          <div className="pass-group">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="passWord"
                              className="pass-input"
                              value={formData.passWord}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              placeholder="Enter your password" />

                            <span
                              className={`ti toggle-password text-gray-9 ${showPassword ? "ti-eye" : "ti-eye-off"}`}
                              onClick={handleTogglePassword} />

                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Confirm Password <span className="text-danger">*</span></label>
                          <div className="pass-group">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              className="pass-input"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              placeholder="Confirm your password" />

                            <span
                              className={`ti   toggle-password  ${showConfirmPassword ? "ti-eye" : "ti-eye-off"}`}
                              onClick={handleToggleConfirmPassword} />

                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="mb-0 input-blocks">
                          <label className="form-label">Descriptions</label>
                          <textarea
                            className="form-control mb-1"
                            defaultValue={"Type Message"} />

                          <p>Maximum 600 Characters</p>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        disabled={isLoading}>

                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-submit"
                        disabled={isLoading}>
                        {isLoading ? "Đang tạo..." : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Add User */}
    </div>);

};

export default AddUsers;