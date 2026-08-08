# 🍜 VietEats AI

Nền tảng khám phá ẩm thực Việt Nam ứng dụng AI — Next.js 15 + React 19 + Node.js/Express + MongoDB.

## 📁 Cấu trúc dự án

```
vieteats-ai/
├── backend/            # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/     # Kết nối DB, Redis
│   │   ├── models/     # Mongoose Schemas (User, Food, Province, Restaurant, Settings...)
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/ # Auth (JWT), Error handler, Rate limit
│   │   ├── services/   # AI Service, OAuth (Google/Facebook), SMS (Twilio)
│   │   ├── socket/      # Socket.io realtime
│   │   └── seed/        # Script sinh dữ liệu mẫu 63 tỉnh, 1000+ món, 5000+ quán, 10000+ review
│   ├── .env.example
│   └── Dockerfile
├── frontend/           # Next.js 15 App Router
│   ├── app/             # Các trang: Home, Menu, Chi tiết món, AI Assistant, Bản đồ, Community, Passport, Admin (11 module), sitemap.ts, robots.ts, offline...
│   ├── components/      # Header, Footer, MobileNav, DishCard, MapView, AdminSidebar, GoogleLoginButton, FacebookLoginButton, ServiceWorkerRegister...
│   ├── lib/              # axios client, Redux store, React Query provider, useSpeech (STT/TTS)
│   ├── public/           # manifest.json, sw.js, icons/, og-image.jpg
│   └── Dockerfile
└── docker-compose.yml
```

## 🌐 Muốn có link web thật để mọi người truy cập?

Xem hướng dẫn deploy miễn phí từng bước tại **[DEPLOY.md](./DEPLOY.md)** (GitHub → MongoDB Atlas → Render → Vercel, ~20-30 phút).

## 🚀 Cài đặt nhanh (không dùng Docker)

### 1. Yêu cầu hệ thống
- Node.js >= 18
- MongoDB (local hoặc MongoDB Atlas)
- (Tuỳ chọn) Redis, Cloudinary, OpenAI API Key, Gemini API Key

### 2. Backend

```bash
cd backend
cp .env.example .env     # điền MONGO_URI, JWT_SECRET... (có giá trị mặc định để chạy demo)
npm install
npm run seed              # sinh dữ liệu mẫu: 63 tỉnh, 1000+ món, 5000+ quán, 10000+ đánh giá
npm run dev                # chạy tại http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # chạy tại http://localhost:3000
```

Mở trình duyệt tại **http://localhost:3000**.

## 🐳 Chạy bằng Docker

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017
- Redis: localhost:6379

## 🔑 Tài khoản mẫu (sau khi chạy `npm run seed`)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@vieteats.ai | Admin@123 |
| User  | demo@vieteats.ai  | Demo@123 |

Admin có thể truy cập Dashboard tại `/admin` sau khi đăng nhập.

## 🧠 Cấu hình AI (tuỳ chọn)

Hệ thống chạy được **ngay cả khi chưa có API key** — AI Assistant sẽ dùng chế độ rule-based dựa trên dữ liệu thật trong MongoDB (vẫn trả lời được các câu như *"Tôi có 200.000đ ở Huế nên ăn gì"*).

Để bật GPT thật (giải thích món ăn, kể chuyện, chat nâng cao, nhận diện ảnh món ăn):
```
# backend/.env
OPENAI_API_KEY=sk-xxxx
GEMINI_API_KEY=xxxx
```

