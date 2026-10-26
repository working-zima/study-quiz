import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { boxesOutsideViewBox, estimateTextWidth } from '../../lib/svg-bounds'
import { ConceptList } from '../ConceptList'
import { RolesAnywhereStepFigure } from './RolesAnywhereStepFigure'

const topicId = 'identity-federation'
const conceptId = `${topicId}.iam-roles-anywhere`
const M = 'stroke-diagram-managed'
const R = 'stroke-diagram-resource'
const D = 'stroke-disabled'

// 아래 셋은 phases/65-roles-anywhere-steps/tools/step-figures.mjs를 그대로 옮긴 설계본이다.
// check-steps.mjs가 그 설계본의 경계·겹침·교차를 검사했으므로 그림은 이것과 글자 하나까지 같아야 한다.
const nodeTexts: Record<string, [string, string]> = {
  'private-key': ['private.key', D],
  'ca-crt': ['ca.crt', D],
  'server-key': ['server.key', D],
  'server-csr': ['server.csr', D],
  'server-crt': ['server.crt', D],
  signature: ['디지털 서명', D],
  helper: ['aws_signing_helper', D],
  cli: ['AWS CLI', D],
  arns: ['ARN 셋', D],
  'trust-anchor': ['신뢰 앵커', M],
  profile: ['S3UploadProfile', M],
  ra: ['IAM Roles Anywhere', M],
  sts: ['STS', M],
  role: ['S3UploadRole', R],
  'trust-policy': ['신뢰 정책', R],
  bucket: ['S3 버킷', R],
}

const groupTexts: Record<string, string> = {
  ca: '인증 기관',
  server: '회사 서버',
  'roles-anywhere': 'IAM Roles Anywhere',
  iam: 'IAM',
  json: 'JSON',
  config: '~/.aws/config',
}

interface FigureDesign {
  label: string
  height: number
  groups: Record<string, [number, number, number, number]>
  nodes: Record<string, [number, number, number]>
  paths: Record<string, string>
  notes: Record<string, [number, number, 'start' | 'middle' | 'end', string]>
}

