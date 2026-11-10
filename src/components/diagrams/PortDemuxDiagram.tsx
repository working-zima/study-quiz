import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ports'].diagrams['port-demux']

// 세로형은 맨 위 박스에 도착한 데이터 둘을 나란히 두고, 그 아래 호스트 박스에 전송 계층과 프로그램 둘을 둔다.
// 데이터 노드는 목적지를 주소:포트로 적고, 프로그램이 쓰는 포트는 프로그램 아래 곁말로 적는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'data-1', x: 16, y: 28, width: 120 },
  { id: 'data-2', x: 144, y: 28, width: 120 },
  { id: 'transport', x: 100, y: 116, width: 80 },
  { id: 'browser', x: 16, y: 172, width: 120 },
  { id: 'mail', x: 144, y: 172, width: 120 },
]

const groups = [
  { id: 'arrivals', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 20 },
  { id: 'host', x: 8, y: 96, width: 264, height: 136, labelX: 16, labelY: 108 },
]

// 데이터는 호스트의 전송 계층까지 오고, 전송 계층이 목적지 포트를 보고 프로그램 하나에게 넘긴다.
const paths: Record<string, string> = {
  'in-1': 'M76 60 V88 H120 V116',
  'in-2': 'M204 60 V88 H160 V116',
  'to-browser': 'M120 148 V160 H76 V172',
  'to-mail': 'M160 148 V160 H204 V172',
}

// 프로그램의 포트 곁말은 그 프로그램의 흐림을 따른다.
const notes = [
  { id: 'browser-port', owner: 'browser', x: 76, y: 216, anchor: 'middle' as const },
  { id: 'mail-port', owner: 'mail', x: 204, y: 216, anchor: 'middle' as const },
]

// 가로형은 왼쪽 박스에 도착한 데이터 둘을 위아래로 두고, 오른쪽 호스트 박스에 전송 계층과 프로그램 둘을 놓는다.
const wideNodes = [
  { id: 'data-1', x: 16, y: 28, width: 120 },
  { id: 'data-2', x: 16, y: 92, width: 120 },
  { id: 'transport', x: 200, y: 60, width: 80 },
  { id: 'browser', x: 312, y: 28, width: 112 },
  { id: 'mail', x: 312, y: 92, width: 112 },
]

const wideGroups = [
  { id: 'arrivals', x: 8, y: 8, width: 136, height: 124, labelX: 16, labelY: 20 },
  { id: 'host', x: 184, y: 8, width: 248, height: 140, labelX: 192, labelY: 20 },
]

const widePaths: Record<string, string> = {
  'in-1': 'M136 44 H168 V68 H200',
  'in-2': 'M136 108 H168 V84 H200',
  'to-browser': 'M280 68 H296 V44 H312',
  'to-mail': 'M280 84 H296 V108 H312',
}

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'browser-port', x: 368, y: 72, anchor: 'middle' as const },
  { id: 'mail-port', x: 368, y: 136, anchor: 'middle' as const },
]

// IP 주소까지: 두 데이터가 전송 계층까지 오고 프로그램은 정해지지 않는다. 포트 50001·50002: 그 포트의 데이터가 그 포트를 쓰는 프로그램에게 간다.
export const portDemuxScenarios: DiagramScenario[] = [
  { id: 'ip-only', nodes: ['data-1', 'data-2', 'transport'], paths: ['in-1', 'in-2'] },
  { id: 'to-browser', nodes: ['data-1', 'transport', 'browser'], paths: ['in-1', 'to-browser'] },
  { id: 'to-mail', nodes: ['data-2', 'transport', 'mail'], paths: ['in-2', 'to-mail'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PortDemuxDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-port-demux-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={portDemuxScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 156' : '0 0 280 240'}>
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

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
