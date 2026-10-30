import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cloud-models'].diagrams['hybrid-cloud']

// 회사 A의 데이터 센터(프라이빗 클라우드)를 위에, 퍼블릭 클라우드(Azure)를 아래에 두고 두 박스 사이를 연결선으로 잇는다.
// 박스마다 노드 둘을 나란히 두고, 노드 아래 줄은 곁말 자리로 비워 둔다.
const groups = [
  { id: 'private', x: 6, y: 4, width: 268, height: 88 },
  { id: 'public', x: 6, y: 140, width: 268, height: 88 },
]

// 웹 앱은 두 방식에서 실행되는 곳이 달라 양쪽에 하나씩 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'private-data', x: 20, y: 28, width: 112 },
  { id: 'private-app', x: 148, y: 28, width: 112 },
  { id: 'public-app', x: 20, y: 164, width: 112 },
  { id: 'public-extra', x: 148, y: 164, width: 112 },
]

// 늘 보이는 연결선 하나뿐이다. 위 박스의 아래 변에서 아래 박스의 위 변까지 두 노드 열 사이로 곧게 내려간다. 화살표가 아니다.
const paths: Record<string, string> = {
  'link': 'M140 92 V140',
}

// 「서로 연결」은 늘 보인다. 나머지 곁말은 자기 노드 바로 아래에 두고 그 시나리오에서만 보인다.
const notes = [
  { id: 'connect-note', x: 148, y: 120, textAnchor: 'start' as const, scenarios: null },
  { id: 'data-note', x: 76, y: 80, textAnchor: 'middle' as const, scenarios: ['placement'] },
  { id: 'app-note', x: 76, y: 216, textAnchor: 'middle' as const, scenarios: ['placement'] },
  { id: 'usual-note', x: 204, y: 80, textAnchor: 'middle' as const, scenarios: ['burst'] },
  { id: 'extra-note', x: 204, y: 216, textAnchor: 'middle' as const, scenarios: ['burst'] },
]

// 가로형은 두 박스를 나란히 두고 그 사이를 가로 연결선으로 잇는다. 데이터 센터 쪽은 그룹 라벨이 길어 넓게 잡는다.
const wideGroups = [
  { id: 'private', x: 8, y: 4, width: 216, height: 88 },
  { id: 'public', x: 272, y: 4, width: 160, height: 88 },
]

const wideNodes = [
  { id: 'private-data', x: 20, y: 28, width: 84 },
  { id: 'private-app', x: 128, y: 28, width: 84 },
  { id: 'public-app', x: 280, y: 28, width: 68 },
  { id: 'public-extra', x: 356, y: 28, width: 68 },
]

const widePaths: Record<string, string> = {
  'link': 'M224 44 H272',
}

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'connect-note', x: 248, y: 36, textAnchor: 'middle' as const },
  { id: 'data-note', x: 62, y: 80, textAnchor: 'middle' as const },
  { id: 'app-note', x: 314, y: 80, textAnchor: 'middle' as const },
  { id: 'usual-note', x: 170, y: 80, textAnchor: 'middle' as const },
  { id: 'extra-note', x: 390, y: 80, textAnchor: 'middle' as const },
]

// 두 방식은 무엇이 어디에 있는지(선명한 노드와 곁말)로 갈린다. 화살표로 그릴 경로는 없다.
export const hybridCloudScenarios: DiagramScenario[] = [
  { id: 'placement', nodes: ['private-data', 'public-app'], paths: [] },
  { id: 'burst', nodes: ['private-app', 'public-extra'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HybridCloudDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenarios === null || (active !== null && note.scenarios.includes(active.id)))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={hybridCloudScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 96' : '0 0 280 232'}>
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

          <path data-link="link" d={layoutPaths.link} className="fill-none stroke-muted" strokeWidth="1.5" />

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
