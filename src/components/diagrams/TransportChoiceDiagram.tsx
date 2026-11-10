import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-udp'].diagrams['transport-choice']

// 세로형은 위에 기준 노드 둘을 나란히 두고, 그 아래에 TCP를 쓰는 응용 프로그램과 UDP를 쓰는 응용 프로그램을 박스(그룹) 둘에 나눠 세로로 쌓는다.
// 기준 「늦지 않게 · 짧은 질의」가 길어 오른쪽 열을 왼쪽 열보다 넓혔다. 화살표는 기준 노드 아래 변에서 그 기준으로 고르는 박스의 위 변으로 간다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'crit-complete', x: 8, y: 8, width: 116 },
  { id: 'crit-timely', x: 132, y: 8, width: 140 },
  { id: 'ftp', x: 16, y: 88, width: 100 },
  { id: 'http', x: 16, y: 128, width: 100 },
  { id: 'smtp', x: 16, y: 168, width: 100 },
  { id: 'ssh', x: 16, y: 208, width: 100 },
  { id: 'realtime', x: 140, y: 88, width: 124 },
  { id: 'dns', x: 140, y: 128, width: 124 },
  { id: 'dhcp', x: 140, y: 168, width: 124 },
  { id: 'tftp', x: 140, y: 208, width: 124 },
]

const groups = [
  { id: 'tcp', x: 8, y: 64, width: 116, height: 184, labelX: 12, labelY: 76 },
  { id: 'udp', x: 132, y: 64, width: 140, height: 184, labelX: 136, labelY: 76 },
]

const paths: Record<string, string> = {
  'to-tcp': 'M66 40 V64',
  'to-udp': 'M202 40 V64',
}

// 곁말은 자기 시나리오에서만 보이고, 두 박스 아래 가운데에 놓인다.
const notes = [
  { id: 'complete', x: 140, y: 270, scenarios: ['complete'] },
  { id: 'timely', x: 140, y: 270, scenarios: ['timely'] },
  { id: 'short-query', x: 140, y: 270, scenarios: ['short-query'] },
  { id: 'app-reliability', x: 140, y: 270, scenarios: ['app-reliability'] },
]

// 가로형은 왼쪽 열에 기준 노드 둘을 위아래로 두고, 오른쪽에 박스 둘을 위아래로 두어 기준 노드 오른쪽 변에서 박스 왼쪽 변으로 화살표를 잇는다.
// 박스 안의 응용 프로그램은 두 칸씩 두 줄로 놓는다.
const wideNodes = [
  { id: 'crit-complete', x: 8, y: 44, width: 140 },
  { id: 'crit-timely', x: 8, y: 164, width: 140 },
  { id: 'ftp', x: 172, y: 32, width: 122 },
  { id: 'http', x: 302, y: 32, width: 122 },
  { id: 'smtp', x: 172, y: 72, width: 122 },
  { id: 'ssh', x: 302, y: 72, width: 122 },
  { id: 'realtime', x: 172, y: 152, width: 122 },
  { id: 'dns', x: 302, y: 152, width: 122 },
  { id: 'dhcp', x: 172, y: 192, width: 122 },
  { id: 'tftp', x: 302, y: 192, width: 122 },
]

const wideGroups = [
  { id: 'tcp', x: 164, y: 8, width: 268, height: 104, labelX: 172, labelY: 20 },
  { id: 'udp', x: 164, y: 128, width: 268, height: 104, labelX: 172, labelY: 140 },
]

const widePaths: Record<string, string> = {
  'to-tcp': 'M148 60 H164',
  'to-udp': 'M148 180 H164',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'complete', x: 220, y: 256 },
  { id: 'timely', x: 220, y: 256 },
  { id: 'short-query', x: 220, y: 256 },
  { id: 'app-reliability', x: 220, y: 256 },
]

// 빠짐없이: 한 바이트만 빠져도 결과가 망가지는 응용 프로그램(FTP·HTTP/1.1·SMTP·SSH)은 TCP를 쓴다.
// 늦지 않게: 재생할 때가 지나 닿은 조각이 쓸모없는 실시간 음성·영상은 UDP를 쓴다.
// 짧은 질의: 짧게 주고받고 끝나는 DNS 질의와 DHCP는 연결을 맺지 않고 UDP로 곧바로 보낸다.
// 응용이 맡는 확인: TFTP는 UDP 위에서 블록마다 확인하고 사라진 블록을 다시 보내게 한다.
export const transportChoiceScenarios: DiagramScenario[] = [
  { id: 'complete', nodes: ['crit-complete', 'ftp', 'http', 'smtp', 'ssh'], paths: ['to-tcp'] },
  { id: 'timely', nodes: ['crit-timely', 'realtime'], paths: ['to-udp'] },
  { id: 'short-query', nodes: ['crit-timely', 'dns', 'dhcp'], paths: ['to-udp'] },
  { id: 'app-reliability', nodes: ['tftp'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TransportChoiceDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-transport-choice-arrow`
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
      scenarios={transportChoiceScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 264' : '0 0 280 280'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
