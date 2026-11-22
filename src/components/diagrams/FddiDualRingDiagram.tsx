import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-topology'].diagrams['fddi-dual-ring']

// 세로형은 네 노드를 사각형 둘레에 놓는다 — 왼쪽 위 A, 오른쪽 위 B, 오른쪽 아래 C, 왼쪽 아래 D. 노드는 모두 회색이다.
// 이웃한 두 노드 사이마다 한 방향 링크가 둘이다 — 고리 안쪽의 링크가 1차 링(A → B → C → D → A),
// 바깥쪽의 링크가 그 반대로 도는 2차 링(A → D → C → B → A)이다. 원으로 그리지 않고 직교 선으로 잇는다.
const nodes = [
  { id: 'a', x: 40, y: 24, width: 56 },
  { id: 'b', x: 184, y: 24, width: 56 },
  { id: 'c', x: 184, y: 152, width: 56 },
  { id: 'd', x: 40, y: 152, width: 56 },
]

// 링크 여덟은 늘 보이고, 가는 회색 화살표로 도는 방향을 가리킨다. 데이터의 굵은 화살표는 링크 위에 겹쳐 그린다.
// 래핑 화살표(wrap-b·wrap-c)는 끊긴 쪽을 향한 노드의 변에서 나가 같은 변으로 돌아와, 그 노드가 두 링을 잇는 것을 보인다.
const paths: Record<string, string> = {
  'p-ab': 'M96 48 H184',
  'p-bc': 'M200 56 V152',
  'p-cd': 'M184 160 H96',
  'p-da': 'M80 152 V56',
  's-ba': 'M184 32 H96',
  's-cb': 'M224 152 V56',
  's-dc': 'M96 176 H184',
  's-ad': 'M56 56 V152',
  'flow-p-ab': 'M96 48 H184',
  'flow-p-bc': 'M200 56 V152',
  'flow-p-cd': 'M184 160 H96',
  'flow-p-da': 'M80 152 V56',
  'flow-s-ba': 'M184 32 H96',
  'flow-s-ad': 'M56 56 V152',
  'flow-s-dc': 'M96 176 H184',
  'wrap-b': 'M200 56 V68 H224 V56',
  'wrap-c': 'M224 152 V140 H200 V152',
}

const linkIds = ['p-ab', 'p-bc', 'p-cd', 'p-da', 's-ba', 's-cb', 's-dc', 's-ad']

// 끊긴 뒤 장면에서는 B와 C 사이의 두 링크가 흐려진다.
const fadedLinks: Record<string, string[]> = {
  wrap: ['p-bc', 's-cb'],
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 고리 안쪽의 곁말은 데이터가 어떻게 도는지를, 「끊김」은 끊긴 자리를,
// 그림 아래의 곁말은 그 장면에서 두 링이 어떤 구실을 하는지를 밝힌다.
const noteScenarios: Record<string, string> = {
  'normal-center': 'normal',
  'normal-note': 'normal',
  'wrap-center': 'wrap',
  'wrap-break': 'wrap',
  'wrap-note': 'wrap',
}

const notes: Note[] = [
  { id: 'normal-center', x: 140, y: 108, anchor: 'middle' },
  { id: 'normal-note', x: 140, y: 206, anchor: 'middle' },
  { id: 'wrap-center', x: 140, y: 108, anchor: 'middle' },
  { id: 'wrap-break', x: 236, y: 108, anchor: 'start' },
  { id: 'wrap-note', x: 140, y: 206, anchor: 'middle' },
]

// 가로형도 같은 사각형 둘레에 놓되 가로로 넓게 벌린다.
const wideNodes = [
  { id: 'a', x: 96, y: 24, width: 56 },
  { id: 'b', x: 288, y: 24, width: 56 },
  { id: 'c', x: 288, y: 120, width: 56 },
  { id: 'd', x: 96, y: 120, width: 56 },
]

const widePaths: Record<string, string> = {
  'p-ab': 'M152 48 H288',
  'p-bc': 'M304 56 V120',
  'p-cd': 'M288 128 H152',
  'p-da': 'M136 120 V56',
  's-ba': 'M288 32 H152',
  's-cb': 'M328 120 V56',
  's-dc': 'M152 144 H288',
  's-ad': 'M112 56 V120',
  'flow-p-ab': 'M152 48 H288',
  'flow-p-bc': 'M304 56 V120',
  'flow-p-cd': 'M288 128 H152',
  'flow-p-da': 'M136 120 V56',
  'flow-s-ba': 'M288 32 H152',
  'flow-s-ad': 'M112 56 V120',
  'flow-s-dc': 'M152 144 H288',
  'wrap-b': 'M304 56 V68 H328 V56',
  'wrap-c': 'M328 120 V108 H304 V120',
}

const wideNotes: Note[] = [
  { id: 'normal-center', x: 220, y: 92, anchor: 'middle' },
  { id: 'normal-note', x: 220, y: 172, anchor: 'middle' },
  { id: 'wrap-center', x: 220, y: 92, anchor: 'middle' },
  { id: 'wrap-break', x: 340, y: 92, anchor: 'start' },
  { id: 'wrap-note', x: 220, y: 172, anchor: 'middle' },
]

// 1차 링: 고장이 없을 때 데이터가 1차 링을 따라 A → B → C → D → A 차례로 돈다.
// 끊긴 뒤: B와 C 사이의 두 링크가 끊겨, B는 1차 링으로 받은 데이터를 2차 링으로 돌려 A 쪽으로, C는 2차 링으로 받은 데이터를
// 1차 링으로 돌려 D 쪽으로 내보낸다. 화살표를 차례로 따라가면 A → B → A → D → C → D → A의 고리 하나가 된다.
export const fddiDualRingScenarios: DiagramScenario[] = [
  {
    id: 'normal',
    nodes: ['a', 'b', 'c', 'd'],
    paths: ['flow-p-ab', 'flow-p-bc', 'flow-p-cd', 'flow-p-da'],
  },
  {
    id: 'wrap',
    nodes: ['a', 'b', 'c', 'd'],
    paths: ['flow-p-ab', 'wrap-b', 'flow-s-ba', 'flow-s-ad', 'flow-s-dc', 'wrap-c', 'flow-p-cd', 'flow-p-da'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FddiDualRingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const baseId = useId()
  const arrowId = `${baseId}-fddi-dual-ring-arrow`
  const linkArrowId = `${baseId}-fddi-dual-ring-link-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const linkOpacityOf = (id: string) => (active && fadedLinks[active.id]?.includes(id) ? 0.25 : undefined)
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
      scenarios={fddiDualRingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 216'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
            <marker id={linkArrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-muted" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              opacity={linkOpacityOf(id)}
              markerEnd={`url(#${linkArrowId})`}
            />
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
