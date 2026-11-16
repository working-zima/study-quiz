import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-admin-tools'].diagrams['bitlocker-volume']

// 맨 위 서버 박스 안에 TPM과 운영 체제 드라이브를 나란히, 운영 체제 드라이브 아래에 D:를 둔다. 그 아래 왼쪽 다른 컴퓨터 박스 안에
// 옮겨 붙인 D:를, 오른쪽 두 박스 밖에 복구 암호를, 맨 아래에 견줄 EFS로 암호화한 파일을 둔다.
const nodes = [
  { id: 'tpm', x: 20, y: 32, width: 48 },
  { id: 'os', x: 100, y: 32, width: 120 },
  { id: 'd', x: 136, y: 80, width: 48 },
  { id: 'moved', x: 20, y: 160, width: 88 },
  { id: 'recovery', x: 160, y: 160, width: 72 },
  { id: 'efs', x: 20, y: 232, width: 128 },
]

const groups = [
  { id: 'server', x: 8, y: 8, width: 264, height: 112, labelX: 16, labelY: 21 },
  { id: 'other', x: 8, y: 136, width: 112, height: 80, labelX: 16, labelY: 149 },
]

const paths: Record<string, string> = {
  'tpm-os': 'M68 48 H100',
  'os-d': 'M160 64 V80',
  'recovery-moved': 'M160 176 H108',
}

// 곁말은 저마다 설명하는 노드 곁에 놓인다. 「저절로 열린다」와 「볼륨 전체」는 시나리오가 달라 같은 자리를 쓴다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'key-note', x: 20, y: 80, anchor: 'start', scenarios: ['normal'] },
  { id: 'auto-note', x: 192, y: 100, anchor: 'start', scenarios: ['normal'] },
  { id: 'locked-note', x: 64, y: 204, anchor: 'middle', scenarios: ['stolen'] },
  { id: 'digits-note', x: 196, y: 204, anchor: 'middle', scenarios: ['recovery'] },
  { id: 'volume-note', x: 192, y: 100, anchor: 'start', scenarios: ['vs-efs'] },
  { id: 'file-note', x: 84, y: 276, anchor: 'middle', scenarios: ['vs-efs'] },
]

// 가로형은 서버 박스와 다른 컴퓨터 박스를 위에 나란히 두고, 그 아래 왼쪽에 EFS로 암호화한 파일을, 오른쪽에 복구 암호를 둔다.
// 복구 암호의 화살표는 위로 올라가 옮겨 붙인 D:에 닿는다.
const wideNodes = [
  { id: 'tpm', x: 20, y: 32, width: 48 },
  { id: 'os', x: 92, y: 32, width: 120 },
  { id: 'd', x: 128, y: 80, width: 48 },
  { id: 'moved', x: 296, y: 32, width: 88 },
  { id: 'recovery', x: 304, y: 144, width: 72 },
  { id: 'efs', x: 20, y: 144, width: 128 },
]

const wideGroups = [
  { id: 'server', x: 8, y: 8, width: 248, height: 112, labelX: 16, labelY: 21 },
  { id: 'other', x: 272, y: 8, width: 160, height: 112, labelX: 280, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'tpm-os': 'M68 48 H92',
  'os-d': 'M152 64 V80',
  'recovery-moved': 'M340 144 V64',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
// 「읽을 수 없음」은 복구 암호의 화살표를 비켜 그 오른쪽에서 시작한다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'key-note', x: 20, y: 80, anchor: 'start' },
  { id: 'auto-note', x: 184, y: 100, anchor: 'start' },
  { id: 'locked-note', x: 348, y: 80, anchor: 'start' },
  { id: 'digits-note', x: 340, y: 192, anchor: 'middle' },
  { id: 'volume-note', x: 184, y: 100, anchor: 'start' },
  { id: 'file-note', x: 84, y: 192, anchor: 'middle' },
]

// 이 서버에서: TPM이 운영 체제 드라이브의 키를 내주고, 운영 체제 드라이브가 보호되어 있어 D:가 저절로 열린다.
// 떼어 갔을 때: 다른 컴퓨터에 옮겨 붙인 D:는 열리지 않는다. 복구 암호: 보관해 둔 복구 암호로 옮겨 붙인 D:를 연다.
// EFS와: 볼륨 전체를 암호화하는 BitLocker와 파일 하나하나를 암호화하는 EFS를 견준다.
export const bitLockerVolumeScenarios: DiagramScenario[] = [
  { id: 'normal', nodes: ['tpm', 'os', 'd'], paths: ['tpm-os', 'os-d'] },
  { id: 'stolen', nodes: ['moved'], paths: [] },
  { id: 'recovery', nodes: ['recovery', 'moved'], paths: ['recovery-moved'] },
  { id: 'vs-efs', nodes: ['d', 'efs'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function BitLockerVolumeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-bitlocker-volume-arrow`
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
      scenarios={bitLockerVolumeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 288'}>
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