## 📡 API chính (RESTful)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/foods` | Danh sách món (filter/sort/pagination) |
| GET | `/api/foods/:id` | Chi tiết món ăn |
| GET | `/api/foods/:id/ai-explain` | AI giải thích món ăn |
| GET | `/api/provinces` | Danh sách 63 tỉnh |
| GET | `/api/provinces/:slug` | Chi tiết tỉnh (món ăn + quán nổi tiếng) |
| GET | `/api/provinces/:slug/ai-story` | AI kể chuyện tỉnh thành |
| GET | `/api/restaurants` | Danh sách quán (hỗ trợ tìm gần vị trí `near=lng,lat`) |
| POST | `/api/reviews` | Tạo đánh giá |
| GET/POST | `/api/community/feed`, `/posts` | Feed cộng đồng |
| GET | `/api/community/leaderboard` | Bảng xếp hạng |
| GET/POST | `/api/passport/me`, `/checkin`, `/eaten` | Food Passport (gamification) |
| POST | `/api/chat` | Chat với AI Assistant |
| POST | `/api/chat/image` | Nhận diện món ăn từ ảnh |
| GET | `/api/search?q=` | Tìm kiếm realtime (autocomplete) |
| GET | `/api/recommend` | Gợi ý món theo sở thích/ngân sách |
| POST | `/api/chat/image` | Nhận diện món ăn từ ảnh (GPT-4o Vision) |
| GET | `/api/admin/dashboard` | Thống kê tổng quan (Admin) |
| GET | `/api/admin/analytics` | Phân tích chuyên sâu (Admin) |
| GET/PUT/DELETE | `/api/admin/restaurants` | CRUD nhà hàng (Admin) |
| GET/PUT | `/api/admin/locations` | Quản lý 63 tỉnh thành (Admin) |
| GET/DELETE | `/api/admin/reviews` | Kiểm duyệt đánh giá (Admin) |
| GET/POST | `/api/admin/reports` | Xử lý báo cáo vi phạm (Admin) |
| GET/DELETE | `/api/admin/community` | Kiểm duyệt bài đăng cộng đồng (Admin) |
| GET | `/api/admin/ai-logs` | Xem lịch sử chat AI của người dùng (Admin) |
| GET/PUT | `/api/admin/settings` | Cấu hình hệ thống - lưu bền vững MongoDB (Admin) |
| POST | `/api/auth/google` | Đăng nhập Google (xác thực idToken thật) |
| POST | `/api/auth/facebook` | Đăng nhập Facebook (xác thực accessToken thật) |

## 🔐 Cấu hình đăng nhập mạng xã hội (OAuth thật)

