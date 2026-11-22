import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-topology'].diagrams['mesh-tree-links']

// 세로형은 위 「완전 메시」 박스에 PC01~PC04를 네 귀퉁이(왼쪽 위 PC01, 오른쪽 위 PC02, 왼쪽 아래 PC03, 오른쪽 아래 PC04)에 놓고
// 노드 쌍마다 링크 하나씩 여섯을 잇는다. 대각선 둘은 직교 선으로 돌려, PC01–PC04는 네 노드 사이의 빈자리로, PC02–PC03은 박스 아래쪽 바깥으로 돈다.
// 아래 「트리형」 박스에는 SW01 아래로 SW02·SW03을, SW02 아래로 PC01·PC02를, SW03 아래로 PC03·PC04를 세로로 쌓아 잇는다.
// 두 박스의 PC01~PC04는 이름이 같아도 서로 다른 노드라 id를 달리한다. 노드는 모두 회색이다.
const nodes = [
  { id: 'm-pc01', x: 56, y: 32, width: 56 },
  { id: 'm-pc02', x: 168, y: 32, width: 56 },
  { id: 'm-pc03', x: 56, y: 112, width: 56 },
  { id: 'm-pc04', x: 168, y: 112, width: 56 },
  { id: 't-sw01', x: 112, y: 204, width: 56 },
  { id: 't-sw02', x: 24, y: 252, width: 56 },
  { id: 't-sw03', x: 200, y: 252, width: 56 },
  { id: 't-pc01', x: 24, y: 300, width: 56 },
  { id: 't-pc02', x: 24, y: 348, width: 56 },
  { id: 't-pc03', x: 200, y: 300, width: 56 },
  { id: 't-pc04', x: 200, y: 348, width: 56 },
]

const groups = [
  { id: 'mesh', x: 8, y: 8, width: 264, height: 164, labelX: 16, labelY: 21 },
  { id: 'tree', x: 8, y: 180, width: 264, height: 208, labelX: 16, labelY: 193 },
]

// 링크는 늘 보이고, 화살표(데이터)는 시나리오를 골랐을 때만 링크 위에 겹쳐 보인다.
const paths: Record<string, string> = {
  'm-12': 'M112 48 H168',
  'm-13': 'M72 64 V112',
  'm-14': 'M96 64 V88 H184 V112',
  'm-23': 'M224 48 H248 V160 H84 V144',
  'm-24': 'M208 64 V112',
  'm-34': 'M112 128 H168',
  't-sw01-sw02': 'M112 220 H52 V252',
  't-sw01-sw03': 'M168 220 H228 V252',
  't-sw02-pc01': 'M52 284 V300',
  't-sw02-pc02': 'M80 268 H96 V364 H80',
  't-sw03-pc03': 'M228 284 V300',
  't-sw03-pc04': 'M200 268 H184 V364 H200',
  'm-hop-14': 'M96 64 V88 H184 V112',
  'm-hop-43': 'M168 128 H112',
  't-hop-pc01-sw02': 'M52 300 V284',
  't-hop-sw02-sw01': 'M52 252 V220 H112',
  't-hop-sw01-sw03': 'M168 220 H228 V252',
  't-hop-sw03-pc04': 'M200 268 H184 V364 H200',
  't-cut-pc04-sw03': 'M200 364 H184 V268 H200',
  't-cut-sw03-sw01': 'M228 252 V220 H168',
}

const meshLinkIds = ['m-12', 'm-13', 'm-14', 'm-23', 'm-24', 'm-34']
const treeLinkIds = ['t-sw01-sw02', 't-sw01-sw03', 't-sw02-pc01', 't-sw02-pc02', 't-sw03-pc03', 't-sw03-pc04']
const linkIds = [...meshLinkIds, ...treeLinkIds]
const meshNodeIds = ['m-pc01', 'm-pc02', 'm-pc03', 'm-pc04']
const treeNodeIds = ['t-sw01', 't-sw02', 't-sw03', 't-pc01', 't-pc02', 't-pc03', 't-pc04']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 그림 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'full-mesh-note': 'full-mesh',
  'mesh-cut-note': 'mesh-cut',
  'tree-note': 'tree',
  'tree-cut-note': 'tree-cut',
}

const notes: Note[] = [
  { id: 'full-mesh-note', x: 140, y: 404, anchor: 'middle' },
  { id: 'mesh-cut-note', x: 140, y: 404, anchor: 'middle' },
  { id: 'tree-note', x: 140, y: 404, anchor: 'middle' },
  { id: 'tree-cut-note', x: 140, y: 404, anchor: 'middle' },
]

