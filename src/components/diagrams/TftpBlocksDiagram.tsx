import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mail-file'].diagrams['tftp-blocks']

// 맨 위에 클라이언트와 서버의 주소를 머리 노드로 두고, 그 아래 왼쪽에 클라이언트, 오른쪽에 서버 기둥(그룹 박스)을 세운다.
// 두 기둥 사이에는 읽기 요청부터 마지막 확인 응답까지를 위에서 아래로 놓는다. 요청과 확인 응답은 클라이언트 → 서버,
// 블록은 서버 → 클라이언트로 간다. 맨 아래 박스는 블록 2를 잃었을 때의 차례로, 위의 정상 차례와 다른 노드다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 8, y: 8, width: 124 },
  { id: 'server', x: 148, y: 8, width: 124 },
  { id: 'req', x: 76, y: 64, width: 128 },
  { id: 'b1', x: 76, y: 108, width: 128 },
  { id: 'a1', x: 76, y: 152, width: 128 },
  { id: 'b2', x: 76, y: 196, width: 128 },
  { id: 'a2', x: 76, y: 240, width: 128 },
  { id: 'b3', x: 76, y: 284, width: 128 },
  { id: 'a3', x: 76, y: 340, width: 128 },
  { id: 'lost2', x: 76, y: 408, width: 128 },
  { id: 're-a1', x: 76, y: 464, width: 128 },
  { id: 're-b2', x: 76, y: 508, width: 128 },
]

const groups = [
  { id: 'client-side', x: 8, y: 48, width: 56, height: 508, labelX: 10, labelY: 60 },
  { id: 'server-side', x: 216, y: 48, width: 56, height: 508, labelX: 220, labelY: 60 },
  { id: 'lost-box', x: 68, y: 388, width: 144, height: 160, labelX: 72, labelY: 401 },
]

// 노드마다 화살표 둘 — 보내는 쪽 기둥에서 노드로(-out), 노드에서 받는 쪽 기둥으로(-in).
// 사라진 블록 2는 서버에서 나오기만 하고 클라이언트에 닿지 않는다(-out 하나).
const paths: Record<string, string> = {
  'req-out': 'M64 80 H76',
  'req-in': 'M204 80 H216',
  'b1-out': 'M216 124 H204',
  'b1-in': 'M76 124 H64',
  'a1-out': 'M64 168 H76',
  'a1-in': 'M204 168 H216',
  'b2-out': 'M216 212 H204',
  'b2-in': 'M76 212 H64',
  'a2-out': 'M64 256 H76',
  'a2-in': 'M204 256 H216',
  'b3-out': 'M216 300 H204',
  'b3-in': 'M76 300 H64',
  'a3-out': 'M64 356 H76',
  'a3-in': 'M204 356 H216',
  'lost2-out': 'M216 424 H204',
  're-a1-out': 'M64 480 H76',
  're-a1-in': 'M204 480 H216',
  're-b2-out': 'M216 524 H204',
  're-b2-in': 'M76 524 H64',
}

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만 그 블록 노드 바로 아래에 보인다.
const noteScenarios: Record<string, string> = {
  'last-note': 'last',
  'lost-note': 'lost',
}

const notes: Note[] = [
  { id: 'last-note', x: 140, y: 330 },
  { id: 'lost-note', x: 140, y: 454 },
]

// 가로형은 기둥과 노드를 넓힐 뿐 차례와 높이는 세로형과 같다.
const wideNodes = [
  { id: 'client', x: 8, y: 8, width: 124 },
  { id: 'server', x: 308, y: 8, width: 124 },
  { id: 'req', x: 120, y: 64, width: 200 },
  { id: 'b1', x: 120, y: 108, width: 200 },
  { id: 'a1', x: 120, y: 152, width: 200 },
  { id: 'b2', x: 120, y: 196, width: 200 },
  { id: 'a2', x: 120, y: 240, width: 200 },
  { id: 'b3', x: 120, y: 284, width: 200 },
  { id: 'a3', x: 120, y: 340, width: 200 },
  { id: 'lost2', x: 120, y: 408, width: 200 },
  { id: 're-a1', x: 120, y: 464, width: 200 },
  { id: 're-b2', x: 120, y: 508, width: 200 },
]

const wideGroups = [
  { id: 'client-side', x: 8, y: 48, width: 88, height: 508, labelX: 12, labelY: 60 },
  { id: 'server-side', x: 344, y: 48, width: 88, height: 508, labelX: 348, labelY: 60 },
  { id: 'lost-box', x: 104, y: 388, width: 232, height: 160, labelX: 112, labelY: 401 },
]

const widePaths: Record<string, string> = {
  'req-out': 'M96 80 H120',
  'req-in': 'M320 80 H344',
  'b1-out': 'M344 124 H320',
  'b1-in': 'M120 124 H96',
  'a1-out': 'M96 168 H120',
  'a1-in': 'M320 168 H344',
  'b2-out': 'M344 212 H320',
  'b2-in': 'M120 212 H96',
  'a2-out': 'M96 256 H120',
  'a2-in': 'M320 256 H344',
  'b3-out': 'M344 300 H320',
  'b3-in': 'M120 300 H96',
  'a3-out': 'M96 356 H120',
  'a3-in': 'M320 356 H344',
  'lost2-out': 'M344 424 H320',
  're-a1-out': 'M96 480 H120',
  're-a1-in': 'M320 480 H344',
  're-b2-out': 'M344 524 H320',
  're-b2-in': 'M120 524 H96',
}

const wideNotes: Note[] = [
  { id: 'last-note', x: 220, y: 330 },
  { id: 'lost-note', x: 220, y: 454 },
]

// ① 블록마다 — 블록 1, 확인 응답 1, 블록 2. ② 끝 — 512바이트보다 짧은 블록 3과 확인 응답 3.
// ③ 잃었을 때 — 사라진 블록 2(흐린 채 서버에서 나가는 화살표만), 다시 보낸 확인 응답 1, 다시 보낸 블록 2.
export const tftpBlocksScenarios: DiagramScenario[] = [
  {
    id: 'lockstep',
    nodes: ['client', 'server', 'b1', 'a1', 'b2'],
    paths: ['b1-out', 'b1-in', 'a1-out', 'a1-in', 'b2-out', 'b2-in'],
  },
  {
    id: 'last',
    nodes: ['client', 'server', 'b3', 'a3'],
    paths: ['b3-out', 'b3-in', 'a3-out', 'a3-in'],
  },
  {
    id: 'lost',
    nodes: ['client', 'server', 're-a1', 're-b2'],
    paths: ['lost2-out', 're-a1-out', 're-a1-in', 're-b2-out', 're-b2-in'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TftpBlocksDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-tftp-blocks-arrow`
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
      scenarios={tftpBlocksScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 564' : '0 0 280 564'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
