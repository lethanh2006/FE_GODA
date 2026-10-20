import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-mono text-sm font-medium text-accent">404</p>
      <h1 className="text-2xl font-bold tracking-tight">Không tìm thấy trang</h1>
      <p className="text-sm text-muted">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <ButtonLink href="/">Về trang chủ</ButtonLink>
    </main>
  );
}
