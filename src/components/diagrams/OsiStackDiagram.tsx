import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame } from './DiagramFrame'

const text = visualsByTopicId['protocols-encapsulation'].diagrams['osi-stack']

// 일곱 계층을 본문 목록 순서대로 아래에서 위로 빈틈없이 쌓는다. 물리 계층이 맨 아래, 응용 계층이 맨 위다. 노드는 모두 회색이다.
// 계층마다 하는 일은 본문 목록 항목에서 한 구절씩 골라 상자 오른쪽에 곁말로 둔다. 일곱 계층의 일을 한눈에 보는 것이 이 그림의 목적이라
// 몇 계층만 골라 밝히는 시나리오를 두지 않는다.
const nodes = [
  { id: 'physical', x: 8, y: 200, width: 112 },
  { id: 'data-link', x: 8, y: 168, width: 112 },
  { id: 'network', x: 8, y: 136, width: 112 },
  { id: 'transport', x: 8, y: 104, width: 112 },
  { id: 'session', x: 8, y: 72, width: 112 },
  { id: 'presentation', x: 8, y: 40, width: 112 },
  { id: 'application', x: 8, y: 8, width: 112 },
]

// 곁말은 자기 계층 상자 오른쪽에서 8 띄운 자리, 상자 높이 안에 둔다.
const noteX = 128

// 가로형은 계층을 넓혀 가운데 쪽으로 옮기고, 곁말을 그 오른쪽에 둔다. 쌓인 순서와 높이는 세로형과 같다.
const wideNodes = [
  { id: 'physical', x: 64, y: 200, width: 160 },
  { id: 'data-link', x: 64, y: 168, width: 160 },
  { id: 'network', x: 64, y: 136, width: 160 },
  { id: 'transport', x: 64, y: 104, width: 160 },
  { id: 'session', x: 64, y: 72, width: 160 },
  { id: 'presentation', x: 64, y: 40, width: 160 },
  { id: 'application', x: 64, y: 8, width: 160 },
]

const wideNoteX = 240

const noop = () => {}

export function OsiStackDiagram() {
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNoteX = wide ? wideNoteX : noteX

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} active={null} onSelect={noop}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 240' : '0 0 280 240'}>
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="0" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNodes.map((node) => (
            <text key={node.id} data-note={`role-${node.id}`} x={layoutNoteX} y={node.y + 20} textAnchor="start" className="fill-muted" fontSize="9">
              {text.notes![`role-${node.id}`]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
