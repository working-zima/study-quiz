import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-permissions'].diagrams['file-type-char']

// 세로형은 ls -l 줄 다섯을 표처럼 쌓는다. 왼쪽 테두리 열이 줄의 첫 글자, 오른쪽 테두리 열이 이름이고, 한 줄의 두 칸은 같은 높이에 선다.
// 줄의 차례는 report.txt, 그 하드 링크 report2.txt, 심볼릭 링크 latest, 디렉터리 docs, 장치 파일 /dev/sda다. 노드는 모두 회색이다.
const nodes = [
  { id: 'type-report', x: 16, y: 28, width: 32 },
  { id: 'type-report2', x: 16, y: 68, width: 32 },
  { id: 'type-latest', x: 16, y: 108, width: 32 },
  { id: 'type-docs', x: 16, y: 148, width: 32 },
  { id: 'type-sda', x: 16, y: 188, width: 32 },
  { id: 'name-report', x: 72, y: 28, width: 88 },
  { id: 'name-report2', x: 72, y: 68, width: 88 },
  { id: 'name-latest', x: 72, y: 108, width: 88 },
  { id: 'name-docs', x: 72, y: 148, width: 88 },
  { id: 'name-sda', x: 72, y: 188, width: 88 },
]

const groups = [
  { id: 'chars', x: 8, y: 8, width: 48, height: 220, labelX: 14, labelY: 22 },
  { id: 'names', x: 64, y: 8, width: 104, height: 220, labelX: 72, labelY: 22 },
]

// 화살표는 심볼릭 링크 latest에서 나와 이름 열 오른쪽 바깥으로 올라가, 그것이 가리키는 report.txt로 들어간다.
const paths: Record<string, string> = {
  'to-target': 'M160 124 H180 V44 H160',
}

// 곁말은 이름 열 오른쪽, 자기 줄 곁에 둔다. 하드 링크의 곁말은 두 줄의 사이에 두 줄로 놓는다.
const notes: { id: string, x: number, y: number, scenarios: string[] }[] = [
  { id: 'hard-note', x: 188, y: 62, scenarios: ['hard-link'] },
  { id: 'hard-note-2', x: 188, y: 74, scenarios: ['hard-link'] },
  { id: 'sym-note', x: 188, y: 88, scenarios: ['symlink'] },
  { id: 'dir-note', x: 188, y: 168, scenarios: ['others'] },
  { id: 'dev-note', x: 188, y: 208, scenarios: ['others'] },
]

// 가로형도 같은 표 모양이고 칸만 넓다.
const wideNodes = [
  { id: 'type-report', x: 20, y: 28, width: 48 },
  { id: 'type-report2', x: 20, y: 68, width: 48 },
  { id: 'type-latest', x: 20, y: 108, width: 48 },
  { id: 'type-docs', x: 20, y: 148, width: 48 },
  { id: 'type-sda', x: 20, y: 188, width: 48 },
  { id: 'name-report', x: 112, y: 28, width: 112 },
  { id: 'name-report2', x: 112, y: 68, width: 112 },
  { id: 'name-latest', x: 112, y: 108, width: 112 },
  { id: 'name-docs', x: 112, y: 148, width: 112 },
  { id: 'name-sda', x: 112, y: 188, width: 112 },
]

const wideGroups = [
  { id: 'chars', x: 8, y: 8, width: 72, height: 220, labelX: 16, labelY: 22 },
  { id: 'names', x: 96, y: 8, width: 144, height: 220, labelX: 104, labelY: 22 },
]

const widePaths: Record<string, string> = {
  'to-target': 'M224 124 H256 V44 H224',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number }[] = [
  { id: 'hard-note', x: 272, y: 62 },
  { id: 'hard-note-2', x: 272, y: 74 },
  { id: 'sym-note', x: 272, y: 88 },
  { id: 'dir-note', x: 272, y: 168 },
  { id: 'dev-note', x: 272, y: 208 },
]

// 시나리오마다 두 줄을 선명하게 둔다. 하드 링크는 둘 다 -인 두 줄, 심볼릭 링크는 latest와 그것이 가리키는 report.txt, 나머지는 docs와 /dev/sda다.
export const fileTypeCharScenarios: DiagramScenario[] = [
  { id: 'hard-link', nodes: ['type-report', 'name-report', 'type-report2', 'name-report2'], paths: [] },
  { id: 'symlink', nodes: ['type-latest', 'name-latest', 'type-report', 'name-report'], paths: ['to-target'] },
  { id: 'others', nodes: ['type-docs', 'name-docs', 'type-sda', 'name-sda'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FileTypeCharDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-file-type-char-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={fileTypeCharScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 236' : '0 0 280 236'}>
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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="start" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