const design: Record<number, FigureDesign> = {
  1: {
    label: '1단계 그림: 인증 기관에서 OpenSSL로 private.key를 만든다',
    height: 80,
    groups: { ca: [8, 8, 192, 64] },
    nodes: { 'private-key': [24, 32, 80] },
    paths: {},
    notes: { make: [116, 52, 'start', 'OpenSSL로 생성'] },
  },
  2: {
    label: '2단계 그림: private.key로 자체 서명해 ca.crt를 만든다',
    height: 96,
    groups: { ca: [8, 8, 192, 80] },
    nodes: { 'private-key': [16, 32, 76], 'ca-crt': [116, 32, 76] },
    paths: { sign: 'M92 48 H116' },
    notes: { sign: [104, 80, 'middle', '자체 서명'] },
  },
  3: {
    label: '3단계 그림: ca.crt를 IAM Roles Anywhere에 등록해 신뢰 앵커를 만든다',
    height: 176,
    groups: { ca: [8, 8, 192, 64], 'roles-anywhere': [8, 104, 192, 64] },
    nodes: { 'ca-crt': [112, 32, 80], 'trust-anchor': [112, 128, 80] },
    paths: { register: 'M152 64 V128' },
    notes: { register: [144, 92, 'end', '등록'] },
  },
  4: {
    label: '4단계 그림: 회사 서버에서 OpenSSL로 server.key를 만든다',
    height: 80,
    groups: { server: [8, 8, 192, 64] },
    nodes: { 'server-key': [24, 32, 80] },
    paths: {},
    notes: { make: [116, 52, 'start', 'OpenSSL로 생성'] },
  },
  5: {
    label: '5단계 그림: server.key의 공개키와 서버 이름으로 server.csr를 만든다',
    height: 96,
    groups: { server: [8, 8, 192, 80] },
    nodes: { 'server-key': [16, 32, 76], 'server-csr': [116, 32, 76] },
    paths: { request: 'M92 48 H116' },
    notes: { request: [104, 80, 'middle', '공개키·서버 이름'] },
  },
  6: {
    label: '6단계 그림: server.csr를 인증 기관에 내고 server.crt를 발급받는다',
    height: 184,
    groups: { ca: [8, 8, 192, 64], server: [8, 112, 192, 64] },
    nodes: { 'private-key': [16, 32, 80], 'ca-crt': [112, 32, 80], 'server-crt': [16, 136, 80], 'server-csr': [112, 136, 80] },
    paths: { request: 'M152 136 V72', issue: 'M64 72 V136' },
    notes: { request: [160, 96, 'start', '신청'], issue: [72, 96, 'start', '발급'] },
  },
  7: {
    label: '7단계 그림: S3UploadRole에 권한 정책과 신뢰 정책을 둔다',
    height: 140,
    groups: { iam: [8, 8, 192, 124] },
    nodes: { role: [16, 32, 80] },
    paths: {},
    notes: {
      permission: [16, 88, 'start', '권한 정책: s3:PutObject 허용'],
      trust: [16, 104, 'start', '신뢰 정책: 서비스 주체'],
      principal: [16, 120, 'start', 'rolesanywhere.amazonaws.com'],
    },
  },
  8: {
    label: '8단계 그림: S3UploadProfile에 S3UploadRole을 지정한다',
    height: 176,
    groups: { 'roles-anywhere': [8, 8, 192, 64], iam: [8, 104, 192, 64] },
    nodes: { profile: [16, 32, 96], role: [104, 128, 80] },
    paths: { assign: 'M64 64 V144 H104' },
    notes: { assign: [72, 92, 'start', '지정'] },
  },
  9: {
    label: '9단계 그림: 회사 서버에 aws_signing_helper를 설치한다',
    height: 80,
    groups: { server: [8, 8, 192, 64] },
    nodes: { helper: [24, 32, 120] },
    paths: {},
    notes: { install: [156, 52, 'start', '설치'] },
  },
  10: {
    label: '10단계 그림: server.crt·server.key·ARN 셋으로 aws_signing_helper가 IAM Roles Anywhere에 발급을 요청한다',
    height: 216,
    groups: { server: [8, 8, 192, 136] },
    nodes: { 'server-crt': [16, 32, 80], 'server-key': [112, 32, 80], helper: [16, 96, 112], arns: [148, 96, 48], ra: [16, 176, 120] },
    paths: { crt: 'M56 64 V96', key: 'M152 64 V80 H120 V96', arns: 'M148 112 H128', request: 'M72 128 V176' },
    notes: { request: [80, 164, 'start', '발급 요청 (테스트)'] },
  },
  11: {
    label: '11단계 그림: server.key로 만든 디지털 서명과 server.crt를 IAM Roles Anywhere에 보낸다',
    height: 224,
    groups: { server: [8, 8, 192, 112] },
    nodes: { 'server-key': [16, 32, 80], 'server-crt': [112, 32, 80], signature: [16, 80, 80], ra: [16, 160, 120] },
    paths: { sign: 'M56 64 V80', 'send-signature': 'M56 112 V160', 'send-crt': 'M152 64 V176 H136' },
    notes: { 'with-arns': [64, 140, 'start', '세 ARN과 함께 전송'], 'no-key': [16, 212, 'start', '개인키 자체는 보내지 않는다'] },
  },
  12: {
    label: '12단계 그림: 공개키로 디지털 서명을 검증한 뒤 ca.crt로 server.crt를 확인한다',
    height: 208,
    groups: { 'roles-anywhere': [8, 8, 192, 192] },
    nodes: { signature: [16, 32, 80], 'server-crt': [16, 96, 80], 'trust-anchor': [16, 160, 80] },
    paths: { first: 'M56 96 V64', second: 'M56 160 V128' },
    notes: { first: [64, 84, 'start', '1 공개키로 검증'], second: [64, 148, 'start', '2 ca.crt로 확인'] },
  },
  13: {
    label: '13단계 그림: 프로필에 역할이 등록돼 있는지, 역할의 신뢰 정책이 IAM Roles Anywhere를 신뢰하는지 확인한다',
    height: 224,
    groups: { 'roles-anywhere': [8, 8, 192, 64], iam: [8, 104, 192, 112] },
    nodes: { profile: [16, 32, 96], role: [16, 128, 96], 'trust-policy': [16, 176, 96] },
    paths: { 'in-profile': 'M64 64 V128', trusts: 'M112 192 H168 V72' },
    notes: { 'in-profile': [72, 92, 'start', '1 등록돼 있나'], trusts: [160, 140, 'end', '2 신뢰하나'] },
  },
  14: {
    label: '14단계 그림: IAM Roles Anywhere가 STS에 AssumeRole을 호출해 임시 자격 증명을 받는다',
    height: 96,
    groups: {},
    nodes: { ra: [8, 32, 120], sts: [168, 32, 32] },
    paths: { assume: 'M128 40 H168', credentials: 'M168 56 H128' },
    notes: { assume: [148, 24, 'middle', 'AssumeRole'], credentials: [148, 80, 'middle', '임시 자격 증명'] },
  },
  15: {
    label: '15단계 그림: 임시 자격 증명이 aws_signing_helper에 전달돼 네 값이 JSON으로 출력된다',
    height: 264,
    groups: { server: [8, 72, 192, 184], json: [16, 152, 176, 96] },
    nodes: { ra: [8, 8, 120], helper: [16, 96, 120] },
    paths: { deliver: 'M68 40 V96', print: 'M76 128 V152' },
    notes: {
      deliver: [76, 60, 'start', '임시 자격 증명'],
      print: [84, 144, 'start', '출력'],
      'access-key-id': [26, 186, 'start', 'Access Key ID'],
      'secret-access-key': [26, 200, 'start', 'Secret Access Key'],
      'session-token': [26, 214, 'start', 'Session Token'],
      expiration: [26, 228, 'start', 'Expiration'],
    },
  },
  16: {
    label: '16단계 그림: 회사 서버에 AWS CLI를 설치한다',
    height: 80,
    groups: { server: [8, 8, 192, 64] },
    nodes: { cli: [24, 32, 80] },
    paths: {},
    notes: { install: [116, 52, 'start', '설치'] },
  },
  17: {
    label: '17단계 그림: AWS CLI가 ~/.aws/config의 s3-logs 프로필을 읽어 aws_signing_helper를 실행한다',
    height: 232,
    groups: { server: [8, 8, 192, 216], config: [16, 88, 176, 72] },
    nodes: { cli: [16, 32, 80], helper: [16, 184, 120] },
    paths: { read: 'M56 64 V88', run: 'M56 160 V184' },
    notes: {
      read: [64, 80, 'start', '읽는다'],
      run: [64, 176, 'start', '실행'],
      profile: [26, 122, 'start', '[profile s3-logs]'],
      process: [26, 136, 'start', 'credential_process = …'],
      region: [26, 150, 'start', 'region = ap-northeast-2'],
    },
  },
  18: {
    label: '18단계 그림: S3 버킷을 만들거나 확인하고, S3UploadRole이 그 버킷에 s3:PutObject를 허용하는지 본다',
    height: 128,
    groups: {},
    nodes: { role: [16, 8, 80], bucket: [16, 88, 80] },
    paths: { allow: 'M56 40 V88' },
    notes: { allow: [64, 68, 'start', 's3:PutObject 허용'], check: [104, 108, 'start', '생성 또는 확인'] },
  },
  19: {
    label: '19단계 그림: AWS CLI가 aws_signing_helper로 임시 자격 증명을 받아 aws s3 cp로 S3 버킷에 올린다',
    height: 232,
    groups: { server: [8, 8, 192, 152] },
    nodes: { cli: [16, 32, 80], helper: [16, 104, 120], bucket: [144, 192, 56] },
    paths: { run: 'M40 64 V104', credentials: 'M80 104 V64', upload: 'M96 48 H184 V192' },
    notes: {
      run: [48, 88, 'start', '실행'],
      credentials: [88, 88, 'start', '임시 자격 증명'],
      rerun: [16, 150, 'start', '11~15단계가 다시 일어난다'],
      upload: [176, 180, 'end', 'aws s3 cp'],
    },
  },
}

