import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MovieSearch = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8080/api/movies/search?title=${encodeURIComponent(query)}`
            );
            setResults(response.data);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm phim:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            {/* Thanh tìm kiếm */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Tìm phim theo tên..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
            </div>

            {/* Kết quả */}
            {loading && <p className="mt-4 text-center text-purple-700">Đang tìm kiếm...</p>}

            {!loading && results.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {results.map((movie) => (
                        <Link
                            key={movie.movieID}
                            to={`/movies/${movie.movieID}`}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:scale-105 transform transition-all"
                        >
                            <img
                                src={movie.posterUrl || "https://via.placeholder.com/300x450?text=Poster"}
                                alt={movie.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-2 text-center">
                                <h3 className="text-sm font-semibold text-purple-700 line-clamp-2">{movie.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">Ra mắt: {movie.releaseDate}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && results.length === 0 && query && (
                <p className="mt-4 text-center text-gray-500">Không tìm thấy phim nào</p>
            )}
        </div>
    );
};

export default MovieSearch;
