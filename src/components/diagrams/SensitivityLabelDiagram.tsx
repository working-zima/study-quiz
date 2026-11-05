import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-governance'].diagrams['sensitivity-label']

// 세로형은 레이블 1 → 문서 → 회사 밖의 받는 사람을 왼쪽 열에 위에서 아래로 두고, 레이블 1에 설정한 보호(워터마크, 암호화)를 오른쪽 그룹에 둔다.
const nodes = [
  { id: 'label', x: 16, y: 8, width: 104 },
  { id: 'doc', x: 16, y: 72, width: 104 },
  { id: 'mark', x: 152, y: 30, width: 104 },
  { id: 'encrypt', x: 152, y: 72, width: 104 },
  { id: 'outside', x: 16, y: 144, width: 128 },
]
const paths: Record<string, string> = {
  'apply': 'M68 40 V72',
  'send': 'M68 104 V144',
}
const groups = [
  { id: 'protections', x: 136, y: 8, width: 136, height: 104 },
]
const notes = [
  { id: 'mark-note', x: 16, y: 126, anchor: 'start' as const, scenario: 'mark' },
  { id: 'encrypt-note', x: 16, y: 126, anchor: 'start' as const, scenario: 'encrypt' },
  { id: 'send-note', x: 152, y: 164, anchor: 'start' as const, scenario: 'send' },
]

// 가로형은 레이블 1 → 문서 → 회사 밖의 받는 사람을 한 줄에 두고, 레이블 1에 설정한 보호를 그 아래 그룹에 둔다.
const wideNodes = [
  { id: 'label', x: 16, y: 24, width: 96 },
  { id: 'doc', x: 160, y: 24, width: 96 },
  { id: 'mark', x: 24, y: 102, width: 104 },
  { id: 'encrypt', x: 152, y: 102, width: 104 },
  { id: 'outside', x: 304, y: 24, width: 128 },
]
const widePaths: Record<string, string> = {
  'apply': 'M112 40 H160',
  'send': 'M256 40 H304',
}
const wideGroups = [
  { id: 'protections', x: 8, y: 80, width: 264, height: 64 },
]
const wideNotes = [
  { id: 'mark-note', x: 208, y: 72, anchor: 'middle' as const, scenario: 'mark' },
  { id: 'encrypt-note', x: 208, y: 72, anchor: 'middle' as const, scenario: 'encrypt' },
  { id: 'send-note', x: 368, y: 72, anchor: 'middle' as const, scenario: 'send' },
]

export const sensitivityLabelScenarios: DiagramScenario[] = [
  { id: 'mark', nodes: ['label', 'doc', 'mark'], paths: ['apply'] },
  { id: 'encrypt', nodes: ['label', 'doc', 'encrypt'], paths: ['apply'] },
  { id: 'send', nodes: ['doc', 'encrypt', 'outside'], paths: ['send'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SensitivityLabelDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-sensitivity-label-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={sensitivityLabelScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 184'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-disabled" x={group.x} y={group.y} width={group.width} height={group.height} rx="4" strokeWidth="1.5" />
              <text data-group-label={group.id} className="fill-muted" x={group.x + 10} y={group.y + 14} fontSize="9">
                {text.groups![group.id]}
              </text>
            </g>
          ))}

          {visiblePaths.map((id) => (
            <path key={id} data-path={id} d={layoutPaths[id]} className="fill-none stroke-title" strokeWidth="1.5" strokeLinejoin="round" markerEnd={`url(#${arrowId})`} />
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
