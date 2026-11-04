import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['standard-directories']

// 세로형은 본문 마지막 문단의 다섯 묶음을 그룹 박스로 위에서 아래로 쌓는다. 설정과 사용자의 홈은 디렉터리가 적어 한 줄에 나란히 둔다.
// 노드 라벨은 경로 그대로이고 노드는 모두 회색이다. 선은 없다 — 열두 디렉터리가 모두 루트 디렉터리 바로 안이라는 것은 범례가 말한다.
const nodes = [
  { id: 'bin', x: 18, y: 30, width: 52 },
  { id: 'sbin', x: 82, y: 30, width: 52 },
  { id: 'lib', x: 146, y: 30, width: 52 },
  { id: 'usr', x: 210, y: 30, width: 52 },
  { id: 'etc', x: 18, y: 102, width: 52 },
  { id: 'home', x: 106, y: 102, width: 52 },
  { id: 'root', x: 170, y: 102, width: 52 },
  { id: 'var', x: 18, y: 174, width: 52 },
  { id: 'tmp', x: 82, y: 174, width: 52 },
  { id: 'boot', x: 18, y: 246, width: 52 },
  { id: 'dev', x: 82, y: 246, width: 52 },
  { id: 'proc', x: 146, y: 246, width: 52 },
]

const groups = [
  { id: 'programs', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 22 },
  { id: 'config', x: 8, y: 80, width: 72, height: 64, labelX: 16, labelY: 94 },
  { id: 'users', x: 96, y: 80, width: 176, height: 64, labelX: 104, labelY: 94 },
  { id: 'data', x: 8, y: 152, width: 264, height: 64, labelX: 16, labelY: 166 },
  { id: 'system', x: 8, y: 224, width: 264, height: 64, labelX: 16, labelY: 238 },
]

// 가로형은 두 줄이다. 윗줄에 명령과 라이브러리·사용자의 홈, 아랫줄에 설정·바뀌는 데이터와 임시 파일·부팅·장치·커널 정보를 둔다.
const wideNodes = [
  { id: 'bin', x: 16, y: 30, width: 52 },
  { id: 'sbin', x: 76, y: 30, width: 52 },
  { id: 'lib', x: 136, y: 30, width: 52 },
  { id: 'usr', x: 196, y: 30, width: 52 },
  { id: 'etc', x: 18, y: 102, width: 52 },
  { id: 'home', x: 284, y: 30, width: 52 },
  { id: 'root', x: 344, y: 30, width: 52 },
  { id: 'var', x: 98, y: 102, width: 52 },
  { id: 'tmp', x: 158, y: 102, width: 52 },
  { id: 'boot', x: 254, y: 102, width: 52 },
  { id: 'dev', x: 314, y: 102, width: 52 },
  { id: 'proc', x: 374, y: 102, width: 52 },
]

const wideGroups = [
  { id: 'programs', x: 8, y: 8, width: 248, height: 64, labelX: 16, labelY: 22 },
  { id: 'users', x: 264, y: 8, width: 168, height: 64, labelX: 272, labelY: 22 },
  { id: 'config', x: 8, y: 80, width: 72, height: 64, labelX: 16, labelY: 94 },
  { id: 'data', x: 88, y: 80, width: 148, height: 64, labelX: 96, labelY: 94 },
  { id: 'system', x: 244, y: 80, width: 188, height: 64, labelX: 252, labelY: 94 },
]

// 시나리오마다 그 묶음의 디렉터리만 선명하다. 다섯 묶음을 합하면 열두 디렉터리가 한 번씩 나온다.
export const standardDirectoriesScenarios: DiagramScenario[] = [
  { id: 'programs', nodes: ['bin', 'sbin', 'lib', 'usr'], paths: [] },
  { id: 'config', nodes: ['etc'], paths: [] },
  { id: 'users', nodes: ['home', 'root'], paths: [] },
  { id: 'data', nodes: ['var', 'tmp'], paths: [] },
  { id: 'system', nodes: ['boot', 'dev', 'proc'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function StandardDirectoriesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={standardDirectoriesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 296'}>
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
