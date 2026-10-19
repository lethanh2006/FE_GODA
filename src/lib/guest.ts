/** Lưu id các lượt làm bài khi chưa đăng nhập để gắn vào tài khoản sau khi đăng nhập. */
const KEY = "goda:guest-attempts";

export function rememberGuestAttempt(id: string) {
  try {
    const ids = getGuestAttempts().filter((x) => x !== id);
    localStorage.setItem(KEY, JSON.stringify([id, ...ids].slice(0, 50)));
  } catch {
    // localStorage không khả dụng (chế độ riêng tư…)
  }
}

export function getGuestAttempts(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function clearGuestAttempts() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // bỏ qua
  }
}
