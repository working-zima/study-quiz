import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['diagnostic-commands'].diagrams['ipconfig-view']

// 세로형은 맨 위에 두 명령을 나란히 두고, 그 아래에 옵션 없이도 나오는 줄 셋과 /all에서 더 나오는 줄 둘을 박스로 나눠 쌓는다.
// 줄마다 왼쪽 칸이 항목 이름, 오른쪽 칸이 값이고 두 칸은 맞닿는다. 화면을 흉내 내지 않고 항목만 보인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'cmd-basic', x: 16, y: 8, width: 112 },
  { id: 'cmd-all', x: 152, y: 8, width: 112 },
  { id: 'ip-label', x: 16, y: 76, width: 104 },
  { id: 'ip-value', x: 120, y: 76, width: 128 },
  { id: 'mask-label', x: 16, y: 108, width: 104 },
  { id: 'mask-value', x: 120, y: 108, width: 128 },
  { id: 'gateway-label', x: 16, y: 140, width: 104 },
  { id: 'gateway-value', x: 120, y: 140, width: 128 },
  { id: 'host-label', x: 16, y: 216, width: 104 },
  { id: 'host-value', x: 120, y: 216, width: 128 },
  { id: 'dns-label', x: 16, y: 248, width: 104 },
  { id: 'dns-value', x: 120, y: 248, width: 128 },
]

const groups = [
  { id: 'basic', x: 8, y: 56, width: 256, height: 124, labelX: 16, labelY: 69 },
  { id: 'extra', x: 8, y: 196, width: 256, height: 92, labelX: 16, labelY: 209 },
]

// 화살표는 명령에서 그 명령이 보여 주는 줄들의 박스로 간다. /all은 두 박스 모두로 가고, 아래 박스로는 오른쪽 바깥을 돌아 내려간다.
const paths: Record<string, string> = {
  'basic-out': 'M72 40 V56',
  'all-basic': 'M208 40 V56',
  'all-extra': 'M264 24 H274 V204 H264',
}

// 가로형은 두 박스를 나란히 두고, 명령을 각 박스 위에 둔다. /all에서 왼쪽 박스로 가는 화살표는 두 명령 사이로 내려간다.
const wideNodes = [
  { id: 'cmd-basic', x: 16, y: 8, width: 136 },
  { id: 'cmd-all', x: 288, y: 8, width: 136 },
  { id: 'ip-label', x: 16, y: 76, width: 100 },
  { id: 'ip-value', x: 116, y: 76, width: 100 },
  { id: 'mask-label', x: 16, y: 108, width: 100 },
  { id: 'mask-value', x: 116, y: 108, width: 100 },
  { id: 'gateway-label', x: 16, y: 140, width: 100 },
  { id: 'gateway-value', x: 116, y: 140, width: 100 },
  { id: 'host-label', x: 236, y: 76, width: 100 },
  { id: 'host-value', x: 336, y: 76, width: 88 },
  { id: 'dns-label', x: 236, y: 108, width: 100 },
  { id: 'dns-value', x: 336, y: 108, width: 88 },
]

const wideGroups = [
  { id: 'basic', x: 8, y: 56, width: 212, height: 124, labelX: 16, labelY: 69 },
  { id: 'extra', x: 228, y: 56, width: 204, height: 124, labelX: 236, labelY: 69 },
]

const widePaths: Record<string, string> = {
  'basic-out': 'M84 40 V56',
  'all-basic': 'M288 24 H200 V56',
  'all-extra': 'M356 40 V56',
}

const basicRows = ['ip-label', 'ip-value', 'mask-label', 'mask-value', 'gateway-label', 'gateway-value']

// 옵션 없이 — 주소·서브넷 마스크·기본 게이트웨이 줄만. /all — 그 세 줄에 호스트 이름과 DNS 서버 줄이 더해진다.
export const ipconfigViewScenarios: DiagramScenario[] = [
  { id: 'basic', nodes: ['cmd-basic', ...basicRows], paths: ['basic-out'] },
  { id: 'all', nodes: ['cmd-all', ...basicRows, 'host-label', 'host-value', 'dns-label', 'dns-value'], paths: ['all-basic', 'all-extra'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IpconfigViewDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ipconfig-view-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={ipconfigViewScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 188' : '0 0 280 296'}>
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
