# GODA JLPT — Frontend

Web luyện đề JLPT N5–N1. Next.js 16 (App Router, Cache Components) · React 19 · Tailwind CSS 4 · SWR.

Backend: [BE_GODA](https://github.com/lethanh2006/BE_GODA).

## Chạy local

```bash
pnpm install
cp .env.example .env.local   # API_INTERNAL_URL=http://localhost:4000/api
pnpm dev                     # http://localhost:3000 (cần backend đang chạy)
```

Trình duyệt luôn gọi `/api/*` trên chính domain của web. Next.js proxy các request này tới `API_INTERNAL_URL`
(xem `next.config.ts`), nên cookie đăng nhập là first-party và không cần cấu hình CORS.

| Lệnh | Mô tả |
| --- | --- |
| `pnpm dev` | Chạy dev |
| `pnpm build` / `pnpm start` | Build và chạy bản production |
| `pnpm lint` | ESLint |

## Các trang

| Route | Nội dung |
| --- | --- |
| `/` | Trang chủ, chọn cấp độ, cấu trúc đề JLPT |
| `/n5` … `/n1` | Đề thi thử, đề ngẫu nhiên, luyện theo dạng bài, ôn câu sai / câu đã lưu |
| `/exams/[slug]` | Cấu trúc đề; chọn Thi thử (tính giờ) hoặc Luyện tập; làm cả đề hoặc từng phần |
| `/attempts/[id]` | Màn làm bài: đồng hồ, tự lưu, bảng câu hỏi, bài đọc song song, phím tắt, cỡ chữ |
| `/attempts/[id]/result` | Kết quả, điểm JLPT ước tính, phân tích theo dạng bài, xem lại từng câu |
| `/practice` | Tự tạo bài luyện: cấp độ, dạng bài, số câu, cách chọn câu, giới hạn giờ |
| `/dashboard` | Tiến độ: độ chính xác, hoạt động 30 ngày, dạng bài yếu, bài đang làm dở |
| `/history`, `/bookmarks` | Lịch sử làm bài, câu hỏi đã lưu |
| `/settings` | Đổi tên hiển thị, chọn cấp độ mục tiêu |
| `/admin/reports` | (Quản trị viên) xử lý báo lỗi câu hỏi |
| `/login`, `/register`, `/about` | Tài khoản, giới thiệu và nguồn dữ liệu |

Khách vẫn làm bài được. Khi đăng nhập, các lượt làm trước đó được tự động gắn vào tài khoản.

Phím tắt khi làm bài: `1`–`4` chọn đáp án, `←` / `→` chuyển câu, `F` đánh dấu, `Enter` sang câu tiếp sau khi xem đáp án.

## Cấu trúc

```
src/
  app/                   routes (App Router)
  components/
    ui/                  button, card, badge, dialog, switch, feedback…
    attempt/             màn làm bài, bảng câu hỏi, trang kết quả
    question/            hiển thị đề tiếng Nhật (《》 gạch chân, （　）ô trống, ★), đáp án, lưu, báo lỗi
    charts/              biểu đồ cột theo ngày, thanh ngang
    auth/ layout/ level/ exam/ practice/ me/ home/ admin/
  lib/                   api client, serverApi (chuyển tiếp cookie), types, hằng số JLPT, định dạng
```
