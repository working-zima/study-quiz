import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['cache-expiry']

// 세로형은 캐시 상자 안에 같은 레코드의 세 시점(들어온 때, 1800초 뒤, 3600초 뒤)을 위에서 아래로 시간 차례대로 쌓고,
// 시점 사이를 늘 보이는 선으로 잇는다. 상자 아래에는 레코드를 버린 뒤 다시 물어 새 레코드를 받는 일을 둔다.
// 시점마다의 곁말은 그 시점 노드 바로 아래에 놓인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'stored', x: 24, y: 32, width: 232 },
  { id: 'half', x: 24, y: 96, width: 232 },
  { id: 'expired', x: 24, y: 160, width: 232 },
  { id: 'reask', x: 24, y: 232, width: 232 },
]

const groups = [
  { id: 'cache', x: 8, y: 8, width: 264, height: 200, labelX: 16, labelY: 21 },
]

// b-는 시점 사이를 잇는 선으로 늘 보인다. reask는 만료 뒤 다시 묻는 화살표로 만료에서만 보인다.
const paths: Record<string, string> = {
  'b-half': 'M48 64 V96',
  'b-expired': 'M48 128 V160',
  'reask': 'M48 192 V232',
}

const linkIds = ['b-half', 'b-expired']

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'stored-note', x: 60, y: 82, anchor: 'start', scenarios: ['stored'] },
  { id: 'half-note', x: 60, y: 146, anchor: 'start', scenarios: ['half'] },
  { id: 'expired-note', x: 60, y: 204, anchor: 'start', scenarios: ['expired'] },
]

// 가로형은 시점을 같은 차례로 쌓되 간격을 좁히고, 곁말을 그 시점 노드의 오른쪽에 둔다.
const wideNodes = [
  { id: 'stored', x: 24, y: 32, width: 232 },
  { id: 'half', x: 24, y: 88, width: 232 },
  { id: 'expired', x: 24, y: 144, width: 232 },
  { id: 'reask', x: 24, y: 208, width: 232 },
]

const wideGroups = [
  { id: 'cache', x: 8, y: 8, width: 424, height: 184, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'b-half': 'M48 64 V88',
  'b-expired': 'M48 120 V144',
  'reask': 'M48 176 V208',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'stored-note', x: 268, y: 52, anchor: 'start' },
  { id: 'half-note', x: 268, y: 108, anchor: 'start' },
  { id: 'expired-note', x: 268, y: 164, anchor: 'start' },
]

// 저장: 들어온 때. 1800초 뒤: TTL이 남아 캐시로 답한다. 만료: TTL이 다해 버리고 다시 묻는다.
export const cacheExpiryScenarios: DiagramScenario[] = [
  { id: 'stored', nodes: ['stored'], paths: [] },
  { id: 'half', nodes: ['half'], paths: [] },
  { id: 'expired', nodes: ['expired', 'reask'], paths: ['reask'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CacheExpiryDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-cache-expiry-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={cacheExpiryScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 248' : '0 0 280 272'}>
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
