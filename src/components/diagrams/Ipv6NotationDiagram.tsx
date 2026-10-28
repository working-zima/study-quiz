import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams['ipv6-notation']

// 세로형은 같은 IPv6 주소를 세 줄로 위에서 아래로 쌓는다 — 전체 표기, 앞쪽 0을 뺀 표기, ::로 줄인 표기.
// 여덟 묶음을 노드로 나누면 280 폭에 라벨이 들어가지 않아, 줄마다 주소 글자 하나를 노드로 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'full', x: 8, y: 24, width: 264 },
  { id: 'leading', x: 8, y: 92, width: 264 },
  { id: 'compressed', x: 8, y: 160, width: 264 },
]

// 화살표는 앞 줄의 아래 변에서 다음 줄의 위 변으로 간다. 그 단계의 시나리오에서만 보인다.
const paths: Record<string, string> = {
  'to-leading': 'M140 56 V92',
  'to-compressed': 'M140 124 V160',
}

// 줄 이름은 자기 줄 바로 위 왼쪽에, 묶음 수 곁말은 :: 줄임 줄 아래 가운데에 늘 보인다. 곁말은 자기 줄의 흐림을 따른다.
const notes: { id: string, owner: string, x: number, y: number, anchor: 'start' | 'middle' }[] = [
  { id: 'title-full', owner: 'full', x: 8, y: 18, anchor: 'start' },
  { id: 'title-leading', owner: 'leading', x: 8, y: 86, anchor: 'start' },
  { id: 'title-compressed', owner: 'compressed', x: 8, y: 154, anchor: 'start' },
  { id: 'gap', owner: 'compressed', x: 140, y: 206, anchor: 'middle' },
]

// 가로형은 전체 표기를 위에 한 줄로 두고, 줄인 두 꼴을 아래 줄에 왼쪽에서 오른쪽으로 나란히 둔다.
const wideNodes = [
  { id: 'full', x: 8, y: 24, width: 424 },
  { id: 'leading', x: 8, y: 92, width: 200 },
  { id: 'compressed', x: 232, y: 92, width: 200 },
]

const widePaths: Record<string, string> = {
  'to-leading': 'M108 56 V92',
  'to-compressed': 'M208 108 H232',
}

const wideNotes = [
  { id: 'title-full', x: 8, y: 18 },
  { id: 'title-leading', x: 8, y: 86 },
  { id: 'title-compressed', x: 232, y: 86 },
  { id: 'gap', x: 332, y: 138 },
]

// 전체 표기: 첫 줄만 선명하다. 앞쪽 0 생략: 첫 줄에서 둘째 줄로 가는 화살표가 보인다. :: 줄임: 둘째 줄에서 셋째 줄로 간다.
export const ipv6NotationScenarios: DiagramScenario[] = [
  { id: 'full', nodes: ['full'], paths: [] },
  { id: 'leading-zeros', nodes: ['full', 'leading'], paths: ['to-leading'] },
  { id: 'double-colon', nodes: ['leading', 'compressed'], paths: ['to-compressed'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function Ipv6NotationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ipv6-notation-arrow`
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
      scenarios={ipv6NotationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 148' : '0 0 280 216'}>
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

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
