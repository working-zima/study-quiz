import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['cloud-sdn'].diagrams['serverless-duties']

// 세로형은 왼쪽에 세 칸을 아래에서 위로 빈틈없이 쌓는다 — 서버(하드웨어)가 맨 아래, 그 위에 운영 체제, 맨 위에 응용 프로그램 코드다.
// 오른쪽 위에 「사용자가 맡는 것」, 오른쪽 아래에 「제공자가 맡는 것」을 두고, 화살표로 그 칸을 누가 맡는지 가리킨다. 노드는 모두 회색이다.
const nodes = [
  { id: 'code', x: 8, y: 40, width: 128 },
  { id: 'os', x: 8, y: 72, width: 128 },
  { id: 'server', x: 8, y: 104, width: 128 },
  { id: 'user', x: 164, y: 8, width: 108 },
  { id: 'provider', x: 164, y: 152, width: 108 },
]

// 같은 칸을 가리키는 화살표라도 시나리오마다 경로 id를 따로 둔다. 한 장면 안의 화살표끼리는 같은 구간을 함께 쓰지 않는다.
const paths: Record<string, string> = {
  'iaas-user-code': 'M164 24 H150 V56 H136',
  'iaas-user-os': 'M200 40 V88 H136',
  'iaas-provider-server': 'M164 168 H150 V120 H136',
  'serverless-user-code': 'M164 24 H150 V56 H136',
  'serverless-provider-os': 'M200 152 V88 H136',
  'serverless-provider-server': 'M164 168 H150 V120 H136',
}

// 쌓은 세 칸은 모서리를 둥글리지 않아 맞닿은 변이 한 줄로 보이게 한다.
const tierIds = ['code', 'os', 'server']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 노드들 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'iaas-note': 'iaas',
  'serverless-note': 'serverless',
}

const notes: Note[] = [
  { id: 'iaas-note', x: 140, y: 208, anchor: 'middle' },
  { id: 'serverless-note', x: 140, y: 208, anchor: 'middle' },
]

// 가로형은 세 칸을 가운데에 같은 차례로 쌓고, 「사용자가 맡는 것」을 왼쪽, 「제공자가 맡는 것」을 오른쪽에 둔다.
// 사용자의 화살표는 칸의 왼쪽 변으로, 제공자의 화살표는 칸의 오른쪽 변으로 들어간다.
const wideNodes = [
  { id: 'code', x: 164, y: 8, width: 128 },
  { id: 'os', x: 164, y: 40, width: 128 },
  { id: 'server', x: 164, y: 72, width: 128 },
  { id: 'user', x: 8, y: 16, width: 112 },
  { id: 'provider', x: 320, y: 56, width: 112 },
]

const widePaths: Record<string, string> = {
  'iaas-user-code': 'M120 24 H164',
  'iaas-user-os': 'M120 44 H164',
  'iaas-provider-server': 'M320 80 H292',
  'serverless-user-code': 'M120 24 H164',
  'serverless-provider-os': 'M320 64 H292',
  'serverless-provider-server': 'M320 80 H292',
}

const wideNotes: Note[] = [
  { id: 'iaas-note', x: 220, y: 128, anchor: 'middle' },
  { id: 'serverless-note', x: 220, y: 128, anchor: 'middle' },
]

// IaaS: 사용자가 운영 체제와 응용 프로그램 코드를, 제공자가 서버를 맡는다.
// 서버리스: 사용자는 응용 프로그램 코드만 맡고, 운영 체제와 서버는 제공자가 맡는다. 두 장면 모두 노드 다섯이 다 나오고, 화살표가 누가 무엇을 맡는지 가른다.
export const serverlessDutiesScenarios: DiagramScenario[] = [
  {
    id: 'iaas',
    nodes: ['code', 'os', 'server', 'user', 'provider'],
    paths: ['iaas-user-code', 'iaas-user-os', 'iaas-provider-server'],
  },
  {
    id: 'serverless',
    nodes: ['code', 'os', 'server', 'user', 'provider'],
    paths: ['serverless-user-code', 'serverless-provider-os', 'serverless-provider-server'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ServerlessDutiesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-serverless-duties-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={serverlessDutiesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 140' : '0 0 280 220'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx={tierIds.includes(node.id) ? 0 : 4} strokeWidth="1.5" />
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
