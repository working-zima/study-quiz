import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-management-tools'].diagrams['tool-access']

// 세로형은 웹 브라우저 칸을 위에, Azure Resource Manager를 가운데에, 설치 칸과 휴대폰 칸을 아래에 나란히 둔다.
// 설치 칸의 두 도구는 위아래로 쌓고, 아래쪽 Azure CLI의 화살표는 두 칸 사이의 틈(x 144)으로 올라간다.
const nodes = [
  { id: 'portal', x: 24, y: 30, width: 76 },
  { id: 'cloud-shell', x: 136, y: 30, width: 120 },
  { id: 'arm', x: 64, y: 112, width: 152 },
  { id: 'powershell', x: 16, y: 190, width: 116 },
  { id: 'cli', x: 16, y: 230, width: 72 },
  { id: 'mobile', x: 156, y: 190, width: 104 },
]
const paths: Record<string, string> = {
  'portal-to-arm': 'M80 62 V112',
  'shell-to-arm': 'M196 62 V112',
  'ps-to-arm': 'M120 190 V144',
  'cli-to-arm': 'M88 246 H144 V144',
  'mobile-to-arm': 'M210 190 V144',
}
const groups = [
  { id: 'g-browser', x: 8, y: 8, width: 264, height: 80 },
  { id: 'g-install', x: 8, y: 168, width: 132, height: 120 },
  { id: 'g-phone', x: 148, y: 168, width: 124, height: 80 },
]
const notes = [
  { id: 'browser-note', x: 140, y: 80, anchor: 'middle' as const, scenario: 'browser' },
  { id: 'install-note', x: 16, y: 280, anchor: 'start' as const, scenario: 'install' },
  { id: 'phone-note', x: 210, y: 240, anchor: 'middle' as const, scenario: 'phone' },
]

// 가로형은 웹 브라우저 칸을 위 가운데에, 설치 칸과 휴대폰 칸을 아래에 나란히 두고, 칸마다 도구를 한 줄에 놓는다.
// 휴대폰 칸의 화살표는 그 칸의 라벨을 피해 왼쪽 변으로 나와 두 칸 사이의 틈(x 266)으로 올라간다.
const wideNodes = [
  { id: 'portal', x: 112, y: 30, width: 76 },
  { id: 'cloud-shell', x: 208, y: 30, width: 120 },
  { id: 'arm', x: 144, y: 112, width: 152 },
  { id: 'powershell', x: 54, y: 190, width: 116 },
  { id: 'cli', x: 178, y: 190, width: 72 },
  { id: 'mobile', x: 282, y: 190, width: 104 },
]
const widePaths: Record<string, string> = {
  'portal-to-arm': 'M168 62 V112',
  'shell-to-arm': 'M268 62 V112',
  'ps-to-arm': 'M160 190 V144',
  'cli-to-arm': 'M214 190 V144',
  'mobile-to-arm': 'M282 206 H266 V144',
}
const wideGroups = [
  { id: 'g-browser', x: 96, y: 8, width: 248, height: 80 },
  { id: 'g-install', x: 46, y: 168, width: 212, height: 80 },
  { id: 'g-phone', x: 274, y: 168, width: 120, height: 80 },
]
const wideNotes = [
  { id: 'browser-note', x: 220, y: 80, anchor: 'middle' as const, scenario: 'browser' },
  { id: 'install-note', x: 152, y: 238, anchor: 'middle' as const, scenario: 'install' },
  { id: 'phone-note', x: 334, y: 238, anchor: 'middle' as const, scenario: 'phone' },
]

export const toolAccessScenarios: DiagramScenario[] = [
  { id: 'browser', nodes: ['portal', 'cloud-shell', 'arm'], paths: ['portal-to-arm', 'shell-to-arm'] },
  { id: 'install', nodes: ['powershell', 'cli', 'arm'], paths: ['ps-to-arm', 'cli-to-arm'] },
  { id: 'phone', nodes: ['mobile', 'arm'], paths: ['mobile-to-arm'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ToolAccessDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-tool-access-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={toolAccessScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 256' : '0 0 280 296'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-disabled" x={group.x} y={group.y} width={group.width} height={group.height} rx="4" strokeWidth="1.5" />
              <text data-group-label={group.id} className="fill-muted" x={group.x + 10} y={group.y + 14} fontSize="9">
                {text.groups![group.id]}
              </text>
            </g>
          ))}

          {visiblePaths.map((id) => (
            <path key={id} data-path={id} d={layoutPaths[id]} className="fill-none stroke-title" strokeWidth="1.5" strokeLinejoin="round" markerEnd={`url(#${arrowId})`} />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
