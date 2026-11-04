import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['proc-view']

// 세로형은 맨 위에 커널을 두고 그 아래 /proc 테두리 안에 1234·cpuinfo·meminfo를 나란히 둔다.
// 맨 아래에는 디스크와 보통 파일 report.txt를 나란히 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'kernel', x: 108, y: 8, width: 64 },
  { id: 'disk', x: 16, y: 136, width: 64 },
  { id: 'pid', x: 30, y: 76, width: 60 },
  { id: 'cpuinfo', x: 110, y: 76, width: 60 },
  { id: 'meminfo', x: 190, y: 76, width: 60 },
  { id: 'report', x: 120, y: 136, width: 80 },
]

const groups = [
  { id: 'proc', x: 8, y: 56, width: 264, height: 60, labelX: 16, labelY: 70 },
]

// 화살표는 파일의 내용이 어디서 오는지다. 커널의 왼쪽·아래·오른쪽 변에서 하나씩 나가 /proc의 세 노드로, 디스크에서 report.txt로 간다.
const paths: Record<string, string> = {
  'to-pid': 'M108 24 H60 V76',
  'to-cpuinfo': 'M140 40 V76',
  'to-meminfo': 'M172 24 H220 V76',
  'to-report': 'M80 152 H120',
}

// 가로형은 두 출처를 위에 나란히 둔다. 왼쪽 위의 디스크 아래에 report.txt를, 오른쪽 위의 커널 아래에 /proc 테두리를 둔다.
const wideNodes = [
  { id: 'kernel', x: 252, y: 8, width: 64 },
  { id: 'disk', x: 16, y: 8, width: 64 },
  { id: 'pid', x: 164, y: 76, width: 76 },
  { id: 'cpuinfo', x: 252, y: 76, width: 76 },
  { id: 'meminfo', x: 340, y: 76, width: 76 },
  { id: 'report', x: 8, y: 76, width: 80 },
]

const wideGroups = [
  { id: 'proc', x: 140, y: 56, width: 292, height: 60, labelX: 148, labelY: 70 },
]

const widePaths: Record<string, string> = {
  'to-pid': 'M252 24 H202 V76',
  'to-cpuinfo': 'M290 40 V76',
  'to-meminfo': 'M316 24 H378 V76',
  'to-report': 'M48 40 V76',
}

// 「프로세스 정보」·「하드웨어 정보」는 커널에서 /proc의 노드로, 「보통 파일」은 디스크에서 report.txt로 간다.
export const procViewScenarios: DiagramScenario[] = [
  { id: 'process', nodes: ['kernel', 'pid'], paths: ['to-pid'] },
  { id: 'hardware', nodes: ['kernel', 'cpuinfo', 'meminfo'], paths: ['to-cpuinfo', 'to-meminfo'] },
  { id: 'ordinary', nodes: ['disk', 'report'], paths: ['to-report'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ProcViewDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-proc-view-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={procViewScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 124' : '0 0 280 176'}>
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
