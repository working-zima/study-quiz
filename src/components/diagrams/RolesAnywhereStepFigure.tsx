import { useId } from 'react'
import { visualsByTopicId } from '../../data/aws'

const texts = visualsByTopicId['identity-federation'].stepFigures!['identity-federation.iam-roles-anywhere']

// 같은 대상은 모든 그림에서 같은 색이다. 파랑은 IAM Roles Anywhere와 STS, 청록은 계정 안의 역할·정책·버킷,
// 회색은 회사 쪽의 파일과 도구다(ADR-036).
const M = 'stroke-diagram-managed'
const R = 'stroke-diagram-resource'
const D = 'stroke-disabled'

const nodeColors: Record<string, string> = {
  'private-key': D, 'ca-crt': D, 'server-key': D, 'server-csr': D, 'server-crt': D, signature: D, helper: D, cli: D, arns: D,
  'trust-anchor': M, profile: M, ra: M, sts: M,
  role: R, 'trust-policy': R, bucket: R,
}

interface StepLayout {
  height: number // viewBox 높이. 폭은 208로 모든 그림이 같다.
  groups: Record<string, [x: number, y: number, width: number, height: number]>
  nodes: Record<string, [x: number, y: number, width: number]> // 높이 32
  paths: Record<string, string>
  notes: Record<string, [x: number, y: number, textAnchor: 'start' | 'middle' | 'end']>
}

// phases/65-roles-anywhere-steps/tools/step-figures.mjs의 좌표 그대로다. check-steps.mjs가 경계·겹침·교차를 검사했다.
// 라벨과 곁말 글은 identity-federation.json의 stepFigures에서 id로 읽는다.
const layouts: Record<number, StepLayout> = {
  1: {
    height: 80,
    groups: { ca: [8, 8, 192, 64] },
    nodes: { 'private-key': [24, 32, 80] },
    paths: {},
    notes: { make: [116, 52, 'start'] },
  },
  2: {
    height: 96,
    groups: { ca: [8, 8, 192, 80] },
    nodes: { 'private-key': [16, 32, 76], 'ca-crt': [116, 32, 76] },
    paths: { sign: 'M92 48 H116' },
    notes: { sign: [104, 80, 'middle'] },
  },
  3: {
    height: 176,
    groups: { ca: [8, 8, 192, 64], 'roles-anywhere': [8, 104, 192, 64] },
    nodes: { 'ca-crt': [112, 32, 80], 'trust-anchor': [112, 128, 80] },
    paths: { register: 'M152 64 V128' },
    notes: { register: [144, 92, 'end'] },
  },
  4: {
    height: 80,
    groups: { server: [8, 8, 192, 64] },
    nodes: { 'server-key': [24, 32, 80] },
    paths: {},
    notes: { make: [116, 52, 'start'] },
  },
  5: {
    height: 96,
    groups: { server: [8, 8, 192, 80] },
    nodes: { 'server-key': [16, 32, 76], 'server-csr': [116, 32, 76] },
    paths: { request: 'M92 48 H116' },
    notes: { request: [104, 80, 'middle'] },
  },
  6: {
    height: 184,
    groups: { ca: [8, 8, 192, 64], server: [8, 112, 192, 64] },
    nodes: { 'private-key': [16, 32, 80], 'ca-crt': [112, 32, 80], 'server-crt': [16, 136, 80], 'server-csr': [112, 136, 80] },
    paths: { request: 'M152 136 V72', issue: 'M64 72 V136' },
    notes: { request: [160, 96, 'start'], issue: [72, 96, 'start'] },
  },
  7: {
    height: 140,
    groups: { iam: [8, 8, 192, 124] },
    nodes: { role: [16, 32, 80] },
    paths: {},
    notes: { permission: [16, 88, 'start'], trust: [16, 104, 'start'], principal: [16, 120, 'start'] },
  },
  8: {
    height: 176,
    groups: { 'roles-anywhere': [8, 8, 192, 64], iam: [8, 104, 192, 64] },
    nodes: { profile: [16, 32, 96], role: [104, 128, 80] },
    paths: { assign: 'M64 64 V144 H104' },
    notes: { assign: [72, 92, 'start'] },
  },
  9: {
    height: 80,
    groups: { server: [8, 8, 192, 64] },
    nodes: { helper: [24, 32, 120] },
    paths: {},
    notes: { install: [156, 52, 'start'] },
  },
  10: {
    height: 216,
    groups: { server: [8, 8, 192, 136] },
    nodes: { 'server-crt': [16, 32, 80], 'server-key': [112, 32, 80], helper: [16, 96, 112], arns: [148, 96, 48], ra: [16, 176, 120] },
    paths: { crt: 'M56 64 V96', key: 'M152 64 V80 H120 V96', arns: 'M148 112 H128', request: 'M72 128 V176' },
    notes: { request: [80, 164, 'start'] },
  },
  11: {
    height: 224,
    groups: { server: [8, 8, 192, 112] },
    nodes: { 'server-key': [16, 32, 80], 'server-crt': [112, 32, 80], signature: [16, 80, 80], ra: [16, 160, 120] },
    paths: { sign: 'M56 64 V80', 'send-signature': 'M56 112 V160', 'send-crt': 'M152 64 V176 H136' },
    notes: { 'with-arns': [64, 140, 'start'], 'no-key': [16, 212, 'start'] },
  },
  12: {
    height: 208,
    groups: { 'roles-anywhere': [8, 8, 192, 192] },
    nodes: { signature: [16, 32, 80], 'server-crt': [16, 96, 80], 'trust-anchor': [16, 160, 80] },
    paths: { first: 'M56 96 V64', second: 'M56 160 V128' },
    notes: { first: [64, 84, 'start'], second: [64, 148, 'start'] },
  },
  13: {
    height: 224,
    groups: { 'roles-anywhere': [8, 8, 192, 64], iam: [8, 104, 192, 112] },
    nodes: { profile: [16, 32, 96], role: [16, 128, 96], 'trust-policy': [16, 176, 96] },
    paths: { 'in-profile': 'M64 64 V128', trusts: 'M112 192 H168 V72' },
    notes: { 'in-profile': [72, 92, 'start'], trusts: [160, 140, 'end'] },
  },
  14: {
    height: 96,
    groups: {},
    nodes: { ra: [8, 32, 120], sts: [168, 32, 32] },
    paths: { assume: 'M128 40 H168', credentials: 'M168 56 H128' },
    notes: { assume: [148, 24, 'middle'], credentials: [148, 80, 'middle'] },
  },
  15: {
    height: 264,
    groups: { server: [8, 72, 192, 184], json: [16, 152, 176, 96] },
    nodes: { ra: [8, 8, 120], helper: [16, 96, 120] },
    paths: { deliver: 'M68 40 V96', print: 'M76 128 V152' },
    notes: {
      deliver: [76, 60, 'start'],
      print: [84, 144, 'start'],
      'access-key-id': [26, 186, 'start'],
      'secret-access-key': [26, 200, 'start'],
      'session-token': [26, 214, 'start'],
      expiration: [26, 228, 'start'],
    },
  },
  16: {
    height: 80,
    groups: { server: [8, 8, 192, 64] },
    nodes: { cli: [24, 32, 80] },
    paths: {},
    notes: { install: [116, 52, 'start'] },
  },
  17: {
    height: 232,
    groups: { server: [8, 8, 192, 216], config: [16, 88, 176, 72] },
    nodes: { cli: [16, 32, 80], helper: [16, 184, 120] },
    paths: { read: 'M56 64 V88', run: 'M56 160 V184' },
    notes: {
      read: [64, 80, 'start'],
      run: [64, 176, 'start'],
      profile: [26, 122, 'start'],
      process: [26, 136, 'start'],
      region: [26, 150, 'start'],
    },
  },
  18: {
    height: 128,
    groups: {},
    nodes: { role: [16, 8, 80], bucket: [16, 88, 80] },
    paths: { allow: 'M56 40 V88' },
    notes: { allow: [64, 68, 'start'], check: [104, 108, 'start'] },
  },
  19: {
    height: 232,
    groups: { server: [8, 8, 192, 152] },
    nodes: { cli: [16, 32, 80], helper: [16, 104, 120], bucket: [144, 192, 56] },
    paths: { run: 'M40 64 V104', credentials: 'M80 104 V64', upload: 'M96 48 H184 V192' },
    notes: {
      run: [48, 88, 'start'],
      credentials: [88, 88, 'start'],
      rerun: [16, 150, 'start'],
      upload: [176, 180, 'end'],
    },
  },
}

