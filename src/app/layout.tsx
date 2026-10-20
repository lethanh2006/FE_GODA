import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Geist_Mono, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
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
    default: "GODA JLPT — Luyện đề JLPT N5–N1",
    template: "%s | GODA JLPT",
  },
  description:
    "Luyện đề thi năng lực tiếng Nhật JLPT N5–N1: đề thi thử theo cấu trúc thật, luyện theo dạng bài, chấm điểm và giải thích chi tiết.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#111215" },
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
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
