import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import UpcomingMovies from "../../components/Movie/UpcomingMovies";
import PromotionBanner from "../../components/Promotion/PromotionBanner";
import MovieList from "../../components/Movie/MovieList";
import NowShowingMovies from "../../components/Movie/NowShowingCarousel";
import QuickBooking from "../../components/layout/QuickBooking";

const Home = () => {
    const [user, setUser] = useState(null);
    const [nowShowingData, setNowShowingData] = useState([]);
    const [upcomingData, setUpcomingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        loadHomepageData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadHomepageData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            // Gọi cả 2 API song song
            const [nowShowingResponse, upcomingResponse] = await Promise.all([
                fetch('/api/showtimes/now-showing'),
                fetch('/api/showtimes/upcoming')
            ]);

            // Nếu status không ok thì đọc body để biết server trả gì
            if (!nowShowingResponse.ok) {
                const text = await safeReadText(nowShowingResponse);
                throw new Error(`Now-showing HTTP ${nowShowingResponse.status}: ${text}`);
            }
            if (!upcomingResponse.ok) {
                const text = await safeReadText(upcomingResponse);
                throw new Error(`Upcoming HTTP ${upcomingResponse.status}: ${text}`);
            }

            // Kiểm tra content-type trước khi parse JSON, vì nếu server trả HTML (vd. index.html) thì .json() sẽ bắn lỗi "Unexpected token <"
            const nowShowingContentType = nowShowingResponse.headers.get('content-type') || "";
            const upcomingContentType = upcomingResponse.headers.get('content-type') || "";

            if (!nowShowingContentType.includes('application/json')) {
                const text = await safeReadText(nowShowingResponse);
                console.error("Now-showing response is not JSON:", text);
                throw new Error("Now-showing response is not JSON. Check server/proxy.");
            }
            if (!upcomingContentType.includes('application/json')) {
                const text = await safeReadText(upcomingResponse);
                console.error("Upcoming response is not JSON:", text);
                throw new Error("Upcoming response is not JSON. Check server/proxy.");
            }

            // Parse JSON (an toàn vì đã kiểm tra content-type)
            const nowShowing = await nowShowingResponse.json();
            const upcoming = await upcomingResponse.json();

            setNowShowingData(nowShowing);
            setUpcomingData(upcoming);
        } catch (error) {
            console.error('Lỗi tải dữ liệu trang chủ:', error);
            setErrorMessage(error.message || "Lỗi tải dữ liệu");
            // Reset data để UI không crash
            setNowShowingData([]);
            setUpcomingData([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper: cố gắng đọc text an toàn (có thể response body đã bị đọc trước đó => try/catch)
    const safeReadText = async (response) => {
        try {
            return await response.clone().text();
        } catch (err) {
            return `<unable to read response body: ${err.message}>`;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="text-white font-semibold text-xl mt-4 animate-pulse">Đang tải dữ liệu...</div>
                    <div className="text-white/60 text-sm mt-2">Vui lòng chờ trong giây lát</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Main Content */}
            <main className="flex-1 relative z-10">
                {/* Hero Section with Promotion Banner */}
                <div className="mb-8 animate-fadeIn">
                    <PromotionBanner />
                </div>

                {/* Quick Booking with Enhanced Style */}
                <div className="mb-16 px-4 animate-fadeIn delay-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4 flex items-center gap-2">
                                <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                                </svg>
                                Đặt Vé Nhanh
                            </h2>
                            <QuickBooking />
                        </div>
                    </div>
                </div>

                {/* Movie List Section */}
                <div className="mb-16 px-4 animate-fadeIn delay-200">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                                <span className="text-5xl">🎬</span>
                                Phim Đang Hot
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto rounded-full"></div>
                        </div>
                        <MovieList />
                    </div>
                </div>

                {/* Now Showing Section */}
                <div className="mb-16 px-4 animate-fadeIn delay-300">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                                <span className="text-5xl">🎥</span>
                                Đang Chiếu
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
                            <p className="text-white/60 mt-3">Những bộ phim đang được chiếu tại rạp</p>
                        </div>
                        <NowShowingMovies />
                    </div>
                </div>

                {/* Upcoming Movies Section */}
                <div className="mb-16 px-4 animate-fadeIn delay-400">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                                <span className="text-5xl">⏰</span>
                                Sắp Chiếu
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
                            <p className="text-white/60 mt-3">Đừng bỏ lỡ những bom tấn sắp ra mắt</p>
                        </div>
                        <UpcomingMovies
                            upcomingMovies={upcomingData}
                            title=""
                        />
                    </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-8 px-4 animate-shake">
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl p-6 text-center shadow-lg">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                    </svg>
                                    <p className="text-red-300 font-semibold">Có lỗi xảy ra</p>
                                </div>
                                <p className="text-red-200 text-sm">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Home;