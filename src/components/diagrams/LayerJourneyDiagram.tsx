import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['protocols-encapsulation'].diagrams['layer-journey']

// 보내는 호스트와 받는 호스트를 나란히 두고, 박스마다 네 계층을 맨 위 계층부터 아래로 쌓는다. 두 스택의 계층은 같은 높이에 짝을 이룬다.
const groups = [
  { id: 'sender', x: 4, y: 8, width: 132, height: 208 },
  { id: 'receiver', x: 144, y: 8, width: 132, height: 208 },
]

// 본문은 계층을 이름 없이 자리로만 부르므로(맨 위 계층, 그 아래 계층, …, 맨 아래 계층) 라벨도 자리로 적는다.
// 매체는 두 호스트 밖, 두 박스 아래 가운데에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'sender-1', x: 16, y: 28, width: 108 },
  { id: 'sender-2', x: 16, y: 76, width: 108 },
  { id: 'sender-3', x: 16, y: 124, width: 108 },
  { id: 'sender-4', x: 16, y: 172, width: 108 },
  { id: 'medium', x: 108, y: 240, width: 64 },
  { id: 'receiver-1', x: 156, y: 28, width: 108 },
  { id: 'receiver-2', x: 156, y: 76, width: 108 },
  { id: 'receiver-3', x: 156, y: 124, width: 108 },
  { id: 'receiver-4', x: 156, y: 172, width: 108 },
]

// 앞의 둘은 두 맨 아래 계층을 매체에 잇는 늘 보이는 연결선이다. 나머지는 화살표이고, 매체로 나가고 들어오는 화살표는 연결선 위에 겹쳐 그린다.
// 보낼 때는 보내는 쪽 스택의 가운데를 따라 내려가고, 받을 때는 받는 쪽 스택의 가운데를 따라 올라간다.
const paths: Record<string, string> = {
  'medium-out': 'M70 204 V256 H108',
  'medium-in': 'M172 256 H210 V204',
  'send-1': 'M70 60 V76',
  'send-2': 'M70 108 V124',
  'send-3': 'M70 156 V172',
  'send-4': 'M70 204 V256 H108',
  'receive-1': 'M172 256 H210 V204',
  'receive-2': 'M210 172 V156',
  'receive-3': 'M210 124 V108',
  'receive-4': 'M210 76 V60',
}

const linkIds = ['medium-out', 'medium-in']

// 매체가 무엇인지 적은 곁말은 매체 상자 바로 아래 가운데에 늘 보인다.
const note = { id: 'medium-kind', x: 140, y: 286 }

// 가로형은 두 호스트 박스를 양 끝에 벌리고, 매체를 두 박스 사이 맨 아래 계층과 같은 줄에 둔다.
const wideGroups = [
  { id: 'sender', x: 8, y: 8, width: 160, height: 208 },
  { id: 'receiver', x: 272, y: 8, width: 160, height: 208 },
]

const wideNodes = [
  { id: 'sender-1', x: 20, y: 28, width: 136 },
  { id: 'sender-2', x: 20, y: 76, width: 136 },
  { id: 'sender-3', x: 20, y: 124, width: 136 },
  { id: 'sender-4', x: 20, y: 172, width: 136 },
  { id: 'medium', x: 188, y: 172, width: 64 },
  { id: 'receiver-1', x: 284, y: 28, width: 136 },
  { id: 'receiver-2', x: 284, y: 76, width: 136 },
  { id: 'receiver-3', x: 284, y: 124, width: 136 },
  { id: 'receiver-4', x: 284, y: 172, width: 136 },
]

const widePaths: Record<string, string> = {
  'medium-out': 'M156 188 H188',
  'medium-in': 'M252 188 H284',
  'send-1': 'M88 60 V76',
  'send-2': 'M88 108 V124',
  'send-3': 'M88 156 V172',
  'send-4': 'M156 188 H188',
  'receive-1': 'M252 188 H284',
  'receive-2': 'M352 172 V156',
  'receive-3': 'M352 124 V108',
  'receive-4': 'M352 76 V60',
}

const wideNote = { id: 'medium-kind', x: 220, y: 218 }

// nodes에는 선명하게 둘 노드와 연결선을 함께 적는다. 보낼 때는 받는 쪽이, 받을 때는 보내는 쪽이 흐려진다.
export const layerJourneyScenarios: DiagramScenario[] = [
  {
    id: 'send',
    nodes: ['sender-1', 'sender-2', 'sender-3', 'sender-4', 'medium', 'medium-out'],
    paths: ['send-1', 'send-2', 'send-3', 'send-4'],
  },
  {
    id: 'receive',
    nodes: ['medium', 'receiver-1', 'receiver-2', 'receiver-3', 'receiver-4', 'medium-in'],
    paths: ['receive-1', 'receive-2', 'receive-3', 'receive-4'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LayerJourneyDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-layer-journey-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNote = wide ? wideNote : note

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={layerJourneyScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 224' : '0 0 280 296'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
          ))}

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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

          <text data-note={layoutNote.id} x={layoutNote.x} y={layoutNote.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf('medium')}>
            {text.notes![layoutNote.id]}
          </text>
        </svg>
      </div>
    </DiagramFrame>
  )
}
