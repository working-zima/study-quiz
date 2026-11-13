import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['hosts-file']

// 위 박스는 /etc/hosts의 예 한 줄을 칸 셋(IP 주소 · 정식 이름 · 별명)으로 끊어 왼쪽부터 빈틈없이 잇고, 칸마다 아래에 칸 이름을 단다.
// 아래 박스는 hosts 파일을 먼저 보는 차례다. 세로형은 찾는 이름 둘을 한 줄에 두고, 그 아래 왼쪽에 /etc/hosts 보기, 오른쪽에 DNS 서버에 묻기를 둔다.
const nodes = [
  { id: 'addr', x: 6, y: 24, width: 76 },
  { id: 'canonical', x: 82, y: 24, width: 134 },
  { id: 'alias', x: 216, y: 24, width: 58 },
  { id: 'find-listed', x: 12, y: 112, width: 104 },
  { id: 'find-unlisted', x: 128, y: 112, width: 144 },
  { id: 'look-hosts', x: 12, y: 176, width: 116 },
  { id: 'ask-dns', x: 156, y: 176, width: 116 },
]

const groups = [
  { id: 'line', x: 2, y: 4, width: 276, height: 76, labelX: 10, labelY: 17 },
  { id: 'order', x: 2, y: 92, width: 276, height: 140, labelX: 10, labelY: 105 },
]

const paths: Record<string, string> = {
  'listed-to-hosts': 'M58 144 V176',
  'unlisted-to-hosts': 'M160 144 V160 H100 V176',
  'hosts-to-dns': 'M128 192 H156',
}

// 칸 이름 곁말(field)은 늘 보이고 자기 칸 노드의 opacity를 따른다. 결과 곁말은 자기 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', field?: string, scenarios: string[] }[] = [
  { id: 'addr-name', x: 44, y: 70, anchor: 'middle', field: 'addr', scenarios: [] },
  { id: 'canonical-name', x: 149, y: 70, anchor: 'middle', field: 'canonical', scenarios: [] },
  { id: 'alias-name', x: 245, y: 70, anchor: 'middle', field: 'alias', scenarios: [] },
  { id: 'listed-result', x: 12, y: 224, anchor: 'start', scenarios: ['listed'] },
  { id: 'unlisted-result', x: 214, y: 224, anchor: 'middle', scenarios: ['unlisted'] },
]

// 가로형은 칸 셋을 넓게 잇고, 아래 박스는 찾는 이름 둘을 왼쪽에 위아래로 두어 왼쪽에서 오른쪽으로 /etc/hosts 보기 → DNS 서버에 묻기로 흐른다.
const wideNodes = [
  { id: 'addr', x: 16, y: 30, width: 100 },
  { id: 'canonical', x: 116, y: 30, width: 200 },
  { id: 'alias', x: 316, y: 30, width: 108 },
  { id: 'find-listed', x: 16, y: 116, width: 148 },
  { id: 'find-unlisted', x: 16, y: 156, width: 148 },
  { id: 'look-hosts', x: 188, y: 136, width: 116 },
  { id: 'ask-dns', x: 316, y: 136, width: 108 },
]

const wideGroups = [
  { id: 'line', x: 8, y: 8, width: 424, height: 76, labelX: 16, labelY: 22 },
  { id: 'order', x: 8, y: 96, width: 424, height: 104, labelX: 16, labelY: 110 },
]

const widePaths: Record<string, string> = {
  'listed-to-hosts': 'M164 132 H176 V144 H188',
  'unlisted-to-hosts': 'M164 172 H176 V160 H188',
  'hosts-to-dns': 'M304 152 H316',
}

// 곁말의 자리만 배치마다 다르다. 보이는 때는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'addr-name', x: 66, y: 76, anchor: 'middle' },
  { id: 'canonical-name', x: 216, y: 76, anchor: 'middle' },
  { id: 'alias-name', x: 370, y: 76, anchor: 'middle' },
  { id: 'listed-result', x: 188, y: 186, anchor: 'start' },
  { id: 'unlisted-result', x: 370, y: 186, anchor: 'middle' },
]

// 줄의 칸: 칸 셋. 적힌 이름: server1이 줄에 있어 /etc/hosts에서 짝을 얻고 DNS 서버에 묻지 않는다.
// 없는 이름: www.example.com이 줄에 없어 /etc/hosts를 본 뒤 DNS 서버에 묻는다.
export const hostsFileScenarios: DiagramScenario[] = [
  { id: 'fields', nodes: ['addr', 'canonical', 'alias'], paths: [] },
  { id: 'listed', nodes: ['addr', 'canonical', 'alias', 'find-listed', 'look-hosts'], paths: ['listed-to-hosts'] },
  { id: 'unlisted', nodes: ['find-unlisted', 'look-hosts', 'ask-dns'], paths: ['unlisted-to-hosts', 'hosts-to-dns'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HostsFileDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-hosts-file-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.field !== undefined || (active !== null && note.scenarios.includes(active.id)))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={hostsFileScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 240'}>
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
            <text
              key={note.id}
              data-note={note.id}
              x={note.x}
              y={note.y}
              textAnchor={note.anchor}
              opacity={note.field === undefined ? undefined : opacityOf(note.field)}
              className="fill-muted"
              fontSize="9"
            >
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
