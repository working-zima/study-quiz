import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Concept } from '../types/content'
import { ConceptList } from './ConceptList'

const concepts: Concept[] = [
  { id: 'x.y', name: '첫 개념', summary: '첫 요약', paragraphs: ['첫 문단', '마지막 문단'] },
  { id: 'x.z', name: '이웃 개념', summary: '이웃 요약', paragraphs: ['이웃 문단'] },
]

function FakeDiagram() {
  return <figure aria-label="가짜 도식"><svg viewBox="0 0 100 100" /></figure>
}

describe('ConceptList', () => {
  it('빈 매핑이면 본문만 그리고 도식용 빈 요소도 남기지 않는다', () => {
    render(<ConceptList concepts={concepts} diagrams={{}} headingLevel={2} />)

    expect(screen.getByText('첫 요약')).toBeInTheDocument()
    expect(screen.getByText('첫 문단')).toBeInTheDocument()
    expect(screen.getByText('마지막 문단')).toBeInTheDocument()
    expect(screen.getByText('이웃 문단')).toBeInTheDocument()
    expect(screen.queryByRole('figure')).not.toBeInTheDocument()
    for (const article of screen.getAllByRole('article')) {
      expect(article.lastElementChild?.lastElementChild?.tagName).toBe('P')
    }
  })

  it.each([2, 4] as const)('h%i 화면에서 매핑된 개념의 모든 문단 뒤에만 도식을 붙인다', (headingLevel) => {
    render(<ConceptList concepts={concepts} diagrams={{ 'x.y': FakeDiagram }} headingLevel={headingLevel} />)

    const [first, neighbor] = screen.getAllByRole('article')
    const figure = within(first).getByRole('figure', { name: '가짜 도식' })
    expect(screen.getByRole('heading', { name: '첫 개념', level: headingLevel })).toBeInTheDocument()
    expect(first.lastElementChild).toBe(figure)
    expect(figure.previousElementSibling?.lastElementChild).toBe(screen.getByText('마지막 문단'))
    expect(within(neighbor).queryByRole('figure')).not.toBeInTheDocument()
    expect(screen.getAllByRole('figure')).toHaveLength(1)
  })

  it.each([2, 4] as const)('h%i 화면에서 배열로 준 도식을 모든 문단 뒤에 배열 순서대로 붙인다', (headingLevel) => {
    const FirstDiagram = () => <figure aria-label="첫 도식" />
    const SecondDiagram = () => <figure aria-label="둘째 도식" />

    render(
      <ConceptList
        concepts={concepts}
        diagrams={{ 'x.y': [FirstDiagram, SecondDiagram] }}
        headingLevel={headingLevel}
      />,
    )

    const [first, neighbor] = screen.getAllByRole('article')
    const firstDiagram = within(first).getByRole('figure', { name: '첫 도식' })
    const secondDiagram = within(first).getByRole('figure', { name: '둘째 도식' })
    expect(screen.getByRole('heading', { name: '첫 개념', level: headingLevel })).toBeInTheDocument()
    expect(within(first).getAllByRole('figure')).toEqual([firstDiagram, secondDiagram])
    expect(firstDiagram.previousElementSibling?.lastElementChild).toBe(screen.getByText('마지막 문단'))
    expect(firstDiagram.nextElementSibling).toBe(secondDiagram)
    expect(first.lastElementChild).toBe(secondDiagram)
    expect(within(neighbor).queryByRole('figure')).not.toBeInTheDocument()
  })

  it.each([2, 4] as const)('h%i 화면에서 요약 자리에 등록한 표를 한 줄 요약 바로 아래·본문 앞에 붙이고 본문 뒤 도식은 그대로 둔다', (headingLevel) => {
    const SummaryTable = () => <figure aria-label="요약 아래 표" />

    render(
      <ConceptList
        concepts={concepts}
        diagrams={{ 'x.y': FakeDiagram }}
        headingLevel={headingLevel}
        summaryFigures={{ 'x.y': SummaryTable }}
      />,
    )

    const [first, neighbor] = screen.getAllByRole('article')
    const table = within(first).getByRole('figure', { name: '요약 아래 표' })
    const diagram = within(first).getByRole('figure', { name: '가짜 도식' })
    const [head, , body] = Array.from(first.children)
    expect(Array.from(first.children)).toEqual([head, table, body, diagram])
    expect(head).toContainElement(screen.getByRole('heading', { name: '첫 개념', level: headingLevel }))
    expect(head.lastElementChild).toBe(screen.getByText('첫 요약'))
    expect(body.firstElementChild).toBe(screen.getByText('첫 문단'))
    expect(within(neighbor).queryByRole('figure')).not.toBeInTheDocument()
  })

  it('glossary를 주면 한 개념 안에서 같은 약어의 버튼이 하나만 생긴다', () => {
    const withTerms: Concept[] = [
      { id: 'v.a', name: 'NAT 인스턴스', summary: 'EC2로 직접 운영한다', paragraphs: ['뒤의 EC2가 느려진다', 'NACL과 달리 **EC2**다'] },
      { id: 'v.b', name: '이웃', summary: '이웃 요약', paragraphs: ['프라이빗 EC2가 나간다'] },
    ]
    const glossary = [
      { term: 'EC2', expansion: 'Elastic Compute Cloud', meaning: '빌려 쓰는 컴퓨터', sourceConceptId: 'aws-core-services.ec2' },
      { term: 'ACL', expansion: 'Access Control List', meaning: '규칙 목록', sourceConceptId: 'security-groups-nacl.nacl' },
    ]

    render(<ConceptList concepts={withTerms} diagrams={{}} glossary={glossary} headingLevel={2} />)

    const [first, neighbor] = screen.getAllByRole('article')
    expect(within(first).getAllByRole('button', { name: 'EC2' })).toHaveLength(1)
    expect(within(first).getByText(/로 직접 운영한다/)).toContainElement(within(first).getByRole('button', { name: 'EC2' }))
    expect(within(first).queryByRole('button', { name: 'ACL' })).not.toBeInTheDocument()
    expect(within(neighbor).getAllByRole('button', { name: 'EC2' })).toHaveLength(1)
  })

  it('glossary를 주지 않으면 약어가 있어도 버튼이 하나도 없다', () => {
    const withTerms: Concept[] = [{ id: 'v.a', name: 'NAT 인스턴스', summary: 'EC2로 운영한다', paragraphs: ['IAM 역할'] }]

    render(<ConceptList concepts={withTerms} diagrams={{}} headingLevel={2} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('EC2로 운영한다')).toBeInTheDocument()
  })
})

