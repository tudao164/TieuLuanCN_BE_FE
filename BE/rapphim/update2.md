## 1. API Mới - Cách Sử Dụng

### 1.1. Tạo Review Phim (Endpoint Mới)

**Endpoint:** `POST http://localhost:8080/api/reviews`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "star": 5,
  "comment": "Amazing movie with great special effects!",
  "movieId": 1
}
```

**Response Success (200 OK):**
```json
{
  "reviewID": 1,
  "star": 5,
  "comment": "Amazing movie with great special effects!",
  "customer": {
    "userID": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "movie": {
    "movieID": 1,
    "title": "Spider-Man: No Way Home",
    "genre": "Action, Adventure, Sci-Fi"
  }
}
```

**Response Error (400 Bad Request):**

**Trường hợp 1: Chưa xem phim**
```json
{
  "error": "You can only review movies that you have watched. Please purchase a ticket and wait until the showtime has passed."
}
```

**Trường hợp 2: Đã review rồi**
```json
{
  "error": "You have already reviewed this movie"
}
```

**Trường hợp 3: Phim không tồn tại**
```json
{
  "error": "Movie not found"
}
```

### 1.2 Lấy đánh giá theo phim
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

### 1.3 Lấy đánh giá của tôi
**GET** `/api/reviews/my-reviews`
**Headers:** `Authorization: Bearer {token}`


### 1.4 Xóa đánh giá
**DELETE** `/api/reviews/{id}`
**Headers:** `Authorization: Bearer {token}`


---

## 2. Quy Trình Review Phim

```
User muốn review phim
        ↓
1. User đăng nhập → Nhận JWT token
        ↓
2. User mua vé phim → Tạo Ticket với Showtime
        ↓
3. Đợi suất chiếu kết thúc
   (showtime.showtimeDate + showtime.endTime < hiện tại)
        ↓
4. Gọi POST /api/reviews với JSON body
        ↓
5. System kiểm tra:
   ✓ User đã mua vé phim này?
   ✓ Suất chiếu đã kết thúc?
   ✓ User chưa review phim này trước đó?
        ↓
6. Nếu tất cả OK → Tạo review thành công
   Nếu không → Trả về error message
```

---

## 3. Các Quy Tắc Nghiệp Vụ

### 3.1. Điều Kiện Để Review Phim:
✅ User phải đăng nhập (có JWT token)  
✅ User phải đã mua vé phim đó (có ticket)  
✅ Vé không bị hủy (status != CANCELLED)  
✅ Suất chiếu phải đã kết thúc  
✅ User chưa review phim này trước đó  

### 3.2. Kiểm Tra Suất Chiếu Đã Kết Thúc:
```
IF (showtime.showtimeDate < currentDate) 
   THEN → Đã qua ngày chiếu ✓

OR IF (showtime.showtimeDate == currentDate 
       AND showtime.endTime < currentTime)
   THEN → Cùng ngày nhưng đã qua giờ kết thúc ✓

ELSE → Chưa xem phim ✗
```

### 3.3. Không Cho Phép:
❌ Review phim chưa từng xem  
❌ Review phim đã mua vé nhưng chưa đến giờ chiếu  
❌ Review lại phim đã review trước đó  
❌ Review với vé đã bị hủy  

