import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOTP = ({ updateUser }) => {
    const [otpData, setOtpData] = useState({
        email: "",
        otpCode: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Lấy email từ state navigation
        const stateEmail = location.state?.email;

        if (stateEmail) {
            setOtpData(prev => ({ ...prev, email: stateEmail }));
            localStorage.setItem("registerEmail", stateEmail);
        } else {
            // Nếu không có state, lấy từ localStorage
            const storedEmail = localStorage.getItem("registerEmail");
            if (storedEmail) {
                setOtpData(prev => ({ ...prev, email: storedEmail }));
            } else {
                // Nếu không có email, quay lại đăng ký
                navigate("/register");
            }
        }

        // Hiển thị message từ navigation nếu có
        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location, navigate]);

    const handleOtpChange = (e) => {
        const { name, value } = e.target;
        setOtpData({ ...otpData, [name]: value });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateOtpForm = () => {
        const newErrors = {};

        if (!otpData.otpCode.trim()) {
            newErrors.otpCode = "Vui lòng nhập mã OTP";
        } else if (!/^\d{6}$/.test(otpData.otpCode)) {
            newErrors.otpCode = "Mã OTP phải có 6 chữ số";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();

        if (!validateOtpForm()) {
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post("http://localhost:8080/api/auth/verify-otp", {
                email: otpData.email,
                otpCode: otpData.otpCode
            });
            const data = res.data;

            if (data.token) {
                // Lưu thông tin user và token
                localStorage.setItem("token", data.token);
                localStorage.setItem("userRole", data.role);
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem("userId", data.id);
                localStorage.setItem("userName", data.name);

                // Xóa email tạm
                localStorage.removeItem("registerEmail");
                // ✅ CẬP NHẬT STATE USER TRONG APP
                const userData = {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    token: data.token
                };

                if (updateUser) {
                    updateUser(userData);
                }

                setMessage("✅ Xác thực thành công! Đang chuyển hướng...");

                // Chuyển hướng về trang chủ
                setTimeout(() => navigate("/home"), 1500);
            } else {
                setMessage("❌ Xác thực thất bại. Vui lòng thử lại!");
            }
        } catch (err) {
            console.error("OTP verification error:", err.response?.data || err.message);
            const errorData = err.response?.data;

            if (errorData?.error) {
                setMessage(`❌ ${errorData.error}`);
            } else {
                setMessage("❌ Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;

        try {
            await axios.post("http://localhost:8080/api/auth/resend-otp", {
                email: otpData.email
            });
            setMessage("✅ Mã OTP mới đã được gửi!");
            setResendCooldown(60);

            // Countdown timer
            const timer = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            setMessage("❌ Gửi lại OTP thất bại. Vui lòng thử lại!");
        }
    };

    const handleBackToRegister = () => {
        navigate("/register");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card Container */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg
                                className="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Xác Thực OTP
                        </h2>
                        <p className="text-white/80 mt-2">
                            Nhập mã OTP đã được gửi đến email của bạn
                        </p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-2xl text-center font-medium ${message.includes("✅") || message.includes("thành công")
                            ? "bg-green-500/20 text-green-300 border border-green-400/30"
                            : "bg-red-500/20 text-red-300 border border-red-400/30"
                            }`}>
                            {message}
                        </div>
                    )}

                    {/* OTP Form */}
                    <form onSubmit={handleOtpSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={otpData.email}
                                onChange={handleOtpChange}
                                className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 bg-white/5 text-white"
                                required
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Mã OTP
                            </label>
                            <input
                                type="text"
                                name="otpCode"
                                placeholder="Nhập mã OTP 6 số"
                                value={otpData.otpCode}
                                onChange={handleOtpChange}
                                maxLength={6}
                                className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 text-center text-lg font-mono bg-white/5 text-white placeholder-white/50 ${errors.otpCode
                                    ? "border-red-400 focus:ring-red-500/30 focus:border-red-400"
                                    : "border-white/20 focus:ring-purple-500/30 focus:border-purple-400"
                                    }`}
                                required
                            />
                            {errors.otpCode && (
                                <p className="mt-2 text-sm text-red-300 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    {errors.otpCode}
                                </p>
                            )}
                        </div>

                        {/* Resend OTP Section */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={resendCooldown > 0}
                                className={`text-sm ${resendCooldown > 0
                                    ? "text-white/40 cursor-not-allowed"
                                    : "text-purple-300 hover:text-purple-200 hover:underline"
                                    }`}
                            >
                                {resendCooldown > 0
                                    ? `Gửi lại sau ${resendCooldown}s`
                                    : "Gửi lại mã OTP"
                                }
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleBackToRegister}
                                className="flex-1 py-3 px-4 border border-white/20 rounded-2xl font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                            >
                                Quay lại
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg ${loading
                                    ? "bg-gray-600 cursor-not-allowed opacity-70"
                                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95"
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xác thực...
                                    </div>
                                ) : (
                                    "Xác Thực"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;