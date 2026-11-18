import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-hyperv'].diagrams['container-isolation']

// 세로형은 호스트 HV01 박스 안 왼쪽에 프로세스 격리 컨테이너 1과 컨테이너 2를 위아래로 쌓고, 오른쪽에 감싼 가상 컴퓨터 박스를 두어
// 그 안에 Hyper-V 격리 컨테이너 3과 자기 커널을 위아래로 둔다. 맨 아래에는 HV01의 커널을 넓게 둔다.
// 컨테이너 1·2의 화살표는 같은 HV01의 커널로 내려가고(컨테이너 1은 컨테이너 2 오른쪽으로 비켜 내려간다), 컨테이너 3의 화살표는 자기 커널로 내려간다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'container-1', x: 24, y: 56, width: 100 },
  { id: 'container-2', x: 24, y: 104, width: 100 },
  { id: 'container-3', x: 156, y: 56, width: 96 },
  { id: 'vm-kernel', x: 156, y: 104, width: 96 },
  { id: 'host-kernel', x: 16, y: 192, width: 248 },
]

const groups = [
  { id: 'host', x: 8, y: 8, width: 264, height: 240, labelX: 16, labelY: 21 },
  { id: 'vm', x: 144, y: 32, width: 120, height: 120, labelX: 152, labelY: 45 },
]

const paths: Record<string, string> = {
  'c1-kernel': 'M124 72 H132 V192',
  'c2-kernel': 'M74 136 V192',
  'c3-kernel': 'M204 88 V104',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 프로세스 격리 곁말은 HV01의 커널 아래에, Hyper-V 격리 곁말은 감싼 가상 컴퓨터 안 자기 커널 아래에 둔다.
const noteScenarios: Record<string, string[]> = {
  'process-note': ['process'],
  'hyperv-note': ['hyperv'],
}

const notes: Note[] = [
  { id: 'process-note', x: 140, y: 240, anchor: 'middle' },
  { id: 'hyperv-note', x: 204, y: 148, anchor: 'middle' },
]

// 가로형은 컨테이너 1과 컨테이너 2를 왼쪽에 나란히 두어 둘 다 곧게 HV01의 커널로 내려가게 하고, 감싼 가상 컴퓨터 박스를 오른쪽에 둔다.
const wideNodes = [
  { id: 'container-1', x: 24, y: 56, width: 100 },
  { id: 'container-2', x: 140, y: 56, width: 100 },
  { id: 'container-3', x: 284, y: 56, width: 120 },
  { id: 'vm-kernel', x: 284, y: 104, width: 120 },
  { id: 'host-kernel', x: 16, y: 184, width: 408 },
]

const wideGroups = [
  { id: 'host', x: 8, y: 8, width: 424, height: 232, labelX: 16, labelY: 21 },
  { id: 'vm', x: 264, y: 32, width: 160, height: 128, labelX: 272, labelY: 45 },
]

const widePaths: Record<string, string> = {
  'c1-kernel': 'M74 88 V184',
  'c2-kernel': 'M190 88 V184',
  'c3-kernel': 'M344 88 V104',
}

const wideNotes: Note[] = [
  { id: 'process-note', x: 220, y: 232, anchor: 'middle' },
  { id: 'hyperv-note', x: 344, y: 152, anchor: 'middle' },
]

// 프로세스 격리: 컨테이너 1·2가 HV01의 커널을 함께 쓴다. Hyper-V 격리: 컨테이너 3이 감싼 가상 컴퓨터 안의 자기 커널로 실행된다.
export const containerIsolationScenarios: DiagramScenario[] = [
  { id: 'process', nodes: ['container-1', 'container-2', 'host-kernel'], paths: ['c1-kernel', 'c2-kernel'] },
  { id: 'hyperv', nodes: ['container-3', 'vm-kernel'], paths: ['c3-kernel'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ContainerIsolationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-container-isolation-arrow`
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
      scenarios={containerIsolationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 248' : '0 0 280 256'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id].includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
