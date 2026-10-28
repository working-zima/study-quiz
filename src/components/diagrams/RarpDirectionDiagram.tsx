import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['arp'].diagrams['rarp-direction']

// 위 묶음이 ARP, 아래 묶음이 RARP다. 두 묶음 모두 IP 주소를 왼쪽, MAC 주소를 오른쪽에 두어 화살표의 방향이 반대인 것이 보이게 한다.
// RARP 서버는 RARP 묶음 아래 가운데에 둔다. 묶음 상자와 라벨은 늘 보이고 흐려지지 않는다. 노드는 모두 회색이다.
const groups = [
  { id: 'arp', x: 8, y: 8, width: 264, height: 76 },
  { id: 'rarp', x: 8, y: 100, width: 264, height: 132 },
]

const nodes = [
  { id: 'arp-ip', x: 20, y: 46, width: 96 },
  { id: 'arp-mac', x: 164, y: 46, width: 96 },
  { id: 'rarp-ip', x: 20, y: 138, width: 96 },
  { id: 'rarp-mac', x: 164, y: 138, width: 96 },
  { id: 'rarp-server', x: 92, y: 184, width: 96 },
]

// ARP는 IP 주소에서 MAC 주소로 곧게 간다. RARP는 자기 MAC 주소에서 서버로 내려가 묻고, 서버에서 자기 IP 주소로 올라가 답을 받는다.
const paths: Record<string, string> = {
  'arp-find': 'M116 62 H164',
  'rarp-ask': 'M212 170 V200 H188',
  'rarp-answer': 'M92 200 H68 V170',
}

// 아는 것·알아내는 것 곁말은 늘 보이고 자기 노드 바로 위 가운데에 놓여 그 노드의 흐림을 따른다.
const sideNotes = [
  { id: 'arp-known', node: 'arp-ip', x: 68, y: 40 },
  { id: 'arp-found', node: 'arp-mac', x: 212, y: 40 },
  { id: 'rarp-found', node: 'rarp-ip', x: 68, y: 132 },
  { id: 'rarp-known', node: 'rarp-mac', x: 212, y: 132 },
]

// 가로형은 RARP 서버를 RARP 묶음 가운데 줄에 넣어, 자기 MAC 주소 → 서버 → 자기 IP 주소가 한 줄로 이어진다.
const wideGroups = [
  { id: 'arp', x: 8, y: 8, width: 424, height: 72 },
  { id: 'rarp', x: 8, y: 96, width: 424, height: 72 },
]

const wideNodes = [
  { id: 'arp-ip', x: 24, y: 40, width: 112 },
  { id: 'arp-mac', x: 304, y: 40, width: 112 },
  { id: 'rarp-ip', x: 24, y: 128, width: 112 },
  { id: 'rarp-mac', x: 304, y: 128, width: 112 },
  { id: 'rarp-server', x: 164, y: 128, width: 112 },
]

const widePaths: Record<string, string> = {
  'arp-find': 'M136 56 H304',
  'rarp-ask': 'M304 144 H276',
  'rarp-answer': 'M164 144 H136',
}

const wideSideNotes = [
  { id: 'arp-known', x: 80, y: 34 },
  { id: 'arp-found', x: 360, y: 34 },
  { id: 'rarp-found', x: 80, y: 122 },
  { id: 'rarp-known', x: 360, y: 122 },
]

export const rarpDirectionScenarios: DiagramScenario[] = [
  { id: 'arp', nodes: ['arp-ip', 'arp-mac'], paths: ['arp-find'] },
  { id: 'rarp', nodes: ['rarp-ip', 'rarp-mac', 'rarp-server'], paths: ['rarp-ask', 'rarp-answer'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RarpDirectionDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-rarp-direction-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutSideNotes = wide ? wideSideNotes.map((note) => ({ ...sideNotes.find(({ id }) => id === note.id)!, ...note })) : sideNotes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={rarpDirectionScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 240'}>
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

          {layoutSideNotes.map((note) => (
            <text key={note.id} data-side-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf(note.node)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
