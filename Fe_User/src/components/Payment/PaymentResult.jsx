import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
    CheckCircle,
    XCircle,
    Clock,
    Home,
    FileText,
    AlertCircle,
    RefreshCw,
    Ticket,
    Calendar,
    MapPin,
    Loader
} from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const PaymentResult = ({ user, setUser }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [paymentStatus, setPaymentStatus] = useState("PROCESSING");
    const [paymentData, setPaymentData] = useState(null);
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const [checkCountdown, setCheckCountdown] = useState(10); // Đếm ngược 10s

    // Lấy orderId và autoCheck từ location state
    const orderId = location.state?.orderId;
    const paymentId = location.state?.paymentId;
    const amount = localStorage.getItem("amount");
    // const amount = location.state?.amount;
    const autoCheck = location.state?.autoCheck;
    console.log(amount);
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // ✅ AUTO CHECK: Đếm ngược 10s rồi GỌI /momo-callback
    useEffect(() => {
        if (autoCheck && checkCountdown > 0) {
            const timer = setTimeout(() => {
                setCheckCountdown(checkCountdown - 1);
            }, 1000);

            return () => clearTimeout(timer);
        } else if (autoCheck && checkCountdown === 0) {
            // ✅ Hết 10s → TỰ ĐỘNG GỌI /momo-callback (giả lập MoMo callback)
            simulateMoMoCallback();
        }
    }, [autoCheck, checkCountdown]);

    // ✅ HÀM GIẢ LẬP MOMO CALLBACK (TEST MODE)
    const simulateMoMoCallback = async () => {
        try {
            console.log('🧪 [TEST MODE] Tự động gọi MoMo callback sau 10s...');

            const token = localStorage.getItem('token');

            if (!token) {
                setError("Phiên đăng nhập đã hết hạn");
                setPaymentStatus("FAILED");
                setLoading(false);
                return;
            }

            // ✅ TẠO PAYLOAD GIẢ LẬP MOMO CALLBACK (THÀNH CÔNG)
            const momoCallbackPayload = {
                partnerCode: "MOMO",
                orderId: orderId,
                requestId: `REQ_${Date.now()}`,
                amount: amount,
                orderInfo: `Thanh toan ve xem phim - Order ${orderId}`,
                orderType: "momo_wallet",
                transId: Math.floor(Math.random() * 1000000000), // Fake transaction ID
                resultCode: 0, // ✅ 0 = THÀNH CÔNG (thay đổi thành 1 để test FAILED)
                message: "Successful.",
                payType: "qr",
                responseTime: Date.now(),
                extraData: "",
                signature: "fake_signature_for_testing" // Backend sẽ skip verify trong test mode
            };

            console.log('📤 Gửi fake MoMo callback:', momoCallbackPayload);

            // ✅ GỌI ENDPOINT /test-callback (như MoMo gọi)
            const response = await axios.post(
                'http://localhost:8080/api/payments/test-callback',
                momoCallbackPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ MoMo callback response:', response.data);

            // ✅ SAU KHI GỌI CALLBACK, CHECK STATUS
            setTimeout(() => {
                checkPaymentStatus();
            }, 1000); // Đợi 1s để backend xử lý xong

        } catch (error) {
            console.error("❌ Lỗi khi gọi MoMo callback:", error);
            setError("Không thể giả lập thanh toán. Vui lòng thử lại.");
            setPaymentStatus("FAILED");
            setLoading(false);
        }
    };

    // Check payment status từ backend
    const checkPaymentStatus = async () => {
        try {
            if (!orderId) {
                setError("Không tìm thấy thông tin đơn hàng");
                setPaymentStatus("FAILED");
                setLoading(false);
                return;
            }

            // Lấy thông tin payment đã lưu
            const savedPayment = localStorage.getItem('currentPayment');
            if (savedPayment) {
                setBookingData(JSON.parse(savedPayment));
            }

            const token = localStorage.getItem('token');

            if (!token) {
                setError("Phiên đăng nhập đã hết hạn");
                setPaymentStatus("FAILED");
                setLoading(false);
                return;
            }

            console.log('🔍 Kiểm tra trạng thái payment:', orderId);

            const response = await axios.get(
                `http://localhost:8080/api/payments/status/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Payment status response:', response.data);

            const payment = response.data;
            setPaymentData(payment);

            // Xác định trạng thái
            if (payment.resultCode === 0 && payment.status === 'COMPLETED') {
                setPaymentStatus("SUCCESS");
                localStorage.removeItem('currentPayment');
            } else if (payment.status === 'FAILED' || (payment.resultCode && payment.resultCode !== 0)) {
                setPaymentStatus("FAILED");
                setError(payment.message || "Thanh toán thất bại");
            } else {
                setPaymentStatus("PROCESSING");
            }

        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra thanh toán:", error);
            setError(error.response?.data?.message || "Không thể kiểm tra trạng thái thanh toán");
            setPaymentStatus("FAILED");
        } finally {
            setLoading(false);
        }
    };

    // Manual check khi user click nút
    const handleManualCheck = () => {
        setLoading(true);
        setCheckCountdown(0); // Reset countdown
        simulateMoMoCallback(); // Gọi luôn callback
    };

    // Countdown for auto redirect
    useEffect(() => {
        if (paymentStatus === "SUCCESS" && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);

            return () => clearTimeout(timer);
        } else if (paymentStatus === "SUCCESS" && countdown === 0) {
            navigate('/my-tickets');
        }
    }, [paymentStatus, countdown, navigate]);

    // Hàm xử lý logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        setUser(null);
        window.location.href = "/login";
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (timeString) => {
        return timeString?.substring(0, 5);
    };

    // Render waiting state (đang đếm ngược 10s)
    if (loading && autoCheck && checkCountdown > 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
                <Header user={user} handleLogout={handleLogout} />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-12 border border-white/20 text-center max-w-lg">
                        <div className="relative inline-block mb-6">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-yellow-400 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader className="w-10 h-10 text-yellow-400 animate-pulse" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">🧪 Chế Độ Test</h2>

                        <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4 mb-6">
                            <p className="text-yellow-300 text-lg font-semibold mb-2">
                                Đang giả lập thanh toán MoMo...
                            </p>
                            <p className="text-white/70 text-sm mb-2">
                                Hệ thống sẽ tự động xác nhận thanh toán sau
                            </p>
                            <div className="text-yellow-300 font-bold text-5xl mb-2">
                                {checkCountdown}s
                            </div>
                            <p className="text-white/50 text-xs">
                                (Không cần thanh toán thật - Chỉ để test)
                            </p>
                        </div>

                        <div className="space-y-3 text-white/60 text-sm">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>Cửa sổ MoMo đã được mở (có thể đóng)</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span>Đang chờ tự động xác nhận... </span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <span>App sẽ gọi API thay MoMo</span>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={handleManualCheck}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Xác Nhận Ngay
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 font-semibold"
                            >
                                Hủy
                            </button>
                        </div>

                        <div className="mt-6 p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                            <p className="text-green-300 text-xs">
                                💡 Tip: Click "Xác Nhận Ngay" để bỏ qua đếm ngược
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Render loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
                <Header user={user} handleLogout={handleLogout} />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-12 border border-white/20 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold text-white mb-2">Đang xử lý thanh toán...</h2>
                        <p className="text-white/60">Vui lòng đợi trong giây lát</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Render payment result
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
            <Header user={user} handleLogout={handleLogout} />

            <main className="flex-1 p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Success State */}
                    {paymentStatus === "SUCCESS" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-green-500/30 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 animate-bounce">
                                    <CheckCircle className="w-12 h-12 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    🎉 Thanh Toán Thành Công!
                                </h1>
                                <p className="text-white/80 text-lg mb-4">
                                    Vé của bạn đã được đặt thành công (Test mode)
                                </p>
                                <div className="inline-block bg-white/10 px-6 py-2 rounded-full">
                                    <span className="text-white/60 text-sm">Mã đơn hàng: </span>
                                    <span className="text-yellow-300 font-bold">{paymentData?.orderId}</span>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-6 h-6" />
                                    Chi Tiết Thanh Toán
                                </h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-white/70">Số tiền thanh toán</span>
                                        <span className="text-yellow-300 font-bold text-lg">
                                            {formatCurrency(paymentData?.amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-white/70">Phương thức</span>
                                        <span className="text-white font-semibold">Ví MoMo (Test)</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-white/70">Thời gian</span>
                                        <span className="text-white font-semibold">
                                            {formatDate(paymentData?.createdAt)}
                                        </span>
                                    </div>
                                    {paymentData?.momoTransId && (
                                        <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                                            <span className="text-white/70">Mã giao dịch MoMo</span>
                                            <span className="text-white font-semibold">{paymentData.momoTransId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {bookingData && (
                                <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Ticket className="w-6 h-6" />
                                        Thông Tin Vé
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            {bookingData.showtime?.movie?.imageUrl && (
                                                <img
                                                    src={bookingData.showtime.movie.imageUrl}
                                                    alt={bookingData.showtime.movie.title}
                                                    className="w-24 h-32 object-cover rounded-lg"
                                                />
                                            )}
                                            <div className="flex-1 space-y-2">
                                                <h3 className="text-white font-bold text-lg">
                                                    {bookingData.showtime?.movie?.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-white/80 text-sm">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(bookingData.showtime?.showtimeDate)}
                                                </div>
                                                <div className="flex items-center gap-2 text-white/80 text-sm">
                                                    <Clock className="w-4 h-4" />
                                                    {formatTime(bookingData.showtime?.startTime)} - {formatTime(bookingData.showtime?.endTime)}
                                                </div>
                                                <div className="flex items-center gap-2 text-white/80 text-sm">
                                                    <MapPin className="w-4 h-4" />
                                                    {bookingData.showtime?.room?.roomName}
                                                </div>
                                            </div>
                                        </div>

                                        {bookingData.selectedSeats && (
                                            <div>
                                                <div className="text-white/70 text-sm mb-2">Ghế đã đặt:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {bookingData.selectedSeats.map(seat => (
                                                        <div key={seat.seatID} className="bg-blue-500/20 border border-blue-400 rounded-lg px-3 py-1">
                                                            <span className="text-white font-semibold">{seat.seatNumber}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {bookingData.selectedCombos && bookingData.selectedCombos.length > 0 && (
                                            <div>
                                                <div className="text-white/70 text-sm mb-2">Combo:</div>
                                                <div className="space-y-1">
                                                    {bookingData.selectedCombos.map(combo => (
                                                        <div key={combo.id} className="text-white/80 text-sm">
                                                            • {combo.name} x{combo.quantity}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                <div className="text-center mb-4">
                                    <p className="text-white/60">
                                        Tự động chuyển đến trang vé trong <span className="text-yellow-300 font-bold">{countdown}</span> giây
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => navigate('/my-tickets')}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold"
                                    >
                                        <Ticket className="w-5 h-5" />
                                        Xem Vé Của Tôi
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 font-semibold"
                                    >
                                        <Home className="w-5 h-5" />
                                        Về Trang Chủ
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Failed State */}
                    {paymentStatus === "FAILED" && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-red-500/30 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-4">
                                    <XCircle className="w-12 h-12 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Thanh Toán Thất Bại
                                </h1>
                                <p className="text-white/80 text-lg mb-4">
                                    {error || paymentData?.message || "Giao dịch không thành công"}
                                </p>
                                {paymentData?.orderId && (
                                    <div className="inline-block bg-white/10 px-6 py-2 rounded-full">
                                        <span className="text-white/60 text-sm">Mã đơn hàng: </span>
                                        <span className="text-yellow-300 font-bold">{paymentData.orderId}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-6 h-6" />
                                    Thông Tin Lỗi
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <span className="text-white/70">Mã lỗi</span>
                                        <span className="text-red-300 font-semibold">{paymentData?.resultCode || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <span className="text-white/70">Thời gian</span>
                                        <span className="text-white font-semibold">
                                            {formatDate(paymentData?.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 font-semibold"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Thử Lại
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 font-semibold"
                                    >
                                        <Home className="w-5 h-5" />
                                        Về Trang Chủ
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Processing State */}
                    {paymentStatus === "PROCESSING" && (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-12 border border-white/20 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-4 animate-pulse">
                                <Clock className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Đang Xử Lý Thanh Toán
                            </h1>
                            <p className="text-white/80 text-lg mb-6">
                                Giao dịch của bạn đang được xử lý, vui lòng đợi...
                            </p>
                            <button
                                onClick={handleManualCheck}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold"
                            >
                                Kiểm Tra Lại
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentResult;