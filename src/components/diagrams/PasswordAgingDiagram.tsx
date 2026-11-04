import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-accounts'].diagrams['password-aging']

// 세로형은 날이 지나는 차례대로 세 날을 위에서 아래로 쌓는다. 날 사이의 화살표는 늘 보인다.
// -M의 굵은 화살표는 마지막으로 바꾼 날에서 오른쪽으로 돌아 만료로 가고, -W의 굵은 화살표는 만료에서 왼쪽으로 돌아 알림 시작으로 거꾸로 간다.
const nodes = [
  { id: 'lastchange', x: 56, y: 8, width: 168 },
  { id: 'warn', x: 56, y: 88, width: 168 },
  { id: 'expire', x: 56, y: 168, width: 168 },
]

const paths: Record<string, string> = {
  'l-warn': 'M140 40 V88',
  'l-expire': 'M140 120 V168',
  'span-max': 'M224 24 H236 V184 H224',
  'span-warn': 'M56 184 H44 V104 H56',
}

const linkIds = ['l-warn', 'l-expire']

// 곁말은 옵션과 그 값이고, 그 옵션의 굵은 화살표 바깥쪽에 둔다. -l은 두 옵션을 함께 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'max', x: 244, y: 108, anchor: 'start', scenarios: ['max', 'list'] },
  { id: 'warn', x: 40, y: 148, anchor: 'end', scenarios: ['warn', 'list'] },
]

// 가로형은 세 날을 왼쪽에서 오른쪽으로 한 줄에 둔다. -M의 굵은 화살표는 위로, -W의 굵은 화살표는 아래로 돈다.
const wideNodes = [
  { id: 'lastchange', x: 8, y: 40, width: 160 },
  { id: 'warn', x: 200, y: 40, width: 112 },
  { id: 'expire', x: 344, y: 40, width: 88 },
]

const widePaths: Record<string, string> = {
  'l-warn': 'M168 56 H200',
  'l-expire': 'M312 56 H344',
  'span-max': 'M88 40 V20 H388 V40',
  'span-warn': 'M388 72 V92 H256 V72',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'max', x: 238, y: 14, anchor: 'middle' },
  { id: 'warn', x: 322, y: 108, anchor: 'middle' },
]

export const passwordAgingScenarios: DiagramScenario[] = [
  { id: 'max', nodes: ['lastchange', 'expire'], paths: ['span-max'] },
  { id: 'warn', nodes: ['warn', 'expire'], paths: ['span-warn'] },
  { id: 'list', nodes: ['lastchange', 'warn', 'expire'], paths: ['span-max', 'span-warn'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PasswordAgingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const baseId = useId()
  const arrowId = `${baseId}-password-aging-arrow`
  const linkArrowId = `${baseId}-password-aging-link-arrow`
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
      scenarios={passwordAgingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 120' : '0 0 280 208'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
            <marker id={linkArrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-muted" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              markerEnd={`url(#${linkArrowId})`}
            />
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
