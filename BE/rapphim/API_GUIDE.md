# API Guide - Hệ thống Đặt Vé Xem Phim

## Cấu hình Database
Trước khi chạy ứng dụng, hãy tạo database PostgreSQL:
```sql
CREATE DATABASE rapphim_db;
```

## Base URL
```
http://localhost:8080
```

## 1. Authentication APIs

### 1.1 Đăng ký tài khoản
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
```

**Roles có thể sử dụng:**
- `CUSTOMER` - Khách hàng
- `STAFF` - Nhân viên
- `ADMIN` - Quản trị viên
- `GUEST` - Khách

### 1.2 Đăng nhập
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@rapphim.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
```

## 2. Movie APIs

### 2.1 Lấy danh sách tất cả phim
**GET** `/api/movies`

**Response:**
```json
[
  {
    "movieID": 1,
    "title": "Avengers: Endgame",
    "genre": "Action, Adventure, Drama",
    "duration": 181,
    "description": "After the devastating events of Avengers: Infinity War...",
    "releaseDate": "2019-04-26",
    "totalTicketLove": 150,
    "showtimes": [],
    "reviews": []
  }
]
```

### 2.2 Lấy thông tin phim theo ID
**GET** `/api/movies/{id}`

**Response:**
```json
{
  "movieID": 1,
  "title": "Avengers: Endgame",
  "genre": "Action, Adventure, Drama",
  "duration": 181,
  "description": "After the devastating events of Avengers: Infinity War...",
  "releaseDate": "2019-04-26",
  "totalTicketLove": 150,
  "showtimes": [],
  "reviews": []
}
```

### 2.3 Tìm kiếm phim theo tên
**GET** `/api/movies/search?title=Avengers`

### 2.4 Lấy phim theo thể loại
**GET** `/api/movies/genre/Action`

### 2.5 Lấy phim phổ biến nhất
**GET** `/api/movies/popular`

### 2.6 Tạo phim mới (Admin)
**POST** `/api/movies`
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Spider-Man: No Way Home",
  "genre": "Action, Adventure, Sci-Fi",
  "duration": 148,
  "description": "Peter Parker seeks help from Doctor Strange...",
  "releaseDate": "2021-12-17"
}
```

### 2.7 Cập nhật phim (Admin)
**PUT** `/api/movies/{id}`
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Spider-Man: No Way Home",
  "genre": "Action, Adventure, Sci-Fi",
  "duration": 148,
  "description": "Updated description...",
  "releaseDate": "2021-12-17"
}
```

### 2.8 Xóa phim (Admin)
**DELETE** `/api/movies/{id}`
**Headers:** `Authorization: Bearer {token}`

## 3. Showtime APIs

### 3.1 Lấy tất cả lịch chiếu
**GET** `/api/showtimes`

**Response:**
```json
[
  {
    "showtimeID": 1,
    "startTime": "14:30:00",
    "endTime": "17:31:00",
    "showtimeDate": "2025-10-02",
    "description": "Afternoon show",
    "movie": {
      "movieID": 1,
      "title": "Avengers: Endgame",
      "genre": "Action, Adventure, Drama",
      "duration": 181
    },
    "room": {
      "roomID": 1,
      "roomName": "Theater 1",
      "totalSeats": 100
    },
    "tickets": []
  }
]
```

### 3.2 Lấy lịch chiếu theo ID
**GET** `/api/showtimes/{id}`

### 3.3 Lấy lịch chiếu theo phim
**GET** `/api/showtimes/movie/{movieId}`

### 3.4 Lấy lịch chiếu theo ngày
**GET** `/api/showtimes/date/2025-10-02`

### 3.5 Tạo lịch chiếu mới (Admin/Staff)
**POST** `/api/showtimes`
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "startTime": "14:30:00",
  "endTime": "17:31:00",
  "showtimeDate": "2025-10-02",
  "description": "Afternoon show",
  "movieId": 1,
  "roomId": 1
}
```

### 3.6 Cập nhật lịch chiếu (Admin/Staff)
**PUT** `/api/showtimes/{id}`
**Headers:** `Authorization: Bearer {token}`

### 3.7 Xóa lịch chiếu (Admin/Staff)
**DELETE** `/api/showtimes/{id}`
**Headers:** `Authorization: Bearer {token}`

## 4. Room APIs

### 4.1 Lấy danh sách phòng chiếu
**GET** `/api/rooms/api/rooms`

**Response:**
```json
[
  {
    "roomID": 1,
    "roomName": "Theater 1",
    "totalSeats": 100,
    "layout": "Standard layout",
    "seats": [],
    "showtimes": []
  }
]
```

### 4.2 Lấy thông tin phòng theo ID
**GET** `/api/rooms/{id}`

### 4.3 Lấy danh sách ghế trong phòng
**GET** `/api/rooms/{id}/seats`

**Response:**
```json
[
  {
    "seatID": 1,
    "seatNumber": "A1",
    "status": "AVAILABLE",
    "room": {
      "roomID": 1,
      "roomName": "Theater 1"
    }
  },
  {
    "seatID": 2,
    "seatNumber": "A2",
    "status": "BOOKED",
    "room": {
      "roomID": 1,
      "roomName": "Theater 1"
    }
  }
]
```

### 4.4 Lấy ghế trống trong phòng
**GET** `/api/rooms/{id}/available-seats`

### 4.5 Tạo phòng mới (Admin)
**POST** `/api/rooms`
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "roomName": "Theater 2",
  "totalSeats": 120,
  "layout": "Premium layout with reclining seats"
}
```

