import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['remote-access-services']

// 세로형은 회사 네트워크 밖의 PC01과 인터넷 사용자를 위에 두고, 그 아래 회사 네트워크 상자의 가장자리에 원격 액세스 서버를 넓게 둔다.
// 상자 안쪽 아래에는 SRV01의 공유 Data(왼쪽)와 내부 웹 응용 프로그램(오른쪽, 한 줄 더 아래)을 두어 길이 서로 엇갈리지 않게 한다.
// 바깥에서 들어오는 화살표가 상자 위 변을 지나므로 그룹 라벨은 상자 안 왼쪽 아래에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc01', x: 16, y: 8, width: 96 },
  { id: 'user', x: 152, y: 8, width: 112 },
  { id: 'ras', x: 32, y: 88, width: 216 },
  { id: 'srv01', x: 16, y: 152, width: 120 },
  { id: 'webapp', x: 128, y: 208, width: 136 },
]

const groups = [
  { id: 'company', x: 8, y: 64, width: 264, height: 184, labelX: 16, labelY: 236 },
]

// 화살표는 바깥 노드의 아래 변에서 나와 원격 액세스 서버의 위 변에 닿고, 원격 액세스 서버의 아래 변에서 나와 안쪽 노드의 위 변에 닿는다.
const paths: Record<string, string> = {
  'pc-ras': 'M64 40 V88',
  'ras-srv01': 'M76 120 V152',
  'user-ras': 'M208 40 V88',
  'ras-webapp': 'M196 120 V208',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'tunnel-key': 'vpn',
  'publish-key': 'wap',
}

const notes: Note[] = [
  { id: 'tunnel-key', x: 72, y: 60, anchor: 'start' },
  { id: 'publish-key', x: 188, y: 200, anchor: 'end' },
]

// 가로형은 바깥의 PC01과 인터넷 사용자를 왼쪽에 위아래로 두고, 오른쪽 회사 네트워크 상자의 가운데에 원격 액세스 서버를,
// 그 오른쪽에 SRV01의 공유 Data와 내부 웹 응용 프로그램을 바깥 노드와 같은 줄에 둔다.
const wideNodes = [
  { id: 'pc01', x: 16, y: 40, width: 96 },
  { id: 'user', x: 16, y: 120, width: 96 },
  { id: 'ras', x: 168, y: 80, width: 112 },
  { id: 'srv01', x: 296, y: 40, width: 136 },
  { id: 'webapp', x: 296, y: 120, width: 136 },
]

const wideGroups = [
  { id: 'company', x: 136, y: 8, width: 300, height: 160, labelX: 144, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'pc-ras': 'M112 56 H192 V80',
  'ras-srv01': 'M256 80 V56 H296',
  'user-ras': 'M112 136 H192 V112',
  'ras-webapp': 'M256 112 V136 H296',
}

const wideNotes: Note[] = [
  { id: 'tunnel-key', x: 144, y: 50, anchor: 'start' },
  { id: 'publish-key', x: 296, y: 164, anchor: 'end' },
]

// VPN: PC01·원격 액세스 서버·SRV01의 공유 Data. 웹 응용 프로그램 프록시: 인터넷 사용자·원격 액세스 서버·내부 웹 응용 프로그램.
export const remoteAccessServicesScenarios: DiagramScenario[] = [
  { id: 'vpn', nodes: ['pc01', 'ras', 'srv01'], paths: ['pc-ras', 'ras-srv01'] },
  { id: 'wap', nodes: ['user', 'ras', 'webapp'], paths: ['user-ras', 'ras-webapp'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RemoteAccessServicesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-remote-access-services-arrow`
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
      scenarios={remoteAccessServicesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 256'}>
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
