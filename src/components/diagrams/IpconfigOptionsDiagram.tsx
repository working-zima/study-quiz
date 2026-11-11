import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['diagnostic-commands'].diagrams['ipconfig-options']

// 세로형은 맨 위 박스에 명령 전 PC의 IP 주소와 DNS 캐시를 두고, 아래에 주소를 다루는 옵션과 이름 캐시를 다루는 옵션을 박스 둘로 나눈다.
// 옵션마다 왼쪽에 옵션 칸, 오른쪽에 그 옵션을 입력한 뒤의 상태 칸을 두어, 옵션마다 다른 칸이 다른 자리에 있다.
// DHCP 서버는 /release와 /renew 사이 오른쪽에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'before-ip', x: 16, y: 28, width: 152 },
  { id: 'before-cache', x: 16, y: 64, width: 184 },
  { id: 'opt-release', x: 16, y: 136, width: 88 },
  { id: 'after-release', x: 120, y: 136, width: 88 },
  { id: 'dhcp-server', x: 184, y: 180, width: 80 },
  { id: 'opt-renew', x: 16, y: 224, width: 88 },
  { id: 'after-renew', x: 120, y: 224, width: 136 },
  { id: 'opt-displaydns', x: 16, y: 296, width: 88 },
  { id: 'after-displaydns', x: 120, y: 296, width: 148 },
  { id: 'opt-flushdns', x: 16, y: 344, width: 88 },
  { id: 'after-flush-cache', x: 120, y: 344, width: 128 },
  { id: 'after-flush-ip', x: 120, y: 384, width: 144 },
]

const groups = [
  { id: 'before', x: 8, y: 8, width: 264, height: 96, labelX: 16, labelY: 21 },
  { id: 'address', x: 8, y: 116, width: 264, height: 148, labelX: 16, labelY: 129 },
  { id: 'cache', x: 8, y: 276, width: 264, height: 152, labelX: 16, labelY: 289 },
]

// 옵션 칸에서 뒤 상태 칸으로 가는 화살표와, PC와 DHCP 서버 사이에서 주소가 오가는 화살표.
// /release는 주소를 내놓은 PC 쪽에서 DHCP 서버로, /renew는 DHCP 서버에서 주소를 다시 받은 PC 쪽으로 간다.
const paths: Record<string, string> = {
  'release-cmd': 'M104 152 H120',
  'release-to-server': 'M164 168 V196 H184',
  'renew-cmd': 'M104 240 H120',
  'renew-from-server': 'M224 212 V224',
  'display-cmd': 'M104 312 H120',
  'flush-cmd': 'M104 360 H120',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만, DHCP 서버와 잇는 화살표 옆에 보인다.
const noteScenarios: Record<string, string> = {
  'release-note': 'release',
  'renew-note': 'renew',
}

const notes: Note[] = [
  { id: 'release-note', x: 156, y: 196, anchor: 'end' },
  { id: 'renew-note', x: 216, y: 221, anchor: 'end' },
]

// 가로형은 명령 전의 두 칸을 한 줄에 두고, 주소를 다루는 박스에서는 DHCP 서버를 오른쪽에 둔다. 비운 캐시와 그대로인 주소도 한 줄에 둔다.
const wideNodes = [
  { id: 'before-ip', x: 16, y: 32, width: 168 },
  { id: 'before-cache', x: 200, y: 32, width: 200 },
  { id: 'opt-release', x: 16, y: 104, width: 88 },
  { id: 'after-release', x: 120, y: 104, width: 104 },
  { id: 'dhcp-server', x: 320, y: 128, width: 88 },
  { id: 'opt-renew', x: 16, y: 152, width: 88 },
  { id: 'after-renew', x: 120, y: 152, width: 136 },
  { id: 'opt-displaydns', x: 16, y: 224, width: 88 },
  { id: 'after-displaydns', x: 120, y: 224, width: 148 },
  { id: 'opt-flushdns', x: 16, y: 272, width: 88 },
  { id: 'after-flush-cache', x: 120, y: 272, width: 128 },
  { id: 'after-flush-ip', x: 264, y: 272, width: 152 },
]

const wideGroups = [
  { id: 'before', x: 8, y: 8, width: 424, height: 64, labelX: 16, labelY: 21 },
  { id: 'address', x: 8, y: 84, width: 424, height: 108, labelX: 16, labelY: 97 },
  { id: 'cache', x: 8, y: 204, width: 424, height: 108, labelX: 16, labelY: 217 },
]

const widePaths: Record<string, string> = {
  'release-cmd': 'M104 120 H120',
  'release-to-server': 'M224 120 H364 V128',
  'renew-cmd': 'M104 168 H120',
  'renew-from-server': 'M364 160 V168 H256',
  'display-cmd': 'M104 240 H120',
  'flush-cmd': 'M104 288 H120',
}

const wideNotes: Note[] = [
  { id: 'release-note', x: 294, y: 114, anchor: 'middle' },
  { id: 'renew-note', x: 310, y: 182, anchor: 'middle' },
]

// 명령 전 칸은 어느 시나리오에서나 선명하게 두어 뒤 상태와 견주게 한다.
const before = ['before-ip', 'before-cache']

export const ipconfigOptionsScenarios: DiagramScenario[] = [
  { id: 'release', nodes: [...before, 'opt-release', 'after-release', 'dhcp-server'], paths: ['release-cmd', 'release-to-server'] },
  { id: 'renew', nodes: [...before, 'opt-renew', 'after-renew', 'dhcp-server'], paths: ['renew-cmd', 'renew-from-server'] },
  { id: 'displaydns', nodes: [...before, 'opt-displaydns', 'after-displaydns'], paths: ['display-cmd'] },
  { id: 'flushdns', nodes: [...before, 'opt-flushdns', 'after-flush-cache', 'after-flush-ip'], paths: ['flush-cmd'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IpconfigOptionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ipconfig-options-arrow`
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
      scenarios={ipconfigOptionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 320' : '0 0 280 436'}>
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
