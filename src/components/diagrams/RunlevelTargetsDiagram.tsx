import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['runlevel-targets']

// 실행 레벨 다섯을 줄마다 테두리 하나로 묶고, 줄 안에 번호 칸과 타깃 칸을 빈틈없이 잇는다. 상태 이름은 테두리의 라벨이다.
// 세로형은 라벨을 줄 위쪽에, 칸 둘을 그 아래에 둔다. 그래픽 화면의 화살표는 타깃 칸 오른쪽 통로로 5의 줄에서 3의 줄로 올라간다.
const nodes = [
  { id: 'level-0', x: 20, y: 28, width: 40 },
  { id: 'target-0', x: 60, y: 28, width: 136 },
  { id: 'level-1', x: 20, y: 92, width: 40 },
  { id: 'target-1', x: 60, y: 92, width: 136 },
  { id: 'level-3', x: 20, y: 156, width: 40 },
  { id: 'target-3', x: 60, y: 156, width: 136 },
  { id: 'level-5', x: 20, y: 220, width: 40 },
  { id: 'target-5', x: 60, y: 220, width: 136 },
  { id: 'level-6', x: 20, y: 284, width: 40 },
  { id: 'target-6', x: 60, y: 284, width: 136 },
]

const groups = [
  { id: 'row-0', x: 8, y: 8, width: 264, height: 56, labelX: 20, labelY: 23 },
  { id: 'row-1', x: 8, y: 72, width: 264, height: 56, labelX: 20, labelY: 87 },
  { id: 'row-3', x: 8, y: 136, width: 264, height: 56, labelX: 20, labelY: 151 },
  { id: 'row-5', x: 8, y: 200, width: 264, height: 56, labelX: 20, labelY: 215 },
  { id: 'row-6', x: 8, y: 264, width: 264, height: 56, labelX: 20, labelY: 279 },
]

const paths: Record<string, string> = {
  'pulls': 'M196 236 H228 V172 H196',
}

// 가로형은 줄마다 라벨을 왼쪽에, 칸 둘을 오른쪽에 한 줄로 둔다.
const wideNodes = [
  { id: 'level-0', x: 160, y: 16, width: 40 },
  { id: 'target-0', x: 200, y: 16, width: 136 },
  { id: 'level-1', x: 160, y: 72, width: 40 },
  { id: 'target-1', x: 200, y: 72, width: 136 },
  { id: 'level-3', x: 160, y: 128, width: 40 },
  { id: 'target-3', x: 200, y: 128, width: 136 },
  { id: 'level-5', x: 160, y: 184, width: 40 },
  { id: 'target-5', x: 200, y: 184, width: 136 },
  { id: 'level-6', x: 160, y: 240, width: 40 },
  { id: 'target-6', x: 200, y: 240, width: 136 },
]

const wideGroups = [
  { id: 'row-0', x: 8, y: 8, width: 424, height: 48, labelX: 20, labelY: 36 },
  { id: 'row-1', x: 8, y: 64, width: 424, height: 48, labelX: 20, labelY: 92 },
  { id: 'row-3', x: 8, y: 120, width: 424, height: 48, labelX: 20, labelY: 148 },
  { id: 'row-5', x: 8, y: 176, width: 424, height: 48, labelX: 20, labelY: 204 },
  { id: 'row-6', x: 8, y: 232, width: 424, height: 48, labelX: 20, labelY: 260 },
]

const widePaths: Record<string, string> = {
  'pulls': 'M336 200 H368 V144 H336',
}

export const runlevelTargetsScenarios: DiagramScenario[] = [
  { id: 'off-reboot', nodes: ['level-0', 'target-0', 'level-6', 'target-6'], paths: [] },
  { id: 'multi-user', nodes: ['level-3', 'target-3'], paths: [] },
  { id: 'graphical', nodes: ['level-5', 'target-5', 'target-3'], paths: ['pulls'] },
  { id: 'rescue', nodes: ['level-1', 'target-1'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RunlevelTargetsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-runlevel-targets-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={runlevelTargetsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 288' : '0 0 280 328'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
        </svg>
      </div>
    </DiagramFrame>
  )
}
