import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['iis-site-pool']

// 세로형은 맨 위에 웹 브라우저와 IIS 관리자를 나란히 두고, 그 아래 SRV01 박스 안 위 줄에 사이트 둘을, 아래에 응용 프로그램 풀 하나를 둔다.
// 웹 브라우저는 바로 아래의 사이트 www.example.com으로, 두 사이트는 각자 바로 아래의 풀로 곧게 이어진다. 노드는 모두 회색이다.
const nodes = [
  { id: 'browser', x: 16, y: 8, width: 88 },
  { id: 'manager', x: 176, y: 8, width: 88 },
  { id: 'www-site', x: 16, y: 104, width: 120 },
  { id: 'default-site', x: 144, y: 104, width: 120 },
  { id: 'pool', x: 80, y: 184, width: 120 },
]

const groups = [
  { id: 'server', x: 8, y: 80, width: 264, height: 168, labelX: 16, labelY: 93 },
]

// browser-www는 요청이 사이트로 가는 길, www-pool·default-pool은 사이트가 맡겨진 풀로 가는 길, manager-server는 관리자가 SRV01을 설정하는 길이다.
const paths: Record<string, string> = {
  'browser-www': 'M60 40 V104',
  'www-pool': 'M104 136 V184',
  'default-pool': 'M176 136 V184',
  'manager-server': 'M220 40 V80',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 작업자 프로세스 곁말은 「요청」과 「같은 풀」이 함께 쓴다.
const noteScenarios: Record<string, string[]> = {
  'request-note': ['request'],
  'worker-note': ['request', 'shared'],
  'manage-note': ['manage'],
}

const notes: Note[] = [
  { id: 'request-note', x: 68, y: 64, anchor: 'start' },
  { id: 'worker-note', x: 140, y: 232, anchor: 'middle' },
  { id: 'manage-note', x: 212, y: 76, anchor: 'end' },
]

// 가로형은 웹 브라우저와 IIS 관리자를 왼쪽에 위아래로 두고, 오른쪽 SRV01 박스 안 위 줄에 사이트 둘을, 그 아래에 풀을 둔다.
const wideNodes = [
  { id: 'browser', x: 8, y: 40, width: 88 },
  { id: 'manager', x: 8, y: 120, width: 88 },
  { id: 'www-site', x: 152, y: 40, width: 120 },
  { id: 'default-site', x: 296, y: 40, width: 120 },
  { id: 'pool', x: 224, y: 120, width: 120 },
]

const wideGroups = [
  { id: 'server', x: 136, y: 8, width: 296, height: 176, labelX: 144, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'browser-www': 'M96 56 H152',
  'www-pool': 'M248 72 V120',
  'default-pool': 'M320 72 V120',
  'manager-server': 'M96 136 H136',
}

const wideNotes: Note[] = [
  { id: 'request-note', x: 8, y: 32, anchor: 'start' },
  { id: 'worker-note', x: 284, y: 172, anchor: 'middle' },
  { id: 'manage-note', x: 8, y: 112, anchor: 'start' },
]

// 요청: 웹 브라우저 → www.example.com → DefaultAppPool. 같은 풀: 사이트 둘 → DefaultAppPool. 관리: IIS 관리자 → SRV01과 그 안의 사이트·풀.
export const iisSitePoolScenarios: DiagramScenario[] = [
  { id: 'request', nodes: ['browser', 'www-site', 'pool'], paths: ['browser-www', 'www-pool'] },
  { id: 'shared', nodes: ['www-site', 'default-site', 'pool'], paths: ['www-pool', 'default-pool'] },
  { id: 'manage', nodes: ['manager', 'www-site', 'default-site', 'pool'], paths: ['manager-server'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IisSitePoolDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-iis-site-pool-arrow`
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
      scenarios={iisSitePoolScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 256'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id].includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