describe('딸린 개념 (ADR-041)', () => {
  const A: Concept = { id: 'A', name: 'A', summary: 'A 요약', paragraphs: ['A 문단'] }
  const B: Concept = { id: 'B', parentId: A.id, name: 'B', summary: 'B 요약', paragraphs: ['B 첫 문단', 'B 마지막 문단'] }
  const C: Concept = { id: 'C', parentId: A.id, name: 'C', summary: 'C 요약', paragraphs: ['C 문단'] }
  const D: Concept = { id: 'D', name: 'D', summary: 'D 요약', paragraphs: ['D 문단'] }

  it.each([2, 4] as const)('h%i 화면에서 딸린 개념의 제목만 한 단계 내리고 글자 모양은 유지한다', (headingLevel) => {
    render(<ConceptList concepts={[A, B, C, D]} diagrams={{}} headingLevel={headingLevel} />)

    for (const concept of [A, D]) {
      expect(screen.getByRole('heading', { level: headingLevel, name: concept.name }))
        .toHaveClass('text-base font-medium text-neutral-100')
    }
    for (const concept of [B, C]) {
      expect(screen.getByRole('heading', { level: headingLevel + 1, name: concept.name }))
        .toHaveClass('text-base font-medium text-neutral-100')
    }
  })

  it.each([2, 4] as const)('h%i 화면에서 딸린 무리를 머리 article 바로 뒤에 두고 개념 순서를 유지한다', (headingLevel) => {
    render(<ConceptList concepts={[A, B, C, D]} diagrams={{}} headingLevel={headingLevel} />)

    const articles = screen.getAllByRole('article')
    const [head, firstChild, secondChild, nextHead] = articles
    const list = head.parentElement!
    const children = firstChild.parentElement!

    expect(articles.map((article) => article.id)).toEqual(['A', 'B', 'C', 'D'])
    expect(secondChild.parentElement).toBe(children)
    expect(children.tagName).toBe('DIV')
    expect(children.previousElementSibling).toBe(head)
    expect(children.nextElementSibling).toBe(nextHead)
    expect(children).toHaveClass('space-y-8', 'border-l', 'border-border', 'pl-4', 'max-sm:[&_figure]:-ml-[37px]')
    expect(list).toHaveClass('space-y-8')
    expect(nextHead.parentElement).toBe(list)
    expect(Array.from(list.children)).toEqual([head, children, nextHead])
    expect(Array.from(children.children)).toEqual([firstChild, secondChild])
    for (const article of articles) expect(article).toHaveClass('space-y-3', 'scroll-mt-24')
  })

  it.each([2, 4] as const)('h%i 화면에서 딸린 개념의 도식도 해당 article의 마지막 문단 뒤에 둔다', (headingLevel) => {
    render(<ConceptList concepts={[A, B, C, D]} diagrams={{ [B.id]: FakeDiagram }} headingLevel={headingLevel} />)

    const child = screen.getAllByRole('article')[1]
    const figure = within(child).getByRole('figure', { name: '가짜 도식' })
    expect(figure.closest('article')).toBe(child)
    expect(child.id).toBe(B.id)
    expect(within(child).getByText(B.summary)).toBeInTheDocument()
    expect(within(child).getByText('B 첫 문단')).toBeInTheDocument()
    expect(child.lastElementChild).toBe(figure)
    expect(figure.previousElementSibling?.lastElementChild).toBe(within(child).getByText('B 마지막 문단'))
  })

  it.each([2, 4] as const)('h%i 화면에서 머리 없이 딸린 개념만 받으면 평평하게 그린다', (headingLevel) => {
    const { container } = render(<ConceptList concepts={[B]} diagrams={{}} headingLevel={headingLevel} />)

    expect(screen.getByRole('heading', { level: headingLevel, name: B.name })).toBeInTheDocument()
    expect(container.querySelector('.border-l')).toBeNull()
  })

  it.each([2, 4] as const)('h%i 화면에서 머리와 딸린 개념 사이에 다른 개념이 끼면 평평하게 그린다', (headingLevel) => {
    const { container } = render(<ConceptList concepts={[A, D, B]} diagrams={{}} headingLevel={headingLevel} />)

    expect(screen.getByRole('heading', { level: headingLevel, name: B.name })).toBeInTheDocument()
    expect(container.querySelector('.border-l')).toBeNull()
  })

  it.each([2, 4] as const)('h%i 화면에서 parentId가 없는 목록에는 딸린 무리를 만들지 않는다', (headingLevel) => {
    const { container } = render(<ConceptList concepts={[A, D]} diagrams={{}} headingLevel={headingLevel} />)

    expect(container.querySelector('.border-l')).toBeNull()
    const articles = screen.getAllByRole('article')
    expect(Array.from(articles[0].parentElement!.children)).toEqual(articles)
  })
})

