import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-basics'].diagrams['network-structure']

// 노트북에서 서버까지 노드 넷을 한 줄로 잇는다. 세로형은 위에서 아래로 쌓는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'laptop', x: 32, y: 16, width: 96 },
  { id: 'home-router', x: 32, y: 80, width: 96 },
  { id: 'router', x: 32, y: 144, width: 96 },
  { id: 'server', x: 32, y: 208, width: 96 },
]

// 앞의 셋은 늘 보이는 통신 링크다. 뒤의 셋은 메시지가 건너가는 화살표이고, 같은 링크 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'laptop-home-router': 'M80 48 V80',
  'home-router-router': 'M80 112 V144',
  'router-server': 'M80 176 V208',
  'hop-1': 'M80 48 V80',
  'hop-2': 'M80 112 V144',
  'hop-3': 'M80 176 V208',
}

const linkIds = ['laptop-home-router', 'home-router-router', 'router-server']

// 노드 곁말은 노드 오른쪽에, 링크와 메시지 곁말은 링크 오른쪽에 둔다.
const notes = [
  { id: 'host-laptop', x: 140, y: 35, textAnchor: 'start' as const, scenarios: ['nodes'] },
  { id: 'host-server', x: 140, y: 227, textAnchor: 'start' as const, scenarios: ['nodes'] },
  { id: 'equipment-home-router', x: 140, y: 99, textAnchor: 'start' as const, scenarios: ['nodes'] },
  { id: 'equipment-router', x: 140, y: 163, textAnchor: 'start' as const, scenarios: ['nodes'] },
  { id: 'link-1', x: 92, y: 67, textAnchor: 'start' as const, scenarios: ['links'] },
  { id: 'link-2', x: 92, y: 131, textAnchor: 'start' as const, scenarios: ['links'] },
  { id: 'link-3', x: 92, y: 195, textAnchor: 'start' as const, scenarios: ['links'] },
  { id: 'message', x: 92, y: 67, textAnchor: 'start' as const, scenarios: ['message'] },
]

// 가로형은 노드 넷을 왼쪽에서 오른쪽으로 한 줄에 둔다. 노드 곁말은 노드 아래에, 링크와 메시지 곁말은 링크 위에 둔다.
const wideNodes = [
  { id: 'laptop', x: 8, y: 24, width: 64 },
  { id: 'home-router', x: 128, y: 24, width: 64 },
  { id: 'router', x: 248, y: 24, width: 64 },
  { id: 'server', x: 368, y: 24, width: 64 },
]

const widePaths: Record<string, string> = {
  'laptop-home-router': 'M72 40 H128',
  'home-router-router': 'M192 40 H248',
  'router-server': 'M312 40 H368',
  'hop-1': 'M72 40 H128',
  'hop-2': 'M192 40 H248',
  'hop-3': 'M312 40 H368',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'host-laptop', x: 40, y: 70, textAnchor: 'middle' as const },
  { id: 'host-server', x: 400, y: 70, textAnchor: 'middle' as const },
  { id: 'equipment-home-router', x: 160, y: 70, textAnchor: 'middle' as const },
  { id: 'equipment-router', x: 280, y: 70, textAnchor: 'middle' as const },
  { id: 'link-1', x: 100, y: 30, textAnchor: 'middle' as const },
  { id: 'link-2', x: 220, y: 30, textAnchor: 'middle' as const },
  { id: 'link-3', x: 340, y: 30, textAnchor: 'middle' as const },
  { id: 'message', x: 100, y: 30, textAnchor: 'middle' as const },
]

// nodes에는 선명하게 둘 노드와 통신 링크를 함께 적는다.
export const networkStructureScenarios: DiagramScenario[] = [
  { id: 'nodes', nodes: ['laptop', 'home-router', 'router', 'server'], paths: [] },
  { id: 'links', nodes: ['laptop-home-router', 'home-router-router', 'router-server'], paths: [] },
  {
    id: 'message',
    nodes: ['laptop', 'home-router', 'router', 'server', 'laptop-home-router', 'home-router-router', 'router-server'],
    paths: ['hop-1', 'hop-2', 'hop-3'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NetworkStructureDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-network-structure-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={networkStructureScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 80' : '0 0 280 256'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
