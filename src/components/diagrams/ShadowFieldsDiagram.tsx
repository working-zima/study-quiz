import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-accounts'].diagrams['shadow-fields']

// 세로형은 user4의 /etc/shadow 한 줄을 콜론으로 끊어, 칸마다 「칸 이름 | 값」 한 행으로 위에서 아래로 쌓는다.
// 행은 빈틈없이 잇고, 이름 칸 바로 오른쪽에 값 칸이 맞닿는다. 선과 곁말은 없다.
const nodes = [
  { id: 'name-name', x: 16, y: 30, width: 120 },
  { id: 'name', x: 136, y: 30, width: 128 },
  { id: 'password-name', x: 16, y: 62, width: 120 },
  { id: 'password', x: 136, y: 62, width: 128 },
  { id: 'lastchange-name', x: 16, y: 94, width: 120 },
  { id: 'lastchange', x: 136, y: 94, width: 128 },
  { id: 'min-name', x: 16, y: 126, width: 120 },
  { id: 'min', x: 136, y: 126, width: 128 },
  { id: 'max-name', x: 16, y: 158, width: 120 },
  { id: 'max', x: 136, y: 158, width: 128 },
  { id: 'warn-name', x: 16, y: 190, width: 120 },
  { id: 'warn', x: 136, y: 190, width: 128 },
  { id: 'inactive-name', x: 16, y: 222, width: 120 },
  { id: 'inactive', x: 136, y: 222, width: 128 },
  { id: 'expire-name', x: 16, y: 254, width: 120 },
  { id: 'expire', x: 136, y: 254, width: 128 },
  { id: 'reserved-name', x: 16, y: 286, width: 120 },
  { id: 'reserved', x: 136, y: 286, width: 128 },
]

const groups = [
  { id: 'line', x: 8, y: 8, width: 264, height: 318, labelX: 16, labelY: 22 },
]

// 가로형은 두 열이다. 왼쪽 열에 사용자 이름부터 최대 사용 기간까지 다섯 칸을, 오른쪽 열에 경고 기간부터 예약 칸까지 네 칸을 위에서부터 둔다.
const wideNodes = [
  { id: 'name-name', x: 16, y: 30, width: 120 },
  { id: 'name', x: 136, y: 30, width: 72 },
  { id: 'password-name', x: 16, y: 62, width: 120 },
  { id: 'password', x: 136, y: 62, width: 72 },
  { id: 'lastchange-name', x: 16, y: 94, width: 120 },
  { id: 'lastchange', x: 136, y: 94, width: 72 },
  { id: 'min-name', x: 16, y: 126, width: 120 },
  { id: 'min', x: 136, y: 126, width: 72 },
  { id: 'max-name', x: 16, y: 158, width: 120 },
  { id: 'max', x: 136, y: 158, width: 72 },
  { id: 'warn-name', x: 224, y: 30, width: 104 },
  { id: 'warn', x: 328, y: 30, width: 96 },
  { id: 'inactive-name', x: 224, y: 62, width: 104 },
  { id: 'inactive', x: 328, y: 62, width: 96 },
  { id: 'expire-name', x: 224, y: 94, width: 104 },
  { id: 'expire', x: 328, y: 94, width: 96 },
  { id: 'reserved-name', x: 224, y: 126, width: 104 },
  { id: 'reserved', x: 328, y: 126, width: 96 },
]

const wideGroups = [
  { id: 'line', x: 8, y: 8, width: 424, height: 190, labelX: 16, labelY: 22 },
]

export const shadowFieldsScenarios: DiagramScenario[] = [
  { id: 'password', nodes: ['name-name', 'name', 'password-name', 'password'], paths: [] },
  { id: 'aging', nodes: ['lastchange-name', 'lastchange', 'min-name', 'min', 'max-name', 'max', 'warn-name', 'warn'], paths: [] },
  { id: 'expire', nodes: ['inactive-name', 'inactive', 'expire-name', 'expire'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ShadowFieldsDiagram() {
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
      scenarios={shadowFieldsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 206' : '0 0 280 334'}>
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
