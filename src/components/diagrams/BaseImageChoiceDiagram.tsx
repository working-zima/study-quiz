import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-hyperv'].diagrams['base-image-choice']

// 세로형은 아래에서 위로 쌓는다. 맨 아래 기본 이미지 박스 안에 기본 이미지 넷을 두 줄로 두고(위 줄 Nano Server·Server Core, 아래 줄 Windows·Windows Server),
// 그 위에 응용 프로그램 층을, 맨 위에 컨테이너를 둔다. 고른 기본 이미지에서 응용 프로그램 층으로, 응용 프로그램 층에서 컨테이너로 화살표가 올라간다.
// 아래 줄의 Windows·Windows Server는 두 위 줄 노드 사이의 틈(x 140)으로 올라간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'container', x: 80, y: 16, width: 120 },
  { id: 'app-layer', x: 24, y: 80, width: 232 },
  { id: 'nano', x: 24, y: 160, width: 108 },
  { id: 'servercore', x: 148, y: 160, width: 108 },
  { id: 'windows', x: 24, y: 200, width: 108 },
  { id: 'windows-server', x: 148, y: 200, width: 108 },
]

const groups = [
  { id: 'base', x: 8, y: 136, width: 264, height: 112, labelX: 16, labelY: 149 },
]

const paths: Record<string, string> = {
  'app-container': 'M140 80 V48',
  'nano-app': 'M78 160 V112',
  'servercore-app': 'M202 160 V112',
  'windows-app': 'M132 216 H140 V112',
  'windows-server-app': 'M148 216 H140 V112',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 「이미지로 실행한다」는 모든 시나리오에서 응용 프로그램 층 → 컨테이너 화살표 오른쪽에 보인다.
// 크기 곁말은 자기 기본 이미지를 골랐을 때만, 기본 이미지 박스 아래 같은 자리에 보인다.
const noteScenarios: Record<string, string[]> = {
  'run-note': ['nano', 'servercore', 'windows', 'windows-server'],
  'nano-note': ['nano'],
  'servercore-note': ['servercore'],
  'windows-note': ['windows'],
  'windows-server-note': ['windows-server'],
}

const notes: Note[] = [
  { id: 'run-note', x: 148, y: 68, anchor: 'start' },
  { id: 'nano-note', x: 140, y: 266, anchor: 'middle' },
  { id: 'servercore-note', x: 140, y: 266, anchor: 'middle' },
  { id: 'windows-note', x: 140, y: 266, anchor: 'middle' },
  { id: 'windows-server-note', x: 140, y: 266, anchor: 'middle' },
]

// 가로형은 기본 이미지 넷을 한 줄에 나란히 두어 저마다 곧게 응용 프로그램 층으로 올라가게 한다.
const wideNodes = [
  { id: 'container', x: 160, y: 16, width: 120 },
  { id: 'app-layer', x: 16, y: 80, width: 408 },
  { id: 'nano', x: 32, y: 160, width: 96 },
  { id: 'servercore', x: 136, y: 160, width: 92 },
  { id: 'windows', x: 236, y: 160, width: 76 },
  { id: 'windows-server', x: 320, y: 160, width: 104 },
]

const wideGroups = [
  { id: 'base', x: 8, y: 136, width: 424, height: 80, labelX: 16, labelY: 149 },
]

const widePaths: Record<string, string> = {
  'app-container': 'M220 80 V48',
  'nano-app': 'M80 160 V112',
  'servercore-app': 'M182 160 V112',
  'windows-app': 'M274 160 V112',
  'windows-server-app': 'M372 160 V112',
}

const wideNotes: Note[] = [
  { id: 'run-note', x: 228, y: 68, anchor: 'start' },
  { id: 'nano-note', x: 220, y: 234, anchor: 'middle' },
  { id: 'servercore-note', x: 220, y: 234, anchor: 'middle' },
  { id: 'windows-note', x: 220, y: 234, anchor: 'middle' },
  { id: 'windows-server-note', x: 220, y: 234, anchor: 'middle' },
]

// 시나리오마다 기본 이미지 하나를 골라, 그 위에 응용 프로그램 층을 얹고 그 이미지로 컨테이너를 실행하는 차례를 보인다.
export const baseImageChoiceScenarios: DiagramScenario[] = [
  { id: 'nano', nodes: ['container', 'app-layer', 'nano'], paths: ['nano-app', 'app-container'] },
  { id: 'servercore', nodes: ['container', 'app-layer', 'servercore'], paths: ['servercore-app', 'app-container'] },
  { id: 'windows', nodes: ['container', 'app-layer', 'windows'], paths: ['windows-app', 'app-container'] },
  { id: 'windows-server', nodes: ['container', 'app-layer', 'windows-server'], paths: ['windows-server-app', 'app-container'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function BaseImageChoiceDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-base-image-choice-arrow`
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
      scenarios={baseImageChoiceScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 244' : '0 0 280 276'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id].includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
