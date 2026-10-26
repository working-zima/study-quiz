import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { topics, visualsByTopicId } from '../../data/aws'
import { stripListMarker } from '../../lib/paragraph-blocks'
import { ConceptList } from '../ConceptList'
import { ComparisonTableFigure } from './ComparisonTableFigure'

const topicId = 'ecs-eks-fargate'
const concepts = topics.find(({ id }) => id === topicId)!.concepts

const orchestrationCompute = {
  id: 'orchestration-compute',
  conceptId: 'ecs-eks-fargate.container-orchestration',
  label: '오케스트레이션 서비스와 컨테이너를 올리는 곳',
  columns: ['서비스', 'EC2 인스턴스에 올리면', 'Fargate에 올리면'],
  columnWidths: ['20%', '40%', '40%'],
  sources: [
    'ecs-eks-fargate.container-orchestration',
    'ecs-eks-fargate.ecs',
    'ecs-eks-fargate.fargate',
    'ecs-eks-fargate.eks',
    'ecs-eks-fargate.eks-compute-options',
  ],
  rows: [
    {
      header: 'ECS',
      cells: ['사용자가 EC2 인스턴스를 직접 관리한다. 구성을 조정할 수 있는 대신 운영 부담이 크다', '서버 관리와 확장·축소를 AWS가 맡는다'],
    },
    {
      header: 'EKS',
      cells: ['EC2 인스턴스의 패치와 관리가 사용자 몫이다. 관리를 거드는 방식을 써도 그대로다', '인스턴스도 클러스터 용량도 프로비저닝하지 않는다'],
    },
  ],
}

const eksRouting = {
  id: 'eks-routing',
  conceptId: 'ecs-eks-fargate.eks-aws-load-balancer-controller',
  label: '경로별로 나눠 보낼 때 견주는 구성',
  columns: ['구성', '하는 일', '비용과 운영'],
  columnWidths: ['30%', '38%', '32%'],
  sources: ['ecs-eks-fargate.eks-aws-load-balancer-controller'],
  rows: [
    { header: 'Ingress와 ALB', cells: ['컨트롤러가 Ingress를 읽어 ALB를 만들고, ALB가 7계층에서 경로별로 나눈다', '클러스터 안에 라우팅 계층을 더 세우지 않는다'] },
    { header: 'NLB와 인그레스 게이트웨이', cells: ['NLB는 4계층이라 경로를 보지 못해 게이트웨이를 따로 붙인다', '비용과 운영이 함께 늘어난다'] },
    { header: 'API Gateway', cells: ['스로틀링이나 사용량 계획 같은 API 관리 기능을 더한다', '단순한 경로 분기에는 요청당 비용과 구성이 더 붙는다'] },
  ],
}

const eksHybrid = {
  id: 'eks-hybrid',
  conceptId: 'ecs-eks-fargate.eks-anywhere',
  label: 'AWS 밖의 쿠버네티스 클러스터를 다룰 때 견주는 것',
  columns: ['방법', '기존 클러스터', '하는 일'],
  // 스크롤 막대(15px)가 낀 320px에서 표 폭은 273px이다. 35%여야 행 머리의 마이그레이션(굵기 500, 84px)이 그 폭에서도 들어간다.
  columnWidths: ['35%', '24%', '41%'],
  sources: ['ecs-eks-fargate.eks', 'ecs-eks-fargate.eks-connector', 'ecs-eks-fargate.eks-anywhere'],
  rows: [
    { header: 'EKS Connector', cells: ['그대로 둔다', '외부 클러스터를 AWS에 등록해 EKS 콘솔에서 함께 보이게 한다'] },
    { header: 'EKS Anywhere', cells: ['데이터 센터에 새로 세운다', '자기 데이터 센터에서 쿠버네티스를 운영한다. 흩어진 클러스터를 모아 보는 수단은 아니다'] },
    { header: 'EKS로 마이그레이션', cells: ['AWS로 옮긴다', '코드와 배포 프로세스를 그대로 쓰며 EKS에서 운영한다'] },
    { header: '모니터링 도구', cells: ['그대로 둔다', '지표와 로그로 클러스터의 상태를 보여 준다. 클러스터 목록은 모으지 않는다'] },
  ],
}

const computeChoice = {
  id: 'compute-choice',
  conceptId: 'ecs-eks-fargate.app2container',
  label: '컨테이너와 함께 비교되는 실행 방식',
  columns: ['서비스', '서버 관리', '맞는 작업'],
  // 273px 표에서 39%여야 App2Container(굵기 500, 95.2px)가 들어간다. 맞는 작업 열 37%에는 애플리케이션(84px)까지만 들어간다.
  columnWidths: ['39%', '24%', '37%'],
  sources: [
    'ecs-eks-fargate.fargate',
    'ecs-eks-fargate.fargate-no-time-limit',
    'ecs-eks-fargate.fargate-per-second-billing',
    'ecs-eks-fargate.ecs',
    'ecs-eks-fargate.elastic-beanstalk',
    'ecs-eks-fargate.aws-batch',
    'ecs-eks-fargate.batch-fargate-compute-environment',
    'ecs-eks-fargate.app2container',
  ],
  rows: [
    { header: 'AWS Lambda', cells: ['없다', '15분 안에 끝나는 짧은 작업. 수십 초짜리는 Fargate보다 싸다'] },
    { header: 'AWS Fargate', cells: ['없다', '15분을 넘기는 컨테이너 작업. 실행 시간 제한이 없고 최소 1분이 과금된다'] },
    { header: 'EC2 기반 ECS', cells: ['사용자가 EC2를 관리한다', '구성을 직접 조정해야 하는 컨테이너 작업'] },
    { header: 'AWS Elastic Beanstalk', cells: ['줄지만 EC2가 남는다', '함수 단위로 쪼갤 수 없는 애플리케이션 코드를 그대로 올릴 때'] },
    { header: 'AWS Batch', cells: ['Fargate 환경이면 없다', '여러 작업을 모아 처리하는 배치. 순서대로 잇는 워크플로는 Step Functions 몫이다'] },
    { header: 'AWS App2Container', cells: ['실행 환경이 아니다', '이미 돌고 있는 Java·.NET 애플리케이션. 거의 고치지 않고 컨테이너 이미지로 바꾼다'] },
  ],
}

