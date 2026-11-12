import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['soa-fields']

// 세로형은 SOA 레코드의 필드 일곱을 데이터에 적는 차례대로 위에서 아래로 쌓는다. 필드마다 「필드 이름 | 값」 한 줄이고,
// 이름 칸 바로 오른쪽에 값 칸이 맞닿는다. RNAME 아래에 그 값을 메일 주소로 읽은 칸을 두고 늘 보이는 선으로 잇는다.
// 보조 서버가 쓰는 REFRESH·RETRY·EXPIRE는 상자로 묶는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'mname-name', x: 16, y: 30, width: 64 },
  { id: 'mname-value', x: 80, y: 30, width: 160 },
  { id: 'rname-name', x: 16, y: 62, width: 64 },
  { id: 'rname-value', x: 80, y: 62, width: 160 },
  { id: 'mail', x: 80, y: 106, width: 160 },
  { id: 'serial-name', x: 16, y: 150, width: 64 },
  { id: 'serial-value', x: 80, y: 150, width: 160 },
  { id: 'refresh-name', x: 16, y: 210, width: 64 },
  { id: 'refresh-value', x: 80, y: 210, width: 160 },
  { id: 'retry-name', x: 16, y: 242, width: 64 },
  { id: 'retry-value', x: 80, y: 242, width: 160 },
  { id: 'expire-name', x: 16, y: 274, width: 64 },
  { id: 'expire-value', x: 80, y: 274, width: 160 },
  { id: 'minimum-name', x: 16, y: 322, width: 64 },
  { id: 'minimum-value', x: 80, y: 322, width: 160 },
]

const groups = [
  { id: 'secondary', x: 8, y: 190, width: 240, height: 124, labelX: 16, labelY: 203 },
]

// rname-mail은 RNAME의 값 칸과 그 값을 메일 주소로 읽은 칸을 잇는 선으로 늘 보인다.
const paths: Record<string, string> = {
  'rname-mail': 'M160 94 V106',
}

const linkIds = ['rname-mail']

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'rname-note', x: 16, y: 125, anchor: 'start', scenarios: ['who'] },
]

// 가로형은 두 열이다. 왼쪽 열에 MNAME·RNAME·메일 주소·SERIAL을, 오른쪽 열에 보조 서버의 일정 상자와 MINIMUM을 둔다.
// 왼쪽 열 위에서 아래로, 다음에 오른쪽 열 위에서 아래로 읽으면 데이터에 적는 차례다.
const wideNodes = [
  { id: 'mname-name', x: 16, y: 30, width: 64 },
  { id: 'mname-value', x: 80, y: 30, width: 160 },
  { id: 'rname-name', x: 16, y: 62, width: 64 },
  { id: 'rname-value', x: 80, y: 62, width: 160 },
  { id: 'mail', x: 80, y: 106, width: 160 },
  { id: 'serial-name', x: 16, y: 150, width: 64 },
  { id: 'serial-value', x: 80, y: 150, width: 160 },
  { id: 'refresh-name', x: 260, y: 30, width: 64 },
  { id: 'refresh-value', x: 324, y: 30, width: 100 },
  { id: 'retry-name', x: 260, y: 62, width: 64 },
  { id: 'retry-value', x: 324, y: 62, width: 100 },
  { id: 'expire-name', x: 260, y: 94, width: 64 },
  { id: 'expire-value', x: 324, y: 94, width: 100 },
  { id: 'minimum-name', x: 260, y: 150, width: 64 },
  { id: 'minimum-value', x: 324, y: 150, width: 100 },
]

const wideGroups = [
  { id: 'secondary', x: 252, y: 8, width: 180, height: 126, labelX: 260, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'rname-mail': 'M160 94 V106',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'rname-note', x: 16, y: 125, anchor: 'start' },
]

// 서버와 책임자: MNAME·RNAME과 메일 주소. 판 번호: SERIAL. 보조 서버의 일정: REFRESH·RETRY·EXPIRE.
export const soaFieldsScenarios: DiagramScenario[] = [
  { id: 'who', nodes: ['mname-name', 'mname-value', 'rname-name', 'rname-value', 'mail'], paths: [] },
  { id: 'version', nodes: ['serial-name', 'serial-value'], paths: [] },
  { id: 'secondary', nodes: ['refresh-name', 'refresh-value', 'retry-name', 'retry-value', 'expire-name', 'expire-value'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SoaFieldsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={soaFieldsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 190' : '0 0 280 362'}>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.labelX} y={group.labelY} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
          ))}

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
