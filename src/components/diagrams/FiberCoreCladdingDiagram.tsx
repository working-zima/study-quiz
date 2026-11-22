import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['transmission-media'].diagrams['fiber-core-cladding']

// 광섬유를 길이 방향으로 자른 모습을 위아래 두 벌로 놓는다. 위는 싱글 모드, 아래는 멀티 모드다.
// 광섬유마다 왼쪽에 보내는 쪽, 오른쪽에 받는 쪽을 두고, 그 사이에 클래딩·코어·클래딩의 띠(그룹 박스)를 위에서 아래로 맞닿게 쌓는다.
// 멀티 모드의 코어 띠를 더 굵게 그리지만 크기를 재어 그린 것은 아니다. 화살표 하나가 모드 하나이고, 코어 띠 안만 지난다. 노드는 모두 회색이다.
const nodes = [
  { id: 'single-sender', x: 8, y: 34, width: 66 },
  { id: 'single-receiver', x: 206, y: 34, width: 66 },
  { id: 'multi-sender', x: 8, y: 144, width: 66 },
  { id: 'multi-receiver', x: 206, y: 144, width: 66 },
]

const groups = [
  { id: 'single-cladding-top', x: 82, y: 8, width: 116, height: 20, labelX: 90, labelY: 21 },
  { id: 'single-core', x: 82, y: 28, width: 116, height: 32, labelX: 90, labelY: 41 },
  { id: 'single-cladding-bottom', x: 82, y: 60, width: 116, height: 20, labelX: 90, labelY: 73 },
  { id: 'multi-cladding-top', x: 82, y: 104, width: 116, height: 20, labelX: 90, labelY: 117 },
  { id: 'multi-core', x: 82, y: 124, width: 116, height: 56, labelX: 90, labelY: 137 },
  { id: 'multi-cladding-bottom', x: 82, y: 180, width: 116, height: 20, labelX: 90, labelY: 193 },
]

const paths: Record<string, string> = {
  'single-mode': 'M74 50 H206',
  'multi-mode-1': 'M74 148 H206',
  'multi-mode-2': 'M74 160 H206',
  'multi-mode-3': 'M74 172 H206',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 그 광섬유의 아래 클래딩 띠 바로 밑 빈자리에 둔다.
const noteScenarios: Record<string, string> = {
  'single-note': 'single',
  'multi-note': 'multi',
}

const notes: Note[] = [
  { id: 'single-note', x: 140, y: 93, anchor: 'middle' },
  { id: 'multi-note', x: 140, y: 213, anchor: 'middle' },
]

// 가로형은 같은 짜임을 넓힌다. 띠를 넓히고 보내는 쪽과 받는 쪽을 양쪽 끝으로 옮긴다.
const wideNodes = [
  { id: 'single-sender', x: 8, y: 34, width: 96 },
  { id: 'single-receiver', x: 336, y: 34, width: 96 },
  { id: 'multi-sender', x: 8, y: 144, width: 96 },
  { id: 'multi-receiver', x: 336, y: 144, width: 96 },
]

const wideGroups = [
  { id: 'single-cladding-top', x: 120, y: 8, width: 200, height: 20, labelX: 128, labelY: 21 },
  { id: 'single-core', x: 120, y: 28, width: 200, height: 32, labelX: 128, labelY: 41 },
  { id: 'single-cladding-bottom', x: 120, y: 60, width: 200, height: 20, labelX: 128, labelY: 73 },
  { id: 'multi-cladding-top', x: 120, y: 104, width: 200, height: 20, labelX: 128, labelY: 117 },
  { id: 'multi-core', x: 120, y: 124, width: 200, height: 56, labelX: 128, labelY: 137 },
  { id: 'multi-cladding-bottom', x: 120, y: 180, width: 200, height: 20, labelX: 128, labelY: 193 },
]

const widePaths: Record<string, string> = {
  'single-mode': 'M104 50 H336',
  'multi-mode-1': 'M104 148 H336',
  'multi-mode-2': 'M104 160 H336',
  'multi-mode-3': 'M104 172 H336',
}

const wideNotes: Note[] = [
  { id: 'single-note', x: 220, y: 93, anchor: 'middle' },
  { id: 'multi-note', x: 220, y: 213, anchor: 'middle' },
]

// 싱글 모드: 빛이 모드 하나로 싱글 모드의 코어를 지난다. 멀티 모드: 빛이 모드 여럿으로 멀티 모드의 코어를 함께 지난다.
export const fiberCoreCladdingScenarios: DiagramScenario[] = [
  {
    id: 'single',
    nodes: ['single-sender', 'single-receiver'],
    paths: ['single-mode'],
  },
  {
    id: 'multi',
    nodes: ['multi-sender', 'multi-receiver'],
    paths: ['multi-mode-1', 'multi-mode-2', 'multi-mode-3'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FiberCoreCladdingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-fiber-core-cladding-arrow`
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
      scenarios={fiberCoreCladdingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 220' : '0 0 280 220'}>
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
