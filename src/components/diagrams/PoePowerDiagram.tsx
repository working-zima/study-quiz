import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-devices'].diagrams['poe-power']

// 세로형은 맨 위 가운데에 PoE 스위치 SW01을, 그 아래 양옆에 무선 AP AP01(왼쪽)과 IP 카메라 CAM01(오른쪽)을,
// 맨 아래 가운데에 컴퓨터 PC01을 둔다. SW01에서 세 장치로 랜선이 하나씩 내려간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'sw01', x: 84, y: 8, width: 112 },
  { id: 'ap01', x: 8, y: 96, width: 88 },
  { id: 'cam01', x: 168, y: 96, width: 104 },
  { id: 'pc01', x: 100, y: 168, width: 80 },
]

// 랜선 셋은 늘 보인다. 데이터와 전원의 선은 고른 시나리오에서만 그 랜선 바로 위에 겹쳐 그린다 — 같은 랜선으로 오간다는 뜻이다.
// 데이터의 선은 프레임이 두 방향으로 오가므로 화살표가 없고, 전원의 선은 SW01에서 PD 쪽으로만 가므로 화살표가 있다.
const paths: Record<string, string> = {
  'link-ap01': 'M104 40 V64 H52 V96',
  'link-cam01': 'M176 40 V64 H220 V96',
  'link-pc01': 'M140 40 V168',
  'data-ap01': 'M104 40 V64 H52 V96',
  'data-cam01': 'M176 40 V64 H220 V96',
  'data-pc01': 'M140 40 V168',
  'power-ap01': 'M104 40 V64 H52 V96',
  'power-cam01': 'M176 40 V64 H220 V96',
}

const linkIds = ['link-ap01', 'link-cam01', 'link-pc01']
const arrowPaths = new Set(['power-ap01', 'power-cam01'])

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 역할 곁말(PSE·PD)은 늘 보이고 자기 노드를 따라 흐려진다. 시나리오 곁말은 자기 시나리오를 골랐을 때만 맨 아래 가운데에 보인다.
const fixedNoteOwner: Record<string, string> = {
  'pse': 'sw01',
  'pd-ap01': 'ap01',
  'pd-cam01': 'cam01',
}

const noteScenarios: Record<string, string> = {
  'data-note': 'data',
  'power-note': 'power',
}

const fixedNotes: Note[] = [
  { id: 'pse', x: 202, y: 28, anchor: 'start' },
  { id: 'pd-ap01', x: 52, y: 142, anchor: 'middle' },
  { id: 'pd-cam01', x: 220, y: 142, anchor: 'middle' },
]

const notes: Note[] = [
  { id: 'data-note', x: 140, y: 222, anchor: 'middle' },
  { id: 'power-note', x: 140, y: 222, anchor: 'middle' },
]

// 가로형은 맨 위 가운데에 SW01을, 그 아래 한 줄에 왼쪽부터 AP01·PC01·CAM01을 둔다. PC01은 SW01 바로 아래다.
const wideNodes = [
  { id: 'sw01', x: 164, y: 16, width: 112 },
  { id: 'ap01', x: 32, y: 104, width: 88 },
  { id: 'cam01', x: 320, y: 104, width: 104 },
  { id: 'pc01', x: 180, y: 104, width: 80 },
]

const widePaths: Record<string, string> = {
  'link-ap01': 'M196 48 V72 H76 V104',
  'link-cam01': 'M244 48 V72 H372 V104',
  'link-pc01': 'M220 48 V104',
  'data-ap01': 'M196 48 V72 H76 V104',
  'data-cam01': 'M244 48 V72 H372 V104',
  'data-pc01': 'M220 48 V104',
  'power-ap01': 'M196 48 V72 H76 V104',
  'power-cam01': 'M244 48 V72 H372 V104',
}

const wideFixedNotes: Note[] = [
  { id: 'pse', x: 282, y: 36, anchor: 'start' },
  { id: 'pd-ap01', x: 76, y: 150, anchor: 'middle' },
  { id: 'pd-cam01', x: 372, y: 150, anchor: 'middle' },
]

const wideNotes: Note[] = [
  { id: 'data-note', x: 220, y: 168, anchor: 'middle' },
  { id: 'power-note', x: 220, y: 168, anchor: 'middle' },
]

// 데이터: SW01이 세 장치와 랜선으로 프레임을 주고받는다(PC01 포함). 전원: SW01이 PD인 AP01과 CAM01에만 그 랜선으로 전원을 보내고 PC01은 흐려진다.
export const poePowerScenarios: DiagramScenario[] = [
  {
    id: 'data',
    nodes: ['sw01', 'ap01', 'cam01', 'pc01'],
    paths: ['data-ap01', 'data-cam01', 'data-pc01'],
  },
  {
    id: 'power',
    nodes: ['sw01', 'ap01', 'cam01'],
    paths: ['power-ap01', 'power-cam01'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PoePowerDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-poe-power-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutFixedNotes = wide ? wideFixedNotes : fixedNotes
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={poePowerScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 232'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
              markerEnd={arrowPaths.has(id) ? `url(#${arrowId})` : undefined}
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

          {layoutFixedNotes.map((note) => (
            <text key={note.id} data-fixed-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(fixedNoteOwner[note.id])}>
              {text.notes![note.id]}
            </text>
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
