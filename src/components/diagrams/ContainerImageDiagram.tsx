import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ecs-eks-fargate'].diagrams['image-flow']

// 서버 박스 하나가 컨테이너 둘과 그 아래 운영 체제를 감싼다.
const groups = [
  { id: 'server', x: 4, y: 144, width: 272, height: 124 },
]

// 위에 Dockerfile → 이미지를 두고, 이미지 아래에 ECR, 그 아래에 서버를 둔다.
const nodes = [
  { id: 'dockerfile', x: 12, y: 8, width: 104, color: 'stroke-disabled' },
  { id: 'image', x: 152, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'registry', x: 152, y: 80, width: 116, color: 'stroke-diagram-managed' },
  { id: 'other', x: 24, y: 168, width: 104, color: 'stroke-disabled' },
  { id: 'container', x: 152, y: 168, width: 104, color: 'stroke-disabled' },
  { id: 'os', x: 24, y: 224, width: 232, color: 'stroke-disabled' },
]

// ECR에서 내려받는 화살표는 컨테이너 하나로만 간다. 「이미지 하나로 컨테이너를 여럿 띄운다」는 근거가 없다(ADR-037 phase 64).
const paths: Record<string, string> = {
  'dockerfile-image': 'M116 24 H152',
  'image-registry': 'M210 40 V80',
  'registry-container': 'M204 112 V168',
}

// 빌드·올리기·내려받기와 운영 체제를 함께 쓰는 것은 곁말 글자로만 보인다.
const notes = [
  { id: 'build', x: 134, y: 52, textAnchor: 'middle' as const, scenarios: ['build'] },
  { id: 'push', x: 202, y: 64, textAnchor: 'end' as const, scenarios: ['build'] },
  { id: 'pull', x: 196, y: 132, textAnchor: 'end' as const, scenarios: ['run'] },
  { id: 'shared-os', x: 140, y: 284, textAnchor: 'middle' as const, scenarios: ['share'] },
]

// 가로형은 Dockerfile → 이미지 → ECR을 위 줄에 왼쪽에서 오른쪽으로 두고, 서버 박스를 그 아래 오른쪽에 둔다.
const wideGroups = [
  { id: 'server', x: 152, y: 72, width: 284, height: 112 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'dockerfile', x: 16, y: 8, width: 104 },
  { id: 'image', x: 168, y: 8, width: 104 },
  { id: 'registry', x: 320, y: 8, width: 104 },
  { id: 'other', x: 168, y: 100, width: 104 },
  { id: 'container', x: 320, y: 100, width: 104 },
  { id: 'os', x: 168, y: 144, width: 256 },
]

// ECR에서 바로 아래의 컨테이너로 내려간다.
const widePaths: Record<string, string> = {
  'dockerfile-image': 'M120 24 H168',
  'image-registry': 'M272 24 H320',
  'registry-container': 'M372 40 V100',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'build', x: 144, y: 52, textAnchor: 'middle' as const },
  { id: 'push', x: 296, y: 52, textAnchor: 'middle' as const },
  { id: 'pull', x: 364, y: 60, textAnchor: 'end' as const },
  { id: 'shared-os', x: 296, y: 196, textAnchor: 'middle' as const },
]

export const containerImageScenarios: DiagramScenario[] = [
  { id: 'build', nodes: ['dockerfile', 'image', 'registry'], paths: ['dockerfile-image', 'image-registry'] },
  { id: 'run', nodes: ['registry', 'container', 'os'], paths: ['registry-container'] },
  { id: 'share', nodes: ['other', 'container', 'os'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ContainerImageDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-container-image-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={containerImageScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 296'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
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
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className={`fill-panel ${node.color}`} x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
