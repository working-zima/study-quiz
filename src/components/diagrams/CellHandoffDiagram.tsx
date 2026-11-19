import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['cell-handoff']

// 세로형은 BS01의 셀(왼쪽)과 BS02의 셀(오른쪽)을 나란히 두고, 셀마다 위에 기지국을, 아래에 그 셀 안에 있을 때의 휴대폰 자리를 둔다.
// 세로 화살표는 휴대폰에서 그 휴대폰이 전파를 주고받는 기지국으로 가고, 가로 화살표는 옮기기 전 자리에서 옮긴 뒤 자리로 간다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'bs01', x: 32, y: 32, width: 80 },
  { id: 'bs02', x: 168, y: 32, width: 80 },
  { id: 'phone-before', x: 32, y: 112, width: 80 },
  { id: 'phone-after', x: 168, y: 112, width: 80 },
]

const groups = [
  { id: 'cell-bs01', x: 8, y: 8, width: 128, height: 152, labelX: 16, labelY: 21 },
  { id: 'cell-bs02', x: 144, y: 8, width: 128, height: 152, labelX: 152, labelY: 21 },
]

const paths: Record<string, string> = {
  'before-link': 'M72 112 V64',
  'move': 'M112 128 H168',
  'after-link': 'M208 112 V64',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 그 시나리오의 셀 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'before-note': 'before',
  'after-note': 'after',
}

const notes: Note[] = [
  { id: 'before-note', x: 72, y: 180, anchor: 'middle' },
  { id: 'after-note', x: 208, y: 180, anchor: 'middle' },
]

// 가로형은 같은 배치를 넓힌다. 두 셀을 넓혀 휴대폰 사이의 가로 화살표를 길게 둔다.
const wideNodes = [
  { id: 'bs01', x: 72, y: 32, width: 80 },
  { id: 'bs02', x: 288, y: 32, width: 80 },
  { id: 'phone-before', x: 72, y: 88, width: 80 },
  { id: 'phone-after', x: 288, y: 88, width: 80 },
]

const wideGroups = [
  { id: 'cell-bs01', x: 16, y: 8, width: 192, height: 128, labelX: 24, labelY: 21 },
  { id: 'cell-bs02', x: 232, y: 8, width: 192, height: 128, labelX: 240, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'before-link': 'M112 88 V64',
  'move': 'M152 104 H288',
  'after-link': 'M328 88 V64',
}

const wideNotes: Note[] = [
  { id: 'before-note', x: 112, y: 156, anchor: 'middle' },
  { id: 'after-note', x: 328, y: 156, anchor: 'middle' },
]

// 옮기기 전: BS01의 셀 안 휴대폰이 BS01과 이어진다. 옮긴 뒤: 휴대폰이 BS02의 셀로 옮겨 가고 BS02와 이어진다.
export const cellHandoffScenarios: DiagramScenario[] = [
  {
    id: 'before',
    nodes: ['bs01', 'phone-before'],
    paths: ['before-link'],
  },
  {
    id: 'after',
    nodes: ['bs02', 'phone-after'],
    paths: ['move', 'after-link'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CellHandoffDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-cell-handoff-arrow`
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
      scenarios={cellHandoffScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 168' : '0 0 280 192'}>
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
