import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['dnssec-chain']

// 세로형은 위 박스에 서명된 세 영역을 루트 → com → example.com 차례로 위에서 아래로 쌓고, 왼쪽의 선으로 위아래 영역을 잇는다.
// 그 아래 박스에 응답에 함께 실린 레코드와 서명(RRSIG)을 나란히 두고, 맨 아래에 그 답을 받는 로컬 DNS 서버를 둔다(박스 밖).
// 노드는 모두 회색이고, 확인된 것과 감추지 않는 것은 색이 아니라 곁말로 가른다.
const nodes = [
  { id: 'root', x: 32, y: 24, width: 136 },
  { id: 'com', x: 32, y: 80, width: 136 },
  { id: 'example', x: 32, y: 136, width: 136 },
  { id: 'record', x: 16, y: 216, width: 128 },
  { id: 'signature', x: 156, y: 216, width: 112 },
  { id: 'local', x: 16, y: 288, width: 128 },
]

const groups = [
  { id: 'chain', x: 2, y: 4, width: 276, height: 176, labelX: 10, labelY: 17 },
  { id: 'answer', x: 2, y: 196, width: 276, height: 72, labelX: 10, labelY: 209 },
]

// 세 영역을 잇는 선(l-)은 늘 보이고 흐려지지 않는다. 서명을 붙이는 쪽(signs)과 답이 가는 쪽(deliver)만 화살표다.
const paths: Record<string, string> = {
  'l-root-com': 'M48 56 V80',
  'l-com-example': 'M48 112 V136',
  'signs': 'M162 168 V216',
  'deliver': 'M80 248 V288',
}

const linkIds = ['l-root-com', 'l-com-example']

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'sign-note', x: 154, y: 192, anchor: 'end', scenarios: ['sign'] },
  { id: 'root-com-note', x: 64, y: 72, anchor: 'start', scenarios: ['verify'] },
  { id: 'com-example-note', x: 64, y: 128, anchor: 'start', scenarios: ['verify'] },
  { id: 'local-note', x: 16, y: 336, anchor: 'start', scenarios: ['verify'] },
  { id: 'visible-note', x: 212, y: 260, anchor: 'middle', scenarios: ['visible'] },
]

// 가로형은 왼쪽 박스에 세 영역을 같은 차례로 쌓고, 오른쪽 위에 로컬 DNS 서버를, 그 아래 박스에 레코드와 서명을 위아래로 둔다.
// example.com 영역에서 서명으로 가는 화살표는 곧은 가로선이고, 답은 레코드에서 위의 로컬 DNS 서버로 간다.
const wideNodes = [
  { id: 'root', x: 20, y: 28, width: 160 },
  { id: 'com', x: 20, y: 84, width: 160 },
  { id: 'example', x: 20, y: 140, width: 160 },
  { id: 'record', x: 276, y: 96, width: 144 },
  { id: 'signature', x: 276, y: 140, width: 144 },
  { id: 'local', x: 276, y: 20, width: 144 },
]

const wideGroups = [
  { id: 'chain', x: 8, y: 8, width: 240, height: 196, labelX: 16, labelY: 21 },
  { id: 'answer', x: 264, y: 72, width: 168, height: 124, labelX: 300, labelY: 85 },
]

const widePaths: Record<string, string> = {
  'l-root-com': 'M36 60 V84',
  'l-com-example': 'M36 116 V140',
  'signs': 'M180 156 H276',
  'deliver': 'M288 96 V52',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'sign-note', x: 20, y: 188, anchor: 'start' },
  { id: 'root-com-note', x: 52, y: 76, anchor: 'start' },
  { id: 'com-example-note', x: 52, y: 132, anchor: 'start' },
  { id: 'local-note', x: 296, y: 66, anchor: 'start' },
  { id: 'visible-note', x: 348, y: 188, anchor: 'middle' },
]

// 서명: example.com 영역이 레코드에 서명을 붙여 둔다. 확인: 로컬 DNS 서버가 답을 받아 루트까지 이어진 사슬의 키로 서명을 확인한다.
// 감추지 않음: 응답에 실린 레코드와 서명은 그대로 보인다.
export const dnssecChainScenarios: DiagramScenario[] = [
  { id: 'sign', nodes: ['example', 'record', 'signature'], paths: ['signs'] },
  { id: 'verify', nodes: ['root', 'com', 'example', 'record', 'signature', 'local'], paths: ['deliver'] },
  { id: 'visible', nodes: ['record', 'signature'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DnssecChainDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-dnssec-chain-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={dnssecChainScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 212' : '0 0 280 344'}>
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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
