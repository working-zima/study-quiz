import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['resolution-steps']

// 세로형은 이름의 단계를 맡는 세 서버를 루트 → TLD → 권한 있는 서버 차례로 위에 쌓고, 그 아래에 로컬 DNS 서버, 맨 아래에 클라이언트를 둔다.
// 로컬 DNS 서버의 질의는 왼쪽 통로로 올라가 서버의 왼쪽 변에 닿고, 루트·TLD의 안내 응답은 오른쪽 통로로 내려와 로컬 DNS 서버의 오른쪽 변에 닿는다.
// 권한 있는 서버와 클라이언트는 로컬 DNS 서버의 바로 위·아래라 곧은 화살표로 잇는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 80, y: 264, width: 120 },
  { id: 'local', x: 80, y: 184, width: 120 },
  { id: 'root', x: 36, y: 8, width: 212 },
  { id: 'tld', x: 36, y: 56, width: 212 },
  { id: 'auth', x: 36, y: 104, width: 212 },
]

// q는 질의, r은 응답이고 숫자가 오가는 차례다.
const paths: Record<string, string> = {
  'q1': 'M120 264 V216',
  'q2': 'M80 208 H16 V24 H36',
  'r3': 'M248 24 H268 V208 H200',
  'q4': 'M80 192 H28 V72 H36',
  'r5': 'M248 72 H260 V192 H200',
  'q6': 'M100 184 V136',
  'r7': 'M180 136 V184',
  'r8': 'M160 216 V264',
}

// 번호 곁말은 자기 화살표 곁에, 내용 곁말은 답을 돌려주는 서버 바로 아래 줄에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'n1', x: 112, y: 244, anchor: 'end', scenarios: ['ask-local'] },
  { id: 'n2', x: 50, y: 220, anchor: 'start', scenarios: ['referral'] },
  { id: 'n3', x: 224, y: 220, anchor: 'start', scenarios: ['referral'] },
  { id: 'n4', x: 50, y: 189, anchor: 'start', scenarios: ['referral'] },
  { id: 'n5', x: 224, y: 189, anchor: 'start', scenarios: ['referral'] },
  { id: 'n6', x: 92, y: 164, anchor: 'end', scenarios: ['answer'] },
  { id: 'n7', x: 188, y: 164, anchor: 'start', scenarios: ['answer'] },
  { id: 'n8', x: 168, y: 244, anchor: 'start', scenarios: ['answer'] },
  { id: 'root-note', x: 44, y: 51, anchor: 'start', scenarios: ['referral'] },
  { id: 'tld-note', x: 44, y: 99, anchor: 'start', scenarios: ['referral'] },
  { id: 'auth-note', x: 140, y: 160, anchor: 'middle', scenarios: ['answer'] },
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
  'q1': 'M64 168 V96',
  'q2': 'M120 64 V24 H220',
  'r3': 'M220 32 H136 V64',
  'q4': 'M160 76 H220',
  'r5': 'M220 88 H160',
  'q6': 'M136 96 V136 H220',
  'r7': 'M220 144 H120 V96',
  'r8': 'M96 96 V168',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'n1', x: 58, y: 132, anchor: 'end' },
  { id: 'n2', x: 112, y: 48, anchor: 'end' },
  { id: 'n3', x: 178, y: 44, anchor: 'middle' },
  { id: 'n4', x: 190, y: 72, anchor: 'middle' },
  { id: 'n5', x: 190, y: 102, anchor: 'middle' },
  { id: 'n6', x: 178, y: 132, anchor: 'middle' },
  { id: 'n7', x: 178, y: 158, anchor: 'middle' },
  { id: 'n8', x: 102, y: 132, anchor: 'start' },
  { id: 'root-note', x: 228, y: 54, anchor: 'start' },
  { id: 'tld-note', x: 228, y: 110, anchor: 'start' },
  { id: 'auth-note', x: 228, y: 166, anchor: 'start' },
]

// 로컬에 묻기: 클라이언트의 질의 하나(①). 다음 서버 안내: 루트와 TLD에 묻고 다음 서버를 안내받는다(②~⑤).
// 최종 답: 권한 있는 서버에 물어 주소를 얻고 클라이언트에 돌려준다(⑥~⑧).
export const resolutionStepsScenarios: DiagramScenario[] = [
  { id: 'ask-local', nodes: ['client', 'local'], paths: ['q1'] },
  { id: 'referral', nodes: ['local', 'root', 'tld'], paths: ['q2', 'r3', 'q4', 'r5'] },
  { id: 'answer', nodes: ['client', 'local', 'auth'], paths: ['q6', 'r7', 'r8'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ResolutionStepsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-resolution-steps-arrow`
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
      scenarios={resolutionStepsScenarios}
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
