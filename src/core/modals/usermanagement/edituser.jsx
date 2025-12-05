import CommonSelect from "../../../components/select/common-select";
import { editUser } from "../../../utils/imagepath";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../../../services/user.service";
import { roleApi } from "../../../services/role.service";

const EditUser = ({ userId, userData, onUpdateSuccess }) => {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmPassword] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedRole, SetSelectedRole] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    passWord: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    description: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const fechRoleData = async () => {
    try {
      const roleData = await roleApi.getListRole();
      if (roleData) {
        const roleOptions = roleData.map((role) => ({
          value: role.id,
          label: role.name,
        }));

        setRoleOptions(roleOptions);
      }
    } catch (err) {
      console.error("Fetch role data error:", err);
    }
  }

  const fetchUserData = async () => {
    try {
      const userData = await userApi.getUserById(userId);
      if (userData) {
        setFormData({
          userName: userData.userName || userData.username || "",
          email: userData.email || "",
          passWord: "",
          confirmPassword: "",
          fullName: userData.fullName || "",
          phone: userData.phoneNumber || userData.phone || "",
          description: userData.description || ""
        });
        SetSelectedRole(userData.role || null);
      }
    } catch (err) {
      console.error("Fetch user data error:", err);
    }
  }

  useEffect(() => {
    fetchUserData();
    fechRoleData();
  }, []);

  // Load user data when component mounts or userData changes
  useEffect(() => {
    fetchUserData();
    fechRoleData();
  }, [userData]);

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
    if (!formData.userName || !formData.email || !formData.phone) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");
      return;
    }

    // Password validation (only if password is being changed)
    if (formData.passWord || formData.confirmPassword) {
      if (formData.passWord !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        return;
      }

      if (formData.passWord.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Prepare data for API
      const updateData = {
        userName: formData.userName,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        role: selectedRole,
        description: formData.description
      };

      // Only include password if it's being changed
      if (formData.passWord) {
        updateData.passWord = formData.passWord;
      }

      // Call API to update user
      const response = await userApi.updateUser(userId || userData?.id, updateData);

      console.log("User updated successfully:", response);
      setSuccess("Cập nhật người dùng thành công!");

      // Call callback if provided
      if (onUpdateSuccess) {
        onUpdateSuccess(response);
      }

      // Close modal after success
      setTimeout(() => {
        const buttonElement = document.getElementById('closeEditModal');
        if (buttonElement) {
          buttonElement.click();
        }
        setSuccess("");
      }, 1500);

    } catch (err) {
      console.error("Update user error:", err);
      setError(err.data?.errors?.[0] || "Cập nhật người dùng thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Edit User */}
      <div className="modal fade" id="edit-units">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Edit User</h4>
                  </div>
                  <button
                    id="closeEditModal"
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
                          <div className="profile-pic-upload edit-pic">
                            <div className="profile-pic">
                              <span>
                                <img
                                  src={editUser}
                                  className="user-editer"
                                  alt="User" />

                              </span>
                              <div className="close-img">
                                <i className="feather icon-x info-img" />
                              </div>
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
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="form-control"
                            disabled={isLoading}
                          >
                            {roleOptions.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Password <small className="text-muted">(Để trống nếu không đổi)</small></label>
                          <div className="pass-group">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="passWord"
                              className="pass-input"
                              value={formData.passWord}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              placeholder="Enter new password" />

                            <span
                              className={`ti toggle-password text-gray-9 ${showPassword ? "ti-eye" : "ti-eye-off"}`}
                              onClick={handleTogglePassword} />

                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Confirm Password</label>
                          <div className="pass-group">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              className="pass-input"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              placeholder="Confirm new password" />

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
                            name="description"
                            className="form-control mb-1"
                            value={formData.description}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          />

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
                        {isLoading ? "Đang cập nhật..." : "Update"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit User */}
    </div>
  );
};

export default EditUser;