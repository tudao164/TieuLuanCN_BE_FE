## 📝 API Examples

### 1. Đặt nhiều vé
```bash
POST http://localhost:8080/api/tickets/book \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
{
    "showtimeId": 1,
    "seatIds": [8,9],
    "comboIds": [1, 2],        // OPTIONAL, có thể không lựa combo
    "promotionCode": "WELCOME10"  // OPTIONAL, mã khuyến mãi (giảm 10%)
}
```
**Response:**
```json
{
    "totalAmount": 470000.0,
    "tickets": [
        {
            "ticketID": 8,
            "price": 235000.0,
            "status": "ACTIVE",
            "bookingDate": "2025-11-23",
            "showTime": "14:30",
            "customer": {
                "userID": 1,
                "name": "Admin",
                "email": "admin@rapphim.com",
                "role": "ADMIN",
                "enabled": true,
                "accountNonLocked": true,
                "accountNonExpired": true,
                "credentialsNonExpired": true,
                "authorities": [
                    {
                        "authority": "ROLE_ADMIN"
                    }
                ],
                "username": "admin@rapphim.com"
            },
            "room": {
                "roomID": 1,
                "roomName": "Theater 1",
                "totalSeats": 50,
                "totalRows": null,
                "totalColumns": null,
                "rowLabels": null,
                "layoutJson": null,
                "layout": "Standard",
                "roomType": null
            },
            "seat": {
                "seatID": 9,
                "seatNumber": "A9",
                "rowLabel": null,
                "columnNumber": null,
                "seatType": "STANDARD",
                "priceMultiplier": 1.0,
                "status": "BOOKED",
                "vipSeat": false,
                "premiumSeat": false,
                "coupleSeat": false
            },
            "combos": [
                {
                    "comboID": 1,
                    "nameCombo": "Popcorn + Drink",
                    "price": 80000.0,
                    "description": "Large popcorn and soft drink"
                },
                {
                    "comboID": 2,
                    "nameCombo": "Family Pack",
                    "price": 150000.0,
                    "description": "2 Large popcorns, 4 drinks, and nachos"
                }
            ]
        },
        {
            "ticketID": 9,
            "price": 235000.0,
            "status": "ACTIVE",
            "bookingDate": "2025-11-23",
            "showTime": "14:30",
            "customer": {
                "userID": 1,
                "name": "Admin",
                "email": "admin@rapphim.com",
                "role": "ADMIN",
                "enabled": true,
                "accountNonLocked": true,
                "accountNonExpired": true,
                "credentialsNonExpired": true,
                "authorities": [
                    {
                        "authority": "ROLE_ADMIN"
                    }
                ],
                "username": "admin@rapphim.com"
            },
            "room": {
                "roomID": 1,
                "roomName": "Theater 1",
                "totalSeats": 50,
                "totalRows": null,
                "totalColumns": null,
                "rowLabels": null,
                "layoutJson": null,
                "layout": "Standard",
                "roomType": null
            },
            "seat": {
                "seatID": 10,
                "seatNumber": "A10",
                "rowLabel": null,
                "columnNumber": null,
                "seatType": "STANDARD",
                "priceMultiplier": 1.0,
                "status": "BOOKED",
                "vipSeat": false,
                "premiumSeat": false,
                "coupleSeat": false
            },
            "combos": [
                {
                    "comboID": 1,
                    "nameCombo": "Popcorn + Drink",
                    "price": 80000.0,
                    "description": "Large popcorn and soft drink"
                },
                {
                    "comboID": 2,
                    "nameCombo": "Family Pack",
                    "price": 150000.0,
                    "description": "2 Large popcorns, 4 drinks, and nachos"
                }
            ]
        }
    ],
    "success": true,
    "totalTickets": 2,
    "message": "Tickets booked successfully",
    "totalComboAmount": 230000.0
}
```
Sau khi đặt vé thành công, vé sẽ ở trạng thái "ACTIVE" và chờ thanh toán.
Dùng API phía dưới để tạo thanh toán MoMo cho các vé đã đặt.
### 2. Tạo thanh toán MoMo
```bash
POST http://localhost:8080/api/payments/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
 {
    "ticketIds": [8, 9],
    "returnUrl": "http://localhost:3000/payment/result"
}
```

**Response:**
```json
{
    "amount": 470000.0,
    "orderId": "ORDER_1763882268806",
    "success": true,
    "paymentId": 3,
    "paymentUrl": "https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xPUkRFUl8xNzYzODgyMjY4ODA2&s=373f9e9628ae0f7a7247f2999e78ad1ef1a7e16a13d26aca21e0432b9e88676b",
    "message": "Payment created successfully. Redirect to paymentUrl to complete payment."
}
```
-->Sau khi chạy tạo thanh toán sẽ tạo link URL để thanh toán Momo, như trường hợp trên là:
https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xPUkRFUl8xNzYzODgyMjY4ODA2&s=373f9e9628ae0f7a7247f2999e78ad1ef1a7e16a13d26aca21e0432b9e88676b



### 3. Kiểm tra trạng thái của đơn hàng bằng ORDER ID được tạo khi chạy bước 2 ở trên (ORDER_1763882268806)
```bash
curl -X GET http://localhost:8080/api/payments/status/ORDER_1763882268806 \
  -H "Authorization: Bearer {token}"
```
**Response:**
```json
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
```