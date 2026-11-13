import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-servers'].diagrams['resolv-conf']

// 위 박스는 /etc/resolv.conf의 예 세 줄을 위에서 아래로 적힌 차례대로 놓는다.
// 아래 박스는 짧은 이름 server1을 풀 때의 차례다. 위 줄에 server1 → server1.example.com을 두고,
// 그 아래 오른쪽에 첫째·둘째 DNS 서버를 위아래로 쌓는다. 둘째 서버로 가는 화살표는 첫째 서버의 왼쪽을 돌아간다.
const nodes = [
  { id: 'ns1', x: 12, y: 26, width: 160 },
  { id: 'ns2', x: 12, y: 64, width: 160 },
  { id: 'search', x: 12, y: 102, width: 160 },
  { id: 'short', x: 12, y: 178, width: 72 },
  { id: 'full', x: 124, y: 178, width: 140 },
  { id: 'dns1', x: 140, y: 242, width: 132 },
  { id: 'dns2', x: 140, y: 284, width: 132 },
]

const groups = [
  { id: 'file', x: 4, y: 4, width: 176, height: 140, labelX: 12, labelY: 17 },
  { id: 'lookup', x: 4, y: 156, width: 272, height: 168, labelX: 12, labelY: 169 },
]

const paths: Record<string, string> = {
  'add-domain': 'M84 194 H124',
  'ask-first': 'M200 210 V242',
  'ask-second': 'M130 210 V300 H140',
}

// 곁말은 자기 시나리오에서만 보인다. 서버에 붙는 곁말은 그 서버 노드의 왼쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'first', x: 124, y: 262, anchor: 'end', scenarios: ['servers'] },
  { id: 'second', x: 124, y: 304, anchor: 'end', scenarios: ['servers'] },
  { id: 'attach', x: 12, y: 226, anchor: 'start', scenarios: ['search'] },
  { id: 'no-answer', x: 124, y: 262, anchor: 'end', scenarios: ['fallback'] },
  { id: 'next', x: 124, y: 304, anchor: 'end', scenarios: ['fallback'] },
]

// 가로형은 파일 박스를 왼쪽에, 이름을 푸는 박스를 오른쪽에 둔다. 둘째 서버로 가는 화살표는 첫째 서버의 오른쪽을 돌아간다.
const wideNodes = [
  { id: 'ns1', x: 20, y: 30, width: 160 },
  { id: 'ns2', x: 20, y: 68, width: 160 },
  { id: 'search', x: 20, y: 106, width: 160 },
  { id: 'short', x: 212, y: 30, width: 60 },
  { id: 'full', x: 284, y: 30, width: 136 },
  { id: 'dns1', x: 284, y: 108, width: 136 },
  { id: 'dns2', x: 284, y: 172, width: 136 },
]

const wideGroups = [
  { id: 'file', x: 8, y: 8, width: 184, height: 140, labelX: 16, labelY: 22 },
  { id: 'lookup', x: 200, y: 8, width: 232, height: 224, labelX: 208, labelY: 22 },
]

const widePaths: Record<string, string> = {
  'add-domain': 'M272 46 H284',
  'ask-first': 'M352 62 V108',
  'ask-second': 'M420 46 H428 V188 H420',
}

// 곁말의 자리만 배치마다 다르다. 보이는 때는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'first', x: 352, y: 158, anchor: 'middle' },
  { id: 'second', x: 352, y: 220, anchor: 'middle' },
  { id: 'attach', x: 212, y: 80, anchor: 'start' },
  { id: 'no-answer', x: 352, y: 158, anchor: 'middle' },
  { id: 'next', x: 352, y: 220, anchor: 'middle' },
]

// 물을 서버: nameserver 두 줄과 그 주소의 DNS 서버 둘. 짧은 이름: search 줄의 도메인을 server1 뒤에 붙인다.
// 답이 없을 때: 붙여 만든 이름을 첫째 서버에 묻고, 답이 없으면 같은 이름을 둘째 서버에 묻는다.
export const resolvConfScenarios: DiagramScenario[] = [
  { id: 'servers', nodes: ['ns1', 'ns2', 'dns1', 'dns2'], paths: [] },
  { id: 'search', nodes: ['search', 'short', 'full'], paths: ['add-domain'] },
  { id: 'fallback', nodes: ['full', 'dns1', 'dns2'], paths: ['ask-first', 'ask-second'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ResolvConfDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-resolv-conf-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={resolvConfScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 240' : '0 0 280 332'}>
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

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
