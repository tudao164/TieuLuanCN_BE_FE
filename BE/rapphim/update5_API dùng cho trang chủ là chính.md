### Tao ghi lại 1 vài cái trong trang chủ gợi ý cách làm cho m thôi. Còn mấy cái kiểu tìm kiếm phim các thứ thì API_GUIDE có rồi nhá.

### 1. Lấy lịch chiếu theo phim
**GET** `/api/showtimes/movie/{movieId}`
--> API dùng kiểu khi ấn vào xem chi tiết phim có thể xem được các lịch chiếu của phim đó


### 2. Lấy lịch chiếu theo ngày
**GET** `/api/showtimes/date/2025-10-02`
--> API dùng kiểu khi ấn vào ngày trên lịch để xem các lịch chiếu trong ngày đó


### 3. Lấy danh sách phim đang chiếu (Now Showing)
**GET** `/api/showtimes/now-showing`

**Mô tả:** Lấy tất cả suất chiếu của các phim đang chiếu (từ hôm nay trở về trước)

**Response:** HTTP 200 OK
```json
[
  {
    "showtimeID": 1,
    "startTime": "19:30:00",
    "endTime": "21:45:00",
    "showtimeDate": "2025-11-23",
    "description": "Suất chiếu tối",
    "basePrice": 100000.0,
    "movie": {
      "movieID": 1,
      "title": "Avatar: The Way of Water",
      "genre": "Hành động, Phiêu lưu, Khoa học viễn tưởng",
      "duration": 192,
      "description": "Câu chuyện về gia đình Sully...",
      "releaseDate": "2025-11-20",
      "totalTicketLove": 150,
      "imageUrl": "https://example.com/avatar.jpg",
      "trailerUrl": "https://youtube.com/watch?v=..."
    },
    "room": {
      "roomID": 1,
      "roomName": "Room 1",
      "capacity": 100
    }
  },
  {
    "showtimeID": 2,
    "startTime": "14:00:00",
    "endTime": "16:30:00",
    "showtimeDate": "2025-11-23",
    "movie": {
      "movieID": 2,
      "title": "The Marvels",
      "genre": "Siêu anh hùng, Hành động",
      "duration": 150,
      "releaseDate": "2025-11-15"
    },
    "room": {
      "roomID": 2,
      "roomName": "Room 2"
    }
  }
]
```

**Sắp xếp:** Ngày mới nhất → cũ nhất, trong cùng ngày thì giờ muộn → sớm

**Use Case:**
- Hiển thị danh sách phim đang chiếu trên trang chủ
- Lọc phim có thể đặt vé ngay
- Hiển thị các suất chiếu hôm nay và các ngày đã qua


### 4. Lấy danh sách phim sắp chiếu (Upcoming)
**GET** `/api/showtimes/upcoming`

**Mô tả:** Lấy tất cả suất chiếu của các phim sắp chiếu (từ ngày mai trở đi)

**Response:** HTTP 200 OK
```json
[
  {
    "showtimeID": 10,
    "startTime": "20:00:00",
    "endTime": "22:15:00",
    "showtimeDate": "2025-11-24",
    "description": "Suất chiếu đầu tiên",
    "basePrice": 120000.0,
    "movie": {
      "movieID": 5,
      "title": "Dune: Part Three",
      "genre": "Khoa học viễn tưởng, Phiêu lưu",
      "duration": 165,
      "description": "Phần tiếp theo của Dune...",
      "releaseDate": "2025-11-25",
      "totalTicketLove": 0,
      "imageUrl": "https://example.com/dune3.jpg",
      "trailerUrl": "https://youtube.com/watch?v=..."
    },
    "room": {
      "roomID": 1,
      "roomName": "Room 1 - IMAX"
    }
  },
  {
    "showtimeID": 11,
    "startTime": "10:00:00",
    "endTime": "12:00:00",
    "showtimeDate": "2025-11-26",
    "movie": {
      "movieID": 6,
      "title": "Godzilla x Kong: The New Empire",
      "genre": "Hành động, Khoa học viễn tưởng",
      "duration": 115,
      "releaseDate": "2025-11-28"
    }
  }
]
```

**Sắp xếp:** Ngày gần nhất → xa nhất, trong cùng ngày thì giờ sớm → muộn

**Use Case:**
- Hiển thị phim sắp chiếu trên trang chủ
- Cho phép đặt vé trước cho các suất chiếu sắp tới
- Hiển thị lịch chiếu tương lai
