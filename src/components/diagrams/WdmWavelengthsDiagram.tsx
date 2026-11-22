import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['transmission-media'].diagrams['wdm-wavelengths']

// 세로형은 맨 위 보내는 쪽 박스에 λ1~λ4를, 그 아래 왼쪽 열에 다중화기 → 광섬유 → 광 증폭기 → 광섬유 → 역다중화기를 위에서 아래로, 맨 아래 받는 쪽 박스에 λ1~λ4를 둔다.
// 가운데 열을 왼쪽에 붙여, 오른쪽 빈자리에 곁말을 노드 곁에 둔다. 받는 쪽 박스의 라벨은 화살표가 들어오는 위쪽을 피해 아래에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'tx1', x: 20, y: 28, width: 48 },
  { id: 'tx2', x: 84, y: 28, width: 48 },
  { id: 'tx3', x: 148, y: 28, width: 48 },
  { id: 'tx4', x: 212, y: 28, width: 48 },
  { id: 'mux', x: 16, y: 108, width: 80 },
  { id: 'fiber1', x: 16, y: 164, width: 80 },
  { id: 'amp', x: 16, y: 220, width: 80 },
  { id: 'fiber2', x: 16, y: 276, width: 80 },
  { id: 'demux', x: 16, y: 332, width: 80 },
  { id: 'rx1', x: 20, y: 412, width: 48 },
  { id: 'rx2', x: 84, y: 412, width: 48 },
  { id: 'rx3', x: 148, y: 412, width: 48 },
  { id: 'rx4', x: 212, y: 412, width: 48 },
]

const groups = [
  { id: 'tx', x: 8, y: 8, width: 264, height: 60, labelX: 16, labelY: 21 },
  { id: 'rx', x: 8, y: 404, width: 264, height: 60, labelX: 16, labelY: 456 },
]

const paths: Record<string, string> = {
  'tx1-mux': 'M44 60 V76 H32 V108',
  'tx2-mux': 'M108 60 V84 H48 V108',
  'tx3-mux': 'M172 60 V92 H64 V108',
  'tx4-mux': 'M236 60 V100 H80 V108',
  'mux-fiber1': 'M56 140 V164',
  'fiber1-amp': 'M56 196 V220',
  'amp-fiber2': 'M56 252 V276',
  'fiber2-demux': 'M56 308 V332',
  'demux-rx1': 'M32 364 V396 H44 V412',
  'demux-rx2': 'M48 364 V388 H108 V412',
  'demux-rx3': 'M64 364 V380 H172 V412',
  'demux-rx4': 'M80 364 V372 H236 V412',
}

// 빛이 지나는 길은 늘 보인다. 시나리오는 그 차례의 노드와 곁말로 가른다.
const linkIds = Object.keys(paths)

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 세로형에서는 그 차례의 노드 오른쪽에 둔다.
const noteScenarios: Record<string, string> = {
  'combine-note': 'combine',
  'amplify-note': 'amplify',
  'split-note': 'split',
}

const notes: Note[] = [
  { id: 'combine-note', x: 108, y: 184, anchor: 'start' },
  { id: 'amplify-note', x: 108, y: 240, anchor: 'start' },
  { id: 'split-note', x: 108, y: 352, anchor: 'start' },
]

// 가로형은 왼쪽 위 보내는 쪽 박스에 λ1~λ4를 나란히 두고, 그 아래 한 줄에 다중화기 → 광섬유 → 광 증폭기 → 광섬유 → 역다중화기를 왼쪽에서 오른쪽으로,
// 오른쪽 아래 받는 쪽 박스에 λ1~λ4를 둔다. 곁말은 광섬유와 광 증폭기 아래의 빈자리를 함께 쓴다.
const wideNodes = [
  { id: 'tx1', x: 16, y: 28, width: 40 },
  { id: 'tx2', x: 64, y: 28, width: 40 },
  { id: 'tx3', x: 112, y: 28, width: 40 },
  { id: 'tx4', x: 160, y: 28, width: 40 },
  { id: 'mux', x: 8, y: 112, width: 72 },
  { id: 'fiber1', x: 96, y: 112, width: 56 },
  { id: 'amp', x: 168, y: 112, width: 72 },
  { id: 'fiber2', x: 256, y: 112, width: 56 },
  { id: 'demux', x: 328, y: 112, width: 80 },
  { id: 'rx1', x: 244, y: 180, width: 40 },
  { id: 'rx2', x: 292, y: 180, width: 40 },
  { id: 'rx3', x: 340, y: 180, width: 40 },
  { id: 'rx4', x: 388, y: 180, width: 40 },
]

const wideGroups = [
  { id: 'tx', x: 8, y: 8, width: 200, height: 60, labelX: 16, labelY: 21 },
  { id: 'rx', x: 236, y: 172, width: 200, height: 64, labelX: 244, labelY: 228 },
]

const widePaths: Record<string, string> = {
  'tx1-mux': 'M36 60 V76 H24 V112',
  'tx2-mux': 'M84 60 V84 H40 V112',
  'tx3-mux': 'M132 60 V92 H56 V112',
  'tx4-mux': 'M180 60 V100 H72 V112',
  'mux-fiber1': 'M80 128 H96',
  'fiber1-amp': 'M152 128 H168',
  'amp-fiber2': 'M240 128 H256',
  'fiber2-demux': 'M312 128 H328',
  'demux-rx1': 'M344 144 V152 H264 V180',
  'demux-rx2': 'M352 144 V160 H312 V180',
  'demux-rx3': 'M360 144 V180',
  'demux-rx4': 'M376 144 V160 H408 V180',
}

const wideNotes: Note[] = [
  { id: 'combine-note', x: 120, y: 168, anchor: 'middle' },
  { id: 'amplify-note', x: 120, y: 168, anchor: 'middle' },
  { id: 'split-note', x: 120, y: 168, anchor: 'middle' },
]

// 한 가닥에 싣기: λ1~λ4를 다중화기가 광섬유 한 가닥에 싣는다. 빛인 채로 키우기: 광 증폭기가 넷을 함께 키운다. 다시 나누기: 역다중화기가 파장마다 나눈다.
export const wdmWavelengthsScenarios: DiagramScenario[] = [
  {
    id: 'combine',
    nodes: ['tx1', 'tx2', 'tx3', 'tx4', 'mux', 'fiber1'],
    paths: [],
  },
  {
    id: 'amplify',
    nodes: ['fiber1', 'amp', 'fiber2'],
    paths: [],
  },
  {
    id: 'split',
    nodes: ['fiber2', 'demux', 'rx1', 'rx2', 'rx3', 'rx4'],
    paths: [],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function WdmWavelengthsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-wdm-wavelengths-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={wdmWavelengthsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 244' : '0 0 280 472'}>
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
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
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