describe('본문 목록 (ADR-046)', () => {
  const concept: Concept = {
    id: 'list.example',
    name: '목록 개념',
    summary: '목록 요약',
    paragraphs: ['머리 문단', '- **가**는 첫째다', '- **나**는 둘째다', '꼬리 문단'],
  }

  it('머리 문단과 꼬리 문단 사이에 목록 하나와 항목 둘을 DOM 순서대로 그린다', () => {
    render(<ConceptList concepts={[concept]} diagrams={{}} headingLevel={2} />)

    const article = screen.getByRole('article')
    const lists = within(article).getAllByRole('list')
    expect(lists).toHaveLength(1)
    expect(within(lists[0]).getAllByRole('listitem')).toHaveLength(2)
    const head = within(article).getByText('머리 문단')
    const tail = within(article).getByText('꼬리 문단')
    expect(head.tagName).toBe('P')
    expect(tail.tagName).toBe('P')
    expect(Array.from(head.parentElement!.children)).toEqual([head, lists[0], tail])
  })

  it('항목의 목록 표지는 숨기고 굵은 이름은 strong으로 그린다', () => {
    render(<ConceptList concepts={[concept]} diagrams={{}} headingLevel={2} />)

    const items = screen.getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(['가는 첫째다', '나는 둘째다'])
    for (const item of items) expect(item.textContent?.startsWith('- ')).toBe(false)
    expect(within(items[0]).getByText('가').tagName).toBe('STRONG')
    expect(within(items[1]).getByText('나').tagName).toBe('STRONG')
  })

  it('목록과 항목에 UI_GUIDE의 본문 목록 클래스를 적용한다', () => {
    render(<ConceptList concepts={[concept]} diagrams={{}} headingLevel={2} />)

    expect(screen.getByRole('list')).toHaveClass(
      'list-disc space-y-2 pl-5 text-[15px] leading-7 text-neutral-300 marker:text-neutral-500',
      { exact: true },
    )
    for (const item of screen.getAllByRole('listitem')) {
      expect(item).toHaveClass('break-keep', { exact: true })
    }
  })

  it('목록 항목에서 처음 나오는 약어만 버튼으로 그리고 표지 없이 글을 잇는다', () => {
    const withTerms: Concept = {
      ...concept,
      paragraphs: ['머리 문단', '- **가**는 NFS를 쓴다', '- **나**도 NFS를 쓴다', '꼬리 문단의 NFS'],
    }
    const glossary = [
      { term: 'NFS', expansion: 'Network File System', meaning: '네트워크 파일 시스템', sourceConceptId: 'efs-fsx.efs' },
    ]
    render(<ConceptList concepts={[withTerms]} diagrams={{}} glossary={glossary} headingLevel={2} />)

    const [first, second] = screen.getAllByRole('listitem')
    const button = within(first).getByRole('button', { name: 'NFS' })
    expect(screen.getAllByRole('button', { name: 'NFS' })).toEqual([button])
    expect(within(second).queryByRole('button')).not.toBeInTheDocument()
    expect(first.textContent).toBe('가는 NFS를 쓴다')
    expect(button.nextSibling?.textContent).toBe('를 쓴다')
    expect(second.textContent).toBe('나도 NFS를 쓴다')
    expect(screen.getByText('꼬리 문단의 NFS').tagName).toBe('P')
  })

  it('문단이 끼어 있는 두 목록은 별도의 ul로 그린다', () => {
    const separated: Concept = { ...concept, paragraphs: ['- 가', '- 나', '중간 문단', '- 다', '- 라'] }
    render(<ConceptList concepts={[separated]} diagrams={{}} headingLevel={2} />)

    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(2)
    expect(lists.map((list) => list.tagName)).toEqual(['UL', 'UL'])
    expect(lists.map((list) => within(list).getAllByRole('listitem').map((item) => item.textContent)))
      .toEqual([['가', '나'], ['다', '라']])
    const middle = screen.getByText('중간 문단')
    expect(middle.tagName).toBe('P')
    expect(Array.from(middle.parentElement!.children)).toEqual([lists[0], middle, lists[1]])
  })

  it('목록이 없는 개념은 기존 클래스의 문단만 원래 순서대로 그린다', () => {
    const plain: Concept = { ...concept, paragraphs: ['첫 문단', '둘째 문단'] }
    render(<ConceptList concepts={[plain]} diagrams={{}} headingLevel={2} />)

    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    const paragraphs = plain.paragraphs.map((text) => screen.getByText(text))
    expect(Array.from(paragraphs[0].parentElement!.children)).toEqual(paragraphs)
    for (const paragraph of paragraphs) {
      expect(paragraph.tagName).toBe('P')
      expect(paragraph).toHaveClass('whitespace-pre-line break-keep text-[15px] leading-7 text-neutral-300', { exact: true })
    }
  })
})