const steps = Object.keys(design).map(Number)
const stepTexts = visualsByTopicId[topicId].stepFigures?.[conceptId] ?? {}

function renderFigure(step: number) {
  render(<RolesAnywhereStepFigure step={step} />)
  return screen.getByRole('figure', { name: design[step].label })
}

describe('RolesAnywhereStepFigure', () => {
  it('데이터에 1~19단계의 문구가 있고 근거는 이 개념 하나다', () => {
    expect(steps).toEqual(Array.from({ length: 19 }, (_, index) => index + 1))
    expect(Object.keys(stepTexts)).toEqual(steps.map(String))
    for (const step of steps) expect(stepTexts[step].sources).toEqual([conceptId])
  })

  it.each(steps)('%i단계: figure와 SVG의 이름이 데이터의 label이고 버튼·캡션이 없는 정지 그림이다', (step) => {
    const figure = renderFigure(step)

    expect(stepTexts[step].label).toBe(design[step].label)
    expect(figure).toHaveClass('mt-2 !ml-0 max-w-[290px] rounded-md border border-border bg-panel', { exact: true })
    const svg = within(figure).getByRole('img', { name: design[step].label })
    expect(svg).toHaveAttribute('viewBox', `0 0 208 ${design[step].height}`)
    expect(svg).toHaveClass('block h-auto w-full max-w-[288px]', { exact: true })
    expect(within(figure).queryByRole('button')).toBeNull()
    expect(within(figure).queryByRole('heading')).toBeNull()
    expect(figure.querySelector('figcaption')).toBeNull()
  })

  // 실측(2026-10-22): 틀에 폭 제한이 없으면 768px 이상에서 틀이 627px로 퍼지고 그림은 왼쪽 288px에 멈춰 오른쪽 337px가 빈다.
  // 또 딸린 개념 무리의 `max-sm:[&_figure]:-ml-[37px]`(본문 뒤 도식을 화면 끝까지 펼치는 규칙)가 목록 안의 이 틀까지 끌어내
  // 320px에서 틀이 번호 칸 너머로 튀어나왔다. 단계 그림은 그 단계 글과 한 항목으로 묶여야 한다(UI_GUIDE 「단계 그림」).
  it('틀이 그림 폭(288px + 테두리 2px)에서 멈추고, 딸린 개념 무리의 왼쪽 당김을 받지 않는다', () => {
    const { container } = render(
      <ConceptList
        concepts={topics.find(({ id }) => id === topicId)!.concepts}
        headingLevel={2}
      />,
    )
    const figure = container.querySelector<HTMLElement>(`[id="${conceptId}"] figure`)!

    expect(figure.closest('.max-sm\\:\\[\\&_figure\\]\\:-ml-\\[37px\\]')).not.toBeNull()
    expect(figure).toHaveClass('max-w-[290px]', '!ml-0')
  })

  it.each(steps)('%i단계: 노드·그룹·경로·곁말의 id와 좌표가 설계본과 같다', (step) => {
    const figure = renderFigure(step)
    const { groups, nodes, paths, notes } = design[step]

    const nodeBoxes = Array.from(figure.querySelectorAll('[data-node]')).map((node) => {
      const id = node.getAttribute('data-node')!
      const rect = node.querySelector('rect')!
      expect(rect).toHaveAttribute('height', '32')
      expect(rect).toHaveClass(nodeTexts[id][1])
      expect(node).toHaveAttribute('opacity', '1')
      return [id, ['x', 'y', 'width'].map((name) => Number(rect.getAttribute(name)))]
    })
    expect(Object.fromEntries(nodeBoxes)).toEqual(nodes)

    const groupBoxes = Array.from(figure.querySelectorAll('rect[data-group]')).map((rect) => (
      [rect.getAttribute('data-group'), ['x', 'y', 'width', 'height'].map((name) => Number(rect.getAttribute(name)))]
    ))
    expect(Object.fromEntries(groupBoxes)).toEqual(groups)
    const groupLabels = Array.from(figure.querySelectorAll('[data-group-label]')).map((label) => (
      [label.getAttribute('data-group-label'), [Number(label.getAttribute('x')), Number(label.getAttribute('y'))]]
    ))
    expect(Object.fromEntries(groupLabels)).toEqual(
      Object.fromEntries(Object.entries(groups).map(([id, [x, y]]) => [id, [x + 10, y + 14]])),
    )

    const markerId = figure.querySelector('marker')!.id
    const drawn = Array.from(figure.querySelectorAll('[data-path]')).map((path) => {
      expect(path).toHaveAttribute('marker-end', `url(#${markerId})`)
      return [path.getAttribute('data-path'), path.getAttribute('d')]
    })
    expect(Object.fromEntries(drawn)).toEqual(paths)

    const placed = Array.from(figure.querySelectorAll('[data-note]')).map((note) => (
      [note.getAttribute('data-note'), [Number(note.getAttribute('x')), Number(note.getAttribute('y')), note.getAttribute('text-anchor')]]
    ))
    expect(Object.fromEntries(placed)).toEqual(
      Object.fromEntries(Object.entries(notes).map(([id, [x, y, anchor]]) => [id, [x, y, anchor]])),
    )
  })

  it.each(steps)('%i단계: 모든 상자가 viewBox 안이고 노드 라벨이 상자에 들어간다', (step) => {
    const figure = renderFigure(step)
    const boxes = Array.from(figure.querySelectorAll('rect')).map((rect) => ({
      id: rect.getAttribute('data-group') ?? rect.parentElement?.getAttribute('data-node') ?? '',
      x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
      width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
    }))

    expect(boxes).toHaveLength(Object.keys(design[step].nodes).length + Object.keys(design[step].groups).length)
    expect(boxesOutsideViewBox(boxes, [0, 0, 208, design[step].height])).toEqual([])
    for (const [id, [, , width]] of Object.entries(design[step].nodes)) {
      expect(estimateTextWidth(nodeTexts[id][0], 10) + 12, id).toBeLessThanOrEqual(width)
    }
  })

  it.each(steps)('%i단계: 노드 라벨·그룹 라벨·곁말 글이 데이터와 같고 데이터는 설계본과 같다', (step) => {
    const figure = renderFigure(step)
    const text = stepTexts[step]
    const { groups, nodes, notes } = design[step]

    expect(text.nodes).toEqual(Object.fromEntries(Object.keys(nodes).map((id) => [id, nodeTexts[id][0]])))
    expect(text.groups ?? {}).toEqual(Object.fromEntries(Object.keys(groups).map((id) => [id, groupTexts[id]])))
    expect(text.notes ?? {}).toEqual(Object.fromEntries(Object.entries(notes).map(([id, note]) => [id, note[3]])))

    for (const node of figure.querySelectorAll('[data-node]')) {
      const label = node.querySelector('text')!
      expect(label.textContent).toBe(text.nodes[node.getAttribute('data-node')!])
      expect(label).toHaveAttribute('font-size', '10')
    }
    for (const label of figure.querySelectorAll('[data-group-label]')) {
      expect(label.textContent).toBe(text.groups![label.getAttribute('data-group-label')!])
      expect(label).toHaveAttribute('font-size', '9')
    }
    for (const note of figure.querySelectorAll('[data-note]')) {
      expect(note.textContent).toBe(text.notes![note.getAttribute('data-note')!])
      expect(note).toHaveAttribute('font-size', '9')
    }
  })

  it('실제 개념을 그리면 번호 항목 19개마다 그 항목 글 바로 뒤에 그 번호의 단계 그림을 두고, 다른 개념에는 두지 않는다', () => {
    const topic = topics.find(({ id }) => id === topicId)!
    render(<ConceptList concepts={topic.concepts} headingLevel={2} />)

    const article = document.getElementById(conceptId)!
    const items = Array.from(article.querySelectorAll('ol')).flatMap((list) => (
      Array.from(list.children).filter((child) => child.tagName === 'LI')
    ))
    const figures = Array.from(article.querySelectorAll('figure'))
    expect(items).toHaveLength(19)
    expect(figures.map((figure) => figure.getAttribute('aria-label'))).toEqual(steps.map((step) => design[step].label))
    figures.forEach((figure, index) => {
      const children = Array.from(items[index].children)
      expect(figure.parentElement).toBe(items[index])
      // 그림 앞에는 항목 글의 굵게·코드 조각만 있고, 그림 뒤에는 하위 목록이나 이어지는 문단이 온다.
      for (const element of children.slice(0, children.indexOf(figure))) expect(['STRONG', 'CODE']).toContain(element.tagName)
      expect(['UL', 'P', undefined]).toContain(figure.nextElementSibling?.tagName)
    })

    for (const other of screen.getAllByRole('article').filter((candidate) => candidate !== article)) {
      for (const figure of other.querySelectorAll('figure')) {
        expect(figure.getAttribute('aria-label')).not.toMatch(/단계 그림/)
      }
    }
  })
})
