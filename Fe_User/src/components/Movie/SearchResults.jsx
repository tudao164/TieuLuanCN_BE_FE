import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Film, Clock, Calendar, Star, MapPin, Home, Play, X } from 'lucide-react';
import Header from '../layout/Header';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { results, searchQuery } = location.state || {};
    const [selectedTrailer, setSelectedTrailer] = useState(null);

    // Nếu không có kết quả, chuyển hướng về trang chủ
    if (!results || !searchQuery) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Header />
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center text-white">
                        <h2 className="text-2xl font-bold mb-4">Không có kết quả tìm kiếm</h2>
                        <button
                            onClick={() => navigate('/home')}
                            className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition-all"
                        >
                            Quay về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const openTrailer = (movie) => {
        if (movie.trailerUrl) {
            setSelectedTrailer({
                url: movie.trailerUrl,
                title: movie.title
            });
        } else {
            alert(`Trailer cho phim "${movie.title}" chưa có sẵn`);
        }
    };

    const closeTrailer = () => {
        setSelectedTrailer(null);
    };

    const formatDuration = (minutes) => {
        if (!minutes) return "Đang cập nhật";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h${mins > 0 ? ` ${mins}p` : ''}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Đang cập nhật";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getAgeRatingColor = (age) => {
        if (!age) return 'bg-gray-500';
        if (age.includes('18')) return 'bg-red-500';
        if (age.includes('16')) return 'bg-orange-500';
        if (age.includes('13')) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
            {/* Header Component */}
            <Header />

            {/* Trailer Modal */}
            {selectedTrailer && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20">
                        <div className="flex justify-between items-center p-4 border-b border-white/20">
                            <h3 className="text-lg font-bold text-white">Trailer: {selectedTrailer.title}</h3>
                            <button
                                onClick={closeTrailer}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="aspect-w-16 aspect-h-9">
                                <iframe
                                    width="100%"
                                    height="400"
                                    src={selectedTrailer.url}
                                    title={`Trailer ${selectedTrailer.title}`}
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

            {/* Simple Header */}
            <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/home')}
                                className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
                            >
                                <Home className="w-5 h-5" />
                                Trang chủ
                            </button>
                        </div>

                        <div className="text-center flex-1">
                            <h1 className="text-xl font-bold text-white">
                                Kết quả tìm kiếm: <span className="text-yellow-400">"{searchQuery}"</span>
                            </h1>
                        </div>

                        <div className="w-20"></div> {/* For balance */}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="container mx-auto px-4 py-8 flex-1">
                {results.length === 0 ? (
                    <div className="text-center py-16">
                        <Film className="w-24 h-24 text-white/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy phim phù hợp</h3>
                        <p className="text-white/60 mb-6">
                            Không có phim nào khớp với từ khóa "<span className="text-yellow-400">"{searchQuery}"</span>"
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-white/10 text-white px-6 py-2 rounded-full hover:bg-white/20 transition-all"
                            >
                                Thử từ khóa khác
                            </button>
                            <button
                                onClick={() => navigate('/book-ticket-result')}
                                className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-yellow-400 transition-all"
                            >
                                Xem tất cả phim
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {results.map((movie) => (
                            <div
                                key={movie.movieID}
                                className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all hover:transform hover:scale-105 group"
                            >
                                {/* Movie Poster */}
                                <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                                    {movie.imageUrl ? (
                                        <img
                                            src={movie.imageUrl}
                                            alt={movie.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <Film className="w-16 h-16 text-white/40" />
                                    )}

                                    {/* Age Rating Badge */}
                                    {movie.age && (
                                        <div className={`absolute top-3 left-3 ${getAgeRatingColor(movie.age)} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
                                            {movie.age}
                                        </div>
                                    )}

                                    {/* Total Ticket Love */}
                                    {movie.totalTicketLove > 0 && (
                                        <div className="absolute top-3 right-3 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            {movie.totalTicketLove}
                                        </div>
                                    )}

                                    {/* Trailer Play Button */}
                                    {movie.trailerUrl && (
                                        <button
                                            onClick={() => openTrailer(movie)}
                                            className="absolute bottom-3 right-3 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                        </button>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                                        {movie.title}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        {/* Genre */}
                                        {movie.genre && (
                                            <div className="flex items-center gap-2 text-white/70 text-sm">
                                                <Film className="w-4 h-4" />
                                                <span className="line-clamp-1">{movie.genre}</span>
                                            </div>
                                        )}

                                        {/* Duration */}
                                        {movie.duration && (
                                            <div className="flex items-center gap-2 text-white/70 text-sm">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatDuration(movie.duration)}</span>
                                            </div>
                                        )}

                                        {/* Release Date */}
                                        {movie.releaseDate && (
                                            <div className="flex items-center gap-2 text-white/70 text-sm">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(movie.releaseDate)}</span>
                                            </div>
                                        )}

                                        {/* Description Preview */}
                                        {movie.description && (
                                            <p className="text-white/60 text-xs line-clamp-2 leading-relaxed mt-2">
                                                {movie.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Xem Trailer Button */}
                                        <button
                                            onClick={() => openTrailer(movie)}
                                            disabled={!movie.trailerUrl}
                                            className="flex-1 bg-yellow-500 text-gray-900 text-center py-2 px-3 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-all flex items-center justify-center gap-1 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                        >
                                            <Play className="w-4 h-4" />
                                            Trailer
                                        </button>

                                        {/* Đặt Vé Button */}
                                        <Link
                                            to={`/select-showtime/${movie.movieID}`}
                                            className="flex-1 bg-green-500 text-white text-center py-2 px-3 rounded-lg text-sm font-semibold hover:bg-green-400 transition-all flex items-center justify-center gap-1"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Đặt vé
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                {results.length > 0 && (
                    <div className="mt-12 text-center">
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4">Không tìm thấy phim bạn muốn?</h3>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="bg-white/10 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all font-semibold"
                                >
                                    🔍 Tìm kiếm lại
                                </button>
                                <button
                                    onClick={() => navigate('/book-ticket-result')}
                                    className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-400 transition-all"
                                >
                                    🎬 Xem tất cả phim
                                </button>
                                <button
                                    onClick={() => navigate('/home')}
                                    className="bg-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-600 transition-all"
                                >
                                    🏠 Về trang chủ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;