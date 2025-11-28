// pages/Auth/ForgotPassword.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // Sửa lại endpoint API cho đúng với backend của bạn
            const res = await fetch("http://localhost:8080/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("✅ OTP đã được gửi về email của bạn!");
                localStorage.setItem("email", email);
                setTimeout(() => {
                    navigate("/verify-otp");
                }, 1500);
            } else {
                setMessage(data.message || "❌ Gửi OTP thất bại!");
            }
        } catch (err) {
            setMessage("❌ Lỗi kết nối server!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <form
                onSubmit={handleSubmit}
                className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
            >
                <h2 className="text-3xl font-bold text-center mb-6 text-white">
                    Quên mật khẩu
                </h2>

                {message && (
                    <p
                        className={`mb-6 p-3 rounded-xl text-center font-medium ${message.includes("✅") ? "bg-green-500/20 text-green-200 border border-green-400" : "bg-red-500/20 text-red-200 border border-red-400"
                            }`}
                    >
                        {message}
                    </p>
                )}

                <div className="mb-6">
                    <input
                        type="email"
                        placeholder="Nhập email đăng ký"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-white/40 transition-all"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-semibold py-3 rounded-xl hover:from-yellow-300 hover:to-orange-300 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Đang gửi OTP...
                        </div>
                    ) : (
                        'Gửi OTP'
                    )}
                </button>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        ← Quay lại đăng nhập
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ForgotPassword;