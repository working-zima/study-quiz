import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ethernet'].diagrams['ethernet-speeds']

// 이더넷 이름 하나를 박스 하나로 두고, 속도가 느린 것부터 위에서 아래로 쌓는다.
// 본문은 속도의 차이를 비율로 그리라고 하지 않으므로 박스 크기는 같게 둔다.
const groups = [
  { id: 'fast', x: 4, y: 24, width: 272, height: 64 },
  { id: 'gigabit', x: 4, y: 96, width: 272, height: 64 },
  { id: 'ten-gigabit', x: 4, y: 168, width: 272, height: 64 },
]

// 박스마다 같은 세 열을 쓴다 — 왼쪽부터 속도, 트위스티드 페어 규격, 멀티 모드 광섬유 규격이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'fast-speed', x: 12, y: 48, width: 64 },
  { id: 'fast-twisted', x: 84, y: 48, width: 88 },
  { id: 'fast-fiber', x: 180, y: 48, width: 88 },
  { id: 'gigabit-speed', x: 12, y: 120, width: 64 },
  { id: 'gigabit-twisted', x: 84, y: 120, width: 88 },
  { id: 'gigabit-fiber', x: 180, y: 120, width: 88 },
  { id: 'ten-gigabit-speed', x: 12, y: 192, width: 64 },
  { id: 'ten-gigabit-twisted', x: 84, y: 192, width: 88 },
  { id: 'ten-gigabit-fiber', x: 180, y: 192, width: 88 },
]

// 줄 머리 곁말은 맨 위 박스 위에, 자기 열의 가운데에 둔다.
const notes = [
  { id: 'speed', x: 44, y: 16, textAnchor: 'middle' as const },
  { id: 'twisted', x: 128, y: 16, textAnchor: 'middle' as const },
  { id: 'fiber', x: 224, y: 16, textAnchor: 'middle' as const },
]

// 가로형은 박스를 왼쪽에서 오른쪽으로 놓고, 박스마다 같은 세 줄을 쓴다 — 위부터 속도, 트위스티드 페어, 멀티 모드 광섬유다.
const wideGroups = [
  { id: 'fast', x: 92, y: 8, width: 108, height: 144 },
  { id: 'gigabit', x: 208, y: 8, width: 108, height: 144 },
  { id: 'ten-gigabit', x: 324, y: 8, width: 108, height: 144 },
]

const wideNodes = [
  { id: 'fast-speed', x: 100, y: 32, width: 92 },
  { id: 'fast-twisted', x: 100, y: 72, width: 92 },
  { id: 'fast-fiber', x: 100, y: 112, width: 92 },
  { id: 'gigabit-speed', x: 216, y: 32, width: 92 },
  { id: 'gigabit-twisted', x: 216, y: 72, width: 92 },
  { id: 'gigabit-fiber', x: 216, y: 112, width: 92 },
  { id: 'ten-gigabit-speed', x: 332, y: 32, width: 92 },
  { id: 'ten-gigabit-twisted', x: 332, y: 72, width: 92 },
  { id: 'ten-gigabit-fiber', x: 332, y: 112, width: 92 },
]

// 가로형의 줄 머리 곁말은 박스 왼쪽에, 자기 줄의 가운데 높이에 둔다.
const wideNotes = [
  { id: 'speed', x: 8, y: 51, textAnchor: 'start' as const },
  { id: 'twisted', x: 8, y: 91, textAnchor: 'start' as const },
  { id: 'fiber', x: 8, y: 131, textAnchor: 'start' as const },
]

// 이 도식에는 화살표가 없다. 시나리오는 고른 이름의 박스에 든 칸만 선명하게 둔다.
export const ethernetSpeedsScenarios: DiagramScenario[] = [
  { id: 'fast', nodes: ['fast-speed', 'fast-twisted', 'fast-fiber'], paths: [] },
  { id: 'gigabit', nodes: ['gigabit-speed', 'gigabit-twisted', 'gigabit-fiber'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EthernetSpeedsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={ethernetSpeedsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 240'}>
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

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
