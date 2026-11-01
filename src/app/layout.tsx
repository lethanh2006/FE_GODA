import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Geist_Mono, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import { Suspense } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

// Font giao diện thiết kế cho tiếng Việt (dấu không bị chồng / lệch).
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Font CJK rất nặng nên không preload; trình duyệt chỉ tải các glyph cần dùng.
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  preload: false,
});

// Kiểu Mincho cho nội dung đề, giống đề thi in.
const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  weight: ["400", "600"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "GODA JLPT — Luyện thi, học từ và tra từ tiếng Nhật",
    template: "%s | GODA JLPT",
  },
  description:
    "Luyện đề JLPT N5–N1 theo cấu trúc thật, học từ vựng bằng thẻ ghi nhớ và ôn tập ngắt quãng, tra từ Nhật–Việt có âm Hán Việt.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#121720" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme được script bên dưới gắn trước khi hiển thị nên khác với HTML từ server.
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnam.variable} ${geistMono.variable} ${notoSansJp.variable} ${notoSerifJp.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <AuthProvider>
          <div className="app-frame flex min-h-full flex-1 flex-col">
            {/* Thanh bên và thanh đáy đọc đường dẫn hiện tại, chỉ có lúc chạy nên nằm trong Suspense. */}
            <Suspense>
              <Sidebar />
            </Suspense>
            <div className="app-main flex min-h-full flex-1 flex-col">
              <Header />
              <div className="flex flex-1 flex-col">{children}</div>
              <Footer />
            </div>
            <Suspense>
              <BottomNav />
            </Suspense>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
