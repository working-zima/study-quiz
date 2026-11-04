import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-permissions'].diagrams['rwx-meaning']

// 세로형은 표처럼 한 줄에 글자 하나를 둔다. 왼쪽 열에 글자 r·w·x, 가운데 테두리에 파일에서의 뜻, 오른쪽 테두리에 디렉터리에서의 뜻이다.
// 글자와 두 뜻은 같은 줄(같은 y)에 서서 줄로 짝이 지어진다. 선은 없고 노드는 모두 회색이다.
const nodes = [
  { id: 'r', x: 4, y: 28, width: 28 },
  { id: 'w', x: 4, y: 68, width: 28 },
  { id: 'x', x: 4, y: 108, width: 28 },
  { id: 'file-r', x: 44, y: 28, width: 112 },
  { id: 'file-w', x: 44, y: 68, width: 112 },
  { id: 'file-x', x: 44, y: 108, width: 112 },
  { id: 'dir-r', x: 172, y: 28, width: 100 },
  { id: 'dir-w', x: 172, y: 68, width: 100 },
  { id: 'dir-x', x: 172, y: 108, width: 100 },
]

const groups = [
  { id: 'file', x: 38, y: 8, width: 124, height: 140, labelX: 44, labelY: 22 },
  { id: 'dir', x: 166, y: 8, width: 112, height: 140, labelX: 172, labelY: 22 },
]

// 가로형도 같은 표 모양이고 칸만 넓다.
const wideNodes = [
  { id: 'r', x: 16, y: 28, width: 40 },
  { id: 'w', x: 16, y: 68, width: 40 },
  { id: 'x', x: 16, y: 108, width: 40 },
  { id: 'file-r', x: 80, y: 28, width: 152 },
  { id: 'file-w', x: 80, y: 68, width: 152 },
  { id: 'file-x', x: 80, y: 108, width: 152 },
  { id: 'dir-r', x: 264, y: 28, width: 152 },
  { id: 'dir-w', x: 264, y: 68, width: 152 },
  { id: 'dir-x', x: 264, y: 108, width: 152 },
]

const wideGroups = [
  { id: 'file', x: 72, y: 8, width: 168, height: 140, labelX: 80, labelY: 22 },
  { id: 'dir', x: 256, y: 8, width: 168, height: 140, labelX: 264, labelY: 22 },
]

// 「파일 지우기」는 디렉터리의 쓰기·실행만 밝힌다 — 지울 파일 자신의 권한은 따지지 않는다.
export const rwxMeaningScenarios: DiagramScenario[] = [
  { id: 'file', nodes: ['r', 'w', 'x', 'file-r', 'file-w', 'file-x'], paths: [] },
  { id: 'directory', nodes: ['r', 'w', 'x', 'dir-r', 'dir-w', 'dir-x'], paths: [] },
  { id: 'delete', nodes: ['w', 'x', 'dir-w', 'dir-x'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RwxMeaningDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={rwxMeaningScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 156' : '0 0 280 156'}>
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
