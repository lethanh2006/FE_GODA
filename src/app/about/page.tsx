import type { Metadata } from "next";

export const metadata: Metadata = { title: "Giới thiệu & nguồn dữ liệu" };

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Giới thiệu & nguồn dữ liệu</h1>
        <p className="mt-2 text-muted">
          GODA JLPT là nền tảng luyện đề thi năng lực tiếng Nhật (JLPT) cho người Việt. Trang web không liên kết với
          Japan Foundation hay JEES — đơn vị tổ chức kỳ thi JLPT.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Về câu hỏi</h2>
        <p className="text-sm leading-7 text-muted">
          Đề thi JLPT chính thức thuộc bản quyền của Japan Foundation và JEES, không được công bố lại. Vì vậy toàn bộ câu
          hỏi trên GODA JLPT là câu hỏi <strong className="text-foreground">mô phỏng</strong> theo đúng cấu trúc và độ khó
          của đề thật, đến từ hai nguồn:
        </p>
        <ul className="space-y-3 text-sm leading-7">
          <li className="rounded-xl border border-border bg-card p-4">
            <p className="font-semibold">GODA biên soạn</p>
            <p className="text-muted">
              Các đề thi thử được biên soạn riêng cho GODA JLPT theo cấu trúc đề hiện hành, kèm giải thích tiếng Việt cho
              từng câu.
            </p>
          </li>
          <li className="rounded-xl border border-border bg-card p-4">
            <p className="font-semibold">OpenJLPT (ngân hàng mở rộng)</p>
            <p className="text-muted">
              Ngân hàng câu hỏi mã nguồn mở do AI tạo —{" "}
              <a className="text-primary hover:underline" href="https://github.com/iamcheyan/jlpt-drill" target="_blank" rel="noreferrer">
                iamcheyan/jlpt-drill
              </a>{" "}
              (giấy phép MIT). GODA đã lọc bỏ câu lỗi, sinh lại phương án nhiễu cho dạng 漢字読み / 表記 và loại lời giải
              không phù hợp. Câu hỏi có thể còn sai sót — hãy dùng nút “Báo lỗi” để giúp chúng tôi sửa.
            </p>
          </li>
        </ul>
        <p className="text-sm leading-7 text-muted">
          Phương án nhiễu dạng 表記 được tạo bằng chữ Hán đồng âm dựa trên dữ liệu{" "}
          <a className="text-primary hover:underline" href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project" target="_blank" rel="noreferrer">
            KANJIDIC
          </a>{" "}
          (EDRDG, CC BY-SA 4.0) qua bộ{" "}
          <a className="text-primary hover:underline" href="https://github.com/davidluzgouveia/kanji-data" target="_blank" rel="noreferrer">
            kanji-data
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Về điểm ước tính</h2>
        <p className="text-sm leading-7 text-muted">
          JLPT dùng điểm quy đổi (尺度得点) nên không thể tính chính xác từ số câu đúng. GODA ước tính điểm theo tỷ lệ
          câu đúng của từng nhóm điểm, so với điểm liệt và điểm đỗ chính thức. Nếu chỉ làm một phần của đề, ngưỡng đỗ
          được quy đổi theo tỷ lệ trên các phần đã làm — điểm chỉ mang tính tham khảo.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Về phần Nghe hiểu</h2>
        <p className="text-sm leading-7 text-muted">
          Bài nghe được đọc bằng giọng tiếng Nhật có sẵn trong trình duyệt (Web Speech API), mỗi vai một giọng hoặc cao độ
          khác nhau. Chất lượng giọng phụ thuộc thiết bị: Chrome / Edge trên Windows, macOS, Android và Safari trên iOS đều
          có giọng tiếng Nhật. Script hiện sau khi xem đáp án hoặc nộp bài.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Tài liệu chính thức</h2>
        <p className="text-sm leading-7 text-muted">
          Để làm quen với đề thật, hãy xem{" "}
          <a className="text-primary hover:underline" href="https://www.jlpt.jp/samples/forlearners.html" target="_blank" rel="noreferrer">
            đề mẫu chính thức trên jlpt.jp
          </a>{" "}
          (dùng cho mục đích tự học).
        </p>
      </section>
    </main>
  );
}
