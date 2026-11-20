import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-devices'].diagrams['l7-switch-url']

// 세로형은 맨 위에 클라이언트, 그 아래에 두 가지 요청(경로 노드)을 나란히, 그 아래에 L7 스위치, 맨 아래에 IMG01과 WEB01을 둔다.
// 왼쪽 갈래가 이미지 요청, 오른쪽 갈래가 그 밖의 요청이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 92, y: 8, width: 96 },
  { id: 'req-images', x: 8, y: 72, width: 160 },
  { id: 'req-others', x: 176, y: 72, width: 96 },
  { id: 'switch', x: 92, y: 136, width: 96 },
  { id: 'img01', x: 24, y: 200, width: 96 },
  { id: 'web01', x: 160, y: 200, width: 96 },
]

// 화살표는 요청이 가는 쪽이다. 클라이언트에서 요청 노드를 거쳐 L7 스위치에 닿고, 스위치에서 서버 하나로 간다.
const paths: Record<string, string> = {
  'client-images': 'M120 40 V72',
  'images-switch': 'M120 104 V136',
  'switch-img01': 'M108 168 V200',
  'client-others': 'M180 40 V72',
  'others-switch': 'M180 104 V136',
  'switch-web01': 'M172 168 V200',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 시나리오 곁말은 자기 시나리오를 골랐을 때만 보이고, 서버 아래 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'images-note': 'images',
  'others-note': 'others',
}

const notes: Note[] = [
  { id: 'images-note', x: 140, y: 252, anchor: 'middle' },
  { id: 'others-note', x: 140, y: 252, anchor: 'middle' },
]

// 가로형은 왼쪽에 클라이언트, 가운데 열에 두 가지 요청을 위아래로, 그 오른쪽에 L7 스위치, 맨 오른쪽에 IMG01(위)과 WEB01(아래)을 둔다.
const wideNodes = [
  { id: 'client', x: 16, y: 72, width: 88 },
  { id: 'req-images', x: 120, y: 24, width: 160 },
  { id: 'req-others', x: 120, y: 120, width: 160 },
  { id: 'switch', x: 296, y: 72, width: 72 },
  { id: 'img01', x: 384, y: 24, width: 48 },
  { id: 'web01', x: 384, y: 120, width: 48 },
]

const widePaths: Record<string, string> = {
  'client-images': 'M60 72 V40 H120',
  'images-switch': 'M280 40 H320 V72',
  'switch-img01': 'M352 72 V40 H384',
  'client-others': 'M60 104 V136 H120',
  'others-switch': 'M280 136 H320 V104',
  'switch-web01': 'M352 104 V136 H384',
}

const wideNotes: Note[] = [
  { id: 'images-note', x: 220, y: 176, anchor: 'middle' },
  { id: 'others-note', x: 220, y: 176, anchor: 'middle' },
]

// 이미지 요청: /images/로 시작하는 경로의 요청이 스위치를 지나 IMG01로 간다. 그 밖의 요청: 그 밖의 경로의 요청이 스위치를 지나 WEB01로 간다.
export const l7SwitchUrlScenarios: DiagramScenario[] = [
  {
    id: 'images',
    nodes: ['client', 'req-images', 'switch', 'img01'],
    paths: ['client-images', 'images-switch', 'switch-img01'],
  },
  {
    id: 'others',
    nodes: ['client', 'req-others', 'switch', 'web01'],
    paths: ['client-others', 'others-switch', 'switch-web01'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function L7SwitchUrlDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-l7-switch-url-arrow`
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
      scenarios={l7SwitchUrlScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 260'}>
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
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
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
