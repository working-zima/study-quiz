import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['wlan-modes']

// 세로형은 맨 위에 유선 LAN을, 그 아래 줄 가운데에 AP01을, AP01의 양옆에 LAPTOP01과 LAPTOP02를 둔다.
// 화살표는 LAPTOP01이 보낸 프레임이 가는 길이다 — 인프라스트럭처 모드에서는 LAPTOP01에서 AP01로, AP01에서 LAPTOP02와 유선 LAN으로 간다.
// 애드혹 모드에서는 LAPTOP01 아래에서 AP01 밑을 돌아 LAPTOP02로 바로 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'wired', x: 96, y: 16, width: 88 },
  { id: 'laptop01', x: 8, y: 96, width: 72 },
  { id: 'ap01', x: 104, y: 96, width: 72 },
  { id: 'laptop02', x: 200, y: 96, width: 72 },
]

const paths: Record<string, string> = {
  'laptop01-ap': 'M80 112 H104',
  'ap-laptop02': 'M176 112 H200',
  'ap-wired': 'M140 96 V48',
  'laptop01-laptop02': 'M44 128 V176 H236 V128',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// SSID 곁말은 예시 곁말이라 늘 보이고 AP01의 opacity를 따른다(ADR-038). AP01 바로 아래에 둔다.
const ssidNote: Note = { id: 'ssid-note', x: 140, y: 148, anchor: 'middle' }
const wideSsidNote: Note = { id: 'ssid-note', x: 220, y: 148, anchor: 'middle' }

// 시나리오 곁말은 자기 시나리오를 골랐을 때만 보인다. 인프라스트럭처는 AP01에서 유선 LAN으로 가는 화살표 왼쪽, 애드혹은 돌아가는 화살표 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'infra-note': 'infra',
  'adhoc-note': 'adhoc',
}

const notes: Note[] = [
  { id: 'infra-note', x: 132, y: 76, anchor: 'end' },
  { id: 'adhoc-note', x: 140, y: 196, anchor: 'middle' },
]

// 가로형은 같은 배치를 넓힌다. 노트북과 AP01 사이를 넓혀 화살표를 길게 둔다.
const wideNodes = [
  { id: 'wired', x: 176, y: 16, width: 88 },
  { id: 'laptop01', x: 40, y: 96, width: 88 },
  { id: 'ap01', x: 184, y: 96, width: 72 },
  { id: 'laptop02', x: 312, y: 96, width: 88 },
]

const widePaths: Record<string, string> = {
  'laptop01-ap': 'M128 112 H184',
  'ap-laptop02': 'M256 112 H312',
  'ap-wired': 'M220 96 V48',
  'laptop01-laptop02': 'M84 128 V176 H356 V128',
}

const wideNotes: Note[] = [
  { id: 'infra-note', x: 212, y: 76, anchor: 'end' },
  { id: 'adhoc-note', x: 220, y: 196, anchor: 'middle' },
]

// 인프라스트럭처: 보이는 화살표가 모두 AP01에 닿는다. 애드혹: AP01 없이 두 노트북을 바로 잇는 화살표 하나.
export const wirelessLanModesScenarios: DiagramScenario[] = [
  {
    id: 'infra',
    nodes: ['wired', 'laptop01', 'ap01', 'laptop02'],
    paths: ['laptop01-ap', 'ap-laptop02', 'ap-wired'],
  },
  {
    id: 'adhoc',
    nodes: ['laptop01', 'laptop02'],
    paths: ['laptop01-laptop02'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function WirelessLanModesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-wireless-lan-modes-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const layoutSsidNote = wide ? wideSsidNote : ssidNote

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={wirelessLanModesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 208'}>
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
              {node.id === 'ap01' && (
                <text data-example-note={layoutSsidNote.id} x={layoutSsidNote.x} y={layoutSsidNote.y} textAnchor={layoutSsidNote.anchor} className="fill-muted" fontSize="9">
                  {text.notes![layoutSsidNote.id]}
                </text>
              )}
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
