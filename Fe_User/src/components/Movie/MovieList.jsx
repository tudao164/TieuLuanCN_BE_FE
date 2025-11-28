import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MovieList = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTrailer, setSelectedTrailer] = useState(null);

    const openTrailer = (movie) => {
        if (movie.trailerUrl) {
            setSelectedTrailer(movie.trailerUrl);
        } else {
            alert(`Trailer cho phim "${movie.title}" chưa có sẵn`);
        }
    };

    const closeTrailer = () => {
        setSelectedTrailer(null);
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                console.log("🔄 Đang gọi API movies...");
                const response = await axios.get("http://localhost:8080/api/movies");
                console.log("✅ API Response:", response.data);

                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error("Dữ liệu phim không hợp lệ");
                }

                if (response.data.length === 0) {
                    setError("Không có phim nào trong cơ sở dữ liệu");
                    setMovies([]);
                    return;
                }

                const formattedMovies = response.data.map(movie => ({
                    ...movie,
                    movieID: movie.movieID || movie.id,
                    title: movie.title || "Không có tiêu đề",
                    posterUrl: movie.imageUrl || movie.posterUrl || "https://via.placeholder.com/300x450/4A5568/FFFFFF?text=No+Poster",
                    trailerUrl: movie.trailerUrl,
                    age: movie.age || "T13",
                    format: movie.format || "2D",
                    genre: movie.genre || "Chưa phân loại",
                    duration: movie.duration || 120,
                    releaseDate: movie.releaseDate || new Date().toISOString(),
                    totalTicketLove: movie.totalTicketLove || 0
                }));

                console.log("🎬 Movies formatted:", formattedMovies);
                setMovies(formattedMovies);

            } catch (error) {
                console.error("💥 Lỗi khi lấy danh sách phim:", error);
                setError("Không thể tải danh sách phim: " + (error.response?.data?.message || error.message));
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                    <div className="mt-4 text-white font-medium">Đang tải danh sách phim...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">❌ {error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
            {/* Modal Trailer */}
            {selectedTrailer && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-white/20">
                            <h3 className="text-lg font-bold text-white">Trailer Phim</h3>
                            <button
                                onClick={closeTrailer}
                                className="text-white/80 hover:text-white text-xl font-bold transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="aspect-w-16 aspect-h-9">
                                <iframe
                                    width="100%"
                                    height="400"
                                    src={selectedTrailer}
                                    title="Movie Trailer"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-lg"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
                    TẤT CẢ PHIM ĐANG CHIẾU
                </h2>

                {movies.length === 0 ? (
                    <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <div className="text-white/70 text-lg mb-2">🎭 Không có phim nào được tìm thấy</div>
                        <div className="text-white/50 text-sm">Vui lòng kiểm tra lại kết nối hoặc thử lại sau</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {movies.map((movie) => (
                            <div
                                key={movie.movieID}
                                className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
                            >
                                {/* Poster */}
                                <div className="relative">
                                    <img
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        className="w-full h-64 object-cover"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300x450/4A5568/FFFFFF?text=Poster+Not+Found";
                                        }}
                                    />

                                    {/* Nhãn tuổi */}
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                        {movie.age}
                                    </div>

                                    {/* Nhãn định dạng */}
                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                        {movie.format}
                                    </div>

                                    {/* Overlay sắp chiếu */}
                                    {new Date(movie.releaseDate) > new Date() && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-center">
                                            <span className="text-yellow-300 text-sm font-bold tracking-wider">
                                                🎉 SẮP CHIẾU
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Thông tin phim */}
                                <div className="p-4">
                                    <h3 className="text-white font-bold text-lg line-clamp-2 mb-3">
                                        {movie.title}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <p className="text-white/70 text-sm">
                                            🎭 {movie.genre}
                                        </p>
                                        <p className="text-white/70 text-sm">
                                            ⏱️ {movie.duration} phút
                                        </p>
                                        <p className="text-white/60 text-xs">
                                            📅 {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-yellow-300 font-medium text-sm flex items-center gap-1">
                                            ❤️ {movie.totalTicketLove} lượt thích
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-2">
                                        <button
                                            onClick={() => openTrailer(movie)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/10 backdrop-blur-md text-white text-sm rounded-lg hover:bg-white/20 border border-white/20 transition-all transform hover:scale-105"
                                        >
                                            <span>🎬</span>
                                            Trailer
                                        </button>
                                        <Link
                                            to={`/movies/${movie.movieID}`}
                                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold text-sm rounded-lg hover:from-yellow-300 hover:to-orange-300 transition-all transform hover:scale-105 shadow-lg text-center"
                                        >
                                            ĐẶT VÉ
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieList;