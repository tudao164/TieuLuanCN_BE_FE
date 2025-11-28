# Hệ thống Đặt Vé Xem Phim - Backend API

## Mô tả

Đây là backend API cho hệ thống đặt vé xem phim được xây dựng bằng Java Spring Boot. Hệ thống cung cấp các chức năng quản lý phim, lịch chiếu, đặt vé, quản lý người dùng và thống kê.

## Công nghệ sử dụng

- **Java 21**
- **Spring Boot 3.5.6**
- **Spring Security** với JWT Authentication
- **Spring Data JPA**
- **PostgreSQL Database**
- **Lombok**
- **Maven**

## Cài đặt và Chạy

### Yêu cầu hệ thống
- Java 21 hoặc cao hơn
- PostgreSQL 12 hoặc cao hơn
- Maven 3.6 hoặc cao hơn

### Bước 1: Cấu hình Database
1. Tạo database PostgreSQL với tên `rapphim_db`
2. Đảm bảo PostgreSQL đang chạy trên port 5432
3. Username: `postgres`, Password: `123456`

### Bước 2: Clone và Build project
```bash
git clone <repository-url>
cd rapphim
mvn clean install
```

### Bước 3: Chạy ứng dụng
```bash
mvn spring-boot:run
```

Hoặc:
```bash
java -jar target/rapphim-0.0.1-SNAPSHOT.jar
```

Ứng dụng sẽ chạy trên port 8080: http://localhost:8080

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### Movies
- `GET /api/movies` - Lấy danh sách tất cả phim
- `GET /api/movies/{id}` - Lấy thông tin phim theo ID
- `GET /api/movies/search?title={title}` - Tìm kiếm phim theo tên
- `GET /api/movies/genre/{genre}` - Lấy phim theo thể loại
- `GET /api/movies/popular` - Lấy phim phổ biến nhất
- `POST /api/movies` - Tạo phim mới (Admin only)
- `PUT /api/movies/{id}` - Cập nhật phim (Admin only)
- `DELETE /api/movies/{id}` - Xóa phim (Admin only)

### Showtimes
- `GET /api/showtimes` - Lấy danh sách tất cả xuất chiếu
- `GET /api/showtimes/{id}` - Lấy xuất chiếu theo ID
- `GET /api/showtimes/movie/{movieId}` - Lấy xuất chiếu theo phim
- `GET /api/showtimes/date/{date}` - Lấy xuất chiếu theo ngày
- `POST /api/showtimes` - Tạo xuất chiếu mới (Admin/Staff)
- `PUT /api/showtimes/{id}` - Cập nhật xuất chiếu (Admin/Staff)
- `DELETE /api/showtimes/{id}` - Xóa xuất chiếu (Admin/Staff)

### Tickets
- `GET /api/tickets/my-tickets` - Lấy danh sách vé của tôi
- `GET /api/tickets/{id}` - Lấy thông tin vé theo ID
- `POST /api/tickets/book` - Đặt vé
- `PUT /api/tickets/{id}/cancel` - Hủy vé

### Rooms
- `GET /api/rooms` - Lấy danh sách phòng chiếu
- `GET /api/rooms/{id}` - Lấy thông tin phòng theo ID
- `GET /api/rooms/{id}/seats` - Lấy danh sách ghế trong phòng
- `GET /api/rooms/{id}/available-seats` - Lấy ghế trống trong phòng
- `POST /api/rooms` - Tạo phòng mới (Admin)
- `PUT /api/rooms/{id}` - Cập nhật phòng (Admin)
- `DELETE /api/rooms/{id}` - Xóa phòng (Admin)

### Combos
- `GET /api/combos` - Lấy danh sách combo
- `GET /api/combos/{id}` - Lấy combo theo ID
- `GET /api/combos/search?name={name}` - Tìm combo theo tên
- `POST /api/combos` - Tạo combo mới (Admin)
- `PUT /api/combos/{id}` - Cập nhật combo (Admin)
- `DELETE /api/combos/{id}` - Xóa combo (Admin)

