"use client";

const STYLES = {
  // Phiên học, đăng nhập: ẩn hết điều hướng.
  focus: `.app-frame :is(.site-header, .sidebar, .bottom-nav, .site-footer) { display: none !important; }
    .app-frame .app-main { padding: 0 !important; }`,
  // Làm bài: chỉ giữ thanh trên.
  exam: `.app-frame :is(.sidebar, .bottom-nav, .site-footer) { display: none !important; }
    .app-frame .site-header { display: block !important; }
    .app-frame .app-main { padding: 0 !important; }`,
};

/**
 * Đổi khung trang khi trang này đang mở. Next giữ trang vừa rời trong DOM ở dạng ẩn (<Activity>),
 * nên kiểu phải tự tắt khi bị ẩn, không thì điều hướng biến mất ở cả các trang sau.
 * Thẻ style có sẵn trong HTML từ server nên tải trực tiếp cũng không bị nháy.
 */
export function FrameMode({ mode }: { mode: keyof typeof STYLES }) {
  return (
    <style
      ref={(style) => {
        if (style) style.media = "";
        return () => {
          if (style) style.media = "not all";
        };
      }}
    >
      {STYLES[mode]}
    </style>
  );
}
