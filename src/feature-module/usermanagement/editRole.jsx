import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TableTopHead from "../../components/table-top-head";

const EditRole = () => {
    const [permissions, setPermissions] = useState([]);
    const [groupedPermissions, setGroupedPermissions] = useState({});
    const [loading, setLoading] = useState(true);

    // Mock API call to fetch permissions
    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        setLoading(true);

        // Simulate API call with mock data
        setTimeout(() => {
            const mockData = [
                {
                    id: 1,
                    claimType: "Permission",
                    claimValue: "Admin.Customer.Create",
                    isActive: 1
                },
                {
                    id: 2,
                    claimType: "Permission",
                    claimValue: "Admin.Customer.Update",
                    isActive: 0
                },
                {
                    id: 3,
                    claimType: "Permission",
                    claimValue: "Admin.Customer.Delete",
                    isActive: 1
                },
                {
                    id: 4,
                    claimType: "Permission",
                    claimValue: "Admin.Product.Create",
                    isActive: 1
                },
                {
                    id: 5,
                    claimType: "Permission",
                    claimValue: "Admin.Product.Update",
                    isActive: 0
                },
                {
                    id: 6,
                    claimType: "Permission",
                    claimValue: "Admin.Product.Delete",
                    isActive: 1
                },
                {
                    id: 7,
                    claimType: "Permission",
                    claimValue: "Admin.Order.Create",
                    isActive: 1
                },
                {
                    id: 8,
                    claimType: "Permission",
                    claimValue: "Admin.Order.View",
                    isActive: 1
                },
                {
                    id: 9,
                    claimType: "Permission",
                    claimValue: "Admin.Order.Update",
                    isActive: 0
                }
            ];

            setPermissions(mockData);
            groupPermissionsByModule(mockData);
            setLoading(false);
        }, 500);
    };

    // Group permissions by module (middle part of claimValue)
    const groupPermissionsByModule = (permissionsData) => {
        const grouped = {};

        permissionsData.forEach((permission) => {
            // Split claimValue: "Admin.Customer.Create" => ["Admin", "Customer", "Create"]
            const parts = permission.claimValue.split(".");

            if (parts.length === 3) {
                const role = parts[0]; // Admin
                const module = parts[1]; // Customer
                const action = parts[2]; // Create

                if (!grouped[module]) {
                    grouped[module] = [];
                }

                grouped[module].push({
                    ...permission,
                    role,
                    module,
                    action
                });
            }
        });

        setGroupedPermissions(grouped);
    };

    // Handle checkbox change
    const handleCheckboxChange = (permissionId, currentValue) => {
        const updatedPermissions = permissions.map((permission) => {
            if (permission.id === permissionId) {
                return {
                    ...permission,
                    isActive: currentValue ? 0 : 1
                };
            }
            return permission;
        });

        setPermissions(updatedPermissions);
        groupPermissionsByModule(updatedPermissions);
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare data for POST request
        const postData = permissions.map((permission) => ({
            id: permission.id,
            claimType: permission.claimType,
            claimValue: permission.claimValue,
            isActive: permission.isActive
        }));

        // Log the data that would be sent to the API
        console.log("POST Data:", JSON.stringify(postData, null, 2));

        // Show alert for demo purposes
        alert("Dữ liệu đã được ghi vào console. Kiểm tra console để xem chi tiết.");
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="content">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="content">
                <div className="page-header">
                    <div className="add-item d-flex">
                        <div className="page-title">
                            <h4>Chỉnh sửa quyền Role</h4>
                            <h6>Quản lý quyền hạn cho từng module</h6>
                        </div>
                    </div>
                    <TableTopHead />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Danh sách quyền theo Module</h5>
                        </div>
                        <div className="card-body">
                            {Object.keys(groupedPermissions).length === 0 ? (
                                <div className="alert alert-info">
                                    Không có quyền nào được tìm thấy.
                                </div>
                            ) : (
                                <div className="row">
                                    {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                                        <div key={moduleName} className="col-md-6 col-lg-4 mb-4">
                                            <div className="card border">
                                                <div className="card-header bg-light">
                                                    <h6 className="mb-0 fw-bold text-primary">
                                                        {moduleName}
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    {modulePermissions.map((permission) => (
                                                        <div key={permission.id} className="form-check mb-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`permission-${permission.id}`}
                                                                checked={permission.isActive === 1}
                                                                onChange={() => handleCheckboxChange(permission.id, permission.isActive === 1)}
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor={`permission-${permission.id}`}
                                                            >
                                                                {permission.action}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-end gap-2">
                                <Link to="/usermanagement/permissions" className="btn btn-secondary">
                                    Hủy
                                </Link>
                                <button type="submit" className="btn btn-primary">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
                <p className="mb-0">2014 - 2025 © DreamsPOS. All Right Reserved</p>
                <p>
                    Designed &amp; Developed by{" "}
                    <Link to="#" className="text-primary">
                        Dreams
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default EditRole;
