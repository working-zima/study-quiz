import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['arp'].diagrams['arp-hops']

// 호스트 A·라우터 1·라우터 2·호스트 E를 왼쪽에 위에서 아래로 잇는다. 고른 구간의 글은 오른쪽 같은 자리에 둬서,
// 구간을 바꿔 가며 볼 때 바뀌는 줄(ARP로 묻는 IP 주소·MAC 주소)과 그대로인 줄(IP 주소)이 한눈에 갈리게 한다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-a', x: 10, y: 8, width: 76 },
  { id: 'router-1', x: 10, y: 72, width: 76 },
  { id: 'router-2', x: 10, y: 136, width: 76 },
  { id: 'host-e', x: 10, y: 200, width: 76 },
]

// 연결 셋은 늘 보이고, 고른 구간의 화살표를 그 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'link-1': 'M48 40 V72',
  'link-2': 'M48 104 V136',
  'link-3': 'M48 168 V200',
  'hop-1': 'M48 40 V72',
  'hop-2': 'M48 104 V136',
  'hop-3': 'M48 168 V200',
}

const linkIds = ['link-1', 'link-2', 'link-3']

// 구간마다 다른 글(묻는 IP 주소, 출발지·목적지 MAC 주소)은 같은 자리를 함께 쓴다. IP 주소 두 줄은 세 구간이 같은 곁말이다.
const notes = [
  { id: 'ask-1', x: 94, y: 84, scenarios: ['hop-1'] },
  { id: 'src-mac-1', x: 94, y: 104, scenarios: ['hop-1'] },
  { id: 'dst-mac-1', x: 94, y: 120, scenarios: ['hop-1'] },
  { id: 'ask-2', x: 94, y: 84, scenarios: ['hop-2'] },
  { id: 'src-mac-2', x: 94, y: 104, scenarios: ['hop-2'] },
  { id: 'dst-mac-2', x: 94, y: 120, scenarios: ['hop-2'] },
  { id: 'ask-3', x: 94, y: 84, scenarios: ['hop-3'] },
  { id: 'src-mac-3', x: 94, y: 104, scenarios: ['hop-3'] },
  { id: 'dst-mac-3', x: 94, y: 120, scenarios: ['hop-3'] },
  { id: 'src-ip', x: 94, y: 144, scenarios: ['hop-1', 'hop-2', 'hop-3'] },
  { id: 'dst-ip', x: 94, y: 160, scenarios: ['hop-1', 'hop-2', 'hop-3'] },
]

// 가로형은 네 장치를 한 줄로 잇고, 글은 그 아래 두 열로 둔다 — 왼쪽 열은 구간마다 바뀌는 줄, 오른쪽 열은 IP 주소다.
const wideNodes = [
  { id: 'host-a', x: 14, y: 8, width: 80 },
  { id: 'router-1', x: 125, y: 8, width: 80 },
  { id: 'router-2', x: 236, y: 8, width: 80 },
  { id: 'host-e', x: 346, y: 8, width: 80 },
]

const widePaths: Record<string, string> = {
  'link-1': 'M94 24 H125',
  'link-2': 'M205 24 H236',
  'link-3': 'M316 24 H346',
  'hop-1': 'M94 24 H125',
  'hop-2': 'M205 24 H236',
  'hop-3': 'M316 24 H346',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'ask-1', x: 14, y: 60 },
  { id: 'src-mac-1', x: 14, y: 76 },
  { id: 'dst-mac-1', x: 14, y: 92 },
  { id: 'ask-2', x: 14, y: 60 },
  { id: 'src-mac-2', x: 14, y: 76 },
  { id: 'dst-mac-2', x: 14, y: 92 },
  { id: 'ask-3', x: 14, y: 60 },
  { id: 'src-mac-3', x: 14, y: 76 },
  { id: 'dst-mac-3', x: 14, y: 92 },
  { id: 'src-ip', x: 240, y: 76 },
  { id: 'dst-ip', x: 240, y: 92 },
]

// nodes에는 선명하게 둘 노드와 연결을 함께 적는다. 구간마다 그 구간의 두 장치와 연결만 선명하다.
export const arpHopsScenarios: DiagramScenario[] = [
  { id: 'hop-1', nodes: ['host-a', 'router-1', 'link-1'], paths: ['hop-1'] },
  { id: 'hop-2', nodes: ['router-1', 'router-2', 'link-2'], paths: ['hop-2'] },
  { id: 'hop-3', nodes: ['router-2', 'host-e', 'link-3'], paths: ['hop-3'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ArpHopsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-arp-hops-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={arpHopsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 104' : '0 0 280 240'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="start" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
