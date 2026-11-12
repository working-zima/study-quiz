import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mgmt-security'].diagrams['tls-handshake']

// 맨 위에 웹 브라우저와 www.example.com의 서버를 머리 노드로 두고, 그 아래 왼쪽에 클라이언트, 오른쪽에 서버 기둥(그룹 박스)을 세운다.
// 두 기둥 사이에 본문이 간추린 핸드셰이크 메시지를 위에서 아래로 놓고(위 박스), 그 아래 박스에 핸드셰이크 뒤에 오가는 암호화된 요청과 응답을 둔다.
// 곁말이 들어갈 자리를 남기려고 ServerHello 뒤와 CertificateVerify 뒤의 간격을 넓혔다. 노드는 모두 회색이고, 방향은 화살표로 가른다.
const nodes = [
  { id: 'browser', x: 8, y: 8, width: 124 },
  { id: 'server', x: 148, y: 8, width: 124 },
  { id: 'client-hello', x: 76, y: 80, width: 128 },
  { id: 'server-hello', x: 76, y: 124, width: 128 },
  { id: 'certificate', x: 76, y: 180, width: 128 },
  { id: 'cert-verify', x: 76, y: 224, width: 128 },
  { id: 'finished-s', x: 76, y: 280, width: 128 },
  { id: 'finished-c', x: 76, y: 324, width: 128 },
  { id: 'request', x: 76, y: 400, width: 128 },
  { id: 'response', x: 76, y: 444, width: 128 },
]

const groups = [
  { id: 'client-side', x: 8, y: 48, width: 56, height: 460, labelX: 10, labelY: 60 },
  { id: 'server-side', x: 216, y: 48, width: 56, height: 460, labelX: 220, labelY: 60 },
  { id: 'handshake-box', x: 68, y: 60, width: 144, height: 308, labelX: 72, labelY: 73 },
  { id: 'data-box', x: 68, y: 380, width: 144, height: 120, labelX: 72, labelY: 393 },
]

// 노드마다 화살표 둘 — 보내는 쪽 기둥에서 노드로(-out), 노드에서 받는 쪽 기둥으로(-in).
// ClientHello·브라우저의 Finished·암호화된 요청은 클라이언트 → 서버, 나머지는 서버 → 클라이언트로 간다.
const paths: Record<string, string> = {
  'client-hello-out': 'M64 96 H76',
  'client-hello-in': 'M204 96 H216',
  'server-hello-out': 'M216 140 H204',
  'server-hello-in': 'M76 140 H64',
  'certificate-out': 'M216 196 H204',
  'certificate-in': 'M76 196 H64',
  'cert-verify-out': 'M216 240 H204',
  'cert-verify-in': 'M76 240 H64',
  'finished-s-out': 'M216 296 H204',
  'finished-s-in': 'M76 296 H64',
  'finished-c-out': 'M64 340 H76',
  'finished-c-in': 'M204 340 H216',
  'request-out': 'M64 416 H76',
  'request-in': 'M204 416 H216',
  'response-out': 'M216 460 H204',
  'response-in': 'M76 460 H64',
}

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만, 그 시나리오의 마지막 노드 아래 빈자리에 보인다.
const noteScenarios: Record<string, string> = {
  'hello-note': 'hello',
  'cert-note': 'certificate',
  'data-note': 'data',
}

const notes: Note[] = [
  { id: 'hello-note', x: 140, y: 170 },
  { id: 'cert-note', x: 140, y: 270 },
  { id: 'data-note', x: 140, y: 490 },
]

// 가로형은 기둥과 노드를 넓힐 뿐 차례와 높이는 세로형과 같다.
const wideNodes = [
  { id: 'browser', x: 8, y: 8, width: 124 },
  { id: 'server', x: 308, y: 8, width: 124 },
  { id: 'client-hello', x: 120, y: 80, width: 200 },
  { id: 'server-hello', x: 120, y: 124, width: 200 },
  { id: 'certificate', x: 120, y: 180, width: 200 },
  { id: 'cert-verify', x: 120, y: 224, width: 200 },
  { id: 'finished-s', x: 120, y: 280, width: 200 },
  { id: 'finished-c', x: 120, y: 324, width: 200 },
  { id: 'request', x: 120, y: 400, width: 200 },
  { id: 'response', x: 120, y: 444, width: 200 },
]

const wideGroups = [
  { id: 'client-side', x: 8, y: 48, width: 88, height: 460, labelX: 12, labelY: 60 },
  { id: 'server-side', x: 344, y: 48, width: 88, height: 460, labelX: 348, labelY: 60 },
  { id: 'handshake-box', x: 104, y: 60, width: 232, height: 308, labelX: 112, labelY: 73 },
  { id: 'data-box', x: 104, y: 380, width: 232, height: 120, labelX: 112, labelY: 393 },
]

const widePaths: Record<string, string> = {
  'client-hello-out': 'M96 96 H120',
  'client-hello-in': 'M320 96 H344',
  'server-hello-out': 'M344 140 H320',
  'server-hello-in': 'M120 140 H96',
  'certificate-out': 'M344 196 H320',
  'certificate-in': 'M120 196 H96',
  'cert-verify-out': 'M344 240 H320',
  'cert-verify-in': 'M120 240 H96',
  'finished-s-out': 'M344 296 H320',
  'finished-s-in': 'M120 296 H96',
  'finished-c-out': 'M96 340 H120',
  'finished-c-in': 'M320 340 H344',
  'request-out': 'M96 416 H120',
  'request-in': 'M320 416 H344',
  'response-out': 'M344 460 H320',
  'response-in': 'M120 460 H96',
}

const wideNotes: Note[] = [
  { id: 'hello-note', x: 220, y: 170 },
  { id: 'cert-note', x: 220, y: 270 },
  { id: 'data-note', x: 220, y: 490 },
]

// 인사 — ClientHello와 ServerHello로 암호 방식과 키를 정한다. 인증서 — 서버가 Certificate·CertificateVerify로 자신을 증명한다.
// 암호화된 데이터 — Finished로 핸드셰이크를 끝맺은 뒤 요청과 응답이 암호화되어 오간다.
export const tlsHandshakeScenarios: DiagramScenario[] = [
  {
    id: 'hello',
    nodes: ['browser', 'server', 'client-hello', 'server-hello'],
    paths: ['client-hello-out', 'client-hello-in', 'server-hello-out', 'server-hello-in'],
  },
  {
    id: 'certificate',
    nodes: ['browser', 'server', 'certificate', 'cert-verify'],
    paths: ['certificate-out', 'certificate-in', 'cert-verify-out', 'cert-verify-in'],
  },
  {
    id: 'data',
    nodes: ['browser', 'server', 'finished-s', 'finished-c', 'request', 'response'],
    paths: ['finished-s-out', 'finished-s-in', 'finished-c-out', 'finished-c-in', 'request-out', 'request-in', 'response-out', 'response-in'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TlsHandshakeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-tls-handshake-arrow`
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
      scenarios={tlsHandshakeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 516' : '0 0 280 516'}>
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
