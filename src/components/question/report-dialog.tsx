"use client";

import { Flag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

const REASONS = [
  { value: "wrong_answer", label: "Đáp án sai" },
  { value: "multiple_answers", label: "Có nhiều đáp án đúng" },
  { value: "typo", label: "Lỗi chính tả / hiển thị" },
  { value: "unclear", label: "Đề khó hiểu" },
  { value: "other", label: "Khác" },
];

export function ReportButton({ questionId, className }: { questionId: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("wrong_answer");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async () => {
    setState("sending");
    try {
      await api(`/questions/${questionId}/reports`, {
        method: "POST",
        json: { reason, message: message.trim() || undefined },
      });
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setState("idle");
        }}
        className={cn("inline-flex items-center gap-1 text-xs text-muted hover:text-foreground", className)}
      >
        <Flag className="size-3.5" /> Báo lỗi
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Báo lỗi câu hỏi">
        {state === "sent" ? (
          <div className="space-y-4">
            <p className="text-sm">Cảm ơn bạn! Chúng tôi sẽ kiểm tra và sửa câu hỏi này sớm.</p>
            <Button onClick={() => setOpen(false)}>Đóng</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm",
                    reason === r.value ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-subtle",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Mô tả thêm (không bắt buộc)…"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {state === "error" && <p className="text-sm text-red-600">Gửi không thành công, vui lòng thử lại.</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Huỷ</Button>
              <Button onClick={submit} disabled={state === "sending"}>
                {state === "sending" ? "Đang gửi…" : "Gửi báo lỗi"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
