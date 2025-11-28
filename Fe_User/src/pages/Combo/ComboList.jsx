import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ComboCard from "../../components/Combo/ComboCard";

const api = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 10000,
});

// Component cho từng loại đồ uống riêng lẻ
function DrinkItemCard({ item, onQuantityChange }) {
    const [quantity, setQuantity] = useState(0);

    const handleIncrease = () => {
        const newQty = quantity + 1;
        setQuantity(newQty);
        onQuantityChange(item.id, newQty);
    };

    const handleDecrease = () => {
        const newQty = Math.max(quantity - 1, 0);
        setQuantity(newQty);
        onQuantityChange(item.id, newQty);
    };

    return (
        <div className="border border-gray-600 bg-gray-800/50 rounded-lg p-3 hover:border-gray-500 transition-colors h-full">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <h2 className="text-sm font-semibold text-white">{item.name}</h2>
                    <p className="text-gray-400 text-xs mt-1">{item.size}</p>
                </div>
                <span className="text-sm font-bold text-red-400 ml-2 whitespace-nowrap">
                    {item.price.toLocaleString()}VND
                </span>
            </div>

            <div className="flex justify-between items-center mt-3">
                <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden bg-white">
                    <button
                        onClick={handleDecrease}
                        disabled={quantity === 0}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-black text-xs w-6 h-6 flex items-center justify-center"
                    >
                        -
                    </button>
                    <span className="px-2 py-1 bg-white text-black font-medium text-xs w-6 text-center">
                        {quantity}
                    </span>
                    <button
                        onClick={handleIncrease}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black text-xs w-6 h-6 flex items-center justify-center"
                    >
                        +
                    </button>
                </div>

                <button
                    onClick={handleIncrease}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-medium"
                >
                    Thêm
                </button>
            </div>
        </div>
    );
}

export default function ComboList() {
    const [combos, setCombos] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("🚀 Bắt đầu gọi API combos...");

        const fetchCombos = async () => {
            try {
                // Gọi API combos với error handling
                const res = await api.get("/api/combos");
                console.log("✅ API Response:", res.data);

                // Kiểm tra response structure
                if (res.data && Array.isArray(res.data)) {
                    if (res.data.length > 0) {
                        setCombos(res.data);
                        console.log(`✅ Đã tải ${res.data.length} combo từ API`);
                    } else {
                        console.log("📝 API trả về mảng rỗng");
                        setCombos([]);
                    }
                } else if (res.data && res.data.data) {
                    // Nếu response có structure { success, message, data }
                    if (Array.isArray(res.data.data) && res.data.data.length > 0) {
                        setCombos(res.data.data);
                    } else {
                        console.log("📝 API trả về data rỗng");
                        setCombos([]);
                    }
                } else {
                    console.log("📝 API response không hợp lệ");
                    setCombos([]);
                }

            } catch (err) {
                console.error("❌ API Error:", err);
                console.error("📡 Chi tiết lỗi:", err.response?.data || err.message);
                setCombos([]);
                setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchCombos();
    }, []);

    const handleQuantityChange = (id, qty) => {
        setQuantities((prev) => ({ ...prev, [id]: qty }));
    };

    const handleIndividualItemChange = (id, qty) => {
        setQuantities((prev) => ({ ...prev, [id]: qty }));
    };

    // Hàm xử lý thanh toán
    const handleCheckout = async () => {
        const selectedItems = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({ id, quantity: qty }));

        if (selectedItems.length === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm!");
            return;
        }

        try {
            // Gọi API thanh toán
            const response = await api.post("/api/tickets/book-combo", {
                items: selectedItems,
                totalAmount: calculateTotal()
            });

            if (response.data.success) {
                alert("Đặt hàng thành công!");
                setQuantities({});
            } else {
                alert("Có lỗi xảy ra khi đặt hàng: " + response.data.message);
            }
        } catch (error) {
            console.error("❌ Checkout Error:", error);
            alert("Lỗi kết nối khi đặt hàng!");
        }
    };

    const calculateTotal = () => {
        return Object.keys(quantities)
            .reduce((total, id) => {
                const price = getItemPrice(id);
                return total + price * (quantities[id] || 0);
            }, 0);
    };

    const getItemPrice = (id) => {
        // Tìm giá từ combo
        const combo = combos.find(c => c.comboID == id);
        if (combo) return combo.price;

        return 0;
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0F2C] to-[#2B1E5A] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-lg">🍿 Đang tải combo...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0F2C] to-[#2B1E5A] flex flex-col">
            {/* Header */}


            {/* Main Content - chiếm toàn bộ không gian còn lại */}
            <div className="flex-1 p-4 max-w-md mx-auto w-full text-white overflow-y-auto">
                {/* Tiêu đề nhỏ gọn */}
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold text-white mb-2">COMBO BẮP NƯỚC</h1>
                    <div className="w-12 h-0.5 bg-red-500 mx-auto"></div>
                </div>

                {error && (
                    <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 mb-4 text-sm">
                        <p className="text-yellow-300">{error}</p>
                    </div>
                )}

                {/* Summary Bar nhỏ gọn */}
                <div className="bg-[#0B122E] p-4 rounded-xl mb-6 border border-white/10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-300">Tạm tính</h2>
                            <p className="text-lg font-bold text-white">
                                {calculateTotal().toLocaleString()} VND
                            </p>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={Object.values(quantities).every(qty => qty === 0 || !qty)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            THANH TOÁN
                        </button>
                    </div>
                </div>

                {/* Combo List - Chỉ hiển thị combo từ API */}
                <div className="space-y-3 mb-8">
                    <h2 className="text-base font-semibold mb-3 text-gray-300">COMBO</h2>

                    {combos.length === 0 ? (
                        <div className="text-center py-10 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-gray-400 text-lg">🍿</p>
                            <p className="text-gray-400 mt-2">Hiện chưa có combo nào</p>
                            <p className="text-gray-500 text-sm mt-1">Vui lòng quay lại sau</p>
                        </div>
                    ) : (
                        combos.map((combo) => (
                            <ComboCard
                                key={combo.comboID}
                                combo={combo}
                                onQuantityChange={handleQuantityChange}
                                compact={true}
                            />
                        ))
                    )}
                </div>

                {/* Thông báo chỉ có combo từ API */}

            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}