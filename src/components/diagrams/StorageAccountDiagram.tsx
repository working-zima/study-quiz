import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-storage'].diagrams['storage-account']

// 세로형은 계정 박스 안에 서비스 넷을 두 줄로 두고, 줄마다 아래에 주소 곁말이 들어갈 자리를 둔다. 관리 디스크는 박스 밖이다.
const groups = [
  { id: 'account', x: 8, y: 8, width: 264, height: 130 },
]

// 노드는 모두 회색이다. 무엇을 말하는 시나리오인지는 흐림과 곁말로만 보인다.
const nodes = [
  { id: 'blob', x: 20, y: 32, width: 112 },
  { id: 'queue', x: 148, y: 32, width: 112 },
  { id: 'files', x: 20, y: 84, width: 112 },
  { id: 'table', x: 148, y: 84, width: 112 },
  { id: 'managed-disk', x: 20, y: 148, width: 112 },
]

// scenario가 없는 곁말은 예시 값이라 늘 보인다(ADR-038).
const notes: { id: string, x: number, y: number, scenario?: string }[] = [
  { id: 'name-note', x: 96, y: 22 },
  { id: 'services-note', x: 20, y: 128, scenario: 'services' },
  { id: 'blob-endpoint-note', x: 20, y: 76, scenario: 'endpoint' },
  { id: 'file-endpoint-note', x: 20, y: 128, scenario: 'endpoint' },
  { id: 'disk-note', x: 140, y: 168, scenario: 'disk' },
]

// 가로형은 서비스 넷을 한 줄에 늘어놓고, 그 아래에 주소 곁말을 자기 노드 왼쪽 끝에 맞춘다.
const wideGroups = [
  { id: 'account', x: 8, y: 8, width: 424, height: 92 },
]

const wideNodes = [
  { id: 'blob', x: 20, y: 32, width: 92 },
  { id: 'files', x: 122, y: 32, width: 92 },
  { id: 'queue', x: 224, y: 32, width: 92 },
  { id: 'table', x: 326, y: 32, width: 92 },
  { id: 'managed-disk', x: 20, y: 110, width: 112 },
]

const wideNotes = [
  { id: 'name-note', x: 96, y: 22 },
  { id: 'services-note', x: 20, y: 78 },
  { id: 'blob-endpoint-note', x: 20, y: 78 },
  { id: 'file-endpoint-note', x: 122, y: 92 },
  { id: 'disk-note', x: 140, y: 130 },
]

// 그릴 경로는 없다. 소속은 박스의 안과 밖으로만 보인다.
export const storageAccountScenarios: DiagramScenario[] = [
  { id: 'services', nodes: ['blob', 'files', 'queue', 'table'], paths: [] },
  { id: 'endpoint', nodes: ['blob', 'files'], paths: [] },
  { id: 'disk', nodes: ['managed-disk'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function StorageAccountDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenario === undefined || note.scenario === active?.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={storageAccountScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 150' : '0 0 280 188'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
