import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['protocols-encapsulation'].diagrams['protocol-match']

// 위 줄은 정보를 주고받는 두 호스트, 아래는 두 프로토콜의 헤더를 데이터 앞에 이어 붙인 칸 둘이다. 노드는 모두 회색이다.
// 본문은 헤더의 크기를 말하지 않고 항목 수(UDP 넷, TCP 열 개 넘음)만 말하므로, 헤더 칸 폭은 TCP가 넓다는 것만 보인다.
const nodes = [
  { id: 'host-a', x: 16, y: 16, width: 96 },
  { id: 'host-b', x: 168, y: 16, width: 96 },
  { id: 'udp-header', x: 16, y: 88, width: 64 },
  { id: 'udp-data', x: 80, y: 88, width: 64 },
  { id: 'tcp-header', x: 16, y: 144, width: 128 },
  { id: 'tcp-data', x: 144, y: 144, width: 64 },
]

// 호스트 A에서 B로 가는 화살표를 위에, B에서 A로 돌아오는 화살표를 아래에 둔다.
const paths: Record<string, string> = {
  'a-to-b': 'M112 24 H168',
  'b-to-a': 'M168 40 H112',
}

// 요청·응답 곁말은 두 화살표의 바깥쪽, 프로토콜 곁말은 호스트 바로 아래, 항목 수 곁말은 헤더 칸 바로 아래에 둔다.
const notes = [
  { id: 'request', x: 140, y: 12, scenarios: ['web'] },
  { id: 'response', x: 140, y: 60, scenarios: ['web'] },
  { id: 'a-http', x: 64, y: 64, scenarios: ['web'] },
  { id: 'b-http', x: 216, y: 64, scenarios: ['web'] },
  { id: 'a-ftp', x: 64, y: 64, scenarios: ['file'] },
  { id: 'b-ftp', x: 216, y: 64, scenarios: ['file'] },
  { id: 'udp-items', x: 48, y: 132, scenarios: ['header'] },
  { id: 'tcp-items', x: 80, y: 188, scenarios: ['header'] },
]

// 가로형은 두 호스트를 멀리 벌리고, 헤더 칸 둘을 그 아래에 나란히 둔다.
const wideNodes = [
  { id: 'host-a', x: 40, y: 16, width: 120 },
  { id: 'host-b', x: 280, y: 16, width: 120 },
  { id: 'udp-header', x: 40, y: 88, width: 64 },
  { id: 'udp-data', x: 104, y: 88, width: 64 },
  { id: 'tcp-header', x: 208, y: 88, width: 128 },
  { id: 'tcp-data', x: 336, y: 88, width: 64 },
]

const widePaths: Record<string, string> = {
  'a-to-b': 'M160 24 H280',
  'b-to-a': 'M280 40 H160',
}

// 곁말은 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'request', x: 220, y: 12 },
  { id: 'response', x: 220, y: 60 },
  { id: 'a-http', x: 100, y: 64 },
  { id: 'b-http', x: 340, y: 64 },
  { id: 'a-ftp', x: 100, y: 64 },
  { id: 'b-ftp', x: 340, y: 64 },
  { id: 'udp-items', x: 72, y: 132 },
  { id: 'tcp-items', x: 272, y: 132 },
]

// 헤더 칸은 데이터 칸과 모서리 없이 이어 붙인다.
const cellIds = ['udp-header', 'udp-data', 'tcp-header', 'tcp-data']

// 웹 페이지와 파일은 같은 두 호스트·같은 화살표를 쓰고, 호스트 아래 프로토콜 곁말로 갈린다.
export const protocolMatchScenarios: DiagramScenario[] = [
  { id: 'web', nodes: ['host-a', 'host-b'], paths: ['a-to-b', 'b-to-a'] },
  { id: 'file', nodes: ['host-a', 'host-b'], paths: ['a-to-b', 'b-to-a'] },
  { id: 'header', nodes: ['udp-header', 'udp-data', 'tcp-header', 'tcp-data'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ProtocolMatchDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-protocol-match-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={protocolMatchScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 200'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx={cellIds.includes(node.id) ? '0' : '4'} strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
