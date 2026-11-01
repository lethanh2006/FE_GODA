import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Giới thiệu & nguồn dữ liệu" };

const DATA_SOURCES = [
  {
    name: "OpenJLPT",
    href: "https://github.com/evanclan/OpenJLPT",
    use: "Danh sách từ và chữ Hán theo cấp (dựa trên danh sách của Jonathan Waller).",
    license: "CC BY-SA 4.0",
  },
  {
    name: "JMdict · KANJIDIC2 (EDRDG)",
    href: "https://www.edrdg.org/",
    use: "Từ thông dụng, từ loại, nghĩa tiếng Anh, âm đọc và số nét chữ Hán.",
    license: "CC BY-SA 4.0",
  },
  {
    name: "Tatoeba",
    href: "https://tatoeba.org",
    use: "Câu ví dụ và bản dịch tiếng Anh.",
    license: "CC BY 2.0 FR",
  },
  {
    name: "Open Vietnamese Dictionary Project",
    href: "https://sourceforge.net/projects/ovdp/",
    use: "Nghĩa tiếng Việt lọc tự động.",
    license: "GNU GPL v2",
  },
  {
    name: "Unihan (Unicode)",
    href: "https://www.unicode.org/charts/unihan.html",
    use: "Âm Hán Việt, có bổ sung và hiệu đính bởi GODA.",
    license: "© Unicode, Inc. · Unicode License V3",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-10 px-4 pt-10 pb-8">
      <PageHeader
        title="Giới thiệu & nguồn dữ liệu"
        description="GODA JLPT giúp người Việt luyện đề JLPT, học từ vựng và tra từ tiếng Nhật. Trang web không liên kết với Japan Foundation hay JEES — đơn vị tổ chức kỳ thi JLPT."
      />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Về câu hỏi</h2>
        <p className="text-sm leading-7 text-muted">
          Đề thi JLPT chính thức thuộc bản quyền của Japan Foundation và JEES, không được công bố lại. Vì vậy toàn bộ câu
          hỏi trên GODA JLPT là câu hỏi <strong className="text-foreground">mô phỏng</strong> theo đúng cấu trúc và độ khó
          của đề thật, đến từ hai nguồn:
        </p>
        <ul className="space-y-3 text-sm leading-7">
          <li className="panel p-4">
            <p className="font-semibold">GODA biên soạn</p>
            <p className="text-muted">
              Các đề thi thử được biên soạn riêng cho GODA JLPT theo cấu trúc đề hiện hành, kèm giải thích tiếng Việt cho
              từng câu.
            </p>
          </li>
          <li className="panel p-4">
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
        <h2 className="text-xl font-semibold">Về từ vựng và từ điển</h2>
        <p className="text-sm leading-7 text-muted">
          Nghĩa tiếng Việt của từ N5, N4 do GODA soạn tay. Từ N3 trở lên và từ ngoài danh sách JLPT dùng nghĩa{" "}
          <strong className="text-foreground">lọc tự động</strong> từ từ điển mở, có thể chưa chính xác nên luôn hiện kèm
          nghĩa tiếng Anh. Danh sách từ theo cấp là danh sách cộng đồng: JLPT không công bố danh sách từ chính thức.
        </p>
        <ul className="grid gap-2 text-sm leading-6 sm:grid-cols-2">
          {DATA_SOURCES.map((source) => (
            <li key={source.name} className="panel p-4">
              <a className="font-semibold text-primary hover:underline" href={source.href} target="_blank" rel="noreferrer">
                {source.name}
              </a>
              <p className="text-muted">{source.use}</p>
              <p className="text-xs text-muted">{source.license}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-6 text-muted">
          Dữ liệu tổng hợp của GODA phát hành lại theo các giấy phép trên, xem{" "}
          <a className="underline" href="https://github.com/lethanh2006/BE_GODA/tree/master/content" target="_blank" rel="noreferrer">
            thư mục content
          </a>
          . Các tệp EDRDG được dùng theo{" "}
          <a className="underline" href="https://www.edrdg.org/edrdg/licence.html" target="_blank" rel="noreferrer">
            giấy phép của EDRDG
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
