import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const ResetPassword = () => {
    const [form, setForm] = useState({
        email: localStorage.getItem("email") || "",
        otpCode: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (form.newPassword !== form.confirmPassword) {
            setMessage("❌ Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        if (form.newPassword.length < 6) {
            setMessage("❌ Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        if (!/^\d{6}$/.test(form.otpCode)) {
            setMessage("❌ Mã OTP phải có 6 chữ số!");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post("http://localhost:8080/api/auth/reset-password", {
                email: form.email,
                otpCode: form.otpCode,
                newPassword: form.newPassword,
            });

            setMessage("✅ Đặt lại mật khẩu thành công! Chuyển về trang đăng nhập...");
            localStorage.removeItem("email");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || "❌ Lỗi kết nối server!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Đặt Lại Mật Khẩu
                        </h2>
                        <p className="text-white/80 mt-2">
                            Nhập email và mật khẩu mới
                        </p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-2xl text-center font-medium ${message.includes("✅")
                            ? "bg-green-500/20 text-green-300 border border-green-400/30"
                            : "bg-red-500/20 text-red-300 border border-red-400/30"
                            }`}>
                            {message}
                        </div>
                    )}

                    {/* Reset Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 bg-white/5 text-white placeholder-white/50"
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
                                value={form.otpCode}
                                onChange={handleChange}
                                maxLength={6}
                                className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 bg-white/5 text-white placeholder-white/50 text-center text-lg font-mono"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                value={form.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 bg-white/5 text-white placeholder-white/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Nhập lại mật khẩu mới"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 bg-white/5 text-white placeholder-white/50"
                                required
                            />
                        </div>

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
                                    Đang xử lý...
                                </div>
                            ) : (
                                "Đặt Lại Mật Khẩu"
                            )}
                        </button>

                        {/* Back to Login Link */}
                        <div className="text-center pt-4">
                            <Link
                                to="/login"
                                className="text-purple-300 hover:text-purple-200 hover:underline transition-colors duration-200 text-sm"
                            >
                                ← Quay lại trang đăng nhập
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;