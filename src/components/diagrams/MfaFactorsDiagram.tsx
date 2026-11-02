import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-identity'].diagrams['mfa-factors']

// 세로형은 범주 셋을 위아래로 쌓는다. 흐름이 아니라 소속을 보이는 그림이라 경로가 없고, 조합을 말하는 곁말은 박스 아래에 둔다.
const groups = [
  { id: 'know', x: 8, y: 8, width: 264, height: 64 },
  { id: 'have', x: 8, y: 84, width: 264, height: 64 },
  { id: 'are', x: 8, y: 160, width: 264, height: 64 },
]
const nodes = [
  { id: 'password', x: 20, y: 32, width: 112 },
  { id: 'question', x: 148, y: 32, width: 112 },
  { id: 'phone', x: 20, y: 108, width: 112 },
  { id: 'biometric', x: 20, y: 184, width: 112 },
]
const notes = [
  { id: 'two-note', x: 140, y: 242, textAnchor: 'middle' as const, scenarios: ['different', 'biometric'] },
  { id: 'same-note', x: 140, y: 242, textAnchor: 'middle' as const, scenarios: ['same'] },
]

// 가로형은 범주 셋을 왼쪽에서 오른쪽으로 둔다. 소속은 세로형과 같다.
const wideGroups = [
  { id: 'know', x: 8, y: 8, width: 188, height: 64 },
  { id: 'have', x: 208, y: 8, width: 104, height: 64 },
  { id: 'are', x: 324, y: 8, width: 108, height: 64 },
]
const wideNodes = [
  { id: 'password', x: 20, y: 32, width: 76 },
  { id: 'question', x: 104, y: 32, width: 80 },
  { id: 'phone', x: 220, y: 32, width: 80 },
  { id: 'biometric', x: 336, y: 32, width: 84 },
]
const wideNotes = [
  { id: 'two-note', x: 220, y: 90, textAnchor: 'middle' as const, scenarios: ['different', 'biometric'] },
  { id: 'same-note', x: 220, y: 90, textAnchor: 'middle' as const, scenarios: ['same'] },
]

export const mfaFactorsScenarios: DiagramScenario[] = [
  { id: 'different', nodes: ['password', 'phone'], paths: [] },
  { id: 'biometric', nodes: ['password', 'biometric'], paths: [] },
  { id: 'same', nodes: ['password', 'question'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MfaFactorsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes : notes
  const shownNotes = active ? layoutNotes.filter(({ scenarios }) => scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={mfaFactorsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 100' : '0 0 280 252'}>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
              {text.groups![group.id]}
            </text>
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
