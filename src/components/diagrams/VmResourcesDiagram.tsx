import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-compute'].diagrams['vm-resources']

// VM과 네트워크 인터페이스만 가상 네트워크 안에 둔다. 서브넷은 범례에서 생략을 밝힌다.
const groups = [
  { id: 'vnet', x: 8, y: 96, width: 264, height: 194 },
]
const nodes = [
  { id: 'vm-1', x: 80, y: 128, width: 120 },
  { id: 'nic', x: 60, y: 208, width: 160 },
  { id: 'os-disk', x: 8, y: 16, width: 120 },
  { id: 'data-disk', x: 152, y: 16, width: 120 },
  { id: 'public-ip', x: 8, y: 360, width: 120 },
  { id: 'nsg', x: 152, y: 360, width: 120 },
]

// 통신 방향이 아니라 리소스의 연결 관계다. 화살표 없이 모든 시나리오에서 유지한다.
const paths: Record<string, string> = {
  'link-os': 'M110 128 V80 H68 V48',
  'link-data': 'M170 128 V80 H140 V32 H152',
  'link-nic': 'M140 160 V208',
  'link-ip': 'M60 224 H30 V336 H68 V360',
  'link-nsg': 'M220 224 H250 V336 H212 V360',
}
const notes = [
  { id: 'nic-note', x: 140, y: 272, scenario: 'required' },
  { id: 'ip-note', x: 68, y: 406, scenario: 'optional' },
  { id: 'data-note', x: 212, y: 62, scenario: 'optional' },
  { id: 'nsg-note', x: 212, y: 406, scenario: 'optional' },
]

// 가로형에서는 디스크를 왼쪽, 선택적 네트워크 자원을 오른쪽에 놓는다.
const wideGroups = [
  { id: 'vnet', x: 144, y: 68, width: 152, height: 208 },
]
const wideNodes = [
  { id: 'vm-1', x: 160, y: 100, width: 120 },
  { id: 'nic', x: 152, y: 180, width: 136 },
  { id: 'os-disk', x: 8, y: 100, width: 120 },
  { id: 'data-disk', x: 8, y: 196, width: 120 },
  { id: 'public-ip', x: 312, y: 100, width: 120 },
  { id: 'nsg', x: 312, y: 196, width: 120 },
]
const widePaths: Record<string, string> = {
  'link-os': 'M160 116 H128',
  'link-data': 'M160 124 H136 V212 H128',
  'link-nic': 'M220 132 V180',
  'link-ip': 'M288 188 H304 V116 H312',
  'link-nsg': 'M288 204 H304 V212 H312',
}
const wideNotes = [
  { id: 'nic-note', x: 220, y: 250 },
  { id: 'ip-note', x: 372, y: 146 },
  { id: 'data-note', x: 68, y: 242 },
  { id: 'nsg-note', x: 372, y: 242 },
]

export const vmResourcesScenarios: DiagramScenario[] = [
  { id: 'required', nodes: ['vm-1', 'os-disk', 'nic'], paths: [] },
  { id: 'optional', nodes: ['vm-1', 'data-disk', 'public-ip', 'nsg'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VmResourcesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenario === active?.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={vmResourcesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 288' : '0 0 280 420'}>
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
          <g className="fill-none stroke-disabled" strokeWidth="1.5">
            {Object.entries(layoutPaths).map(([id, d]) => <path key={id} data-link={id} d={d} />)}
          </g>
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
              {node.id === 'nic' && (
                <text data-note="private-ip-note" x={node.x + node.width / 2} y={node.y + 46} textAnchor="middle" className="fill-muted" fontSize="9">
                  {text.notes!['private-ip-note']}
                </text>
              )}
            </g>
          ))}
          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
