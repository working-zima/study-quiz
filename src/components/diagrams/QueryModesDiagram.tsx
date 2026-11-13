import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['query-modes']

// 장치 배치는 이름 풀이 과정 도식과 같다. 세로형은 루트 → TLD → 권한 있는 서버를 위에 쌓고, 그 아래에 로컬 DNS 서버, 맨 아래에 클라이언트를 둔다.
// 로컬 DNS 서버의 질의는 왼쪽 통로로 올라가 서버의 왼쪽 변에 닿고, 루트·TLD의 응답은 오른쪽 통로로 내려와 로컬 DNS 서버의 오른쪽 변에 닿는다.
// 서버끼리 잇는 화살표는 없다 — 반복적 질의를 받은 서버는 다른 서버에 대신 묻지 않는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 80, y: 264, width: 120 },
  { id: 'local', x: 80, y: 184, width: 120 },
  { id: 'root', x: 36, y: 8, width: 212 },
  { id: 'tld', x: 36, y: 56, width: 212 },
  { id: 'auth', x: 36, y: 104, width: 212 },
]

// rec-는 클라이언트와 로컬 DNS 서버 사이의 재귀적 질의와 그 응답, it-는 로컬 DNS 서버가 보내는 반복적 질의와 그 응답이다. q는 질의, a는 응답이다.
const paths: Record<string, string> = {
  'rec-q': 'M120 264 V216',
  'rec-a': 'M160 216 V264',
  'it-q1': 'M80 208 H16 V24 H36',
  'it-a1': 'M248 24 H268 V208 H200',
  'it-q2': 'M80 192 H28 V72 H36',
  'it-a2': 'M248 72 H260 V192 H200',
  'it-q3': 'M100 184 V136',
  'it-a3': 'M180 136 V184',
}

// 질의의 방식을 적은 곁말은 그 질의의 화살표 곁에, 응답에 담긴 것을 적은 곁말은 답을 돌려주는 쪽 곁에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'recursive-note', x: 112, y: 244, anchor: 'end', scenarios: ['recursive'] },
  { id: 'final-note', x: 168, y: 244, anchor: 'start', scenarios: ['recursive'] },
  { id: 'iterative-note', x: 94, y: 164, anchor: 'end', scenarios: ['iterative'] },
  { id: 'root-note', x: 44, y: 51, anchor: 'start', scenarios: ['iterative'] },
  { id: 'tld-note', x: 44, y: 99, anchor: 'start', scenarios: ['iterative'] },
  { id: 'auth-note', x: 140, y: 160, anchor: 'middle', scenarios: ['iterative'] },
]

// 가로형은 세 서버를 오른쪽에 같은 차례로 쌓고, 왼쪽에 로컬 DNS 서버를 TLD 네임 서버와 같은 높이로, 그 아래에 클라이언트를 둔다.
const wideNodes = [
  { id: 'client', x: 40, y: 168, width: 120 },
  { id: 'local', x: 40, y: 64, width: 120 },
  { id: 'root', x: 220, y: 8, width: 212 },
  { id: 'tld', x: 220, y: 64, width: 212 },
  { id: 'auth', x: 220, y: 120, width: 212 },
]

const widePaths: Record<string, string> = {
  'rec-q': 'M64 168 V96',
  'rec-a': 'M96 96 V168',
  'it-q1': 'M120 64 V24 H220',
  'it-a1': 'M220 32 H136 V64',
  'it-q2': 'M160 76 H220',
  'it-a2': 'M220 88 H160',
  'it-q3': 'M136 96 V136 H220',
  'it-a3': 'M220 144 H120 V96',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'recursive-note', x: 60, y: 136, anchor: 'end' },
  { id: 'final-note', x: 166, y: 188, anchor: 'start' },
  { id: 'iterative-note', x: 112, y: 48, anchor: 'end' },
  { id: 'root-note', x: 228, y: 54, anchor: 'start' },
  { id: 'tld-note', x: 228, y: 110, anchor: 'start' },
  { id: 'auth-note', x: 228, y: 166, anchor: 'start' },
]

// 재귀적: 클라이언트가 로컬 DNS 서버에 보내는 질의와 최종 답. 반복적: 로컬 DNS 서버가 세 서버에 차례로 보내는 질의와 응답.
export const queryModesScenarios: DiagramScenario[] = [
  { id: 'recursive', nodes: ['client', 'local'], paths: ['rec-q', 'rec-a'] },
  { id: 'iterative', nodes: ['local', 'root', 'tld', 'auth'], paths: ['it-q1', 'it-a1', 'it-q2', 'it-a2', 'it-q3', 'it-a3'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function QueryModesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-query-modes-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={queryModesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 304'}>
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
