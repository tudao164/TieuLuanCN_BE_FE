import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../../assets/Image/logo.png';
import ticket from '../../assets/Image/ticket.png';

const Header = ({ user, handleLogout }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchTerm.trim()) return;

        setIsLoading(true);
        try {
            console.log("🔍 Đang tìm kiếm:", searchTerm);

            const API_URL = `http://localhost:8080/api/movies/search?title=${encodeURIComponent(searchTerm.trim())}`;
            console.log("📡 URL API:", API_URL);

            const response = await fetch(API_URL);

            console.log("📡 Response status:", response.status);
            console.log("📡 Response ok:", response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const searchResults = await response.json();
            console.log("🎬 Kết quả tìm kiếm:", searchResults);
            console.log("📊 Số lượng kết quả:", searchResults.length);

            // Kiểm tra nếu chỉ có 1 kết quả và tên phim khớp chính xác
            if (searchResults.length === 1) {
                const exactMatch = searchResults[0];
                console.log("🎯 Chuyển đến trang chi tiết:", exactMatch.movieID);
                // Chuyển thẳng đến trang chi tiết phim
                navigate(`/movies/${exactMatch.movieID}`);
            } else if (searchResults.length > 1) {
                console.log("📄 Chuyển đến trang kết quả tìm kiếm");
                // Nhiều kết quả, chuyển đến trang kết quả tìm kiếm
                navigate("/search-results", {
                    state: {
                        results: searchResults,
                        searchQuery: searchTerm
                    }
                });
            } else {
                console.log("❌ Không có kết quả");
                // Không có kết quả
                navigate("/search-results", {
                    state: {
                        results: [],
                        searchQuery: searchTerm
                    }
                });
            }

        } catch (error) {
            console.error("💥 Lỗi tìm kiếm:", error);
            console.error("💥 Error details:", error.message);
            alert("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    // Hàm xử lý click đặt vé ngay - điều hướng đến trang book-ticket-result
    const handleBookTicket = () => {
        navigate("/book-ticket-result");
    };

    // Hàm xử lý click đặt combo
    const handleBookCombo = () => {
        navigate("/dat-combo");
    };

    return (
        <header className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 shadow-lg border-b border-white/20 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center">
                        <img
                            src={logo}
                            alt="Cinestar Logo"
                            className="h-10 w-auto"
                        />
                    </Link>

                    {/* Desktop: Nút đặt vé + Tìm kiếm */}
                    <div className="hidden md:flex items-center flex-1 justify-center space-x-8">
                        {/* Nút đặt vé & combo */}
                        <div className="flex items-center space-x-3 justify-start w-full max-w-xs">
                            <button
                                onClick={handleBookTicket}
                                className="flex items-center justify-center flex-1 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-semibold rounded-full hover:from-yellow-300 hover:to-orange-300 transition-all transform hover:scale-105 shadow-lg"
                            >
                                <img
                                    src={ticket}
                                    alt="Đặt vé"
                                    className="w-5 h-5 mr-2"
                                    loading="lazy"
                                />
                                <span className="txt">Đặt Vé Ngay</span>
                            </button>

                            <button
                                onClick={handleBookCombo}
                                className="flex items-center justify-center flex-1 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-semibold rounded-full hover:from-yellow-300 hover:to-orange-300 transition-all transform hover:scale-105 shadow-lg"
                            >
                                <img
                                    src={ticket}
                                    alt="Đặt combo"
                                    className="w-5 h-5 mr-2"
                                    loading="lazy"
                                />
                                <span className="txt">Đặt Bắp Nước</span>
                            </button>
                        </div>

                        {/* Tìm kiếm */}
                        <div className="max-w-md w-full">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm phim theo tên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 pr-12 py-2.5 text-sm bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition placeholder:text-white/60"
                                    disabled={isLoading}
                                />
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <button
                                    type="submit"
                                    disabled={isLoading || !searchTerm.trim()}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-gray-900 p-1 rounded-full hover:bg-yellow-300 transition-all disabled:bg-white/30 disabled:cursor-not-allowed shadow-md"
                                >
                                    {isLoading ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-3">
                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg">
                                    <span>{user.fullName || user.name || "User"}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2.5 text-sm text-white hover:bg-white/20 first:rounded-t-xl transition-colors"
                                    >
                                        👤 Hồ sơ
                                    </Link>
                                    <button
                                        onClick={() => window.location.href = '/reset-password'}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/20 last:rounded-b-xl font-medium transition-colors"
                                    >
                                        🔐 Đổi mật khẩu
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/20 last:rounded-b-xl font-medium transition-colors"
                                    >
                                        🚪 Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-medium rounded-full hover:from-yellow-300 hover:to-orange-300 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-white/10 backdrop-blur-md text-white text-sm font-medium rounded-full hover:bg-white/20 border border-white/20 transition-all transform hover:scale-105"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Bottom Bar – Chỉ hiện trên mobile */}
                <div className="md:hidden flex justify-center space-x-3 py-2 border-t border-white/20 bg-white/10 backdrop-blur-md">
                    <button
                        onClick={handleBookTicket}
                        className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-medium rounded-full shadow-md"
                    >
                        Đặt vé
                    </button>
                    <button
                        onClick={handleBookCombo}
                        className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-medium rounded-full shadow-md"
                    >
                        Đặt combo
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;