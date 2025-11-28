import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { Clock, Calendar, Users, ArrowLeft, Ticket } from "lucide-react";

const SelectShowtime = ({ user, setUser }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch movie details
                const movieResponse = await axios.get(`http://localhost:8080/api/movies/${id}`);
                setMovie(movieResponse.data);

                // Fetch showtimes for this movie
                const showtimesResponse = await axios.get(`http://localhost:8080/api/showtimes/movie/${id}`);
                setShowtimes(showtimesResponse.data);

                // Set default selected date to today or first available date
                if (showtimesResponse.data.length > 0) {
                    setSelectedDate(showtimesResponse.data[0].showtimeDate);
                }

            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
                alert("Không thể tải thông tin suất chiếu");
            } finally {
                setLoading(false);
            }
        };


        fetchData();
    }, [id]);

    // Lấy danh sách các ngày có suất chiếu
    const getAvailableDates = () => {
        const dates = [...new Set(showtimes.map(showtime => showtime.showtimeDate))];
        return dates.sort();
    };

    // Lọc suất chiếu theo ngày đã chọn
    const getShowtimesByDate = () => {
        return showtimes.filter(showtime => showtime.showtimeDate === selectedDate);
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

    const handleSelectShowtime = (showtimeId) => {
        navigate(`/bookticket/${id}`, {
            state: { showtimeId: showtimeId }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <div className="text-white/80 text-lg">Đang tải suất chiếu...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
            {/* Header Component */}
            <Header user={user} handleLogout={handleLogout} />

            {/* Main Content */}
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Navigation */}
                    <div className="mb-8">
                        <Link
                            to={`/movies/${id}`}
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại chi tiết phim
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-8 border border-white/20">
                        <h1 className="text-3xl font-bold text-center text-white mb-2 flex items-center justify-center gap-3">
                            <Ticket className="w-8 h-8 text-yellow-400" />
                            CHỌN SUẤT CHIẾU
                        </h1>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-yellow-300">{movie?.title}</h2>
                            <p className="text-white/60 mt-2 flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4" />
                                {movie?.duration} phút • {movie?.genre}
                            </p>
                        </div>
                    </div>

                    {showtimes.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 text-center border border-white/20">
                            <div className="text-white/70 text-lg mb-4">🎬 Chưa có suất chiếu cho phim này</div>
                            <Link
                                to={`/movies/${id}`}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors shadow-lg"
                            >
                                Quay lại trang phim
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Date Selection */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-6 border border-white/20">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-yellow-400" />
                                    Chọn Ngày
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {getAvailableDates().map((date) => (
                                        <button
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            className={`px-4 py-3 rounded-lg border-2 transition-all transform hover:scale-105 ${selectedDate === date
                                                ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-lg"
                                                : "border-white/20 bg-white/5 text-white/80 hover:border-yellow-300 hover:text-yellow-300"
                                                }`}
                                        >
                                            <div className="font-semibold text-sm">{formatDate(date)}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Showtimes List */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                    Suất Chiếu - {selectedDate && formatDate(selectedDate)}
                                </h3>

                                <div className="grid gap-4">
                                    {getShowtimesByDate().map((showtime) => (
                                        <div
                                            key={showtime.showtimeID}
                                            className="border-2 border-white/10 rounded-xl p-4 hover:border-yellow-400 hover:bg-yellow-400/10 transition-all duration-300"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                                <div className="mb-3 md:mb-0">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-yellow-300">
                                                                {formatTime(showtime.startTime)}
                                                            </div>
                                                            <div className="text-sm text-white/60">
                                                                ~{formatTime(showtime.endTime)}
                                                            </div>
                                                        </div>
                                                        <div className="border-l border-white/20 h-12"></div>
                                                        <div>
                                                            <div className="font-semibold text-white text-lg">
                                                                {showtime.room?.roomName}
                                                            </div>
                                                            <div className="text-sm text-white/60">
                                                                {showtime.description || "Suất chiếu thường"}
                                                            </div>
                                                            <div className="text-xs text-white/40 mt-1 flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                {showtime.room?.totalSeats} ghế
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleSelectShowtime(showtime.showtimeID)}
                                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 font-semibold whitespace-nowrap shadow-lg"
                                                >
                                                    Chọn Suất
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {getShowtimesByDate().length === 0 && selectedDate && (
                                    <div className="text-center py-8 text-white/60">
                                        Không có suất chiếu nào vào ngày {formatDate(selectedDate)}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Movie Info Footer */}
                    {movie && (
                        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <img
                                    src={movie.imageUrl || "https://via.placeholder.com/100x150?text=Poster"}
                                    alt={movie.title}
                                    className="w-20 h-28 object-cover rounded-lg border-2 border-white/20"
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/100x150?text=Poster+Not+Found";
                                    }}
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">{movie.title}</h3>
                                    <p className="text-white/60 text-sm mt-1">{movie.genre}</p>
                                    <p className="text-white/50 text-sm mt-2 line-clamp-2">
                                        {movie.description}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-white/60">Thời lượng</div>
                                    <div className="font-semibold text-yellow-300">{movie.duration} phút</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Component */}
            <Footer />
        </div>
    );
}

export default SelectShowtime;