// components/PromotionCarousel.jsx
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const PromotionCarousel = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/promotions/active');
            if (!response.ok) {
                throw new Error('Failed to fetch promotions');
            }
            const data = await response.json();
            setPromotions(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching promotions:', err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm chuyển đổi dữ liệu từ BE sang format hiển thị
    const mapPromotionToDisplay = (promo, index) => {
        // Màu gradient theo thứ tự
        const gradients = [
            "from-purple-600 to-pink-600",
            "from-indigo-600 to-purple-700",
            "from-pink-600 to-rose-600",
            "from-blue-600 to-cyan-600",
            "from-green-600 to-emerald-600"
        ];

        // Tạo title và description từ dữ liệu BE
        const title = `KHUYẾN MÃI ${promo.code}`;
        const discountText = `GIẢM ${promo.discount}%`;
        const period = `Từ ${new Date(promo.startDate).toLocaleDateString('vi-VN')} đến ${new Date(promo.endDate).toLocaleDateString('vi-VN')}`;

        // Tạo gifts dựa trên mức discount
        const gifts = [
            `Giảm ${promo.discount}%`,
            "Áp dụng online",
            "Nhiều ưu đãi khác"
        ];

        return {
            id: promo.promoID,
            title: `${title} - ${discountText}`,
            period: period,
            condition: `Áp dụng cho tất cả các suất chiếu`,
            prize: `Mã khuyến mãi: ${promo.code}`,
            winRate: `Giảm ngay ${promo.discount}%`,
            gifts: gifts,
            bgGradient: gradients[index % gradients.length]
        };
    };

    // Hàm tạo màu ngẫu nhiên cho placeholder
    const getRandomColor = () => {
        const colors = ['f9e4e4', 'c8f7c5', 'fff3cd', 'e4f0ff', 'ffe4e4'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    if (loading) {
        return (
            <section className="py-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                <div className="container mx-auto px-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center text-white">
                        Đang tải khuyến mãi...
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                <div className="container mx-auto px-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center text-white">
                        Lỗi khi tải khuyến mãi: {error}
                    </div>
                </div>
            </section>
        );
    }

    if (promotions.length === 0) {
        return (
            <section className="py-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                <div className="container mx-auto px-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center text-white">
                        Hiện không có khuyến mãi nào
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            <div className="container mx-auto px-4">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                    }}
                    navigation={{
                        prevEl: ".promo-prev",
                        nextEl: ".promo-next",
                    }}
                    className="promotion-swiper rounded-2xl overflow-hidden shadow-2xl"
                >
                    {promotions.map((promo, index) => {
                        const displayPromo = mapPromotionToDisplay(promo, index);
                        return (
                            <SwiperSlide key={displayPromo.id}>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
                                    {/* Nội dung chính */}
                                    <div className={`relative grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8 items-center bg-gradient-to-r ${displayPromo.bgGradient}`}>
                                        {/* Cột 1: Logo + Tiêu đề */}
                                        <div className="text-center md:text-left space-y-3">
                                            <div className="text-2xl font-bold text-yellow-300 drop-shadow-lg">
                                                🎬 CINESTAR
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-lg">
                                                {displayPromo.title.split(" - ")[0]}
                                            </h2>
                                            {displayPromo.title.includes(" - ") && (
                                                <h3 className="text-xl md:text-2xl font-bold text-white">
                                                    {displayPromo.title.split(" - ")[1]}
                                                </h3>
                                            )}
                                        </div>

                                        {/* Cột 2: Nội dung */}
                                        <div className="text-white space-y-3 text-center md:text-left">
                                            <div className="bg-white/30 backdrop-blur-sm inline-block px-4 py-1.5 rounded-full text-sm font-bold">
                                                {displayPromo.period}
                                            </div>
                                            <p className="text-sm md:text-base font-medium">
                                                {displayPromo.condition}
                                                <br />
                                                <span className="text-yellow-300 font-bold text-lg">
                                                    {displayPromo.prize}
                                                </span>
                                            </p>
                                            <p className="text-green-300 font-bold text-sm">
                                                {displayPromo.winRate}
                                            </p>

                                            <div className="flex justify-center md:justify-start gap-2 flex-wrap mt-3">
                                                {displayPromo.gifts.map((gift, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-white/30 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium"
                                                    >
                                                        {gift}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Cột 3: Nút */}
                                        <div className="flex flex-col items-center space-y-4">
                                            <button
                                                onClick={() => window.location.href = '/book-ticket-result'}
                                                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold text-lg rounded-full hover:from-yellow-300 hover:to-orange-300 transform hover:scale-105 transition-all duration-200 shadow-xl cursor-pointer"
                                            >
                                                ĐẶT VÉ NGAY
                                            </button>
                                        </div>
                                    </div>

                                    {/* Ghi chú nhỏ */}
                                    <div className="bg-white/5 backdrop-blur-md px-6 py-3 text-xs text-white/60 border-t border-white/10">
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Chương trình có thể thay đổi mà không báo trước.</li>
                                            <li>Áp dụng tại các rạp Cinestar trên toàn quốc.</li>
                                        </ul>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* Navigation buttons */}
                <div className="flex justify-center gap-4 mt-6">
                    <button className="promo-prev px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-colors">
                        ‹
                    </button>
                    <button className="promo-next px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-colors">
                        ›
                    </button>
                </div>
            </div>
        </section>
    );
};

export default PromotionCarousel;