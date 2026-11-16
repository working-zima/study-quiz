import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-admin-tools'].diagrams['work-folders-sync']

// 맨 위 회사 파일 서버 박스 안에 동기화 공유를 두고, 그 아래 박스 밖에 회사 PC와 개인 노트북을 나란히 둔다.
// 맨 아래 Microsoft의 클라우드 서비스 박스 안에 견줄 OneDrive를 두며, OneDrive에는 어떤 선도 잇지 않는다.
const nodes = [
  { id: 'share', x: 92, y: 32, width: 96 },
  { id: 'pc', x: 40, y: 120, width: 64 },
  { id: 'laptop', x: 168, y: 120, width: 80 },
  { id: 'onedrive', x: 104, y: 208, width: 72 },
]

const groups = [
  { id: 'server', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 21 },
  { id: 'cloud', x: 8, y: 184, width: 264, height: 64, labelX: 16, labelY: 197 },
]

// 두 선 모두 동기화 공유와 기기를 잇는 양쪽 화살표다.
const paths: Record<string, string> = {
  'share-pc': 'M120 64 V92 H72 V120',
  'share-laptop': 'M160 64 V92 H208 V120',
}

// 「오프라인에서 고친 파일」은 개인 노트북 아래에, 「암호화와 잠금 화면 암호」는 두 기기 아래 가운데에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'offline-note', x: 208, y: 168, anchor: 'middle', scenarios: ['offline'] },
  { id: 'policy-note', x: 140, y: 168, anchor: 'middle', scenarios: ['policy'] },
]

// 가로형은 회사 파일 서버 박스를 왼쪽 위에, 그 오른쪽에 회사 PC와 개인 노트북을 위아래로 두고,
// Microsoft의 클라우드 서비스 박스를 왼쪽 아래에 둔다. 곁말은 기기들의 오른쪽에 놓인다.
const wideNodes = [
  { id: 'share', x: 24, y: 48, width: 96 },
  { id: 'pc', x: 200, y: 16, width: 64 },
  { id: 'laptop', x: 200, y: 80, width: 80 },
  { id: 'onedrive', x: 24, y: 144, width: 72 },
]

const wideGroups = [
  { id: 'server', x: 8, y: 24, width: 128, height: 72, labelX: 16, labelY: 37 },
  { id: 'cloud', x: 8, y: 120, width: 184, height: 64, labelX: 16, labelY: 133 },
]

const widePaths: Record<string, string> = {
  'share-pc': 'M120 56 H160 V32 H200',
  'share-laptop': 'M120 72 H160 V96 H200',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'offline-note', x: 288, y: 100, anchor: 'start' },
  { id: 'policy-note', x: 288, y: 64, anchor: 'start' },
]

// 동기화: 회사 PC와 개인 노트북이 동기화 공유와 같은 내용을 갖는다. 오프라인일 때: 노트북에서 고친 파일을 다시 이어지면 동기화한다.
// 기기 정책: 기기에 암호화와 잠금 화면 암호를 요구한다. OneDrive와: 파일을 모으는 곳이 회사 서버와 Microsoft의 클라우드 서비스로 갈린다.
export const workFoldersSyncScenarios: DiagramScenario[] = [
  { id: 'sync', nodes: ['share', 'pc', 'laptop'], paths: ['share-pc', 'share-laptop'] },
  { id: 'offline', nodes: ['share', 'laptop'], paths: ['share-laptop'] },
  { id: 'policy', nodes: ['share', 'pc', 'laptop'], paths: [] },
  { id: 'vs-onedrive', nodes: ['share', 'onedrive'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function WorkFoldersSyncDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const markerBase = useId()
  const arrowId = `${markerBase}-work-folders-sync-arrow`
  const startArrowId = `${markerBase}-work-folders-sync-start-arrow`
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
      scenarios={workFoldersSyncScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 256'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
            <marker id={startArrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M6 0 L0 3 L6 6 Z" />
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
              markerStart={`url(#${startArrowId})`}
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
