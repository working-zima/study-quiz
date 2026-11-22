import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['cloud-sdn'].diagrams['deployment-model-users']

// 세로형은 왼쪽 열에 쓰는 쪽 셋(한 조직·관심사가 같은 조직들·누구나), 오른쪽 열에 클라우드 셋(사설·커뮤니티·공용)을 같은 줄끼리 짝지어 둔다.
// 한쪽 화살표는 쓰는 쪽이 그 클라우드를 쓰는 것이다. 하이브리드의 양쪽 화살표는 두 열 사이 통로로 사설 클라우드와 공용 클라우드를 잇는다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'org', x: 8, y: 16, width: 132 },
  { id: 'orgs', x: 8, y: 72, width: 132 },
  { id: 'anyone', x: 8, y: 128, width: 132 },
  { id: 'private', x: 164, y: 16, width: 112 },
  { id: 'community', x: 164, y: 72, width: 112 },
  { id: 'public', x: 164, y: 128, width: 112 },
]

const paths: Record<string, string> = {
  'org-private': 'M140 32 H164',
  'orgs-community': 'M140 88 H164',
  'anyone-public': 'M140 144 H164',
  'hybrid-link': 'M164 40 H152 V136 H164',
}

// 하이브리드의 선은 두 클라우드 사이를 양쪽으로 잇는다 — 양 끝에 화살촉을 단다.
const doubleHeaded = new Set(['hybrid-link'])

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 그림 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'private-note': 'private',
  'community-note': 'community',
  'public-note': 'public',
  'hybrid-note': 'hybrid',
}

const notes: Note[] = [
  { id: 'private-note', x: 140, y: 182, anchor: 'middle' },
  { id: 'community-note', x: 140, y: 182, anchor: 'middle' },
  { id: 'public-note', x: 140, y: 182, anchor: 'middle' },
  { id: 'hybrid-note', x: 140, y: 182, anchor: 'middle' },
]

// 가로형은 위 줄에 쓰는 쪽 셋, 아래 줄에 클라우드 셋을 같은 열끼리 짝지어 둔다.
// 하이브리드의 선은 클라우드 줄 아래를 지나 사설 클라우드와 공용 클라우드의 아래 변을 잇는다.
const wideNodes = [
  { id: 'org', x: 10, y: 16, width: 132 },
  { id: 'orgs', x: 154, y: 16, width: 132 },
  { id: 'anyone', x: 298, y: 16, width: 132 },
  { id: 'private', x: 20, y: 96, width: 112 },
  { id: 'community', x: 164, y: 96, width: 112 },
  { id: 'public', x: 308, y: 96, width: 112 },
]

const widePaths: Record<string, string> = {
  'org-private': 'M76 48 V96',
  'orgs-community': 'M220 48 V96',
  'anyone-public': 'M364 48 V96',
  'hybrid-link': 'M76 128 V152 H364 V128',
}

const wideNotes: Note[] = [
  { id: 'private-note', x: 220, y: 180, anchor: 'middle' },
  { id: 'community-note', x: 220, y: 180, anchor: 'middle' },
  { id: 'public-note', x: 220, y: 180, anchor: 'middle' },
  { id: 'hybrid-note', x: 220, y: 180, anchor: 'middle' },
]

// 사설·커뮤니티·공용은 쓰는 쪽 하나와 그 클라우드 하나가 선명하고 그 사이 화살표 하나가 보인다.
// 하이브리드는 사설 클라우드와 공용 클라우드만 선명하고, 둘을 잇는 양쪽 화살표가 보인다.
export const deploymentModelUsersScenarios: DiagramScenario[] = [
  {
    id: 'private',
    nodes: ['org', 'private'],
    paths: ['org-private'],
  },
  {
    id: 'community',
    nodes: ['orgs', 'community'],
    paths: ['orgs-community'],
  },
  {
    id: 'public',
    nodes: ['anyone', 'public'],
    paths: ['anyone-public'],
  },
  {
    id: 'hybrid',
    nodes: ['private', 'public'],
    paths: ['hybrid-link'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DeploymentModelUsersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const markerBase = useId()
  const arrowId = `${markerBase}-deployment-model-users-arrow`
  const startArrowId = `${markerBase}-deployment-model-users-start-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={deploymentModelUsersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 190' : '0 0 280 192'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
            <marker id={startArrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M6 0 L0 3 L6 6 Z" />
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
              markerStart={doubleHeaded.has(id) ? `url(#${startArrowId})` : undefined}
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
