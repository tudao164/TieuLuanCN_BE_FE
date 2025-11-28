### API 1: Đăng ký tài khoản (Gửi OTP)
POST http://localhost:8080/api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}

{
  "message": "OTP has been sent to john@example.com. Please verify to complete registration.",
  "email": "john@example.com"
}


{
  "error": "Email is already taken!"
}

{
  "error": "Username is already taken!"
}

### API 2: Verify OTP (Hoàn tất đăng ký)
POST http://localhost:8080/api/auth/verify-otp
{
  "email": "john@example.com",
  "otpCode": "123456"
}

{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNzMyNTg0MDAwLCJleHAiOjE3MzI2NzA0MDB9.signature",
  "type": "Bearer",
  "id": 5,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}