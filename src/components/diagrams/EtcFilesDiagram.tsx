import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['etc-files']

// 세로형은 디렉터리 나무를 위에서 아래로 그린다. 맨 위 루트 디렉터리 / 아래에 etc와 bin을 나란히 두고,
// etc 아래의 파일 셋은 왼쪽 세로줄에서 가지를 내어 세로로 쌓는다. bin 아래에는 cat 하나다. 노드는 모두 회색이다.
const nodes = [
  { id: 'slash', x: 110, y: 8, width: 60 },
  { id: 'etc', x: 20, y: 72, width: 60 },
  { id: 'bin', x: 196, y: 72, width: 60 },
  { id: 'passwd', x: 60, y: 120, width: 64 },
  { id: 'shadow', x: 60, y: 168, width: 64 },
  { id: 'fstab', x: 60, y: 216, width: 64 },
  { id: 'cat', x: 200, y: 120, width: 52 },
]

// 부모와 자식을 잇는 가지는 늘 보인다. 시나리오는 노드와 가지의 흐림으로만 가른다.
const paths: Record<string, string> = {
  'b-etc': 'M140 40 V56 H50 V72',
  'b-bin': 'M140 40 V56 H226 V72',
  'b-passwd': 'M36 104 V136 H60',
  'b-shadow': 'M36 104 V184 H60',
  'b-fstab': 'M36 104 V232 H60',
  'b-cat': 'M226 104 V120',
}

const linkIds = ['b-etc', 'b-bin', 'b-passwd', 'b-shadow', 'b-fstab', 'b-cat']

// etc 아래 파일의 곁말은 파일 오른쪽에, cat의 곁말은 cat 아래에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'passwd-note', x: 132, y: 140, anchor: 'start', scenarios: ['accounts'] },
  { id: 'shadow-note', x: 132, y: 188, anchor: 'start', scenarios: ['accounts'] },
  { id: 'fstab-note', x: 132, y: 236, anchor: 'start', scenarios: ['mounts'] },
  { id: 'cat-note', x: 226, y: 168, anchor: 'middle', scenarios: ['programs'] },
]

// 가로형은 나무를 왼쪽에서 오른쪽으로 그린다. / 오른쪽에 etc와 bin을 세로로 두고, etc 오른쪽에 파일 셋을, bin 오른쪽에 cat을 둔다.
const wideNodes = [
  { id: 'slash', x: 8, y: 96, width: 40 },
  { id: 'etc', x: 88, y: 52, width: 60 },
  { id: 'bin', x: 88, y: 140, width: 60 },
  { id: 'passwd', x: 196, y: 8, width: 64 },
  { id: 'shadow', x: 196, y: 52, width: 64 },
  { id: 'fstab', x: 196, y: 96, width: 64 },
  { id: 'cat', x: 196, y: 140, width: 52 },
]

const widePaths: Record<string, string> = {
  'b-etc': 'M48 112 H68 V68 H88',
  'b-bin': 'M48 112 H68 V156 H88',
  'b-passwd': 'M148 68 H172 V24 H196',
  'b-shadow': 'M148 68 H196',
  'b-fstab': 'M148 68 H172 V112 H196',
  'b-cat': 'M148 156 H196',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'passwd-note', x: 268, y: 28, anchor: 'start' },
  { id: 'shadow-note', x: 268, y: 72, anchor: 'start' },
  { id: 'fstab-note', x: 268, y: 116, anchor: 'start' },
  { id: 'cat-note', x: 256, y: 160, anchor: 'start' },
]

// nodes에는 선명하게 둘 노드와 가지를 함께 적는다. 「계정 정보」와 「마운트할 목록」은 etc 아래 파일을, 「명령의 프로그램」은 bin 아래 cat을 보인다.
export const etcFilesScenarios: DiagramScenario[] = [
  { id: 'accounts', nodes: ['etc', 'passwd', 'shadow', 'b-passwd', 'b-shadow'], paths: [] },
  { id: 'mounts', nodes: ['etc', 'fstab', 'b-fstab'], paths: [] },
  { id: 'programs', nodes: ['bin', 'cat', 'b-cat'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EtcFilesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
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
      scenarios={etcFilesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 256'}>
          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
