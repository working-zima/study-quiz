import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['active-directory-auth']

// 세로형은 위에 PC01 박스와 다른 PC 박스를 나란히 두고, 박스마다 위에 로컬 계정 user01, 아래에 그 PC에서 하는 로그온을 놓는다.
// 그 아래 도메인 컨트롤러 박스에 디렉터리의 user01을 둔다. 작업 그룹의 화살표는 로그온에서 같은 PC의 로컬 계정으로 올라가고,
// 도메인의 화살표는 두 로그온에서 내려가 같은 디렉터리의 user01에 닿는다.
const nodes = [
  { id: 'pc01-local', x: 12, y: 24, width: 116 },
  { id: 'pc01-logon', x: 12, y: 76, width: 116 },
  { id: 'other-local', x: 152, y: 24, width: 116 },
  { id: 'other-logon', x: 152, y: 76, width: 116 },
  { id: 'directory', x: 60, y: 160, width: 160 },
]

const groups = [
  { id: 'pc01', x: 4, y: 4, width: 132, height: 112, labelX: 12, labelY: 17 },
  { id: 'other', x: 144, y: 4, width: 132, height: 112, labelX: 152, labelY: 17 },
  { id: 'dc', x: 4, y: 140, width: 272, height: 76, labelX: 12, labelY: 153 },
]

const paths: Record<string, string> = {
  'pc01-check': 'M40 76 V56',
  'other-check': 'M180 76 V56',
  'pc01-dc': 'M100 108 V160',
  'other-dc': 'M180 108 V160',
}

// 곁말은 자기 시나리오에서만 보인다. 작업 그룹의 곁말은 PC 박스 안 확인 화살표 옆에, 도메인의 곁말은 디렉터리의 user01 아래에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'pc01-note', x: 48, y: 70, anchor: 'start', scenarios: ['workgroup'] },
  { id: 'other-note', x: 188, y: 70, anchor: 'start', scenarios: ['workgroup'] },
  { id: 'dc-note', x: 140, y: 208, anchor: 'middle', scenarios: ['domain'] },
]

// 가로형은 PC01 박스를 왼쪽, 다른 PC 박스를 오른쪽에 두고 도메인 컨트롤러 박스를 그 사이에 둔다.
// 도메인의 화살표는 두 로그온에서 가로로 가운데의 디렉터리의 user01에 닿는다.
const wideNodes = [
  { id: 'pc01-local', x: 18, y: 28, width: 116 },
  { id: 'pc01-logon', x: 18, y: 80, width: 116 },
  { id: 'other-local', x: 306, y: 28, width: 116 },
  { id: 'other-logon', x: 306, y: 80, width: 116 },
  { id: 'directory', x: 162, y: 80, width: 116 },
]

const wideGroups = [
  { id: 'pc01', x: 8, y: 8, width: 136, height: 112, labelX: 16, labelY: 21 },
  { id: 'other', x: 296, y: 8, width: 136, height: 112, labelX: 304, labelY: 21 },
  { id: 'dc', x: 156, y: 8, width: 128, height: 112, labelX: 164, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'pc01-check': 'M48 80 V60',
  'other-check': 'M336 80 V60',
  'pc01-dc': 'M134 96 H162',
  'other-dc': 'M306 96 H278',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'pc01-note', x: 56, y: 74, anchor: 'start' },
  { id: 'other-note', x: 344, y: 74, anchor: 'start' },
  { id: 'dc-note', x: 220, y: 56, anchor: 'middle' },
]

// 작업 그룹: PC마다 자기 안의 로컬 계정으로 확인한다. 도메인: 두 PC 모두 도메인 컨트롤러가 디렉터리의 같은 계정으로 확인한다.
export const activeDirectoryAuthScenarios: DiagramScenario[] = [
  { id: 'workgroup', nodes: ['pc01-local', 'pc01-logon', 'other-local', 'other-logon'], paths: ['pc01-check', 'other-check'] },
  { id: 'domain', nodes: ['pc01-logon', 'other-logon', 'directory'], paths: ['pc01-dc', 'other-dc'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ActiveDirectoryAuthDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-active-directory-auth-arrow`
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
      scenarios={activeDirectoryAuthScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 128' : '0 0 280 224'}>
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
