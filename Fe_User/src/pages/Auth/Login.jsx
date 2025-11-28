import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ updateUser }) => { // ✅ Nhận updateUser từ props
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", form);
            const data = res.data;

            if (data.token) {
                // Lưu thông tin user vào localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("userRole", data.role);
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem("userId", data.id);
                localStorage.setItem("userName", data.name);

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

                setMessage("✅ Đăng nhập thành công! Đang chuyển hướng...");

                // ✅ Giảm thời gian setTimeout xuống 500ms
                setTimeout(() => {
                    switch (data.role) {
                        case "ADMIN":
                            navigate("/admin/dashboard");
                            break;
                        case "STAFF":
                            navigate("/staff/dashboard");
                            break;
                        default:
                            navigate("/home");
                    }
                }, 500);
            } else {
                setMessage("❌ Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
            }
        } catch (err) {
            console.error("Login error:", err.response?.data || err.message);
            const errorData = err.response?.data;

            if (errorData?.error) {
                setMessage(`❌ ${errorData.error}`);
            } else {
                setMessage("❌ Đăng nhập thất bại. Vui lòng thử lại.");
            }
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Đăng Nhập
                        </h2>
                        <p className="text-white/80 mt-2">
                            Chào mừng trở lại với Cinestar
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

                    {/* Login Form */}
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
                            />
                        </div>

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
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5. 291A7.962 7. 962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang đăng nhập...
                                </div>
                            ) : (
                                "Đăng Nhập"
                            )}
                        </button>

                        {/* Links */}
                        <div className="flex justify-between pt-4 text-sm">
                            <Link
                                to="/forgot-password"
                                className="text-purple-300 hover:text-purple-200 hover:underline transition-colors duration-200"
                            >
                                Quên mật khẩu?
                            </Link>
                            <Link
                                to="/register"
                                className="text-purple-300 hover:text-purple-200 hover:underline transition-colors duration-200"
                            >
                                Chưa có tài khoản?  Đăng ký
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;