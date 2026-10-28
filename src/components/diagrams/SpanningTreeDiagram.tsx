import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams['spanning-tree']

// 스위치 셋을 링크 셋으로 서로 이은 고리다. 경로가 직교선이라 삼각형 대신 사각 고리로 놓는다 —
// 스위치 1·2를 위에 나란히, 스위치 3을 그 아래 가운데에 두고, 호스트 A는 스위치 1에 잇는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-a', x: 10, y: 8, width: 76 },
  { id: 'switch-1', x: 10, y: 72, width: 76 },
  { id: 'switch-2', x: 194, y: 72, width: 76 },
  { id: 'switch-3', x: 102, y: 168, width: 76 },
]

// 케이블과 링크는 늘 보이고, 막히거나 끊긴 링크만 흐려진다. 화살표는 링크 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'cable-a': 'M48 40 V72',
  'link-12': 'M86 88 H194',
  'link-23': 'M232 104 V184 H178',
  'link-31': 'M102 184 H48 V104',
  'from-a': 'M48 40 V72',
  's1-s2': 'M86 88 H194',
  's2-s3': 'M232 104 V184 H178',
  's3-s1': 'M102 184 H48 V104',
  's1-s3': 'M48 104 V184 H102',
  's3-s2': 'M178 184 H232 V104',
}

const linkIds = ['cable-a', 'link-12', 'link-23', 'link-31']

// 고리를 돈다는 곁말은 고리 안쪽 가운데에, 끊김은 끊긴 링크 바로 위에, 막음·전달 상태로 바꿈은 막은 링크가 스위치 3에 닿는 곳 바로 아래에 둔다.
const notes = [
  { id: 'loop-note', x: 140, y: 136, anchor: 'middle' as const, scenarios: ['loop'] },
  { id: 'blocked', x: 184, y: 200, anchor: 'start' as const, scenarios: ['stp'] },
  { id: 'broken', x: 140, y: 80, anchor: 'middle' as const, scenarios: ['failover'] },
  { id: 'reopened', x: 184, y: 200, anchor: 'start' as const, scenarios: ['failover'] },
]

// 가로형은 호스트 A를 스위치 1 왼쪽에 두고, 고리를 옆으로 넓혀 높이를 줄인다.
const wideNodes = [
  { id: 'host-a', x: 14, y: 32, width: 88 },
  { id: 'switch-1', x: 150, y: 32, width: 88 },
  { id: 'switch-2', x: 338, y: 32, width: 88 },
  { id: 'switch-3', x: 244, y: 112, width: 88 },
]

const widePaths: Record<string, string> = {
  'cable-a': 'M102 48 H150',
  'link-12': 'M238 48 H338',
  'link-23': 'M382 64 V128 H332',
  'link-31': 'M244 128 H194 V64',
  'from-a': 'M102 48 H150',
  's1-s2': 'M238 48 H338',
  's2-s3': 'M382 64 V128 H332',
  's3-s1': 'M244 128 H194 V64',
  's1-s3': 'M194 64 V128 H244',
  's3-s2': 'M332 128 H382 V64',
}

// 곁말의 자리만 배치마다 다르다. 글자 정렬과 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'loop-note', x: 288, y: 88 },
  { id: 'blocked', x: 338, y: 144 },
  { id: 'broken', x: 288, y: 40 },
  { id: 'reopened', x: 338, y: 144 },
]

// nodes에는 선명하게 둘 노드와 링크를 함께 적는다. 막은 링크(STP를 쓰면)와 끊긴 링크(링크가 끊기면)만 흐려진다.
// STP가 없으면 화살표가 스위치 1 → 2 → 3 → 1로 고리를 돈다. 반대 방향으로 도는 프레임은 캡션이 말한다.
export const spanningTreeScenarios: DiagramScenario[] = [
  { id: 'loop', nodes: ['host-a', 'switch-1', 'switch-2', 'switch-3', 'cable-a', 'link-12', 'link-23', 'link-31'], paths: ['from-a', 's1-s2', 's2-s3', 's3-s1'] },
  { id: 'stp', nodes: ['host-a', 'switch-1', 'switch-2', 'switch-3', 'cable-a', 'link-12', 'link-31'], paths: ['from-a', 's1-s2', 's1-s3'] },
  { id: 'failover', nodes: ['host-a', 'switch-1', 'switch-2', 'switch-3', 'cable-a', 'link-23', 'link-31'], paths: ['from-a', 's1-s3', 's3-s2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SpanningTreeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-spanning-tree-arrow`
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
      scenarios={spanningTreeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 216'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
