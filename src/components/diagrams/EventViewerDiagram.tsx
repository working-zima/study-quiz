import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-admin-tools'].diagrams['event-viewer']

// 왼쪽 열에 운영 체제와 프로그램 → 이벤트를 위에서 아래로 두고, 그 아래에 이벤트 뷰어를 둔다. 오른쪽 박스 Windows 로그 안에
// 응용 프로그램·보안·시스템을 세로로 쌓고, 이벤트 뷰어는 시스템과 같은 높이에 두어 시스템에서 이벤트 뷰어로 가는 화살표가 곧게 간다.
// 이벤트에서 세 로그로 가는 화살표는 이벤트의 오른쪽 변에서 서로 다른 높이로 나가 겹치지 않는다. 맨 아래 박스는 이벤트 한 건의 칸이다.
const nodes = [
  { id: 'writer', x: 8, y: 8, width: 132 },
  { id: 'event', x: 8, y: 64, width: 132 },
  { id: 'app-log', x: 172, y: 28, width: 96 },
  { id: 'security-log', x: 172, y: 68, width: 96 },
  { id: 'system-log', x: 172, y: 108, width: 96 },
  { id: 'viewer', x: 8, y: 108, width: 132 },
  { id: 'field-time', x: 12, y: 180, width: 124 },
  { id: 'field-source', x: 144, y: 180, width: 124 },
  { id: 'field-id', x: 12, y: 220, width: 124 },
  { id: 'field-level', x: 144, y: 220, width: 124 },
]

const groups = [
  { id: 'logs', x: 164, y: 8, width: 112, height: 140, labelX: 172, labelY: 21 },
  { id: 'fields', x: 4, y: 160, width: 272, height: 100, labelX: 12, labelY: 173 },
]

const paths: Record<string, string> = {
  'writer-event': 'M74 40 V64',
  'to-app': 'M140 72 H152 V44 H172',
  'to-security': 'M140 80 H160 V84 H172',
  'to-system': 'M140 88 H152 V124 H172',
  'system-viewer': 'M172 124 H140',
}

// 곁말은 자기 시나리오에서만 보인다. 수준의 갈래는 칸 박스 아래, 거르는 번호는 이벤트 뷰어 아래에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'level-note', x: 12, y: 274, anchor: 'start', scenarios: ['fields'] },
  { id: 'filter-note', x: 8, y: 154, anchor: 'start', scenarios: ['shutdown'] },
]

// 가로형은 운영 체제와 프로그램 → 이벤트를 왼쪽에서 오른쪽으로 잇고, Windows 로그 박스를 그 오른쪽에 둔다.
// 이벤트 뷰어는 이벤트 아래, 시스템과 같은 높이에 둔다. 칸 박스는 맨 아래 한 줄이다.
const wideNodes = [
  { id: 'writer', x: 8, y: 48, width: 132 },
  { id: 'event', x: 164, y: 48, width: 72 },
  { id: 'app-log', x: 264, y: 28, width: 92 },
  { id: 'security-log', x: 264, y: 68, width: 92 },
  { id: 'system-log', x: 264, y: 108, width: 92 },
  { id: 'viewer', x: 156, y: 108, width: 80 },
  { id: 'field-time', x: 12, y: 180, width: 96 },
  { id: 'field-source', x: 116, y: 180, width: 96 },
  { id: 'field-id', x: 220, y: 180, width: 96 },
  { id: 'field-level', x: 324, y: 180, width: 96 },
]

const wideGroups = [
  { id: 'logs', x: 256, y: 8, width: 108, height: 140, labelX: 264, labelY: 21 },
  { id: 'fields', x: 4, y: 160, width: 432, height: 60, labelX: 12, labelY: 173 },
]

const widePaths: Record<string, string> = {
  'writer-event': 'M140 64 H164',
  'to-app': 'M236 56 H244 V44 H264',
  'to-security': 'M236 64 H252 V84 H264',
  'to-system': 'M236 72 H244 V124 H264',
  'system-viewer': 'M264 124 H236',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'level-note', x: 12, y: 234, anchor: 'start' },
  { id: 'filter-note', x: 148, y: 128, anchor: 'end' },
]

// 기록: 일이 일어나면 이벤트가 정해진 로그에 쌓인다. 이벤트 한 건: 칸 넷. 종료 기록: 시스템 로그에서 이벤트 뷰어로 찾는다.
export const eventViewerScenarios: DiagramScenario[] = [
  { id: 'record', nodes: ['writer', 'event', 'app-log', 'security-log', 'system-log'], paths: ['writer-event', 'to-app', 'to-security', 'to-system'] },
  { id: 'fields', nodes: ['field-time', 'field-source', 'field-id', 'field-level'], paths: [] },
  { id: 'shutdown', nodes: ['system-log', 'viewer'], paths: ['system-viewer'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EventViewerDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-event-viewer-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={eventViewerScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 240' : '0 0 280 280'}>
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

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
