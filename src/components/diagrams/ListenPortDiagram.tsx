import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-servers'].diagrams['listen-port']

// 세로형은 맨 위에 고치기 전·고친 뒤의 httpd.conf를 나란히 두고(Listen 80, Listen 8080), 그 아래에 root로 시작한 부모 프로세스,
// 그 아래 User webuser 박스 안에 자식 프로세스 둘, 맨 아래에 웹 브라우저가 쓰는 두 주소를 둔다.
// 부모에서 자식으로 가는 가는 선은 늘 보인다. 포트를 바꾼 주소의 화살표는 오른쪽 통로(x 272)로 Listen 8080까지 올라간다.
const nodes = [
  { id: 'listen-80', x: 12, y: 24, width: 116 },
  { id: 'listen-8080', x: 152, y: 24, width: 116 },
  { id: 'parent', x: 72, y: 92, width: 136 },
  { id: 'child-1', x: 20, y: 168, width: 112 },
  { id: 'child-2', x: 148, y: 168, width: 112 },
  { id: 'url-80', x: 8, y: 244, width: 168 },
  { id: 'url-8080', x: 8, y: 292, width: 196 },
]

const groups = [
  { id: 'before', x: 4, y: 4, width: 132, height: 60, labelX: 12, labelY: 17 },
  { id: 'after', x: 144, y: 4, width: 132, height: 60, labelX: 152, labelY: 17 },
  { id: 'children', x: 4, y: 148, width: 272, height: 76, labelX: 12, labelY: 161 },
]

// spawn-은 부모 프로세스가 자식 프로세스를 만든다는 것을 잇는 선으로 늘 보인다. 나머지는 시나리오에서만 보이는 화살표다.
const paths: Record<string, string> = {
  'read-80': 'M100 56 V92',
  'request': 'M40 244 V200',
  'to-8080': 'M204 308 H272 V40 H268',
  'spawn-1': 'M108 124 V168',
  'spawn-2': 'M172 124 V168',
}

const linkIds = ['spawn-1', 'spawn-2']

// 곁말은 자기 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'root-note', x: 104, y: 80, anchor: 'start', scenarios: ['default'] },
  { id: 'port-80-note', x: 180, y: 264, anchor: 'start', scenarios: ['default'] },
  { id: 'port-8080-note', x: 8, y: 342, anchor: 'start', scenarios: ['changed'] },
  { id: 'user-note', x: 160, y: 218, anchor: 'middle', scenarios: ['children'] },
]

// 가로형도 같은 차례로 쌓되 폭을 넓힌다. 두 주소를 맨 아래 한 줄에 나란히 두고, 포트를 바꾼 주소의 화살표는 곧게 Listen 8080까지 올라간다.
const wideNodes = [
  { id: 'listen-80', x: 20, y: 24, width: 136 },
  { id: 'listen-8080', x: 284, y: 24, width: 136 },
  { id: 'parent', x: 120, y: 84, width: 136 },
  { id: 'child-1', x: 88, y: 160, width: 112 },
  { id: 'child-2', x: 240, y: 160, width: 112 },
  { id: 'url-80', x: 8, y: 240, width: 168 },
  { id: 'url-8080', x: 232, y: 240, width: 200 },
]

const wideGroups = [
  { id: 'before', x: 4, y: 4, width: 168, height: 60, labelX: 12, labelY: 17 },
  { id: 'after', x: 268, y: 4, width: 168, height: 60, labelX: 276, labelY: 17 },
  { id: 'children', x: 4, y: 140, width: 432, height: 76, labelX: 12, labelY: 153 },
]

const widePaths: Record<string, string> = {
  'read-80': 'M140 56 V84',
  'request': 'M120 240 V192',
  'to-8080': 'M400 240 V56',
  'spawn-1': 'M160 116 V160',
  'spawn-2': 'M248 116 V160',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'root-note', x: 144, y: 76, anchor: 'start' },
  { id: 'port-80-note', x: 92, y: 286, anchor: 'middle' },
  { id: 'port-8080-note', x: 332, y: 286, anchor: 'middle' },
  { id: 'user-note', x: 220, y: 208, anchor: 'middle' },
]

// 80번: root로 시작한 부모 프로세스가 Listen 80을 읽고 80번 포트에 묶인다. 포트를 적지 않은 주소는 80번으로 온다.
// 바꾼 포트: Listen 8080으로 고치면 주소에 :8080을 붙여야 닿는다. 자식 프로세스: 80번으로 온 요청은 User webuser로 실행되는 자식 프로세스가 받는다.
export const listenPortScenarios: DiagramScenario[] = [
  { id: 'default', nodes: ['listen-80', 'parent', 'url-80'], paths: ['read-80'] },
  { id: 'changed', nodes: ['listen-8080', 'url-8080'], paths: ['to-8080'] },
  { id: 'children', nodes: ['child-1', 'child-2', 'url-80'], paths: ['request'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ListenPortDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-listen-port-arrow`
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
      scenarios={listenPortScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 296' : '0 0 280 352'}>
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

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" />
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
