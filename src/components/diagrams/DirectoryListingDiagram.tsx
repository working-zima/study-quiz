import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-servers'].diagrams['directory-listing']

// 세로형은 맨 위에 요청 주소, 그 아래 /srv/www/example/files 박스 안에 파일 셋(report.pdf·notes.txt·index.html)을 둔다.
// 그 아래 줄마다 왼쪽에 원인, 오른쪽에 결과를 둔다 — index.html 바로 아래에 「index.html을 보낸다」,
// 그 아래 Options Indexes → 파일 목록을 보낸다, Options -Indexes → 목록을 만들지 않는다. 결과 셋은 서로 다른 노드로 다른 자리에 있다.
const nodes = [
  { id: 'url', x: 8, y: 8, width: 200 },
  { id: 'report', x: 12, y: 72, width: 78 },
  { id: 'notes', x: 98, y: 72, width: 78 },
  { id: 'index', x: 184, y: 72, width: 78 },
  { id: 'send-index', x: 140, y: 128, width: 132 },
  { id: 'opt-on', x: 8, y: 176, width: 116 },
  { id: 'list', x: 140, y: 176, width: 132 },
  { id: 'opt-off', x: 8, y: 224, width: 116 },
  { id: 'none', x: 140, y: 224, width: 132 },
]

const groups = [
  { id: 'dir', x: 4, y: 52, width: 264, height: 60, labelX: 12, labelY: 65 },
]

const paths: Record<string, string> = {
  'to-index': 'M223 104 V128',
  'to-list': 'M124 192 H140',
  'to-none': 'M124 240 H140',
}

// 곁말은 자기 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'index-note', x: 136, y: 148, anchor: 'end', scenarios: ['index-file'] },
  { id: 'on-note', x: 272, y: 220, anchor: 'end', scenarios: ['indexes-on'] },
  { id: 'off-note', x: 272, y: 268, anchor: 'end', scenarios: ['indexes-off'] },
]

// 가로형은 결과 셋을 오른쪽 열에 두고, 「index.html을 보낸다」를 index.html과 같은 줄 오른쪽에 둔다.
// 두 Options 줄은 왼쪽 열에 두고 오른쪽 결과까지 곧은 화살표로 잇는다.
const wideNodes = [
  { id: 'url', x: 8, y: 8, width: 200 },
  { id: 'report', x: 12, y: 72, width: 78 },
  { id: 'notes', x: 98, y: 72, width: 78 },
  { id: 'index', x: 184, y: 72, width: 78 },
  { id: 'send-index', x: 296, y: 72, width: 132 },
  { id: 'opt-on', x: 8, y: 128, width: 116 },
  { id: 'list', x: 296, y: 128, width: 132 },
  { id: 'opt-off', x: 8, y: 176, width: 116 },
  { id: 'none', x: 296, y: 176, width: 132 },
]

const wideGroups = [
  { id: 'dir', x: 4, y: 52, width: 264, height: 60, labelX: 12, labelY: 65 },
]

const widePaths: Record<string, string> = {
  'to-index': 'M262 88 H296',
  'to-list': 'M124 144 H296',
  'to-none': 'M124 192 H296',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'index-note', x: 296, y: 120, anchor: 'start' },
  { id: 'on-note', x: 210, y: 138, anchor: 'middle' },
  { id: 'off-note', x: 210, y: 186, anchor: 'middle' },
]

// 켬: 기본 문서가 없고 Indexes가 켜져 있으면 파일 이름 목록을 보낸다. 끔: Options -Indexes면 목록을 만들지 않는다.
// 기본 문서: index.html을 두면 Indexes가 켜져 있어도 목록 대신 그 파일을 보낸다.
export const directoryListingScenarios: DiagramScenario[] = [
  { id: 'indexes-on', nodes: ['url', 'report', 'notes', 'opt-on', 'list'], paths: ['to-list'] },
  { id: 'indexes-off', nodes: ['url', 'opt-off', 'none'], paths: ['to-none'] },
  { id: 'index-file', nodes: ['url', 'index', 'send-index', 'opt-on'], paths: ['to-index'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DirectoryListingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-directory-listing-arrow`
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
      scenarios={directoryListingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 276'}>
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
