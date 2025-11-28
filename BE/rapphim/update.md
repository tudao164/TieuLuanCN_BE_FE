

## 1. Hướng Dẫn Sử Dụng

### 1.1. Upload Ảnh Poster

**Bước 1:** Upload ảnh lên Cloudinary
```
POST http://localhost:8080/api/upload/image
Content-Type: multipart/form-data

Key: file
Type: File
Value: [Chọn file ảnh]
```

**Response:**
```json
{
    "success": true,
    "message": "Upload ảnh thành công",
    "data": {
        "imageUrl": "https://res.cloudinary.com/dc1dhh35k/image/upload/v1234567890/rapphim/images/abc123.jpg",
        "filename": "spider-man-poster.jpg",
        "size": 245678,
        "mimetype": "image/jpeg"
    },
    "timestamp": "2025-11-20T10:30:40.724Z"
}
```

### 1.2. Upload Trailer Video

**Bước 1:** Upload video lên Cloudinary
```
POST http://localhost:8080/api/upload/video
Content-Type: multipart/form-data

Key: file
Type: File
Value: [Chọn file video]
```

**Response:**
```json
{
    "success": true,
    "message": "Upload video thành công",
    "data": {
        "videoUrl": "https://res.cloudinary.com/dc1dhh35k/video/upload/v1234567890/rapphim/trailers/xyz789.mp4",
        "filename": "spider-man-trailer.mp4",
        "size": 15678901,
        "mimetype": "video/mp4"
    },
    "timestamp": "2025-11-20T10:31:15.234Z"
}
```

### 1.3. Tạo Phim Mới với Ảnh và Trailer

**Endpoint:** `POST http://localhost:8080/api/movies`

**Request Body:**
```json
{
    "title": "Spider-Man: No Way Home",
    "genre": "Action, Adventure, Sci-Fi",
    "duration": 148,
    "description": "Peter Parker seeks help from Doctor Strange...",
    "releaseDate": "2021-12-17",
    "imageUrl": "https://res.cloudinary.com/dc1dhh35k/image/upload/v1234567890/rapphim/images/abc123.jpg",
    "trailerUrl": "https://res.cloudinary.com/dc1dhh35k/video/upload/v1234567890/rapphim/trailers/xyz789.mp4"
}
```

### 1.4. Cập Nhật Ảnh và Trailer của Phim

**Endpoint:** `PUT http://localhost:8080/api/movies/{id}`

**Request Body:**
```json
{
    "title": "Spider-Man: No Way Home",
    "genre": "Action, Adventure, Sci-Fi",
    "duration": 148,
    "description": "Peter Parker seeks help from Doctor Strange...",
    "releaseDate": "2021-12-17",
    "imageUrl": "https://res.cloudinary.com/dc1dhh35k/image/upload/v1234567890/rapphim/images/new-poster.jpg",
    "trailerUrl": "https://res.cloudinary.com/dc1dhh35k/video/upload/v1234567890/rapphim/trailers/new-trailer.mp4"
}
```

**Lưu ý:** 
- Có thể chỉ cập nhật imageUrl hoặc trailerUrl mà không cần cả hai
- Nếu không truyền imageUrl hoặc trailerUrl, giá trị cũ sẽ được giữ nguyên

---

