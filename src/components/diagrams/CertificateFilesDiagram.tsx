import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-admin-tools'].diagrams['certificate-files']

// 맨 위 인증서 관리자 박스 안에 user01의 인증서와 개인 키를 나란히 두고, 그 아래 왼쪽 박스 안에 공개 인증서만 담는 형식 셋을,
// 박스 밖 오른쪽에 .pfx를 둔다. 인증서의 화살표는 형식 박스의 위 변에 닿고, 개인 키의 화살표는 .pfx에만 닿는다.
const nodes = [
  { id: 'cert', x: 20, y: 30, width: 120 },
  { id: 'key', x: 156, y: 30, width: 112 },
  { id: 'cer', x: 20, y: 120, width: 56 },
  { id: 'p7b', x: 20, y: 160, width: 56 },
  { id: 'sst', x: 20, y: 200, width: 56 },
  { id: 'pfx', x: 188, y: 116, width: 72 },
]

const groups = [
  { id: 'manager', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 21 },
  { id: 'public', x: 8, y: 96, width: 168, height: 152, labelX: 16, labelY: 109 },
]

const paths: Record<string, string> = {
  'cert-public': 'M70 62 V96',
  'cert-pfx': 'M124 62 V84 H196 V116',
  'key-pfx': 'M220 62 V116',
}

// 형식 셋의 곁말은 노드 오른쪽 박스 안에, .pfx의 곁말 둘은 .pfx 아래 박스 밖에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'cer-note', x: 84, y: 140, anchor: 'start', scenarios: ['cert-only'] },
  { id: 'p7b-note', x: 84, y: 180, anchor: 'start', scenarios: ['cert-only'] },
  { id: 'sst-note', x: 84, y: 220, anchor: 'start', scenarios: ['cert-only'] },
  { id: 'pfx-note', x: 226, y: 164, anchor: 'middle', scenarios: ['with-key'] },
  { id: 'password-note', x: 226, y: 178, anchor: 'middle', scenarios: ['with-key'] },
]

// 가로형은 왼쪽 인증서 관리자 박스 안에 인증서와 개인 키를 위아래로 두고, 오른쪽 박스 안에 형식 셋을 위아래로 둔다.
// .pfx는 형식 박스 아래 박스 밖에 두고, 두 화살표가 박스 사이와 아래를 지나 .pfx에 닿는다.
const wideNodes = [
  { id: 'cert', x: 20, y: 30, width: 120 },
  { id: 'key', x: 20, y: 84, width: 120 },
  { id: 'cer', x: 212, y: 36, width: 56 },
  { id: 'p7b', x: 212, y: 76, width: 56 },
  { id: 'sst', x: 212, y: 116, width: 56 },
  { id: 'pfx', x: 216, y: 176, width: 72 },
]

const wideGroups = [
  { id: 'manager', x: 8, y: 8, width: 144, height: 120, labelX: 16, labelY: 21 },
  { id: 'public', x: 200, y: 8, width: 232, height: 148, labelX: 208, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'cert-public': 'M140 46 H200',
  'cert-pfx': 'M140 56 H168 V164 H232 V176',
  'key-pfx': 'M78 116 V192 H216',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'cer-note', x: 276, y: 56, anchor: 'start' },
  { id: 'p7b-note', x: 276, y: 96, anchor: 'start' },
  { id: 'sst-note', x: 276, y: 136, anchor: 'start' },
  { id: 'pfx-note', x: 296, y: 190, anchor: 'start' },
  { id: 'password-note', x: 296, y: 204, anchor: 'start' },
]

// 인증서만: 공개 인증서만 담는 세 형식. 개인 키까지: 인증서와 개인 키를 함께 담는 .pfx.
export const certificateFilesScenarios: DiagramScenario[] = [
  { id: 'cert-only', nodes: ['cert', 'cer', 'p7b', 'sst'], paths: ['cert-public'] },
  { id: 'with-key', nodes: ['cert', 'key', 'pfx'], paths: ['cert-pfx', 'key-pfx'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CertificateFilesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-certificate-files-arrow`
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
      scenarios={certificateFilesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 220' : '0 0 280 256'}>
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
