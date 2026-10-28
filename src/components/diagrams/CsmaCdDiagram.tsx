import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams['csma-cd']

// 허브 도식(HubRepeatDiagram)과 같은 장면이다. 허브를 위에 길게 두고, 그 아래에 호스트 A~D를 한 줄로 세운다.
// 노드는 모두 회색이고, 시나리오는 A와 B가 보내는 차례를 단계로 보인다.
const nodes = [
  { id: 'hub', x: 10, y: 24, width: 260 },
  { id: 'host-a', x: 10, y: 112, width: 56 },
  { id: 'host-b', x: 78, y: 112, width: 56 },
  { id: 'host-c', x: 146, y: 112, width: 56 },
  { id: 'host-d', x: 214, y: 112, width: 56 },
]

// 케이블 넷은 늘 보인다. 화살표는 케이블 위에 겹쳐 그리고, 보낸 호스트에서 허브로 올라간다.
const paths: Record<string, string> = {
  'cable-a': 'M38 56 V112',
  'cable-b': 'M106 56 V112',
  'cable-c': 'M174 56 V112',
  'cable-d': 'M242 56 V112',
  'from-a': 'M38 112 V56',
  'from-b': 'M106 112 V56',
}

const linkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']

// 호스트 곁말은 그 호스트 아래 가운데에, 「충돌」은 A와 B의 케이블 사이 허브 바로 아래에 둔다.
const notes = [
  { id: 'listen-a', x: 38, y: 158, scenarios: ['sense'] },
  { id: 'collision', x: 72, y: 76, scenarios: ['collide'] },
  { id: 'jam-a', x: 38, y: 158, scenarios: ['collide'] },
  { id: 'jam-b', x: 106, y: 158, scenarios: ['collide'] },
  { id: 'wait-a', x: 38, y: 158, scenarios: ['backoff'] },
  { id: 'wait-b', x: 106, y: 158, scenarios: ['backoff'] },
]

// 가로형도 같은 모양이다. 폭이 넓어진 만큼 호스트를 넓히고 케이블을 줄인다.
const wideNodes = [
  { id: 'hub', x: 14, y: 24, width: 412 },
  { id: 'host-a', x: 14, y: 96, width: 88 },
  { id: 'host-b', x: 122, y: 96, width: 88 },
  { id: 'host-c', x: 230, y: 96, width: 88 },
  { id: 'host-d', x: 338, y: 96, width: 88 },
]

const widePaths: Record<string, string> = {
  'cable-a': 'M58 56 V96',
  'cable-b': 'M166 56 V96',
  'cable-c': 'M274 56 V96',
  'cable-d': 'M382 56 V96',
  'from-a': 'M58 96 V56',
  'from-b': 'M166 96 V56',
}

// 곁말 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'listen-a', x: 58, y: 142 },
  { id: 'collision', x: 112, y: 80 },
  { id: 'jam-a', x: 58, y: 142 },
  { id: 'jam-b', x: 166, y: 142 },
  { id: 'wait-a', x: 58, y: 142 },
  { id: 'wait-b', x: 166, y: 142 },
]

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다.
export const csmaCdScenarios: DiagramScenario[] = [
  { id: 'sense', nodes: ['hub', 'host-a', 'cable-a'], paths: [] },
  { id: 'collide', nodes: ['hub', 'host-a', 'host-b', 'cable-a', 'cable-b'], paths: ['from-a', 'from-b'] },
  { id: 'backoff', nodes: ['hub', 'host-a', 'host-b', 'cable-a', 'cable-b'], paths: ['from-a'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CsmaCdDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-csma-cd-arrow`
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
      scenarios={csmaCdScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 168'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
