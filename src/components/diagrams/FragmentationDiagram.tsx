import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams.fragmentation

// 세로형은 출발지 호스트·라우터·목적지 호스트를 왼쪽 열에 위에서 아래로 두고 링크 둘로 잇는다.
// 오른쪽 열에는 그 자리에 있는 패킷과 조각을 둔다 — 첫 링크 곁에 원래 패킷, 둘째 링크 곁에 조각 셋, 목적지 곁에 다시 합친 패킷. 노드는 모두 회색이다.
const nodes = [
  { id: 'source-host', x: 16, y: 8, width: 112 },
  { id: 'packet', x: 148, y: 56, width: 120 },
  { id: 'router', x: 16, y: 104, width: 112 },
  { id: 'frag-1', x: 148, y: 152, width: 120 },
  { id: 'frag-2', x: 148, y: 192, width: 120 },
  { id: 'frag-3', x: 148, y: 232, width: 120 },
  { id: 'dest-host', x: 16, y: 280, width: 112 },
  { id: 'merged', x: 148, y: 280, width: 120 },
]

// 링크 둘은 늘 보인다. 화살표는 그 위에 겹쳐 그린다 — 원래 패킷은 첫 링크로, 조각들은 둘째 링크로 간다.
const paths: Record<string, string> = {
  'link-1': 'M40 40 V104',
  'link-2': 'M40 136 V280',
  'whole': 'M40 40 V104',
  'pieces': 'M40 136 V280',
}

const linkIds = ['link-1', 'link-2']

// MTU 곁말은 둘째 링크 바로 오른쪽에 늘 보이고 그 링크와 같은 흐림을 따른다.
const linkNotes = [
  { id: 'mtu', link: 'link-2', x: 48, y: 212, anchor: 'start' as const },
]

// 시나리오 곁말: 나누기·합치지 않음은 라우터 오른쪽에, 합침은 다시 합친 패킷 아래에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle', scenarios: string[] }[] = [
  { id: 'split-note', x: 140, y: 124, anchor: 'start', scenarios: ['split'] },
  { id: 'pass-note', x: 140, y: 124, anchor: 'start', scenarios: ['reassemble'] },
  { id: 'merge-note', x: 208, y: 328, anchor: 'middle', scenarios: ['reassemble'] },
]

// 가로형은 출발지 호스트·라우터·목적지 호스트를 한 줄로 늘어놓는다. 원래 패킷은 출발지 위에, 다시 합친 패킷은 목적지 위에,
// 조각 셋은 둘째 링크 아래에 세로로 쌓는다.
const wideNodes = [
  { id: 'source-host', x: 8, y: 56, width: 104 },
  { id: 'packet', x: 16, y: 8, width: 112 },
  { id: 'router', x: 168, y: 56, width: 104 },
  { id: 'frag-1', x: 244, y: 112, width: 112 },
  { id: 'frag-2', x: 244, y: 152, width: 112 },
  { id: 'frag-3', x: 244, y: 192, width: 112 },
  { id: 'dest-host', x: 328, y: 56, width: 104 },
  { id: 'merged', x: 320, y: 8, width: 112 },
]

const widePaths: Record<string, string> = {
  'link-1': 'M112 72 H168',
  'link-2': 'M272 72 H328',
  'whole': 'M112 72 H168',
  'pieces': 'M272 72 H328',
}

// 곁말의 자리만 배치마다 다르다. 이어진 링크와 보이는 시나리오는 세로형에서 id로 가져온다.
const wideLinkNotes = [
  { id: 'mtu', x: 300, y: 52, anchor: 'middle' as const },
]

const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' }[] = [
  { id: 'split-note', x: 220, y: 32, anchor: 'middle' },
  { id: 'pass-note', x: 220, y: 32, anchor: 'middle' },
  { id: 'merge-note', x: 380, y: 102, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 링크를 함께 적는다. 나누기에서는 목적지 쪽이, 합치기에서는 출발지와 라우터 쪽이 흐려진다.
export const fragmentationScenarios: DiagramScenario[] = [
  { id: 'split', nodes: ['source-host', 'packet', 'router', 'frag-1', 'frag-2', 'frag-3', ...linkIds], paths: ['whole', 'pieces'] },
  { id: 'reassemble', nodes: ['frag-1', 'frag-2', 'frag-3', 'dest-host', 'merged', 'link-2'], paths: ['pieces'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FragmentationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-fragmentation-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutLinkNotes = wide ? wideLinkNotes.map((note) => ({ ...linkNotes.find(({ id }) => id === note.id)!, ...note })) : linkNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={fragmentationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 336'}>
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

          {layoutLinkNotes.map((note) => (
            <text key={note.id} data-link-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.link)}>
              {text.notes![note.id]}
            </text>
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
