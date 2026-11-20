import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-topology'].diagrams['bus-terminator']

// 세로형은 가운데 줄에 동축 케이블(버스)을 길게 두고, 그 위에 PC01·PC02, 아래에 PC03·PC04를 케이블로 잇는다.
// 터미네이터는 「터미네이터」 라벨이 들어갈 폭이 케이블 줄 양옆에 남지 않아, 케이블 두 끝에서 꺾어 내려간 선 끝(왼쪽 아래·오른쪽 아래)에 둔다.
// 되돌아오는 선은 케이블 오른쪽 끝에서 나와 케이블 위의 빈 줄을 거슬러 PC02에 닿는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc01', x: 56, y: 8, width: 64 },
  { id: 'pc02', x: 160, y: 8, width: 64 },
  { id: 'bus', x: 40, y: 64, width: 200 },
  { id: 'term-l', x: 8, y: 120, width: 72 },
  { id: 'term-r', x: 200, y: 120, width: 72 },
  { id: 'pc03', x: 56, y: 168, width: 64 },
  { id: 'pc04', x: 160, y: 168, width: 64 },
]

// 케이블 여섯은 늘 보인다. 화살표는 케이블 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'cable-pc01': 'M88 40 V64',
  'cable-pc02': 'M192 40 V64',
  'cable-pc03': 'M88 96 V168',
  'cable-pc04': 'M192 96 V168',
  'cable-term-l': 'M40 80 H24 V120',
  'cable-term-r': 'M240 80 H256 V120',
  'from-pc01': 'M88 40 V64',
  'to-pc02': 'M192 64 V40',
  'to-pc03': 'M88 96 V168',
  'to-pc04': 'M192 96 V168',
  'to-term-l': 'M40 80 H24 V120',
  'to-term-r': 'M240 80 H256 V120',
  'reflect': 'M240 72 H248 V52 H208 V40',
}

const linkIds = ['cable-pc01', 'cable-pc02', 'cable-pc03', 'cable-pc04', 'cable-term-l', 'cable-term-r']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 그림 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'send-note': 'send',
  'absorb-note': 'absorb',
  'reflect-note': 'reflect',
}

const notes: Note[] = [
  { id: 'send-note', x: 140, y: 220, anchor: 'middle' },
  { id: 'absorb-note', x: 140, y: 220, anchor: 'middle' },
  { id: 'reflect-note', x: 140, y: 220, anchor: 'middle' },
]

// 가로형은 케이블 줄 양옆에 터미네이터를 바로 잇고, 케이블 위에 PC01·PC02, 아래에 PC03·PC04를 둔다.
const wideNodes = [
  { id: 'pc01', x: 128, y: 8, width: 64 },
  { id: 'pc02', x: 248, y: 8, width: 64 },
  { id: 'bus', x: 104, y: 64, width: 232 },
  { id: 'term-l', x: 8, y: 64, width: 80 },
  { id: 'term-r', x: 352, y: 64, width: 80 },
  { id: 'pc03', x: 128, y: 120, width: 64 },
  { id: 'pc04', x: 248, y: 120, width: 64 },
]

const widePaths: Record<string, string> = {
  'cable-pc01': 'M160 40 V64',
  'cable-pc02': 'M280 40 V64',
  'cable-pc03': 'M160 96 V120',
  'cable-pc04': 'M280 96 V120',
  'cable-term-l': 'M104 80 H88',
  'cable-term-r': 'M336 80 H352',
  'from-pc01': 'M160 40 V64',
  'to-pc02': 'M280 64 V40',
  'to-pc03': 'M160 96 V120',
  'to-pc04': 'M280 96 V120',
  'to-term-l': 'M104 80 H88',
  'to-term-r': 'M336 80 H352',
  'reflect': 'M336 72 H344 V52 H296 V40',
}

const wideNotes: Note[] = [
  { id: 'send-note', x: 220, y: 172, anchor: 'middle' },
  { id: 'absorb-note', x: 220, y: 172, anchor: 'middle' },
  { id: 'reflect-note', x: 220, y: 172, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다.
// 모두에게 닿기: PC01의 신호가 케이블을 따라 나머지 셋에 닿는다. 터미네이터가 있으면: 양 끝에 닿은 신호가 거기서 끝난다.
// 터미네이터가 빠지면: 오른쪽 터미네이터와 그 케이블이 흐려지고, 오른쪽 끝에서 되돌아온 신호가 PC02에 닿는다.
export const busTerminatorScenarios: DiagramScenario[] = [
  {
    id: 'send',
    nodes: ['pc01', 'pc02', 'bus', 'term-l', 'term-r', 'pc03', 'pc04', ...linkIds],
    paths: ['from-pc01', 'to-pc02', 'to-pc03', 'to-pc04'],
  },
  {
    id: 'absorb',
    nodes: ['bus', 'term-l', 'term-r', 'cable-term-l', 'cable-term-r'],
    paths: ['to-term-l', 'to-term-r'],
  },
  {
    id: 'reflect',
    nodes: ['pc02', 'bus', 'term-l', 'cable-pc02', 'cable-term-l'],
    paths: ['reflect'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function BusTerminatorDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-bus-terminator-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={busTerminatorScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 232'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
          ))}

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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
