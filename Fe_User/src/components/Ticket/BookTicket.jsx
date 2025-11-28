import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Monitor, Sofa, Users, Ticket, ArrowLeft, ShoppingCart, Popcorn } from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const BookTicket = ({ user, setUser }) => {
    const { id: movieId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [showtime, setShowtime] = useState(null);
    const [room, setRoom] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [movie, setMovie] = useState(null);
    const [combos, setCombos] = useState([]);
    const [selectedCombos, setSelectedCombos] = useState([]);
    const [comboLoading, setComboLoading] = useState(false);
    const [promotionCode, setPromotionCode] = useState("");
    const [promotionApplied, setPromotionApplied] = useState(null);
    const [promotionError, setPromotionError] = useState("");
    const [validatingPromo, setValidatingPromo] = useState(false);


    const showtimeId = location.state?.showtimeId;

    // Cấu hình giá CỐ ĐỊNH theo admin (1. 0, 1.5, 2.0, 1.3)
    const SEAT_TYPES = {
        STANDARD: {
            name: 'Ghế Thường',
            color: 'bg-gray-100 border-gray-300 text-gray-700',
            colorActive: 'bg-green-500 text-white border-green-600',
            colorSelected: 'bg-blue-500 text-white border-blue-600',
            icon: '💺',
            multiplier: 1.0
        },
        VIP: {
            name: 'Ghế VIP',
            color: 'bg-purple-100 border-purple-300 text-purple-700',
            colorActive: 'bg-purple-500 text-white border-purple-600',
            colorSelected: 'bg-purple-600 text-white border-purple-700',
            icon: '👑',
            multiplier: 1.5
        },
        COUPLE: {
            name: 'Ghế Đôi',
            color: 'bg-pink-100 border-pink-300 text-pink-700',
            colorActive: 'bg-pink-500 text-white border-pink-600',
            colorSelected: 'bg-pink-600 text-white border-pink-700',
            icon: '❤️',
            multiplier: 2.0
        },
        PREMIUM: {
            name: 'Khu Trung Tâm',
            color: 'bg-yellow-100 border-yellow-400 text-yellow-800',
            colorActive: 'bg-yellow-500 text-white border-yellow-600',
            colorSelected: 'bg-yellow-600 text-white border-yellow-700',
            icon: '⭐',
            multiplier: 1.3
        }
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

    const fetchCombos = async () => {
        setComboLoading(true);
        try {
            console.log('🔄 Đang gọi API combos...');
            const response = await axios.get('http://localhost:8080/api/combos', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Combo API response:', response.data);

            if (response.data && Array.isArray(response.data)) {
                const combosFromAPI = response.data.map(combo => ({
                    id: combo.comboID,
                    name: combo.nameCombo,
                    description: combo.description || `${combo.nameCombo} - Combo hấp dẫn`,
                    price: combo.price,
                    image: getComboImage(combo.nameCombo),
                    items: generateComboItems(combo.nameCombo, combo.price),
                    popular: combo.price > 100000
                }));

                setCombos(combosFromAPI);
                console.log('🎯 Combos từ BE:', combosFromAPI);
            } else {
                console.warn('⚠️ Dữ liệu combo không hợp lệ:', response.data);
                setCombos([]);
            }
        } catch (error) {
            console.error('💥 Lỗi khi lấy combo từ BE:', error);
            console.error('📡 Chi tiết lỗi:', error.response?.data || error.message);
            setCombos([]);
        } finally {
            setComboLoading(false);
        }
    };

    const getComboImage = (comboName) => {
        if (!comboName) return '🍿';

        const name = comboName.toLowerCase();
        if (name.includes('gia đình') || name.includes('family')) return '👨‍👩‍👧‍👦';
        if (name.includes('đôi') || name.includes('couple') || name.includes('cặp')) return '❤️';
        if (name.includes('tiết kiệm') || name.includes('save') || name.includes('economy')) return '💰';
        if (name.includes('vip') || name.includes('premium') || name.includes('deluxe')) return '⭐';
        if (name.includes('bắp') || name.includes('popcorn')) return '🍿';
        if (name.includes('nước') || name.includes('drink')) return '🥤';
        if (name.includes('snack') || name.includes('ăn vặt')) return '🍪';
        return '🍿';
    };

    const generateComboItems = (comboName, price) => {
        if (!comboName) return ['Combo đặc biệt'];

        const name = comboName.toLowerCase();
        const items = [];

        if (name.includes('bắp') || name.includes('popcorn')) {
            if (name.includes('lớn') || price > 80000) items.push('1 Popcorn lớn');
            else if (name.includes('vừa') || price > 50000) items.push('1 Popcorn vừa');
            else items.push('1 Popcorn');
        }

        if (name.includes('nước') || name.includes('drink')) {
            if (name.includes('2') || price > 70000) items.push('2 nước ngọt');
            else items.push('1 nước ngọt');
        }

        if (name.includes('snack') || name.includes('ăn vặt')) {
            items.push('Snack hấp dẫn');
        }

        if (name.includes('gia đình') || name.includes('family')) {
            items.push('2 Popcorn lớn', '4 nước ngọt');
        }

        if (name.includes('đôi') || name.includes('couple')) {
            items.push('2 Popcorn vừa', '2 nước ngọt');
        }

        if (items.length === 0) {
            items.push('Combo đồ ăn thức uống');
        }

        return items;
    };

    useEffect(() => {
        const fetchBookingData = async () => {
            if (!showtimeId) {
                alert("Vui lòng chọn suất chiếu trước");
                navigate(`/select-showtime/${movieId}`);
                return;
            }

            try {
                setLoading(true);

                const showtimeResponse = await axios.get(`http://localhost:8080/api/showtimes/${showtimeId}`);
                const showtimeData = showtimeResponse.data;
                setShowtime(showtimeData);

                if (showtimeData.movie) {
                    setMovie(showtimeData.movie);
                }

                const roomId = showtimeData.room?.roomID;
                if (roomId) {
                    const roomResponse = await axios.get(`http://localhost:8080/api/rooms/${roomId}`);
                    setRoom(roomResponse.data);

                    const seatsResponse = await axios.get(`http://localhost:8080/api/rooms/${roomId}/seats`);
                    const basePrice = showtimeData.basePrice;

                    console.log("💰 Giá vé cơ bản từ showtime:", basePrice);

                    const formattedSeats = seatsResponse.data.map(seat => {
                        const seatType = SEAT_TYPES[seat.seatType] || SEAT_TYPES.STANDARD;
                        const calculatedPrice = Math.round(basePrice * seatType.multiplier);

                        return {
                            ...seat,
                            price: calculatedPrice,
                            priceMultiplier: seatType.multiplier,
                            basePrice: basePrice,
                            seatTypeName: seatType.name
                        };
                    });

                    setSeats(formattedSeats);
                }

                await fetchCombos();

            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
                alert("Không thể tải thông tin phòng chiếu");
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [showtimeId, movieId, navigate]);

    const handleSeatSelect = (seat) => {
        if (seat.status !== "AVAILABLE") return;

        setSelectedSeats(prev => {
            const isSelected = prev.find(s => s.seatID === seat.seatID);
            if (isSelected) {
                return prev.filter(s => s.seatID !== seat.seatID);
            } else {
                return [...prev, seat];
            }
        });
    };

    const handleComboSelect = (combo) => {
        setSelectedCombos(prev => {
            const existingIndex = prev.findIndex(c => c.id === combo.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += 1;
                return updated;
            } else {
                return [...prev, {
                    ...combo,
                    quantity: 1
                }];
            }
        });
    };

    const handleComboRemove = (comboId) => {
        setSelectedCombos(prev => prev.filter(c => c.id !== comboId));
    };

    const handleComboQuantityChange = (comboId, newQuantity) => {
        if (newQuantity < 1) return;

        setSelectedCombos(prev =>
            prev.map(c =>
                c.id === comboId ? { ...c, quantity: newQuantity } : c
            )
        );
    };

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
                `http://localhost:8080/api/promotions/validate?code=${promotionCode}`,
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

    // ✅ FIX: Chỉ book vé, KHÔNG gửi combo trong request
    const handleBookTickets = async () => {
        if (selectedSeats.length === 0) {
            alert("Vui lòng chọn ít nhất 1 ghế");
            return;
        }

        try {
            setBooking(true);
            const token = localStorage.getItem('token');

            if (!token) {
                alert("Vui lòng đăng nhập để đặt vé");
                navigate('/login');
                return;
            }

            const seatIds = selectedSeats.map(seat => seat.seatID);

            // ✅ Gửi showtimeId, seatIds VÀ comboIds (nếu có)
            const bookingData = {
                showtimeId: parseInt(showtimeId),
                seatIds: seatIds
            };

            // Thêm comboIds nếu có combo được chọn
            if (selectedCombos && selectedCombos.length > 0) {
                // ✅ Sử dụng 'id' thay vì 'comboID' vì đã map ở line 87
                bookingData.comboIds = selectedCombos.map(combo => combo.id);
            }

            // ✅ Thêm promotionCode nếu có mã giảm giá được áp dụng
            if (promotionApplied && promotionApplied.code) {
                bookingData.promotionCode = promotionApplied.code;
            }

            console.log('📤 Gửi dữ liệu booking (vé + combo + promotion):', bookingData);

            const response = await axios.post('http://localhost:8080/api/tickets/book',
                bookingData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const bookingResult = response.data;
            console.log('✅ Booking response:', bookingResult);

            // ✅ Tổng tiền đã được backend tính đầy đủ (vé + combo)
            const totalAmount = bookingResult.totalAmount || bookingResult.tickets.reduce((sum, ticket) => sum + ticket.price, 0);

            console.log('💰 Tổng tiền (từ backend):', totalAmount);
            localStorage.setItem("amount", totalAmount);

            // ✅ Navigate sang trang Payment với đầy đủ thông tin
            navigate('/payment', {
                state: {
                    tickets: bookingResult.tickets,
                    totalAmount: totalAmount, // Tổng đã bao gồm vé + combo từ backend
                    showtime: showtime,
                    selectedSeats: selectedSeats,
                    selectedCombos: selectedCombos, // Chỉ để hiển thị UI
                    bookingResult: bookingResult,
                    movie: movie
                }
            });

        } catch (error) {
            console.error("❌ Lỗi khi đặt vé:", error);
            if (error.response?.status === 401) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                navigate('/login');
            } else if (error.response?.data?.message) {
                alert(`Lỗi: ${error.response.data.message}`);
            } else {
                alert("Có lỗi xảy ra khi đặt vé.  Vui lòng thử lại.");
            }
        } finally {
            setBooking(false);
        }
    };

    const calculateSeatsTotal = () => {
        return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
    };

    const calculateCombosTotal = () => {
        return selectedCombos.reduce((total, combo) => total + (combo.price * combo.quantity), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSeatsTotal() + calculateCombosTotal();
        if (promotionApplied) {
            const discount = (subtotal * promotionApplied.discount) / 100;
            return subtotal - discount;
        }
        return subtotal;
    };

    const calculateDiscount = () => {
        if (!promotionApplied) return 0;
        const subtotal = calculateSeatsTotal() + calculateCombosTotal();
        return (subtotal * promotionApplied.discount) / 100;
    };

    const getAislePositions = (columns) => {
        if (columns <= 10) return [Math.floor(columns / 2)];
        if (columns <= 16) return [Math.floor(columns / 3), Math.floor(columns * 2 / 3)];
        return [Math.floor(columns / 4), Math.floor(columns / 2), Math.floor(columns * 3 / 4)];
    };

    const renderDetailedSeatLayout = () => {
        const rows = {};
        seats.forEach(seat => {
            const row = seat.seatNumber.charAt(0);
            if (!rows[row]) {
                rows[row] = [];
            }
            rows[row].push(seat);
        });

        const maxColumns = Math.max(...Object.values(rows).map(row => row.length));
        const aislePositions = getAislePositions(maxColumns);

        return Object.entries(rows).sort().map(([row, rowSeats]) => {
            const sortedSeats = rowSeats.sort((a, b) => parseInt(a.seatNumber.slice(1)) - parseInt(b.seatNumber.slice(1)));

            return (
                <div key={row} className="flex justify-center items-center gap-3 mb-4">
                    <div className="w-8 text-center font-bold text-white text-lg bg-white/10 px-2 py-1 rounded-lg">
                        {row}
                    </div>

                    <div className="flex items-center gap-2">
                        {sortedSeats.map((seat, index) => {
                            const isSelected = selectedSeats.find(s => s.seatID === seat.seatID);
                            const seatType = SEAT_TYPES[seat.seatType] || SEAT_TYPES.STANDARD;
                            const isAislePosition = aislePositions.includes(index + 1);

                            let seatClass = `w-12 h-12 rounded-lg flex flex-col items-center justify-center font-semibold cursor-pointer transition-all duration-200 shadow-lg border-2 `;

                            if (seat.status === "BOOKED") {
                                seatClass += "bg-red-500/50 border-red-400 text-white cursor-not-allowed";
                            } else if (isSelected) {
                                seatClass += `${seatType.colorSelected} transform scale-110`;
                            } else {
                                seatClass += `${seatType.color} hover:scale-105 hover:shadow-xl`;
                            }

                            return (
                                <React.Fragment key={seat.seatID}>
                                    <div
                                        className={seatClass}
                                        onClick={() => handleSeatSelect(seat)}
                                        title={`${seat.seatNumber} - ${seatType.name} - ${formatCurrency(seat.price)}`}
                                    >
                                        <div className="text-xs">{seatType.icon}</div>
                                        <div className="text-[10px] font-bold mt-[-2px]">
                                            {seat.seatNumber.slice(1)}
                                        </div>
                                    </div>

                                    {isAislePosition && index < sortedSeats.length - 1 && (
                                        <div className="w-8 flex items-center justify-center">
                                            <div className="w-4 h-1 bg-yellow-400/50 rounded-full"></div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            );
        });
    };

    const renderCombosSection = () => {
        if (comboLoading) {
            return (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                    <p className="text-white/70">Đang tải danh sách combo...</p>
                </div>
            );
        }

        if (combos.length === 0) {
            return (
                <div className="text-center py-12">
                    <Popcorn className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70 text-lg">Hiện chưa có combo nào</p>
                    <p className="text-white/50 text-sm mt-2">Vui lòng quay lại sau</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                        <Popcorn className="w-8 h-8 text-yellow-400" />
                        COMBO BẮP NƯỚC
                        <Popcorn className="w-8 h-8 text-yellow-400" />
                    </h3>
                    <p className="text-white/60 text-sm mt-2">🎁 Combo sẽ được tính trong trang thanh toán</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {combos.map(combo => (
                        <div
                            key={combo.id}
                            className={`bg-white/5 rounded-xl p-4 border-2 transition-all cursor-pointer hover:scale-105 ${selectedCombos.find(c => c.id === combo.id)
                                ? 'border-yellow-400 bg-yellow-500/10'
                                : 'border-white/10 hover:border-yellow-300'
                                }`}
                            onClick={() => handleComboSelect(combo)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-3xl">{combo.image}</div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">{combo.name}</h4>
                                            {combo.popular && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                    PHỔ BIẾN
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-white/70 text-sm mb-3">{combo.description}</p>
                                    <div className="space-y-1">
                                        {combo.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                                                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-yellow-300 font-bold text-xl">
                                        {formatCurrency(combo.price)}
                                    </div>
                                    <div className="text-white/60 text-sm">/combo</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return timeString?.substring(0, 5);
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <div className="text-white/80 text-lg">Đang tải thông tin phòng chiếu...</div>
                </div>
            </div>
        );
    }

    if (!showtime) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-4">Không tìm thấy suất chiếu</div>
                    <button
                        onClick={() => navigate(`/select-showtime/${movieId}`)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 shadow-lg"
                    >
                        Quay lại chọn suất chiếu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
            <Header user={user} handleLogout={handleLogout} />

            <main className="flex-1">
                <div className="p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-6 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => navigate(`/select-showtime/${movieId}`)}
                                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Quay lại
                                    </button>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">🎬 CHỌN GHẾ & COMBO</h1>
                                        <p className="text-white/60 mt-1">Bước 1/2: Chọn ghế và combo → Bước 2: Thanh toán</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white/60 text-sm">Tổng đã chọn</div>
                                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                                        {selectedSeats.length} ghế
                                        {selectedCombos.length > 0 && ` • ${selectedCombos.reduce((sum, c) => sum + c.quantity, 0)} combo`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-6 border border-white/20">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Ticket className="w-6 h-6" />
                                            Thông Tin Vé
                                        </h2>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-white/60 text-sm">Phim</div>
                                                <div className="text-white font-semibold text-lg">{showtime.movie?.title}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-white/60 text-sm">Ngày</div>
                                                    <div className="text-white font-semibold">{formatDate(showtime.showtimeDate)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-white/60 text-sm">Giờ</div>
                                                    <div className="text-white font-semibold">{formatTime(showtime.startTime)}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-white/60 text-sm">Phòng</div>
                                                <div className="text-white font-semibold">{showtime.room?.roomName}</div>
                                            </div>
                                            <div>
                                                <div className="text-white/60 text-sm">Giá vé cơ bản</div>
                                                <div className="text-yellow-300 font-semibold">
                                                    {formatCurrency(showtime.basePrice)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedSeats.length > 0 && (
                                        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <Users className="w-5 h-5" />
                                                Ghế Đã Chọn
                                            </h3>
                                            <div className="space-y-2">
                                                {selectedSeats.map(seat => {
                                                    const seatType = SEAT_TYPES[seat.seatType] || SEAT_TYPES.STANDARD;
                                                    return (
                                                        <div key={seat.seatID} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded flex items-center justify-center ${seatType.color} text-sm`}>
                                                                    {seatType.icon}
                                                                </div>
                                                                <div>
                                                                    <div className="text-white font-semibold">{seat.seatNumber}</div>
                                                                    <div className="text-white/60 text-xs">{seatType.name}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-yellow-300 font-bold">
                                                                {formatCurrency(seat.price)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="border-t border-white/20 pt-4 mt-4">
                                                <div className="flex justify-between items-center text-lg">
                                                    <span className="text-white font-semibold">Tổng tiền ghế</span>
                                                    <span className="text-yellow-300 font-bold text-xl">
                                                        {formatCurrency(calculateSeatsTotal())}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedCombos.length > 0 && (
                                        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <ShoppingCart className="w-5 h-5" />
                                                Combo Đã Chọn
                                            </h3>
                                            <div className="space-y-3">
                                                {selectedCombos.map(combo => (
                                                    <div key={combo.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className="text-white font-semibold text-sm">{combo.name}</div>
                                                                <div className="text-yellow-300 font-bold">{formatCurrency(combo.price)}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleComboRemove(combo.id)}
                                                                className="text-red-400 hover:text-red-300 text-sm"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-white/60 text-sm">Số lượng:</span>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleComboQuantityChange(combo.id, combo.quantity - 1)}
                                                                    className="w-6 h-6 bg-white/10 rounded text-white hover:bg-white/20"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="text-white font-semibold w-8 text-center">{combo.quantity}</span>
                                                                <button
                                                                    onClick={() => handleComboQuantityChange(combo.id, combo.quantity + 1)}
                                                                    className="w-6 h-6 bg-white/10 rounded text-white hover:bg-white/20"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="text-right mt-2">
                                                            <div className="text-yellow-300 font-semibold">
                                                                {formatCurrency(combo.price * combo.quantity)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t border-white/20 pt-4 mt-4">
                                                <div className="flex justify-between items-center text-lg">
                                                    <span className="text-white font-semibold">Tổng combo</span>
                                                    <span className="text-yellow-300 font-bold text-xl">
                                                        {formatCurrency(calculateCombosTotal())}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="lg:col-span-3 space-y-6">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                                    <Sofa className="w-6 h-6" />
                                                    {room?.roomName} - Sơ Đồ Ghế
                                                </h2>
                                                <p className="text-white/60 mt-1">
                                                    {seats.filter(s => s.status === "AVAILABLE").length} ghế trống •
                                                    Tổng {seats.length} ghế
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white/60 text-sm">Đã chọn</div>
                                                <div className="text-2xl font-bold text-green-300">{selectedSeats.length} ghế</div>
                                            </div>
                                        </div>

                                        <div className="text-center mb-8">
                                            <div className="bg-gradient-to-b from-gray-700 to-gray-900 text-white py-4 px-12 rounded-lg inline-block shadow-2xl border-2 border-white/20 transform -skew-x-6">
                                                <Monitor className="inline w-6 h-6 mr-2" />
                                                <span className="text-lg font-bold">MÀN HÌNH CHÍNH</span>
                                            </div>
                                            <div className="mt-2 text-yellow-300/80 text-sm flex items-center justify-center gap-2">
                                                <div className="w-3 h-1 bg-yellow-400/50 rounded-full"></div>
                                                <span>Lối đi</span>
                                                <div className="w-3 h-1 bg-yellow-400/50 rounded-full"></div>
                                            </div>
                                        </div>

                                        <div className="bg-black/30 p-6 rounded-xl border border-white/10">
                                            <div className="flex flex-col items-center space-y-3 overflow-x-auto pb-4">
                                                {renderDetailedSeatLayout()}
                                            </div>
                                        </div>

                                        <div className="mt-6 bg-white/5 p-4 rounded-lg border border-white/10">
                                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                                <span>🎯</span>
                                                Chú Thích Ghế & Giá
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {Object.entries(SEAT_TYPES).map(([key, type]) => {
                                                    const basePrice = showtime?.basePrice || 0;
                                                    const actualPrice = Math.round(basePrice * type.multiplier);

                                                    return (
                                                        <div key={key} className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${type.color} border-2`}>
                                                                {type.icon}
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-semibold text-sm">{type.name}</div>
                                                                <div className="text-yellow-300 text-xs font-bold">{formatCurrency(actualPrice)}</div>
                                                                <div className="text-white/60 text-xs">×{type.multiplier}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/50 text-white border-2 border-red-400">
                                                        ❌
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-semibold text-sm">Đã đặt</div>
                                                        <div className="text-white/60 text-xs">Không thể chọn</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500 text-white border-2 border-blue-600">
                                                        💺
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-semibold text-sm">Đã chọn</div>
                                                        <div className="text-white/60 text-xs">Ghế của bạn</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                        {renderCombosSection()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(selectedSeats.length > 0 || selectedCombos.length > 0) && (
                            <div className="space-y-6">
                                {/* Mã khuyến mãi */}
                                <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="text-2xl">🎟️</span>
                                        Mã Khuyến Mãi
                                    </h3>

                                    {!promotionApplied ? (
                                        <div className="space-y-3">
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={promotionCode}
                                                    onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                                                    placeholder="Nhập mã khuyến mãi"
                                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                                                />
                                                <button
                                                    onClick={validatePromotionCode}
                                                    disabled={validatingPromo || !promotionCode.trim()}
                                                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                                >
                                                    {validatingPromo ? "Đang kiểm tra..." : "Áp dụng"}
                                                </button>
                                            </div>
                                            {promotionError && (
                                                <div className="text-red-400 text-sm flex items-center gap-2">
                                                    <span>❌</span>
                                                    {promotionError}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="text-green-300 font-semibold flex items-center gap-2">
                                                        <span>✅</span>
                                                        Mã "{promotionApplied.code}" đã được áp dụng
                                                    </div>
                                                    <div className="text-white/80 text-sm mt-1">
                                                        Giảm {promotionApplied.discount}% tổng hóa đơn
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={removePromotion}
                                                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 text-sm"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tổng tiền */}
                                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-green-500/30">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">Chi Tiết Thanh Toán</h3>
                                        <div className="text-white/80 space-y-2">
                                            {selectedSeats.length > 0 && (
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>Vé xem phim ({selectedSeats.length}):</span>
                                                    <span className="text-yellow-300 font-semibold">{formatCurrency(calculateSeatsTotal())}</span>
                                                </div>
                                            )}
                                            {selectedCombos.length > 0 && (
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>Combo bắp nước ({selectedCombos.reduce((sum, c) => sum + c.quantity, 0)}):</span>
                                                    <span className="text-yellow-300 font-semibold">{formatCurrency(calculateCombosTotal())}</span>
                                                </div>
                                            )}
                                            {promotionApplied && (
                                                <div className="flex items-center justify-between gap-2 text-green-300">
                                                    <span>Giảm giá ({promotionApplied.discount}%):</span>
                                                    <span className="font-semibold">-{formatCurrency(calculateDiscount())}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between gap-2 text-lg font-bold border-t border-white/20 pt-2 mt-2">
                                                <span>Tổng cộng:</span>
                                                <span className="text-yellow-300 text-xl">{formatCurrency(calculateTotal())}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleBookTickets}
                                        disabled={booking || selectedSeats.length === 0}
                                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-bold text-lg min-w-48"
                                    >
                                        {booking ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Đang xử lý...
                                            </div>
                                        ) : (
                                            `TIẾP TỤC THANH TOÁN →`
                                        )}
                                    </button>
                                </div>
                            </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default BookTicket;