// components/Footer.jsx
import React from "react";
import {
    FaFacebookF,
    FaInstagram,
    FaYoutube,
    FaTiktok,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt
} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gradient-to-t from-gray-900 to-gray-800 text-white py-12 mt-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

                    {/* Cột 1: Logo + Mô tả */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <img
                                src="/cinestar-logo-white.png"
                                alt="Cinestar"
                                className="h-12"
                                onError={(e) => e.target.src = "https://via.placeholder.com/48/ffffff/000000?text=CINE"}
                            />
                            <span className="text-2xl font-bold tracking-wider">CINESTAR</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed max-w-md">
                            Hệ thống rạp chiếu phim hiện đại hàng đầu Việt Nam.
                            Trải nghiệm điện ảnh đỉnh cao với công nghệ âm thanh Dolby Atmos,
                            ghế đôi tình nhân, và dịch vụ đặt vé online tiện lợi nhất.
                        </p>
                        <div className="flex space-x-3 mt-5">
                            <a href="#" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition transform hover:scale-110">
                                <FaFacebookF size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition transform hover:scale-110">
                                <FaInstagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition transform hover:scale-110">
                                <FaYoutube size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-900 transition transform hover:scale-110">
                                <FaTiktok size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Cột 2: KHÁM PHÁ */}
                    <div>
                        <h3 className="text-lg font-bold text-yellow-400 mb-4 border-b border-yellow-400 pb-1 inline-block">
                            KHÁM PHÁ
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            {["Phim đang chiếu", "Phim sắp chiếu", "Lịch chiếu", "Rạp chiếu", "Ưu đãi"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-yellow-400 transition flex items-center group">
                                        <span className="group-hover:translate-x-1 transition-transform">›</span>
                                        <span className="ml-1">{item}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột 3: HỖ TRỢ */}
                    <div>
                        <h3 className="text-lg font-bold text-yellow-400 mb-4 border-b border-yellow-400 pb-1 inline-block">
                            HỖ TRỢ
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            {["Hướng dẫn đặt vé", "Chính sách thành viên", "Điều khoản sử dụng", "Câu hỏi thường gặp", "Liên hệ"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-yellow-400 transition flex items-center group">
                                        <span className="group-hover:translate-x-1 transition-transform">›</span>
                                        <span className="ml-1">{item}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột 4: LIÊN HỆ */}
                    <div>
                        <h3 className="text-lg font-bold text-yellow-400 mb-4 border-b border-yellow-400 pb-1 inline-block">
                            LIÊN HỆ
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-start">
                                <FaMapMarkerAlt className="mt-1 mr-2 text-yellow-400 flex-shrink-0" />
                                <span>180 Nguyễn Thị Minh Khai, Q.3, TP.HCM</span>
                            </li>
                            <li className="flex items-center">
                                <FaPhone className="mr-2 text-yellow-400 flex-shrink-0" />
                                <span>1900 6017</span>
                            </li>
                            <li className="flex items-center">
                                <FaEnvelope className="mr-2 text-yellow-400 flex-shrink-0" />
                                <span>support@cinestar.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bản quyền */}
                <div className="border-t border-gray-700 mt-10 pt-6 text-center">
                    <p className="text-xs text-gray-400">
                        © 2025 <span className="text-yellow-400 font-semibold">CINESTAR</span>.
                        Tất cả quyền được bảo lưu.
                        Thiết kế bởi <span className="text-purple-400">xAI Team</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Giấy phép số 123/GP-BTTTT do Bộ Thông tin và Truyền thông cấp
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;