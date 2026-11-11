# GODA JLPT — Frontend

Web luyện thi JLPT N5–N1, học từ vựng và tra từ tiếng Nhật. Next.js 16 (App Router, Cache Components) · React 19 · Tailwind CSS 4 · SWR.

Backend: [BE_GODA](https://github.com/lethanh2006/BE_GODA).

## Chạy local

```bash
pnpm install
cp .env.example .env.local   # API_INTERNAL_URL=http://localhost:4000/api
pnpm dev                     # http://localhost:3000 (cần backend đang chạy)
```

Trình duyệt luôn gọi `/api/*` trên chính domain của web. Next.js proxy các request này tới `API_INTERNAL_URL`
(xem `next.config.ts`), nên cookie đăng nhập là first-party và không cần cấu hình CORS.

Để hiện nút đăng nhập Google trên `/login` và `/register`, đặt `NEXT_PUBLIC_GOOGLE_CLIENT_ID` trong `.env.local` (cùng giá trị với `GOOGLE_CLIENT_ID` ở backend), rồi khởi động lại frontend. Xem hướng dẫn tạo OAuth client và chạy migration trong README của backend.

| Lệnh | Mô tả |
| --- | --- |
| `pnpm dev` | Chạy dev |
| `pnpm build` / `pnpm start` | Build và chạy bản production |
| `pnpm lint` | ESLint |
| `pnpm test:decks` | Kiểm tra trộn thẻ, đáp án nghe và chuyển furigana thành nội dung đọc (Node ≥ 22) |

## Các trang

| Route | Nội dung |
| --- | --- |
| `/` | Trang giới thiệu có ô tra từ; đã đăng nhập thì vào `/hoc-tu` |
| `/luyen-thi` | Tổng quan luyện thi, chọn cấp độ, cấu trúc đề JLPT |
| `/hoc-tu`, `/hoc-tu/[level]` | Chọn cấp, danh sách bài từ vựng (mỗi bài 20 từ) kèm tiến độ |
| `/hoc-tu/[level]/[no]` | Phiên học tập trung: thẻ ghi nhớ, kiểm tra, lưu vào sổ ôn. Khách học được, đăng nhập sau vẫn giữ tiến độ |
| `/bo-the` | Bộ thẻ riêng theo bài, tiến độ và ôn FSRS |
| `/bo-the/[id]` | Chọn lật thẻ, ghép Nhật–Việt hoặc nghe chọn nghĩa; hoàn thành để đưa bài vào lịch ôn |
| `/on-tap` | Ôn tập ngắt quãng (FSRS): 4 mức đánh giá kèm lịch ôn dự kiến, phím Space và 1–4 |
| `/so-tu` | Sổ từ: lọc theo trạng thái và cấp, đánh dấu đã biết, xoá |
| `/tu-dien`, `/tu-dien/[id]` | Tra từ có gợi ý; chi tiết từ: nghĩa, âm Hán Việt, ví dụ, phân tích chữ Hán, phát âm |
| `/tu-dien/kanji`, `/tu-dien/kanji/[char]` | Chữ Hán theo cấp, tra theo âm Hán Việt; chi tiết chữ và từ chứa chữ đó |
| `/n5` … `/n1` | Đề thi thử, đề ngẫu nhiên, luyện theo dạng bài, ôn câu sai / câu đã lưu |
| `/exams/[slug]` | Cấu trúc đề; chọn Thi thử (tính giờ) hoặc Luyện tập; làm cả đề hoặc từng phần |
| `/attempts/[id]` | Màn làm bài: đồng hồ, tự lưu, bảng câu hỏi, bài đọc song song, phím tắt, cỡ chữ |
| `/attempts/[id]/result` | Kết quả, điểm JLPT ước tính, phân tích theo dạng bài, xem lại từng câu |
| `/practice` | Tự tạo bài luyện: cấp độ, dạng bài, số câu, cách chọn câu, giới hạn giờ |
| `/dashboard` | Tiến độ: độ chính xác, hoạt động 30 ngày, dạng bài yếu, bài đang làm dở |
| `/history`, `/bookmarks` | Lịch sử làm bài, câu hỏi đã lưu |
| `/settings` | Đổi tên hiển thị, chọn cấp độ mục tiêu, liên kết Google |
| `/admin/reports` | (Quản trị viên) xử lý báo lỗi câu hỏi |
| `/login`, `/register`, `/about` | Tài khoản, giới thiệu và nguồn dữ liệu |

Khách vẫn làm bài và học từ được. Khi đăng nhập, các lượt làm và từ đã học trước đó được tự động gắn vào tài khoản.

Khung trang: khách có thanh trên; đã đăng nhập có thanh bên (máy tính) và thanh đáy (điện thoại). Trang đánh dấu bằng lớp
`.focus-mode` (ẩn hết điều hướng) hoặc `.exam-mode` (chỉ giữ thanh trên), quy tắc nằm ở `globals.css`.

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
    dictionary/          ô tra từ, trang tra cứu, duyệt chữ Hán
    learn/               phiên học, thẻ ghi nhớ, ôn tập, sổ từ
    vocab/               phần dùng chung: phát âm, furigana, hiển thị nghĩa, lưu từ
    auth/ layout/ level/ exam/ practice/ me/ home/ admin/
  lib/                   nav, vocab, api client, serverApi (chuyển tiếp cookie), types, hằng số JLPT, định dạng
```

## Deploy lên Vercel

Backend deploy trên Render (xem README của BE_GODA). `vercel.json` đặt function ở Singapore (`sin1`) cho gần backend.

```bash
vercel link                                    # lần đầu: tạo hoặc chọn project
vercel env add API_INTERNAL_URL production     # https://<tên-service>.onrender.com/api
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID production
vercel --prod
```

`API_INTERNAL_URL` được đọc lúc build (rewrite trong `next.config.ts`), nên sau khi đổi biến phải deploy lại.


## Học qua bộ thẻ

Mỗi bài mở màn chọn hoạt động. Lật thẻ luôn hiện tiếng Nhật kèm furigana ở mặt trước; nghĩa Việt và ví dụ ở mặt sau. Mở hoặc chuyển thẻ sẽ tự đọc từ, có thể tắt trong **Giọng đọc & tự phát âm**. Nút loa ở hai mặt đọc từ; loa cạnh mỗi ví dụ đọc toàn bộ câu tiếng Nhật. Phát âm dùng Web Speech với giọng Nhật được chọn rõ ràng sau khi danh sách giọng tải xong; không dùng giọng mặc định khác ngôn ngữ. Người học có thể chọn giọng Nhật và tốc độ 0,85× / 1× / 1,1×; lựa chọn được lưu trên thiết bị. Mặc định là 1×, ưu tiên giọng trực tuyến nếu có, không cần API key hay dịch vụ trả phí. Chất lượng vẫn phụ thuộc giọng được cài trên thiết bị, không tương đương bản thu đề thi JLPT. Nếu không phát được, giao diện hiển thị hướng dẫn thử lại.

Ghép cặp chia bài thành các lượt tối đa 5 cặp. Nghe chọn nghĩa dùng tối đa 4 nghĩa khác nhau và chỉ mở khi bài có ít nhất 2 nghĩa. Trả lời sai được thử lại. FE gửi các cặp đáp án của toàn bộ bài tới `POST /decks/:id/practice`; màn kết quả chỉ báo đã lưu sau khi BE xác nhận hoàn thành. Khi mất mạng, kết quả được giữ trong phiên để thử lưu lại. Triển khai BE có endpoint này trước FE; không cần migration cho tính năng này.

Nội dung đọc từ dùng cách đọc đã có và bỏ dấu ngoặc của phần tùy chọn như `（する）`. Nội dung đọc câu ví dụ giữ chữ Hán, chỉ bỏ ký hiệu furigana để bộ đọc còn ngữ cảnh của câu. Khi chuyển thẻ hoặc rời trang, cả âm thanh đang phát lẫn yêu cầu đang chờ giọng đều được hủy.