### 4.6 Cập nhật phòng (Admin)
**PUT** `/api/rooms/{id}`
**Headers:** `Authorization: Bearer {token}`

### 4.7 Xóa phòng (Admin)
**DELETE** `/api/rooms/{id}`
**Headers:** `Authorization: Bearer {token}`

## 5. Ticket APIs

### 5.1 Xem vé của tôi
**GET** `/api/tickets/my-tickets`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "ticketID": 1,
    "price": 120000.0,
    "status": "ACTIVE",
    "bookingDate": "2025-10-02",
    "showTime": "14:30:00",
    "customer": {
      "userID": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "room": {
      "roomID": 1,
      "roomName": "Theater 1"
    },
    "showtime": {
      "showtimeID": 1,
      "startTime": "14:30:00",
      "showtimeDate": "2025-10-02"
    },
    "seat": {
      "seatID": 1,
      "seatNumber": "A1"
    }
  }
]
```

### 5.2 Lấy thông tin vé theo ID
**GET** `/api/tickets/{id}`
**Headers:** `Authorization: Bearer {token}`

### 5.3 Đặt vé (Hỗ trợ nhiều ghế)
**POST** `/api/tickets/book`
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "showtimeId": 1,
  "seatIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tickets booked successfully",
  "tickets": [
    {
      "ticketID": 1,
      "price": 120000.0,
      "status": "ACTIVE",
      "bookingDate": "2025-11-23",
      "showTime": "14:30:00",
      "customer": {
        "userID": 1,
        "name": "John Doe"
      },
      "seat": {
        "seatID": 1,
        "seatNumber": "A1"
      }
    },
    {
      "ticketID": 2,
      "price": 120000.0,
      "status": "ACTIVE",
      "bookingDate": "2025-11-23",
      "showTime": "14:30:00",
      "customer": {
        "userID": 1,
        "name": "John Doe"
      },
      "seat": {
        "seatID": 2,
        "seatNumber": "A2"
      }
    }
  ],
  "totalTickets": 2,
  "totalAmount": 240000.0
}
```

**Lưu ý:**
- Giá vé được tính tự động: `showtime.basePrice × seat.priceMultiplier`
- Có thể đặt nhiều ghế cùng lúc bằng cách truyền mảng `seatIds`
- Tất cả ghế phải AVAILABLE và thuộc cùng phòng của suất chiếu

### 5.4 Hủy vé
**PUT** `/api/tickets/{id}/cancel`
**Headers:** `Authorization: Bearer {token}`

## 6. Combo APIs

### 6.1 Lấy danh sách combo
**GET** `/api/combos`

**Response:**
```json
[
  {
    "comboID": 1,
    "nameCombo": "Combo Couple",
    "price": 180000.0,
    "description": "2 bắp rang bơ lớn + 2 nước ngọt lớn"
  }
]
```

### 6.2 Lấy combo theo ID
**GET** `/api/combos/{id}`

### 6.3 Tìm kiếm combo
**GET** `/api/combos/search?name=Couple`

### 6.4 Tạo combo mới (Admin)
**POST** `/api/combos`
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "nameCombo": "Combo Family",
  "price": 350000.0,
  "description": "4 bắp rang bơ lớn + 4 nước ngọt lớn + kẹo"
}
```

### 6.5 Cập nhật combo (Admin)
**PUT** `/api/combos/{id}`
**Headers:** `Authorization: Bearer {token}`

### 6.6 Xóa combo (Admin)
**DELETE** `/api/combos/{id}`
**Headers:** `Authorization: Bearer {token}`

## 7. Review APIs

### 7.1 Lấy đánh giá theo phim
**GET** `/api/reviews/movie/{movieId}`

**Response:**
```json
[
  {
    "reviewID": 1,
    "star": 5,
    "comment": "Excellent movie! Great visual effects and storyline.",
    "customer": {
      "userID": 1,
      "name": "John Doe"
    },
    "movie": {
      "movieID": 1,
      "title": "Avengers: Endgame"
    }
  }
]
```

### 7.2 Lấy đánh giá của tôi
**GET** `/api/reviews/my-reviews`
**Headers:** `Authorization: Bearer {token}`


### 7.5 Xóa đánh giá
**DELETE** `/api/reviews/{id}`
**Headers:** `Authorization: Bearer {token}`

## 8. Payment APIs (MoMo Integration)

### 8.1 Tạo thanh toán MoMo
**POST** `/api/payments/create`
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "ticketIds": [1, 2, 3],
  "returnUrl": "http://localhost:3000/payment/result"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": 1,
  "orderId": "ORDER_1732348800000",
  "amount": 360000.0,
  "paymentUrl": "https://test-payment.momo.vn/v2/gateway/pay?t=...",
  "message": "Payment created successfully. Redirect to paymentUrl to complete payment."
}
```

