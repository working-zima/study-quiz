import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-resource-hierarchy'].diagrams['subscription-boundaries']

// Azure 계정 박스 안에 구독 둘을 위아래로 쌓는다. 구독 박스의 라벨 자리는 계정 박스의 라벨 자리 아래에 있다.
// 구독마다 리소스 그룹·청구서·액세스 규칙을 한 줄에 둔다. 노드는 자기 구독 박스 하나에만 든다.
const groups = [
  { id: 'account', x: 4, y: 4, width: 272, height: 170 },
  { id: 'sub-dev', x: 12, y: 26, width: 256, height: 66 },
  { id: 'sub-prod', x: 12, y: 100, width: 256, height: 66 },
]

// 노드는 모두 회색이다. 무엇이 구독마다 따로 갈리는지는 흐림과 곁말로만 보인다.
const nodes = [
  { id: 'rg-dev', x: 20, y: 50, width: 80 },
  { id: 'bill-dev', x: 108, y: 50, width: 64 },
  { id: 'access-dev', x: 180, y: 50, width: 80 },
  { id: 'rg-prod', x: 20, y: 124, width: 80 },
  { id: 'bill-prod', x: 108, y: 124, width: 64 },
  { id: 'access-prod', x: 180, y: 124, width: 80 },
]

// 곁말은 구독 라벨 오른쪽, 라벨과 같은 줄에 두고 그 시나리오에서만 보인다.
const notes = [
  { id: 'dev-billing-note', x: 140, y: 40, textAnchor: 'start' as const, scenarios: ['billing'] },
  { id: 'prod-billing-note', x: 140, y: 114, textAnchor: 'start' as const, scenarios: ['billing'] },
  { id: 'dev-access-note', x: 140, y: 40, textAnchor: 'start' as const, scenarios: ['access'] },
  { id: 'prod-access-note', x: 140, y: 114, textAnchor: 'start' as const, scenarios: ['access'] },
]

// 가로형은 구독 둘을 나란히 두고, 구독마다 청구서·액세스 규칙을 윗줄에, 리소스 그룹을 아랫줄 가운데에 둔다.
const wideGroups = [
  { id: 'account', x: 8, y: 4, width: 424, height: 136 },
  { id: 'sub-dev', x: 16, y: 26, width: 200, height: 106 },
  { id: 'sub-prod', x: 224, y: 26, width: 200, height: 106 },
]

const wideNodes = [
  { id: 'bill-dev', x: 26, y: 50, width: 84 },
  { id: 'access-dev', x: 122, y: 50, width: 84 },
  { id: 'rg-dev', x: 74, y: 90, width: 84 },
  { id: 'bill-prod', x: 234, y: 50, width: 84 },
  { id: 'access-prod', x: 330, y: 50, width: 84 },
  { id: 'rg-prod', x: 282, y: 90, width: 84 },
]

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'dev-billing-note', x: 110, y: 40, textAnchor: 'start' as const },
  { id: 'prod-billing-note', x: 318, y: 40, textAnchor: 'start' as const },
  { id: 'dev-access-note', x: 110, y: 40, textAnchor: 'start' as const },
  { id: 'prod-access-note', x: 318, y: 40, textAnchor: 'start' as const },
]

// 청구 경계는 구독마다 청구서를, 액세스 제어 경계는 구독마다 액세스 규칙을 가른다. 리소스 그룹은 두 경계를 가르는 단위가 아니다. 그릴 경로는 없다.
export const subscriptionBoundaryScenarios: DiagramScenario[] = [
  { id: 'billing', nodes: ['bill-dev', 'bill-prod'], paths: [] },
  { id: 'access', nodes: ['access-dev', 'access-prod'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SubscriptionBoundaryDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={subscriptionBoundaryScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 180'}>
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

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
