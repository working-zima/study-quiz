import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-admin-tools'].diagrams['run-commands']

// 왼쪽 박스에 실행 창에 입력하는 실행 이름 일곱을 본문 목록의 차례대로 위에서 아래로 두고, 오른쪽 박스에 그 이름이 여는 관리 도구를 같은 줄에 둔다.
// 화살표는 줄마다 실행 이름에서 같은 줄의 도구로 곧게 간다. 성능 모니터의 곁말은 두 박스 아래에 놓인다.
const nodes = [
  { id: 'run-compmgmt', x: 10, y: 28, width: 96 },
  { id: 'run-devmgmt', x: 10, y: 68, width: 96 },
  { id: 'run-gpedit', x: 10, y: 108, width: 96 },
  { id: 'run-secpol', x: 10, y: 148, width: 96 },
  { id: 'run-eventvwr', x: 10, y: 188, width: 96 },
  { id: 'run-certmgr', x: 10, y: 228, width: 96 },
  { id: 'run-perfmon', x: 10, y: 268, width: 96 },
  { id: 'tool-compmgmt', x: 130, y: 28, width: 140 },
  { id: 'tool-devmgmt', x: 130, y: 68, width: 140 },
  { id: 'tool-gpedit', x: 130, y: 108, width: 140 },
  { id: 'tool-secpol', x: 130, y: 148, width: 140 },
  { id: 'tool-eventvwr', x: 130, y: 188, width: 140 },
  { id: 'tool-certmgr', x: 130, y: 228, width: 140 },
  { id: 'tool-perfmon', x: 130, y: 268, width: 140 },
]

const groups = [
  { id: 'names', x: 4, y: 8, width: 108, height: 300, labelX: 12, labelY: 21 },
  { id: 'tools', x: 124, y: 8, width: 152, height: 300, labelX: 130, labelY: 21 },
]

const paths: Record<string, string> = {
  'compmgmt': 'M106 44 H130',
  'devmgmt': 'M106 84 H130',
  'gpedit': 'M106 124 H130',
  'secpol': 'M106 164 H130',
  'eventvwr': 'M106 204 H130',
  'certmgr': 'M106 244 H130',
  'perfmon': 'M106 284 H130',
}

// 곁말은 자기 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'perfmon-note', x: 10, y: 324, anchor: 'start', scenarios: ['records'] },
]

// 가로형도 같은 차례로 두되 두 박스 사이를 넓혀 화살표가 가로로 길게 간다.
const wideNodes = [
  { id: 'run-compmgmt', x: 32, y: 28, width: 116 },
  { id: 'run-devmgmt', x: 32, y: 68, width: 116 },
  { id: 'run-gpedit', x: 32, y: 108, width: 116 },
  { id: 'run-secpol', x: 32, y: 148, width: 116 },
  { id: 'run-eventvwr', x: 32, y: 188, width: 116 },
  { id: 'run-certmgr', x: 32, y: 228, width: 116 },
  { id: 'run-perfmon', x: 32, y: 268, width: 116 },
  { id: 'tool-compmgmt', x: 236, y: 28, width: 168 },
  { id: 'tool-devmgmt', x: 236, y: 68, width: 168 },
  { id: 'tool-gpedit', x: 236, y: 108, width: 168 },
  { id: 'tool-secpol', x: 236, y: 148, width: 168 },
  { id: 'tool-eventvwr', x: 236, y: 188, width: 168 },
  { id: 'tool-certmgr', x: 236, y: 228, width: 168 },
  { id: 'tool-perfmon', x: 236, y: 268, width: 168 },
]

const wideGroups = [
  { id: 'names', x: 20, y: 8, width: 140, height: 300, labelX: 28, labelY: 21 },
  { id: 'tools', x: 220, y: 8, width: 200, height: 300, labelX: 228, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'compmgmt': 'M148 44 H236',
  'devmgmt': 'M148 84 H236',
  'gpedit': 'M148 124 H236',
  'secpol': 'M148 164 H236',
  'eventvwr': 'M148 204 H236',
  'certmgr': 'M148 244 H236',
  'perfmon': 'M148 284 H236',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'perfmon-note', x: 32, y: 324, anchor: 'start' },
]

const pair = (row: string) => [`run-${row}`, `tool-${row}`]

// 컴퓨터와 장치: 컴퓨터 관리·장치 관리자. 정책: 로컬 그룹 정책 편집기·로컬 보안 정책. 기록과 측정: 이벤트 뷰어·성능 모니터. 인증서: 인증서 관리자.
export const runCommandsScenarios: DiagramScenario[] = [
  { id: 'system', nodes: [...pair('compmgmt'), ...pair('devmgmt')], paths: ['compmgmt', 'devmgmt'] },
  { id: 'policy', nodes: [...pair('gpedit'), ...pair('secpol')], paths: ['gpedit', 'secpol'] },
  { id: 'records', nodes: [...pair('eventvwr'), ...pair('perfmon')], paths: ['eventvwr', 'perfmon'] },
  { id: 'certificate', nodes: [...pair('certmgr')], paths: ['certmgr'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RunCommandsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-run-commands-arrow`
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
      scenarios={runCommandsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 332' : '0 0 280 332'}>
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
