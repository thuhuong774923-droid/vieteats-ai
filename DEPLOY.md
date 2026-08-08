# 🚀 Hướng dẫn deploy VietEats AI thành website thật (miễn phí)

Làm theo đúng thứ tự 5 bước dưới đây. Tổng thời gian ~20-30 phút cho lần đầu.

---

## Bước 1: Đưa code lên GitHub

1. Tạo tài khoản tại [github.com](https://github.com) nếu chưa có
2. Tạo repository mới (nút **New repository**), đặt tên `vieteats-ai`, để **Public** hoặc **Private** tuỳ bạn, **không** tick "Add README"
3. Giải nén file `vieteats-ai.zip` bạn đã tải, mở terminal tại thư mục đó rồi chạy:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username-của-bạn>/vieteats-ai.git
   git push -u origin main
   ```

---

## Bước 2: Tạo Database (MongoDB Atlas - miễn phí)

1. Vào [mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register), đăng ký tài khoản
2. Tạo **Cluster** mới → chọn gói **M0 Free**
3. Vào **Database Access** → **Add New Database User** → đặt username/password (nhớ lưu lại)
4. Vào **Network Access** → **Add IP Address** → chọn **Allow Access from Anywhere** (`0.0.0.0/0`) — cần thiết vì Render/Vercel có IP động
5. Vào **Database** → nút **Connect** → **Drivers** → copy chuỗi kết nối, dạng:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/vieteats_ai?retryWrites=true&w=majority
   ```
   → thay `<username>` và `<password>` bằng thông tin bạn vừa tạo, thêm `/vieteats_ai` trước dấu `?` như trên. **Lưu chuỗi này lại**, sẽ dùng ở Bước 3.

---

## Bước 3: Deploy Backend (Render - miễn phí)

1. Vào [render.com](https://render.com), đăng ký bằng tài khoản GitHub (để Render truy cập repo dễ dàng)
2. Nút **New** → **Web Service** → chọn repo `vieteats-ai` vừa push
3. Render sẽ tự đọc file `render.yaml` có sẵn trong repo và điền cấu hình. Nếu không tự nhận, điền thủ công:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Trong phần **Environment Variables**, điền:
   | Key | Value |
   |---|---|
   | `MONGO_URI` | chuỗi kết nối MongoDB Atlas ở Bước 2 |
   | `CLIENT_URL` | tạm thời để `*`, sẽ sửa lại ở Bước 5 |
   | `OPENAI_API_KEY` | (tuỳ chọn — để trống nếu chưa có, AI vẫn chạy chế độ rule-based) |
5. Bấm **Create Web Service**, đợi build xong (~2-3 phút). Bạn sẽ có link dạng:
   ```
   https://vieteats-ai-backend.onrender.com
   ```
6. **Seed dữ liệu mẫu** (63 tỉnh, 1000+ món, 5000+ quán...): vào tab **Shell** của service trên Render, chạy:
   ```bash
   npm run seed
   ```
   Đợi vài phút cho tới khi thấy dòng "🎉 SEED HOÀN TẤT!"

> ⚠️ Gói free của Render sẽ "ngủ" sau 15 phút không có request, lần truy cập đầu sau đó sẽ chậm ~30-50s để "thức dậy". Đây là giới hạn của gói miễn phí, nâng cấp gói trả phí sẽ hết tình trạng này.

---

## Bước 4: Deploy Frontend (Vercel - miễn phí)

1. Vào [vercel.com](https://vercel.com), đăng ký bằng tài khoản GitHub
2. Nút **Add New** → **Project** → chọn repo `vieteats-ai`
3. Ở phần **Root Directory**, bấm **Edit** → chọn thư mục `frontend`
4. Trong **Environment Variables**, điền:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://vieteats-ai-backend.onrender.com/api` (link Backend ở Bước 3, nhớ thêm `/api`) |
   | `NEXT_PUBLIC_SOCKET_URL` | `https://vieteats-ai-backend.onrender.com` |
   | `NEXT_PUBLIC_SITE_URL` | sẽ điền ở Bước 5 sau khi có link Vercel |
5. Bấm **Deploy**, đợi ~2 phút. Bạn sẽ có link web thật, dạng:
   ```
   https://vieteats-ai.vercel.app
   ```
   **Đây chính là link web để mọi người truy cập.**

---

## Bước 5: Nối lại 2 chiều (bắt buộc, tránh lỗi CORS)

1. Quay lại **Render** (backend) → **Environment** → sửa `CLIENT_URL` thành link Vercel vừa có (`https://vieteats-ai.vercel.app`) → **Save** (Render tự deploy lại)
2. Quay lại **Vercel** (frontend) → **Settings** → **Environment Variables** → sửa `NEXT_PUBLIC_SITE_URL` thành chính link Vercel đó → **Redeploy**

---

## Bước 6: Tạo lại mã QR trỏ đúng link thật

Trên máy bạn (thư mục dự án):
```bash
npm install qrcode sharp --save-dev
node scripts/generate-qr.js https://vieteats-ai.vercel.app
```
Rồi tự quét thử bằng điện thoại để xác nhận trước khi dùng.

---

## Kiểm tra hoàn tất

- Mở `https://vieteats-ai.vercel.app` trên trình duyệt → phải thấy trang chủ VietEats AI
- Đăng nhập bằng `admin@vieteats.ai / Admin@123` → vào được `/admin`
- Vào `/menu` → phải thấy danh sách món ăn (nếu trống nghĩa là Bước 3.6 seed dữ liệu chưa chạy xong)

## Nếu gặp lỗi

- **Trang trắng / lỗi 500**: kiểm tra `NEXT_PUBLIC_API_URL` ở Vercel có đúng và có `/api` ở cuối không
- **"Network Error" khi gọi API**: kiểm tra `CLIENT_URL` ở Render đã đúng link Vercel chưa (lỗi CORS)
- **Danh sách món ăn trống**: vào Render Shell chạy `npm run seed`
- **Backend load chậm lần đầu**: bình thường với gói free (xem lưu ý ở Bước 3)
