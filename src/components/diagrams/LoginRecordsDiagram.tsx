import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-accounts'].diagrams['login-records']

// 세로형은 맨 위 로그인 시도에서 두 갈래로 나뉜다. 왼쪽 열이 성공 → /var/log/wtmp → last, 오른쪽 열이 실패 → /var/log/btmp → lastb다.
// 갈래 사이의 화살표는 늘 보이고, 고른 갈래의 화살표만 굵게 겹쳐 그린다. 두 갈래는 만나지 않는다.
const nodes = [
  { id: 'attempt', x: 80, y: 8, width: 120 },
  { id: 'success', x: 16, y: 80, width: 112 },
  { id: 'failure', x: 152, y: 80, width: 112 },
  { id: 'wtmp', x: 16, y: 144, width: 112 },
  { id: 'btmp', x: 152, y: 144, width: 112 },
  { id: 'last', x: 16, y: 208, width: 112 },
  { id: 'lastb', x: 152, y: 208, width: 112 },
]

const paths: Record<string, string> = {
  'l-success': 'M110 40 V60 H72 V80',
  'l-wtmp': 'M72 112 V144',
  'l-last': 'M72 176 V208',
  'l-failure': 'M170 40 V60 H208 V80',
  'l-btmp': 'M208 112 V144',
  'l-lastb': 'M208 176 V208',
  'to-success': 'M110 40 V60 H72 V80',
  'to-wtmp': 'M72 112 V144',
  'to-last': 'M72 176 V208',
  'to-failure': 'M170 40 V60 H208 V80',
  'to-btmp': 'M208 112 V144',
  'to-lastb': 'M208 176 V208',
}

const linkIds = ['l-success', 'l-wtmp', 'l-last', 'l-failure', 'l-btmp', 'l-lastb']

// 가로형은 왼쪽 로그인 시도에서 오른쪽으로 두 줄이 나뉜다. 위 줄이 성공 갈래, 아래 줄이 실패 갈래다.
const wideNodes = [
  { id: 'attempt', x: 8, y: 48, width: 96 },
  { id: 'success', x: 136, y: 24, width: 64 },
  { id: 'failure', x: 136, y: 72, width: 64 },
  { id: 'wtmp', x: 232, y: 24, width: 112 },
  { id: 'btmp', x: 232, y: 72, width: 112 },
  { id: 'last', x: 376, y: 24, width: 56 },
  { id: 'lastb', x: 376, y: 72, width: 56 },
]

const widePaths: Record<string, string> = {
  'l-success': 'M104 56 H120 V40 H136',
  'l-wtmp': 'M200 40 H232',
  'l-last': 'M344 40 H376',
  'l-failure': 'M104 72 H120 V88 H136',
  'l-btmp': 'M200 88 H232',
  'l-lastb': 'M344 88 H376',
  'to-success': 'M104 56 H120 V40 H136',
  'to-wtmp': 'M200 40 H232',
  'to-last': 'M344 40 H376',
  'to-failure': 'M104 72 H120 V88 H136',
  'to-btmp': 'M200 88 H232',
  'to-lastb': 'M344 88 H376',
}

export const loginRecordsScenarios: DiagramScenario[] = [
  { id: 'success', nodes: ['attempt', 'success', 'wtmp', 'last'], paths: ['to-success', 'to-wtmp', 'to-last'] },
  { id: 'failure', nodes: ['attempt', 'failure', 'btmp', 'lastb'], paths: ['to-failure', 'to-btmp', 'to-lastb'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LoginRecordsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const baseId = useId()
  const arrowId = `${baseId}-login-records-arrow`
  const linkArrowId = `${baseId}-login-records-link-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={loginRecordsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 112' : '0 0 280 248'}>
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
              strokeLinejoin="round"
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
