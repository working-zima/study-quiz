import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-basics'].diagrams['throughput']

// 전송 속도·처리율·대역폭 도식은 같은 막대를 쓴다(ExpectedSpeedDiagram·BandwidthDiagram과 좌표가 같다).
// 바깥 막대가 대역폭, 그 안을 왼쪽부터 채운 막대가 처리율, 막대를 지나는 세로 표시선이 전송 속도다. 눈금은 없다.
const groups = [
  { id: 'bandwidth', x: 8, y: 56, width: 264, height: 56 },
]

// 전송 속도 꼬리표는 막대 밖 위에 둔다. 채운 막대만 회색으로 채운다.
const nodes = [
  { id: 'speed', x: 168, y: 8, width: 64 },
  { id: 'throughput', x: 12, y: 76, width: 136 },
]

// 표시선은 꼬리표 아래 변에서 바깥 막대 아래 변까지 내려간다. 채운 막대의 끝보다 오른쪽이라 그 상자를 지나지 않는다.
const paths: Record<string, string> = {
  'speed-line': 'M200 40 V112',
}

// 곁말은 막대 아래 한 줄에, 그 곁말이 가리키는 요소 바로 밑에 둔다.
const notes = [
  { id: 'example', x: 80, y: 128, textAnchor: 'middle' as const, scenarios: ['actual'] },
  { id: 'limit', x: 272, y: 128, textAnchor: 'end' as const, scenarios: ['limit'] },
]

// 가로형은 막대를 오른쪽으로 늘이기만 한다.
const wideGroups = [
  { id: 'bandwidth', x: 8, y: 56, width: 424, height: 56 },
]

const wideNodes = [
  { id: 'speed', x: 288, y: 8, width: 64 },
  { id: 'throughput', x: 12, y: 76, width: 212 },
]

const widePaths: Record<string, string> = {
  'speed-line': 'M320 40 V112',
}

// 곁말은 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'example', x: 118, y: 128, textAnchor: 'middle' as const },
  { id: 'limit', x: 432, y: 128, textAnchor: 'end' as const },
]

// nodes에는 선명하게 둘 노드와 표시선을 함께 적는다. 이 도식에는 화살표가 없다.
export const throughputScenarios: DiagramScenario[] = [
  { id: 'actual', nodes: ['throughput'], paths: [] },
  { id: 'limit', nodes: ['throughput'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ThroughputDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={throughputScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 136'}>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
          ))}

          {Object.entries(layoutPaths).map(([id, d]) => (
            <path key={id} data-link={id} d={d} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect
                className={node.id === 'throughput' ? 'fill-disabled stroke-disabled' : 'fill-panel stroke-disabled'}
                fillOpacity={node.id === 'throughput' ? 0.4 : undefined}
                x={node.x}
                y={node.y}
                width={node.width}
                height="32"
                rx="4"
                strokeWidth="1.5"
              />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
