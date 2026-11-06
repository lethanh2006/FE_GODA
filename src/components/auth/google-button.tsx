"use client";

import { useEffect, useRef, useState } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GSI_SRC = "https://accounts.google.com/gsi/client";

interface CredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (options: { client_id: string; callback: (response: CredentialResponse) => void }) => void;
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Không tải được Google Identity Services"));
      document.head.appendChild(script);
    }).catch((error: unknown) => {
      scriptPromise = null;
      throw error;
    });
  }
  return scriptPromise;
}

export function GoogleButton({
  onCredential,
  mode = "signin",
}: {
  onCredential: (idToken: string) => Promise<void>;
  mode?: "signin" | "signup" | "continue_with";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const busyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const container = containerRef.current;
    if (!CLIENT_ID || !container) return;

    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let frame = 0;
    let renderedWidth = 0;

    void loadGsi().then(() => {
      if (cancelled) return;
      const id = window.google?.accounts?.id;
      if (!id) throw new Error("Không tải được Google Identity Services");
      id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => {
          if (cancelled || !response.credential || busyRef.current) return;
          busyRef.current = true;
          setBusy(true);
          setError(null);
          void callbackRef.current(response.credential).catch((cause: unknown) => {
            if (!cancelled) {
              setError(cause instanceof Error ? cause.message : "Đăng nhập Google thất bại");
              setBusy(false);
            }
            busyRef.current = false;
          });
        },
      });

      const render = (availableWidth: number) => {
        const width = Math.min(400, Math.floor(availableWidth));
        if (cancelled || width <= 0 || width === renderedWidth) return;
        renderedWidth = width;
        container.replaceChildren();
        id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : mode === "continue_with" ? "continue_with" : "signin_with",
          shape: "pill",
          logo_alignment: "center",
          width,
        });
      };

      render(container.clientWidth);
      observer = new ResizeObserver(([entry]) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => render(entry.contentRect.width));
      });
      observer.observe(container);
    }).catch(() => {
      if (!cancelled) setError("Không tải được nút đăng nhập Google");
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      cancelAnimationFrame(frame);
      container.replaceChildren();
    };
  }, [mode]);

  if (!CLIENT_ID) return null;

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="flex w-full justify-center" />
      {busy && <p role="status" className="text-center text-xs text-muted">Đang xác thực với Google…</p>}
      {error && <p role="alert" className="text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
