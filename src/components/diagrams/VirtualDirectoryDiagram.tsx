import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['virtual-directory']

// 세로형은 위에 URL 상자를 두고 그 안에 URL의 조각 셋(호스트 이름·별칭·파일 이름)을 나란히 둔다. 아래에는 서버의 폴더와 파일을
// 조각마다 그 아래 줄에 둔다 — 별칭 아래에 D:\Docs, 파일 이름 아래에 D:\Docs\guide.html, 맨 아래 줄에 사이트의 실제 경로. 노드는 모두 회색이다.
const nodes = [
  { id: 'host', x: 16, y: 28, width: 108 },
  { id: 'docs', x: 132, y: 28, width: 48 },
  { id: 'guide', x: 188, y: 28, width: 76 },
  { id: 'root', x: 16, y: 208, width: 200 },
  { id: 'folder', x: 120, y: 104, width: 72 },
  { id: 'file', x: 132, y: 160, width: 136 },
]

const groups = [
  { id: 'url', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 21 },
]

// 화살표는 URL 조각 노드의 아래 변에서 나와 그 조각이 이어지는 폴더나 파일 노드의 위 변에 닿는다.
const paths: Record<string, string> = {
  'host-root': 'M20 60 V208',
  'docs-folder': 'M156 60 V104',
  'guide-file': 'M226 60 V160',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'site-key': 'site',
  'root-key': 'site',
  'alias-key': 'alias',
  'folder-key': 'alias',
}

const notes: Note[] = [
  { id: 'site-key', x: 28, y: 88, anchor: 'start' },
  { id: 'root-key', x: 224, y: 228, anchor: 'start' },
  { id: 'alias-key', x: 164, y: 88, anchor: 'start' },
  { id: 'folder-key', x: 156, y: 152, anchor: 'middle' },
]

// 가로형은 URL 상자를 넓혀 조각 셋을 벌려 두고, 조각마다 바로 아래에 이어지는 폴더나 파일을 둔다 — 호스트 이름 아래에 사이트의 실제 경로,
// 별칭 아래에 D:\Docs, 파일 이름 아래 한 줄 내려 D:\Docs\guide.html.
const wideNodes = [
  { id: 'host', x: 16, y: 28, width: 112 },
  { id: 'docs', x: 244, y: 28, width: 56 },
  { id: 'guide', x: 332, y: 28, width: 88 },
  { id: 'root', x: 16, y: 104, width: 200 },
  { id: 'folder', x: 236, y: 104, width: 72 },
  { id: 'file', x: 296, y: 160, width: 136 },
]

const wideGroups = [
  { id: 'url', x: 8, y: 8, width: 424, height: 64, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'host-root': 'M72 60 V104',
  'docs-folder': 'M272 60 V104',
  'guide-file': 'M376 60 V160',
}

const wideNotes: Note[] = [
  { id: 'site-key', x: 80, y: 88, anchor: 'start' },
  { id: 'root-key', x: 16, y: 152, anchor: 'start' },
  { id: 'alias-key', x: 280, y: 88, anchor: 'start' },
  { id: 'folder-key', x: 272, y: 152, anchor: 'middle' },
]

// 사이트 경로: 호스트 이름 조각과 사이트의 실제 경로. 가상 디렉터리: 별칭 docs·파일 이름 조각과 D:\Docs·D:\Docs\guide.html.
export const virtualDirectoryScenarios: DiagramScenario[] = [
  { id: 'site', nodes: ['host', 'root'], paths: ['host-root'] },
  { id: 'alias', nodes: ['docs', 'guide', 'folder', 'file'], paths: ['docs-folder', 'guide-file'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VirtualDirectoryDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-virtual-directory-arrow`
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
      scenarios={virtualDirectoryScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 248'}>
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
