# BE Base Reusable — SQL Server thuần, không ORM

Kiến trúc bám theo phong cách repo GitHub của bạn: **Router → Controller → Service → Repository → SQL Server**. Tên các file theo kiểu `UserController.js`, `UserServices.js`, `UserRepository.js`, `usersRoutes.js`, middleware `authenticate`, `authorize`, `errorHandler`, `ApiError`, `ApiSuccess`.

## 1. Chạy mock ngay (KHÔNG cần DB)

Yêu cầu Node.js >=20. Chạy:

```bash
cp .env.example .env
```

**Quan trọng:** sửa `JWT_SECRET` thành chuỗi ngẫu nhiên >=32 ký tự, không dùng giá trị ví dụ. `USE_MOCK=true`.

```bash
npm install
npm run dev
```

- `GET http://localhost:3000/health`
- Mock Admin: `admin@example.com` / `Demo@12345`
- Mock User: `member@example.com` / `Demo@12345`
- Mock dữ liệu nằm trong `src/mock/seed.js` và RAM; mọi thay đổi mất khi restart. **Chỉ dùng để học/demo**, không dùng mật khẩu mẫu khi triển khai.

## 2. Luồng mẫu đầy đủ

**POST /api/auth/register** → `src/routes/authRoutes.js` → `middleware/validator/user.js` → `controller/AuthController.Register` → `services/AuthServices.register` (kiểm email, bcrypt hash) → `repository/UserRepository.create` → `mock/store.js` hoặc câu lệnh SQL tham số hóa → `ApiSuccess.created`.

**POST /api/auth/login** → `AuthController.Login` → `AuthServices.login` → `UserRepository.findByEmail` → bcrypt compare → JWT.

**GET /api/users/:id** → `authenticate` (JWT) → `UserController.GetById` → `UserServices.getById` → `UserRepository.findById` → `ApiSuccess.getSelect`.

**PUT /api/users/:id** → authenticate → validator → controller → service → repository.updateName → JSON response.

**GET /api/users** và **DELETE /api/users/:id** chỉ dành cho role Admin (demo RBAC).

Các API được chuẩn hóa `{success, message, data}` hoặc `{success:false,message,errors}`. Ví dụ HTTP request sẵn ở `examples/requests.http` (VS Code REST Client).

## 3. Chuyển sang Microsoft SQL Server

1. Tạo database + bảng bằng `sql/01-create-database.sql` trong SSMS (hoặc Azure Data Studio).
2. Trong `.env` đặt `USE_MOCK=false`, `DB_SERVER`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Thiết lập encryption/certificate theo server thực tế; `DB_TRUST_SERVER_CERTIFICATE=true` **chỉ dùng môi trường dev đáng tin cậy**.
3. `npm run dev`. Khi bật SQL mode không có user seed; gọi register trước rồi login. Role mặc định `User`. Muốn thử endpoint Admin: đặt role bằng SQL **chỉ trong DB dev**: `UPDATE dbo.Users SET role='Admin' WHERE email='your-test@example.com';` rồi đăng nhập lại.

Không dùng Sequelize/Prisma/TypeORM; repo dùng `mssql` với `.input()` và SQL có tham số chống SQL injection. Trong production nên kiểm soát phân quyền theo chủ sở hữu user, dùng migration, refresh token/revocation, audit logging, secret manager, integration tests với DB thật. Endpoint xem/sửa user kiểm tra quyền sở hữu (hoặc Admin). Trước production nên bổ sung kiểm thử phân quyền, thu hồi token và audit logging.

## 4. Test

```bash
npm test
```

Test khởi chạy HTTP server ở port ngẫu nhiên và chạy register→login→get→update, kiểm tra role và 404 trong mock mode.

## 5. Tạo module mới

Sao chép 4 tầng `routes / controller / services / repository`, đặt logic nghiệp vụ trong service, câu SQL chỉ trong repository, controller chỉ nhận request và trả response. Đăng ký router tại `src/routes/index.js`. Middleware validation và authenticate đặt ở routes. Đừng đặt SQL trong controller.
