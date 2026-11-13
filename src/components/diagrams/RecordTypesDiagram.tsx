import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['record-types']

// 세로형은 example.com 영역 상자 안에 레코드 넷을 위에서 아래로 쌓는다. 레코드 하나는 맞닿은 칸 셋이다 —
// 윗줄에 이름 칸, 그 아래에 유형 칸과 데이터 칸이 붙는다. CNAME 레코드를 A 레코드 바로 위에 두어,
// CNAME의 데이터 칸(정식 이름)에서 A 레코드의 이름 칸으로 화살표가 곧게 내려가게 한다. 노드는 모두 회색이다.
const nodes = [
  { id: 'cname-name', x: 16, y: 30, width: 108 },
  { id: 'cname-type', x: 16, y: 62, width: 48 },
  { id: 'cname-data', x: 64, y: 62, width: 136 },
  { id: 'a-name', x: 16, y: 106, width: 108 },
  { id: 'a-type', x: 16, y: 138, width: 48 },
  { id: 'a-data', x: 64, y: 138, width: 136 },
  { id: 'mx-name', x: 16, y: 182, width: 108 },
  { id: 'mx-type', x: 16, y: 214, width: 48 },
  { id: 'mx-data', x: 64, y: 214, width: 136 },
  { id: 'ns-name', x: 16, y: 258, width: 108 },
  { id: 'ns-type', x: 16, y: 290, width: 48 },
  { id: 'ns-data', x: 64, y: 290, width: 136 },
]

const groups = [
  { id: 'zone', x: 8, y: 8, width: 264, height: 322, labelX: 16, labelY: 21 },
]

// alias는 CNAME의 데이터 칸에서 정식 이름의 A 레코드 이름 칸으로 가는 화살표로, 별칭에서만 보인다.
const paths: Record<string, string> = {
  'alias': 'M100 94 V106',
}

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'alias-note', x: 132, y: 49, anchor: 'start', scenarios: ['alias'] },
  { id: 'address-note', x: 132, y: 125, anchor: 'start', scenarios: ['address'] },
  { id: 'mx-note', x: 132, y: 201, anchor: 'start', scenarios: ['mail-ns'] },
  { id: 'ns-note', x: 132, y: 277, anchor: 'start', scenarios: ['mail-ns'] },
]

// 가로형은 레코드 하나를 이름·유형·데이터가 왼쪽부터 맞닿은 한 줄로 놓고, 곁말을 그 줄의 오른쪽에 둔다.
// 별칭 화살표는 CNAME의 데이터 칸 아래에서 두 줄 사이로 꺾여 A 레코드의 이름 칸 위로 들어간다.
const wideNodes = [
  { id: 'cname-name', x: 16, y: 30, width: 108 },
  { id: 'cname-type', x: 124, y: 30, width: 48 },
  { id: 'cname-data', x: 172, y: 30, width: 136 },
  { id: 'a-name', x: 16, y: 82, width: 108 },
  { id: 'a-type', x: 124, y: 82, width: 48 },
  { id: 'a-data', x: 172, y: 82, width: 136 },
  { id: 'mx-name', x: 16, y: 126, width: 108 },
  { id: 'mx-type', x: 124, y: 126, width: 48 },
  { id: 'mx-data', x: 172, y: 126, width: 136 },
  { id: 'ns-name', x: 16, y: 170, width: 108 },
  { id: 'ns-type', x: 124, y: 170, width: 48 },
  { id: 'ns-data', x: 172, y: 170, width: 136 },
]

const wideGroups = [
  { id: 'zone', x: 8, y: 8, width: 424, height: 202, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'alias': 'M240 62 V72 H70 V82',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'alias-note', x: 316, y: 49, anchor: 'start' },
  { id: 'address-note', x: 316, y: 101, anchor: 'start' },
  { id: 'mx-note', x: 316, y: 145, anchor: 'start' },
  { id: 'ns-note', x: 316, y: 189, anchor: 'start' },
]

// 주소: A 레코드. 별칭: CNAME 레코드와 그 정식 이름의 A 레코드. 메일과 네임 서버: MX와 NS 레코드.
export const recordTypesScenarios: DiagramScenario[] = [
  { id: 'address', nodes: ['a-name', 'a-type', 'a-data'], paths: [] },
  { id: 'alias', nodes: ['cname-name', 'cname-type', 'cname-data', 'a-name', 'a-type', 'a-data'], paths: ['alias'] },
  { id: 'mail-ns', nodes: ['mx-name', 'mx-type', 'mx-data', 'ns-name', 'ns-type', 'ns-data'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RecordTypesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-record-types-arrow`
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
      scenarios={recordTypesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 218' : '0 0 280 338'}>
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
