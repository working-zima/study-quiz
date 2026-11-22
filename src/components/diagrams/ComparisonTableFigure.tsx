import type { ComparisonTable } from '../../types/visuals'

interface ComparisonTableFigureProps {
  table: ComparisonTable
}

// 판정은 색 없이 글자와 굵기로만 쓴다. 초록·빨강은 정답/오답이 점유했다(ADR-036).
const verdicts = new Set(['가능', '불가'])

// 틀은 DiagramFrame의 figure와 같다. 제목에 헤딩을 쓰지 않는 이유도 같다 — ConceptList가 화면마다 헤딩 레벨을 바꾼다.
// shortcut이 있으면 개념 읽기 머리의 바로 가기가 이 figure를 id로 가리킨다. 개념처럼 scroll-mt-24를 두어 헤더에 깔리지 않게 한다(ADR-020).
export function ComparisonTableFigure({ table }: ComparisonTableFigureProps) {
  return (
    <figure
      aria-label={table.label}
      className={`-mx-5 min-w-0 space-y-3 rounded-none border border-x-0 border-disabled bg-panel p-4 break-keep break-anywhere sm:mx-0 sm:rounded-lg sm:border-x${table.shortcut ? ' scroll-mt-24' : ''}`}
      id={table.shortcut?.id}
    >
      <p className="text-sm text-title">{table.label}</p>
      <table className="w-full table-fixed break-keep text-left text-sm">
        {table.columnWidths && (
          <colgroup>
            {table.columnWidths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr className="border-b border-disabled">
            {table.columns.map((column, index) => (
              <th className="py-2 pr-2 align-top font-medium text-muted" key={index} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr className="border-b border-disabled last:border-b-0" key={row.header}>
              <th className="py-2 pr-2 align-top font-medium text-title" scope="row">
                {row.header}
              </th>
              {row.cells.map((cell, index) => (
                <td className={`py-2 pr-2 align-top leading-6 text-body${verdicts.has(cell) ? ' font-medium' : ''}`} key={index}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
