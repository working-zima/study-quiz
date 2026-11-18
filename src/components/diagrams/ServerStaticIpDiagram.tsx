import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['server-static-ip']

// 세로형은 맨 위 가운데에 SRV01을 두고, 왼쪽 아래에 관리자가 넣은 고정 주소와 그 주소로 찾아오는 PC01을,
// 오른쪽 아래에 DHCP 서버와 /renew로 다시 받은 주소를 둔다. 두 길의 결과 노드는 서로 다른 자리에 있다. 노드는 모두 회색이다.
const nodes = [
  { id: 'server', x: 100, y: 8, width: 80 },
  { id: 'static-ip', x: 8, y: 72, width: 148 },
  { id: 'pc01', x: 8, y: 136, width: 64 },
  { id: 'dhcp-server', x: 184, y: 72, width: 88 },
  { id: 'renew-ip', x: 132, y: 136, width: 140 },
]

// set-static은 SRV01에 고정 주소를 넣는 쪽, pc-to-static은 PC01이 그 주소로 찾아오는 쪽,
// renew-request는 SRV01이 DHCP 서버에 다시 요청하는 쪽, renew-give는 DHCP 서버가 주소를 다시 주는 쪽이다.
const paths: Record<string, string> = {
  'set-static': 'M120 40 V72',
  'pc-to-static': 'M40 136 V104',
  'renew-request': 'M180 24 H228 V72',
  'renew-give': 'M228 104 V136',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만, 그 화살표 옆에 보인다.
const noteScenarios: Record<string, string> = {
  'set-note': 'static',
  'find-note': 'static',
  'request-note': 'renew',
  'give-note': 'renew',
}

const notes: Note[] = [
  { id: 'set-note', x: 116, y: 59, anchor: 'end' },
  { id: 'find-note', x: 48, y: 123, anchor: 'start' },
  { id: 'request-note', x: 188, y: 17, anchor: 'start' },
  { id: 'give-note', x: 232, y: 124, anchor: 'start' },
]

// 가로형은 PC01과 고정 주소를 한 줄에 두어 PC01의 화살표가 가로로 간다. DHCP 쪽은 오른쪽에 같은 차례로 둔다.
const wideNodes = [
  { id: 'server', x: 176, y: 8, width: 88 },
  { id: 'static-ip', x: 96, y: 72, width: 152 },
  { id: 'pc01', x: 8, y: 72, width: 64 },
  { id: 'dhcp-server', x: 304, y: 72, width: 96 },
  { id: 'renew-ip', x: 280, y: 136, width: 144 },
]

const widePaths: Record<string, string> = {
  'set-static': 'M200 40 V72',
  'pc-to-static': 'M72 88 H96',
  'renew-request': 'M264 24 H352 V72',
  'renew-give': 'M352 104 V136',
}

const wideNotes: Note[] = [
  { id: 'set-note', x: 194, y: 59, anchor: 'end' },
  { id: 'find-note', x: 8, y: 123, anchor: 'start' },
  { id: 'request-note', x: 272, y: 17, anchor: 'start' },
  { id: 'give-note', x: 358, y: 124, anchor: 'start' },
]

// 고정 주소: SRV01·고정 주소·PC01. ipconfig /renew: SRV01·DHCP 서버·DHCP 서버가 정한 주소.
export const serverStaticIpScenarios: DiagramScenario[] = [
  { id: 'static', nodes: ['server', 'static-ip', 'pc01'], paths: ['set-static', 'pc-to-static'] },
  { id: 'renew', nodes: ['server', 'dhcp-server', 'renew-ip'], paths: ['renew-request', 'renew-give'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ServerStaticIpDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-server-static-ip-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={serverStaticIpScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 176'}>
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
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
