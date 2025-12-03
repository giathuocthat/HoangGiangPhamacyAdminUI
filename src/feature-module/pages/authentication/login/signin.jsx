import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { all_routes } from "../../../../routes/all_routes";
import { appleLogo, facebookLogo, googleLogo, logoPng, logoWhitePng } from "../../../../utils/imagepath";
import { authApi } from "../../../../services/auth.service";


const Signin = () => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const route = all_routes;

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      // Call login API
      const response = await authApi.login(email, password);

      if (response && response.token) {
        // If response status is 200 (successful), redirect to dashboard
        console.log("Login successful:", response);

        // Redirect to the page user was trying to access, or dashboard if none
        const from = location.state?.from?.pathname || route.dashboard;
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Handle error
      console.error("Login failed:", err);
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Main Wrapper */}
      <div className="main-wrapper">
        <div className="account-content">
          <div className="login-wrapper bg-img">
            <div className="login-content authent-content">
              <form onSubmit={handleSubmit}>
                <div className="login-userset">
                  <div className="login-logo logo-normal">
                    <img src={logoPng} alt="img" />
                  </div>
                  <Link to={route.dashboard} className="login-logo logo-white">
                    <img src={logoWhitePng} alt="Img" />
                  </Link>
                  <div className="login-userheading">
                    <h3>Sign In</h3>
                    <h4 className="fs-16">
                      Access the Dreamspos panel using your email and passcode.
                    </h4>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control border-end-0"
                        placeholder="Enter your email"
                        disabled={isLoading}
                      />
                      <span className="input-group-text border-start-0">
                        <i className="ti ti-mail" />
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="pass-group">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pass-input form-control"
                        placeholder="Enter your password"
                        disabled={isLoading}
                      />
                      <span
                        className={`ti toggle-password text-gray-9 ${isPasswordVisible ? "ti-eye" : "ti-eye-off"}`
                        }
                        onClick={togglePasswordVisibility}>
                      </span>
                    </div>
                  </div>
                  <div className="form-login authentication-check">
                    <div className="row">
                      <div className="col-12 d-flex align-items-center justify-content-between">
                        <div className="custom-control custom-checkbox">
                          <label className="checkboxs ps-4 mb-0 pb-0 line-height-1 fs-16 text-gray-6">
                            <input
                              type="checkbox"
                              className="form-control"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              disabled={isLoading}
                            />
                            <span className="checkmarks" />
                            Remember me
                          </label>
                        </div>
                        <div className="text-end">
                          <Link
                            className="text-orange fs-16 fw-medium"
                            to={route.forgotPassword}>

                            Forgot Password?
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-login">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={isLoading}>
                      {isLoading ? "Đang đăng nhập..." : "Sign In"}
                    </button>
                  </div>
                  <div className="signinform">
                    <h4>
                      New on our platform?
                      <Link to={route.register} className="hover-a">
                        {" "}
                        Create an account
                      </Link>
                    </h4>
                  </div>
                  <div className="form-setlogin or-text">
                    <h4>OR</h4>
                  </div>
                  <div className="mt-2">
                    <div className="d-flex align-items-center justify-content-center flex-wrap">
                      <div className="text-center me-2 flex-fill">
                        <Link
                          to="#"
                          className="br-10 p-2 btn btn-info d-flex align-items-center justify-content-center">

                          <img
                            className="img-fluid m-1"
                            src={facebookLogo}
                            alt="Facebook" />

                        </Link>
                      </div>
                      <div className="text-center me-2 flex-fill">
                        <Link
                          to="#"
                          className="btn btn-white br-10 p-2  border d-flex align-items-center justify-content-center">

                          <img
                            className="img-fluid m-1"
                            src={googleLogo}
                            alt="google" />

                        </Link>
                      </div>
                      <div className="text-center flex-fill">
                        <Link
                          to="#"
                          className="bg-dark br-10 p-2 btn btn-dark d-flex align-items-center justify-content-center">

                          <img
                            className="img-fluid m-1"
                            src={appleLogo}
                            alt="Apple" />

                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                    <p>Copyright © 2025 DreamsPOS</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Main Wrapper */}
    </>);

};

export default Signin;