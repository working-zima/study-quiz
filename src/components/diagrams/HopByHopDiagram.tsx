import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['routing'].diagrams['hop-by-hop']

// 호스트 A·라우터 1·라우터 2·호스트 E를 왼쪽에 위에서 아래로 잇는다. 라우터가 정한 다음 홉은 그 라우터 오른쪽 곁말로 둬서,
// 라우터마다 적는 것이 다음에 넘길 곳 하나뿐임이 보이게 한다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-a', x: 10, y: 8, width: 76 },
  { id: 'router-1', x: 10, y: 72, width: 76 },
  { id: 'router-2', x: 10, y: 136, width: 76 },
  { id: 'host-e', x: 10, y: 200, width: 76 },
]

// 연결 셋은 늘 보이고, 고른 시나리오의 홉 화살표를 그 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'link-1': 'M48 40 V72',
  'link-2': 'M48 104 V136',
  'link-3': 'M48 168 V200',
  'hop-1': 'M48 40 V72',
  'hop-2': 'M48 104 V136',
  'hop-3': 'M48 168 V200',
}

const linkIds = ['link-1', 'link-2', 'link-3']

// 「홉 하나」 곁말은 라우터 1과 라우터 2 사이 연결 곁에, 다음 홉 곁말은 그 라우터 오른쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'one-hop', x: 56, y: 124, anchor: 'start', scenarios: ['one-hop'] },
  { id: 'next-1', x: 94, y: 91, anchor: 'start', scenarios: ['next-hop'] },
  { id: 'next-2', x: 94, y: 155, anchor: 'start', scenarios: ['next-hop'] },
]

// 가로형은 네 장치를 한 줄로 잇고, 곁말은 그 아래에 둔다. 다음 홉 곁말 둘은 글이 길어 두 줄로 엇갈려 놓는다.
const wideNodes = [
  { id: 'host-a', x: 14, y: 8, width: 80 },
  { id: 'router-1', x: 125, y: 8, width: 80 },
  { id: 'router-2', x: 236, y: 8, width: 80 },
  { id: 'host-e', x: 346, y: 8, width: 80 },
]

const widePaths: Record<string, string> = {
  'link-1': 'M94 24 H125',
  'link-2': 'M205 24 H236',
  'link-3': 'M316 24 H346',
  'hop-1': 'M94 24 H125',
  'hop-2': 'M205 24 H236',
  'hop-3': 'M316 24 H346',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'one-hop', x: 220, y: 52, anchor: 'middle' },
  { id: 'next-1', x: 125, y: 64, anchor: 'start' },
  { id: 'next-2', x: 236, y: 80, anchor: 'start' },
]

// nodes에는 선명하게 둘 노드와 연결을 함께 적는다. 「홉 하나」는 라우터 1과 라우터 2 사이 한 구간만, 「다음 홉만」은 네 장치와 홉 셋을 모두 보인다.
export const hopByHopScenarios: DiagramScenario[] = [
  { id: 'one-hop', nodes: ['router-1', 'router-2', 'link-2'], paths: ['hop-2'] },
  { id: 'next-hop', nodes: ['host-a', 'router-1', 'router-2', 'host-e', 'link-1', 'link-2', 'link-3'], paths: ['hop-1', 'hop-2', 'hop-3'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HopByHopDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-hop-by-hop-arrow`
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
      scenarios={hopByHopScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 88' : '0 0 280 240'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
