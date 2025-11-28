import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QuickBooking = () => {
    const [movies, setMovies] = useState([]);
    const [dates, setDates] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedShowtime, setSelectedShowtime] = useState("");
    const [loading, setLoading] = useState({
        movies: false,
        dates: false,
        showtimes: false
    });
    const navigate = useNavigate();

    // Lấy danh sách phim từ API
    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(prev => ({ ...prev, movies: true }));
            try {
                const response = await axios.get('http://localhost:8080/api/movies');
                setMovies(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách phim:', error);
                alert('Không thể tải danh sách phim');
            } finally {
                setLoading(prev => ({ ...prev, movies: false }));
            }
        };
        fetchMovies();
    }, []);

    // Khi chọn phim, lấy danh sách ngày chiếu
    useEffect(() => {
        const fetchDates = async () => {
            if (!selectedMovie) {
                setDates([]);
                setShowtimes([]);
                setSelectedDate("");
                setSelectedShowtime("");
                return;
            }

            setLoading(prev => ({ ...prev, dates: true }));
            try {
                const response = await axios.get(`http://localhost:8080/api/showtimes/movie/${selectedMovie}`);
                const showtimesData = response.data;

                // Lấy danh sách ngày duy nhất từ các suất chiếu
                const uniqueDates = [...new Set(showtimesData.map(st => st.showtimeDate))].sort();
                setDates(uniqueDates);
                setShowtimes([]);
                setSelectedDate("");
                setSelectedShowtime("");
            } catch (error) {
                console.error('Lỗi khi lấy lịch chiếu:', error);
                alert('Không thể tải lịch chiếu cho phim này');
            } finally {
                setLoading(prev => ({ ...prev, dates: false }));
            }
        };
        fetchDates();
    }, [selectedMovie]);

    // Khi chọn ngày, lấy danh sách suất chiếu
    useEffect(() => {
        const fetchShowtimes = async () => {
            if (!selectedMovie || !selectedDate) {
                setShowtimes([]);
                setSelectedShowtime("");
                return;
            }

            setLoading(prev => ({ ...prev, showtimes: true }));
            try {
                const response = await axios.get(`http://localhost:8080/api/showtimes/movie/${selectedMovie}`);
                const allShowtimes = response.data;

                // Lọc suất chiếu theo ngày đã chọn
                const filteredShowtimes = allShowtimes.filter(st => st.showtimeDate === selectedDate);
                setShowtimes(filteredShowtimes);
                setSelectedShowtime("");
            } catch (error) {
                console.error('Lỗi khi lấy suất chiếu:', error);
                alert('Không thể tải suất chiếu');
            } finally {
                setLoading(prev => ({ ...prev, showtimes: false }));
            }
        };
        fetchShowtimes();
    }, [selectedMovie, selectedDate]);

    const handleBookNow = () => {
        if (!selectedMovie || !selectedDate || !selectedShowtime) {
            alert("Vui lòng chọn đầy đủ thông tin: Phim, Ngày và Suất chiếu");
            return;
        }

        // Chuyển hướng đến trang đặt vé với showtimeId
        navigate(`/bookticket/${selectedMovie}`, {
            state: { showtimeId: selectedShowtime }
        });
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

    return (
        <div className="w-full bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-lg">
            {/* Title */}
            <h2 className="text-xl font-extrabold text-yellow-300 whitespace-nowrap flex items-center gap-2">
                🎬 ĐẶT VÉ NHANH
            </h2>

            {/* Options */}
            <div className="flex flex-col lg:flex-row items-center gap-4 flex-1 justify-center w-full">

                {/* Chọn Phim */}
                <div className="relative min-w-[200px]">
                    <select
                        value={selectedMovie}
                        onChange={(e) => setSelectedMovie(e.target.value)}
                        className="w-full px-4 py-3 border border-white/20 rounded-lg text-white font-semibold text-sm bg-white/10 backdrop-blur-md shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all appearance-none"
                        disabled={loading.movies}
                    >
                        <option value="" className="text-gray-700">
                            {loading.movies ? "Đang tải..." : "1. Chọn Phim"}
                        </option>
                        {movies.map(movie => (
                            <option key={movie.movieID} value={movie.movieID} className="text-gray-700">
                                {movie.title}
                            </option>
                        ))}
                    </select>
                    {loading.movies && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                        </div>
                    )}
                </div>

                {/* Chọn Ngày */}
                <div className="relative min-w-[200px]">
                    <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 border border-white/20 rounded-lg text-white font-semibold text-sm bg-white/10 backdrop-blur-md shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all appearance-none"
                        disabled={!selectedMovie || loading.dates}
                    >
                        <option value="" className="text-gray-700">
                            {loading.dates ? "Đang tải..." : "2. Chọn Ngày"}
                        </option>
                        {dates.map(date => (
                            <option key={date} value={date} className="text-gray-700">
                                {formatDate(date)}
                            </option>
                        ))}
                    </select>
                    {loading.dates && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                        </div>
                    )}
                </div>

                {/* Chọn Suất */}
                <div className="relative min-w-[200px]">
                    <select
                        value={selectedShowtime}
                        onChange={(e) => setSelectedShowtime(e.target.value)}
                        className="w-full px-4 py-3 border border-white/20 rounded-lg text-white font-semibold text-sm bg-white/10 backdrop-blur-md shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all appearance-none"
                        disabled={!selectedDate || loading.showtimes}
                    >
                        <option value="" className="text-gray-700">
                            {loading.showtimes ? "Đang tải..." : "3. Chọn Suất"}
                        </option>
                        {showtimes.map(showtime => (
                            <option key={showtime.showtimeID} value={showtime.showtimeID} className="text-gray-700">
                                {formatTime(showtime.startTime)} - {showtime.room?.roomName}
                            </option>
                        ))}
                    </select>
                    {loading.showtimes && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                        </div>
                    )}
                </div>

                {/* Nút Đặt Vé */}
                <button
                    onClick={handleBookNow}
                    disabled={!selectedMovie || !selectedDate || !selectedShowtime}
                    className="
                        px-6 py-3 rounded-lg 
                        bg-gradient-to-r from-yellow-400 to-orange-400 
                        text-gray-900 font-bold text-sm shadow-lg
                        hover:from-yellow-300 hover:to-orange-300 
                        transform hover:scale-105 transition-all duration-200
                        whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed
                        disabled:hover:scale-100
                    "
                >
                    ĐẶT NGAY
                </button>
            </div>
        </div>
    );
};

export default QuickBooking;