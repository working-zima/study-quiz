import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['name-to-address']

// 세로형은 왼쪽 가운데에 PC(웹 브라우저), 오른쪽 위에 DNS 서버, 오른쪽 아래에 웹 서버를 둔다.
// 묻기는 PC 위 변에서 DNS 서버로, 답은 DNS 서버 아래 변에서 PC로, 접속은 PC 아래 변에서 웹 서버로 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc', x: 8, y: 112, width: 120 },
  { id: 'dns-server', x: 152, y: 8, width: 120 },
  { id: 'web-server', x: 120, y: 216, width: 152 },
]

const paths: Record<string, string> = {
  'ask': 'M48 112 V24 H152',
  'answer': 'M212 40 V128 H128',
  'connect': 'M48 144 V232 H120',
}

// 곁말은 자기 시나리오에서만 보이고, 자기 화살표 옆에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'ask-note', x: 56, y: 60, anchor: 'start', scenarios: ['ask'] },
  { id: 'answer-note', x: 204, y: 96, anchor: 'end', scenarios: ['answer'] },
  { id: 'connect-note', x: 56, y: 190, anchor: 'start', scenarios: ['connect'] },
]

// 가로형은 PC를 왼쪽에, 두 서버를 오른쪽 끝에 위아래로 둔다. 화살표 옆 곁말은 PC와 서버 사이의 빈 곳에 놓인다.
const wideNodes = [
  { id: 'pc', x: 8, y: 64, width: 120 },
  { id: 'dns-server', x: 280, y: 8, width: 152 },
  { id: 'web-server', x: 280, y: 120, width: 152 },
]

const widePaths: Record<string, string> = {
  'ask': 'M48 64 V24 H280',
  'answer': 'M320 40 V80 H128',
  'connect': 'M48 96 V136 H280',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'ask-note', x: 136, y: 16, anchor: 'start' },
  { id: 'answer-note', x: 136, y: 72, anchor: 'start' },
  { id: 'connect-note', x: 136, y: 128, anchor: 'start' },
]

// ① PC가 DNS 서버에 이름의 주소를 묻는다. ② DNS 서버가 주소를 답한다. ③ 웹 브라우저가 받은 주소로 웹 서버에 접속한다 — DNS 서버는 끼지 않는다.
export const nameToAddressScenarios: DiagramScenario[] = [
  { id: 'ask', nodes: ['pc', 'dns-server'], paths: ['ask'] },
  { id: 'answer', nodes: ['pc', 'dns-server'], paths: ['answer'] },
  { id: 'connect', nodes: ['pc', 'web-server'], paths: ['connect'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NameToAddressDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-name-to-address-arrow`
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
      scenarios={nameToAddressScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 256'}>
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
