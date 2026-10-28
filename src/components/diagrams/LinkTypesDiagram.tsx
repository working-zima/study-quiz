import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-basics'].diagrams['link-types']

// 노트북과 휴대폰을 위에 나란히 두고, 그 아래로 공유기·스위치·컴퓨터를 쌓는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'laptop', x: 16, y: 16, width: 96 },
  { id: 'phone', x: 168, y: 16, width: 96 },
  { id: 'home-router', x: 92, y: 96, width: 96 },
  { id: 'switch', x: 92, y: 160, width: 96 },
  { id: 'computer', x: 92, y: 224, width: 96 },
]

// 통신 링크 넷은 늘 보인다. 앞의 둘은 와이파이로 이은 무선 링크, 뒤의 둘은 케이블로 이은 유선 링크다.
// 무선 링크는 노트북·휴대폰 아래로 내려가 공유기의 옆 변으로 들어간다.
const paths: Record<string, string> = {
  'laptop-home-router': 'M64 48 V112 H92',
  'phone-home-router': 'M216 48 V112 H188',
  'home-router-switch': 'M140 128 V160',
  'switch-computer': 'M140 192 V224',
}

const wirelessLinks = ['laptop-home-router', 'phone-home-router']
const linkIds = [...wirelessLinks, 'home-router-switch', 'switch-computer']

// 링크 곁말은 링크 바로 옆에 둔다.
const notes = [
  { id: 'wifi-laptop', x: 70, y: 84, textAnchor: 'start' as const, scenarios: ['wireless'] },
  { id: 'wifi-phone', x: 210, y: 84, textAnchor: 'end' as const, scenarios: ['wireless'] },
  { id: 'cable-switch', x: 148, y: 147, textAnchor: 'start' as const, scenarios: ['wired'] },
  { id: 'cable-computer', x: 148, y: 211, textAnchor: 'start' as const, scenarios: ['wired'] },
]

// 가로형은 노트북과 휴대폰을 왼쪽에 쌓고, 공유기·스위치·컴퓨터를 오른쪽으로 한 줄에 둔다.
const wideNodes = [
  { id: 'laptop', x: 8, y: 16, width: 72 },
  { id: 'phone', x: 8, y: 80, width: 72 },
  { id: 'home-router', x: 128, y: 48, width: 72 },
  { id: 'switch', x: 248, y: 48, width: 72 },
  { id: 'computer', x: 360, y: 48, width: 72 },
]

// 무선 링크는 오른쪽으로 가다 꺾어 공유기의 위 변과 아래 변으로 들어간다.
const widePaths: Record<string, string> = {
  'laptop-home-router': 'M80 32 H152 V48',
  'phone-home-router': 'M80 96 H152 V80',
  'home-router-switch': 'M200 64 H248',
  'switch-computer': 'M320 64 H360',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'wifi-laptop', x: 116, y: 26, textAnchor: 'middle' as const },
  { id: 'wifi-phone', x: 116, y: 110, textAnchor: 'middle' as const },
  { id: 'cable-switch', x: 224, y: 58, textAnchor: 'middle' as const },
  { id: 'cable-computer', x: 340, y: 58, textAnchor: 'middle' as const },
]

// nodes에는 선명하게 둘 노드와 통신 링크를 함께 적는다. 이 도식에는 화살표가 없다.
export const linkTypesScenarios: DiagramScenario[] = [
  { id: 'wireless', nodes: ['laptop', 'phone', 'home-router', 'laptop-home-router', 'phone-home-router'], paths: [] },
  { id: 'wired', nodes: ['home-router', 'switch', 'computer', 'home-router-switch', 'switch-computer'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LinkTypesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={linkTypesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 128' : '0 0 280 272'}>
          {linkIds.map((id) => (
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              strokeDasharray={wirelessLinks.includes(id) ? '4 3' : undefined}
              opacity={opacityOf(id)}
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
