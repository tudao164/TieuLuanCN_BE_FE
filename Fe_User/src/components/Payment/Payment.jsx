import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    CreditCard,
    Ticket,
    MapPin,
    Clock,
    Calendar,
    User,
    Tag,
    ShoppingCart,
    Popcorn,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    Smartphone
} from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const Payment = ({ user, setUser }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        tickets = [],
        totalAmount = 0,
        showtime,
        selectedSeats = [],
        selectedCombos = [],
        bookingResult
    } = location.state || {};


    const [promotionCode, setPromotionCode] = useState("");
    const [promotionApplied, setPromotionApplied] = useState(null);
    const [promotionError, setPromotionError] = useState("");
    const [validatingPromo, setValidatingPromo] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("MOMO");

    useEffect(() => {
        // Kiểm tra đã có dữ liệu booking chưa
        if (!tickets || tickets.length === 0) {
            alert("Không có thông tin đặt vé.  Vui lòng đặt vé trước.");
            navigate("/");
            return;
        }

        // Lấy thông tin user
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [tickets, navigate]);

    // Validate mã khuyến mãi
    const validatePromotionCode = async () => {
        if (!promotionCode.trim()) {
            setPromotionError("Vui lòng nhập mã khuyến mãi");
            return;
        }

        setValidatingPromo(true);
        setPromotionError("");

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8080/api/promotions/validate? code=${promotionCode}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.valid) {
                setPromotionApplied({
                    code: response.data.code,
                    discount: response.data.discount
                });
                setPromotionError("");
                alert(`✅ Áp dụng mã khuyến mãi thành công! Giảm ${response.data.discount}%`);
            } else {
                setPromotionError("Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
                setPromotionApplied(null);
            }
        } catch (error) {
            console.error("Lỗi validate promotion:", error);
            setPromotionError(error.response?.data?.message || "Mã khuyến mãi không hợp lệ");
            setPromotionApplied(null);
        } finally {
            setValidatingPromo(false);
        }
    };

    // Xóa mã khuyến mãi
    const removePromotion = () => {
        setPromotionCode("");
        setPromotionApplied(null);
        setPromotionError("");
    };

    // Tính tổng tiền vé (đã bao gồm combo từ backend)
    const calculateSeatsTotal = () => {
        return tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);
    };

    // ✅ KHÔNG CẦN tính combo riêng nữa vì ticket.price đã bao gồm combo
    const calculateCombosTotal = () => {
        return 0; // Combo đã được tính vào ticket.price từ backend
    };

    // Tính tổng trước giảm giá (chỉ cần lấy ticket.price)
    const calculateSubtotal = () => {
        return calculateSeatsTotal(); // Đã bao gồm cả vé + combo
    };

    // Tính số tiền giảm
    const calculateDiscount = () => {
        if (!promotionApplied) return 0;
        return (calculateSubtotal() * promotionApplied.discount) / 100;
    };

    // Tính tổng tiền cuối cùng
    const calculateFinalTotal = () => {
        return calculateSubtotal() - calculateDiscount();
    };

    // Xử lý thanh toán MoMo
    // Xử lý thanh toán MoMo
    const handleMoMoPayment = async () => {
        setProcessingPayment(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                alert("Vui lòng đăng nhập để thanh toán");
                navigate('/login');
                return;
            }

            const ticketIds = tickets.map(ticket => ticket.ticketID);
            const returnUrl = `${window.location.origin}/payment-result`;

            const paymentRequest = {
                ticketIds: ticketIds,
                returnUrl: returnUrl
            };

            console.log('📤 Gửi payment request:', paymentRequest);

            const response = await axios.post(
                'http://localhost:8080/api/payments/create',
                paymentRequest,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Payment response:', response.data);

            if (response.data.success && response.data.paymentUrl) {
                // Lưu thông tin payment vào localStorage
                localStorage.setItem('currentPayment', JSON.stringify({
                    paymentId: response.data.paymentId,
                    orderId: response.data.orderId,
                    amount: response.data.amount,
                    tickets: tickets,
                    showtime: showtime,
                    selectedSeats: selectedSeats,
                    selectedCombos: selectedCombos
                }));

                // ✅ MỞ MOMO Ở TAB MỚI (không redirect tab hiện tại)
                window.open(response.data.paymentUrl, '_blank');

                // ✅ CHUYỂN ĐẾN TRANG KẾT QUẢ NGAY (countdown 60s để xác nhận)
                navigate('/payment-result', {
                    state: {
                        orderId: response.data.orderId,
                        paymentId: response.data.paymentId,
                        amount: response.data.amount,
                        autoCheck: true // Flag để PaymentResult biết cần đếm ngược
                    }
                });

                alert("✅ Đã mở cửa sổ thanh toán MoMo!\n\n⏰ Bạn có 60 giây để hoàn tất thanh toán và xác nhận.\n\n⚠️ Nếu hết thời gian, vé sẽ bị hủy và ghế sẽ được trả lại.");

            } else {
                throw new Error(response.data.message || 'Không thể tạo thanh toán');
            }

        } catch (error) {
            console.error("❌ Lỗi thanh toán MoMo:", error);

            if (error.response?.status === 401) {
                alert("Phiên đăng nhập đã hết hạn.  Vui lòng đăng nhập lại.");
                navigate('/login');
            } else {
                alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo thanh toán.  Vui lòng thử lại.");
            }
        } finally {
            setProcessingPayment(false);
        }
    };

    // Xử lý thanh toán
    const handlePayment = () => {
        if (paymentMethod === "MOMO") {
            handleMoMoPayment();
        } else {
            alert("Phương thức thanh toán này đang được phát triển");
        }
    };

    // Format tiền
    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Format ngày
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Format giờ
    const formatTime = (timeString) => {
        return timeString?.substring(0, 5);
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
            <Header user={user} handleLogout={handleLogout} />

            <main className="flex-1 p-4">
                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Quay lại
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                        <CreditCard className="w-8 h-8" />
                                        THANH TOÁN
                                    </h1>
                                    <p className="text-white/60 mt-1">Hoàn tất đặt vé của bạn</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white/60 text-sm">Tổng thanh toán</div>
                                <div className="text-3xl font-bold text-yellow-300">
                                    {formatCurrency(calculateFinalTotal())}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Booking Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Movie & Showtime Info */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Ticket className="w-6 h-6" />
                                    Thông Tin Đặt Vé
                                </h2>

                                <div className="space-y-4">
                                    {/* Movie Info */}
                                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                                        {showtime?.movie?.imageUrl && (
                                            <img
                                                src={showtime.movie.imageUrl}
                                                alt={showtime.movie.title}
                                                className="w-20 h-28 object-cover rounded-lg"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-lg mb-2">
                                                {showtime?.movie?.title}
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-white/80">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(showtime?.showtimeDate)}
                                                </div>
                                                <div className="flex items-center gap-2 text-white/80">
                                                    <Clock className="w-4 h-4" />
                                                    {formatTime(showtime?.startTime)} - {formatTime(showtime?.endTime)}
                                                </div>
                                                <div className="flex items-center gap-2 text-white/80">
                                                    <MapPin className="w-4 h-4" />
                                                    {showtime?.room?.roomName}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Seats */}
                                    <div>
                                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Ghế đã chọn ({selectedSeats.length} ghế)
                                        </h3>
                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                            {selectedSeats.map(seat => (
                                                <div
                                                    key={seat.seatID}
                                                    className="bg-blue-500/20 border border-blue-400 rounded-lg px-3 py-2 text-center"
                                                >
                                                    <div className="text-white font-bold">{seat.seatNumber}</div>
                                                    <div className="text-yellow-300 text-xs">{formatCurrency(seat.price)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Selected Combos */}
                                    {selectedCombos && selectedCombos.length > 0 && (
                                        <div>
                                            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                                                <Popcorn className="w-5 h-5" />
                                                Combo đã chọn
                                            </h3>
                                            <div className="space-y-2">
                                                {selectedCombos.map(combo => (
                                                    <div
                                                        key={combo.id}
                                                        className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-2xl">{combo.image}</div>
                                                            <div>
                                                                <div className="text-white font-semibold">{combo.name}</div>
                                                                <div className="text-white/60 text-sm">x{combo.quantity}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-yellow-300 font-bold">
                                                            {formatCurrency(combo.price * combo.quantity)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Promotion Code - Ẩn đi vì đã áp dụng ở BookTicket */}
                            {/* Giá vé từ backend đã bao gồm discount rồi */}

                            {/* Payment Method */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <CreditCard className="w-6 h-6" />
                                    Phương Thức Thanh Toán
                                </h2>

                                <div className="space-y-3">
                                    {/* MoMo */}
                                    <div
                                        onClick={() => setPaymentMethod("MOMO")}
                                        className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${paymentMethod === "MOMO"
                                            ? "bg-pink-500/20 border-2 border-pink-400"
                                            : "bg-white/5 border border-white/10 hover:border-pink-300"
                                            }`}
                                    >
                                        <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                                            <Smartphone className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-semibold">Ví MoMo</div>
                                            <div className="text-white/60 text-sm">Quét mã QR hoặc mở app MoMo</div>
                                        </div>
                                        {paymentMethod === "MOMO" && (
                                            <CheckCircle className="w-6 h-6 text-pink-400" />
                                        )}
                                    </div>

                                    {/* Other methods (disabled) */}
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 opacity-50 cursor-not-allowed">
                                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white font-semibold">Thẻ ATM / Visa / Master</div>
                                            <div className="text-white/60 text-sm">Đang phát triển</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Payment Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20 sticky top-4">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-6 h-6" />
                                    Tóm Tắt Đơn Hàng
                                </h2>

                                <div className="space-y-4">
                                    {/* Subtotal */}
                                    <div className="flex justify-between text-white/80">
                                        <span>Tạm tính</span>
                                        <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
                                    </div>

                                    {/* Seat details */}
                                    <div className="text-sm text-white/60 pl-4">
                                        <div className="flex justify-between">
                                            <span>• Vé xem phim ({tickets.length})</span>
                                            <span>{formatCurrency(calculateSeatsTotal())}</span>
                                        </div>
                                        {/* ✅ Combo đã được tính vào giá vé, chỉ hiển thị thông tin */}
                                        {selectedCombos && selectedCombos.length > 0 && (
                                            <div className="flex justify-between mt-1 text-white/40 italic">
                                                <span>• Bao gồm {selectedCombos.reduce((sum, c) => sum + c.quantity, 0)} combo</span>
                                                <span>Đã tính</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Discount */}
                                    {promotionApplied && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Giảm giá ({promotionApplied.discount}%)</span>
                                            <span className="font-semibold">-{formatCurrency(calculateDiscount())}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-white/20 pt-4">
                                        <div className="flex justify-between text-white text-xl font-bold">
                                            <span>Tổng cộng</span>
                                            <span className="text-yellow-300">{formatCurrency(calculateFinalTotal())}</span>
                                        </div>
                                    </div>

                                    {/* Payment Button */}
                                    <button
                                        onClick={handlePayment}
                                        disabled={processingPayment}
                                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 font-bold text-lg shadow-lg transition-all"
                                    >
                                        {processingPayment ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Đang xử lý...
                                            </div>
                                        ) : (
                                            `THANH TOÁN ${formatCurrency(calculateFinalTotal())}`
                                        )}
                                    </button>

                                    {/* Security Note */}
                                    <div className="text-center text-white/60 text-xs mt-4">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Giao dịch được bảo mật
                                        </div>
                                        <p>Thông tin thanh toán của bạn được mã hóa an toàn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Payment;