### Promotions
- `GET /api/promotions` - Lấy danh sách khuyến mãi
- `GET /api/promotions/active` - Lấy khuyến mãi đang hoạt động
- `GET /api/promotions/{id}` - Lấy khuyến mãi theo ID
- `GET /api/promotions/code/{code}` - Lấy khuyến mãi theo mã
- `POST /api/promotions/validate?code={code}` - Kiểm tra mã khuyến mãi
- `POST /api/promotions` - Tạo khuyến mãi mới (Admin)
- `PUT /api/promotions/{id}` - Cập nhật khuyến mãi (Admin)
- `DELETE /api/promotions/{id}` - Xóa khuyến mãi (Admin)

### Reviews
- `GET /api/reviews/movie/{movieId}` - Lấy đánh giá của phim
- `GET /api/reviews/movie/{movieId}/average` - Lấy điểm trung bình của phim
- `GET /api/reviews/my-reviews` - Lấy đánh giá của tôi
- `POST /api/reviews/movie/{movieId}` - Tạo đánh giá mới
- `PUT /api/reviews/{id}` - Cập nhật đánh giá
- `DELETE /api/reviews/{id}` - Xóa đánh giá

### Admin
- `GET /api/admin/tickets` - Lấy tất cả vé (Admin only)
- `GET /api/admin/users` - Lấy tất cả người dùng (Admin only)
- `GET /api/admin/statistics/daily` - Thống kê theo ngày (Admin only)
- `GET /api/admin/statistics/revenue` - Thống kê doanh thu (Admin only)
- `PUT /api/admin/users/{id}/role` - Cập nhật quyền người dùng (Admin only)

## Phân quyền

### ADMIN
- Toàn quyền truy cập tất cả API
- Quản lý phim, xuất chiếu, phòng chiếu
- Xem thống kê và báo cáo
- Quản lý người dùng

### STAFF
- Quản lý xuất chiếu
- Xác nhận vé
- Xem thông tin khách hàng

### CUSTOMER
- Xem phim và xuất chiếu
- Đặt vé
- Hủy/Đổi vé của mình
- Đánh giá phim
- Xem lịch sử đặt vé

### GUEST
- Xem thông tin phim
- Xem xuất chiếu
- Đăng ký tài khoản

## Tài khoản mặc định

Hệ thống sẽ tự động tạo các tài khoản mặc định:

### Admin
- Email: `admin@rapphim.com`
- Password: `admin123`

### Staff
- Email: `staff@rapphim.com`
- Password: `staff123`

### Customer
- Email: `customer@rapphim.com`
- Password: `customer123`

## Cấu trúc Database

Hệ thống sử dụng PostgreSQL với các bảng chính:
- `users` - Thông tin người dùng
- `movies` - Thông tin phim
- `rooms` - Phòng chiếu
- `seats` - Ghế ngồi
- `showtimes` - Xuất chiếu
- `tickets` - Vé đã đặt
- `combos` - Combo đồ ăn
- `promotions` - Mã khuyến mãi
- `reviews` - Đánh giá phim
- `payments` - Thanh toán

## JWT Security

API sử dụng JWT (JSON Web Token) để xác thực:
- Token có thời hạn 24 giờ
- Header: `Authorization: Bearer <token>`
- Secret key đủ mạnh để tránh lỗi JWT

## Lưu ý

1. Đảm bảo PostgreSQL đang chạy trước khi start ứng dụng
2. Database sẽ được tự động tạo bảng khi chạy lần đầu
3. Dữ liệu mẫu sẽ được tự động khởi tạo
4. Kiểm tra logs để debug các lỗi có thể xảy ra

## Liên hệ

Nếu có vấn đề gì, vui lòng tạo issue hoặc liên hệ với team phát triển.