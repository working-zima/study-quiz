import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-servers'].diagrams['httpd-conf']

// 세로형은 위에 httpd.conf 박스(ServerRoot · Include · DocumentRoot 줄과, Options None을 담은 <Directory> 구역)를 두고,
// 그 아래에 Include가 끌어온 파일, 웹 브라우저가 요청한 주소, 서버가 찾아 보낼 파일을 차례로 둔다.
// Include의 화살표는 박스 왼쪽 통로(x 8)로, DocumentRoot의 화살표는 박스 오른쪽 통로(x 272)로 내려간다.
const nodes = [
  { id: 'server-root', x: 12, y: 26, width: 168 },
  { id: 'include', x: 12, y: 66, width: 168 },
  { id: 'document-root', x: 12, y: 106, width: 216 },
  { id: 'options', x: 20, y: 166, width: 92 },
  { id: 'included-file', x: 48, y: 240, width: 192 },
  { id: 'request', x: 26, y: 300, width: 228 },
  { id: 'file', x: 48, y: 360, width: 192 },
]

const groups = [
  { id: 'conf', x: 4, y: 4, width: 272, height: 224, labelX: 12, labelY: 17 },
  { id: 'section', x: 12, y: 146, width: 256, height: 74, labelX: 20, labelY: 159 },
]

const paths: Record<string, string> = {
  'include-to-file': 'M12 82 H8 V256 H48',
  'req-to-file': 'M140 332 V360',
  'root-to-file': 'M228 122 H272 V376 H240',
}

// 곁말은 자기 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'url-path', x: 134, y: 350, anchor: 'end', scenarios: ['mapping'] },
  { id: 'append', x: 144, y: 410, anchor: 'middle', scenarios: ['mapping'] },
  { id: 'scope', x: 20, y: 213, anchor: 'start', scenarios: ['directory'] },
  { id: 'find', x: 144, y: 290, anchor: 'middle', scenarios: ['server'] },
]

// 가로형은 httpd.conf 박스를 왼쪽에 두고, 끌어온 파일과 찾아 보낼 파일을 오른쪽 열에 둔다. 요청 주소는 박스 아래에 둔다.
const wideNodes = [
  { id: 'server-root', x: 12, y: 26, width: 168 },
  { id: 'include', x: 12, y: 66, width: 168 },
  { id: 'document-root', x: 12, y: 106, width: 216 },
  { id: 'options', x: 20, y: 166, width: 92 },
  { id: 'included-file', x: 252, y: 66, width: 184 },
  { id: 'request', x: 8, y: 244, width: 224 },
  { id: 'file', x: 252, y: 244, width: 184 },
]

const wideGroups = [
  { id: 'conf', x: 4, y: 4, width: 232, height: 224, labelX: 12, labelY: 17 },
  { id: 'section', x: 12, y: 146, width: 216, height: 74, labelX: 20, labelY: 159 },
]

const widePaths: Record<string, string> = {
  'include-to-file': 'M180 82 H252',
  'req-to-file': 'M232 260 H252',
  'root-to-file': 'M228 122 H344 V244',
}

// 곁말의 자리만 배치마다 다르다. 보이는 때는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'url-path', x: 120, y: 294, anchor: 'middle' },
  { id: 'append', x: 344, y: 294, anchor: 'middle' },
  { id: 'scope', x: 20, y: 213, anchor: 'start' },
  { id: 'find', x: 344, y: 114, anchor: 'middle' },
]

// 주소와 파일: 요청 주소의 경로를 DocumentRoot 뒤에 붙여 파일을 찾는다. 디렉터리 설정: <Directory> 구역 안의 줄.
// 서버 설정: ServerRoot와, 그 아래에서 찾는 Include의 파일.
export const httpdConfScenarios: DiagramScenario[] = [
  { id: 'mapping', nodes: ['document-root', 'request', 'file'], paths: ['req-to-file', 'root-to-file'] },
  { id: 'directory', nodes: ['options'], paths: [] },
  { id: 'server', nodes: ['server-root', 'include', 'included-file'], paths: ['include-to-file'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HttpdConfDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-httpd-conf-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={httpdConfScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 302' : '0 0 280 418'}>
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

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
