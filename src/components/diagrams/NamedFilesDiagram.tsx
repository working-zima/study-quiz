import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-servers'].diagrams['named-files']

// 맨 위에 검사 명령 둘을 두고, 그 아래 왼쪽에 /etc/named.conf 박스(options 문 · zone 문)를, 오른쪽에 zone 문이 가리키는 영역 파일을 둔다.
// named.conf 박스 아래에 named를, 그 아래에 질의가 들어오는 UDP·TCP의 53번 포트를 둔다.
// named.conf를 가리키는 화살표(검사·읽기)는 노드가 아니라 박스의 변에 닿는다.
const nodes = [
  { id: 'checkconf', x: 16, y: 20, width: 120 },
  { id: 'checkzone', x: 152, y: 20, width: 120 },
  { id: 'options', x: 12, y: 88, width: 132 },
  { id: 'zone', x: 12, y: 128, width: 132 },
  { id: 'zone-file', x: 160, y: 128, width: 116 },
  { id: 'named', x: 96, y: 200, width: 88 },
  { id: 'udp53', x: 40, y: 264, width: 96 },
  { id: 'tcp53', x: 144, y: 264, width: 96 },
]

const groups = [
  { id: 'conf', x: 4, y: 68, width: 148, height: 100, labelX: 12, labelY: 81 },
]

const paths: Record<string, string> = {
  'check-conf': 'M76 52 V68',
  'check-zone': 'M212 52 V128',
  'to-file': 'M144 144 H160',
  'read-conf': 'M124 168 V200',
  'udp-in': 'M88 264 V248 H116 V232',
  'tcp-in': 'M192 264 V248 H164 V232',
}

// 곁말은 자기 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'conf-check', x: 76, y: 13, anchor: 'middle', scenarios: ['check'] },
  { id: 'zone-check', x: 212, y: 13, anchor: 'middle', scenarios: ['check'] },
  { id: 'reads', x: 88, y: 220, anchor: 'end', scenarios: ['config'] },
  { id: 'points', x: 216, y: 184, anchor: 'middle', scenarios: ['config'] },
  { id: 'both', x: 140, y: 312, anchor: 'middle', scenarios: ['ports'] },
]

// 가로형은 같은 꼴을 넓게 펴고, 포트 둘을 named의 오른쪽에 나란히 둔다.
const wideNodes = [
  { id: 'checkconf', x: 32, y: 20, width: 136 },
  { id: 'checkzone', x: 240, y: 20, width: 136 },
  { id: 'options', x: 24, y: 88, width: 160 },
  { id: 'zone', x: 24, y: 128, width: 160 },
  { id: 'zone-file', x: 240, y: 128, width: 136 },
  { id: 'named', x: 56, y: 200, width: 88 },
  { id: 'udp53', x: 200, y: 200, width: 104 },
  { id: 'tcp53', x: 320, y: 200, width: 104 },
]

const wideGroups = [
  { id: 'conf', x: 8, y: 68, width: 192, height: 100, labelX: 16, labelY: 81 },
]

const widePaths: Record<string, string> = {
  'check-conf': 'M100 52 V68',
  'check-zone': 'M308 52 V128',
  'to-file': 'M184 144 H240',
  'read-conf': 'M100 168 V200',
  'udp-in': 'M200 216 H144',
  'tcp-in': 'M372 232 V248 H120 V232',
}

// 곁말의 자리만 배치마다 다르다. 보이는 때는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'conf-check', x: 100, y: 13, anchor: 'middle' },
  { id: 'zone-check', x: 308, y: 13, anchor: 'middle' },
  { id: 'reads', x: 108, y: 186, anchor: 'start' },
  { id: 'points', x: 308, y: 176, anchor: 'middle' },
  { id: 'both', x: 296, y: 268, anchor: 'middle' },
]

// 설정: named가 named.conf를 읽고, zone 문이 영역 파일을 가리킨다. 검사: 명령마다 자기 파일을 검사한다.
// 포트: UDP와 TCP의 53번 포트에서 질의가 named로 들어온다.
export const namedFilesScenarios: DiagramScenario[] = [
  { id: 'config', nodes: ['options', 'zone', 'zone-file', 'named'], paths: ['to-file', 'read-conf'] },
  { id: 'check', nodes: ['checkconf', 'checkzone', 'options', 'zone', 'zone-file'], paths: ['check-conf', 'check-zone'] },
  { id: 'ports', nodes: ['named', 'udp53', 'tcp53'], paths: ['udp-in', 'tcp-in'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NamedFilesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-named-files-arrow`
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
      scenarios={namedFilesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 280' : '0 0 280 320'}>
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
