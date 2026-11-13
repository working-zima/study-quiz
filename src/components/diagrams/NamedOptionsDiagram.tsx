import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-servers'].diagrams['named-options']

// 세로형은 options 문의 예 일곱 줄을 본문에 적은 차례대로 위에서 아래로 쌓는다. 줄마다 바로 아래에 그 줄이 정하는 것을 적을 자리를 둔다.
// 줄은 모두 options 문 박스 안에 있고, 화살표는 없다. 노드는 모두 회색이다.
const nodes = [
  { id: 'directory', x: 12, y: 26, width: 256 },
  { id: 'masterfile', x: 12, y: 78, width: 256 },
  { id: 'dump', x: 12, y: 130, width: 256 },
  { id: 'listen', x: 12, y: 182, width: 256 },
  { id: 'allow', x: 12, y: 234, width: 256 },
  { id: 'recursion', x: 12, y: 286, width: 256 },
  { id: 'dnssec', x: 12, y: 338, width: 256 },
]

const groups = [
  { id: 'options', x: 4, y: 4, width: 272, height: 388, labelX: 12, labelY: 17 },
]

// 곁말은 자기 줄과 같은 id를 쓰고, 그 줄이 든 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'directory', x: 16, y: 71, anchor: 'start', scenarios: ['files'] },
  { id: 'masterfile', x: 16, y: 123, anchor: 'start', scenarios: ['files'] },
  { id: 'dump', x: 16, y: 175, anchor: 'start', scenarios: ['files'] },
  { id: 'listen', x: 16, y: 227, anchor: 'start', scenarios: ['who'] },
  { id: 'allow', x: 16, y: 279, anchor: 'start', scenarios: ['who'] },
  { id: 'recursion', x: 16, y: 331, anchor: 'start', scenarios: ['resolver'] },
  { id: 'dnssec', x: 16, y: 383, anchor: 'start', scenarios: ['resolver'] },
]

// 가로형은 줄을 같은 차례로 쌓고, 곁말을 줄의 오른쪽에 둔다.
const wideNodes = [
  { id: 'directory', x: 12, y: 26, width: 232 },
  { id: 'masterfile', x: 12, y: 66, width: 232 },
  { id: 'dump', x: 12, y: 106, width: 232 },
  { id: 'listen', x: 12, y: 146, width: 232 },
  { id: 'allow', x: 12, y: 186, width: 232 },
  { id: 'recursion', x: 12, y: 226, width: 232 },
  { id: 'dnssec', x: 12, y: 266, width: 232 },
]

const wideGroups = [
  { id: 'options', x: 4, y: 4, width: 432, height: 302, labelX: 12, labelY: 17 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'directory', x: 252, y: 46, anchor: 'start' },
  { id: 'masterfile', x: 252, y: 86, anchor: 'start' },
  { id: 'dump', x: 252, y: 126, anchor: 'start' },
  { id: 'listen', x: 252, y: 166, anchor: 'start' },
  { id: 'allow', x: 252, y: 206, anchor: 'start' },
  { id: 'recursion', x: 252, y: 246, anchor: 'start' },
  { id: 'dnssec', x: 252, y: 286, anchor: 'start' },
]

// 파일: directory·masterfile-format·dump-file. 받기와 답하기: listen-on·allow-query. 재귀와 검증: recursion·dnssec-validation.
export const namedOptionsScenarios: DiagramScenario[] = [
  { id: 'files', nodes: ['directory', 'masterfile', 'dump'], paths: [] },
  { id: 'who', nodes: ['listen', 'allow'], paths: [] },
  { id: 'resolver', nodes: ['recursion', 'dnssec'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NamedOptionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={namedOptionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 314' : '0 0 280 396'}>
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
