

### 2.1. API Tạo Suất Chiếu (CÓ THÊM TRƯỜNG)

**Endpoint:** `POST /api/showtimes`  
**Headers:** `Authorization: Bearer {token}`  
**Roles:** ADMIN, STAFF

**Request Body MỚI:**
```json
{
  "startTime": "14:30:00",
  "endTime": "17:31:00",
  "showtimeDate": "2025-10-02",
  "description": "Afternoon show",
  "basePrice": 120000.0,  ← THÊM MỚI (Optional, mặc định 100,000)
  "movieId": 1,
  "roomId": 1
}
```

**Response:**
```json
{
  "showtimeID": 1,
  "startTime": "14:30:00",
  "endTime": "17:31:00",
  "showtimeDate": "2025-10-02",
  "description": "Afternoon show",
  "basePrice": 120000.0,  ← THÊM MỚI
  "movie": {
    "movieID": 1,
    "title": "Avengers: Endgame"
  },
  "room": {
    "roomID": 1,
    "roomName": "Theater 1"
  }
}
```

---

### 2.2. API Cập Nhật Suất Chiếu (CÓ THÊM TRƯỜNG)

**Endpoint:** `PUT /api/showtimes/{id}`  
**Headers:** `Authorization: Bearer {token}`  
**Roles:** ADMIN, STAFF

**Request Body MỚI:**
```json
{
  "startTime": "19:00:00",
  "endTime": "22:01:00",
  "showtimeDate": "2025-10-03",
  "description": "Evening show",
  "basePrice": 150000.0,  ← CÓ THỂ CẬP NHẬT giá
  "movieId": 1,
  "roomId": 2
}
```

**Lưu ý:**
- Nếu không truyền `basePrice`, giá cũ sẽ được giữ nguyên
- Nếu truyền `basePrice`, giá mới sẽ được cập nhật


