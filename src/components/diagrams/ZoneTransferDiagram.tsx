import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['zone-transfer']

// 맨 위에 두 서버의 이름을 머리 노드로 두고, 그 아래 왼쪽에 보조 서버, 오른쪽에 주 서버 기둥(그룹 박스)을 세운다.
// 두 기둥 사이에는 메시지 하나를 노드 하나로 오가는 차례대로 위에서 아래로 놓는다. 방향은 노드 양옆의 짧은 화살표가 보인다.
// 일련번호 답은 시나리오마다 다른 노드로 다른 줄에 둔다 — 그대로일 때 100, 커졌을 때 101. 노드는 모두 회색이다.
const nodes = [
  { id: 'secondary', x: 8, y: 8, width: 128 },
  { id: 'primary', x: 144, y: 8, width: 128 },
  { id: 'ask', x: 72, y: 64, width: 136 },
  { id: 'serial-same', x: 72, y: 112, width: 136 },
  { id: 'serial-changed', x: 72, y: 176, width: 136 },
  { id: 'transfer', x: 72, y: 240, width: 136 },
]

const groups = [
  { id: 'secondary-side', x: 8, y: 48, width: 52, height: 252, labelX: 12, labelY: 60 },
  { id: 'primary-side', x: 220, y: 48, width: 52, height: 252, labelX: 224, labelY: 60 },
]

const paths: Record<string, string> = {
  'ask-out': 'M60 80 H72',
  'ask-in': 'M208 80 H220',
  'same-out': 'M220 128 H208',
  'same-in': 'M72 128 H60',
  'changed-out': 'M220 192 H208',
  'changed-in': 'M72 192 H60',
  'transfer-out': 'M220 256 H208',
  'transfer-in': 'M72 256 H60',
}

// 곁말은 자기 시나리오에서만 보이고, 자기 메시지 노드 바로 아래 두 기둥 사이에 놓인다.
const notes = [
  { id: 'same-note', x: 140, y: 160, scenarios: ['same'] },
  { id: 'changed-note', x: 140, y: 224, scenarios: ['changed'] },
  { id: 'transfer-note', x: 140, y: 288, scenarios: ['changed'] },
]

// 가로형도 같은 꼴로 폭만 넓힌다. 기둥과 메시지 노드가 넓어지고 화살표가 길어진다.
const wideNodes = [
  { id: 'secondary', x: 8, y: 8, width: 128 },
  { id: 'primary', x: 304, y: 8, width: 128 },
  { id: 'ask', x: 140, y: 64, width: 160 },
  { id: 'serial-same', x: 140, y: 112, width: 160 },
  { id: 'serial-changed', x: 140, y: 176, width: 160 },
  { id: 'transfer', x: 140, y: 240, width: 160 },
]

const wideGroups = [
  { id: 'secondary-side', x: 8, y: 48, width: 88, height: 252, labelX: 16, labelY: 60 },
  { id: 'primary-side', x: 344, y: 48, width: 88, height: 252, labelX: 352, labelY: 60 },
]

const widePaths: Record<string, string> = {
  'ask-out': 'M96 80 H140',
  'ask-in': 'M300 80 H344',
  'same-out': 'M344 128 H300',
  'same-in': 'M140 128 H96',
  'changed-out': 'M344 192 H300',
  'changed-in': 'M140 192 H96',
  'transfer-out': 'M344 256 H300',
  'transfer-in': 'M140 256 H96',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'same-note', x: 220, y: 160 },
  { id: 'changed-note', x: 220, y: 224 },
  { id: 'transfer-note', x: 220, y: 288 },
]

// 그대로: 보조 서버가 일련번호를 묻고 주 서버가 100을 답한다 — 사본과 같아 영역 전송이 없다.
// 바뀜: 같은 물음에 주 서버가 101을 답하고, 사본보다 커서 주 서버에서 보조 서버로 영역 전송이 온다. 머리 노드 둘은 두 시나리오 모두 선명하다.
export const zoneTransferScenarios: DiagramScenario[] = [
  { id: 'same', nodes: ['secondary', 'primary', 'ask', 'serial-same'], paths: ['ask-out', 'ask-in', 'same-out', 'same-in'] },
  {
    id: 'changed',
    nodes: ['secondary', 'primary', 'ask', 'serial-changed', 'transfer'],
    paths: ['ask-out', 'ask-in', 'changed-out', 'changed-in', 'transfer-out', 'transfer-in'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ZoneTransferDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-zone-transfer-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={zoneTransferScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 308' : '0 0 280 308'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
