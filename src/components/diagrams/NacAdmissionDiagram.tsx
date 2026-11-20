import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-security'].diagrams['nac-admission']

// 세로형은 맨 위 가운데에 노트북 LAPTOP03, 그 아래에 스위치 SW01, 맨 아래 왼쪽에 인증 서버 AUTH01, 오른쪽에 사내 네트워크를 둔다.
// LAPTOP03과 SW01 사이의 두 선은 같은 포트로 오가는 인증 메시지(왼쪽)와 데이터(오른쪽)를 따로 그린 것이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'laptop03', x: 96, y: 16, width: 88 },
  { id: 'sw01', x: 96, y: 96, width: 88 },
  { id: 'auth01', x: 16, y: 176, width: 88 },
  { id: 'internal', x: 152, y: 176, width: 112 },
]

const paths: Record<string, string> = {
  'auth-laptop': 'M124 48 V96',
  'data-laptop': 'M156 48 V96',
  'auth-sw01': 'M112 128 V152 H60 V176',
  'data-sw01': 'M168 128 V152 H208 V176',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 역할 곁말(신청자·인증자·인증 서버)은 늘 보이고 자기 노드를 따라 흐려진다. 시나리오 곁말은 자기 시나리오를 골랐을 때만 맨 아래 가운데에 보인다.
const fixedNoteOwner: Record<string, string> = {
  'supplicant': 'laptop03',
  'authenticator': 'sw01',
  'auth-server': 'auth01',
}

const noteScenarios: Record<string, string> = {
  'before-note': 'before',
  'after-note': 'after',
}

const fixedNotes: Note[] = [
  { id: 'supplicant', x: 192, y: 36, anchor: 'start' },
  { id: 'authenticator', x: 192, y: 116, anchor: 'start' },
  { id: 'auth-server', x: 60, y: 222, anchor: 'middle' },
]

const notes: Note[] = [
  { id: 'before-note', x: 140, y: 244, anchor: 'middle' },
  { id: 'after-note', x: 140, y: 244, anchor: 'middle' },
]

// 가로형은 왼쪽에 LAPTOP03, 가운데에 SW01, 오른쪽 위에 AUTH01, 오른쪽 아래에 사내 네트워크를 둔다.
// 역할 곁말은 각 노드 아래에, 시나리오 곁말은 SW01 아래에 둔다.
const wideNodes = [
  { id: 'laptop03', x: 16, y: 56, width: 88 },
  { id: 'sw01', x: 176, y: 56, width: 80 },
  { id: 'auth01', x: 320, y: 16, width: 104 },
  { id: 'internal', x: 312, y: 96, width: 120 },
]

const widePaths: Record<string, string> = {
  'auth-laptop': 'M104 66 H176',
  'data-laptop': 'M104 78 H176',
  'auth-sw01': 'M256 64 H288 V32 H320',
  'data-sw01': 'M256 80 H288 V112 H312',
}

const wideFixedNotes: Note[] = [
  { id: 'supplicant', x: 60, y: 104, anchor: 'middle' },
  { id: 'authenticator', x: 216, y: 104, anchor: 'middle' },
  { id: 'auth-server', x: 372, y: 62, anchor: 'middle' },
]

const wideNotes: Note[] = [
  { id: 'before-note', x: 216, y: 136, anchor: 'middle' },
  { id: 'after-note', x: 216, y: 136, anchor: 'middle' },
]

// 인증 전: LAPTOP03이 보낸 인증 메시지가 SW01을 거쳐 AUTH01로 가고, 사내 네트워크는 흐려진다.
// 인증 뒤: LAPTOP03의 데이터가 SW01을 거쳐 사내 네트워크로 가고, AUTH01은 흐려진다.
export const nacAdmissionScenarios: DiagramScenario[] = [
  {
    id: 'before',
    nodes: ['laptop03', 'sw01', 'auth01'],
    paths: ['auth-laptop', 'auth-sw01'],
  },
  {
    id: 'after',
    nodes: ['laptop03', 'sw01', 'internal'],
    paths: ['data-laptop', 'data-sw01'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NacAdmissionDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-nac-admission-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutFixedNotes = wide ? wideFixedNotes : fixedNotes
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={nacAdmissionScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 256'}>
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

          {layoutFixedNotes.map((note) => (
            <text key={note.id} data-fixed-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(fixedNoteOwner[note.id])}>
              {text.notes![note.id]}
            </text>
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
