import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['cloud-sdn'].diagrams['sdn-planes']

// 세로형은 오른쪽 열에 위에서부터 응용 프로그램, 「제어 평면」 박스 안의 CTRL01, 「데이터 평면」 박스 안의 SW01·SW02·SW03을 쌓는다.
// 왼쪽 열에는 패킷을 보내는 컴퓨터(SW01 옆)와 목적지 192.0.2.10(SW03 옆)을 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'app', x: 152, y: 8, width: 104 },
  { id: 'ctrl01', x: 164, y: 84, width: 80 },
  { id: 'sw01', x: 164, y: 184, width: 80 },
  { id: 'sw02', x: 164, y: 232, width: 80 },
  { id: 'sw03', x: 164, y: 280, width: 80 },
  { id: 'sender', x: 8, y: 184, width: 96 },
  { id: 'dest', x: 8, y: 280, width: 88 },
]

const groups = [
  { id: 'control', x: 136, y: 64, width: 136, height: 60, labelX: 144, labelY: 77 },
  { id: 'data', x: 136, y: 160, width: 136, height: 168, labelX: 144, labelY: 173 },
]

// CTRL01에서 SW02·SW03으로 가는 화살표는 스위치 열의 오른쪽 바깥으로 돌아 내려간다. SW03으로 가는 쪽이 바깥을 돌아 두 선이 서로 가로지르지 않는다.
// 패킷의 화살표는 보내는 컴퓨터 → SW01 → SW02 → SW03 → 192.0.2.10이고, CTRL01에는 닿지 않는다.
const paths: Record<string, string> = {
  'app-ctrl': 'M232 40 V84',
  'ctrl-sw01': 'M224 116 V184',
  'ctrl-sw02': 'M244 108 H256 V248 H244',
  'ctrl-sw03': 'M244 92 H264 V296 H244',
  'pc-sw01': 'M104 200 H164',
  'sw01-sw02': 'M204 216 V232',
  'sw02-sw03': 'M204 264 V280',
  'sw03-dest': 'M164 296 H96',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 두 인터페이스의 이름은 그 인터페이스를 지나는 화살표 왼쪽의 빈자리에,
// 패킷 장면의 곁말은 「데이터 평면」 박스 아래의 빈 줄에 둔다.
const noteScenarios: Record<string, string> = {
  'northbound-note': 'rule',
  'southbound-note': 'rule',
  'forward-note': 'forward',
}

const notes: Note[] = [
  { id: 'northbound-note', x: 224, y: 58, anchor: 'end' },
  { id: 'southbound-note', x: 216, y: 145, anchor: 'end' },
  { id: 'forward-note', x: 140, y: 348, anchor: 'middle' },
]

// 가로형은 위에서부터 응용 프로그램, 「제어 평면」 박스의 CTRL01, 「데이터 평면」 박스에 SW01·SW02·SW03을 한 줄로 두고,
// 그 아래에 보내는 컴퓨터(SW01 밑)와 192.0.2.10(SW03 밑)을 둔다.
const wideNodes = [
  { id: 'app', x: 168, y: 8, width: 104 },
  { id: 'ctrl01', x: 180, y: 84, width: 80 },
  { id: 'sw01', x: 128, y: 184, width: 72 },
  { id: 'sw02', x: 228, y: 184, width: 72 },
  { id: 'sw03', x: 328, y: 184, width: 72 },
  { id: 'sender', x: 116, y: 256, width: 96 },
  { id: 'dest', x: 320, y: 256, width: 88 },
]

const wideGroups = [
  { id: 'control', x: 120, y: 64, width: 200, height: 60, labelX: 128, labelY: 77 },
  { id: 'data', x: 112, y: 160, width: 304, height: 72, labelX: 120, labelY: 173 },
]

const widePaths: Record<string, string> = {
  'app-ctrl': 'M220 40 V84',
  'ctrl-sw01': 'M188 116 V184',
  'ctrl-sw02': 'M248 116 V184',
  'ctrl-sw03': 'M260 100 H364 V184',
  'pc-sw01': 'M164 256 V216',
  'sw01-sw02': 'M200 200 H228',
  'sw02-sw03': 'M300 200 H328',
  'sw03-dest': 'M364 216 V256',
}

const wideNotes: Note[] = [
  { id: 'northbound-note', x: 228, y: 58, anchor: 'start' },
  { id: 'southbound-note', x: 176, y: 145, anchor: 'end' },
  { id: 'forward-note', x: 264, y: 308, anchor: 'middle' },
]

// 규칙 내려보내기: 응용 프로그램이 CTRL01에 정보를 주고, CTRL01이 스위치 셋 모두에 규칙을 내려보낸다. 두 컴퓨터는 흐리다.
// 규칙대로 보내기: 패킷이 보내는 컴퓨터에서 스위치 셋을 차례로 지나 192.0.2.10에 닿는다. CTRL01과 응용 프로그램은 흐리고, 어느 화살표도 CTRL01에 닿지 않는다.
export const sdnPlanesScenarios: DiagramScenario[] = [
  {
    id: 'rule',
    nodes: ['app', 'ctrl01', 'sw01', 'sw02', 'sw03'],
    paths: ['app-ctrl', 'ctrl-sw01', 'ctrl-sw02', 'ctrl-sw03'],
  },
  {
    id: 'forward',
    nodes: ['sw01', 'sw02', 'sw03', 'sender', 'dest'],
    paths: ['pc-sw01', 'sw01-sw02', 'sw02-sw03', 'sw03-dest'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SdnPlanesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-sdn-planes-arrow`
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
      scenarios={sdnPlanesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 320' : '0 0 280 360'}>
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
