import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-regions-zones'].diagrams['azure-region']

// 지리 박스 안에 지역 A·B를 위아래로 쌓는다. 지역 A는 데이터 센터 줄 아래에 VM 1 줄을 하나 더 둔다.
// 안쪽 박스의 라벨 자리는 바깥 박스의 라벨 자리보다 아래에 있고, 노드는 자기 지역 박스의 라벨 자리 아래에 있다.
const groups = [
  { id: 'geography', x: 6, y: 4, width: 268, height: 212 },
  { id: 'region-a', x: 16, y: 26, width: 248, height: 108 },
  { id: 'region-b', x: 16, y: 142, width: 248, height: 66 },
]

// 지역을 고르지 않는 서비스는 어느 지역 박스에도 들지 않게 지리 박스 아래에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'dc-a1', x: 28, y: 50, width: 96 },
  { id: 'dc-a2', x: 156, y: 50, width: 96 },
  { id: 'vm-1', x: 28, y: 92, width: 96 },
  { id: 'dc-b1', x: 28, y: 166, width: 96 },
  { id: 'dc-b2', x: 156, y: 166, width: 96 },
  { id: 'nonregional', x: 16, y: 228, width: 128 },
]

// 늘 보이는 연결선 둘. 같은 지역의 데이터 센터 둘을 마주 보는 변 사이로 곧게 잇는다. 화살표가 아니다.
const paths: Record<string, string> = {
  'link-a': 'M124 66 H156',
  'link-b': 'M124 182 H156',
}

// 곁말은 자기 노드 오른쪽에 두고 그 시나리오에서만 보인다.
const notes = [
  { id: 'vm-note', x: 132, y: 111, textAnchor: 'start' as const, scenarios: ['deploy'] },
  { id: 'nonregional-note', x: 152, y: 247, textAnchor: 'start' as const, scenarios: ['nonregional'] },
]

// 가로형은 두 지역을 나란히 둔다. 지역 B는 VM 줄이 없어 낮고, 지역을 고르지 않는 서비스는 지리 박스 아래에 둔다.
const wideGroups = [
  { id: 'geography', x: 8, y: 4, width: 424, height: 138 },
  { id: 'region-a', x: 18, y: 26, width: 200, height: 108 },
  { id: 'region-b', x: 226, y: 26, width: 196, height: 66 },
]

const wideNodes = [
  { id: 'dc-a1', x: 30, y: 50, width: 80 },
  { id: 'dc-a2', x: 126, y: 50, width: 80 },
  { id: 'vm-1', x: 30, y: 92, width: 80 },
  { id: 'dc-b1', x: 238, y: 50, width: 80 },
  { id: 'dc-b2', x: 330, y: 50, width: 80 },
  { id: 'nonregional', x: 18, y: 150, width: 128 },
]

const widePaths: Record<string, string> = {
  'link-a': 'M110 66 H126',
  'link-b': 'M318 66 H330',
}

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'vm-note', x: 118, y: 111, textAnchor: 'start' as const },
  { id: 'nonregional-note', x: 154, y: 169, textAnchor: 'start' as const },
]

// 두 시나리오는 무엇을 고르는지(선명한 노드와 곁말)로 갈린다. 화살표로 그릴 경로는 없다.
export const azureRegionScenarios: DiagramScenario[] = [
  { id: 'deploy', nodes: ['vm-1', 'dc-a1', 'dc-a2'], paths: [] },
  { id: 'nonregional', nodes: ['nonregional'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AzureRegionDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
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
      scenarios={azureRegionScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 190' : '0 0 280 268'}>
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

          {Object.entries(layoutPaths).map(([id, d]) => (
            <path key={id} data-link={id} d={d} className="fill-none stroke-muted" strokeWidth="1.5" />
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
