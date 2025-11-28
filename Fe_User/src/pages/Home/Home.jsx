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
            <div className="min-h-screen from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <div className="text-white/80 text-lg">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
            {/* Header */}


            {/* Main Content */}
            <main className="flex-1">
                {/* Promotion Banner */}
                <div className="mb-8">
                    <PromotionBanner />
                </div>

                {/* Quick Booking */}
                <div className="mb-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <QuickBooking />
                    </div>
                </div>

                {/* Movie List */}
                <div className="mb-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <MovieList />
                    </div>
                </div>

                {/* Now Showing */}
                <div className="mb-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <NowShowingMovies />
                    </div>
                </div>

                {/* Upcoming Movies */}
                <div className="mb-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <UpcomingMovies
                            upcomingMovies={upcomingData}
                            title="Phim Sắp Chiếu"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-8 px-4">
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
                                <p className="text-red-300 text-sm">{errorMessage}</p>
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