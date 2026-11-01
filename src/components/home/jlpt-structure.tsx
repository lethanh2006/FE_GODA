const STRUCTURE = [
  { level: "N1", vocab: "110分", grammar: null, listening: "55分", pass: "100/180" },
  { level: "N2", vocab: "105分", grammar: null, listening: "50分", pass: "90/180" },
  { level: "N3", vocab: "30分", grammar: "70分", listening: "40分", pass: "95/180" },
  { level: "N4", vocab: "25分", grammar: "55分", listening: "35分", pass: "90/180" },
  { level: "N5", vocab: "20分", grammar: "40分", listening: "30分", pass: "80/180" },
];

export function JlptStructureTable() {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-subtle/60 text-xs text-muted">
            <th className="px-5 py-3 font-medium">Cấp</th>
            <th className="jp px-5 py-3 font-medium">言語知識（文字・語彙）</th>
            <th className="jp px-5 py-3 font-medium">言語知識（文法）・読解</th>
            <th className="jp px-5 py-3 font-medium">聴解</th>
            <th className="px-5 py-3 text-right font-medium">Điểm đỗ</th>
          </tr>
        </thead>
        <tbody className="jp tabular-nums">
          {STRUCTURE.map((row) => (
            <tr key={row.level} className="border-b border-border last:border-0">
              <td className="px-5 py-3 font-sans font-semibold">{row.level}</td>
              {row.grammar ? (
                <>
                  <td className="px-5 py-3">{row.vocab}</td>
                  <td className="px-5 py-3">{row.grammar}</td>
                </>
              ) : (
                <td className="px-5 py-3" colSpan={2}>
                  {row.vocab} <span className="font-sans text-xs text-muted">(gộp chung)</span>
                </td>
              )}
              <td className="px-5 py-3">{row.listening}</td>
              <td className="px-5 py-3 text-right font-sans font-medium">{row.pass}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
