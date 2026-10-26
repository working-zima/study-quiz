import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['iam-permissions'].diagrams.notaction

// 그룹에 붙은 정책 문장 넷을 박스 하나에 담는다. 그룹 경계는 시나리오와 무관하게 남긴다.
const groups = [
  { id: 'policies', x: 4, y: 72, width: 272, height: 112 },
]

// 요청이 향하는 서비스 둘은 박스 위, 정책 문장은 박스 안에 2 × 2로 둔다.
const nodes = [
  { id: 'target', x: 12, y: 24, width: 116, color: 'stroke-disabled' },
  { id: 'other', x: 152, y: 24, width: 116, color: 'stroke-disabled' },
  { id: 'allow-target', x: 12, y: 96, width: 116, color: 'stroke-diagram-managed' },
  { id: 'other-allow', x: 152, y: 96, width: 116, color: 'stroke-diagram-managed' },
  { id: 'deny-all', x: 12, y: 144, width: 116, color: 'stroke-diagram-managed' },
  { id: 'deny-notaction', x: 152, y: 144, width: 116, color: 'stroke-diagram-managed' },
]

// 아래 줄 문장은 바깥 통로(x 8·272)와 두 열 사이 통로(x 140)로 올라가 서비스의 옆 변으로 들어간다.
// 남길 서비스 허용은 그룹 라벨을 피해 x 100으로 올라간다.
const paths: Record<string, string> = {
  'allow-target-target': 'M100 96 V56',
  'other-allow-other': 'M210 96 V56',
  'deny-all-target': 'M12 160 H8 V40 H12',
  'deny-all-other': 'M128 160 H140 V40 H152',
  'deny-notaction-other': 'M268 160 H272 V40 H268',
}

// 판정은 서비스 위 곁말 글자로만 보인다.
const notes = [
  { id: 'target-open', x: 70, y: 16, textAnchor: 'middle' as const, scenarios: ['allow-only'] },
  { id: 'other-open', x: 210, y: 16, textAnchor: 'middle' as const, scenarios: ['allow-only'] },
  { id: 'target-blocked', x: 70, y: 16, textAnchor: 'middle' as const, scenarios: ['deny-all'] },
  { id: 'other-blocked', x: 210, y: 16, textAnchor: 'middle' as const, scenarios: ['deny-all', 'notaction'] },
  { id: 'target-kept', x: 70, y: 16, textAnchor: 'middle' as const, scenarios: ['notaction'] },
]

// 가로형은 정책 문장 넷을 박스 안에 한 줄로 두고 서비스 둘을 그 위에 둔다.
const wideGroups = [
  { id: 'policies', x: 4, y: 72, width: 432, height: 64 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'target', x: 56, y: 24, width: 112 },
  { id: 'other', x: 264, y: 24, width: 128 },
  { id: 'allow-target', x: 12, y: 96, width: 96 },
  { id: 'deny-all', x: 116, y: 96, width: 96 },
  { id: 'deny-notaction', x: 220, y: 96, width: 100 },
  { id: 'other-allow', x: 328, y: 96, width: 100 },
]

const widePaths: Record<string, string> = {
  'allow-target-target': 'M96 96 V56',
  'other-allow-other': 'M378 96 V56',
  'deny-all-target': 'M164 96 V56',
  'deny-all-other': 'M212 112 H216 V40 H264',
  'deny-notaction-other': 'M270 96 V56',
}

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'target-open', x: 112, y: 16, textAnchor: 'middle' as const },
  { id: 'other-open', x: 328, y: 16, textAnchor: 'middle' as const },
  { id: 'target-blocked', x: 112, y: 16, textAnchor: 'middle' as const },
  { id: 'other-blocked', x: 328, y: 16, textAnchor: 'middle' as const },
  { id: 'target-kept', x: 112, y: 16, textAnchor: 'middle' as const },
]

export const notActionDenyScenarios: DiagramScenario[] = [
  {
    id: 'allow-only',
    nodes: ['target', 'other', 'allow-target', 'other-allow'],
    paths: ['allow-target-target', 'other-allow-other'],
  },
  {
    id: 'deny-all',
    nodes: ['target', 'other', 'deny-all', 'allow-target'],
    paths: ['deny-all-target', 'deny-all-other', 'allow-target-target'],
  },
  {
    id: 'notaction',
    nodes: ['target', 'other', 'deny-notaction', 'other-allow'],
    paths: ['deny-notaction-other', 'other-allow-other'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NotActionDenyDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-notaction-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={notActionDenyScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 192'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
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
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className={`fill-panel ${node.color}`} x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
