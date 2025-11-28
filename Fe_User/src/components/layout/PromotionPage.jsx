import React, { useState, useEffect } from "react";

const PromotionPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [promoCode, setPromoCode] = useState("");
    const [validationResult, setValidationResult] = useState(null);
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        fetchActivePromotions();
    }, []);

    const fetchActivePromotions = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8080/api/promotions/active");

            if (!response.ok) throw new Error("Failed to fetch promotions");

            const data = await response.json();
            setPromotions(data);
        } catch (error) {
            setError("Không thể tải danh sách khuyến mãi");
        } finally {
            setLoading(false);
        }
    };

    const validatePromotion = async () => {
        if (!promoCode.trim()) {
            setValidationResult({ valid: false, message: "Vui lòng nhập mã khuyến mãi" });
            return;
        }

        try {
            setValidating(true);
            const response = await fetch(
                `http://localhost:8080/api/promotions/validate?code=${encodeURIComponent(
                    promoCode
                )}`
            );

            if (!response.ok) throw new Error("Validation failed");

            const result = await response.json();
            setValidationResult(result);
        } catch (error) {
            setValidationResult({
                valid: false,
                message: "Mã không hợp lệ hoặc đã hết hạn",
            });
        } finally {
            setValidating(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                    <div className="mt-4 text-white font-medium">Đang tải khuyến mãi...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-white">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button
                    onClick={fetchActivePromotions}
                    className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <section className="py-12 min-h-screen">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10 tracking-wider">
                    KHUYẾN MÃI
                </h2>

                {/* LIST */}
                {promotions.length === 0 ? (
                    <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <div className="text-white/70 text-lg">🔥 Hiện chưa có khuyến mãi</div>
                        <div className="text-white/50 text-sm mt-1">Vui lòng quay lại sau</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {promotions.map((promo) => (
                            <div
                                key={promo.promoID}
                                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                            >
                                {/* IMAGE */}
                                <div className="relative h-56 bg-gray-200 overflow-hidden">
                                    {promo.imageUrl ? (
                                        <img
                                            src={promo.imageUrl}
                                            alt={promo.code}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <span className="text-gray-600">Không có ảnh</span>
                                        </div>
                                    )}

                                    {/* DISCOUNT LABEL */}
                                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                                        Giảm {promo.discount}%
                                    </div>
                                </div>

                                {/* CONTENT */}
                                <div className="p-4">
                                    <h3 className="text-white font-bold text-base mb-2 line-clamp-2">
                                        {promo.code}
                                    </h3>

                                    <p className="text-white/70 text-sm line-clamp-2">
                                        {promo.description || "Không có mô tả"}
                                    </p>

                                    <p className="text-white/60 text-xs mt-3">
                                        📅 {formatDate(promo.startDate)} → {formatDate(promo.endDate)}
                                    </p>

                                    <button
                                        onClick={() => {
                                            setPromoCode(promo.code);
                                            validatePromotion();
                                        }}
                                        className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold text-sm rounded-lg hover:from-yellow-300 hover:to-orange-300 transition-all transform hover:scale-105 shadow-lg text-center"
                                    >
                                        Sử dụng mã
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* VALIDATE PROMO */}
                <div className="max-w-xl mx-auto mt-12 bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 shadow-xl">
                    <h3 className="text-2xl font-bold text-center text-white mb-6">Kiểm tra mã khuyến mãi</h3>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã..."
                            className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 placeholder-white/40"
                        />
                        <button
                            onClick={validatePromotion}
                            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300"
                        >
                            {validating ? "Đang kiểm tra..." : "Kiểm tra"}
                        </button>
                    </div>

                    {validationResult && (
                        <div
                            className={`mt-6 p-4 rounded-lg text-center ${validationResult.valid
                                    ? "bg-green-500/20 text-green-300 border border-green-400/30"
                                    : "bg-red-500/20 text-red-300 border border-red-400/30"
                                }`}
                        >
                            {validationResult.valid ? (
                                <>
                                    <strong>Mã hợp lệ!</strong>
                                    <p>Giảm {validationResult.discount}%</p>
                                </>
                            ) : (
                                <p>{validationResult.message}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PromotionPage;