**Workflow:**
1. User đặt vé → Nhận danh sách `ticketIds`
2. Gọi API create payment với `ticketIds`
3. Nhận `paymentUrl` và redirect user đến MoMo để thanh toán
4. User thanh toán trên MoMo
5. MoMo callback về server (IPN)
6. MoMo redirect user về `returnUrl` kèm kết quả

### 8.2 Callback từ MoMo (IPN - Server to Server)
**POST** `/api/payments/momo-callback`

Endpoint này được MoMo gọi tự động sau khi user thanh toán. Không cần authentication.

**Request Body từ MoMo:**
```json
{
  "partnerCode": "MOMO",
  "orderId": "ORDER_1732348800000",
  "requestId": "uuid-string",
  "amount": 360000,
  "orderInfo": "Thanh toan ve xem phim - 3 ve",
  "orderType": "momo_wallet",
  "transId": 3845612374,
  "resultCode": 0,
  "message": "Successful.",
  "payType": "qr",
  "responseTime": 1732348900000,
  "extraData": "",
  "signature": "abc123..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Callback processed successfully"
}
```

**Result Codes:**
- `0`: Thanh toán thành công
- `1006`: Transaction không tìm thấy
- `9000`: Giao dịch bị từ chối
- Các mã khác: Xem tài liệu MoMo

### 8.3 Kiểm tra trạng thái thanh toán
**GET** `/api/payments/status/{orderId}`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "paymentId": 1,
  "orderId": "ORDER_1732348800000",
  "amount": 360000.0,
  "status": "COMPLETED",
  "resultCode": 0,
  "message": "Successful.",
  "momoTransId": "3845612374",
  "createdAt": "2025-11-23T10:00:00",
  "updatedAt": "2025-11-23T10:05:00"
}
```

**Payment Status:**
- `PENDING`: Đang chờ thanh toán
- `COMPLETED`: Thanh toán thành công
- `FAILED`: Thanh toán thất bại
- `CANCELLED`: Đã hủy
- `EXPIRED`: Hết hạn

### 8.4 Lấy lịch sử thanh toán của tôi
**GET** `/api/payments/my-payments`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "paymentID": 1,
    "orderId": "ORDER_1732348800000",
    "amount": 360000.0,
    "method": "MOMO",
    "status": "COMPLETED",
    "momoTransId": "3845612374",
    "createdAt": "2025-11-23T10:00:00",
    "updatedAt": "2025-11-23T10:05:00",
    "tickets": [
      {
        "ticketID": 1,
        "seatNumber": "A1",
        "price": 120000.0
      }
    ]
  }
]
```

## 9. Admin APIs

### 8.1 Lấy tất cả vé (Admin)
**GET** `/api/admin/tickets`
**Headers:** `Authorization: Bearer {token}`

### 9.2 Lấy tất cả người dùng (Admin)
**GET** `/api/admin/users`
**Headers:** `Authorization: Bearer {token}`

### 9.3 Thống kê hàng ngày (Admin)
**GET** `/api/admin/statistics/daily`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "ticketsSoldToday": 25,
  "todayRevenue": 3000000.0
}
```

### 9.4 Thống kê doanh thu theo khoảng thời gian (Admin)
**GET** `/api/admin/statistics/revenue?startDate=2025-10-01&endDate=2025-10-02`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "startDate": "2025-10-01",
  "endDate": "2025-10-02",
  "totalRevenue": 5500000.0
}
```

### 9.5 Cập nhật quyền người dùng (Admin)
**PUT** `/api/admin/users/{id}/role?role=STAFF`
**Headers:** `Authorization: Bearer {token}`

## 10. Error Responses

### 10.1 Unauthorized (401)
```json
{
  "timestamp": "2025-10-02T10:15:30.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource"
}
```

### 10.2 Forbidden (403)
```json
{
  "timestamp": "2025-10-02T10:15:30.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access is denied"
}
```

### 10.3 Not Found (404)
```json
{
  "timestamp": "2025-10-02T10:15:30.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Movie not found with id: 999"
}
```

