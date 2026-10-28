import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams.duplex

// 장치 A를 왼쪽, 장치 B를 오른쪽에 두고 케이블 하나로 잇는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'device-a', x: 12, y: 24, width: 72 },
  { id: 'device-b', x: 196, y: 24, width: 72 },
]

// 케이블은 늘 보인다. 두 방향의 화살표는 케이블 위아래에 나란히 그린다 — 위는 A에서 B로, 아래는 B에서 A로.
const paths: Record<string, string> = {
  'cable': 'M84 40 H196',
  'to-b': 'M84 32 H196',
  'to-a': 'M196 48 H84',
}

const linkIds = ['cable']

// 곁말은 장치 아래 가운데에 둔다. 반이중에서는 받는 쪽 B 곁에, 전이중에서는 두 장치 곁에 보인다.
const notes = [
  { id: 'wait-b', x: 232, y: 70, scenarios: ['half'] },
  { id: 'both-a', x: 48, y: 70, scenarios: ['full'] },
  { id: 'both-b', x: 232, y: 70, scenarios: ['full'] },
]

// 가로형도 같은 모양이다. 폭이 넓어진 만큼 장치를 넓히고 케이블을 늘린다.
const wideNodes = [
  { id: 'device-a', x: 40, y: 24, width: 96 },
  { id: 'device-b', x: 304, y: 24, width: 96 },
]

const widePaths: Record<string, string> = {
  'cable': 'M136 40 H304',
  'to-b': 'M136 32 H304',
  'to-a': 'M304 48 H136',
}

// 곁말 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'wait-b', x: 352, y: 70 },
  { id: 'both-a', x: 88, y: 70 },
  { id: 'both-b', x: 352, y: 70 },
]

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다. 두 방식 모두 두 장치와 케이블을 쓴다.
export const duplexScenarios: DiagramScenario[] = [
  { id: 'half', nodes: ['device-a', 'device-b', 'cable'], paths: ['to-b'] },
  { id: 'full', nodes: ['device-a', 'device-b', 'cable'], paths: ['to-b', 'to-a'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DuplexDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-duplex-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={duplexScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 80' : '0 0 280 80'}>
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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
