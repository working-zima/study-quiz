import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['routing'].diagrams['distance-vector']

// 세로형은 라우터 1·2·3과 네트워크를 위에서 아래로 쌓고, 라우터 1과 라우터 3을 바로 잇는 느린 링크를 오른쪽으로 돌려 잇는다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'router-1', x: 96, y: 8, width: 64 },
  { id: 'router-2', x: 96, y: 80, width: 64 },
  { id: 'router-3', x: 96, y: 152, width: 64 },
  { id: 'network', x: 44, y: 224, width: 168 },
]

// 링크 넷은 늘 보이고, 고른 시나리오의 화살표를 그 위에 겹쳐 그린다.
// 거리를 알리는 화살표는 라우터 3에서 라우터 2로, 라우터 2에서 라우터 1로 올라가고, 패킷은 느린 링크를 지나 네트워크로 간다.
const paths: Record<string, string> = {
  'link-1-2': 'M128 40 V80',
  'link-2-3': 'M128 112 V152',
  'link-3-net': 'M128 184 V224',
  'link-1-3': 'M160 24 H256 V168 H160',
  'tell-3-2': 'M128 152 V112',
  'tell-2-1': 'M128 80 V40',
  'send-1-3': 'M160 24 H256 V168 H160',
  'send-3-net': 'M128 184 V224',
}

const linkIds = ['link-1-2', 'link-2-3', 'link-3-net', 'link-1-3']

// 링크의 빠르기는 링크 곁에 늘 둔다. 알리는 거리는 가운데 줄 오른쪽에, 라우터 1이 견주는 두 쪽의 홉 수는 라우터 2의 양옆에 둔다.
// scenarios가 null인 곁말은 시나리오와 상관없이 늘 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'fast-1-2', x: 122, y: 64, anchor: 'end', scenarios: null },
  { id: 'fast-2-3', x: 122, y: 136, anchor: 'end', scenarios: null },
  { id: 'slow-1-3', x: 208, y: 18, anchor: 'middle', scenarios: null },
  { id: 'r3-tells', x: 134, y: 136, anchor: 'start', scenarios: ['announce'] },
  { id: 'r2-tells', x: 134, y: 64, anchor: 'start', scenarios: ['announce'] },
  { id: 'via-2', x: 90, y: 100, anchor: 'end', scenarios: ['hop-only'] },
  { id: 'via-3', x: 250, y: 100, anchor: 'end', scenarios: ['hop-only'] },
]

// 가로형은 왼쪽에서 오른쪽으로 라우터 1·2·3과 네트워크를 한 줄에 두고, 느린 링크를 그 아래로 돌려 잇는다.
const wideNodes = [
  { id: 'router-1', x: 8, y: 40, width: 64 },
  { id: 'router-2', x: 96, y: 40, width: 64 },
  { id: 'router-3', x: 184, y: 40, width: 64 },
  { id: 'network', x: 272, y: 40, width: 160 },
]

const widePaths: Record<string, string> = {
  'link-1-2': 'M72 56 H96',
  'link-2-3': 'M160 56 H184',
  'link-3-net': 'M248 56 H272',
  'link-1-3': 'M40 72 V112 H216 V72',
  'tell-3-2': 'M184 56 H160',
  'tell-2-1': 'M96 56 H72',
  'send-1-3': 'M40 72 V112 H216 V72',
  'send-3-net': 'M248 56 H272',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'fast-1-2', x: 84, y: 34, anchor: 'middle' },
  { id: 'fast-2-3', x: 172, y: 34, anchor: 'middle' },
  { id: 'slow-1-3', x: 128, y: 128, anchor: 'middle' },
  { id: 'r3-tells', x: 172, y: 16, anchor: 'middle' },
  { id: 'r2-tells', x: 84, y: 16, anchor: 'middle' },
  { id: 'via-2', x: 128, y: 88, anchor: 'middle' },
  { id: 'via-3', x: 128, y: 140, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 링크를 함께 적는다. 거리 알리기는 라우터 2를 지나는 줄을, 홉 수만 센다는 느린 링크를 지나는 길을 밝힌다.
export const distanceVectorScenarios: DiagramScenario[] = [
  {
    id: 'announce',
    nodes: ['router-1', 'router-2', 'router-3', 'network', 'link-1-2', 'link-2-3', 'link-3-net'],
    paths: ['tell-3-2', 'tell-2-1'],
  },
  { id: 'hop-only', nodes: ['router-1', 'router-3', 'network', 'link-1-3', 'link-3-net'], paths: ['send-1-3', 'send-3-net'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DistanceVectorDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-distance-vector-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenarios === null || (active !== null && note.scenarios.includes(active.id)))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={distanceVectorScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 148' : '0 0 280 264'}>
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
