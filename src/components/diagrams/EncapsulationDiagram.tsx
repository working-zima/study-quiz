import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['protocols-encapsulation'].diagrams.encapsulation

// 계층 이름 노드는 둥근 상자, 그 아래 데이터 단위의 칸은 모서리 없이 이어 붙인 상자다.
// 칸 id 앞부분이 그 칸이 속한 계층이다. 노드는 모두 회색이다.
const layerIds = new Set(['app', 'transport', 'internet', 'link'])

// 세로형은 계층마다 이름 노드를 두고, 18 아래에 그 계층을 지난 칸 줄을 왼쪽 끝부터 둔다.
// 네트워크 액세스 계층의 칸 여섯은 280 안에 들어가지 않아 헤더 넷과 본문·트레일러 두 줄로 나눈다.
const nodes = [
  { id: 'app', x: 12, y: 8, width: 116 },
  { id: 'app-http', x: 12, y: 58, width: 62 },
  { id: 'app-data', x: 74, y: 58, width: 48 },
  { id: 'transport', x: 12, y: 110, width: 116 },
  { id: 'transport-tcp', x: 12, y: 160, width: 56 },
  { id: 'transport-http', x: 68, y: 160, width: 62 },
  { id: 'transport-data', x: 130, y: 160, width: 48 },
  { id: 'internet', x: 12, y: 212, width: 116 },
  { id: 'internet-ip', x: 12, y: 262, width: 50 },
  { id: 'internet-tcp', x: 62, y: 262, width: 56 },
  { id: 'internet-http', x: 118, y: 262, width: 62 },
  { id: 'internet-data', x: 180, y: 262, width: 48 },
  { id: 'link', x: 12, y: 314, width: 116 },
  { id: 'link-ethernet', x: 12, y: 364, width: 70 },
  { id: 'link-ip', x: 82, y: 364, width: 50 },
  { id: 'link-tcp', x: 132, y: 364, width: 56 },
  { id: 'link-http', x: 188, y: 364, width: 62 },
  { id: 'link-data', x: 12, y: 400, width: 48 },
  { id: 'link-trailer', x: 60, y: 400, width: 54 },
]

// 보낼 때는 위 계층 칸 줄의 아래 변에서 다음 계층 이름 노드의 위 변으로 내려간다. 받을 때는 같은 자리를 거꾸로 올라간다.
const paths: Record<string, string> = {
  'app-to-transport': 'M24 90 V110',
  'transport-to-internet': 'M24 192 V212',
  'internet-to-link': 'M24 294 V314',
  'link-to-internet': 'M24 314 V294',
  'internet-to-transport': 'M24 212 V192',
  'transport-to-app': 'M24 110 V90',
}

// 단위 이름은 시나리오와 상관없이 늘 보이고, 자기 계층 이름 노드 바로 오른쪽에서 그 노드의 opacity를 따른다.
const unitNotes = [
  { id: 'unit-app', x: 136, y: 28, layer: 'app' },
  { id: 'unit-transport', x: 136, y: 130, layer: 'transport' },
  { id: 'unit-internet', x: 136, y: 232, layer: 'internet' },
  { id: 'unit-link', x: 136, y: 334, layer: 'link' },
]

// 바뀌는 칸을 가리키는 곁말은 칸 바로 위 가운데에 둔다. 트레일러만 두 번째 줄 오른쪽에 둔다.
// 보낼 때와 받을 때는 같은 자리에 다른 글이 나온다.
const tagPlaces = [
  { suffix: 'app', x: 43, y: 53, textAnchor: 'middle' as const },
  { suffix: 'transport', x: 40, y: 155, textAnchor: 'middle' as const },
  { suffix: 'internet', x: 37, y: 257, textAnchor: 'middle' as const },
  { suffix: 'link', x: 47, y: 359, textAnchor: 'middle' as const },
  { suffix: 'trailer', x: 122, y: 420, textAnchor: 'start' as const },
]