describe('단계 목록 (ADR-050)', () => {
  const steps: Concept = {
    id: 'steps.example',
    name: '단계 개념',
    summary: '단계 요약',
    paragraphs: [
      '머리 문단',
      '1. 첫 단계',
      '  - 첫 하위',
      '    - 깊은 하위',
      '    깊은 하위의 이어지는 문단',
      '  첫 단계의 이어지는 문단',
      '2. **둘째** 단계에서 `aws_signing_helper`를 쓴다',
      '3. 셋째 단계',
      '**구간 제목**',
      '9. 아홉째 단계',
      '10. 열째 단계',
    ],
  }
  const plain: Concept = { id: 'steps.plain', name: '이웃 개념', summary: '이웃 요약', paragraphs: ['1. 이웃 단계', '2. 이웃 둘째'] }

  function FakeStepFigure({ step }: { step: number }) {
    return <figure aria-label={`${step}단계 그림`} data-step={step} />
  }

  const orderedLists = (root: HTMLElement) => Array.from(root.querySelectorAll('ol'))
  const directItems = (list: Element) => Array.from(list.children).filter((child): child is HTMLElement => child.tagName === 'LI')

  it('번호 항목을 ol로 묶고 첫 번호를 start로 두며, 구간 제목 문단이 끼면 ol을 나눈다', () => {
    render(<ConceptList concepts={[steps]} diagrams={{}} headingLevel={2} />)

    const article = screen.getByRole('article')
    const [first, second] = orderedLists(article)
    expect(orderedLists(article)).toHaveLength(2)
    expect(first).toHaveAttribute('start', '1')
    expect(second).toHaveAttribute('start', '9')
    expect(directItems(first)).toHaveLength(3)
    expect(directItems(second)).toHaveLength(2)

    const head = within(article).getByText('머리 문단')
    const section = within(article).getByText('구간 제목').parentElement!
    expect(section.tagName).toBe('P')
    expect(Array.from(head.parentElement!.children)).toEqual([head, first, section, second])
    for (const list of [first, second]) {
      expect(list).toHaveClass(
        'list-decimal space-y-4 pl-7 text-[15px] leading-7 text-neutral-300 marker:text-neutral-500',
        { exact: true },
      )
      for (const item of directItems(list)) expect(item).toHaveClass('break-keep', { exact: true })
    }
  })

  it('하위 글머리는 번호 li 안의 ul로, 2단 글머리는 그 안의 ul로, 이어지는 문단은 그 li 안의 p로 그린다', () => {
    render(<ConceptList concepts={[steps]} diagrams={{}} headingLevel={2} />)

    const [firstStep] = directItems(orderedLists(screen.getByRole('article'))[0])
    const outerList = firstStep.querySelector(':scope > ul')!
    expect(outerList).toHaveClass('mt-2 list-disc space-y-2 pl-5 marker:text-neutral-500', { exact: true })
    const [outerItem] = directItems(outerList)
    expect(outerItem).toHaveClass('break-keep', { exact: true })
    expect(outerItem.firstChild?.textContent).toBe('첫 하위')

    const innerList = outerItem.querySelector(':scope > ul')!
    expect(innerList).toHaveClass('mt-2 list-[circle] space-y-2 pl-5 marker:text-neutral-500', { exact: true })
    expect(directItems(innerList).map((item) => item.textContent)).toEqual(['깊은 하위'])
    for (const item of directItems(innerList)) expect(item).toHaveClass('break-keep', { exact: true })

    const innerParagraph = screen.getByText('깊은 하위의 이어지는 문단')
    expect(innerParagraph.tagName).toBe('P')
    expect(innerParagraph).toHaveClass('mt-2', { exact: true })
    expect(Array.from(outerItem.children)).toEqual([innerList, innerParagraph])

    const stepParagraph = screen.getByText('첫 단계의 이어지는 문단')
    expect(stepParagraph.tagName).toBe('P')
    expect(stepParagraph).toHaveClass('mt-2', { exact: true })
    expect(Array.from(firstStep.children)).toEqual([outerList, stepParagraph])
  })

  it('번호·글머리 표지와 들여쓰기 공백을 글자로 남기지 않는다', () => {
    render(<ConceptList concepts={[steps]} diagrams={{}} headingLevel={2} />)

    const article = screen.getByRole('article')
    const items = Array.from(article.querySelectorAll('li'))
    expect(items).toHaveLength(7)
    for (const item of items) expect(item.textContent).not.toMatch(/^(\s|- |\d+\. )/)
    expect(directItems(orderedLists(article)[1]).map((item) => item.textContent)).toEqual(['아홉째 단계', '열째 단계'])
    expect(screen.getByText('깊은 하위의 이어지는 문단').textContent).toBe('깊은 하위의 이어지는 문단')
    expect(screen.getByText('첫 단계의 이어지는 문단').textContent).toBe('첫 단계의 이어지는 문단')
  })

  it('단계 목록 안에서도 굵게와 백틱을 strong·code로 그린다', () => {
    render(<ConceptList concepts={[steps]} diagrams={{}} headingLevel={2} />)

    const secondStep = directItems(orderedLists(screen.getByRole('article'))[0])[1]
    expect(secondStep.textContent).toBe('둘째 단계에서 aws_signing_helper를 쓴다')
    expect(within(secondStep).getByText('둘째').tagName).toBe('STRONG')
    expect(within(secondStep).getByText('aws_signing_helper').tagName).toBe('CODE')
  })

  it('등록된 단계 그림을 번호 항목마다 항목 글 뒤·하위 목록 앞에 그 번호로 그리고, 등록이 없는 개념에는 그리지 않는다', () => {
    render(
      <ConceptList concepts={[steps, plain]} diagrams={{}} headingLevel={2} stepFigures={{ [steps.id]: FakeStepFigure }} />,
    )

    const [article, neighbor] = screen.getAllByRole('article')
    const figures = within(article).getAllByRole('figure')
    expect(figures.map((figure) => figure.getAttribute('data-step'))).toEqual(['1', '2', '3', '9', '10'])
    const stepItems = orderedLists(article).flatMap(directItems)
    figures.forEach((figure, index) => expect(figure.parentElement).toBe(stepItems[index]))

    const [firstStep] = stepItems
    const firstFigure = within(article).getByRole('figure', { name: '1단계 그림' })
    expect(firstStep.firstChild?.textContent).toBe('첫 단계')
    expect(firstStep.firstElementChild).toBe(firstFigure)
    expect(firstFigure.nextElementSibling).toBe(firstStep.querySelector(':scope > ul'))
    expect(within(neighbor).queryByRole('figure')).not.toBeInTheDocument()
  })

  it('stepFigures를 주지 않으면 등록된 그림이 없어 아무것도 끼우지 않는다', () => {
    render(<ConceptList concepts={[steps]} diagrams={{}} headingLevel={2} />)

    expect(screen.queryByRole('figure')).not.toBeInTheDocument()
  })

  it('들여쓴 문단 안의 약어에도 개념 안에서 처음 나오는 한 곳에만 툴팁을 단다', () => {
    const withTerms: Concept = {
      id: 'steps.terms',
      name: '약어 단계',
      summary: '약어 요약',
      paragraphs: ['1. 첫 단계', '  NFS를 쓴다', '  - NFS 하위', '2. NFS 둘째'],
    }
    const glossary = [
      { term: 'NFS', expansion: 'Network File System', meaning: '네트워크 파일 시스템', sourceConceptId: 'efs-fsx.efs' },
    ]
    render(<ConceptList concepts={[withTerms]} diagrams={{}} glossary={glossary} headingLevel={2} />)

    const buttons = screen.getAllByRole('button', { name: 'NFS' })
    expect(buttons).toHaveLength(1)
    const paragraph = buttons[0].closest('p')!
    expect(paragraph.textContent).toBe('NFS를 쓴다')
    expect(paragraph.parentElement?.tagName).toBe('LI')
    expect(paragraph.parentElement?.parentElement?.tagName).toBe('OL')
    const items = Array.from(screen.getByRole('article').querySelectorAll('li'))
    expect(items.map((item) => item.firstChild?.textContent)).toEqual(['첫 단계', 'NFS 하위', 'NFS 둘째'])
  })
})