### Google
1. Tạo OAuth Client ID tại [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (loại **Web application**)
2. Thêm `http://localhost:3000` vào **Authorized JavaScript origins**
3. Điền vào `frontend/.env`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com`
4. Điền vào `backend/.env`: `GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com` (cùng giá trị)

### Facebook
1. Tạo app tại [Facebook for Developers](https://developers.facebook.com/) → thêm sản phẩm **Facebook Login**
2. Thêm domain `localhost` vào App Domains
3. Điền vào `frontend/.env`: `NEXT_PUBLIC_FACEBOOK_APP_ID=xxxx`

Nếu chưa cấu hình, các nút Google/Facebook sẽ tự động hiển thị trạng thái "chưa cấu hình" thay vì lỗi khi bấm.

### Apple Sign-In
Chưa tích hợp — Apple yêu cầu tài khoản Apple Developer trả phí, Service ID và private key riêng của từng tổ chức nên không thể dựng sẵn. Nút "Apple" hiện ở trạng thái disabled kèm ghi chú.

## 📩 OTP qua SMS thật (Twilio - tuỳ chọn)
Mặc định OTP được in ra console server (đủ dùng để test luồng quên mật khẩu). Để gửi SMS thật, điền vào `backend/.env`:
```
TWILIO_ACCOUNT_SID=xxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

## 📱 PWA (Progressive Web App)
- `frontend/public/manifest.json` + icon 192/512 (kèm bản maskable) đã sẵn sàng
- Service Worker (`public/sw.js`) cache app shell, chiến lược network-first cho API và điều hướng, cache-first cho ảnh/tĩnh, có trang `/offline` fallback khi mất mạng
- Nhận Push Notification qua Firebase Cloud Messaging (khi cấu hình `FIREBASE_*` ở backend)
- Service Worker chỉ đăng ký ở **production build** (`npm run build && npm start`) để tránh cache gây khó chịu lúc đang code (`npm run dev`)
- Có thể "Add to Home Screen" trên điện thoại để dùng như app native

## 🔍 SEO
- Metadata đầy đủ: title template, Open Graph, Twitter Card, canonical URL, robots
- `app/sitemap.ts` sinh sitemap.xml động (bao gồm URL 63 tỉnh thành lấy trực tiếp từ API)
- `app/robots.ts` sinh robots.txt, chặn crawler vào `/admin`, `/api`, `/profile`
- JSON-LD `schema.org/WebSite` (toàn site, có SearchAction) + `schema.org/Recipe` (từng trang chi tiết món ăn — hiển thị rating/nutrition/ingredients cho Google rich results)
- Ảnh OG (`/public/og-image.jpg`) và favicon đã có sẵn

## 📱 Mã QR thương hiệu

Đã có sẵn mã QR (logo VietEats AI ở giữa, màu thương hiệu) tại `frontend/public/qr/`:
- `qr-vieteats.png` — trỏ tới `https://vieteats.ai` (dùng cho web/app, hiển thị ở Footer)
- `qr-vieteats-localhost.png` — trỏ tới `http://localhost:3000` (test khi chạy local)
- `qr-vieteats-poster.png` — bản có khung + chữ "Quét mã để khám phá VietEats AI", dùng in poster/menu/card

**Mã QR đã được kiểm tra quét thành công nhiều lần** bằng bộ giải mã OpenCV trước khi bàn giao.

Khi deploy lên domain thật, hãy tạo lại QR trỏ đúng domain của bạn:
```bash
npm install qrcode sharp --save-dev
node scripts/generate-qr.js https://your-real-domain.com
```
⚠️ Luôn tự quét thử bằng điện thoại thật sau khi tạo lại, trước khi in ấn hàng loạt.

## 🎨 Design System

- **Style**: Material Design 3 + Glassmorphism nhẹ
- **Màu chủ đạo**: Primary `#D62828` · Secondary `#F77F00` · Background `#FFF8F3` · Accent `#FFD166` · Text `#222222`
- **Font**: Poppins (tiêu đề) + Inter (nội dung)
- **Bo góc**: 18px (`rounded-xl2`)
- **Dark Mode**: có (toggle ở Header/Profile)
- **Responsive**: Desktop / Tablet / Mobile — Mobile dùng Bottom Navigation giống app di động

## ✅ Trạng thái hoàn thiện

Toàn bộ hạng mục trong yêu cầu ban đầu đã được xây dựng và chạy được thật:
- ✅ Frontend + Backend + Database + API đầy đủ theo cấu trúc yêu cầu
- ✅ Dữ liệu mẫu 63 tỉnh thành, 1000+ món ăn, 5000+ nhà hàng, 10000+ đánh giá
- ✅ Admin Dashboard + CMS đầy đủ 11 module (Dashboard, Users, Foods, Restaurants, Locations, Community, Reviews, Reports, Analytics, AI Logs, Settings)
- ✅ AI Assistant với Speech-to-Text, Text-to-Speech, Image Recognition thật
- ✅ Đăng nhập Google/Facebook thật (OAuth), OTP qua SMS thật (Twilio, tuỳ chọn)
- ✅ Settings lưu bền vững vào MongoDB
- ✅ PWA: manifest, Service Worker, offline fallback, installable
- ✅ SEO: sitemap động, robots.txt, JSON-LD schema.org, Open Graph đầy đủ
- ✅ Docker Compose, `.env.example`, tài khoản mẫu Admin/User

**Còn cần bạn tự cấu hình khi triển khai thật (không thể dựng sẵn vì cần tài khoản/khoá riêng của bạn):**
- API key thật cho OpenAI/Gemini (nếu muốn AI trả lời bằng GPT thật thay vì rule-based)
- OAuth Client ID/Secret thật cho Google/Facebook (xem hướng dẫn phía trên)
- Tài khoản Twilio thật nếu muốn gửi SMS OTP thật
- Cloudinary thật nếu muốn upload ảnh lên CDN thay vì placeholder
- Domain thật + SSL khi deploy production (cập nhật `NEXT_PUBLIC_SITE_URL`)
- Icon/OG image hiện là bản dựng tự động đơn giản — nên thay bằng thiết kế thương hiệu chính thức

### Lưu ý về Speech-to-Text/Text-to-Speech
Tính năng dùng **Web Speech API** có sẵn trong trình duyệt (Chrome, Edge, Safari) — không cần thêm API key hay thư viện ngoài, hoạt động ngay khi chạy `npm run dev`. Firefox hiện chưa hỗ trợ đầy đủ SpeechRecognition; nút mic sẽ báo trình duyệt không hỗ trợ trong trường hợp đó.

## 🔒 Bảo mật đã áp dụng
JWT (access + refresh token), bcrypt hash password, Helmet, CORS, express-mongo-sanitize, xss-clean, rate limiting cho auth & API, xác thực OAuth token phía server (không tin token từ client).

## 📄 License
MIT — dùng cho mục đích học tập / xây dựng sản phẩm thực tế.
