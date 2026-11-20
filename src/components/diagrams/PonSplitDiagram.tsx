import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['transmission-media'].diagrams['pon-split']

// 세로형은 왼쪽 통신사 설비 박스에 OLT01을, 가운데에 광 분배기를, 오른쪽에 집 1~4의 ONU를 위에서 아래로 쌓는다.
// PON의 광섬유는 OLT01 → 광 분배기 → ONU 넷으로 가고, 점 대 점의 광섬유는 광 분배기의 위아래로 돌아 OLT01에서 ONU마다 따로 간다.
// 화살표는 OLT01이 집 쪽으로 내려보내는 빛이 지나는 광섬유 한 가닥이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'olt', x: 16, y: 68, width: 64 },
  { id: 'splitter', x: 104, y: 68, width: 72 },
  { id: 'onu1', x: 196, y: 8, width: 76 },
  { id: 'onu2', x: 196, y: 48, width: 76 },
  { id: 'onu3', x: 196, y: 88, width: 76 },
  { id: 'onu4', x: 196, y: 128, width: 76 },
]

const groups = [
  { id: 'carrier', x: 8, y: 48, width: 80, height: 72, labelX: 16, labelY: 61 },
]

const paths: Record<string, string> = {
  'olt-splitter': 'M80 84 H104',
  'splitter-onu1': 'M176 72 H182 V24 H196',
  'splitter-onu2': 'M176 80 H190 V64 H196',
  'splitter-onu3': 'M176 88 H190 V104 H196',
  'splitter-onu4': 'M176 96 H182 V144 H196',
  'olt-onu1': 'M80 72 H92 V14 H196',
  'olt-onu2': 'M80 76 H98 V54 H196',
  'olt-onu3': 'M80 92 H98 V114 H196',
  'olt-onu4': 'M80 96 H92 V154 H196',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 그림 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'pon-note': 'pon',
  'ptp-note': 'ptp',
}

const notes: Note[] = [
  { id: 'pon-note', x: 140, y: 180, anchor: 'middle' },
  { id: 'ptp-note', x: 140, y: 180, anchor: 'middle' },
]

// 가로형은 같은 짜임을 넓힌다. 점 대 점의 광섬유가 도는 세로줄은 통신사 설비 박스와 광 분배기 사이에 둔다.
const wideNodes = [
  { id: 'olt', x: 24, y: 68, width: 72 },
  { id: 'splitter', x: 176, y: 68, width: 72 },
  { id: 'onu1', x: 340, y: 8, width: 84 },
  { id: 'onu2', x: 340, y: 48, width: 84 },
  { id: 'onu3', x: 340, y: 88, width: 84 },
  { id: 'onu4', x: 340, y: 128, width: 84 },
]

const wideGroups = [
  { id: 'carrier', x: 8, y: 48, width: 104, height: 72, labelX: 16, labelY: 61 },
]

const widePaths: Record<string, string> = {
  'olt-splitter': 'M96 84 H176',
  'splitter-onu1': 'M248 72 H288 V24 H340',
  'splitter-onu2': 'M248 80 H300 V64 H340',
  'splitter-onu3': 'M248 88 H300 V104 H340',
  'splitter-onu4': 'M248 96 H288 V144 H340',
  'olt-onu1': 'M96 72 H124 V14 H340',
  'olt-onu2': 'M96 76 H140 V54 H340',
  'olt-onu3': 'M96 92 H140 V114 H340',
  'olt-onu4': 'M96 96 H124 V154 H340',
}

const wideNotes: Note[] = [
  { id: 'pon-note', x: 220, y: 184, anchor: 'middle' },
  { id: 'ptp-note', x: 220, y: 184, anchor: 'middle' },
]

// PON: OLT01에서 나온 한 가닥이 광 분배기에서 넷으로 나뉜다. 점 대 점: 광 분배기 없이 OLT01에서 집마다 한 가닥씩 간다.
export const ponSplitScenarios: DiagramScenario[] = [
  {
    id: 'pon',
    nodes: ['olt', 'splitter', 'onu1', 'onu2', 'onu3', 'onu4'],
    paths: ['olt-splitter', 'splitter-onu1', 'splitter-onu2', 'splitter-onu3', 'splitter-onu4'],
  },
  {
    id: 'ptp',
    nodes: ['olt', 'onu1', 'onu2', 'onu3', 'onu4'],
    paths: ['olt-onu1', 'olt-onu2', 'olt-onu3', 'olt-onu4'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PonSplitDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-pon-split-arrow`
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
      scenarios={ponSplitScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 196' : '0 0 280 192'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
