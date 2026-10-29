import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['routing'].diagrams['as-path']

// 세로형은 AS 1·AS 2·AS 3 상자를 위에서 아래로 쌓고, AS마다 라우터 하나를 왼쪽 같은 열에 둔다.
// AS 3 상자에는 라우터 오른쪽에 네트워크를 둔다. 두 상자 사이의 틈에 AS 경로 곁말을 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'router-1', x: 24, y: 28, width: 64 },
  { id: 'router-2', x: 24, y: 120, width: 64 },
  { id: 'router-3', x: 24, y: 212, width: 64 },
  { id: 'network', x: 104, y: 212, width: 156 },
]

const groups = [
  { id: 'as-1', x: 8, y: 8, width: 264, height: 60, labelX: 16, labelY: 22 },
  { id: 'as-2', x: 8, y: 100, width: 264, height: 60, labelX: 16, labelY: 114 },
  { id: 'as-3', x: 8, y: 192, width: 264, height: 60, labelX: 16, labelY: 206 },
]

// 연결 셋은 늘 보인다. 경로 정보를 알리는 화살표는 연결 양옆에 둔다 — AS 3에서 AS 1 쪽으로 알리는 것은 왼쪽, 되돌려 알리는 것은 오른쪽.
const paths: Record<string, string> = {
  'link-1-2': 'M56 60 V120',
  'link-2-3': 'M56 152 V212',
  'link-3-net': 'M88 228 H104',
  'announce-3-2': 'M48 212 V152',
  'announce-2-1': 'M48 120 V60',
  'return-1-2': 'M64 60 V120',
}

const linkIds = ['link-1-2', 'link-2-3', 'link-3-net']

// AS 경로 곁말은 그 경로를 실어 나르는 화살표 오른쪽, 두 상자 사이의 틈에 둔다. 고리 판정 곁말은 받는 AS 2 상자 안에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'path-3', x: 72, y: 180, anchor: 'start', scenarios: ['path'] },
  { id: 'path-2', x: 72, y: 88, anchor: 'start', scenarios: ['path'] },
  { id: 'loop-path', x: 72, y: 88, anchor: 'start', scenarios: ['loop'] },
  { id: 'loop-own', x: 104, y: 132, anchor: 'start', scenarios: ['loop'] },
  { id: 'loop-skip', x: 104, y: 146, anchor: 'start', scenarios: ['loop'] },
]

// 가로형은 왼쪽에서 오른쪽으로 AS 1·AS 2·AS 3 상자를 한 줄에 두고, AS 3 상자에는 라우터 오른쪽에 네트워크를 둔다.
// 곁말은 상자 아래 띠에, 자기 화살표가 지나는 두 상자 사이의 틈 아래에 둔다.
const wideNodes = [
  { id: 'router-1', x: 16, y: 28, width: 56 },
  { id: 'router-2', x: 106, y: 28, width: 56 },
  { id: 'router-3', x: 196, y: 28, width: 56 },
  { id: 'network', x: 268, y: 28, width: 156 },
]

const wideGroups = [
  { id: 'as-1', x: 8, y: 8, width: 72, height: 60, labelX: 16, labelY: 22 },
  { id: 'as-2', x: 98, y: 8, width: 72, height: 60, labelX: 106, labelY: 22 },
  { id: 'as-3', x: 188, y: 8, width: 244, height: 60, labelX: 196, labelY: 22 },
]

const widePaths: Record<string, string> = {
  'link-1-2': 'M72 44 H106',
  'link-2-3': 'M162 44 H196',
  'link-3-net': 'M252 44 H268',
  'announce-3-2': 'M196 38 H162',
  'announce-2-1': 'M106 38 H72',
  'return-1-2': 'M72 50 H106',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'path-3', x: 179, y: 88, anchor: 'middle' },
  { id: 'path-2', x: 89, y: 102, anchor: 'middle' },
  { id: 'loop-path', x: 89, y: 88, anchor: 'middle' },
  { id: 'loop-own', x: 134, y: 102, anchor: 'middle' },
  { id: 'loop-skip', x: 134, y: 116, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 연결을 함께 적는다. 「AS 경로」는 모두, 「고리 막기」는 되돌려 알리는 AS 1·AS 2의 라우터와 그 연결이다.
export const asPathScenarios: DiagramScenario[] = [
  { id: 'path', nodes: ['router-1', 'router-2', 'router-3', 'network', 'link-1-2', 'link-2-3', 'link-3-net'], paths: ['announce-3-2', 'announce-2-1'] },
  { id: 'loop', nodes: ['router-1', 'router-2', 'link-1-2'], paths: ['return-1-2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AsPathDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-as-path-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={asPathScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 128' : '0 0 280 260'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
