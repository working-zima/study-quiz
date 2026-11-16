import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['organizational-unit']

// 세로형은 도메인 박스 맨 위에 GPO와 관리 담당을 나란히 두고, 그 아래에 OU 영업팀과 OU 개발팀을 위아래로 쌓는다.
// GPO는 도메인에 저장되지만 어느 OU에도 들지 않으므로 OU 박스 밖에 둔다. 두 화살표는 OU 영업팀 박스의 위 변에서 끝난다.
const nodes = [
  { id: 'gpo', x: 16, y: 24, width: 124 },
  { id: 'admin', x: 148, y: 24, width: 120 },
  { id: 'user', x: 28, y: 100, width: 100 },
  { id: 'pc', x: 152, y: 100, width: 100 },
  { id: 'dev', x: 28, y: 168, width: 112 },
]

const groups = [
  { id: 'domain', x: 4, y: 4, width: 272, height: 212, labelX: 12, labelY: 17 },
  { id: 'sales-ou', x: 12, y: 80, width: 256, height: 60, labelX: 20, labelY: 93 },
  { id: 'dev-ou', x: 12, y: 148, width: 256, height: 60, labelX: 20, labelY: 161 },
]

const paths: Record<string, string> = {
  'gpo-sales': 'M78 56 V80',
  'admin-sales': 'M208 56 V80',
}

// 곁말은 자기 시나리오에서만 보인다. 「영업팀 안에 적용」은 GPO 화살표 오른쪽에, 「관리를 맡긴다」는 관리 담당 화살표 왼쪽에,
// 「정책이 걸리지 않음」은 개발팀 노드 오른쪽에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'policy-note', x: 86, y: 72, anchor: 'start', scenarios: ['policy'] },
  { id: 'dev-note', x: 148, y: 188, anchor: 'start', scenarios: ['policy'] },
  { id: 'delegate-note', x: 200, y: 72, anchor: 'end', scenarios: ['delegate'] },
]

// 가로형은 OU 영업팀과 OU 개발팀을 나란히 놓는다. GPO와 관리 담당은 OU 영업팀 위에 선다.
// 「정책이 걸리지 않음」은 OU 개발팀 박스 안, 개발팀 노드 아래에 놓인다.
const wideNodes = [
  { id: 'gpo', x: 24, y: 24, width: 124 },
  { id: 'admin', x: 164, y: 24, width: 124 },
  { id: 'user', x: 28, y: 100, width: 100 },
  { id: 'pc', x: 172, y: 100, width: 100 },
  { id: 'dev', x: 308, y: 100, width: 112 },
]

const wideGroups = [
  { id: 'domain', x: 4, y: 4, width: 432, height: 164, labelX: 12, labelY: 17 },
  { id: 'sales-ou', x: 12, y: 80, width: 276, height: 60, labelX: 20, labelY: 93 },
  { id: 'dev-ou', x: 296, y: 80, width: 132, height: 80, labelX: 304, labelY: 93 },
]

const widePaths: Record<string, string> = {
  'gpo-sales': 'M86 56 V80',
  'admin-sales': 'M226 56 V80',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'policy-note', x: 94, y: 72, anchor: 'start' },
  { id: 'dev-note', x: 310, y: 152, anchor: 'start' },
  { id: 'delegate-note', x: 218, y: 72, anchor: 'end' },
]

// 나눠 담기: OU 안의 계정과 PC. 정책 연결: GPO와 OU 영업팀 안의 개체. 관리 맡기기: 관리 담당과 OU 영업팀 안의 개체.
export const organizationalUnitScenarios: DiagramScenario[] = [
  { id: 'contain', nodes: ['user', 'pc', 'dev'], paths: [] },
  { id: 'policy', nodes: ['gpo', 'user', 'pc'], paths: ['gpo-sales'] },
  { id: 'delegate', nodes: ['admin', 'user', 'pc'], paths: ['admin-sales'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function OrganizationalUnitDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-organizational-unit-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={organizationalUnitScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 224'}>
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
