import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-addressing'].diagrams['subnet-sizing']

// 세로형은 접두사 길이 /26부터 /30까지를 한 줄에 하나씩 위에서 아래로 놓는다. 줄마다 왼쪽에 접두사 길이, 가운데에 서브넷 마스크를
// 두고, 오른쪽 곁말이 서브넷 하나의 호스트 수다. 고른 줄의 셈은 그림 아래 곁말로 둔다.
const nodes = [
  { id: 'p26', x: 8, y: 24, width: 48 },
  { id: 'm26', x: 64, y: 24, width: 112 },
  { id: 'p27', x: 8, y: 64, width: 48 },
  { id: 'm27', x: 64, y: 64, width: 112 },
  { id: 'p28', x: 8, y: 104, width: 48 },
  { id: 'm28', x: 64, y: 104, width: 112 },
  { id: 'p29', x: 8, y: 144, width: 48 },
  { id: 'm29', x: 64, y: 144, width: 112 },
  { id: 'p30', x: 8, y: 184, width: 48 },
  { id: 'm30', x: 64, y: 184, width: 112 },
]

// 열 이름은 늘 선명하다. 호스트 수 곁말은 자기 줄의 접두사 길이 상자의 흐림을 따른다. 셈 곁말은 그 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', owner?: string, scenario?: string }[] = [
  { id: 'head-prefix', x: 32, y: 16, anchor: 'middle' },
  { id: 'head-mask', x: 120, y: 16, anchor: 'middle' },
  { id: 'head-hosts', x: 184, y: 16, anchor: 'start' },
  { id: 'h26', x: 184, y: 43, anchor: 'start', owner: 'p26' },
  { id: 'h27', x: 184, y: 83, anchor: 'start', owner: 'p27' },
  { id: 'h28', x: 184, y: 123, anchor: 'start', owner: 'p28' },
  { id: 'h29', x: 184, y: 163, anchor: 'start', owner: 'p29' },
  { id: 'h30', x: 184, y: 203, anchor: 'start', owner: 'p30' },
  { id: 'by-hosts', x: 8, y: 238, anchor: 'start', scenario: 'by-hosts' },
  { id: 'by-subnets', x: 8, y: 238, anchor: 'start', scenario: 'by-subnets' },
]

// 가로형은 같은 표를 조금 넓게 그리고, 고른 줄의 셈 곁말을 그 줄 오른쪽에 둔다.
const wideNodes = [
  { id: 'p26', x: 8, y: 24, width: 56 },
  { id: 'm26', x: 72, y: 24, width: 120 },
  { id: 'p27', x: 8, y: 64, width: 56 },
  { id: 'm27', x: 72, y: 64, width: 120 },
  { id: 'p28', x: 8, y: 104, width: 56 },
  { id: 'm28', x: 72, y: 104, width: 120 },
  { id: 'p29', x: 8, y: 144, width: 56 },
  { id: 'm29', x: 72, y: 144, width: 120 },
  { id: 'p30', x: 8, y: 184, width: 56 },
  { id: 'm30', x: 72, y: 184, width: 120 },
]

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드와 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'head-prefix', x: 36, y: 16, anchor: 'middle' },
  { id: 'head-mask', x: 132, y: 16, anchor: 'middle' },
  { id: 'head-hosts', x: 208, y: 16, anchor: 'start' },
  { id: 'h26', x: 208, y: 43, anchor: 'start' },
  { id: 'h27', x: 208, y: 83, anchor: 'start' },
  { id: 'h28', x: 208, y: 123, anchor: 'start' },
  { id: 'h29', x: 208, y: 163, anchor: 'start' },
  { id: 'h30', x: 208, y: 203, anchor: 'start' },
  { id: 'by-hosts', x: 296, y: 123, anchor: 'start' },
  { id: 'by-subnets', x: 296, y: 83, anchor: 'start' },
]

// 호스트 10대: 14대가 들어가는 /28 줄만 선명하다. 서브넷 6개: 3비트를 넘긴 /27 줄만 선명하다.
export const subnetSizingScenarios: DiagramScenario[] = [
  { id: 'by-hosts', nodes: ['p28', 'm28'], paths: [] },
  { id: 'by-subnets', nodes: ['p27', 'm27'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SubnetSizingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={subnetSizingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 224' : '0 0 280 244'}>
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNotes.filter((note) => !note.scenario || note.scenario === active?.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={note.owner ? opacityOf(note.owner) : 1}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
