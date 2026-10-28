import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId.ethernet.diagrams['fcs-check']

// 보내는 컴퓨터를 위에, 케이블을 가운데 두 박스 밖에, 받는 컴퓨터를 아래에 둔다.
// 받는 컴퓨터 안에서는 다시 계산해 비교하는 노드 오른쪽에 위 계층을 둔다.
const groups = [
  { id: 'sender', x: 8, y: 8, width: 264, height: 64 },
  { id: 'receiver', x: 8, y: 152, width: 264, height: 88 },
]

// 노드는 모두 회색이다.
const nodes = [
  { id: 'attach', x: 24, y: 32, width: 104 },
  { id: 'cable', x: 24, y: 104, width: 104 },
  { id: 'check', x: 24, y: 176, width: 104 },
  { id: 'upper', x: 176, y: 176, width: 80 },
]

// 연결선 셋은 늘 보인다. 화살표는 그 위에 겹쳐 그리고, 프레임이 보내는 쪽에서 케이블을 지나 받는 쪽으로 간다.
// 받는 쪽에서 보내는 쪽으로 되돌아가는 선은 없다 — 이더넷은 다시 보내 달라고 알리지 않는다.
const paths: Record<string, string> = {
  'attach-cable': 'M76 64 V104',
  'cable-check': 'M76 136 V176',
  'check-upper': 'M128 192 H176',
  'send': 'M76 64 V104',
  'arrive': 'M76 136 V176',
  'deliver': 'M128 192 H176',
}

const linkIds = ['attach-cable', 'cable-check', 'check-upper']

// 손상 곁말은 케이블 오른쪽에, 비교 결과 곁말은 비교 노드 아래에 둔다. 시나리오마다 보이는 곁말이 다르다.
const notes = [
  { id: 'damage', x: 136, y: 124, textAnchor: 'start' as const, scenarios: ['mismatch'] },
  { id: 'same', x: 76, y: 230, textAnchor: 'middle' as const, scenarios: ['match'] },
  { id: 'discard', x: 76, y: 230, textAnchor: 'middle' as const, scenarios: ['mismatch'] },
]

// 가로형은 보내는 컴퓨터를 왼쪽, 케이블을 가운데, 받는 컴퓨터를 오른쪽에 둔다.
const wideGroups = [
  { id: 'sender', x: 8, y: 8, width: 120, height: 80 },
  { id: 'receiver', x: 232, y: 8, width: 200, height: 80 },
]

const wideNodes = [
  { id: 'attach', x: 16, y: 40, width: 104 },
  { id: 'cable', x: 152, y: 40, width: 56 },
  { id: 'check', x: 240, y: 40, width: 104 },
  { id: 'upper', x: 364, y: 40, width: 60 },
]

const widePaths: Record<string, string> = {
  'attach-cable': 'M120 56 H152',
  'cable-check': 'M208 56 H240',
  'check-upper': 'M344 56 H364',
  'send': 'M120 56 H152',
  'arrive': 'M208 56 H240',
  'deliver': 'M344 56 H364',
}

// 곁말은 자기 노드 아래 가운데에 둔다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'damage', x: 180, y: 100, textAnchor: 'middle' as const },
  { id: 'same', x: 292, y: 100, textAnchor: 'middle' as const },
  { id: 'discard', x: 292, y: 100, textAnchor: 'middle' as const },
]

// nodes에는 선명하게 둘 노드와 연결선을 함께 적는다.
export const fcsCheckScenarios: DiagramScenario[] = [
  { id: 'match', nodes: ['attach', 'cable', 'check', 'upper', 'attach-cable', 'cable-check', 'check-upper'], paths: ['send', 'arrive', 'deliver'] },
  { id: 'mismatch', nodes: ['attach', 'cable', 'check', 'attach-cable', 'cable-check'], paths: ['send', 'arrive'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FcsCheckDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-fcs-check-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={fcsCheckScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 108' : '0 0 280 248'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