// 단계 목록의 번호 항목 글 바로 아래에 붙는 정지 그림(ADR-050). 버튼·캡션 없이 배치 하나이고 모든 경로와 곁말이 늘 보인다.
export function RolesAnywhereStepFigure({ step }: { step: number }) {
  const arrowId = `${useId()}-roles-anywhere-step-arrow`
  const text = texts[step]
  const { height, groups, nodes, paths, notes } = layouts[step]

  // 틀은 그림 폭(288 + 테두리 2)에서 멈춘다. 딸린 개념 무리가 본문 뒤 도식을 화면 끝까지 끌어내는 `-ml-[37px]`는
  // 목록 안의 이 틀에는 맞지 않아 `!ml-0`으로 막는다 — 그림은 그 단계 글과 한 항목으로 묶여야 한다.
  return (
    <figure aria-label={text.label} className="mt-2 !ml-0 max-w-[290px] rounded-md border border-border bg-panel">
      <svg aria-label={text.label} className="block h-auto w-full max-w-[288px]" role="img" viewBox={`0 0 208 ${height}`}>
        <defs>
          <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
            <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
          </marker>
        </defs>

        <g className="fill-none stroke-disabled" strokeWidth="1">
          {Object.entries(groups).map(([id, [x, y, width, groupHeight]]) => (
            <rect key={id} data-group={id} x={x} y={y} width={width} height={groupHeight} rx="4" />
          ))}
        </g>
        {Object.entries(groups).map(([id, [x, y]]) => (
          <text key={id} data-group-label={id} x={x + 10} y={y + 14} className="fill-muted" fontSize="9">
            {text.groups?.[id]}
          </text>
        ))}

        {Object.entries(paths).map(([id, d]) => (
          <path
            key={id}
            data-path={id}
            d={d}
            className="fill-none stroke-title"
            strokeWidth="2"
            strokeLinejoin="round"
            markerEnd={`url(#${arrowId})`}
          />
        ))}

        {Object.entries(nodes).map(([id, [x, y, width]]) => (
          <g key={id} data-node={id} opacity={1}>
            <rect className={`fill-panel ${nodeColors[id]}`} x={x} y={y} width={width} height="32" rx="4" strokeWidth="1.5" />
            <text className="fill-title" x={x + width / 2} y={y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
              {text.nodes[id]}
            </text>
          </g>
        ))}

        {Object.entries(notes).map(([id, [x, y, textAnchor]]) => (
          <text key={id} data-note={id} x={x} y={y} textAnchor={textAnchor} className="fill-muted" fontSize="9">
            {text.notes![id]}
          </text>
        ))}
      </svg>
    </figure>
  )
}
