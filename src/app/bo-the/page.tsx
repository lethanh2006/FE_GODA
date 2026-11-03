import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { DeckHome } from "@/components/decks/deck-home";

export const metadata: Metadata = { title: "Bộ thẻ" };

export default function DecksPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pt-8 pb-10 sm:px-8 has-[.focus-mode]:max-w-none has-[.focus-mode]:p-0">
      <RequireAuth next="/bo-the">
        <DeckHome />
      </RequireAuth>
    </main>
  );
}