// 가로형은 두 박스를 왼쪽(완전 메시)과 오른쪽(트리형)에 나란히 둔다. 트리형은 SW01 아래 SW02·SW03, 그 아래 PC01~PC04를 한 줄에 놓는다.
const wideNodes = [
  { id: 'm-pc01', x: 40, y: 32, width: 56 },
  { id: 'm-pc02', x: 128, y: 32, width: 56 },
  { id: 'm-pc03', x: 40, y: 112, width: 56 },
  { id: 'm-pc04', x: 128, y: 112, width: 56 },
  { id: 't-sw01', x: 300, y: 32, width: 48 },
  { id: 't-sw02', x: 248, y: 88, width: 48 },
  { id: 't-sw03', x: 352, y: 88, width: 48 },
  { id: 't-pc01', x: 224, y: 144, width: 44 },
  { id: 't-pc02', x: 276, y: 144, width: 44 },
  { id: 't-pc03', x: 328, y: 144, width: 44 },
  { id: 't-pc04', x: 380, y: 144, width: 44 },
]

const wideGroups = [
  { id: 'mesh', x: 8, y: 8, width: 200, height: 176, labelX: 16, labelY: 21 },
  { id: 'tree', x: 216, y: 8, width: 216, height: 176, labelX: 224, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'm-12': 'M96 48 H128',
  'm-13': 'M56 64 V112',
  'm-14': 'M80 64 V88 H144 V112',
  'm-23': 'M184 48 H196 V160 H68 V144',
  'm-24': 'M168 64 V112',
  'm-34': 'M96 128 H128',
  't-sw01-sw02': 'M312 64 V76 H272 V88',
  't-sw01-sw03': 'M336 64 V76 H376 V88',
  't-sw02-pc01': 'M258 120 V144',
  't-sw02-pc02': 'M286 120 V144',
  't-sw03-pc03': 'M362 120 V144',
  't-sw03-pc04': 'M390 120 V144',
  'm-hop-14': 'M80 64 V88 H144 V112',
  'm-hop-43': 'M128 128 H96',
  't-hop-pc01-sw02': 'M258 144 V120',
  't-hop-sw02-sw01': 'M272 88 V76 H312 V64',
  't-hop-sw01-sw03': 'M336 64 V76 H376 V88',
  't-hop-sw03-pc04': 'M390 120 V144',
  't-cut-pc04-sw03': 'M390 144 V120',
  't-cut-sw03-sw01': 'M376 88 V76 H336 V64',
}

const wideNotes: Note[] = [
  { id: 'full-mesh-note', x: 220, y: 200, anchor: 'middle' },
  { id: 'mesh-cut-note', x: 220, y: 200, anchor: 'middle' },
  { id: 'tree-note', x: 220, y: 200, anchor: 'middle' },
  { id: 'tree-cut-note', x: 220, y: 200, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 링크를 함께 적는다. 고른 박스 밖의 노드와 링크는 흐려지고, 고른 박스 안에서 끊긴 링크도 흐려진다.
// 완전 메시: 노드 넷과 링크 여섯. 메시에서 끊기면: PC01–PC03 링크가 끊기고, PC01이 PC03에게 보내는 데이터가 PC04를 거쳐 간다.
// 트리형: 노드 일곱과 링크 여섯, PC01에서 PC04로 가는 하나뿐인 길. 트리에서 끊기면: SW01–SW02 링크가 끊기고, PC04가 PC01에게 보낸 데이터가 SW01에서 멈춘다.
export const meshTreeLinksScenarios: DiagramScenario[] = [
  {
    id: 'full-mesh',
    nodes: [...meshNodeIds, ...meshLinkIds],
    paths: [],
  },
  {
    id: 'mesh-cut',
    nodes: [...meshNodeIds, 'm-12', 'm-14', 'm-23', 'm-24', 'm-34'],
    paths: ['m-hop-14', 'm-hop-43'],
  },
  {
    id: 'tree',
    nodes: [...treeNodeIds, ...treeLinkIds],
    paths: ['t-hop-pc01-sw02', 't-hop-sw02-sw01', 't-hop-sw01-sw03', 't-hop-sw03-pc04'],
  },
  {
    id: 'tree-cut',
    nodes: [...treeNodeIds, 't-sw01-sw03', 't-sw02-pc01', 't-sw02-pc02', 't-sw03-pc03', 't-sw03-pc04'],
    paths: ['t-cut-pc04-sw03', 't-cut-sw03-sw01'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MeshTreeLinksDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-mesh-tree-links-arrow`
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
      scenarios={meshTreeLinksScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 412'}>
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
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
