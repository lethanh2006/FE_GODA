import { Furigana } from "@/components/vocab/furigana";

export function GrammarForms() {
  return (
    <details className="rounded-xl border border-border px-4 py-3 text-sm leading-relaxed">
      <summary className="cursor-pointer rounded font-semibold focus-visible:outline-2 focus-visible:outline-primary">
        Chưa chắc cách chia? Xem nhanh tại đây
      </summary>
      <div className="mt-3 space-y-3">
        <p>
          Chỉ mở phần bạn đang cần. Ví dụ bên dưới giúp bạn hiểu công thức mà
          không phải học lại cả N5.
        </p>
        <details>
          <summary className="cursor-pointer py-2 font-semibold">
            Thể thường là gì?
          </summary>
          <div className="space-y-2 pb-2">
            <p>
              Đây là cách nói không kết thúc bằng です・ます. Nó vẫn có hiện
              tại, quá khứ và phủ định.
            </p>
            <p className="jp text-base leading-loose" lang="ja">
              <Furigana text="{食|た}べる → {食|た}べない → {食|た}べた → {食|た}べなかった" />
            </p>
            <p>
              Lần lượt: ăn/sẽ ăn → không ăn → đã ăn → đã không ăn. Với danh từ
              và tính từ な, dạng khẳng định là だ: 学生だ・元気だ. Một số mẫu
              bỏ だ hoặc đổi thành な／の; xem công thức của từng bài.
            </p>
          </div>
        </details>
        <details>
          <summary className="cursor-pointer py-2 font-semibold">
            “Bỏ ます” làm thế nào?
          </summary>
          <div className="space-y-2 pb-2">
            <p>
              Lấy đúng dạng ます rồi bỏ hai chữ ます; không bỏ る của nguyên thể
              để thay thế máy móc.
            </p>
            <p className="jp text-base leading-loose" lang="ja">
              <Furigana text="{行|い}きます → {行|い}き ／ {食|た}べます → {食|た}べ ／ します → し" />
            </p>
            <p>
              Ví dụ: 行き + ながら, 食べ + すぎる. Đó là lý do không ghép
              行くながら.
            </p>
          </div>
        </details>
        <details>
          <summary className="cursor-pointer py-2 font-semibold">
            Chia thể て và thể た
          </summary>
          <div className="space-y-2 pb-2">
            <p>
              Trước hết xác định nhóm động từ. Nhóm 2 bỏ る rồi thêm て: 食べる
              → 食べて. Nhóm 1 đổi theo âm cuối:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>う・つ・る → って; む・ぶ・ぬ → んで.</li>
              <li>く → いて; ぐ → いで; す → して.</li>
              <li>Ngoại lệ: 行く → 行って; する → して; 来る → 来て.</li>
            </ul>
            <p>
              Thể た dùng cùng quy luật, đổi て → た và で → だ: 書いて →
              書いた, 読んで → 読んだ. Không phải mọi động từ đuôi る đều thuộc
              nhóm 2.
            </p>
          </div>
        </details>
        <details>
          <summary className="cursor-pointer py-2 font-semibold">
            Chia thể ない
          </summary>
          <div className="space-y-2 pb-2">
            <p>
              Nhóm 1 đổi âm cuối hàng う sang hàng あ rồi thêm ない; riêng う
              đổi thành わない.
            </p>
            <p className="jp text-base leading-loose" lang="ja">
              <Furigana text="{書|か}く → {書|か}かない ／ {読|よ}む → {読|よ}まない ／ {買|か}う → {買|か}わない" />
            </p>
            <p>
              Nhóm 2 bỏ る + ない: 食べる → 食べない. Bất quy tắc: する →
              しない; 来る → こない; ある → ない.
            </p>
          </div>
        </details>
        <details>
          <summary className="cursor-pointer py-2 font-semibold">
            Nhận ra tính từ い, tính từ な và danh từ
          </summary>
          <div className="space-y-2 pb-2">
            <p>
              Tính từ い: 高い → 高くない → 高かった. Tính từ な: 静かだ →
              静かじゃない → 静かだった. Danh từ: 学生だ → 学生じゃない →
              学生だった.
            </p>
            <p>
              きれい và 嫌い là tính từ な dù có âm い ở cuối. いい khi chia
              thường đổi thành よい: よくない・よかった.
            </p>
          </div>
        </details>
      </div>
    </details>
  );
}
