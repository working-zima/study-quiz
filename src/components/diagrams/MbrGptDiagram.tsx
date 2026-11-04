import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['mbr-gpt']

// 세로형은 MBR 디스크와 GPT 디스크를 위아래로 쌓는다. 디스크마다 윗줄은 첫 섹터부터 차지하는 칸이고, 아랫줄은 파티션이다.
// MBR 디스크의 확장 파티션 4 바로 아래에 그 안의 논리 파티션 5·6을 붙여 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'mtable', x: 16, y: 30, width: 92 },
  { id: 'p1', x: 16, y: 70, width: 28 },
  { id: 'p2', x: 44, y: 70, width: 28 },
  { id: 'p3', x: 72, y: 70, width: 28 },
  { id: 'ext', x: 100, y: 70, width: 96 },
  { id: 'l5', x: 100, y: 102, width: 48 },
  { id: 'l6', x: 148, y: 102, width: 48 },
  { id: 'pmbr', x: 16, y: 172, width: 76 },
  { id: 'gtable', x: 92, y: 172, width: 92 },
  { id: 'g1', x: 16, y: 212, width: 28 },
  { id: 'g2', x: 44, y: 212, width: 28 },
  { id: 'g3', x: 72, y: 212, width: 28 },
]

const groups = [
  { id: 'mbr', x: 8, y: 8, width: 264, height: 134, labelX: 16, labelY: 22 },
  { id: 'gpt', x: 8, y: 150, width: 264, height: 102, labelX: 16, labelY: 164 },
]

// 곁말은 칸 오른쪽의 빈자리에 둔다. 시나리오마다 하나씩 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'mbr-limit', x: 116, y: 50, anchor: 'start', scenarios: ['mbr'] },
  { id: 'logical-note', x: 204, y: 122, anchor: 'start', scenarios: ['logical'] },
  { id: 'gpt-limit', x: 108, y: 232, anchor: 'start', scenarios: ['gpt'] },
]

// 가로형은 디스크마다 칸을 한 줄에 빈틈없이 잇는다. MBR 디스크는 확장 파티션 4 아래에 논리 파티션 5·6을 붙인다.
const wideNodes = [
  { id: 'mtable', x: 16, y: 30, width: 92 },
  { id: 'p1', x: 108, y: 30, width: 28 },
  { id: 'p2', x: 136, y: 30, width: 28 },
  { id: 'p3', x: 164, y: 30, width: 28 },
  { id: 'ext', x: 192, y: 30, width: 92 },
  { id: 'l5', x: 192, y: 62, width: 46 },
  { id: 'l6', x: 238, y: 62, width: 46 },
  { id: 'pmbr', x: 16, y: 132, width: 76 },
  { id: 'gtable', x: 92, y: 132, width: 92 },
  { id: 'g1', x: 184, y: 132, width: 28 },
  { id: 'g2', x: 212, y: 132, width: 28 },
  { id: 'g3', x: 240, y: 132, width: 28 },
]

const wideGroups = [
  { id: 'mbr', x: 8, y: 8, width: 424, height: 94, labelX: 16, labelY: 22 },
  { id: 'gpt', x: 8, y: 110, width: 424, height: 62, labelX: 16, labelY: 124 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'mbr-limit', x: 16, y: 82, anchor: 'start' },
  { id: 'logical-note', x: 292, y: 82, anchor: 'start' },
  { id: 'gpt-limit', x: 276, y: 152, anchor: 'start' },
]

// 화살표는 없다. 시나리오는 선명한 칸과 곁말로만 가른다.
export const mbrGptScenarios: DiagramScenario[] = [
  { id: 'mbr', nodes: ['mtable', 'p1', 'p2', 'p3', 'ext'], paths: [] },
  { id: 'logical', nodes: ['ext', 'l5', 'l6'], paths: [] },
  { id: 'gpt', nodes: ['pmbr', 'gtable', 'g1', 'g2', 'g3'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MbrGptDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={mbrGptScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 260'}>
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
