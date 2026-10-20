/** Hằng số giao diện sáng/tối dùng được ở cả server (layout) lẫn client. */
export const THEME_KEY = "goda:theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Chạy trong <head> trước khi trang hiển thị: gắn data-theme lên <html> để không bị nháy màu.
 * Giữ logic giống applyTheme() trong theme.ts.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem("${THEME_KEY}");var d=c==="dark"||(c!=="light"&&matchMedia("${DARK_QUERY}").matches);var r=document.documentElement;r.dataset.theme=d?"dark":"light";r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;
