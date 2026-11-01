import { Badge } from "@/components/ui/badge";
import type { JlptLevel } from "@/lib/types";

export function LevelTag({ level }: { level: JlptLevel | null }) {
  if (!level) return <Badge>Ngoài JLPT</Badge>;
  return <Badge tone="primary">{level}</Badge>;
}
