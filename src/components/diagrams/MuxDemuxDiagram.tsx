import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['transmission-media'].diagrams['mux-demux']

// 세로형은 위에 입력 A·B·C, 그 아래 다중화기, 가운데 「회선 하나」 박스, 그 아래 역다중화기, 맨 아래 출력 A·B·C를 둔다.
// 다중화기에서 역다중화기로 가는 화살표가 박스 왼쪽을 세로로 지나며 회선 하나가 되고, 그 오른쪽에 방식마다의 칸 줄 셋(주파수 구간·타임 슬롯·파장)을 쌓는다.
const nodes = [
  { id: 'in-a', x: 24, y: 8, width: 56 },
  { id: 'in-b', x: 112, y: 8, width: 56 },
  { id: 'in-c', x: 200, y: 8, width: 56 },
  { id: 'mux', x: 12, y: 72, width: 80 },
  { id: 'fdm-1', x: 96, y: 132, width: 56 },
  { id: 'fdm-2', x: 152, y: 132, width: 56 },
  { id: 'fdm-3', x: 208, y: 132, width: 56 },
  { id: 'tdm-a', x: 96, y: 172, width: 56 },
  { id: 'tdm-b', x: 152, y: 172, width: 56 },
  { id: 'tdm-c', x: 208, y: 172, width: 56 },
  { id: 'wdm-1', x: 96, y: 212, width: 56 },
  { id: 'wdm-2', x: 152, y: 212, width: 56 },
  { id: 'wdm-3', x: 208, y: 212, width: 56 },
  { id: 'demux', x: 12, y: 268, width: 80 },
  { id: 'out-a', x: 24, y: 332, width: 56 },
  { id: 'out-b', x: 112, y: 332, width: 56 },
  { id: 'out-c', x: 200, y: 332, width: 56 },
]

const groups = [
  { id: 'line', x: 8, y: 112, width: 264, height: 140, labelX: 100, labelY: 125 },
]

const paths: Record<string, string> = {
  'in-a-mux': 'M52 40 V72',
  'in-b-mux': 'M140 40 V52 H76 V72',
  'in-c-mux': 'M228 40 V60 H84 V72',
  'mux-demux': 'M52 104 V268',
  'demux-out-a': 'M52 300 V332',
  'demux-out-b': 'M76 300 V320 H140 V332',
  'demux-out-c': 'M84 300 V312 H228 V332',
}

const linkIds = ['in-a-mux', 'in-b-mux', 'in-c-mux', 'mux-demux', 'demux-out-a', 'demux-out-b', 'demux-out-c']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 셋이 한 자리를 함께 쓴다 — 한 번에 하나만 보인다.
const noteScenarios: Record<string, string> = {
  'fdm-note': 'fdm',
  'tdm-note': 'tdm',
  'wdm-note': 'wdm',
}

const notes: Note[] = [
  { id: 'fdm-note', x: 104, y: 91, anchor: 'start' },
  { id: 'tdm-note', x: 104, y: 91, anchor: 'start' },
  { id: 'wdm-note', x: 104, y: 91, anchor: 'start' },
]

// 가로형은 왼쪽에 입력 A·B·C를 세로로, 그 오른쪽에 다중화기, 가운데 「회선 하나」 박스, 그 오른쪽에 역다중화기, 오른쪽 끝에 출력 A·B·C를 둔다.
// 다중화기에서 역다중화기로 가는 화살표가 박스 아래쪽을 가로로 지나고, 그 위에 칸 줄 셋을 쌓는다.
const wideNodes = [
  { id: 'in-a', x: 4, y: 96, width: 48 },
  { id: 'in-b', x: 4, y: 136, width: 48 },
  { id: 'in-c', x: 4, y: 176, width: 48 },
  { id: 'mux', x: 62, y: 136, width: 64 },
  { id: 'fdm-1', x: 142, y: 32, width: 48 },
  { id: 'fdm-2', x: 190, y: 32, width: 48 },
  { id: 'fdm-3', x: 238, y: 32, width: 48 },
  { id: 'tdm-a', x: 142, y: 68, width: 48 },
  { id: 'tdm-b', x: 190, y: 68, width: 48 },
  { id: 'tdm-c', x: 238, y: 68, width: 48 },
  { id: 'wdm-1', x: 142, y: 104, width: 48 },
  { id: 'wdm-2', x: 190, y: 104, width: 48 },
  { id: 'wdm-3', x: 238, y: 104, width: 48 },
  { id: 'demux', x: 302, y: 136, width: 72 },
  { id: 'out-a', x: 384, y: 96, width: 48 },
  { id: 'out-b', x: 384, y: 136, width: 48 },
  { id: 'out-c', x: 384, y: 176, width: 48 },
]

const wideGroups = [
  { id: 'line', x: 134, y: 12, width: 160, height: 164, labelX: 142, labelY: 25 },
]

const widePaths: Record<string, string> = {
  'in-a-mux': 'M52 112 H72 V136',
  'in-b-mux': 'M52 152 H62',
  'in-c-mux': 'M52 192 H80 V168',
  'mux-demux': 'M126 152 H302',
  'demux-out-a': 'M358 136 V112 H384',
  'demux-out-b': 'M374 152 H384',
  'demux-out-c': 'M366 168 V192 H384',
}

const wideNotes: Note[] = [
  { id: 'fdm-note', x: 214, y: 196, anchor: 'middle' },
  { id: 'tdm-note', x: 214, y: 196, anchor: 'middle' },
  { id: 'wdm-note', x: 214, y: 196, anchor: 'middle' },
]

const chainIds = ['in-a', 'in-b', 'in-c', 'mux', 'demux', 'out-a', 'out-b', 'out-c']

// 주파수 분할: 주파수 구간 1·2·3. 시분할: 슬롯 A·B·C. 파장 분할: 파장 λ1·λ2·λ3. 신호의 길(입력 → 다중화기 → 회선 → 역다중화기 → 출력)은 셋이 같다.
export const muxDemuxScenarios: DiagramScenario[] = [
  {
    id: 'fdm',
    nodes: [...chainIds, 'fdm-1', 'fdm-2', 'fdm-3'],
    paths: [],
  },
  {
    id: 'tdm',
    nodes: [...chainIds, 'tdm-a', 'tdm-b', 'tdm-c'],
    paths: [],
  },
  {
    id: 'wdm',
    nodes: [...chainIds, 'wdm-1', 'wdm-2', 'wdm-3'],
    paths: [],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MuxDemuxDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-mux-demux-arrow`
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
      scenarios={muxDemuxScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 372'}>
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
              strokeLinejoin="round"
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
