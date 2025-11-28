import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Vui lòng nhập họ tên";
        }

        if (!form.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!form.password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (form.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post("http://localhost:8080/api/auth/register", form);
            const data = res.data;

            // ✅ API trả về thông báo OTP đã được gửi
            if (data.message && data.message.includes("OTP has been sent")) {
                setMessage(`✅ Mã OTP đã được gửi đến ${form.email}. Vui lòng kiểm tra email!`);

                // Chuyển hướng sang trang Verify OTP
                setTimeout(() => {
                    navigate("/verify-otp", {
                        state: {
                            email: form.email,
                            message: "Vui lòng nhập mã OTP để hoàn tất đăng ký"
                        }
                    });
                }, 2000);
            } else {
                setMessage("❌ Đăng ký thất bại. Vui lòng thử lại!");
            }
        } catch (err) {
            console.error("Register error:", err.response?.data || err.message);
            const errorData = err.response?.data;

            if (errorData?.error === "Email is already taken!") {
                setMessage("❌ Email đã được sử dụng. Vui lòng chọn email khác.");
            } else if (errorData?.error === "Username is already taken!") {
                setMessage("❌ Tên người dùng đã tồn tại. Vui lòng chọn tên khác.");
            } else {
                setMessage(errorData?.message || "❌ Đăng ký thất bại, vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Đăng Ký Tài Khoản
                        </h2>
                        <p className="text-white/80 mt-2">
                            Tạo tài khoản Cinestar để bắt đầu trải nghiệm
                        </p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-2xl text-center font-medium ${message.includes("✅") || message.includes("OTP")
                            ? "bg-green-500/20 text-green-300 border border-green-400/30"
                            : "bg-red-500/20 text-red-300 border border-red-400/30"
                            }`}>
                            {message}
                        </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleRegisterSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nhập họ và tên"
                                value={form.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 bg-white/5 text-white placeholder-white/50 ${errors.name
                                    ? "border-red-400 focus:ring-red-500/30 focus:border-red-400"
                                    : "border-white/20 focus:ring-purple-500/30 focus:border-purple-400"
                                    }`}
                                required
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-300 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Nhập địa chỉ email"
                                value={form.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 bg-white/5 text-white placeholder-white/50 ${errors.email
                                    ? "border-red-400 focus:ring-red-500/30 focus:border-red-400"
                                    : "border-white/20 focus:ring-purple-500/30 focus:border-purple-400"
                                    }`}
                                required
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-300 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Nhập mật khẩu"
                                value={form.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 bg-white/5 text-white placeholder-white/50 ${errors.password
                                    ? "border-red-400 focus:ring-red-500/30 focus:border-red-400"
                                    : "border-white/20 focus:ring-purple-500/30 focus:border-purple-400"
                                    }`}
                                required
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-300 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-lg transition-all duration-300 shadow-lg ${loading
                                ? "bg-gray-600 cursor-not-allowed opacity-70"
                                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95"
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang đăng ký...
                                </div>
                            ) : (
                                "Đăng Ký"
                            )}
                        </button>

                        {/* Login Link */}
                        <div className="text-center pt-4">
                            <Link
                                to="/login"
                                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
                            >
                                Đã có tài khoản? <span className="text-purple-300 hover:text-purple-200 hover:underline">Đăng nhập ngay</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;