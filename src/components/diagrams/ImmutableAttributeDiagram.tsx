import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['immutable-attribute']

// 세로형은 맨 위에 관리자 root, 그 아래 한 줄에 명령 chattr +i · rm · lsattr, 맨 아래에 파일 notice.txt를 둔다.
// rm은 root와 notice.txt 바로 사이에 세워 화살표가 곧게 가고, 다른 두 명령의 화살표는 notice.txt의 왼쪽·오른쪽 변으로 들어간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'root', x: 112, y: 16, width: 56 },
  { id: 'chattr', x: 16, y: 80, width: 72 },
  { id: 'rm', x: 112, y: 80, width: 56 },
  { id: 'lsattr', x: 192, y: 80, width: 64 },
  { id: 'notice', x: 96, y: 160, width: 88 },
]

// 화살표는 모두 시나리오마다 보인다. root에서 rm으로는 「root가 입력한다」, 명령에서 notice.txt로는 「그 명령이 다룬다」는 뜻이다.
const paths: Record<string, string> = {
  'run-rm': 'M140 48 V80',
  'rm-delete': 'M140 112 V160',
  'set-i': 'M52 112 V176 H96',
  'read-attr': 'M224 112 V176 H184',
}

// 「거부」 곁말은 rm에서 notice.txt로 가던 화살표가 있던 자리에, 「지워진다」는 그 화살표 오른쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'deleted-note', x: 148, y: 140, anchor: 'start', scenarios: ['plain'] },
  { id: 'refused-note', x: 140, y: 140, anchor: 'middle', scenarios: ['immutable'] },
  { id: 'attr-note', x: 140, y: 212, anchor: 'middle', scenarios: ['check'] },
]

// 가로형은 root → rm → notice.txt를 한 줄로 잇고, chattr +i를 notice.txt 위에, lsattr를 그 아래에 세운다.
const wideNodes = [
  { id: 'root', x: 16, y: 64, width: 56 },
  { id: 'chattr', x: 292, y: 8, width: 72 },
  { id: 'rm', x: 128, y: 64, width: 56 },
  { id: 'lsattr', x: 296, y: 128, width: 64 },
  { id: 'notice', x: 280, y: 64, width: 96 },
]

const widePaths: Record<string, string> = {
  'run-rm': 'M72 80 H128',
  'rm-delete': 'M184 80 H280',
  'set-i': 'M328 40 V64',
  'read-attr': 'M328 128 V96',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'deleted-note', x: 232, y: 72, anchor: 'middle' },
  { id: 'refused-note', x: 232, y: 112, anchor: 'middle' },
  { id: 'attr-note', x: 288, y: 148, anchor: 'end' },
]

// 「i를 붙였을 때」는 root와 rm을 밝히고도 rm에서 notice.txt로 가는 화살표를 그리지 않는다 — 지우는 요청이 거부되기 때문이다.
export const immutableAttributeScenarios: DiagramScenario[] = [
  { id: 'plain', nodes: ['root', 'rm', 'notice'], paths: ['run-rm', 'rm-delete'] },
  { id: 'immutable', nodes: ['root', 'rm', 'chattr', 'notice'], paths: ['set-i', 'run-rm'] },
  { id: 'check', nodes: ['lsattr', 'notice'], paths: ['read-attr'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ImmutableAttributeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-immutable-attribute-arrow`
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
      scenarios={immutableAttributeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 168' : '0 0 280 224'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
