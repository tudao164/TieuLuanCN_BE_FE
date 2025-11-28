import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Profile from "./pages/Auth/Profile";
import VerifyOTP from "./pages/Auth/VerifyOTP";
import ResetPassword from "./pages/Auth/ResetPassword";
import Header from "./components/layout/Header";
import MovieList from "./components/Movie/MovieList";
import MovieDetail from "./components/Movie/MovieDetail";
import MovieSearch from "./components/Movie/MovieSearch";
import ComboList from "./pages/Combo/ComboList";
import ComboCard from "./components/Combo/ComboCard";
import InputField from "./components/Login/InputField";
import SelectShowtime from "./components/ShowTime/SelectShowtime";
import BookTicket from "./components/Ticket/BookTicket";
import SearchResults from "./components/Movie/SearchResults";
import BookTicketResult from "./components/Ticket/BookTicketResult";
import Payment from './components/Payment/Payment';
import PaymentResult from './components/Payment/PaymentResult';
import MyTickets from './components/Ticket/MyTickets';

function App() {
  const [user, setUser] = useState(null);

  // Load user info từ localStorage khi app khởi chạy
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const token = localStorage.getItem("token");
        const userName = localStorage.getItem("userName");
        const userEmail = localStorage.getItem("userEmail");
        const userRole = localStorage.getItem("userRole");
        const userId = localStorage.getItem("userId");

        if (token && userName) {
          setUser({
            id: userId,
            name: userName,
            email: userEmail,
            role: userRole,
            token: token
          });
        }
      } catch (error) {
        console.error("Lỗi khi load user từ localStorage:", error);
      }
    };

    loadUserFromStorage();
  }, []);

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

  // Hàm cập nhật user info (sau khi login)
  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <BrowserRouter>

      <Routes>
        {/* Các trang CÓ Header */}
        <Route path="/home" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Header user={user} handleLogout={handleLogout} />
            <Home />
          </div>
        } />

        <Route path="/movielist" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Header user={user} handleLogout={handleLogout} />
            <MovieList />
          </div>
        } />

        <Route path="/movies/:id" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Header user={user} handleLogout={handleLogout} />
            <MovieDetail />
          </div>
        } />

        <Route path="/search-results" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Header user={user} handleLogout={handleLogout} />
            <SearchResults />
          </div>
        } />

        <Route path="/book-ticket-result" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Header user={user} handleLogout={handleLogout} />
            <BookTicketResult />
          </div>
        } />

        <Route path="/dat-combo" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Header user={user} handleLogout={handleLogout} />
            <ComboList />
          </div>
        } />

        <Route path="/profile" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Header user={user} handleLogout={handleLogout} />
            <Profile />
          </div>
        } />

        {/* Các trang KHÔNG CÓ Header (Auth pages) */}
        <Route path="/" element={<Login updateUser={updateUser} />} />
        <Route path="/login" element={<Login updateUser={updateUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP updateUser={updateUser} />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Các route khác */}
        <Route path="/search" element={<MovieSearch />} />
        <Route path="/select-showtime/:id" element={<SelectShowtime user={user} setUser={setUser} />} />
        <Route path="/bookticket/:id" element={<BookTicket user={user} setUser={setUser} />} />
        <Route path="/combocard" element={<ComboCard />} />

        {/* Test Components */}
        <Route path="/header" element={<Header user={user} handleLogout={handleLogout} />} />
        <Route path="/input-file" element={<InputField />} />

        <Route path="/payment" element={<Payment user={user} setUser={setUser} />} />
        <Route path="/payment-result" element={<PaymentResult user={user} setUser={setUser} />} />

        <Route path="/my-tickets" element={<MyTickets user={user} setUser={setUser} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;