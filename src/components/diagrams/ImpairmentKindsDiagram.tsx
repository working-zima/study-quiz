import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['transmission-media'].diagrams['impairment-kinds']

// 세로형은 가운데 줄에 보내는 쪽 → 매체 → 받는 쪽을 위에서 아래로 잇고, 매체 왼쪽에 바깥 잡음, 오른쪽에 옆 선로를 둔다.
// 맨 아래 「받는 쪽에 닿은 신호」 박스에는 약해진 신호와, 서로 다른 자리의 먼저 닿은 성분·늦게 닿은 성분을 둔다.
// 가는 화살표(신호의 길)는 늘 보이고, 굵은 화살표(매체로 섞여 드는 길)는 잡음·누화를 골랐을 때만 보인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'sender', x: 106, y: 8, width: 68 },
  { id: 'medium', x: 108, y: 64, width: 64 },
  { id: 'receiver', x: 106, y: 120, width: 68 },
  { id: 'noise', x: 8, y: 64, width: 72 },
  { id: 'neighbor', x: 200, y: 64, width: 72 },
  { id: 'weak', x: 96, y: 240, width: 88 },
  { id: 'early', x: 24, y: 200, width: 100 },
  { id: 'late', x: 156, y: 200, width: 100 },
]

const groups = [
  { id: 'arrived', x: 8, y: 176, width: 264, height: 104, labelX: 16, labelY: 189 },
]

const paths: Record<string, string> = {
  'sender-medium': 'M140 40 V64',
  'medium-receiver': 'M140 96 V120',
  'noise-medium': 'M80 80 H108',
  'neighbor-medium': 'M200 80 H172',
}

const linkIds = ['sender-medium', 'medium-receiver']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 세로형은 받는 쪽과 아래 박스 사이의 빈 줄에 둔다.
const noteScenarios: Record<string, string> = {
  'attenuation-note': 'attenuation',
  'delay-note': 'delay',
  'noise-note': 'noise',
  'crosstalk-note': 'crosstalk',
}

const notes: Note[] = [
  { id: 'attenuation-note', x: 140, y: 166, anchor: 'middle' },
  { id: 'delay-note', x: 140, y: 166, anchor: 'middle' },
  { id: 'noise-note', x: 140, y: 166, anchor: 'middle' },
  { id: 'crosstalk-note', x: 140, y: 166, anchor: 'middle' },
]

// 가로형은 보내는 쪽 → 매체 → 받는 쪽을 왼쪽에서 오른쪽으로 잇고, 매체 위에 바깥 잡음, 아래에 옆 선로를 둔다.
// 「받는 쪽에 닿은 신호」 박스는 오른쪽 끝에 세로로 세운다.
const wideNodes = [
  { id: 'sender', x: 8, y: 64, width: 72 },
  { id: 'medium', x: 124, y: 64, width: 64 },
  { id: 'receiver', x: 236, y: 64, width: 68 },
  { id: 'noise', x: 116, y: 8, width: 80 },
  { id: 'neighbor', x: 116, y: 120, width: 80 },
  { id: 'weak', x: 328, y: 32, width: 96 },
  { id: 'early', x: 328, y: 76, width: 96 },
  { id: 'late', x: 328, y: 120, width: 96 },
]

const wideGroups = [
  { id: 'arrived', x: 320, y: 8, width: 112, height: 152, labelX: 328, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'sender-medium': 'M80 80 H124',
  'medium-receiver': 'M188 80 H236',
  'noise-medium': 'M156 40 V64',
  'neighbor-medium': 'M156 120 V96',
}

const wideNotes: Note[] = [
  { id: 'attenuation-note', x: 200, y: 176, anchor: 'middle' },
  { id: 'delay-note', x: 200, y: 176, anchor: 'middle' },
  { id: 'noise-note', x: 200, y: 176, anchor: 'middle' },
  { id: 'crosstalk-note', x: 200, y: 176, anchor: 'middle' },
]

// 감쇠: 약해진 신호가 닿는다. 지연 왜곡: 먼저 닿은 성분과 늦게 닿은 성분이 생긴다.
// 잡음: 바깥 잡음이 매체로 섞여 든다. 누화: 옆 선로의 신호가 매체로 넘어온다.
export const impairmentKindsScenarios: DiagramScenario[] = [
  {
    id: 'attenuation',
    nodes: ['sender', 'medium', 'receiver', 'weak'],
    paths: [],
  },
  {
    id: 'delay',
    nodes: ['sender', 'medium', 'receiver', 'early', 'late'],
    paths: [],
  },
  {
    id: 'noise',
    nodes: ['sender', 'medium', 'receiver', 'noise'],
    paths: ['noise-medium'],
  },
  {
    id: 'crosstalk',
    nodes: ['sender', 'medium', 'receiver', 'neighbor'],
    paths: ['neighbor-medium'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ImpairmentKindsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-impairment-kinds-arrow`
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
      scenarios={impairmentKindsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 188' : '0 0 280 288'}>
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
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              markerEnd={`url(#${arrowId})`}
            />
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
