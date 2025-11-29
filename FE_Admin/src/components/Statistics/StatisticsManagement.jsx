import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    Film,
    Ticket,
    DollarSign,
    Calendar,
    TrendingUp,
    Download,
    Filter,
    RefreshCw,
    PieChart,
    LineChart,
    User,
    Clock,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';

const StatisticsManagement = () => {
    const [statistics, setStatistics] = useState({
        daily: {},
        revenue: {},
        allTickets: [],
        allUsers: []
    });
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_BASE_URL = 'http://localhost:8080/api';
    const ADMIN_API_URL = 'http://localhost:8080/api/admin';

    // Lấy JWT token
    const getAuthToken = () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    // Config axios với auth header
    const getAuthConfig = () => {
        const token = getAuthToken();
        return token ? {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        } : {};
    };


    const fetchDailyStatistics = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${ADMIN_API_URL}/statistics/daily`, getAuthConfig());
            setStatistics(prev => ({
                ...prev,
                daily: response.data || {}
            }));
        } catch (err) {
            console.error('Lỗi fetch daily statistics:', err);
            if (err.response?.status === 403) {
                setError('Bạn không có quyền truy cập thống kê admin');
            } else if (err.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                setError('Lỗi khi tải thống kê hàng ngày: ' + (err.response?.data?.message || err.message || 'Không thể kết nối đến server'));
            }
        } finally {
            setLoading(false);
        }
    };


    const fetchRevenueStatistics = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(
                `${ADMIN_API_URL}/statistics/revenue?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
                getAuthConfig()
            );
            setStatistics(prev => ({
                ...prev,
                revenue: response.data || {}
            }));
            setSuccess(`Đã tải thống kê doanh thu từ ${dateRange.startDate} đến ${dateRange.endDate}`);
        } catch (err) {
            console.error('Lỗi fetch revenue statistics:', err);
            setError('Lỗi khi tải thống kê doanh thu: ' + (err.response?.data?.message || err.message || 'Không thể kết nối đến server'));
        } finally {
            setLoading(false);
        }
    };

    // Fetch tất cả vé (Admin)
    const fetchAllTickets = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${ADMIN_API_URL}/tickets`, getAuthConfig());
            setStatistics(prev => ({
                ...prev,
                allTickets: response.data || []
            }));
        } catch (err) {
            console.error('Lỗi fetch all tickets:', err);
            setError('Lỗi khi tải danh sách vé: ' + (err.response?.data?.message || err.message || 'Không thể kết nối đến server'));
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${ADMIN_API_URL}/users`, getAuthConfig());
            setStatistics(prev => ({
                ...prev,
                allUsers: response.data || []
            }));
        } catch (err) {
            console.error('Lỗi fetch all users:', err);
            setError('Lỗi khi tải danh sách người dùng: ' + (err.response?.data?.message || err.message || 'Không thể kết nối đến server'));
        } finally {
            setLoading(false);
        }
    };

    // Load tất cả dữ liệu
    const loadAllData = async () => {
        setLoading(true);
        setError('');
        setSuccess('Đang tải dữ liệu thống kê...');

        try {
            await Promise.all([
                fetchDailyStatistics(),
                fetchRevenueStatistics(),
                fetchAllTickets(),
                fetchAllUsers()
            ]);
            setSuccess('Đã tải dữ liệu thống kê thành công!');
        } catch (err) {
            console.error('Lỗi loadAllData:', err);
            setError('Lỗi khi tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const tickets = statistics.allTickets || [];
        const users = statistics.allUsers || [];

        const activeTickets = tickets.filter(ticket => ticket.status === 'ACTIVE').length;
        const totalRevenue = tickets
            .filter(ticket => ticket.status === 'ACTIVE' || ticket.status === 'USED')
            .reduce((sum, ticket) => sum + (ticket.price || 0), 0);

        const customerUsers = users.filter(user => user.role === 'CUSTOMER').length;
        const staffUsers = users.filter(user => user.role === 'STAFF').length;
        const adminUsers = users.filter(user => user.role === 'ADMIN').length;

        return {
            activeTickets,
            totalRevenue,
            customerUsers,
            staffUsers,
            adminUsers,
            totalTickets: tickets.length,
            totalUsers: users.length
        };
    };

    const stats = calculateStats();

    // Format helpers
    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num || 0);
    };

    // Load data khi component mount
    useEffect(() => {
        loadAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load revenue stats khi date range thay đổi
    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            fetchRevenueStatistics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-6 border border-white/20">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                                <BarChart3 className="w-10 h-10" />
                                Báo Cáo Thống Kê
                            </h1>
                            <p className="text-white/70 mt-2">Quản lý và theo dõi hiệu suất hệ thống đặt vé</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={loadAllData}
                                disabled={loading}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Đang tải...' : 'Làm mới'}
                            </button>
                            {/* ĐÃ XÓA NÚT XUẤT EXCEL */}
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-white backdrop-blur-lg">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError('')} className="text-xl font-bold hover:text-red-300">×</button>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3 text-white backdrop-blur-lg">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1">{success}</span>
                        <button onClick={() => setSuccess('')} className="text-xl font-bold hover:text-green-300">×</button>
                    </div>
                )}

                {/* Date Range Filter */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-6 border border-white/20">
                    <div className="flex items-center gap-2 mb-4 text-white">
                        <Filter className="w-5 h-5" />
                        <h2 className="text-xl font-bold">Lọc Theo Thời Gian</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-white/80 mb-2 text-sm font-medium">Từ ngày</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 mb-2 text-sm font-medium">Đến ngày</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={fetchRevenueStatistics}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
                            >
                                <Filter className="w-5 h-5" />
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-6 border border-white/20">
                    <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 font-medium transition-all whitespace-nowrap ${activeTab === 'overview'
                                ? 'text-white border-b-2 border-blue-500'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4 inline mr-2" />
                            Tổng quan
                        </button>
                        <button
                            onClick={() => setActiveTab('revenue')}
                            className={`px-4 py-2 font-medium transition-all whitespace-nowrap ${activeTab === 'revenue'
                                ? 'text-white border-b-2 border-green-500'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <DollarSign className="w-4 h-4 inline mr-2" />
                            Doanh thu
                        </button>
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`px-4 py-2 font-medium transition-all whitespace-nowrap ${activeTab === 'tickets'
                                ? 'text-white border-b-2 border-yellow-500'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <Ticket className="w-4 h-4 inline mr-2" />
                            Vé đã đặt ({stats.totalTickets})
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 font-medium transition-all whitespace-nowrap ${activeTab === 'users'
                                ? 'text-white border-b-2 border-purple-500'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            Người dùng ({stats.totalUsers})
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                            <span className="ml-3 text-white">Đang tải dữ liệu...</span>
                        </div>
                    )}

                    {/* Overview Tab */}
                    {!loading && activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-3xl font-bold text-blue-300">{formatNumber(stats.activeTickets)}</div>
                                            <div className="text-blue-200 text-sm mt-1">Vé đang hoạt động</div>
                                        </div>
                                        <Ticket className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <div className="text-blue-300 text-xs mt-2">
                                        {statistics.daily.ticketsSoldToday ? `Hôm nay: ${formatNumber(statistics.daily.ticketsSoldToday)}` : 'Đang cập nhật...'}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-3xl font-bold text-green-300">{formatCurrency(stats.totalRevenue)}</div>
                                            <div className="text-green-200 text-sm mt-1">Tổng doanh thu</div>
                                        </div>
                                        <DollarSign className="w-8 h-8 text-green-400" />
                                    </div>
                                    <div className="text-green-300 text-xs mt-2">
                                        {statistics.daily.todayRevenue ? `Hôm nay: ${formatCurrency(statistics.daily.todayRevenue)}` : 'Đang cập nhật...'}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-3xl font-bold text-purple-300">{formatNumber(stats.customerUsers)}</div>
                                            <div className="text-purple-200 text-sm mt-1">Khách hàng</div>
                                        </div>
                                        <Users className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <div className="text-purple-300 text-xs mt-2">
                                        Tổng user: {formatNumber(statistics.allUsers.length)}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-3xl font-bold text-yellow-300">{formatNumber(stats.totalTickets)}</div>
                                            <div className="text-yellow-200 text-sm mt-1">Tổng vé</div>
                                        </div>
                                        <Ticket className="w-8 h-8 text-yellow-400" />
                                    </div>
                                    <div className="text-yellow-300 text-xs mt-2">
                                        Vé active: {formatNumber(stats.activeTickets)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Revenue Tab */}
                {!loading && activeTab === 'revenue' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Thống Kê Doanh Thu</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Doanh thu trong khoảng thời gian:</span>
                                        <span className="text-green-400 font-bold">
                                            {statistics.revenue.totalRevenue ? formatCurrency(statistics.revenue.totalRevenue) : '0 ₫'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Từ ngày:</span>
                                        <span className="text-white">{dateRange.startDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Đến ngày:</span>
                                        <span className="text-white">{dateRange.endDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Doanh Thu Hôm Nay</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Doanh thu:</span>
                                        <span className="text-green-400 font-bold">
                                            {statistics.daily.todayRevenue ? formatCurrency(statistics.daily.todayRevenue) : '0 ₫'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Số vé đã bán:</span>
                                        <span className="text-blue-400 font-bold">
                                            {statistics.daily.ticketsSoldToday || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Giá vé trung bình:</span>
                                        <span className="text-yellow-400 font-bold">
                                            {statistics.daily.ticketsSoldToday > 0 ? formatCurrency(statistics.daily.todayRevenue / statistics.daily.ticketsSoldToday) : '0 ₫'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tickets Tab */}
                {!loading && activeTab === 'tickets' && (
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Danh Sách Vé Đã Đặt ({stats.totalTickets})</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-white">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4">ID Vé</th>
                                            <th className="text-left py-3 px-4">Khách hàng</th>
                                            <th className="text-left py-3 px-4">Giá</th>
                                            <th className="text-left py-3 px-4">Trạng thái</th>
                                            <th className="text-left py-3 px-4">Ngày đặt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statistics.allTickets.slice(0, 10).map((ticket) => (
                                            <tr key={ticket.ticketID} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-3 px-4">#{ticket.ticketID}</td>
                                                <td className="py-3 px-4">
                                                    {ticket.customer?.name || 'N/A'}
                                                </td>
                                                <td className="py-3 px-4">{formatCurrency(ticket.price || 0)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${ticket.status === 'ACTIVE'
                                                        ? 'bg-green-500/20 text-green-300'
                                                        : 'bg-gray-500/20 text-gray-300'
                                                        }`}>
                                                        {ticket.status === 'ACTIVE' ? 'Đang hoạt động' : ticket.status || 'Không xác định'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{formatDate(ticket.bookingDate)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {statistics.allTickets.length === 0 && (
                                <div className="text-center py-8 text-white/50">
                                    <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Chưa có vé nào được đặt</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {!loading && activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
                                <div className="text-2xl font-bold text-blue-300 text-center">{formatNumber(stats.customerUsers)}</div>
                                <div className="text-blue-200 text-sm text-center mt-1">Khách hàng</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
                                <div className="text-2xl font-bold text-purple-300 text-center">{formatNumber(stats.staffUsers)}</div>
                                <div className="text-purple-200 text-sm text-center mt-1">Nhân viên</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
                                <div className="text-2xl font-bold text-green-300 text-center">{formatNumber(stats.adminUsers)}</div>
                                <div className="text-green-200 text-sm text-center mt-1">Quản trị viên</div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Danh Sách Người Dùng ({stats.totalUsers})</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-white">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4">ID</th>
                                            <th className="text-left py-3 px-4">Tên</th>
                                            <th className="text-left py-3 px-4">Email</th>
                                            <th className="text-left py-3 px-4">Vai trò</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statistics.allUsers.slice(0, 10).map((user) => (
                                            <tr key={user.userID} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-3 px-4">#{user.userID}</td>
                                                <td className="py-3 px-4">{user.name}</td>
                                                <td className="py-3 px-4">{user.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-300' :
                                                        user.role === 'STAFF' ? 'bg-blue-500/20 text-blue-300' :
                                                            'bg-green-500/20 text-green-300'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {statistics.allUsers.length === 0 && (
                                <div className="text-center py-8 text-white/50">
                                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Chưa có người dùng nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatisticsManagement;