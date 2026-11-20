import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['ieee-80211-bands']

// 세로형은 왼쪽 열에 2.4GHz·5GHz·60GHz 대역을 위에서 아래로, 오른쪽 열에 802.11 개정 일곱을 위에서 아래로 둔다.
// 개정은 쓰는 대역끼리 모아 802.11b·g·n·ax·a·ac·ad 차례로 쌓고, 대역 노드는 그 대역을 쓰는 개정 하나와 같은 줄에 세운다.
// 화살표는 개정에서 그 개정이 쓰는 대역으로 간다. 한 대역으로 모이는 화살표는 대역 노드의 오른쪽 변에 서로 다른 높이로 닿고,
// 세로 구간이 서로 다른 열을 지나 같은 대역의 선끼리 겹치지 않는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'band24', x: 8, y: 56, width: 80 },
  { id: 'band5', x: 8, y: 176, width: 80 },
  { id: 'band60', x: 8, y: 256, width: 80 },
  { id: 'std11b', x: 176, y: 16, width: 88 },
  { id: 'std11g', x: 176, y: 56, width: 88 },
  { id: 'std11n', x: 176, y: 96, width: 88 },
  { id: 'std11ax', x: 176, y: 136, width: 88 },
  { id: 'std11a', x: 176, y: 176, width: 88 },
  { id: 'std11ac', x: 176, y: 216, width: 88 },
  { id: 'std11ad', x: 176, y: 256, width: 88 },
]

const paths: Record<string, string> = {
  '11b-24': 'M176 32 H136 V60 H88',
  '11g-24': 'M176 68 H88',
  '11n-24': 'M176 104 H120 V76 H88',
  '11ax-24': 'M176 144 H104 V84 H88',
  '11n-5': 'M176 120 H104 V180 H88',
  '11ax-5': 'M176 160 H120 V188 H88',
  '11a-5': 'M176 196 H88',
  '11ac-5': 'M176 232 H136 V204 H88',
  '11ad-60': 'M176 272 H88',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 고른 대역 노드 바로 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'band-24-note': 'band-24',
  'band-5-note': 'band-5',
  'band-60-note': 'band-60',
}

const notes: Note[] = [
  { id: 'band-24-note', x: 8, y: 104, anchor: 'start' },
  { id: 'band-5-note', x: 8, y: 224, anchor: 'start' },
  { id: 'band-60-note', x: 8, y: 304, anchor: 'start' },
]

// 가로형은 대역 셋을 가운데 열에 두고, 2.4GHz 대역을 쓰는 개정(802.11b·g·n·ax)을 왼쪽 열에, 나머지(802.11a·ac·ad)를 오른쪽 열에 둔다.
// 왼쪽 열의 802.11n·ax는 5GHz 대역 노드와 같은 높이에 걸쳐 있어 5GHz로 가는 화살표가 곧다.
const wideNodes = [
  { id: 'band24', x: 184, y: 48, width: 80 },
  { id: 'band5', x: 184, y: 112, width: 80 },
  { id: 'band60', x: 184, y: 176, width: 80 },
  { id: 'std11b', x: 16, y: 16, width: 88 },
  { id: 'std11g', x: 16, y: 56, width: 88 },
  { id: 'std11n', x: 16, y: 96, width: 88 },
  { id: 'std11ax', x: 16, y: 136, width: 88 },
  { id: 'std11a', x: 336, y: 96, width: 88 },
  { id: 'std11ac', x: 336, y: 136, width: 88 },
  { id: 'std11ad', x: 336, y: 176, width: 88 },
]

const widePaths: Record<string, string> = {
  '11b-24': 'M104 32 H160 V52 H184',
  '11g-24': 'M104 60 H184',
  '11n-24': 'M104 104 H128 V68 H184',
  '11ax-24': 'M104 160 H144 V76 H184',
  '11n-5': 'M104 120 H184',
  '11ax-5': 'M104 140 H184',
  '11a-5': 'M336 120 H264',
  '11ac-5': 'M336 140 H264',
  '11ad-60': 'M336 192 H264',
}

const wideNotes: Note[] = [
  { id: 'band-24-note', x: 224, y: 96, anchor: 'middle' },
  { id: 'band-5-note', x: 224, y: 160, anchor: 'middle' },
  { id: 'band-60-note', x: 224, y: 224, anchor: 'middle' },
]

// 2.4GHz: 802.11b·g·n·ax. 5GHz: 802.11n·ax·a·ac. 60GHz: 802.11ad.
export const ieee80211BandsScenarios: DiagramScenario[] = [
  {
    id: 'band-24',
    nodes: ['band24', 'std11b', 'std11g', 'std11n', 'std11ax'],
    paths: ['11b-24', '11g-24', '11n-24', '11ax-24'],
  },
  {
    id: 'band-5',
    nodes: ['band5', 'std11n', 'std11ax', 'std11a', 'std11ac'],
    paths: ['11n-5', '11ax-5', '11a-5', '11ac-5'],
  },
  {
    id: 'band-60',
    nodes: ['band60', 'std11ad'],
    paths: ['11ad-60'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function Ieee80211BandsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ieee-80211-bands-arrow`
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
      scenarios={ieee80211BandsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 312'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
