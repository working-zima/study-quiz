import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['name-server-roles']

// 세로형은 위 박스에 이름의 단계를 나눠 맡는 세 서버를 루트 → TLD → 권한 있는 서버 차례로 위에서 아래로 쌓고, 왼쪽의 선으로 위아래 단계를 잇는다.
// 그 아래에 클라이언트를 두고(서버가 아니라 박스 밖), 아래 박스에 로컬 DNS 서버를 둔다. 곁말은 자기 서버 바로 아래 줄에 놓인다.
const nodes = [
  { id: 'root', x: 32, y: 24, width: 216 },
  { id: 'tld', x: 32, y: 80, width: 216 },
  { id: 'auth', x: 32, y: 136, width: 216 },
  { id: 'client', x: 80, y: 208, width: 120 },
  { id: 'local', x: 32, y: 276, width: 216 },
]

const groups = [
  { id: 'layers', x: 2, y: 4, width: 276, height: 192, labelX: 10, labelY: 17 },
  { id: 'resolver', x: 2, y: 256, width: 276, height: 80, labelX: 10, labelY: 269 },
]

// 세 서버를 잇는 선(l-)은 늘 보이고 흐려지지 않는다. 클라이언트의 질의(ask-local)만 화살표다.
const paths: Record<string, string> = {
  'l-root-tld': 'M48 56 V80',
  'l-tld-auth': 'M48 112 V136',
  'ask-local': 'M140 240 V276',
}

const linkIds = ['l-root-tld', 'l-tld-auth']

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'root-note', x: 64, y: 72, anchor: 'start', scenarios: ['root'] },
  { id: 'tld-note', x: 64, y: 128, anchor: 'start', scenarios: ['tld'] },
  { id: 'auth-note', x: 64, y: 184, anchor: 'start', scenarios: ['authoritative'] },
  { id: 'local-note', x: 64, y: 324, anchor: 'start', scenarios: ['local'] },
]

// 가로형은 왼쪽 박스에 세 서버를 같은 차례로 쌓고, 오른쪽 위에 클라이언트를, 그 아래 박스에 로컬 DNS 서버를 둔다.
const wideNodes = [
  { id: 'root', x: 20, y: 28, width: 216 },
  { id: 'tld', x: 20, y: 84, width: 216 },
  { id: 'auth', x: 20, y: 140, width: 216 },
  { id: 'client', x: 340, y: 28, width: 80 },
  { id: 'local', x: 276, y: 100, width: 144 },
]

const wideGroups = [
  { id: 'layers', x: 8, y: 8, width: 240, height: 192, labelX: 16, labelY: 21 },
  { id: 'resolver', x: 264, y: 76, width: 168, height: 84, labelX: 272, labelY: 89 },
]

const widePaths: Record<string, string> = {
  'l-root-tld': 'M36 60 V84',
  'l-tld-auth': 'M36 116 V140',
  'ask-local': 'M380 60 V100',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'root-note', x: 48, y: 76, anchor: 'start' },
  { id: 'tld-note', x: 48, y: 132, anchor: 'start' },
  { id: 'auth-note', x: 48, y: 188, anchor: 'start' },
  { id: 'local-note', x: 276, y: 148, anchor: 'start' },
]

// 루트·TLD·권한 있는 서버는 저마다 맡은 단계만 밝힌다. 로컬 DNS 서버는 클라이언트의 질의를 받는 쪽이라 클라이언트와 함께 밝힌다.
export const nameServerRolesScenarios: DiagramScenario[] = [
  { id: 'root', nodes: ['root'], paths: [] },
  { id: 'tld', nodes: ['tld'], paths: [] },
  { id: 'authoritative', nodes: ['auth'], paths: [] },
  { id: 'local', nodes: ['client', 'local'], paths: ['ask-local'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NameServerRolesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-name-server-roles-arrow`
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
      scenarios={nameServerRolesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 340'}>
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

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" />
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
