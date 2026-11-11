import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mgmt-security'].diagrams['https-stack']

// 같은 서버를 여는 두 방식을 박스 둘로 나란히 쌓는다 — 왼쪽은 http:// 주소(HTTP 바로 아래 TCP 80번),
// 오른쪽은 https:// 주소(HTTP와 TCP 443번 사이에 TLS). 두 TCP 칸을 같은 높이에 세워, 왼쪽에는 TLS 자리가 비어 보이게 한다.
// 칸은 모두 회색이고, 암호화하는지는 색이 아니라 곁말로 가른다.
const nodes = [
  { id: 'http-app', x: 16, y: 32, width: 112 },
  { id: 'http-tcp', x: 16, y: 120, width: 112 },
  { id: 'https-app', x: 152, y: 32, width: 112 },
  { id: 'https-tls', x: 152, y: 76, width: 112 },
  { id: 'https-tcp', x: 152, y: 120, width: 112 },
]

const groups = [
  { id: 'http-stack', x: 8, y: 8, width: 128, height: 184, labelX: 12, labelY: 21 },
  { id: 'https-stack', x: 144, y: 8, width: 128, height: 184, labelX: 148, labelY: 21 },
]

// 브라우저가 보내는 HTTP 요청이 위 칸에서 아래 칸으로 넘겨지는 차례. HTTP 쪽은 TLS를 거치지 않고 TCP로 곧장 간다.
const paths: Record<string, string> = {
  'http-down': 'M72 64 V120',
  'https-down-1': 'M208 64 V76',
  'https-down-2': 'M208 108 V120',
}

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만, 자기 쌓기의 맨 아래 칸 아래에 보인다.
const noteScenarios: Record<string, string> = {
  'http-note': 'http',
  'https-note': 'https',
  'https-check': 'https',
}

const notes: Note[] = [
  { id: 'http-note', x: 72, y: 166 },
  { id: 'https-note', x: 208, y: 166 },
  { id: 'https-check', x: 208, y: 180 },
]

// 가로형은 박스와 칸을 넓힐 뿐 높이와 차례는 세로형과 같다.
const wideNodes = [
  { id: 'http-app', x: 24, y: 32, width: 176 },
  { id: 'http-tcp', x: 24, y: 120, width: 176 },
  { id: 'https-app', x: 240, y: 32, width: 176 },
  { id: 'https-tls', x: 240, y: 76, width: 176 },
  { id: 'https-tcp', x: 240, y: 120, width: 176 },
]

const wideGroups = [
  { id: 'http-stack', x: 8, y: 8, width: 208, height: 184, labelX: 16, labelY: 21 },
  { id: 'https-stack', x: 224, y: 8, width: 208, height: 184, labelX: 232, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'http-down': 'M112 64 V120',
  'https-down-1': 'M328 64 V76',
  'https-down-2': 'M328 108 V120',
}

const wideNotes: Note[] = [
  { id: 'http-note', x: 112, y: 166 },
  { id: 'https-note', x: 328, y: 166 },
  { id: 'https-check', x: 328, y: 180 },
]

// HTTP — TLS 없이 TCP 80번으로 내용을 그대로 주고받는다. HTTPS — TCP 443번 위에 TLS를 두어 서버를 확인하고 암호화한다.
export const httpsStackScenarios: DiagramScenario[] = [
  {
    id: 'http',
    nodes: ['http-app', 'http-tcp'],
    paths: ['http-down'],
  },
  {
    id: 'https',
    nodes: ['https-app', 'https-tls', 'https-tcp'],
    paths: ['https-down-1', 'https-down-2'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HttpsStackDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-https-stack-arrow`
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
      scenarios={httpsStackScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 200'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
