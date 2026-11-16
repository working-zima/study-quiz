import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-admin-tools'].diagrams['powershell-commands']

// 맨 위 박스에 cmdlet 이름 하나를 동사와 명사 두 조각으로 빈틈없이 잇는다. 그 아래 왼쪽 박스에 입력한 이름 넷을,
// 오른쪽 박스에 실행되는 것 셋을 두고, 입력한 이름에서 실행되는 것으로 가로 화살표를 긋는다. 대소문자만 다른 두 이름은 같은 cmdlet으로 모인다.
const nodes = [
  { id: 'verb', x: 100, y: 28, width: 40 },
  { id: 'noun', x: 140, y: 28, width: 80 },
  { id: 'in-dir', x: 16, y: 104, width: 96 },
  { id: 'in-ipconfig', x: 16, y: 152, width: 96 },
  { id: 'in-lower', x: 16, y: 200, width: 96 },
  { id: 'in-upper', x: 16, y: 248, width: 96 },
  { id: 'run-gci', x: 152, y: 104, width: 112 },
  { id: 'run-ipconfig', x: 152, y: 152, width: 112 },
  { id: 'run-gsv', x: 152, y: 224, width: 112 },
]

const groups = [
  { id: 'cmdlet-name', x: 8, y: 8, width: 264, height: 68, labelX: 16, labelY: 21 },
  { id: 'typed', x: 8, y: 84, width: 112, height: 204, labelX: 16, labelY: 97 },
  { id: 'runs', x: 144, y: 84, width: 128, height: 204, labelX: 152, labelY: 97 },
]

const paths: Record<string, string> = {
  'alias': 'M112 120 H152',
  'native': 'M112 168 H152',
  'case-lower': 'M112 216 H132 V232 H152',
  'case-upper': 'M112 264 H132 V248 H152',
}

// 동사·명사 곁말은 조각 바로 아래, 별칭 곁말은 두 박스 사이 화살표 위, 실행 파일·대소문자 곁말은 실행되는 것 박스 안 노드 아래에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'verb-note', x: 120, y: 72, anchor: 'middle', scenarios: ['cmdlet'] },
  { id: 'noun-note', x: 180, y: 72, anchor: 'middle', scenarios: ['cmdlet'] },
  { id: 'alias-note', x: 132, y: 114, anchor: 'middle', scenarios: ['alias'] },
  { id: 'native-note', x: 208, y: 204, anchor: 'middle', scenarios: ['native'] },
  { id: 'case-note', x: 208, y: 276, anchor: 'middle', scenarios: ['case'] },
]

// 가로형은 cmdlet 이름 박스를 왼쪽 위에 두고, 입력한 이름 박스와 실행되는 것 박스를 그 오른쪽에 나란히 둔다.
const wideNodes = [
  { id: 'verb', x: 24, y: 36, width: 40 },
  { id: 'noun', x: 64, y: 36, width: 72 },
  { id: 'in-dir', x: 168, y: 28, width: 96 },
  { id: 'in-ipconfig', x: 168, y: 76, width: 96 },
  { id: 'in-lower', x: 168, y: 124, width: 96 },
  { id: 'in-upper', x: 168, y: 172, width: 96 },
  { id: 'run-gci', x: 304, y: 28, width: 120 },
  { id: 'run-ipconfig', x: 304, y: 76, width: 120 },
  { id: 'run-gsv', x: 304, y: 148, width: 120 },
]

const wideGroups = [
  { id: 'cmdlet-name', x: 8, y: 8, width: 136, height: 84, labelX: 16, labelY: 21 },
  { id: 'typed', x: 160, y: 8, width: 112, height: 208, labelX: 168, labelY: 21 },
  { id: 'runs', x: 296, y: 8, width: 136, height: 208, labelX: 304, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'alias': 'M264 44 H304',
  'native': 'M264 92 H304',
  'case-lower': 'M264 140 H284 V156 H304',
  'case-upper': 'M264 188 H284 V172 H304',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'verb-note', x: 44, y: 84, anchor: 'middle' },
  { id: 'noun-note', x: 100, y: 84, anchor: 'middle' },
  { id: 'alias-note', x: 284, y: 38, anchor: 'middle' },
  { id: 'native-note', x: 364, y: 128, anchor: 'middle' },
  { id: 'case-note', x: 364, y: 200, anchor: 'middle' },
]

// cmdlet: 이름을 동사와 명사로 나눈다. 별칭: dir이 Get-ChildItem을 실행한다. 실행 파일: ipconfig가 ipconfig.exe를 실행한다.
// 대소문자: get-service와 Get-Service가 같은 cmdlet을 실행한다.
export const powerShellCommandsScenarios: DiagramScenario[] = [
  { id: 'cmdlet', nodes: ['verb', 'noun'], paths: [] },
  { id: 'alias', nodes: ['in-dir', 'run-gci'], paths: ['alias'] },
  { id: 'native', nodes: ['in-ipconfig', 'run-ipconfig'], paths: ['native'] },
  { id: 'case', nodes: ['in-lower', 'in-upper', 'run-gsv'], paths: ['case-lower', 'case-upper'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PowerShellCommandsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-powershell-commands-arrow`
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
      scenarios={powerShellCommandsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 224' : '0 0 280 296'}>
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
