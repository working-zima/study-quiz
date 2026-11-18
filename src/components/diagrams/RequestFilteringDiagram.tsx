import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['request-filtering']

// 세로형은 위에 사이트로 온 요청 둘을 상자로 묶어 두고, 가운데에 요청 필터링을 넓게 두고, 아래에 사이트와 오류 응답을 둔다.
// 요청마다 그 바로 아래 줄로 곧게 내려가도록 통과하는 요청은 왼쪽 열, 거부되는 요청은 오른쪽 열에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'req-ok', x: 24, y: 28, width: 120 },
  { id: 'req-bak', x: 184, y: 28, width: 72 },
  { id: 'filter', x: 16, y: 104, width: 248 },
  { id: 'site', x: 16, y: 168, width: 152 },
  { id: 'blocked', x: 176, y: 168, width: 96 },
]

const groups = [
  { id: 'requests', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 21 },
]

// 화살표는 요청 노드의 아래 변에서 나와 요청 필터링의 위 변에 닿고, 요청 필터링의 아래 변에서 나와 사이트나 오류 응답의 위 변에 닿는다.
const paths: Record<string, string> = {
  'ok-filter': 'M84 60 V104',
  'bak-filter': 'M220 60 V104',
  'filter-site': 'M84 136 V168',
  'filter-block': 'M220 136 V168',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'ok-key': 'allowed',
  'bak-key': 'denied',
  'log-key': 'denied',
}

const notes: Note[] = [
  { id: 'ok-key', x: 16, y: 216, anchor: 'start' },
  { id: 'bak-key', x: 212, y: 88, anchor: 'end' },
  { id: 'log-key', x: 176, y: 216, anchor: 'start' },
]

// 가로형은 같은 세 줄을 넓혀 두 열 사이를 벌리고, 통과 곁말과 로그 곁말을 요청 필터링과 아래 줄 사이에 둔다.
const wideNodes = [
  { id: 'req-ok', x: 56, y: 28, width: 120 },
  { id: 'req-bak', x: 280, y: 28, width: 72 },
  { id: 'filter', x: 16, y: 104, width: 408 },
  { id: 'site', x: 40, y: 168, width: 152 },
  { id: 'blocked', x: 268, y: 168, width: 96 },
]

const wideGroups = [
  { id: 'requests', x: 8, y: 8, width: 424, height: 64, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'ok-filter': 'M116 60 V104',
  'bak-filter': 'M316 60 V104',
  'filter-site': 'M116 136 V168',
  'filter-block': 'M316 136 V168',
}

const wideNotes: Note[] = [
  { id: 'ok-key', x: 124, y: 152, anchor: 'start' },
  { id: 'bak-key', x: 324, y: 88, anchor: 'start' },
  { id: 'log-key', x: 324, y: 152, anchor: 'start' },
]

// 통과: /docs/guide.html 요청·요청 필터링·사이트. 거부: /db.bak 요청·요청 필터링·HTTP 404 오류.
export const requestFilteringScenarios: DiagramScenario[] = [
  { id: 'allowed', nodes: ['req-ok', 'filter', 'site'], paths: ['ok-filter', 'filter-site'] },
  { id: 'denied', nodes: ['req-bak', 'filter', 'blocked'], paths: ['bak-filter', 'filter-block'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RequestFilteringDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-request-filtering-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={requestFilteringScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 224'}>
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
