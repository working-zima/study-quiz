import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-resource-hierarchy'].diagrams.hierarchy

// 층마다 한 줄로 위에서 아래로 쌓는다 — 테넌트 루트 그룹, 관리 그룹, 구독, 리소스 그룹, 리소스.
// 그룹 박스는 두지 않는다. 층은 노드 라벨과 위아래 순서로 보이고, 노드는 모두 회색이다.
const nodes = [
  { id: 'root', x: 84, y: 8, width: 112 },
  { id: 'mg-prod', x: 4, y: 64, width: 100 },
  { id: 'mg-dev', x: 176, y: 64, width: 100 },
  { id: 'sub-a', x: 4, y: 120, width: 56 },
  { id: 'sub-b', x: 116, y: 120, width: 56 },
  { id: 'sub-c', x: 220, y: 120, width: 56 },
  { id: 'rg-web', x: 4, y: 176, width: 100 },
  { id: 'vm-1', x: 4, y: 232, width: 56 },
]

// 늘 보이는 연결선 일곱. 부모의 아랫변에서 자식의 윗변으로 간다. 화살표가 아니다.
// 구독 A의 곁말 자리를 비우려고 구독 B를 오른쪽으로 떼어 두어서, 관리 그룹 「운영」에서 구독 B로 가는 선만 꺾인다.
const paths: Record<string, string> = {
  'root-mg-prod': 'M94 40 V64',
  'root-mg-dev': 'M186 40 V64',
  'mg-prod-sub-a': 'M32 96 V120',
  'mg-prod-sub-b': 'M96 96 V108 H144 V120',
  'mg-dev-sub-c': 'M248 96 V120',
  'sub-a-rg-web': 'M32 152 V176',
  'rg-web-vm-1': 'M32 208 V232',
}

// 곁말은 자기 노드 오른쪽, 같은 줄에 두고 그 시나리오에서만 보인다.
const notes = [
  { id: 'policy-note', x: 108, y: 83, textAnchor: 'start' as const, scenarios: ['at-mg'] },
  { id: 'inherit-note', x: 64, y: 251, textAnchor: 'start' as const, scenarios: ['at-mg'] },
  { id: 'sub-role-note', x: 64, y: 139, textAnchor: 'start' as const, scenarios: ['at-sub'] },
  { id: 'rg-role-note', x: 108, y: 195, textAnchor: 'start' as const, scenarios: ['at-rg'] },
]

// 가로형은 같은 나무를 넓게 펴서 연결선을 모두 곧게 둔다. 곁말은 노드 왼쪽에 한 열로 모은다.
const wideNodes = [
  { id: 'root', x: 184, y: 8, width: 112 },
  { id: 'mg-prod', x: 116, y: 60, width: 100 },
  { id: 'mg-dev', x: 284, y: 60, width: 100 },
  { id: 'sub-a', x: 116, y: 112, width: 56 },
  { id: 'sub-b', x: 180, y: 112, width: 56 },
  { id: 'sub-c', x: 306, y: 112, width: 56 },
  { id: 'rg-web', x: 116, y: 164, width: 100 },
  { id: 'vm-1', x: 116, y: 216, width: 56 },
]

const widePaths: Record<string, string> = {
  'root-mg-prod': 'M200 40 V60',
  'root-mg-dev': 'M290 40 V60',
  'mg-prod-sub-a': 'M144 92 V112',
  'mg-prod-sub-b': 'M208 92 V112',
  'mg-dev-sub-c': 'M334 92 V112',
  'sub-a-rg-web': 'M144 144 V164',
  'rg-web-vm-1': 'M144 196 V216',
}

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'policy-note', x: 112, y: 79, textAnchor: 'end' as const },
  { id: 'inherit-note', x: 112, y: 235, textAnchor: 'end' as const },
  { id: 'sub-role-note', x: 112, y: 131, textAnchor: 'end' as const },
  { id: 'rg-role-note', x: 112, y: 183, textAnchor: 'end' as const },
]

// 시나리오마다 설정을 건 노드와 그 아래 자손만 선명하다. 연결선은 늘 같고, 화살표로 그릴 경로는 없다.
export const hierarchyInheritanceScenarios: DiagramScenario[] = [
  { id: 'at-mg', nodes: ['mg-prod', 'sub-a', 'sub-b', 'rg-web', 'vm-1'], paths: [] },
  { id: 'at-sub', nodes: ['sub-a', 'rg-web', 'vm-1'], paths: [] },
  { id: 'at-rg', nodes: ['rg-web', 'vm-1'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HierarchyInheritanceDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
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
      scenarios={hierarchyInheritanceScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 256' : '0 0 280 272'}>
          {Object.entries(layoutPaths).map(([id, d]) => (
            <path key={id} data-link={id} d={d} className="fill-none stroke-muted" strokeWidth="1.5" strokeLinejoin="round" />
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
