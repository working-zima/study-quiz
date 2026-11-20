import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-devices'].diagrams['repeater-regenerate']

// 세로형은 충돌 도메인 박스 안에 위의 구간 1 박스(PC01·약해진 신호)와 아래의 구간 2 박스(PC05·다시 만든 신호)를 두고,
// 두 박스 사이에 RP01을 둔다. 신호 다시 만들기는 약해진 신호 → RP01 → 다시 만든 신호를 오른쪽으로 잇고,
// 충돌 도메인 하나는 PC01과 PC05의 신호가 왼쪽에서 함께 RP01로 모이는 것을 보인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc01', x: 32, y: 52, width: 88 },
  { id: 'weak', x: 136, y: 52, width: 112 },
  { id: 'rp01', x: 96, y: 120, width: 88 },
  { id: 'pc05', x: 32, y: 196, width: 88 },
  { id: 'regen', x: 136, y: 196, width: 112 },
]

const groups = [
  { id: 'domain', x: 8, y: 8, width: 264, height: 242, labelX: 16, labelY: 21 },
  { id: 'segment1', x: 20, y: 30, width: 240, height: 64, labelX: 28, labelY: 43 },
  { id: 'segment2', x: 20, y: 174, width: 240, height: 64, labelX: 28, labelY: 187 },
]

const paths: Record<string, string> = {
  'weak-rp01': 'M200 84 V128 H184',
  'rp01-regen': 'M184 144 H200 V196',
  'pc01-rp01': 'M76 84 V128 H96',
  'pc05-rp01': 'M76 196 V144 H96',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 두 곁말 모두 두 구간 박스 사이, 화살표가 지나는 두 세로줄의 안쪽에 둔다.
const noteScenarios: Record<string, string> = {
  'regenerate-note': 'regenerate',
  'domain-note': 'one-domain',
}

const notes: Note[] = [
  { id: 'regenerate-note', x: 140, y: 168, anchor: 'middle' },
  { id: 'domain-note', x: 140, y: 112, anchor: 'middle' },
]

// 가로형은 구간 1 박스를 왼쪽, 구간 2 박스를 오른쪽에 두고 RP01을 그 사이에 둔다. 구간마다 PC를 위에, 신호를 아래에 쌓는다.
const wideNodes = [
  { id: 'pc01', x: 32, y: 50, width: 112 },
  { id: 'weak', x: 32, y: 92, width: 112 },
  { id: 'rp01', x: 188, y: 72, width: 64 },
  { id: 'pc05', x: 296, y: 50, width: 112 },
  { id: 'regen', x: 296, y: 92, width: 112 },
]

const wideGroups = [
  { id: 'domain', x: 8, y: 8, width: 424, height: 136, labelX: 16, labelY: 21 },
  { id: 'segment1', x: 20, y: 30, width: 136, height: 104, labelX: 28, labelY: 43 },
  { id: 'segment2', x: 284, y: 30, width: 136, height: 104, labelX: 292, labelY: 43 },
]

const widePaths: Record<string, string> = {
  'weak-rp01': 'M144 108 H170 V96 H188',
  'rp01-regen': 'M252 96 H270 V108 H296',
  'pc01-rp01': 'M144 66 H170 V80 H188',
  'pc05-rp01': 'M296 66 H270 V80 H252',
}

const wideNotes: Note[] = [
  { id: 'regenerate-note', x: 220, y: 124, anchor: 'middle' },
  { id: 'domain-note', x: 220, y: 62, anchor: 'middle' },
]

// 신호 다시 만들기: 약해진 신호·RP01·다시 만든 신호가 선명하다. 충돌 도메인 하나: PC01·RP01·PC05가 선명하고 두 신호가 RP01로 모인다.
export const repeaterRegenerateScenarios: DiagramScenario[] = [
  {
    id: 'regenerate',
    nodes: ['weak', 'rp01', 'regen'],
    paths: ['weak-rp01', 'rp01-regen'],
  },
  {
    id: 'one-domain',
    nodes: ['pc01', 'rp01', 'pc05'],
    paths: ['pc01-rp01', 'pc05-rp01'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RepeaterRegenerateDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-repeater-regenerate-arrow`
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
      scenarios={repeaterRegenerateScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 258'}>
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
