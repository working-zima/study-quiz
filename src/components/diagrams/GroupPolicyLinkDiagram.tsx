import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['group-policy-link']

// 세로형은 왼쪽에 GPO가 걸리는 자리 넷(로컬 GPO → 사이트 → 도메인 → OU)을 위에서 아래로 쌓고, OU 아래에 그 안의 PC01과 user01을 둔다.
// OU 오른쪽에 GPO를 두고, 그 위에 GPO로 할 수 있는 일을 박스로 묶는다.
const nodes = [
  { id: 'local', x: 32, y: 32, width: 96 },
  { id: 'site', x: 32, y: 84, width: 96 },
  { id: 'domain', x: 32, y: 136, width: 96 },
  { id: 'ou', x: 32, y: 188, width: 96 },
  { id: 'pc', x: 32, y: 244, width: 52 },
  { id: 'user', x: 92, y: 244, width: 56 },
  { id: 'gpo', x: 152, y: 188, width: 124 },
  { id: 'security', x: 152, y: 22, width: 120 },
  { id: 'software', x: 152, y: 58, width: 120 },
  { id: 'redirect', x: 152, y: 94, width: 120 },
  { id: 'roaming', x: 152, y: 130, width: 120 },
]

const groups = [
  { id: 'features', x: 148, y: 4, width: 128, height: 164, labelX: 156, labelY: 17 },
]

// 차례 화살표는 한 자리에서 다음 자리로, 마지막 OU에서 PC01로 간다. GPO에서 OU로 가는 화살표는 연결을,
// GPO에서 박스로 가는 화살표는 GPO로 하는 일을 가리킨다.
const paths: Record<string, string> = {
  'local-site': 'M80 64 V84',
  'site-domain': 'M80 116 V136',
  'domain-ou': 'M80 168 V188',
  'ou-pc': 'M58 220 V244',
  'ou-user': 'M116 220 V244',
  'gpo-ou': 'M152 204 H128',
  'gpo-features': 'M214 188 V168',
}

// 번호 ①~④는 적용 차례에서만 보이고, 자기 자리 노드의 바로 왼쪽에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'step-1', x: 18, y: 52, anchor: 'middle', scenarios: ['order'] },
  { id: 'step-2', x: 18, y: 104, anchor: 'middle', scenarios: ['order'] },
  { id: 'step-3', x: 18, y: 156, anchor: 'middle', scenarios: ['order'] },
  { id: 'step-4', x: 18, y: 208, anchor: 'middle', scenarios: ['order'] },
]

// 가로형은 자리 넷을 왼쪽에서 오른쪽으로 잇고, OU 오른쪽에 PC01과 user01을 위아래로 둔다.
// GPO는 OU 아래에, GPO로 할 수 있는 일은 그 왼쪽 박스에 두 줄로 놓는다.
const wideNodes = [
  { id: 'local', x: 16, y: 40, width: 68 },
  { id: 'site', x: 104, y: 40, width: 56 },
  { id: 'domain', x: 180, y: 40, width: 88 },
  { id: 'ou', x: 288, y: 40, width: 72 },
  { id: 'pc', x: 380, y: 24, width: 56 },
  { id: 'user', x: 380, y: 64, width: 56 },
  { id: 'gpo', x: 300, y: 120, width: 124 },
  { id: 'security', x: 12, y: 120, width: 120 },
  { id: 'software', x: 140, y: 120, width: 120 },
  { id: 'redirect', x: 12, y: 158, width: 120 },
  { id: 'roaming', x: 140, y: 158, width: 120 },
]

const wideGroups = [
  { id: 'features', x: 4, y: 100, width: 264, height: 96, labelX: 12, labelY: 113 },
]

const widePaths: Record<string, string> = {
  'local-site': 'M84 56 H104',
  'site-domain': 'M160 56 H180',
  'domain-ou': 'M268 56 H288',
  'ou-pc': 'M360 48 H380',
  'ou-user': 'M360 68 H380',
  'gpo-ou': 'M330 120 V72',
  'gpo-features': 'M300 136 H268',
}

// 곁말의 자리만 배치마다 다르다. 가로형은 번호가 자기 자리 노드의 바로 위에 놓인다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'step-1', x: 50, y: 32, anchor: 'middle' },
  { id: 'step-2', x: 132, y: 32, anchor: 'middle' },
  { id: 'step-3', x: 224, y: 32, anchor: 'middle' },
  { id: 'step-4', x: 324, y: 32, anchor: 'middle' },
]

// 연결: GPO와 OU, 그 안의 PC01·user01. 적용 차례: 자리 넷과 PC01. 할 수 있는 일: GPO와 박스 안의 일 넷.
export const groupPolicyLinkScenarios: DiagramScenario[] = [
  { id: 'link', nodes: ['ou', 'pc', 'user', 'gpo'], paths: ['gpo-ou', 'ou-pc', 'ou-user'] },
  { id: 'order', nodes: ['local', 'site', 'domain', 'ou', 'pc'], paths: ['local-site', 'site-domain', 'domain-ou', 'ou-pc'] },
  { id: 'features', nodes: ['gpo', 'security', 'software', 'redirect', 'roaming'], paths: ['gpo-features'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function GroupPolicyLinkDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-group-policy-link-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={groupPolicyLinkScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 204' : '0 0 280 284'}>
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
