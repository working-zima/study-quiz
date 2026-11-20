import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-devices'].diagrams['pxe-boot']

// 세로형은 맨 위 왼쪽에 DHCP 서버, 오른쪽에 부팅 서버 SRV01을 두고, 그 아래 가운데에 PC05를, 맨 아래에 「부팅 파일 실행」을 둔다.
// 세 단계가 서로 다른 상대 노드를 쓰도록 자리를 나눴다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc05', x: 104, y: 96, width: 72 },
  { id: 'dhcp', x: 8, y: 8, width: 80 },
  { id: 'srv01', x: 160, y: 8, width: 112 },
  { id: 'run', x: 88, y: 168, width: 104 },
]

// 1·2의 화살표는 PC05가 받는 것(주소와 부팅 정보, 부팅 파일)이 오는 쪽이고, 3의 화살표는 받은 파일을 실행하는 단계다.
const paths: Record<string, string> = {
  'dhcp-pc05': 'M48 40 V112 H104',
  'srv01-pc05': 'M256 40 V112 H176',
  'pc05-run': 'M140 128 V168',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 늘 보이는 곁말은 자기 노드를 따라 흐려진다 — 「네트워크 카드의 PXE」는 PC05 바로 위, SRV01의 주소는 SRV01 바로 아래다.
// 시나리오 곁말은 자기 시나리오를 골랐을 때만 맨 아래 가운데에 보인다.
const fixedNoteOwner: Record<string, string> = {
  'nic': 'pc05',
  'srv01-address': 'srv01',
}

const noteScenarios: Record<string, string> = {
  'dhcp-note': 'dhcp',
  'tftp-note': 'tftp',
  'run-note': 'run',
}

const fixedNotes: Note[] = [
  { id: 'nic', x: 140, y: 88, anchor: 'middle' },
  { id: 'srv01-address', x: 216, y: 54, anchor: 'middle' },
]

const notes: Note[] = [
  { id: 'dhcp-note', x: 140, y: 224, anchor: 'middle' },
  { id: 'tftp-note', x: 140, y: 224, anchor: 'middle' },
  { id: 'run-note', x: 140, y: 224, anchor: 'middle' },
]

// 가로형은 왼쪽 열에 DHCP 서버(위)와 부팅 서버 SRV01(아래)을, 가운데에 PC05를, 오른쪽에 「부팅 파일 실행」을 둔다.
const wideNodes = [
  { id: 'pc05', x: 192, y: 64, width: 72 },
  { id: 'dhcp', x: 16, y: 16, width: 80 },
  { id: 'srv01', x: 16, y: 112, width: 112 },
  { id: 'run', x: 320, y: 64, width: 104 },
]

const widePaths: Record<string, string> = {
  'dhcp-pc05': 'M96 32 H160 V72 H192',
  'srv01-pc05': 'M128 128 H160 V88 H192',
  'pc05-run': 'M264 80 H320',
}

const wideFixedNotes: Note[] = [
  { id: 'nic', x: 228, y: 56, anchor: 'middle' },
  { id: 'srv01-address', x: 72, y: 160, anchor: 'middle' },
]

const wideNotes: Note[] = [
  { id: 'dhcp-note', x: 290, y: 136, anchor: 'middle' },
  { id: 'tftp-note', x: 290, y: 136, anchor: 'middle' },
  { id: 'run-note', x: 290, y: 136, anchor: 'middle' },
]

// 1. 주소 받기: DHCP 서버가 PC05에 주소와 부팅 서버·부팅 파일 이름을 알려 준다. 2. 파일 받기: SRV01이 PC05에 부팅 파일을 TFTP로 보낸다.
// 3. 실행: PC05가 받은 부팅 파일을 실행한다.
export const pxeBootScenarios: DiagramScenario[] = [
  {
    id: 'dhcp',
    nodes: ['pc05', 'dhcp'],
    paths: ['dhcp-pc05'],
  },
  {
    id: 'tftp',
    nodes: ['pc05', 'srv01'],
    paths: ['srv01-pc05'],
  },
  {
    id: 'run',
    nodes: ['pc05', 'run'],
    paths: ['pc05-run'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PxeBootDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-pxe-boot-arrow`
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
      scenarios={pxeBootScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 236'}>
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
