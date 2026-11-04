import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-shell'].diagrams['vi-modes']

// 세로형은 맨 위에 vi memo.txt, 그 아래 명령 모드를 두고, 명령 모드 아래 왼쪽에 입력 모드, 오른쪽에 화면의 마지막 줄을 둔다.
// 입력 모드와 마지막 줄은 서로 잇지 않는다 — 둘 다 명령 모드를 거쳐 오간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'open', x: 90, y: 8, width: 100 },
  { id: 'command', x: 100, y: 88, width: 80 },
  { id: 'input', x: 16, y: 184, width: 96 },
  { id: 'last', x: 168, y: 184, width: 96 },
]

// 오가는 두 화살표는 겹치지 않게 안쪽과 바깥쪽에 나란히 긋는다 — 들어가는 쪽이 안쪽, 돌아오는 쪽이 바깥쪽이다.
const paths: Record<string, string> = {
  'opened': 'M140 40 V88',
  'to-input': 'M100 112 H80 V184',
  'to-command': 'M48 184 V96 H100',
  'to-last': 'M180 112 H200 V184',
  'from-last': 'M232 184 V96 H180',
}

// 누르는 키는 자기 화살표 곁에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'insert', x: 86, y: 152, anchor: 'start', scenarios: ['insert'] },
  { id: 'esc', x: 42, y: 152, anchor: 'end', scenarios: ['insert'] },
  { id: 'colon', x: 194, y: 152, anchor: 'end', scenarios: ['colon'] },
  { id: 'enter', x: 238, y: 152, anchor: 'start', scenarios: ['colon'] },
]

// 가로형은 왼쪽에 vi memo.txt, 가운데 명령 모드, 오른쪽 위에 입력 모드, 오른쪽 아래에 마지막 줄을 둔다.
const wideNodes = [
  { id: 'open', x: 8, y: 72, width: 100 },
  { id: 'command', x: 168, y: 72, width: 80 },
  { id: 'input', x: 328, y: 16, width: 96 },
  { id: 'last', x: 328, y: 128, width: 96 },
]

const widePaths: Record<string, string> = {
  'opened': 'M108 88 H168',
  'to-input': 'M224 72 V40 H328',
  'to-command': 'M328 24 H200 V72',
  'to-last': 'M224 104 V136 H328',
  'from-last': 'M328 152 H200 V104',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'insert', x: 284, y: 56, anchor: 'middle' },
  { id: 'esc', x: 284, y: 18, anchor: 'middle' },
  { id: 'colon', x: 284, y: 128, anchor: 'middle' },
  { id: 'enter', x: 284, y: 168, anchor: 'middle' },
]

// 처음 열면 명령 모드다. i·a·o로 입력 모드에 들어가 Esc로 돌아오고, :로 마지막 줄에 명령을 입력해 Enter로 돌아온다.
export const viModesScenarios: DiagramScenario[] = [
  { id: 'start', nodes: ['open', 'command'], paths: ['opened'] },
  { id: 'insert', nodes: ['command', 'input'], paths: ['to-input', 'to-command'] },
  { id: 'colon', nodes: ['command', 'last'], paths: ['to-last', 'from-last'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ViModesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-vi-modes-arrow`
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
      scenarios={viModesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 224'}>
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

          {layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
