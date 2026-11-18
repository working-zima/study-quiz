import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['role-service-feature']

// 세로형은 맨 위에 설치하는 두 자리(마법사와 cmdlet)를 위아래로 두고, 그 아래 SRV01 박스 안에 서버 역할 박스와 기능 박스를 위아래로 둔다.
// 서버 역할 박스에는 웹 서버(IIS)와 DHCP 서버를 한 줄에 두고, 웹 서버(IIS) 아래에 그 역할 서비스 FTP 서버를 들여 두어 늘 보이는 선으로 잇는다.
// 설치 화살표 둘은 각 도구의 오른쪽 변에서 나와 SRV01 박스의 위 변에 닿는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'wizard', x: 8, y: 8, width: 160 },
  { id: 'cmdlet', x: 8, y: 48, width: 160 },
  { id: 'role-iis', x: 24, y: 136, width: 96 },
  { id: 'role-dhcp', x: 136, y: 136, width: 88 },
  { id: 'svc-ftp', x: 48, y: 180, width: 80 },
  { id: 'feat-bitlocker', x: 24, y: 248, width: 168 },
]

const groups = [
  { id: 'server', x: 8, y: 96, width: 264, height: 200, labelX: 16, labelY: 109 },
  { id: 'roles', x: 16, y: 116, width: 248, height: 104, labelX: 24, labelY: 129 },
  { id: 'features', x: 16, y: 228, width: 248, height: 60, labelX: 24, labelY: 241 },
]

// role-iis-ftp는 역할과 그 역할 서비스를 잇는 늘 보이는 선이다. 나머지는 「설치하는 자리」에서만 보이는 화살표다.
const paths: Record<string, string> = {
  'wizard-install': 'M168 24 H256 V96',
  'cmdlet-install': 'M168 64 H232 V96',
  'role-iis-ftp': 'M36 168 V196 H48',
}

const linkIds = ['role-iis-ftp']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'role-note': 'role',
  'svc-note': 'role',
  'feature-note': 'feature',
  'install-note': 'install',
}

const notes: Note[] = [
  { id: 'role-note', x: 256, y: 129, anchor: 'end' },
  { id: 'svc-note', x: 136, y: 199, anchor: 'start' },
  { id: 'feature-note', x: 256, y: 241, anchor: 'end' },
  { id: 'install-note', x: 176, y: 52, anchor: 'start' },
]

// 가로형은 설치하는 두 자리를 왼쪽에 위아래로 두고, 오른쪽 SRV01 박스 안에 서버 역할 박스와 기능 박스를 위아래로 둔다.
// 설치 화살표 둘은 도구의 오른쪽 변에서 SRV01 박스의 왼쪽 변으로 간다.
const wideNodes = [
  { id: 'wizard', x: 8, y: 60, width: 160 },
  { id: 'cmdlet', x: 8, y: 116, width: 160 },
  { id: 'role-iis', x: 216, y: 48, width: 96 },
  { id: 'role-dhcp', x: 328, y: 48, width: 88 },
  { id: 'svc-ftp', x: 240, y: 92, width: 80 },
  { id: 'feat-bitlocker', x: 216, y: 160, width: 168 },
]

const wideGroups = [
  { id: 'server', x: 200, y: 8, width: 232, height: 200, labelX: 208, labelY: 21 },
  { id: 'roles', x: 208, y: 28, width: 216, height: 104, labelX: 216, labelY: 41 },
  { id: 'features', x: 208, y: 140, width: 216, height: 60, labelX: 216, labelY: 153 },
]

const widePaths: Record<string, string> = {
  'wizard-install': 'M168 76 H200',
  'cmdlet-install': 'M168 132 H200',
  'role-iis-ftp': 'M228 80 V108 H240',
}

const wideNotes: Note[] = [
  { id: 'role-note', x: 416, y: 41, anchor: 'end' },
  { id: 'svc-note', x: 328, y: 111, anchor: 'start' },
  { id: 'feature-note', x: 416, y: 153, anchor: 'end' },
  { id: 'install-note', x: 8, y: 105, anchor: 'start' },
]

// 역할: 서버 역할 둘과 그 안의 역할 서비스. 기능: BitLocker 드라이브 암호화. 설치하는 자리: 마법사와 cmdlet, 그리고 SRV01로 가는 화살표 둘.
export const roleServiceFeatureScenarios: DiagramScenario[] = [
  { id: 'role', nodes: ['role-iis', 'role-dhcp', 'svc-ftp'], paths: [] },
  { id: 'feature', nodes: ['feat-bitlocker'], paths: [] },
  { id: 'install', nodes: ['wizard', 'cmdlet'], paths: ['wizard-install', 'cmdlet-install'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RoleServiceFeatureDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-role-service-feature-arrow`
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
      scenarios={roleServiceFeatureScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 304'}>
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
