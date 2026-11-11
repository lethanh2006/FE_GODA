import {
  Bookmark,
  BookMarked,
  BookOpen,
  ChartColumn,
  GalleryVerticalEnd,
  History,
  Info,
  Layers,
  type LucideIcon,
  NotebookText,
  Search,
  Settings,
  ShieldCheck,
  Target,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
}

/** Điều hướng học tập của tài khoản đã đăng nhập. */
export const NAV_MAIN: NavLink[] = [
  { href: "/hoc-tu", label: "Học từ", icon: BookOpen },
  { href: "/on-tap", label: "Ôn tập", icon: Layers },
  { href: "/bo-the", label: "Bộ thẻ", icon: GalleryVerticalEnd },
  {
    href: "/tu-vung-n4-dung-mori",
    label: "Từ vựng N4 Dũng Mori",
    shortLabel: "N4 Dũng Mori",
    icon: BookMarked,
  },
  { href: "/luyen-thi", label: "Luyện thi", icon: Target },
  { href: "/tu-dien", label: "Từ điển", icon: Search },
];

export const NAV_MORE: NavLink[] = [
  { href: "/so-tu", label: "Sổ từ", icon: NotebookText },
  { href: "/dashboard", label: "Tiến độ", icon: ChartColumn },
  { href: "/history", label: "Lịch sử làm bài", icon: History },
  { href: "/bookmarks", label: "Câu hỏi đã lưu", icon: Bookmark },
];

export const NAV_ACCOUNT: NavLink[] = [
  { href: "/settings", label: "Cài đặt", icon: Settings },
  { href: "/about", label: "Giới thiệu", icon: Info },
];

export const NAV_ADMIN: NavLink = { href: "/admin/reports", label: "Quản trị · Báo lỗi", icon: ShieldCheck };

/** Khách chỉ thấy các mục học tập cho phép truy cập khi chưa đăng nhập. */
export const NAV_GUEST: NavLink[] = NAV_MAIN.filter(
  (link) => !["/on-tap", "/bo-the", "/tu-vung-n4-dung-mori"].includes(link.href),
);

const LEVEL_PATH = /^\/n[1-5](\/|$)/;

/** /n5, /exams/…, /practice, /attempts/… đều thuộc mục Luyện thi; /tu-dien/kanji thuộc Từ điển. */
export function isNavActive(pathname: string | null, href: string): boolean {
  if (pathname === null) return false;
  if (href === "/luyen-thi" && (LEVEL_PATH.test(pathname) || /^\/(exams|practice|attempts)(\/|$)/.test(pathname))) {
    return true;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
