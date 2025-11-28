import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const UpcomingMovies = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcomingMovies = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/showtimes/upcoming");

                const uniqueMovies = [];
                const movieIds = new Set();

                response.data.forEach(showtime => {
                    if (!movieIds.has(showtime.movie.movieID)) {
                        movieIds.add(showtime.movie.movieID);
                        uniqueMovies.push({
                            ...showtime.movie,
                            firstShowtime: {
                                date: showtime.showtimeDate,
                                time: showtime.startTime,
                                price: showtime.basePrice
                            }
                        });
                    }
                });

                setShowtimes(uniqueMovies);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách phim sắp chiếu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUpcomingMovies();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa xác định";
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        return timeString.substring(0, 5);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                    <div className="mt-4 text-white font-medium">Đang tải phim sắp chiếu...</div>
                </div>
            </div>
        );
    }

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10 tracking-wider flex items-center justify-center gap-3">
                    PHIM SẮP CHIẾU
                </h2>

                {showtimes.length === 0 ? (
                    <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <p className="text-white/70 text-lg">🎭 Hiện chưa có phim sắp chiếu nào.</p>
                        <p className="text-white/50 text-sm mt-2">Hãy quay lại sau để cập nhật</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {showtimes.map((movie) => (
                            <Link
                                to={`/movies/${movie.movieID}`}
                                key={movie.movieID}
                                className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl block border border-white/20"
                            >
                                {/* Poster */}
                                <div className="relative">
                                    <img
                                        src={movie.imageUrl || "https://via.placeholder.com/300x450?text=No+Poster"}
                                        alt={movie.title}
                                        className="w-full h-64 object-cover"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
                                        }}
                                    />

                                    {/* Nhãn tuổi */}
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                        {movie.age || "T13"}
                                    </div>

                                    {/* Nhãn định dạng */}
                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                        {movie.format || "2D"}
                                    </div>

                                    {/* Overlay sắp chiếu */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-600/90 to-transparent p-4 text-center">
                                        <span className="text-white text-sm font-bold tracking-wider flex items-center justify-center gap-1">
                                            🚀 SẮP CHIẾU
                                        </span>
                                    </div>
                                </div>

                                {/* Thông tin phim */}
                                <div className="p-4">
                                    <h3 className="text-white font-bold text-base line-clamp-2 hover:text-yellow-300 transition-colors mb-3">
                                        {movie.title}
                                    </h3>

                                    <div className="space-y-2 mb-3">
                                        <p className="text-white/70 text-sm flex items-center gap-1">
                                            🎭 {movie.genre}
                                        </p>
                                        <p className="text-white/70 text-sm flex items-center gap-1">
                                            ⏱️ {movie.duration} phút
                                        </p>
                                        <p className="text-white/60 text-xs flex items-center gap-1">
                                            📅 {formatDate(movie.releaseDate)}
                                        </p>
                                    </div>

                                    {/* Hiển thị suất chiếu đầu tiên */}
                                    {movie.firstShowtime && (
                                        <div className="mt-3 bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/10">
                                            <p className="text-blue-300 text-xs font-semibold flex items-center gap-1 mb-1">
                                                🎯 Suất chiếu đầu
                                            </p>
                                            <p className="text-white/80 text-xs flex items-center gap-1">
                                                📅 {formatDate(movie.firstShowtime.date)} - 🕐 {formatTime(movie.firstShowtime.time)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-3 mb-4">
                                        <span className="text-yellow-300 font-medium text-sm flex items-center gap-1">
                                            ❤️ {movie.totalTicketLove || 0} yêu thích
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (movie.trailerUrl) {
                                                    window.open(movie.trailerUrl, '_blank');
                                                } else {
                                                    alert(`Trailer cho phim "${movie.title}" chưa có sẵn`);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/10 backdrop-blur-md text-white text-sm rounded-lg hover:bg-white/20 border border-white/20 transition-all transform hover:scale-105"
                                        >
                                            <span>🎥</span>
                                            Trailer
                                        </button>
                                        <Link
                                            to={`/movies/${movie.movieID}`}
                                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold text-sm rounded-lg hover:from-blue-300 hover:to-purple-400 transition-all transform hover:scale-105 shadow-lg text-center"
                                        >
                                            XEM THÊM
                                        </Link>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default UpcomingMovies;