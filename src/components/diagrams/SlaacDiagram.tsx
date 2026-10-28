import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams.slaac

// 세로형은 라우터와 호스트 A를 맨 위 양쪽에 두고, 그 아래에 호스트 A의 IPv6 주소를 앞부분(접두사)과 뒷부분(인터페이스 식별자) 두 칸으로 맞붙여 둔다.
// 주소를 나눠 주는 서버는 그리지 않는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'router', x: 8, y: 8, width: 72 },
  { id: 'host', x: 200, y: 8, width: 72 },
  { id: 'prefix', x: 24, y: 100, width: 100 },
  { id: 'iid', x: 124, y: 100, width: 132 },
]

// 화살표는 라우터 알림이 라우터에서 호스트 A로 가는 길과, 호스트 A가 뒷부분 칸을 스스로 만드는 것이다.
const paths: Record<string, string> = {
  'advert': 'M80 24 H200',
  'make-iid': 'M248 40 V100',
}

// 칸 이름 곁말은 늘 보이고 자기 칸 가운데 위에 놓여 그 칸의 흐림을 따른다.
const cellNotes = [
  { id: 'prefix-name', cell: 'prefix', x: 74, y: 92, anchor: 'middle' as const },
  { id: 'iid-name', cell: 'iid', x: 190, y: 92, anchor: 'middle' as const },
]

// 시나리오 곁말 — 라우터가 알린 접두사는 알림 화살표 아래에, 두 칸을 이은 주소는 띠 아래에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'advert', x: 140, y: 56, anchor: 'middle', scenarios: ['advertise'] },
  { id: 'address', x: 140, y: 152, anchor: 'middle', scenarios: ['combine'] },
]

// 가로형은 라우터와 호스트 A를 더 멀리 떼어 두고, 두 칸을 그 아래 가운데에 둔다.
const wideNodes = [
  { id: 'router', x: 48, y: 8, width: 72 },
  { id: 'host', x: 320, y: 8, width: 72 },
  { id: 'prefix', x: 104, y: 76, width: 100 },
  { id: 'iid', x: 204, y: 76, width: 132 },
]

const widePaths: Record<string, string> = {
  'advert': 'M120 24 H320',
  'make-iid': 'M328 40 V76',
}

// 곁말의 자리만 배치마다 다르다. 이름이 붙는 칸과 보이는 시나리오는 세로형에서 id로 가져온다.
const wideCellNotes = [
  { id: 'prefix-name', x: 154, y: 68, anchor: 'middle' as const },
  { id: 'iid-name', x: 270, y: 68, anchor: 'middle' as const },
]

const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'advert', x: 220, y: 52, anchor: 'middle' },
  { id: 'address', x: 220, y: 124, anchor: 'middle' },
]

// 접두사를 알리는 동안에는 아직 뒷부분이 없고, 주소를 만드는 동안 라우터는 하는 일이 없어 흐려진다.
export const slaacScenarios: DiagramScenario[] = [
  { id: 'advertise', nodes: ['router', 'host', 'prefix'], paths: ['advert'] },
  { id: 'combine', nodes: ['host', 'prefix', 'iid'], paths: ['make-iid'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SlaacDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-slaac-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutCellNotes = wide ? wideCellNotes.map((note) => ({ ...cellNotes.find(({ id }) => id === note.id)!, ...note })) : cellNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={slaacScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 132' : '0 0 280 160'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {active?.paths.map((id) => (
            <path
              key={id}
              data-path={id}
              d={layoutPaths[id]}
              className="fill-none stroke-title"
              strokeWidth="2"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutCellNotes.map((note) => (
            <text key={note.id} data-cell-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.cell)}>
              {text.notes![note.id]}
            </text>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
