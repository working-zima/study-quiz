import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['reverse-name']

// 세로형은 위 상자에 정방향 조회(이름 → 주소)를 한 줄로 두고, 아래 상자에 역방향 조회의 단계를 위에서 아래로 쌓는다.
// 주소 → 네 수를 거꾸로 적은 것 → in-addr.arpa 이름 → PTR 레코드 → 호스트 이름의 차례다. 긴 in-addr.arpa 이름은 한 줄 전체 폭을 쓴다.
// 곁말은 화살표 오른쪽에 놓인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'f-name', x: 16, y: 32, width: 112 },
  { id: 'f-addr', x: 152, y: 32, width: 112 },
  { id: 'r-addr', x: 24, y: 112, width: 120 },
  { id: 'r-flip', x: 24, y: 168, width: 120 },
  { id: 'r-arpa', x: 24, y: 224, width: 232 },
  { id: 'r-ptr', x: 24, y: 280, width: 120 },
  { id: 'r-host', x: 24, y: 336, width: 120 },
]

const groups = [
  { id: 'forward', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 21 },
  { id: 'reverse', x: 8, y: 88, width: 264, height: 296, labelX: 16, labelY: 101 },
]

const paths: Record<string, string> = {
  'f-a': 'M128 48 H152',
  'flip': 'M48 144 V168',
  'suffix': 'M48 200 V224',
  'ask': 'M48 256 V280',
  'answer': 'M48 312 V336',
}

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'a-note', x: 140, y: 26, anchor: 'middle', scenarios: ['forward'] },
  { id: 'flip-note', x: 60, y: 160, anchor: 'start', scenarios: ['reverse-name'] },
  { id: 'suffix-note', x: 60, y: 216, anchor: 'start', scenarios: ['reverse-name'] },
  { id: 'ask-note', x: 60, y: 272, anchor: 'start', scenarios: ['ptr'] },
  { id: 'answer-note', x: 60, y: 328, anchor: 'start', scenarios: ['ptr'] },
]

// 가로형은 역방향 조회를 ㄷ자로 돈다. 주소에서 오른쪽의 거꾸로 적은 수로, 그 아래 in-addr.arpa 이름과 PTR 레코드로 내려와,
// 왼쪽의 호스트 이름으로 돌아온다. 정방향 조회의 두 노드는 역방향 첫 줄의 두 노드와 같은 열에 둔다.
const wideNodes = [
  { id: 'f-name', x: 24, y: 32, width: 120 },
  { id: 'f-addr', x: 264, y: 32, width: 120 },
  { id: 'r-addr', x: 24, y: 112, width: 120 },
  { id: 'r-flip', x: 264, y: 112, width: 120 },
  { id: 'r-arpa', x: 228, y: 176, width: 192 },
  { id: 'r-ptr', x: 264, y: 240, width: 120 },
  { id: 'r-host', x: 24, y: 240, width: 120 },
]

const wideGroups = [
  { id: 'forward', x: 8, y: 8, width: 424, height: 64, labelX: 16, labelY: 21 },
  { id: 'reverse', x: 8, y: 88, width: 424, height: 208, labelX: 16, labelY: 101 },
]

const widePaths: Record<string, string> = {
  'f-a': 'M144 48 H264',
  'flip': 'M144 128 H264',
  'suffix': 'M324 144 V176',
  'ask': 'M324 208 V240',
  'answer': 'M264 256 H144',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'a-note', x: 204, y: 26, anchor: 'middle' },
  { id: 'flip-note', x: 204, y: 122, anchor: 'middle' },
  { id: 'suffix-note', x: 316, y: 164, anchor: 'end' },
  { id: 'ask-note', x: 316, y: 228, anchor: 'end' },
  { id: 'answer-note', x: 204, y: 284, anchor: 'middle' },
]

// 정방향: 이름으로 A 레코드에서 주소를 받는다. 이름 만들기: 주소를 in-addr.arpa 이름으로 바꾼다. PTR: 그 이름의 PTR 레코드가 호스트 이름을 알려 준다.
export const reverseNameScenarios: DiagramScenario[] = [
  { id: 'forward', nodes: ['f-name', 'f-addr'], paths: ['f-a'] },
  { id: 'reverse-name', nodes: ['r-addr', 'r-flip', 'r-arpa'], paths: ['flip', 'suffix'] },
  { id: 'ptr', nodes: ['r-arpa', 'r-ptr', 'r-host'], paths: ['ask', 'answer'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ReverseNameDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-reverse-name-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={reverseNameScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 304' : '0 0 280 392'}>
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
