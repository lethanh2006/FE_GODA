import { Fragment } from "react";

const TOKEN = /\{([^|{}]+)\|([^|{}]+)\}/g;

/** Câu dạng "その{映画|えいが}を" → chữ Hán có furigana phía trên. */
export function Furigana({ text, className }: { text: string; className?: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    if (match.index > last) parts.push(<Fragment key={last}>{text.slice(last, match.index)}</Fragment>);
    parts.push(
      <ruby key={match.index}>
        {match[1]}
        <rt>{match[2]}</rt>
      </ruby>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<Fragment key={last}>{text.slice(last)}</Fragment>);
  return <span className={className}>{parts}</span>;
}
