import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['channel-overlap']

// 맨 위에 AP01과 AP02를 두고, 그 아래에 채널 상자를 주파수 순서대로 놓는다. 오른쪽으로 갈수록 주파수가 높다.
// 채널 상자의 가로 길이는 고속 DSSS 신호의 폭 22MHz이고, 세로형은 1MHz를 5, 가로형은 8로 잡는다.
// 채널 3은 채널 1에서 10MHz, 채널 6은 25MHz 오른쪽이다. 채널 1과 겹치는 채널 3은 줄을 나눠 위에 두고,
// 채널 1과 겹치지 않는 채널 6은 채널 1과 같은 줄에 둔다. 화살표는 AP가 쓰는 채널을 가리킨다. 노드는 모두 회색이다.
const nodes = [
  { id: 'ap01', x: 8, y: 8, width: 72 },
  { id: 'ap02', x: 152, y: 8, width: 72 },
  { id: 'ch3', x: 72, y: 72, width: 110 },
  { id: 'ch1', x: 22, y: 128, width: 110 },
  { id: 'ch6', x: 147, y: 128, width: 110 },
]

const paths: Record<string, string> = {
  'ap01-ch1': 'M44 40 V128',
  'ap02-ch3': 'M168 40 V72',
  'ap02-ch6': 'M216 40 V128',
}

type Note = { id: string, x: number, y: number }

// 「겹쳐서 간섭한다」는 채널 1과 채널 3이 겹치는 구간 가운데, 두 줄 사이에 둔다.
// 「겹치지 않는다」는 채널 1과 채널 6 사이의 빈틈 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'overlap-note': 'overlap',
  'apart-note': 'apart',
}

const notes: Note[] = [
  { id: 'overlap-note', x: 102, y: 120 },
  { id: 'apart-note', x: 140, y: 180 },
]

// 가로형은 같은 배치를 넓힌다. 1MHz를 8로 잡아 채널 상자를 길게 둔다.
const wideNodes = [
  { id: 'ap01', x: 24, y: 8, width: 88 },
  { id: 'ap02', x: 248, y: 8, width: 96 },
  { id: 'ch3', x: 112, y: 64, width: 176 },
  { id: 'ch1', x: 32, y: 120, width: 176 },
  { id: 'ch6', x: 232, y: 120, width: 176 },
]

const widePaths: Record<string, string> = {
  'ap01-ch1': 'M68 40 V120',
  'ap02-ch3': 'M272 40 V64',
  'ap02-ch6': 'M320 40 V120',
}

const wideNotes: Note[] = [
  { id: 'overlap-note', x: 160, y: 112 },
  { id: 'apart-note', x: 220, y: 172 },
]

// 겹치는 채널: AP02가 채널 3을 쓴다. 겹치지 않는 채널: AP02가 채널 6을 쓴다. AP01은 두 시나리오 모두 채널 1이다.
export const channelOverlapScenarios: DiagramScenario[] = [
  { id: 'overlap', nodes: ['ap01', 'ap02', 'ch3', 'ch1'], paths: ['ap01-ch1', 'ap02-ch3'] },
  { id: 'apart', nodes: ['ap01', 'ap02', 'ch1', 'ch6'], paths: ['ap01-ch1', 'ap02-ch6'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ChannelOverlapDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-channel-overlap-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={channelOverlapScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 192'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
