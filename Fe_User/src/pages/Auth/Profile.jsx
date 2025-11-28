import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const token = localStorage.getItem("token");
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        avatar_url: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);
    const [ticketHistory, setTicketHistory] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [ticketLoading, setTicketLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const navigate = useNavigate();

    // Lấy thông tin user từ API
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (res.data) {
                    setProfile({
                        name: res.data.name || "",
                        email: res.data.email || "",
                        phone: res.data.phone || "",
                        avatar_url: res.data.avatar_url || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setMessage("❌ Lỗi khi tải thông tin profile");
            }
        };

        fetchProfile();
    }, [token]);

    // Lấy lịch sử vé khi tab tickets được chọn
    useEffect(() => {
        if (activeTab === "tickets") {
            fetchTicketHistory();
        }
    }, [activeTab]);

    // Lấy lịch sử thanh toán khi tab payments được chọn
    useEffect(() => {
        if (activeTab === "payments") {
            fetchPaymentHistory();
        }
    }, [activeTab]);

    const fetchTicketHistory = async () => {
        setTicketLoading(true);
        try {
            // API lấy lịch sử vé của user
            const res = await axios.get("http://localhost:8080/api/users/me/tickets", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.data && Array.isArray(res.data)) {
                setTicketHistory(res.data);
            } else if (res.data?.tickets) {
                setTicketHistory(res.data.tickets);
            }
        } catch (error) {
            console.error("Error fetching ticket history:", error);
            // Fallback: thử với endpoint khác
            try {
                const fallbackRes = await axios.get("http://localhost:8080/api/tickets/my-tickets", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (fallbackRes.data) setTicketHistory(fallbackRes.data);
            } catch (fallbackError) {
                console.error("Fallback ticket history error:", fallbackError);
            }
        } finally {
            setTicketLoading(false);
        }
    };

    const fetchPaymentHistory = async () => {
        setPaymentLoading(true);
        try {
            // API lấy lịch sử thanh toán của user
            const res = await axios.get("http://localhost:8080/api/users/me/payments", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.data && Array.isArray(res.data)) {
                setPaymentHistory(res.data);
            } else if (res.data?.payments) {
                setPaymentHistory(res.data.payments);
            }
        } catch (error) {
            console.error("Error fetching payment history:", error);
            // Fallback: thử với endpoint khác
            try {
                const fallbackRes = await axios.get("http://localhost:8080/api/payments/my-payments", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (fallbackRes.data) setPaymentHistory(fallbackRes.data);
            } catch (fallbackError) {
                console.error("Fallback payment history error:", fallbackError);
            }
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleProfileChange = (e) => setProfile({
        ...profile,
        [e.target.name]: e.target.value
    });

    // Cập nhật profile
    const updateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setErrors([]);

        try {
            const res = await axios.put(
                "http://localhost:8080/api/users/me",
                {
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (res.data) {
                setMessage("✅ Cập nhật profile thành công!");
                setProfile(res.data);

                // Cập nhật localStorage nếu có thay đổi name
                if (res.data.name) {
                    localStorage.setItem("userName", res.data.name);
                }
                if (res.data.email) {
                    localStorage.setItem("userEmail", res.data.email);
                }
            }
        } catch (err) {
            console.error("Update profile error:", err);
            const data = err.response?.data;
            if (data?.errors) setErrors(data.errors);
            setMessage(data?.message || "❌ Lỗi khi cập nhật profile!");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'ACTIVE': { color: 'bg-green-500/20 text-green-300', text: 'Đã xác nhận' },
            'CONFIRMED': { color: 'bg-green-500/20 text-green-300', text: 'Đã xác nhận' },
            'PENDING': { color: 'bg-yellow-500/20 text-yellow-300', text: 'Đang chờ' },
            'CANCELLED': { color: 'bg-red-500/20 text-red-300', text: 'Đã hủy' },
            'EXPIRED': { color: 'bg-gray-500/20 text-gray-300', text: 'Hết hạn' },
            'SUCCESS': { color: 'bg-green-500/20 text-green-300', text: 'Thành công' },
            'FAILED': { color: 'bg-red-500/20 text-red-300', text: 'Thất bại' }
        };

        const statusInfo = statusMap[status] || { color: 'bg-gray-500/20 text-gray-300', text: status };
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                {statusInfo.text}
            </span>
        );
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        navigate("/login");
    };

    const tabs = [
        { id: "profile", label: "Thông tin cá nhân" },
        { id: "tickets", label: "Lịch sử vé" },
        { id: "payments", label: "Lịch sử thanh toán" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Menu Tabs */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 mb-6 border border-white/20">
                    <div className="flex flex-wrap justify-around">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`flex-1 min-w-[120px] py-3 font-medium rounded-xl transition-all ${activeTab === tab.id
                                    ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg"
                                    : "text-white/80 hover:text-white hover:bg-white/10"
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nội dung tab */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">

                    {/* Thông báo */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-center font-medium ${message.includes("✅")
                            ? "bg-green-500/20 text-green-200 border border-green-400"
                            : "bg-red-500/20 text-red-200 border border-red-400"
                            }`}>
                            {message}
                        </div>
                    )}

                    {errors.length > 0 && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-400 text-red-200 rounded-xl">
                            <ul className="list-disc list-inside">
                                {errors.map((e, i) => (
                                    <li key={i}>{e.field}: {e.message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* --- THÔNG TIN CÁ NHÂN --- */}
                    {activeTab === "profile" && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h2>

                            <form onSubmit={updateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-white/40 transition-all"
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-white/40 transition-all"
                                        placeholder="Nhập email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-white/40 transition-all"
                                        placeholder="Nhập số điện thoại"
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
                                            Đang lưu...
                                        </div>
                                    ) : (
                                        "Cập nhật thông tin"
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* --- LỊCH SỬ VÉ --- */}
                    {activeTab === "tickets" && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Lịch sử đặt vé</h2>

                            {ticketLoading ? (
                                <div className="text-center py-8">
                                    <div className="flex items-center justify-center">
                                        <svg className="w-8 h-8 animate-spin text-yellow-400" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    </div>
                                    <p className="text-white/60 mt-4">Đang tải lịch sử vé...</p>
                                </div>
                            ) : ticketHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {ticketHistory.map((ticket, index) => (
                                        <div key={ticket.ticketID || index} className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="text-white font-semibold text-lg">
                                                        {ticket.movie?.title || ticket.movieName || "Phim"}
                                                    </h3>
                                                    <p className="text-white/60 text-sm">Mã vé: #{ticket.ticketID}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-yellow-400 font-bold text-lg">
                                                        {formatCurrency(ticket.price || ticket.totalPrice || 0)}
                                                    </p>
                                                    {getStatusBadge(ticket.status)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-white/60">Rạp: <span className="text-white">{ticket.room?.roomName || "Chưa cập nhật"}</span></p>
                                                    <p className="text-white/60">Ghế: <span className="text-white">{ticket.seat?.seatNumber || ticket.seats || "Chưa cập nhật"}</span></p>
                                                </div>
                                                <div>
                                                    <p className="text-white/60">Ngày: <span className="text-white">{formatDate(ticket.bookingDate)}</span></p>
                                                    <p className="text-white/60">Suất: <span className="text-white">{ticket.showTime || "Chưa cập nhật"}</span></p>
                                                </div>
                                            </div>

                                            {/* Combo nếu có */}
                                            {ticket.combos && ticket.combos.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-white/20">
                                                    <p className="text-white/60 text-sm mb-2">Combo đã đặt:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {ticket.combos.map((combo, comboIndex) => (
                                                            <span key={comboIndex} className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                                                                {combo.nameCombo} (+{formatCurrency(combo.price)})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-white/60">Chưa có lịch sử đặt vé</p>
                                    <button
                                        onClick={() => navigate("/movielist")}
                                        className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-semibold px-6 py-2 rounded-xl hover:from-yellow-300 hover:to-orange-300 transition-all"
                                    >
                                        Đặt vé ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- LỊCH SỬ THANH TOÁN --- */}
                    {activeTab === "payments" && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Lịch sử thanh toán</h2>

                            {paymentLoading ? (
                                <div className="text-center py-8">
                                    <div className="flex items-center justify-center">
                                        <svg className="w-8 h-8 animate-spin text-yellow-400" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    </div>
                                    <p className="text-white/60 mt-4">Đang tải lịch sử thanh toán...</p>
                                </div>
                            ) : paymentHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {paymentHistory.map((payment, index) => (
                                        <div key={payment.paymentId || payment.orderId || index} className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all">
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <h3 className="text-white font-semibold">
                                                        Mã giao dịch: {payment.orderId || payment.transactionId || "N/A"}
                                                    </h3>
                                                    <p className="text-white/60 text-sm">Mã thanh toán: #{payment.paymentId}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-yellow-400 font-bold text-lg">
                                                        {formatCurrency(payment.amount || 0)}
                                                    </p>
                                                    {getStatusBadge(payment.status)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <p className="text-white/60">Phương thức: <span className="text-white">{payment.method || "MoMo"}</span></p>
                                                <p className="text-white/60">Thời gian: <span className="text-white">{formatDate(payment.createdAt || payment.paymentDate)}</span></p>
                                            </div>

                                            {/* Vé liên quan */}
                                            {payment.ticketIds && payment.ticketIds.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-white/20">
                                                    <p className="text-white/60 text-sm">Mã vé:
                                                        <span className="text-white ml-2">
                                                            {payment.ticketIds.map(id => `#${id}`).join(', ')}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-white/60">Chưa có lịch sử thanh toán</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Nút Đăng xuất */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={logout}
                        className="bg-red-500/20 text-red-300 px-6 py-3 rounded-xl hover:bg-red-500/30 border border-red-400/50 transition-all transform hover:scale-105"
                    >
                        🚪 Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;