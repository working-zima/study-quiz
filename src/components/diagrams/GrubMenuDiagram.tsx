import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['grub-menu']

// 세로형은 위에 테두리 GRUB 메뉴 안의 두 항목을 나란히 두고, 그 아래 같은 열에 고른 뒤 실행될 것을 둔다.
// Linux 항목 아래는 Linux 커널 하나, Windows 항목 아래는 Windows의 부트 로더와 그 아래 Windows다.
const nodes = [
  { id: 'linux-item', x: 24, y: 32, width: 104 },
  { id: 'windows-item', x: 152, y: 32, width: 104 },
  { id: 'kernel', x: 24, y: 104, width: 104 },
  { id: 'win-loader', x: 136, y: 104, width: 136 },
  { id: 'windows', x: 156, y: 176, width: 96 },
]

const groups = [
  { id: 'menu', x: 8, y: 8, width: 264, height: 64, labelX: 20, labelY: 23 },
]

const paths: Record<string, string> = {
  'linux-path': 'M76 64 V104',
  'chain-path': 'M204 64 V104',
  'windows-path': 'M204 136 V176',
}

// 「직접 불러옴」은 Linux 커널 아래에, 「체인 로딩」은 Windows 항목에서 내려가는 화살표 왼쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'linux', x: 76, y: 156, anchor: 'middle', scenarios: ['linux'] },
  { id: 'windows', x: 196, y: 92, anchor: 'end', scenarios: ['windows'] },
]

// 가로형은 왼쪽 테두리 안에 두 항목을 세로로 두고, 오른쪽으로 고른 뒤 실행될 것을 같은 줄에 둔다.
const wideNodes = [
  { id: 'linux-item', x: 20, y: 32, width: 104 },
  { id: 'windows-item', x: 20, y: 80, width: 104 },
  { id: 'kernel', x: 176, y: 32, width: 104 },
  { id: 'win-loader', x: 176, y: 80, width: 136 },
  { id: 'windows', x: 344, y: 80, width: 88 },
]

const wideGroups = [
  { id: 'menu', x: 8, y: 8, width: 128, height: 120, labelX: 20, labelY: 23 },
]

const widePaths: Record<string, string> = {
  'linux-path': 'M124 48 H176',
  'chain-path': 'M124 96 H176',
  'windows-path': 'M312 96 H344',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'linux', x: 288, y: 52, anchor: 'start' },
  { id: 'windows', x: 244, y: 132, anchor: 'middle' },
]

export const grubMenuScenarios: DiagramScenario[] = [
  { id: 'linux', nodes: ['linux-item', 'kernel'], paths: ['linux-path'] },
  { id: 'windows', nodes: ['windows-item', 'win-loader', 'windows'], paths: ['chain-path', 'windows-path'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function GrubMenuDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-grub-menu-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={grubMenuScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 216'}>
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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