const expectedTables = [orchestrationCompute, eksRouting, eksHybrid, computeChoice]

function comparisonTable(id: string) {
  const visuals = visualsByTopicId[topicId]
  expect(visuals).toBeDefined()
  const table = visuals.tables[id]
  expect(table).toBeDefined()
  return table
}

function allTexts(id: string) {
  const table = comparisonTable(id)
  return [...table.columns, ...table.rows.flatMap(({ header, cells }) => [header, ...cells])]
}

describe('컨테이너 비교표', () => {
  it('주제의 시각 요소가 로더에 있고 약어 툴팁은 없다', () => {
    const visuals = visualsByTopicId[topicId]
    expect(visuals).toBeDefined()
    expect(visuals.glossary).toEqual([])
  })

  it('네 표 어디에도 가능·불가 판정과 O·X·○·× 한 글자 판정이 없다', () => {
    for (const { id } of expectedTables) {
      for (const text of allTexts(id)) {
        expect(text, `${id}: ${text}`).not.toMatch(/가능|불가/u)
        expect(text.trim(), `${id}: ${text}`).not.toMatch(/^[OX○×]$/u)
      }
    }
  })

  it('오케스트레이션 표는 앵커가 정의하기 전의 말인 파드·노드를 쓰지 않는다', () => {
    for (const text of allTexts(orchestrationCompute.id)) {
      expect(text).not.toMatch(/파드|노드/u)
    }
  })

  it('실행 방식 표는 24% 열에서 끊기는 Fargate로를 쓰지 않는다', () => {
    for (const text of allTexts(computeChoice.id)) {
      expect(text).not.toContain('Fargate로')
    }
  })

  it('실행 방식 표의 맞는 작업 열은 37% 열에서 끊기는 애플리케이션+조사를 쓰지 않는다', () => {
    for (const { cells } of comparisonTable(computeChoice.id).rows) {
      expect(cells[1]).not.toMatch(/애플리케이션[가-힣]/u)
    }
  })

  describe.each(expectedTables)('$label', (expected) => {
    it('표의 이름·열·열 폭·근거가 지정한 값이다', () => {
      const table = comparisonTable(expected.id)
      expect(table.label).toBe(expected.label)
      expect(table.columns).toEqual(expected.columns)
      expect(table.columnWidths).toEqual(expected.columnWidths)
      expect(table.sources).toEqual(expected.sources)

      render(<ComparisonTableFigure table={table} />)

      expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(expected.columns)
    })

    it('행 머리와 칸 문구가 지정한 순서와 내용 그대로 나온다', () => {
      const table = comparisonTable(expected.id)
      expect(table.rows).toEqual(expected.rows)
      render(<ComparisonTableFigure table={table} />)

      expect(screen.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(expected.rows.map(({ header }) => header))
      for (const { header, cells } of expected.rows) {
        const row = screen.getByRole('rowheader', { name: header }).closest('tr')!
        expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(cells)
      }
    })

    it('colgroup의 폭이 지정한 값이다', () => {
      render(<ComparisonTableFigure table={comparisonTable(expected.id)} />)

      const widths = Array.from(screen.getByRole('table').querySelectorAll('colgroup col'), (col) => (col as HTMLElement).style.width)
      expect(widths).toEqual(expected.columnWidths)
    })

    it.each([2, 4] as const)('공유 본문 h%i에서 앵커 개념의 본문 바로 뒤에 비교표 figure 하나가 나온다', (headingLevel) => {
      const concept = concepts.find(({ id }) => id === expected.conceptId)!
      render(<ConceptList concepts={[concept]} headingLevel={headingLevel} />)

      const table = screen.getByRole('figure', { name: expected.label })
      const article = table.closest('article')!
      expect(article).toHaveAttribute('id', concept.id)
      expect(within(article).getByRole('heading', { level: headingLevel, name: concept.name })).toBeInTheDocument()
      expect(screen.getAllByRole('figure')).toEqual([table])
      expect(table.previousElementSibling?.textContent).toBe(concept.paragraphs.map(stripListMarker).join('').replace(/\*\*/gu, ''))
      expect(article.lastElementChild).toBe(table)
      expect(within(table).getAllByRole('columnheader')).toHaveLength(expected.columns.length)
      expect(within(table).getAllByRole('rowheader')).toHaveLength(expected.rows.length)
    })
  })
})
