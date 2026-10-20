import { useSyncExternalStore } from "react";
import { DARK_QUERY, THEME_KEY as KEY } from "./theme-script";

/** Lựa chọn giao diện của người dùng; "system" = theo cài đặt sáng/tối của máy. */
export type ThemeChoice = "light" | "dark" | "system";

const listeners = new Set<() => void>();

function readChoice(): ThemeChoice {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function applyTheme() {
  const choice = readChoice();
  const dark = choice === "dark" || (choice === "system" && matchMedia(DARK_QUERY).matches);
  const root = document.documentElement;
  root.dataset.theme = dark ? "dark" : "light";
  root.style.colorScheme = dark ? "dark" : "light";
  listeners.forEach((listener) => listener());
}

export function setThemeChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    // localStorage không khả dụng: vẫn đổi giao diện cho phiên hiện tại.
    document.documentElement.dataset.theme = choice === "dark" ? "dark" : "light";
  }
  applyTheme();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = matchMedia(DARK_QUERY);
  // Đổi ở tab khác hoặc đổi chế độ sáng/tối của máy khi đang chọn "Theo hệ thống".
  const onStorage = (event: StorageEvent) => event.key === KEY && applyTheme();
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", applyTheme);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", applyTheme);
  };
}

export function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribe, readChoice, () => "system");
}

/** Giao diện đang hiển thị thực tế (đã quy "system" về sáng hoặc tối). */
export function useResolvedTheme(): "light" | "dark" | null {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    () => null,
  );
}
