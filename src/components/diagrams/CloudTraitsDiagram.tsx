import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['cloud-sdn'].diagrams['cloud-traits']

// 세로형은 왼쪽 열에 고객 셋(고객 A·고객 B·example.com)을 위에서 아래로 쌓고, 오른쪽 「자원 풀」 박스 안에
// 서버·저장 장치·WEB01·WEB02·WEB03을 한 열로 쌓는다. 고객 셋은 저마다 같은 높이의 자원과 마주 본다.
// 화살표는 고객이 네트워크를 거쳐 자원을 가져다 쓰는 쪽이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'cust-a', x: 8, y: 24, width: 84 },
  { id: 'cust-b', x: 8, y: 72, width: 84 },
  { id: 'example', x: 8, y: 120, width: 84 },
  { id: 'server', x: 144, y: 24, width: 112 },
  { id: 'storage', x: 144, y: 72, width: 112 },
  { id: 'web01', x: 144, y: 120, width: 112 },
  { id: 'web02', x: 144, y: 168, width: 112 },
  { id: 'web03', x: 144, y: 216, width: 112 },
]

const groups = [
  { id: 'pool', x: 128, y: 4, width: 144, height: 252, labelX: 136, labelY: 17 },
]

// example.com에서 WEB02·WEB03으로 가는 화살표는 example.com의 아래 변에서 나와 꺾여 들어간다 — 두 선은 서로 가로지르지 않는다.
const paths: Record<string, string> = {
  'a-server': 'M92 40 H144',
  'b-storage': 'M92 88 H144',
  'ex-web01': 'M92 136 H144',
  'ex-web02': 'M70 152 V184 H144',
  'ex-web03': 'M30 152 V232 H144',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 자원 풀 박스 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'pooling-note': 'pooling',
  'elasticity-note': 'elasticity',
  'measured-note': 'measured',
}

const notes: Note[] = [
  { id: 'pooling-note', x: 140, y: 274, anchor: 'middle' },
  { id: 'elasticity-note', x: 140, y: 274, anchor: 'middle' },
  { id: 'measured-note', x: 140, y: 274, anchor: 'middle' },
]

// 가로형은 위 줄에 고객 셋을 나란히 두고, 아래 「자원 풀」 박스 안에 자원 다섯을 한 줄로 둔다.
// 고객 A·고객 B·example.com은 저마다 서버·저장 장치·WEB01 바로 위에 선다. WEB02·WEB03으로 가는 화살표는 example.com의 오른쪽 변에서 나간다.
const wideNodes = [
  { id: 'cust-a', x: 28, y: 8, width: 64 },
  { id: 'cust-b', x: 112, y: 8, width: 64 },
  { id: 'example', x: 186, y: 8, width: 84 },
  { id: 'server', x: 24, y: 104, width: 72 },
  { id: 'storage', x: 108, y: 104, width: 72 },
  { id: 'web01', x: 192, y: 104, width: 72 },
  { id: 'web02', x: 276, y: 104, width: 72 },
  { id: 'web03', x: 360, y: 104, width: 72 },
]

const wideGroups = [
  { id: 'pool', x: 8, y: 72, width: 428, height: 80, labelX: 16, labelY: 85 },
]

const widePaths: Record<string, string> = {
  'a-server': 'M60 40 V104',
  'b-storage': 'M144 40 V104',
  'ex-web01': 'M228 40 V104',
  'ex-web02': 'M270 32 H312 V104',
  'ex-web03': 'M270 20 H396 V104',
}

const wideNotes: Note[] = [
  { id: 'pooling-note', x: 220, y: 170, anchor: 'middle' },
  { id: 'elasticity-note', x: 220, y: 170, anchor: 'middle' },
  { id: 'measured-note', x: 220, y: 170, anchor: 'middle' },
]

// 자원 풀링: 고객 셋이 저마다 같은 풀의 자원(서버·저장 장치·WEB01)을 받는다. 늘어날 서버 둘은 흐리다.
// 빠른 탄력성: example.com이 WEB01에 더해 WEB02·WEB03을 받는다. 늘어난 서버 둘은 이 장면에서만 선명하다.
// 측정되는 서비스: example.com과 그가 쓰는 WEB01만 선명하고, 곁말이 쓴 만큼 잰다고 밝힌다.
export const cloudTraitsScenarios: DiagramScenario[] = [
  {
    id: 'pooling',
    nodes: ['cust-a', 'cust-b', 'example', 'server', 'storage', 'web01'],
    paths: ['a-server', 'b-storage', 'ex-web01'],
  },
  {
    id: 'elasticity',
    nodes: ['example', 'web01', 'web02', 'web03'],
    paths: ['ex-web01', 'ex-web02', 'ex-web03'],
  },
  {
    id: 'measured',
    nodes: ['example', 'web01'],
    paths: ['ex-web01'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CloudTraitsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-cloud-traits-arrow`
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
      scenarios={cloudTraitsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 284'}>
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