// 가로형은 칸을 계단처럼 둔다. 위 계층의 칸이 아래 계층의 같은 칸 바로 위에 놓이고, 이름 노드는 자기 줄의 맨 앞 칸에서 시작한다.
const wideNodes = [
  { id: 'app', x: 226, y: 8, width: 116 },
  { id: 'app-http', x: 226, y: 58, width: 62 },
  { id: 'app-data', x: 288, y: 58, width: 48 },
  { id: 'transport', x: 170, y: 110, width: 116 },
  { id: 'transport-tcp', x: 170, y: 160, width: 56 },
  { id: 'transport-http', x: 226, y: 160, width: 62 },
  { id: 'transport-data', x: 288, y: 160, width: 48 },
  { id: 'internet', x: 120, y: 212, width: 116 },
  { id: 'internet-ip', x: 120, y: 262, width: 50 },
  { id: 'internet-tcp', x: 170, y: 262, width: 56 },
  { id: 'internet-http', x: 226, y: 262, width: 62 },
  { id: 'internet-data', x: 288, y: 262, width: 48 },
  { id: 'link', x: 50, y: 314, width: 116 },
  { id: 'link-ethernet', x: 50, y: 364, width: 70 },
  { id: 'link-ip', x: 120, y: 364, width: 50 },
  { id: 'link-tcp', x: 170, y: 364, width: 56 },
  { id: 'link-http', x: 226, y: 364, width: 62 },
  { id: 'link-data', x: 288, y: 364, width: 48 },
  { id: 'link-trailer', x: 336, y: 364, width: 54 },
]

// 화살표는 위 줄 맨 앞 칸의 왼쪽 변에서 12 안쪽을 지난다. 그 자리는 다음 계층 이름 노드 안이기도 하다.
const widePaths: Record<string, string> = {
  'app-to-transport': 'M238 90 V110',
  'transport-to-internet': 'M182 192 V212',
  'internet-to-link': 'M132 294 V314',
  'link-to-internet': 'M132 314 V294',
  'internet-to-transport': 'M182 212 V192',
  'transport-to-app': 'M238 110 V90',
}

const wideUnitNotes = [
  { id: 'unit-app', x: 350, y: 28 },
  { id: 'unit-transport', x: 294, y: 130 },
  { id: 'unit-internet', x: 244, y: 232 },
  { id: 'unit-link', x: 174, y: 334 },
]

// 가로형은 트레일러도 프레임 줄에 있어 다른 곁말처럼 칸 바로 위 가운데에 둔다.
const wideTagPlaces = [
  { suffix: 'app', x: 257, y: 53, textAnchor: 'middle' as const },
  { suffix: 'transport', x: 198, y: 155, textAnchor: 'middle' as const },
  { suffix: 'internet', x: 145, y: 257, textAnchor: 'middle' as const },
  { suffix: 'link', x: 85, y: 359, textAnchor: 'middle' as const },
  { suffix: 'trailer', x: 363, y: 359, textAnchor: 'middle' as const },
]

// 보내는 쪽이 붙인 헤더를 받는 쪽의 같은 계층이 떼므로 두 시나리오의 선명한 칸은 같다. 둘은 화살표 방향과 곁말로 갈린다.
const changed = ['app', 'transport', 'internet', 'link', 'app-http', 'transport-tcp', 'internet-ip', 'link-ethernet', 'link-trailer']
const tagPrefix: Record<string, string> = { send: 'attach', receive: 'detach' }

export const encapsulationScenarios: DiagramScenario[] = [
  { id: 'send', nodes: changed, paths: ['app-to-transport', 'transport-to-internet', 'internet-to-link'] },
  { id: 'receive', nodes: changed, paths: ['link-to-internet', 'internet-to-transport', 'transport-to-app'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EncapsulationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-encapsulation-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutUnitNotes = wide ? wideUnitNotes.map((note) => ({ ...unitNotes.find(({ id }) => id === note.id)!, ...note })) : unitNotes
  const layoutTags = active ? (wide ? wideTagPlaces : tagPlaces).map((place) => ({ ...place, id: `${tagPrefix[active.id]}-${place.suffix}` })) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={encapsulationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 404' : '0 0 280 440'}>
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
              <rect
                className="fill-panel stroke-disabled"
                x={node.x}
                y={node.y}
                width={node.width}
                height="32"
                rx={layerIds.has(node.id) ? '4' : '0'}
                strokeWidth="1.5"
              />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutUnitNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="start" className="fill-muted" fontSize="9" opacity={opacityOf(note.layer)}>
              {text.notes![note.id]}
            </text>
          ))}
          {layoutTags.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
