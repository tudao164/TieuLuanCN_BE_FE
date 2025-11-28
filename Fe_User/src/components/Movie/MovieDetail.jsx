import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [selectedTrailer, setSelectedTrailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // State cho tính năng thêm đánh giá
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        star: 5,
        comment: ""
    });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState("");

    // Hàm lấy thông tin user từ localStorage
    const getUserInfo = () => {
        try {
            const userData = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (userData && token) {
                const user = JSON.parse(userData);
                setUser(user);
                return user;
            }
            return null;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin user:', error);
            return null;
        }
    };

    // Hàm xử lý logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    // Lấy token
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Mở modal thêm đánh giá
    const openReviewModal = () => {
        const token = getToken();
        if (!token) {
            alert("Vui lòng đăng nhập để đánh giá phim");
            return;
        }
        setReviewForm({
            star: 5,
            comment: ""
        });
        setReviewError("");
        setShowReviewModal(true);
    };

    // Đóng modal thêm đánh giá
    const closeReviewModal = () => {
        setShowReviewModal(false);
        setReviewError("");
    };

    // Gửi đánh giá
    const submitReview = async () => {
        if (!movie) return;

        const token = getToken();
        if (!token) {
            setReviewError("Vui lòng đăng nhập để đánh giá phim");
            return;
        }

        if (!reviewForm.comment.trim()) {
            setReviewError("Vui lòng nhập nội dung đánh giá");
            return;
        }

        setReviewLoading(true);
        setReviewError("");

        try {
            console.log("🔄 Đang gửi review...", {
                star: reviewForm.star,
                comment: reviewForm.comment,
                movieId: movie.movieID
            });

            const response = await axios.post(
                "http://localhost:8080/api/reviews",
                {
                    star: reviewForm.star,
                    comment: reviewForm.comment,
                    movieId: movie.movieID
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            console.log("✅ Review gửi thành công:", response.data);

            // Cập nhật lại danh sách đánh giá
            const reviewsResponse = await axios.get(`http://localhost:8080/api/reviews/movie/${id}`);
            setReviews(reviewsResponse.data);

            closeReviewModal();
            alert("Đánh giá của bạn đã được gửi thành công!");

        } catch (error) {
            console.error("💥 Lỗi khi gửi đánh giá:", error);
            if (error.response?.data?.error) {
                setReviewError(error.response.data.error);
            } else if (error.response?.status === 401) {
                setReviewError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            } else if (error.response?.status === 404) {
                setReviewError("API endpoint không tồn tại. Vui lòng kiểm tra lại đường dẫn.");
            } else {
                setReviewError("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.");
            }
        } finally {
            setReviewLoading(false);
        }
    };

    // Tính điểm trung bình
    const calculateAverageRating = () => {
        if (!reviews || reviews.length === 0) return 0;
        const total = reviews.reduce((sum, review) => sum + (review.star || 0), 0);
        return (total / reviews.length).toFixed(1);
    };

    useEffect(() => {
        // Lấy thông tin user khi component mount
        getUserInfo();

        const fetchMovieData = async () => {
            try {
                setLoading(true);

                // Fetch movie details
                const movieResponse = await axios.get(`http://localhost:8080/api/movies/${id}`);
                setMovie(movieResponse.data);

                // Fetch showtimes for this movie
                try {
                    const showtimesResponse = await axios.get(`http://localhost:8080/api/showtimes/movie/${id}`);
                    setShowtimes(showtimesResponse.data);
                } catch (error) {
                    console.error("Lỗi khi lấy lịch chiếu:", error);
                    setShowtimes([]);
                }

                // Fetch reviews for this movie
                try {
                    const reviewsResponse = await axios.get(`http://localhost:8080/api/reviews/movie/${id}`);
                    setReviews(reviewsResponse.data);
                } catch (error) {
                    console.error("Lỗi khi lấy đánh giá:", error);
                    setReviews([]);
                }

            } catch (error) {
                console.error("Lỗi khi lấy chi tiết phim:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovieData();
    }, [id]);

    const openTrailer = () => {
        if (movie?.trailerUrl) {
            setSelectedTrailer(movie.trailerUrl);
        } else {
            alert("Trailer cho phim này chưa có sẵn");
        }
    };

    const closeTrailer = () => {
        setSelectedTrailer(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Đang cập nhật";
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <div className="text-white/80 text-lg">Đang tải chi tiết phim...</div>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-4">Phim không tồn tại</div>
                    <Link to="/home" className="text-white/80 hover:text-white transition-colors">
                        ← Quay lại danh sách phim
                    </Link>
                </div>
            </div>
        );
    }

    const averageRating = calculateAverageRating();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">


            {/* Trailer Modal */}
            {selectedTrailer && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20">
                        <div className="flex justify-between items-center p-4 border-b border-white/20">
                            <h3 className="text-lg font-bold text-white">Trailer: {movie.title}</h3>
                            <button
                                onClick={closeTrailer}
                                className="text-gray-400 hover:text-white text-xl font-bold transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="aspect-w-16 aspect-h-9">
                                <iframe
                                    width="100%"
                                    height="400"
                                    src={movie.trailerUrl}
                                    title={`Trailer ${movie.title}`}
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

            {/* Modal Thêm Đánh Giá */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-white/20">
                            <h3 className="text-lg font-bold text-white">Đánh Giá Phim</h3>
                            <button
                                onClick={closeReviewModal}
                                className="text-white/80 hover:text-white text-xl font-bold transition-colors"
                                disabled={reviewLoading}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <h4 className="text-white font-semibold mb-2">{movie.title}</h4>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-white/70 text-sm">Đánh giá:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewForm(prev => ({ ...prev, star }))}
                                                className={`text-2xl ${star <= reviewForm.star ? 'text-yellow-400' : 'text-white/30'} transition-colors hover:text-yellow-300`}
                                                disabled={reviewLoading}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-yellow-400 font-semibold">({reviewForm.star}/5)</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-white/70 text-sm mb-2">Nhận xét của bạn:</label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                    placeholder="Chia sẻ cảm nhận của bạn về phim..."
                                    className="w-full h-32 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 resize-none"
                                    disabled={reviewLoading}
                                />
                            </div>

                            {reviewError && (
                                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                                    <p className="text-red-300 text-sm">{reviewError}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={closeReviewModal}
                                    disabled={reviewLoading}
                                    className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20 transition-colors disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={submitReview}
                                    disabled={reviewLoading}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold rounded-lg hover:from-yellow-300 hover:to-orange-300 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {reviewLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                            Đang gửi...
                                        </div>
                                    ) : (
                                        "Gửi Đánh Giá"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Navigation */}
                    <Link
                        to="/home"
                        className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại danh sách phim
                    </Link>

                    {/* Movie Content */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - Poster */}
                        <div className="lg:w-2/5">
                            <div className="relative">
                                <img
                                    src={movie.imageUrl || "https://via.placeholder.com/400x600?text=No+Poster"}
                                    alt={movie.title}
                                    className="rounded-2xl shadow-2xl w-full h-auto border-4 border-white/20"
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/400x600?text=Poster+Not+Found";
                                    }}
                                />
                                {/* Age Rating Badge */}
                                {movie.age && (
                                    <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                                        {movie.age}
                                    </div>
                                )}

                                {/* Điểm đánh giá trung bình */}
                                {reviews.length > 0 && (
                                    <div className="absolute top-4 right-4 bg-green-600 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1">
                                        ⭐ {averageRating}
                                        <span className="text-white/80 text-xs">({reviews.length})</span>
                                    </div>
                                )}
                            </div>

                            {/* Nút Thêm Đánh Giá bên dưới poster */}
                            <button
                                onClick={openReviewModal}
                                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg rounded-lg hover:from-blue-400 hover:to-purple-400 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                            >
                                <span>⭐</span>
                                Thêm Đánh Giá
                            </button>
                        </div>

                        {/* Right Column - Movie Info */}
                        <div className="lg:w-3/5">
                            {/* Movie Content Container */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
                                {/* Movie Title and Basic Info */}
                                <div className="mb-8">
                                    <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                                        {movie.title}
                                    </h1>

                                    {/* Movie Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {/* Genre */}
                                        {movie.genre && (
                                            <div className="flex items-center text-white/80">
                                                <span className="font-medium mr-2">🎭 Thể loại:</span>
                                                <span className="text-white font-semibold">{movie.genre}</span>
                                            </div>
                                        )}

                                        {/* Duration */}
                                        {movie.duration && (
                                            <div className="flex items-center text-white/80">
                                                <span className="font-medium mr-2">⏱️ Thời lượng:</span>
                                                <span className="text-white font-semibold">{movie.duration} phút</span>
                                            </div>
                                        )}

                                        {/* Release Date */}
                                        {movie.releaseDate && (
                                            <div className="flex items-center text-white/80">
                                                <span className="font-medium mr-2">📅 Ngày ra mắt:</span>
                                                <span className="text-white font-semibold">{formatDate(movie.releaseDate)}</span>
                                            </div>
                                        )}

                                        {/* Total Ticket Love */}
                                        {movie.totalTicketLove !== undefined && (
                                            <div className="flex items-center text-white/80">
                                                <span className="font-medium mr-2">❤️ Lượt thích:</span>
                                                <span className="text-white font-semibold">{movie.totalTicketLove}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Age Rating */}
                                    {movie.age && (
                                        <div className="mb-6">
                                            <div className="inline-flex items-center bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-400/30">
                                                <span className="text-sm font-semibold text-yellow-300">
                                                    🎯 Phim dành cho khán giả từ đủ {movie.age.replace('T', '')} tuổi trở lên
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                {(movie.genre || movie.duration || movie.releaseDate) && (
                                    <div className="border-t border-white/20 my-8"></div>
                                )}

                                {/* Description */}
                                {movie.description && (
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-4">🎬 NỘI DUNG PHIM</h2>
                                        <p className="text-white/80 leading-relaxed text-lg">
                                            {movie.description}
                                        </p>
                                    </div>
                                )}

                                {/* Divider nếu có description */}
                                {movie.description && (
                                    <div className="border-t border-white/20 my-8"></div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    {/* Nút trailer */}
                                    {movie.trailerUrl && (
                                        <button
                                            onClick={openTrailer}
                                            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
                                        >
                                            <span className="text-xl">🎬</span>
                                            Xem Trailer
                                        </button>
                                    )}

                                    {/* Nút đặt vé */}
                                    <Link
                                        to={`/select-showtime/${movie.movieID}`}
                                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
                                    >
                                        <span className="text-xl">🎫</span>
                                        Chọn Suất Chiếu
                                    </Link>
                                </div>

                                {/* Showtimes Preview */}
                                {showtimes.length > 0 && (
                                    <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <span>📅</span>
                                            Lịch Chiếu Sớm
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {showtimes.slice(0, 4).map((showtime) => (
                                                <div
                                                    key={showtime.showtimeID}
                                                    className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/20 hover:border-white/40 transition-colors"
                                                >
                                                    <div className="text-sm font-semibold text-white">
                                                        {formatDate(showtime.showtimeDate)}
                                                    </div>
                                                    <div className="text-xs text-white/70">
                                                        🕐 {showtime.startTime?.substring(0, 5)} - {showtime.room?.roomName}
                                                    </div>
                                                    <div className="text-xs text-yellow-300 font-semibold mt-1">
                                                        💰 {(showtime.basePrice || 0).toLocaleString('vi-VN')} ₫
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {showtimes.length > 4 && (
                                            <div className="text-sm text-white/60 mt-3">
                                                +{showtimes.length - 4} suất chiếu khác
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reviews Section - ĐÃ ĐƯỢC CẢI THIỆN */}
                                <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <span>⭐</span>
                                            Đánh Giá ({reviews.length})
                                        </h3>
                                        {reviews.length > 0 && (
                                            <div className="text-yellow-400 font-bold text-lg">
                                                ⭐ {averageRating}/5
                                            </div>
                                        )}
                                    </div>

                                    {reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviews.map((review) => (
                                                <div
                                                    key={review.reviewID}
                                                    className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`text-lg ${i < review.star ? "text-yellow-400" : "text-white/30"
                                                                        }`}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                            <span className="text-yellow-400 font-bold ml-2">
                                                                {review.star}.0
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-white/60">
                                                            {review.customer?.fullName || review.customer?.name || "Ẩn danh"}
                                                        </span>
                                                    </div>
                                                    <p className="text-white/80 text-sm leading-relaxed">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-white/60 text-lg mb-4">
                                                🎬 Chưa có đánh giá nào
                                            </div>
                                            <button
                                                onClick={openReviewModal}
                                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-400 hover:to-purple-400 transition-all"
                                            >
                                                Hãy là người đầu tiên đánh giá
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Component */}
            <Footer />
        </div>
    );
};

export default MovieDetail;