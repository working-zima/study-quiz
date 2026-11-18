import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['iis-log-rollover']

// 세로형은 위에서부터 웹 브라우저, 사이트, 바꾼 로그 디렉터리 D:\Logs 상자, 기본 로그 디렉터리 상자를 쌓는다.
// D:\Logs 상자 안에는 날마다의 로그 파일 둘을 왼쪽(첫째 날)에서 오른쪽(둘째 날)으로 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'browser', x: 16, y: 16, width: 96 },
  { id: 'site', x: 16, y: 72, width: 152 },
  { id: 'day1', x: 24, y: 144, width: 104 },
  { id: 'day2', x: 152, y: 144, width: 104 },
  { id: 'default-file', x: 24, y: 248, width: 104 },
]

const groups = [
  { id: 'new-dir', x: 8, y: 120, width: 264, height: 88, labelX: 16, labelY: 133 },
  { id: 'default-dir', x: 8, y: 224, width: 264, height: 64, labelX: 16, labelY: 237 },
]

// 화살표는 웹 브라우저에서 사이트로, 사이트에서 첫째 날 파일로 내려가고, 첫째 날 파일에서 둘째 날 파일로 옆으로 간다.
const paths: Record<string, string> = {
  'browser-site': 'M64 48 V72',
  'site-day1': 'M76 104 V144',
  'day1-day2': 'M128 160 H152',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'new-key': 'directory',
  'default-key': 'directory',
  'keep-key': 'rollover',
  'next-key': 'rollover',
}

const notes: Note[] = [
  { id: 'new-key', x: 264, y: 133, anchor: 'end' },
  { id: 'default-key', x: 144, y: 268, anchor: 'start' },
  { id: 'keep-key', x: 24, y: 196, anchor: 'start' },
  { id: 'next-key', x: 152, y: 196, anchor: 'start' },
]

// 가로형은 웹 브라우저와 사이트를 한 줄에 두고, 두 디렉터리 상자를 넓혀 위아래로 둔다.
const wideNodes = [
  { id: 'browser', x: 16, y: 16, width: 96 },
  { id: 'site', x: 144, y: 16, width: 160 },
  { id: 'day1', x: 152, y: 88, width: 104 },
  { id: 'day2', x: 296, y: 88, width: 104 },
  { id: 'default-file', x: 152, y: 184, width: 104 },
]

const wideGroups = [
  { id: 'new-dir', x: 8, y: 64, width: 424, height: 80, labelX: 16, labelY: 77 },
  { id: 'default-dir', x: 8, y: 160, width: 424, height: 64, labelX: 16, labelY: 173 },
]

const widePaths: Record<string, string> = {
  'browser-site': 'M112 32 H144',
  'site-day1': 'M200 48 V88',
  'day1-day2': 'M256 104 H296',
}

const wideNotes: Note[] = [
  { id: 'new-key', x: 424, y: 77, anchor: 'end' },
  { id: 'default-key', x: 264, y: 204, anchor: 'start' },
  { id: 'keep-key', x: 152, y: 136, anchor: 'start' },
  { id: 'next-key', x: 296, y: 136, anchor: 'start' },
]

// 저장 위치: 웹 브라우저·사이트·D:\Logs의 첫째 날 파일. 롤오버: 첫째 날 파일·둘째 날 파일.
export const iisLogRolloverScenarios: DiagramScenario[] = [
  { id: 'directory', nodes: ['browser', 'site', 'day1'], paths: ['browser-site', 'site-day1'] },
  { id: 'rollover', nodes: ['day1', 'day2'], paths: ['day1-day2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IisLogRolloverDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-iis-log-rollover-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={iisLogRolloverScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 296'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