### 10.4 Bad Request (400)
```json
{
  "timestamp": "2025-10-02T10:15:30.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Email is already taken!"
}
```

## 11. Postman Collection

### 10.1 Environment Variables
Tạo environment trong Postman với các biến:
```
baseUrl: http://localhost:8080
token: {{auth_token}}
```

### 11.2 Pre-request Script cho Authentication
Thêm script này vào Pre-request Script của các request cần authentication:
```javascript
// Lấy token từ environment variable
var token = pm.environment.get("token");
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + token
    });
}
```

### 11.3 Test Script cho Login
Thêm script này vào Test tab của login request:
```javascript
// Lưu token vào environment variable
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("userId", jsonData.id);
    pm.environment.set("userRole", jsonData.role);
}
```

## 12. Workflow Examples

### 12.1 Quy trình đặt vé và thanh toán của khách hàng
1. **Đăng ký/Đăng nhập:** `POST /api/auth/register` hoặc `POST /api/auth/login` → Nhận JWT token
2. **Xem danh sách phim:** `GET /api/movies`
3. **Xem lịch chiếu của phim:** `GET /api/showtimes/movie/{movieId}`
4. **Xem layout ghế và ghế trống:** `GET /api/rooms/{roomId}/seats`
5. **Đặt vé (nhiều ghế):** `POST /api/tickets/book` với `seatIds: [1, 2, 3]` → Nhận danh sách `ticketIds`
6. **Tạo payment MoMo:** `POST /api/payments/create` với `ticketIds` → Nhận `paymentUrl`
7. **Redirect user đến MoMo:** Mở `paymentUrl` trong browser
8. **User thanh toán trên MoMo**
9. **MoMo callback IPN:** MoMo tự động gọi `/api/payments/momo-callback` để cập nhật trạng thái
10. **MoMo redirect user về:** User quay lại `returnUrl` của frontend
11. **Kiểm tra kết quả:** `GET /api/payments/status/{orderId}`
12. **Xem vé đã đặt:** `GET /api/tickets/my-tickets`

### 12.2 Quy trình quản lý của Admin
1. Đăng nhập với quyền Admin: `POST /api/auth/login`
2. Tạo phim mới: `POST /api/movies`
3. Tạo phòng chiếu: `POST /api/rooms`
4. Tạo lịch chiếu: `POST /api/showtimes`
5. Xem thống kê: `GET /api/admin/statistics/daily`
6. Quản lý người dùng: `GET /api/admin/users`
7. Xem lịch sử thanh toán: `GET /api/payments/my-payments`

## 13. Database Schema

Ứng dụng sử dụng PostgreSQL với các bảng chính:
- `users` - Thông tin người dùng
- `movies` - Thông tin phim
- `rooms` - Phòng chiếu
- `seats` - Ghế ngồi
- `showtimes` - Lịch chiếu
- `tickets` - Vé đã đặt
- `combos` - Combo bắp nước
- `promotions` - Mã khuyến mãi
- `payments` - Thanh toán
- `reviews` - Đánh giá phim

**Payment-Ticket Relationship:** Many-to-Many (một payment có thể chứa nhiều vé)

## 14. Security

### 13.1 JWT Token
- Token có thời hạn 24 giờ (86400000 ms)
- Token được tạo với secret key 256-bit an toàn
- Token phải được gửi trong header Authorization với format: `Bearer {token}`

### 13.2 Role-based Access Control
- **ADMIN**: Toàn quyền truy cập
- **STAFF**: Quản lý lịch chiếu, xác nhận vé
- **CUSTOMER**: Đặt vé, xem phim, đánh giá
- **GUEST**: Chỉ xem thông tin phim

### 13.3 Password Encryption
- Mật khẩu được mã hóa bằng BCrypt
- Không bao giờ trả về mật khẩu trong response

### 14.4 MoMo Integration Security
- Sử dụng HMAC SHA256 để ký và verify signature
- Validate signature từ MoMo callback để đảm bảo request hợp lệ
- Sử dụng MoMo Sandbox credentials để test
- Production cần đăng ký MoMo Business và nhận credentials chính thức

## 15. Notes

- Tất cả timestamps sử dụng format ISO 8601
- Giá vé tính bằng VND (Vietnam Dong)
- Các trường ngày tháng sử dụng format: `YYYY-MM-DD`
- Các trường thời gian sử dụng format: `HH:mm:ss`
- API hỗ trợ CORS cho phép truy cập từ frontend
- Giá vé tự động tính bằng: `basePrice × priceMultiplier`
- Hỗ trợ đặt nhiều vé cùng lúc với `seatIds` array
- MoMo Sandbox: https://test-payment.momo.vn
- MoMo API Documentation: https://developers.momo.vn
