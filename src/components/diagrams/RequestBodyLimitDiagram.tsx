import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-servers'].diagrams['request-body-limit']

// 세로형은 맨 위에 한도 줄 LimitRequestBody 1048576, 그 아래 그 값의 계산(1048576 = 1024 × 1024 = 1MiB)을 두고 가는 선으로 잇는다.
// 그 아래 왼쪽 열에 본문 500KiB 요청 → 받아 처리한다, 오른쪽 열에 본문 2MiB 요청 → 오류로 답한다를 둔다.
const nodes = [
  { id: 'limit', x: 8, y: 8, width: 176 },
  { id: 'calc', x: 8, y: 56, width: 192 },
  { id: 'req-small', x: 8, y: 120, width: 112 },
  { id: 'req-large', x: 144, y: 120, width: 112 },
  { id: 'accept', x: 8, y: 200, width: 112 },
  { id: 'reject', x: 144, y: 200, width: 112 },
]

// calc-link는 한도 줄과 그 계산을 잇는 선으로 늘 보인다. 나머지는 시나리오에서만 보이는 화살표다.
const paths: Record<string, string> = {
  'calc-link': 'M96 40 V56',
  'small-in': 'M64 152 V200',
  'large-in': 'M200 152 V200',
}

const linkIds = ['calc-link']

// 곁말은 자기 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'under-note', x: 72, y: 180, anchor: 'start', scenarios: ['under'] },
  { id: 'over-note', x: 208, y: 180, anchor: 'start', scenarios: ['over'] },
]

// 가로형은 한도 줄과 계산을 맨 위 한 줄에 나란히 두고, 그 아래 두 열을 넓게 벌린다.
const wideNodes = [
  { id: 'limit', x: 8, y: 8, width: 176 },
  { id: 'calc', x: 216, y: 8, width: 200 },
  { id: 'req-small', x: 40, y: 72, width: 112 },
  { id: 'req-large', x: 264, y: 72, width: 112 },
  { id: 'accept', x: 40, y: 152, width: 112 },
  { id: 'reject', x: 264, y: 152, width: 112 },
]

const widePaths: Record<string, string> = {
  'calc-link': 'M184 24 H216',
  'small-in': 'M96 104 V152',
  'large-in': 'M320 104 V152',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'under-note', x: 104, y: 132, anchor: 'start' },
  { id: 'over-note', x: 328, y: 132, anchor: 'start' },
]

// 한도 안: 본문 500KiB(512000바이트)는 한도 1048576바이트보다 작아 받아 처리한다.
// 한도 넘음: 본문 2MiB(2097152바이트)는 한도를 넘어 처리하지 않고 오류로 답한다.
export const requestBodyLimitScenarios: DiagramScenario[] = [
  { id: 'under', nodes: ['limit', 'calc', 'req-small', 'accept'], paths: ['small-in'] },
  { id: 'over', nodes: ['limit', 'calc', 'req-large', 'reject'], paths: ['large-in'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RequestBodyLimitDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-request-body-limit-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={requestBodyLimitScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 240'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" />
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
