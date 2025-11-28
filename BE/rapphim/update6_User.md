# 📚 User Management API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication
Tất cả các API trong tài liệu này yêu cầu JWT token (trừ khi được chỉ định là public).

**Header format:**
```
Authorization: Bearer {your_jwt_token}
```

---

## 📋 Danh sách API

### 1. Lấy danh sách tất cả users (Admin only)
**GET** `/api/users`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
    {
        "userID": 1,
        "name": "Admin",
        "email": "admin@rapphim.com",
        "role": "ADMIN",
        "tickets": [],
        "reviews": [],
        "payments": [],
        "enabled": true,
        "username": "admin@rapphim.com",
        "authorities": [
            {
                "authority": "ROLE_ADMIN"
            }
        ],
        "accountNonExpired": true,
        "accountNonLocked": true,
        "credentialsNonExpired": true
    },
    {
        "userID": 2,
        "name": "Customer",
        "email": "customer@rapphim.com",
        "role": "CUSTOMER",
        "tickets": [],
        "reviews": [],
        "payments": [],
        "enabled": true,
        "username": "customer@rapphim.com",
        "authorities": [
            {
                "authority": "ROLE_CUSTOMER"
            }
        ],
        "accountNonExpired": true,
        "accountNonLocked": true,
        "credentialsNonExpired": true
    }
]
```

**Permissions:**
- Tất cả user đã đăng nhập có thể gọi API này (trong môi trường dev)
- Trong production nên giới hạn chỉ ADMIN

---

### 2. Lấy thông tin user theo ID
**GET** `/api/users/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Example Request:**
```bash
GET http://localhost:8080/api/users/1
```

**Response:** `200 OK`
```json
{
    "userID": 1,
    "name": "Admin",
    "email": "admin@rapphim.com",
    "role": "ADMIN",
    "tickets": [],
    "reviews": [],
    "payments": [],
    "enabled": true,
    "username": "admin@rapphim.com",
    "authorities": [
        {
            "authority": "ROLE_ADMIN"
        }
    ],
    "accountNonExpired": true,
    "accountNonLocked": true,
    "credentialsNonExpired": true
}
```

**Response:** `404 Not Found`
```json
{
    "error": "User not found"
}
```

---

### 3. Lấy thông tin user hiện tại (Profile)
**GET** `/api/users/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
    "userID": 1,
    "name": "Admin",
    "email": "admin@rapphim.com",
    "role": "ADMIN",
    "tickets": [
        {
            "ticketID": 1,
            "price": 150000.0,
            "status": "ACTIVE",
            "bookingDate": "2025-11-23",
            "showTime": "14:30"
        }
    ],
    "reviews": [],
    "payments": [],
    "enabled": true,
    "username": "admin@rapphim.com",
    "authorities": [
        {
            "authority": "ROLE_ADMIN"
        }
    ],
    "accountNonExpired": true,
    "accountNonLocked": true,
    "credentialsNonExpired": true
}
```

**Use Case:**
- Hiển thị thông tin profile của user đang đăng nhập
- Lấy lịch sử đặt vé, đánh giá, thanh toán của user

---

### 4. Cập nhật thông tin user theo ID
**PUT** `/api/users/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "John Doe Updated",
    "email": "john.updated@example.com"
}
```

**Permissions:**
- Admin có thể update bất kỳ user nào
- User thường chỉ có thể update chính mình

**Response:** `200 OK`
```json
{
    "userID": 1,
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "role": "CUSTOMER",
    "tickets": [],
    "reviews": [],
    "payments": [],
    "enabled": true,
    "username": "john.updated@example.com",
    "authorities": [
        {
            "authority": "ROLE_CUSTOMER"
        }
    ],
    "accountNonExpired": true,
    "accountNonLocked": true,
    "credentialsNonExpired": true
}
```

**Response:** `400 Bad Request`
```json
{
    "error": "Email is already taken!"
}
```

```json
{
    "error": "Username is already taken!"
}
```

```json
{
    "error": "You don't have permission to update this user"
}
```

**Validation Rules:**
- Email phải unique (không trùng với user khác)
- Name phải unique (không trùng với user khác)
- Chỉ Admin hoặc chính user đó mới có thể update

---

### 5. Cập nhật thông tin user hiện tại
**PUT** `/api/users/me`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "New Name",
    "email": "newemail@example.com"
}
```

**Response:** `200 OK`
```json
{
    "userID": 1,
    "name": "New Name",
    "email": "newemail@example.com",
    "role": "CUSTOMER",
    "tickets": [],
    "reviews": [],
    "payments": [],
    "enabled": true,
    "username": "newemail@example.com",
    "authorities": [
        {
            "authority": "ROLE_CUSTOMER"
        }
    ],
    "accountNonExpired": true,
    "accountNonLocked": true,
    "credentialsNonExpired": true
}
```

**Use Case:**
- User tự cập nhật thông tin cá nhân
- Không cần biết userID, tự động lấy từ JWT token

---

### 6. Đổi mật khẩu
**PUT** `/api/users/change-password`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "oldPassword": "currentpassword123",
    "newPassword": "newpassword456"
}
```

**Response:** `200 OK`
```json
{
    "message": "Password changed successfully"
}
```

**Response:** `400 Bad Request`
```json
{
    "error": "Old password is incorrect"
}
```

**Validation:**
- oldPassword phải đúng với password hiện tại
- newPassword sẽ được mã hóa bằng BCrypt trước khi lưu

**Security Notes:**
- Password cũ phải được verify trước khi cho phép đổi
- Password mới được hash bằng BCrypt
- User phải đăng nhập lại sau khi đổi mật khẩu (JWT cũ vẫn valid trong 24h)

---

### 7. Xóa user (Admin only)
**DELETE** `/api/users/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Example Request:**
```bash
DELETE http://localhost:8080/api/users/5
```

**Response:** `200 OK`
```json
{
    "message": "User deleted successfully"
}
```

**Response:** `400 Bad Request`
```json
{
    "error": "Only admin can delete users"
}
```

```json
{
    "error": "You cannot delete yourself"
}
```

```json
{
    "error": "User not found with id: 5"
}
```

**Permissions:**
- Chỉ ADMIN mới có thể xóa user
- Admin không thể tự xóa chính mình

**Cascade Delete:**
- Khi xóa user, các tickets, reviews, payments liên quan sẽ bị xóa theo (nếu có CascadeType.ALL)

---

### 8. Cập nhật role của user (Admin only)
**PUT** `/api/users/{id}/role?role={ROLE_NAME}`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `role`: ADMIN, STAFF, CUSTOMER, GUEST

**Example Request:**
```bash
PUT http://localhost:8080/api/users/2/role?role=STAFF
```

**Response:** `200 OK`
```json
{
    "userID": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STAFF",
    "tickets": [],
    "reviews": [],
    "payments": [],
    "enabled": true,
    "username": "john@example.com",
    "authorities": [
        {
            "authority": "ROLE_STAFF"
        }
    ],
    "accountNonExpired": true,
    "accountNonLocked": true,
    "credentialsNonExpired": true
}
```

**Response:** `400 Bad Request`
```json
{
    "error": "Only admin can change user roles"
}
```

```json
{
    "error": "User not found with id: 2"
}
```

**Available Roles:**
- `ADMIN` - Quản trị viên (toàn quyền)
- `STAFF` - Nhân viên (quản lý lịch chiếu, xác nhận vé)
- `CUSTOMER` - Khách hàng (đặt vé, xem phim, đánh giá)
- `GUEST` - Khách (chỉ xem thông tin)

---

