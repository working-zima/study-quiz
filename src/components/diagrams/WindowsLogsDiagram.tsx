import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-admin-tools'].diagrams['windows-logs']

// 왼쪽 열에 일어난 일 셋을, 오른쪽 Windows 로그 박스 안에 로그 다섯을 위에서 아래로 둔다. 일어난 일은 그 일이 남는 로그와 같은 높이에 두어
// 화살표가 곧게 간다. 응용 프로그램 및 서비스 로그 박스는 Windows 로그 박스 아래에 따로 두고, 그 안에 WMI-Activity 로그를 둔다.
const nodes = [
  { id: 'file-error', x: 8, y: 28, width: 140 },
  { id: 'logon-failure', x: 8, y: 68, width: 140 },
  { id: 'driver-failure', x: 8, y: 148, width: 140 },
  { id: 'app-log', x: 162, y: 28, width: 108 },
  { id: 'security-log', x: 162, y: 68, width: 108 },
  { id: 'setup-log', x: 162, y: 108, width: 108 },
  { id: 'system-log', x: 162, y: 148, width: 108 },
  { id: 'forwarded-log', x: 162, y: 188, width: 108 },
  { id: 'wmi-log', x: 162, y: 260, width: 108 },
]

const groups = [
  { id: 'logs', x: 156, y: 8, width: 120, height: 220, labelX: 164, labelY: 21 },
  { id: 'apps', x: 120, y: 240, width: 156, height: 60, labelX: 128, labelY: 253 },
]

const paths: Record<string, string> = {
  'error-app': 'M148 44 H162',
  'logon-security': 'M148 84 H162',
  'driver-system': 'M148 164 H162',
}

// 곁말은 자기 시나리오에서만 보인다. 감사 조건은 로그온 실패 아래의 빈자리에, 다른 묶음 표시는 응용 프로그램 및 서비스 로그 박스 왼쪽에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'security-note', x: 8, y: 118, anchor: 'start', scenarios: ['security'] },
  { id: 'apps-note', x: 8, y: 280, anchor: 'start', scenarios: ['apps-services'] },
]

// 가로형은 일어난 일과 Windows 로그 박스의 자리가 세로형과 같고, 응용 프로그램 및 서비스 로그 박스만 Windows 로그 박스 오른쪽 위로 옮긴다.
const wideNodes = [
  { id: 'file-error', x: 8, y: 28, width: 140 },
  { id: 'logon-failure', x: 8, y: 68, width: 140 },
  { id: 'driver-failure', x: 8, y: 148, width: 140 },
  { id: 'app-log', x: 162, y: 28, width: 108 },
  { id: 'security-log', x: 162, y: 68, width: 108 },
  { id: 'setup-log', x: 162, y: 108, width: 108 },
  { id: 'system-log', x: 162, y: 148, width: 108 },
  { id: 'forwarded-log', x: 162, y: 188, width: 108 },
  { id: 'wmi-log', x: 308, y: 28, width: 108 },
]

const wideGroups = [
  { id: 'logs', x: 156, y: 8, width: 120, height: 220, labelX: 164, labelY: 21 },
  { id: 'apps', x: 284, y: 8, width: 152, height: 60, labelX: 288, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'error-app': 'M148 44 H162',
  'logon-security': 'M148 84 H162',
  'driver-system': 'M148 164 H162',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'security-note', x: 8, y: 118, anchor: 'start' },
  { id: 'apps-note', x: 288, y: 86, anchor: 'start' },
]

// 보안·시스템·응용 프로그램: 일어난 일 하나가 Windows 로그 안의 로그 하나에 남는다. 다른 묶음: 구성 요소 하나의 로그는 Windows 로그 밖에 있다.
export const windowsLogsScenarios: DiagramScenario[] = [
  { id: 'security', nodes: ['logon-failure', 'security-log'], paths: ['logon-security'] },
  { id: 'system', nodes: ['driver-failure', 'system-log'], paths: ['driver-system'] },
  { id: 'application', nodes: ['file-error', 'app-log'], paths: ['error-app'] },
  { id: 'apps-services', nodes: ['wmi-log'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function WindowsLogsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-windows-logs-arrow`
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
      scenarios={windowsLogsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 236' : '0 0 280 308'}>
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
