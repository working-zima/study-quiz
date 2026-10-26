import { describe, expect, it } from 'vitest'

import { questions, topics } from './index'
import { hierarchyProblems } from '../../lib/concept-groups'
import { isListItem } from '../../lib/paragraph-blocks'

describe('학습 데이터 무결성', () => {
  it('보안·비용 보충 개념 23개가 지정된 주제의 개념 배열 끝에 추가된다', () => {
    const expectedSlugs: Record<string, string[]> = {
      'security-groups-nacl': [
        'security-group-referencing',
        'nacl-rule-limit',
        'web-acl-vs-nacl',
      ],
      // step 18이 dump-gaps의 신규 11개념을 더하며 이 주제도 3단으로 정렬했다.
      'secrets-encryption': [
        'acm-cloudfront-region',
        'lambda-env-var-kms',
        'cloudhsm',
        'rotation-heuristic',
      ],
      // phase 26 step 18이 threat-protection을 WAF·Shield 쪽과 탐지 서비스 쪽으로
      // 갈랐다. 여섯 개념이 두 주제로 흩어졌고 둘 다 3단으로 정렬돼 배열 끝이 아니다.
      'waf-shield': [
        'waf-attach-targets',
        'waf-bot-control',
        'waf-rule-types',
        'shield-advanced-drt',
      ],
      'guardduty-macie-inspector': [
        'guardduty-db-login',
        'security-service-lineup',
      ],
      // phase 26 step 17이 identity-access를 IAM 권한 · 페더레이션 · 조직·감사 셋으로
      // 갈랐다. 여섯 개념이 세 주제로 흩어졌고 셋 다 3단으로 정렬돼 배열 끝이 아니다.
      'iam-permissions': [
        'least-privilege',
        'instance-profile',
        'iam-group-users-only',
      ],
      'identity-federation': [
        'sts-assume-role',
        'cognito-pools',
      ],
      'organizations-cloudtrail-config': [
        'organizations-scp',
      ],
      'cost-management': [
        'cost-allocation-tag-activation',
        'savings-plan-details',
        'cost-anomaly-detection',
        'compute-optimizer',
      ],
    }

    // phase 26 step 14가 security-groups-nacl의 개념을 3단(기본 → 갈림길 → 한계)으로
    // 정렬해, 이 세 개념은 더 이상 배열 끝이 아니다. 주제의 전체 순서는 아래
    // 「보안 그룹·NACL 주제가 ...」가 개념 id 전부로 못박는다.
    const reordered = new Set([
      'security-groups-nacl',
      'secrets-encryption',
      'waf-shield',
      'guardduty-macie-inspector',
      'iam-permissions',
      'identity-federation',
      'organizations-cloudtrail-config',
      // step 19가 cost-management에 dump-gaps의 신규 8개념을 더하며 3단으로 정렬해,
      // 이 넷도 더 이상 배열 끝이 아니다.
      'cost-management',
    ])

    Object.entries(expectedSlugs).forEach(([topicId, slugs]) => {
      const topic = topics.find(({ id }) => id === topicId)
      const conceptIds = topic?.concepts.map(({ id }) => id) ?? []
      const wanted = slugs.map((slug) => `${topicId}.${slug}`)

      if (reordered.has(topicId)) {
        wanted.forEach((conceptId) => expect(conceptIds).toContain(conceptId))
        return
      }
      expect(conceptIds.slice(-slugs.length)).toEqual(wanted)
    })
  })

  it('네트워크·라우팅·분석 보충 개념 15개가 지정된 주제의 개념 배열 끝에 추가된다', () => {
    const expectedSlugs: Record<string, string[]> = {
      'vpc-networking': [
        'endpoint-pricing',
        'egress-only-igw',
        'nat-instance',
        'vpc-peering-scaling-limit',
        's3-is-regional',
      ],
      'hybrid-connectivity': [
        'direct-connect-caveats',
        'direct-connect-gateway',
        'client-vpn',
        'access-terms',
        'data-locality-cost',
        'onprem-connectivity-heuristic',
      ],
      route53: ['private-hosted-zone', 'multivalue-answer-details'],
      // phase 26 step 15가 analytics-monitoring에서 분석·스트리밍 계열을 빼내며
      // Glue Crawler를 emr-glue-athena로 옮겼고, step 16이 남은 CloudWatch·X-Ray
      // 계열을 cloudwatch-xray로 옮기며 analytics-monitoring을 없앴다
      // (topic-plan "주제 목록").
      'emr-glue-athena': ['glue-crawler'],
      'cloudwatch-xray': ['log-analysis-options'],
    }

    // phase 26 step 14가 두 네트워크 주제의 개념을 3단(기본 → 갈림길 → 한계)으로
    // 정렬했고 step 15가 emr-glue-athena를, step 16이 route53·cloudwatch-xray를 같은
    // 방식으로 세웠다. 그래서 이 개념들은 더 이상 배열 끝이 아니다. 각 주제의 전체
    // 순서는 아래 「VPC 주제가 ...」·「하이브리드 연결 주제가 ...」·
    // 「EMR·Glue·Athena 주제가 ...」·「Route 53 주제가 ...」·
    // 「CloudWatch·X-Ray 주제가 ...」가 개념 id 전부로 못박는다.
    const reordered = new Set([
      'vpc-networking',
      'hybrid-connectivity',
      'emr-glue-athena',
      'route53',
      'cloudwatch-xray',
    ])

    Object.entries(expectedSlugs).forEach(([topicId, slugs]) => {
      const topic = topics.find(({ id }) => id === topicId)
      const conceptIds = topic?.concepts.map(({ id }) => id) ?? []
      const wanted = slugs.map((slug) => `${topicId}.${slug}`)

      if (reordered.has(topicId)) {
        wanted.forEach((conceptId) => expect(conceptIds).toContain(conceptId))
        return
      }
      expect(conceptIds.slice(-slugs.length)).toEqual(wanted)
    })
  })

  it('컴퓨팅·메시징 보충 개념 21개가 지정된 주제의 개념 배열 끝에 추가된다', () => {
    const expectedSlugs: Record<string, string[]> = {
      // phase 26 step 8이 compute-delivery에서 EC2·ASG·ELB를 두 주제로 빼냈고,
      // step 9가 남은 CloudFront·Global Accelerator를 cloudfront-global-accelerator로
      // 옮기며 compute-delivery를 없앴다. 개념 본문은 그대로이고 접두사만 새 주제를 따른다.
      'ec2-autoscaling': ['warm-pool', 'scheduled-scaling'],
      'elastic-load-balancing': ['alb-l7-vs-nlb-l4', 'sticky-session-tradeoff'],
      // step 10이 serverless-containers에서 Lambda 계열을 lambda 주제로 빼내고,
      // 엣지에서 도는 lambda-at-edge는 CloudFront 쪽으로 보냈다
      // (topic-plan "step 경계를 넘는 개념").
      'cloudfront-global-accelerator': [
        'global-accelerator-protocols',
        'cloudfront-ttl',
        'edge-keyword',
        'lambda-at-edge',
      ],
      lambda: ['lambda-function-url', 'lambda-vpc-access'],
      // step 11이 serverless-containers의 남은 껍데기를 둘로 갈랐다. 컨테이너 계열은
      // ecs-eks-fargate로, API Gateway·Step Functions 계열은 api-gateway-step-functions로
      // 가고, messaging-backup에 있던 step-functions-features도 후자로 옮겨 온다
      // (topic-plan "step 경계를 넘는 개념").
      'ecs-eks-fargate': ['eks', 'fargate-no-time-limit', 'aws-batch'],
      'api-gateway-step-functions': ['api-gateway-jwt-authorizer', 'step-functions-features'],
      // step 12가 messaging-backup에서 메시징 계열을 sqs-sns-eventbridge로 빼냈고,
      // step 13이 AWS Backup 계열을 backup-disaster-recovery로 빼냈다. 마지막으로 남은
      // MSK는 step 15가 kinesis-streaming으로 가져가며 그 주제를 없앴다
      // (topic-plan "step 경계를 넘는 개념").
      'sqs-sns-eventbridge': [
        'sqs-details',
        'sqs-queue-depth-scaling',
        'eventbridge-scheduler',
        'ses',
      ],
      'backup-disaster-recovery': ['backup-long-term-retention'],
      'kinesis-streaming': ['msk'],
    }

    // phase 26 step 8·9·10·11·12·13·15가 아래 아홉 주제의 개념을 3단(기본 → 갈림길 →
    // 한계)으로 정렬해, 이 개념들은 더 이상 배열 끝이 아니다. 각 주제의 전체 순서는 아래
    // 「EC2·Auto Scaling 주제가 ...」·「로드 밸런서 주제가 ...」·「CloudFront·Global
    // Accelerator 주제가 ...」·「Lambda 주제가 ...」·「컨테이너 주제가 ...」·
    // 「API Gateway·Step Functions 주제가 ...」·「메시징 주제가 ...」·
    // 「백업·재해 복구 주제가 ...」·「스트리밍 주제가 ...」가 개념 id 전부로 못박는다.
    const reordered = new Set([
      'ec2-autoscaling',
      'elastic-load-balancing',
      'cloudfront-global-accelerator',
      'lambda',
      'ecs-eks-fargate',
      'api-gateway-step-functions',
      'sqs-sns-eventbridge',
      'backup-disaster-recovery',
      'kinesis-streaming',
    ])

    Object.entries(expectedSlugs).forEach(([topicId, slugs]) => {
      const topic = topics.find(({ id }) => id === topicId)
      const conceptIds = topic?.concepts.map(({ id }) => id) ?? []
      const wanted = slugs.map((slug) => `${topicId}.${slug}`)

      if (reordered.has(topicId)) {
        wanted.forEach((conceptId) => expect(conceptIds).toContain(conceptId))
        return
      }
      expect(conceptIds.slice(-slugs.length)).toEqual(wanted)
    })
  })

  it('데이터베이스 보충 개념 9개가 지정된 주제의 개념 배열 끝에 추가된다', () => {
    const expectedSlugs: Record<string, string[]> = {
      'rds-storage-features': [
        'storage-type-names',
        'multi-az-standby-limits',
        'automated-backup-retention',
        'connection-issue-heuristic',
      ],
      // phase 26 step 7이 aurora-dynamodb-cache를 세 주제로 갈랐다. 개념 본문은
      // 그대로이고 접두사만 새 주제를 따른다.
      aurora: ['aurora-serverless-v2', 'aurora-reader-endpoint'],
      dynamodb: ['dynamodb-pitr'],
      'elasticache-purpose-built-db': ['documentdb', 'dax-dynamodb-only'],
    }

    // phase 26이 아래 주제들의 개념을 3단(기본 → 갈림길 → 한계)으로 다시 정렬해,
    // 이 개념들은 더 이상 배열 끝이 아니다. 각 주제의 전체 순서는 아래
    // 「RDS 주제가 ...」 같은 테스트가 개념 id 전부로 못박는다.
    const reordered = new Set([
      'rds-storage-features',
      'aurora',
      'dynamodb',
      'elasticache-purpose-built-db',
    ])

    Object.entries(expectedSlugs).forEach(([topicId, slugs]) => {
      const topic = topics.find(({ id }) => id === topicId)
      const conceptIds = topic?.concepts.map(({ id }) => id) ?? []
      const wanted = slugs.map((slug) => `${topicId}.${slug}`)

      if (reordered.has(topicId)) {
        wanted.forEach((conceptId) => expect(conceptIds).toContain(conceptId))
        return
      }
      expect(conceptIds.slice(-slugs.length)).toEqual(wanted)
    })
  })

  it('보충 개념 9개가 지정된 주제에 그대로 남아 있다', () => {
    const expectedSlugs: Record<string, string[]> = {
      'aws-core-services': ['exam-heuristics'],
      's3-versioning-lifecycle': ['object-lock-prerequisites', 'event-notification'],
      's3-encryption-batch': ['envelope-encryption', 'sse-kms-cost'],
      // phase 26 step 4가 block-file-storage를 두 주제로 갈랐다. 개념 본문은 그대로이고
      // 접두사만 새 주제를 따른다.
      'ebs-instance-store': ['cluster-placement-group', 'ebs-elastic-volumes'],
      'efs-fsx': ['efs-lifecycle-management', 'fsx-ontap-multi-az'],
    }

    // phase 26이 아래 주제들의 개념을 3단(기본 → 갈림길 → 한계)으로 다시 정렬해,
    // 이 개념들은 더 이상 배열 끝이 아니다. aws-core-services는 정렬이 아니라
    // step 20이 (주제 미정)의 설계 원칙 둘을 3단 뒤에 붙여서 끝이 아니게 됐다.
    // 각 주제의 전체 순서는 아래 「기초 주제가 ...」·「S3 버전 관리 주제가 ...」 같은
    // 테스트가 개념 id 전부로 못박는다.
    const reordered = new Set([
      'aws-core-services',
      's3-versioning-lifecycle',
      's3-encryption-batch',
      'ebs-instance-store',
      'efs-fsx',
    ])

    Object.entries(expectedSlugs).forEach(([topicId, slugs]) => {
      const topic = topics.find(({ id }) => id === topicId)
      const conceptIds = topic?.concepts.map(({ id }) => id) ?? []
      const wanted = slugs.map((slug) => `${topicId}.${slug}`)

      if (reordered.has(topicId)) {
        wanted.forEach((conceptId) => expect(conceptIds).toContain(conceptId))
        return
      }
      expect(conceptIds.slice(-slugs.length)).toEqual(wanted)
    })
  })

  it('보충 개념 추가 후에도 39개 주제의 메타데이터가 그대로다', () => {
    // phase 66이 노션 「시험 문제 출제 유형」의 우선순위로 별점을 다시 매겼다. 1·2순위 항목을 담은 주제만 ★★★다(ADR-051).
    expect(topics.map(({ id, title, importance, sourcePages }) => ({
      id,
      title,
      importance,
      sourcePages,
    }))).toEqual([
      { id: 'aws-core-services', title: 'AWS 핵심 서비스·리전·가용 영역·온프레미스', importance: 0, sourcePages: [1, 7] },
      { id: 's3-storage-classes', title: 'S3 스토리지 클래스 유형', importance: 3, sourcePages: [8, 9] },
      { id: 's3-versioning-lifecycle', title: 'S3 버전 관리·객체 잠금·수명 주기·복제', importance: 3, sourcePages: [10, 12] },
      { id: 's3-encryption-batch', title: 'S3 암호화(SSE)·Batch Operations·인벤토리', importance: 2, sourcePages: [13, 13] },
      // phase 26 step 3이 신설했다. 근거가 dump-gaps에만 있어 concepts-raw.md 페이지가 없다.
      { id: 's3-access-control', title: 'S3 접근 제어·액세스 포인트·Storage Lens', importance: 3, sourcePages: [0, 0] },
      // phase 26 step 4가 block-file-storage를 둘로 갈랐다. EFS ↔ FSx는 공유 파일
      // 스토리지 선택이라 한 주제에 둔다(PRD "사용자").
      { id: 'ebs-instance-store', title: 'EBS·인스턴스 스토어·스냅샷·배치 그룹', importance: 2, sourcePages: [14, 15] },
      { id: 'efs-fsx', title: 'EFS·FSx(Windows·Lustre·ONTAP)', importance: 2, sourcePages: [14, 15] },
      // phase 26 step 5가 data-transfer-services를 둘로 갈랐다. "이미 있는 것을 옮긴다"는
      // Storage Gateway·DMS·MGN이 뒤쪽 주제로 나가고, 앞쪽은 전송 도구만 남는다.
      { id: 'data-transfer-services', title: 'DataSync·Snowball Edge·Transfer Family·S3 전송', importance: 2, sourcePages: [16, 18] },
      { id: 'storage-gateway-migration', title: 'Storage Gateway·DMS·Application Migration Service', importance: 2, sourcePages: [16, 18] },
      { id: 'rds-storage-features', title: 'RDS 스토리지 유형과 기능', importance: 3, sourcePages: [19, 20] },
      // phase 26 step 7이 aurora-dynamodb-cache를 셋으로 갈랐다. Aurora는 RDS 바로
      // 뒤에 두어 관리형 관계형 DB의 두 갈래가 맞붙게 하고, 캐시 갈림길
      // (ElastiCache ↔ DAX)은 목적별 데이터베이스와 한 주제에 남는다.
      { id: 'aurora', title: 'Aurora·Aurora Serverless·글로벌 데이터베이스', importance: 3, sourcePages: [21, 21] },
      { id: 'dynamodb', title: 'DynamoDB', importance: 2, sourcePages: [21, 21] },
      { id: 'elasticache-purpose-built-db', title: 'ElastiCache·DAX·Neptune·DocumentDB·QLDB·Timestream', importance: 2, sourcePages: [21, 21] },
      // phase 26 step 8이 compute-delivery에서 EC2·ASG와 로드 밸런서를 빼내 앞에
      // 놓았고, step 9가 남은 CloudFront·Global Accelerator를 옮기며 그 주제를
      // 없앴다. 셋은 같은 조각이라 배열에서 연속으로 놓인다.
      { id: 'ec2-autoscaling', title: 'EC2 인스턴스 유형·구매 옵션·Auto Scaling', importance: 3, sourcePages: [22, 24] },
      { id: 'elastic-load-balancing', title: 'ALB·NLB·Gateway Load Balancer', importance: 3, sourcePages: [22, 24] },
      { id: 'cloudfront-global-accelerator', title: 'CloudFront·Global Accelerator·엣지 함수', importance: 3, sourcePages: [22, 24] },
      // phase 26 step 10이 serverless-containers에서 Lambda 계열을 빼내 세웠고,
      // step 11이 남은 껍데기를 둘로 갈라 그 자리에 놓으며 주제를 없앴다. 셋은 같은
      // 조각이라 배열에서 연속으로 놓인다.
      { id: 'lambda', title: 'Lambda', importance: 3, sourcePages: [25, 26] },
      { id: 'ecs-eks-fargate', title: 'ECS·EKS·Fargate·Batch·ECR·Elastic Beanstalk', importance: 2, sourcePages: [25, 26] },
      { id: 'api-gateway-step-functions', title: 'API Gateway·Step Functions', importance: 2, sourcePages: [25, 26] },
      // phase 26 step 12가 messaging-backup의 메시징 계열을 빼내 그 자리에 놓았고,
      // step 13이 AWS Backup 계열과 dump-gaps의 재해 복구 계열을 그 뒤에 세웠다.
      // SQS ↔ SNS ↔ EventBridge는 메시징 세 갈래의 선택이라, DR 전략 둘은 RTO·RPO로
      // 갈리는 한 벌이라 각각 한 주제에 둔다(PRD "사용자").
      // 남아 있던 messaging-backup은 step 15가 MSK를 kinesis-streaming으로 가져가며 없앴다.
      { id: 'sqs-sns-eventbridge', title: 'SQS·SNS·EventBridge·Amazon MQ·SES', importance: 3, sourcePages: [27, 29] },
      { id: 'backup-disaster-recovery', title: 'AWS Backup·재해 복구 전략·Elastic Disaster Recovery', importance: 2, sourcePages: [27, 29] },
      // phase 26 step 14가 security-groups-nacl을 vpc-networking 바로 뒤로 옮겼다.
      // VPC를 읽은 자리에서 트래픽을 거르는 두 장치를 이어 읽고, step 14가 맡은
      // 세 주제가 배열에서 한 덩어리가 된다(topic-plan "배열 위치 근거").
      { id: 'vpc-networking', title: 'VPC·서브넷·인터넷/NAT 게이트웨이·VPC Endpoint·PrivateLink·피어링', importance: 3, sourcePages: [30, 33] },
      { id: 'security-groups-nacl', title: '보안 그룹·NACL', importance: 3, sourcePages: [41, 43] },
      { id: 'hybrid-connectivity', title: 'Site-to-Site VPN·Direct Connect·Transit Gateway', importance: 2, sourcePages: [34, 35] },
      { id: 'route53', title: 'Route 53', importance: 3, sourcePages: [36, 37] },
      // phase 26 step 15가 analytics-monitoring에서 분석·스트리밍 계열을 세 주제로
      // 빼냈다. Kinesis 4종은 한 주제에, Athena ↔ Redshift ↔ Spectrum의 갈림길은
      // 웨어하우스 쪽에 둔다(topic-plan "헷갈리는 짝 배치"). 남은 CloudWatch·X-Ray는
      // step 16이 마저 옮긴다.
      { id: 'emr-glue-athena', title: 'EMR·Spark·Glue·Athena·Lake Formation', importance: 2, sourcePages: [38, 40] },
      { id: 'kinesis-streaming', title: 'Kinesis Data Streams·Data Firehose·Flink·Video Streams·MSK', importance: 2, sourcePages: [38, 40] },
      { id: 'redshift-opensearch-quicksight', title: 'Redshift·Redshift Spectrum·OpenSearch·QuickSight', importance: 2, sourcePages: [38, 40] },
      // step 16이 남은 CloudWatch·X-Ray 계열을 그 자리에서 cloudwatch-xray로 바꿨다.
      // 지표 ↔ 로그 ↔ 경보가 한 벌이라 넷을 한 주제에 둔다(topic-plan "헷갈리는 짝 배치").
      { id: 'cloudwatch-xray', title: 'CloudWatch·X-Ray·Performance Insights·Managed Grafana', importance: 2, sourcePages: [38, 40] },
      // phase 26 step 18이 secrets-encryption에 CloudHSM을 제목으로 올리고,
      // threat-protection을 그 자리에서 둘로 갈랐다. WAF ↔ Shield ↔ Shield Advanced는
      // 계층과 대상이 갈리는 한 벌이라, GuardDuty ↔ Macie ↔ Inspector ↔ Security Hub는
      // 탐지 서비스 갈림길이라 각각 한 주제에 둔다(topic-plan "헷갈리는 짝 배치").
      { id: 'secrets-encryption', title: 'Secrets Manager·Parameter Store·KMS·ACM·CloudHSM', importance: 2, sourcePages: [44, 44] },
      { id: 'waf-shield', title: 'WAF·Shield·Firewall Manager', importance: 2, sourcePages: [45, 47] },
      { id: 'guardduty-macie-inspector', title: 'GuardDuty·Macie·Inspector·Security Hub', importance: 2, sourcePages: [45, 47] },
      // phase 26 step 17이 identity-access를 셋으로 갈라 그 자리에 놓았다. IAM 역할 ↔
      // 사용자 ↔ 정책 ↔ 권한 경계를 한 주제에, Identity Center ↔ SAML ↔ Cognito를 다른
      // 한 주제에 둔다(topic-plan "헷갈리는 짝 배치"). 감사 쪽인 CloudTrail·Config는
      // Organizations와 함께 셋째로 갈리되 배열에서 바로 뒤에 붙는다.
      { id: 'iam-permissions', title: 'IAM 사용자·그룹·역할·정책·권한 경계·Access Analyzer', importance: 3, sourcePages: [48, 49] },
      { id: 'identity-federation', title: 'IAM Identity Center·STS·Cognito·Directory Service·SAML', importance: 3, sourcePages: [48, 49] },
      { id: 'organizations-cloudtrail-config', title: 'Organizations·SCP·CloudTrail·Config·Audit Manager', importance: 2, sourcePages: [48, 49] },
      // phase 26 step 19가 cost-management 뒤에 관리·거버넌스 계열 둘을 신설했다.
      // CloudFormation ↔ Service Catalog ↔ Control Tower는 거버넌스 갈림길이라,
      // Systems Manager의 기능들은 한 서비스의 하위 기능이라 각각 한 주제에 둔다
      // (topic-plan "범위를 벗어난 주제"). 근거가 dump-gaps에만 있어
      // concepts-raw.md 페이지가 없다.
      { id: 'cost-management', title: '절약 플랜·Budgets·Cost Explorer·Trusted Advisor', importance: 2, sourcePages: [50, 50] },
      { id: 'governance-iac', title: 'CloudFormation·Service Catalog·Control Tower·RAM', importance: 2, sourcePages: [0, 0] },
      { id: 'systems-manager', title: 'Systems Manager·AppConfig·EC2 Instance Connect', importance: 2, sourcePages: [0, 0] },
      // phase 26 step 20이 배열 맨 뒤에 신설했다. 음성·이미지·번역·문서를 나눠 맡는
      // AI 서비스들은 "무엇을 하는 서비스인가"가 그대로 문항이라 한 주제에 둔다
      // (topic-plan "범위를 벗어난 주제"). 근거가 dump-gaps에만 있어
      // concepts-raw.md 페이지가 없다.
      { id: 'ai-ml-services', title: 'SageMaker·Comprehend·Rekognition·Lex·Transcribe·Translate·Textract', importance: 2, sourcePages: [0, 0] },
    ])
  })

  it('보안·운영 주제 문제 53개가 지정된 id 범위와 주제별 문항 수로 이어진다', () => {
    const expectedTopics = [
      ...Array(6).fill('route53'),
      // phase 26 step 15가 analytics-monitoring을 쪼개면서 이 여섯 문항이 세 주제로
      // 갈라졌고, step 16이 CloudWatch를 근거로 쓰는 q126을 cloudwatch-xray로 옮겼다.
      // 문항의 id 순서는 그대로이고 topicId만 자기 conceptId를 담은 주제를 따른다.
      ...Array(3).fill('emr-glue-athena'),
      'cloudwatch-xray',
      'emr-glue-athena',
      'kinesis-streaming',
      ...Array(9).fill('security-groups-nacl'),
      ...Array(8).fill('secrets-encryption'),
      // step 18이 threat-protection을 둘로 갈라 이 아홉 문항도 두 주제로 흩어졌다.
      // 문항의 id 순서는 그대로이고 topicId만 자기 conceptId를 담은 주제를 따른다.
      ...Array(4).fill('waf-shield'),
      ...Array(2).fill('guardduty-macie-inspector'),
      ...Array(3).fill('waf-shield'),
      // step 17이 identity-access를 셋으로 갈라 이 아홉 문항도 세 주제로 흩어졌다.
      // 문항의 id 순서는 그대로이고 topicId만 자기 conceptId를 담은 주제를 따른다.
      ...Array(3).fill('iam-permissions'),
      ...Array(4).fill('identity-federation'),
      ...Array(2).fill('organizations-cloudtrail-config'),
      ...Array(6).fill('cost-management'),
    ]
    const addedQuestions = questions.slice(116, 169)

    expect(addedQuestions).toHaveLength(53)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 53 }, (_, index) => `q${String(index + 117).padStart(3, '0')}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual(expectedTopics)
  })

  it('보안·운영 주제 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(116, 169)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    expect(learnerFacingText).not.toMatch(/원본에서|원본은|문서에서|본문에서|위 글에 따르면/)
  })

  it('기초·스토리지 보충 문제 9개가 새 개념과 일대일로 이어진다', () => {
    const addedQuestions = questions.slice(169, 178)
    const expectedConceptIds = [
      'aws-core-services.exam-heuristics',
      's3-versioning-lifecycle.object-lock-prerequisites',
      's3-versioning-lifecycle.event-notification',
      's3-encryption-batch.envelope-encryption',
      's3-encryption-batch.sse-kms-cost',
      'ebs-instance-store.cluster-placement-group',
      'ebs-instance-store.ebs-elastic-volumes',
      'efs-fsx.efs-lifecycle-management',
      'efs-fsx.fsx-ontap-multi-az',
    ]

    expect(addedQuestions).toHaveLength(9)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 9 }, (_, index) => `q${index + 170}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      'aws-core-services',
      's3-versioning-lifecycle',
      's3-versioning-lifecycle',
      's3-encryption-batch',
      's3-encryption-batch',
      'ebs-instance-store',
      'ebs-instance-store',
      'efs-fsx',
      'efs-fsx',
    ])
    expect(addedQuestions.map(({ conceptId }) => conceptId)).toEqual(expectedConceptIds)
    expect(new Set(addedQuestions.map(({ conceptId }) => conceptId)).size).toBe(9)
  })

  it('기초·스토리지 보충 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(169, 178)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    expect(answerCounts).toEqual([2, 2, 2, 3])
    addedQuestions.forEach(({ choices }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
  })

  it('데이터베이스 보충 문제 9개가 새 개념과 일대일로 이어진다', () => {
    const addedQuestions = questions.slice(178, 187)
    const expectedConceptIds = [
      'rds-storage-features.storage-type-names',
      'rds-storage-features.multi-az-standby-limits',
      'rds-storage-features.automated-backup-retention',
      'rds-storage-features.connection-issue-heuristic',
      // phase 26 step 7이 aurora-dynamodb-cache를 셋으로 갈라 접두사가 바뀌었다.
      'aurora.aurora-serverless-v2',
      'aurora.aurora-reader-endpoint',
      'elasticache-purpose-built-db.documentdb',
      'dynamodb.dynamodb-pitr',
      'elasticache-purpose-built-db.dax-dynamodb-only',
    ]

    expect(addedQuestions).toHaveLength(9)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 9 }, (_, index) => `q${index + 179}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(4).fill('rds-storage-features'),
      'aurora',
      'aurora',
      'elasticache-purpose-built-db',
      'dynamodb',
      'elasticache-purpose-built-db',
    ])
    expect(addedQuestions.map(({ conceptId }) => conceptId).sort()).toEqual(
      [...expectedConceptIds].sort(),
    )
    expect(new Set(addedQuestions.map(({ conceptId }) => conceptId)).size).toBe(9)
  })

  it('데이터베이스 보충 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(178, 187)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    expect(answerCounts).toEqual([3, 2, 2, 2])
    addedQuestions.forEach(({ choices }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
  })

  it('컴퓨팅·메시징 보충 문제 21개가 새 개념과 일대일로 이어진다', () => {
    const addedQuestions = questions.slice(187, 208)
    const expectedConceptIds = [
      // phase 26 step 8이 앞의 넷을 두 새 주제로 옮겼다. 문항 본문은 그대로이고
      // topicId·conceptId만 따라 바뀐다.
      'ec2-autoscaling.warm-pool',
      'ec2-autoscaling.scheduled-scaling',
      'elastic-load-balancing.alb-l7-vs-nlb-l4',
      'elastic-load-balancing.sticky-session-tradeoff',
      'cloudfront-global-accelerator.global-accelerator-protocols',
      'cloudfront-global-accelerator.cloudfront-ttl',
      'cloudfront-global-accelerator.edge-keyword',
      // phase 26 step 11이 serverless-containers를 둘로 갈랐다.
      'ecs-eks-fargate.eks',
      'ecs-eks-fargate.fargate-no-time-limit',
      // phase 26 step 10이 Lambda 계열 셋을 옮겼다. 함수 URL과 VPC 연결은 lambda로,
      // 엣지에서 도는 Lambda@Edge는 CloudFront 쪽으로 간다.
      'lambda.lambda-function-url',
      'cloudfront-global-accelerator.lambda-at-edge',
      'lambda.lambda-vpc-access',
      'api-gateway-step-functions.api-gateway-jwt-authorizer',
      'ecs-eks-fargate.aws-batch',
      // phase 26 step 12가 메시징 계열을 sqs-sns-eventbridge로 옮겼고, step 15가 MSK를
      // 스트리밍 갈림길이 있는 kinesis-streaming으로 가져갔다.
      'kinesis-streaming.msk',
      'sqs-sns-eventbridge.sqs-details',
      'sqs-sns-eventbridge.sqs-queue-depth-scaling',
      'sqs-sns-eventbridge.eventbridge-scheduler',
      // step 11이 messaging-backup에서 함께 가져왔다.
      'api-gateway-step-functions.step-functions-features',
      'sqs-sns-eventbridge.ses',
      // step 13이 AWS Backup 계열을 backup-disaster-recovery로 옮겼다.
      'backup-disaster-recovery.backup-long-term-retention',
    ]

    expect(addedQuestions).toHaveLength(21)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 21 }, (_, index) => `q${index + 188}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(2).fill('ec2-autoscaling'),
      ...Array(2).fill('elastic-load-balancing'),
      ...Array(3).fill('cloudfront-global-accelerator'),
      // step 10이 Lambda 계열을 옮기고 step 11이 serverless-containers를 둘로 가르면서
      // 이 구간이 다섯 주제로 갈라졌고, step 12가 메시징 계열을 빼내며 여섯, step 13이
      // AWS Backup 계열을 빼내며 일곱, step 15가 MSK를 옮기며 여덟이 됐다.
      // 문항의 id 순서는 그대로이고 topicId만 자기 conceptId를 담은 주제를 따른다.
      ...Array(2).fill('ecs-eks-fargate'),
      'lambda',
      'cloudfront-global-accelerator',
      'lambda',
      'api-gateway-step-functions',
      'ecs-eks-fargate',
      'kinesis-streaming',
      ...Array(3).fill('sqs-sns-eventbridge'),
      'api-gateway-step-functions',
      'sqs-sns-eventbridge',
      'backup-disaster-recovery',
    ])
    expect(addedQuestions.map(({ conceptId }) => conceptId).sort()).toEqual(
      [...expectedConceptIds].sort(),
    )
    expect(new Set(addedQuestions.map(({ conceptId }) => conceptId)).size).toBe(21)
  })

  it('컴퓨팅·메시징 보충 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(187, 208)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    expect(answerCounts).toEqual([5, 5, 5, 6])
    addedQuestions.forEach(({ choices }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
  })

  it('네트워크·라우팅·분석 보충 문제 15개가 새 개념과 일대일로 이어진다', () => {
    const addedQuestions = questions.slice(208, 223)
    const expectedConceptIds = [
      'vpc-networking.endpoint-pricing',
      'vpc-networking.egress-only-igw',
      'vpc-networking.nat-instance',
      'vpc-networking.vpc-peering-scaling-limit',
      'vpc-networking.s3-is-regional',
      'hybrid-connectivity.direct-connect-caveats',
      'hybrid-connectivity.direct-connect-gateway',
      'hybrid-connectivity.client-vpn',
      'hybrid-connectivity.access-terms',
      'hybrid-connectivity.data-locality-cost',
      'hybrid-connectivity.onprem-connectivity-heuristic',
      'route53.private-hosted-zone',
      'route53.multivalue-answer-details',
      // phase 26 step 15가 Glue Crawler를 emr-glue-athena로 옮겼고, step 16이 로그 분석
      // 선택지를 CloudWatch 쪽 주제인 cloudwatch-xray로 옮겼다.
      'emr-glue-athena.glue-crawler',
      'cloudwatch-xray.log-analysis-options',
    ]

    expect(addedQuestions).toHaveLength(15)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 15 }, (_, index) => `q${index + 209}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(5).fill('vpc-networking'),
      ...Array(6).fill('hybrid-connectivity'),
      ...Array(2).fill('route53'),
      'emr-glue-athena',
      'cloudwatch-xray',
    ])
    expect(addedQuestions.map(({ conceptId }) => conceptId).sort()).toEqual(
      [...expectedConceptIds].sort(),
    )
    expect(new Set(addedQuestions.map(({ conceptId }) => conceptId)).size).toBe(15)
  })

  it('네트워크·라우팅·분석 보충 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(208, 223)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    expect(answerCounts).toEqual([4, 4, 4, 3])
    addedQuestions.forEach(({ choices }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
  })

  it('보안·자격 증명·비용 관리 보충 문제 23개가 새 개념과 일대일로 이어진다', () => {
    const addedQuestions = questions.slice(223, 246)
    const expectedConceptIds = [
      'security-groups-nacl.security-group-referencing',
      'security-groups-nacl.nacl-rule-limit',
      'security-groups-nacl.web-acl-vs-nacl',
      'secrets-encryption.acm-cloudfront-region',
      'secrets-encryption.lambda-env-var-kms',
      'secrets-encryption.cloudhsm',
      'secrets-encryption.rotation-heuristic',
      'waf-shield.waf-attach-targets',
      'waf-shield.waf-bot-control',
      'waf-shield.waf-rule-types',
      'waf-shield.shield-advanced-drt',
      'guardduty-macie-inspector.guardduty-db-login',
      'guardduty-macie-inspector.security-service-lineup',
      'iam-permissions.least-privilege',
      'iam-permissions.instance-profile',
      'iam-permissions.iam-group-users-only',
      'identity-federation.sts-assume-role',
      'identity-federation.cognito-pools',
      'organizations-cloudtrail-config.organizations-scp',
      'cost-management.cost-allocation-tag-activation',
      'cost-management.savings-plan-details',
      'cost-management.cost-anomaly-detection',
      'cost-management.compute-optimizer',
    ]

    expect(addedQuestions).toHaveLength(23)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 23 }, (_, index) => `q${index + 224}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(3).fill('security-groups-nacl'),
      ...Array(4).fill('secrets-encryption'),
      ...Array(4).fill('waf-shield'),
      ...Array(2).fill('guardduty-macie-inspector'),
      ...Array(3).fill('iam-permissions'),
      ...Array(2).fill('identity-federation'),
      'organizations-cloudtrail-config',
      ...Array(4).fill('cost-management'),
    ])
    expect(addedQuestions.map(({ conceptId }) => conceptId).sort()).toEqual(
      [...expectedConceptIds].sort(),
    )
    expect(new Set(addedQuestions.map(({ conceptId }) => conceptId)).size).toBe(23)
  })

  it('보안·자격 증명·비용 관리 보충 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(223, 246)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    expect(answerCounts).toEqual([6, 6, 6, 5])
    addedQuestions.forEach(({ choices }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
  })

  it('전체 보충 문제 q170~q246의 정답 위치가 고르게 퍼져 있다', () => {
    const gapQuestions = questions.slice(169, 246)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => gapQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )

    expect(gapQuestions).toHaveLength(77)
    answerCounts.forEach((count) => {
      expect(count / gapQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / gapQuestions.length).toBeLessThanOrEqual(0.3)
    })
  })

  // phase 27 step 1 — 문항이 하나도 없던 두 주제를 개념 커버리지 기준으로 덮는다(ADR-026).
  // 담당 개념 24개에 문항이 일대일로 붙으므로 slice와 개념 목록이 같은 길이다.
  const step1Concepts = [
    's3-access-control.s3-cross-account-bucket-policy',
    's3-access-control.s3-presigned-url',
    's3-access-control.s3-access-grants',
    's3-access-control.s3-access-point',
    's3-access-control.s3-multi-region-access-point',
    's3-access-control.s3-storage-lens',
    's3-access-control.s3-cors-not-authorization',
    's3-access-control.s3-requester-pays',
    's3-access-control.s3-storage-lens-advanced-activity-metrics',
    's3-access-control.s3-account-level-public-access-block',
    's3-access-control.block-public-access-allows-explicit-grants',
    's3-access-control.s3-bucket-policy-source-vpc-condition',
    's3-access-control.s3-website-endpoint-no-https',
    'redshift-opensearch-quicksight.redshift',
    'redshift-opensearch-quicksight.redshift-spectrum',
    'redshift-opensearch-quicksight.opensearch-text-search',
    'redshift-opensearch-quicksight.quicksight',
    'redshift-opensearch-quicksight.oltp-vs-olap',
    'redshift-opensearch-quicksight.athena-vs-redshift-workload',
    'redshift-opensearch-quicksight.redshift-hot-cold-split',
    'redshift-opensearch-quicksight.quicksight-ml-forecast',
    'redshift-opensearch-quicksight.redshift-concurrency-scaling',
    'redshift-opensearch-quicksight.redshift-copy-from-s3',
    'redshift-opensearch-quicksight.dynamodb-to-s3-analytics',
  ]

  it('S3 접근 제어·BI 문제 24개가 담당 개념과 일대일로 이어진다', () => {
    const addedQuestions = questions.slice(246, 270)

    expect(addedQuestions).toHaveLength(24)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `q${index + 247}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(13).fill('s3-access-control'),
      ...Array(11).fill('redshift-opensearch-quicksight'),
    ])
    expect(addedQuestions.map(({ conceptId }) => conceptId).sort()).toEqual(
      [...step1Concepts].sort(),
    )
    expect(new Set(addedQuestions.map(({ conceptId }) => conceptId)).size).toBe(24)
  })

  it('S3 접근 제어·BI 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(246, 270).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('S3 접근 제어·BI 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(246, 270)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('S3 접근 제어와 웨어하우스·검색·시각화 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))

    ;['s3-access-control', 'redshift-opensearch-quicksight'].forEach((topicId) => {
      const topic = topics.find(({ id }) => id === topicId)
      const uncovered = (topic?.concepts ?? [])
        .filter((concept) => !covered.has(concept.id))
        .map((concept) => concept.id)

      expect(uncovered).toEqual([])
      expect(questions.filter((question) => question.topicId === topicId).length).toBeGreaterThan(0)
    })
  })

  // phase 27 step 3 — 커버리지가 절반도 안 되던 S3 수명 주기·암호화·블록 스토리지 세
  // 주제의 빈 개념 24개를 덮는다(ADR-026). 담당 개념과 문항이 일대일이라 slice와
  // 개념 목록이 같은 길이다.
  const step3Concepts = [
    's3-versioning-lifecycle.s3-replication',
    's3-versioning-lifecycle.s3-same-region-replication',
    's3-versioning-lifecycle.s3-replication-time-control',
    's3-versioning-lifecycle.s3-replication-cross-account-kms',
    's3-versioning-lifecycle.s3-lifecycle-rules-and-size-filter',
    's3-encryption-batch.client-side-encryption',
    's3-encryption-batch.s3-inventory-report',
    's3-encryption-batch.s3-object-lambda',
    's3-encryption-batch.sse-kms-audit-trail',
    's3-encryption-batch.batch-copy-vs-replication',
    's3-encryption-batch.s3-batch-operations-lambda-invoke',
    's3-encryption-batch.sse-c-no-rotation-or-audit',
    's3-encryption-batch.s3-secure-transport-condition',
    'ebs-instance-store.elastic-fabric-adapter',
    'ebs-instance-store.ebs-volume-type-names',
    'ebs-instance-store.gp3-iops-independent-of-size',
    'ebs-instance-store.spread-placement-group',
    'ebs-instance-store.io2-block-express-iops-ceiling',
    'ebs-instance-store.ebs-encryption-by-default',
    'ebs-instance-store.ebs-encryption-performance',
    'ebs-instance-store.ebs-recycle-bin',
    'ebs-instance-store.ebs-snapshot-block-public-access',
    'ebs-instance-store.data-lifecycle-manager',
    'ebs-instance-store.ebs-fast-snapshot-restore',
  ]

  it('S3 수명 주기·암호화·블록 스토리지 문제 24개가 담당 개념과 일대일로 이어진다', () => {
    const addedQuestions = questions.slice(270, 294)

    expect(addedQuestions).toHaveLength(24)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `q${index + 271}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(5).fill('s3-versioning-lifecycle'),
      ...Array(8).fill('s3-encryption-batch'),
      ...Array(11).fill('ebs-instance-store'),
    ])
    expect(addedQuestions.map(({ conceptId }) => conceptId).sort()).toEqual(
      [...step3Concepts].sort(),
    )
    expect(new Set(addedQuestions.map(({ conceptId }) => conceptId)).size).toBe(24)
  })

  it('S3 수명 주기·암호화·블록 스토리지 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(270, 294).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('S3 수명 주기·암호화·블록 스토리지 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(270, 294)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('S3 수명 주기·암호화와 블록 스토리지 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))

    ;['s3-versioning-lifecycle', 's3-encryption-batch', 'ebs-instance-store'].forEach((topicId) => {
      const topic = topics.find(({ id }) => id === topicId)
      const uncovered = (topic?.concepts ?? [])
        .filter((concept) => !covered.has(concept.id))
        .map((concept) => concept.id)

      expect(uncovered).toEqual([])
    })
  })

  // phase 27 step 2 — 문항이 하나도 없던 세 주제(governance-iac·systems-manager·
  // ai-ml-services)와, 커버리지가 남아 있던 aws-core-services·s3-storage-classes의
  // 빈 개념 30개를 덮는다(ADR-026). 개념당 한 문항이 기본이고, 헷갈리는 짝인
  // EC2 Instance Connect 엔드포인트(서비스 선택 ↔ 여는 포트)와 AI 서비스 넷의 갈래
  // (Transcribe ↔ Textract)만 두 방향으로 물어 문항이 32개다.
  const step2Concepts = [
    'governance-iac.cloudformation',
    'governance-iac.service-catalog',
    'governance-iac.control-tower-landing-zone',
    'governance-iac.resource-access-manager',
    'governance-iac.workload-discovery',
    'governance-iac.control-tower-controls',
    'governance-iac.cloudformation-drift-detection',
    'systems-manager.ssm-run-command',
    'systems-manager.appconfig',
    'systems-manager.ssm-session-manager',
    'systems-manager.ec2-instance-connect-endpoint',
    'systems-manager.ssm-patch-manager',
    'systems-manager.ssm-managed-instance-core-policy',
    'systems-manager.ssm-inventory',
    'ai-ml-services.sagemaker',
    'ai-ml-services.media-ai-service-lineup',
    'ai-ml-services.comprehend',
    'ai-ml-services.amazon-lex',
    'ai-ml-services.sagemaker-autopilot',
    'ai-ml-services.rekognition-content-moderation',
    'aws-core-services.exponential-backoff-retry',
    'aws-core-services.blob-offload-to-s3',
    's3-storage-classes.s3-express-one-zone',
    's3-storage-classes.glacier-flexible-retrieval-standard-time',
    's3-storage-classes.glacier-flexible-retrieval-expedited',
    's3-storage-classes.s3-storage-class-cost-order',
    's3-storage-classes.lifecycle-vs-intelligent-tiering',
    's3-storage-classes.s3-storage-class-analysis',
    's3-storage-classes.s3-retrieval-fee-by-class',
    's3-storage-classes.intelligent-tiering-monitoring-fee',
  ]

  it('거버넌스·운영 관리·AI 문제 32개가 담당 개념 30개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(294, 326)

    expect(addedQuestions).toHaveLength(32)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 32 }, (_, index) => `q${index + 295}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(7).fill('governance-iac'),
      ...Array(8).fill('systems-manager'),
      ...Array(7).fill('ai-ml-services'),
      ...Array(2).fill('aws-core-services'),
      ...Array(8).fill('s3-storage-classes'),
    ])
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step2Concepts].sort(),
    )
  })

  it('거버넌스·운영 관리·AI 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(294, 326).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('거버넌스·운영 관리·AI 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(294, 326)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('거버넌스·운영 관리·AI와 핵심 서비스·스토리지 클래스 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))

    ;[
      'governance-iac',
      'systems-manager',
      'ai-ml-services',
      'aws-core-services',
      's3-storage-classes',
    ].forEach((topicId) => {
      const topic = topics.find(({ id }) => id === topicId)
      const uncovered = (topic?.concepts ?? [])
        .filter((concept) => !covered.has(concept.id))
        .map((concept) => concept.id)

      expect(uncovered).toEqual([])
      expect(questions.filter((question) => question.topicId === topicId).length).toBeGreaterThan(0)
    })
  })

  // phase 27 step 4 — efs-fsx의 빈 개념 21개를 덮는다(ADR-026). 개념당 한 문항이
  // 기본이고, 축이 둘로 갈리는 개념 셋만 두 방향으로 물어 문항이 24개다 — 처리량
  // 모드(버스팅 ↔ 프로비저닝), 성능 모드(최대 I/O ↔ 범용), IA 파일 크기 기준
  // (128KB에 못 미쳐 절감이 작은 쪽 ↔ 1GB라서 실효를 내는 쪽).
  const step4Concepts = [
    'efs-fsx.fsx-windows-file-server',
    'efs-fsx.fsx-for-lustre',
    'efs-fsx.fsx-file-gateway',
    'efs-fsx.efs-throughput-modes',
    'efs-fsx.efs-elastic-throughput',
    'efs-fsx.efs-performance-modes',
    'efs-fsx.efs-one-zone',
    'efs-fsx.efs-posix-permissions',
    'efs-fsx.fsx-lustre-sub-millisecond-latency',
    'efs-fsx.fsx-lustre-persistent-deployment',
    'efs-fsx.fsx-ontap-multi-protocol-tiering',
    'efs-fsx.fsx-ontap-iscsi-block',
    'efs-fsx.fsx-ontap-snapmirror',
    'efs-fsx.sql-server-always-on-shared-storage',
    'efs-fsx.efs-ia-file-size-threshold',
    'efs-fsx.efs-lifecycle-transition-to-primary',
    'efs-fsx.efs-mount-target-per-az',
    'efs-fsx.efs-cross-account-mount',
    'efs-fsx.efs-replication-one-way',
    'efs-fsx.fsx-windows-storage-auto-scaling',
    'efs-fsx.fsx-lustre-s3-data-repository-association',
    // phase 37 — q344를 efs-lifecycle-management로 재연결해 이 구간이 덮는 개념이 하나 늘었다.
    'efs-fsx.efs-lifecycle-management',
  ]

  it('공유 파일 스토리지 문제 24개가 담당 개념 22개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(326, 350)

    expect(addedQuestions).toHaveLength(24)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `q${index + 327}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual(Array(24).fill('efs-fsx'))
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step4Concepts].sort(),
    )
  })

  it('공유 파일 스토리지 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(326, 350).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('공유 파일 스토리지 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(326, 350)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('EFS·FSx 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const topic = topics.find(({ id }) => id === 'efs-fsx')
    const uncovered = (topic?.concepts ?? [])
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // phase 27 step 5 — data-transfer-services의 빈 개념 16개와
  // storage-gateway-migration의 빈 개념 6개를 덮는다(ADR-026). 개념당 한 문항이
  // 기본이고, 축이 양방향으로 갈리는 개념 둘만 두 방향으로 물어 문항이 24개다 —
  // 지속 수집 ↔ 예약 전송(파일 게이트웨이 ↔ DataSync), 볼륨 모드(저장 볼륨 ↔ 캐시된 볼륨).
  const step5Concepts = [
    'data-transfer-services.snowball-edge-compute',
    'data-transfer-services.transfer-family-workflow',
    'data-transfer-services.s3-transfer-acceleration',
    'data-transfer-services.transfer-deadline-vs-bandwidth',
    'data-transfer-services.file-gateway-vs-datasync-continuous',
    'data-transfer-services.transfer-family-custom-hostname',
    'data-transfer-services.transfer-family-directory-service-identity-provider',
    'data-transfer-services.transfer-family-service-managed-users',
    'data-transfer-services.datasync-scope-limits',
    'data-transfer-services.datasync-in-transit-encryption',
    'data-transfer-services.datasync-manifest',
    'data-transfer-services.datasync-transfer-mode',
    'data-transfer-services.datasync-task-status-event',
    'data-transfer-services.transfer-family-workflow-actions',
    'data-transfer-services.transfer-family-structured-logging',
    'data-transfer-services.s3-multipart-upload',
    'storage-gateway-migration.dms-sct',
    'storage-gateway-migration.application-migration-service',
    'storage-gateway-migration.storage-gateway-gateway-types',
    'storage-gateway-migration.storage-gateway-volume-modes',
    'storage-gateway-migration.tape-gateway-archive-tiers',
    'storage-gateway-migration.dms-full-load-and-cdc-task',
  ]

  it('데이터 전송·마이그레이션 문제 24개가 담당 개념 22개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(350, 374)

    expect(addedQuestions).toHaveLength(24)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `q${index + 351}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(17).fill('data-transfer-services'),
      ...Array(7).fill('storage-gateway-migration'),
    ])
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step5Concepts].sort(),
    )
  })

  it('데이터 전송·마이그레이션 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(350, 374).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('데이터 전송·마이그레이션 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(350, 374)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('데이터 전송과 Storage Gateway·마이그레이션 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))

    ;['data-transfer-services', 'storage-gateway-migration'].forEach((topicId) => {
      const topic = topics.find(({ id }) => id === topicId)
      const uncovered = (topic?.concepts ?? [])
        .filter((concept) => !covered.has(concept.id))
        .map((concept) => concept.id)

      expect(uncovered).toEqual([])
    })
  })

  // phase 27 step 6 — rds-storage-features의 빈 개념 14개와 aurora의 빈 개념 15개를
  // 덮는다(ADR-026). 개념당 한 문항이 기본이고, 축이 양방향으로 갈리는 개념 셋만 두
  // 방향으로 물어 문항이 32개다 — 다중 AZ 배포의 두 형태(읽을 수 있는 대기 인스턴스 ↔
  // 지연을 허용하는 분석 분리), 캐시가 듣는 조건(반복이 없을 때의 대안 ↔ 갈림길의 축),
  // Aurora 백업의 복구 지점 목표(지속적 증분 백업 ↔ 정해진 간격의 스냅샷).
  const step6Concepts = [
    'rds-storage-features.rds-blue-green-deployment',
    'rds-storage-features.rds-custom',
    'rds-storage-features.rds-iam-database-authentication',
    'rds-storage-features.rds-encryption-scope-and-in-transit',
    'rds-storage-features.rds-multi-az-db-cluster',
    'rds-storage-features.read-replica-vs-cache',
    'rds-storage-features.rds-proxy-failover',
    'rds-storage-features.rds-snapshot-cross-region-copy',
    'rds-storage-features.rds-manual-snapshot-retention',
    'rds-storage-features.rds-pitr-transaction-log-interval',
    'rds-storage-features.rds-multi-az-failover-rto',
    'rds-storage-features.rds-stop-instance-restart',
    'rds-storage-features.rds-encrypt-existing-instance',
    'rds-storage-features.rds-custom-byol',
    'aurora.aurora-endpoint-types',
    'aurora.aurora-replica-auto-scaling',
    'aurora.babelfish',
    'aurora.aurora-pgvector',
    'aurora.aurora-select-into-outfile-s3',
    'aurora.aurora-global-database-dr-targets',
    'aurora.aurora-cross-region-read-replica',
    'aurora.aurora-continuous-backup-rpo',
    'aurora.aurora-clone',
    'aurora.aurora-storage-configurations',
    'aurora.sql-server-license-cost',
    'aurora.aurora-zdr-and-activity-streams',
    'aurora.aurora-global-database-write-region',
    'aurora.aurora-serverless-max-acu',
    'aurora.read-replica-no-schema-change',
  ]

  it('RDS·Aurora 문제 32개가 담당 개념 29개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(374, 406)

    expect(addedQuestions).toHaveLength(32)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 32 }, (_, index) => `q${index + 375}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(16).fill('rds-storage-features'),
      ...Array(16).fill('aurora'),
    ])
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step6Concepts].sort(),
    )
  })

  it('RDS·Aurora 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(374, 406).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('RDS·Aurora 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(374, 406)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('RDS 스토리지 기능과 Aurora 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))

    ;['rds-storage-features', 'aurora'].forEach((topicId) => {
      const topic = topics.find(({ id }) => id === topicId)
      const uncovered = (topic?.concepts ?? [])
        .filter((concept) => !covered.has(concept.id))
        .map((concept) => concept.id)

      expect(uncovered).toEqual([])
    })
  })

  // phase 27 step 7 — dynamodb의 빈 개념 16개와 elasticache-purpose-built-db의
  // 빈 개념 11개를 덮는다(ADR-026). 개념당 한 문항이 기본이고, 갈림길 하나만 두
  // 방향으로 물어 문항이 28개다 — ElastiCache 엔진 선택(지속성이 필요한 상태를
  // 캐시에 둘 때 고르는 쪽 ↔ Memcached에 없는 것).
  const step7Concepts = [
    'dynamodb.dynamodb-single-digit-latency',
    'dynamodb.dynamodb-streams',
    'dynamodb.dynamodb-global-tables',
    'dynamodb.dynamodb-ttl',
    'dynamodb.dynamodb-global-secondary-index',
    'dynamodb.dynamodb-capacity-modes',
    'dynamodb.dynamodb-auto-scaling-target-utilization',
    'dynamodb.dynamodb-read-consistency',
    'dynamodb.dynamodb-s3-export-vs-streams',
    'dynamodb.dynamodb-incremental-export',
    'dynamodb.dynamodb-export-no-read-capacity',
    'dynamodb.dynamodb-export-requires-pitr',
    'dynamodb.dynamodb-item-size-limit',
    'dynamodb.dynamodb-ttl-deletion-delay',
    'dynamodb.dynamodb-streams-retention-24h',
    'dynamodb.dynamodb-streams-batch-size',
    'elasticache-purpose-built-db.neptune',
    'elasticache-purpose-built-db.neptune-streams',
    'elasticache-purpose-built-db.qldb',
    'elasticache-purpose-built-db.timestream',
    'elasticache-purpose-built-db.elasticache-redis-vs-memcached',
    'elasticache-purpose-built-db.elasticache-multi-az-failover',
    'elasticache-purpose-built-db.elasticache-global-datastore',
    'elasticache-purpose-built-db.documentdb-global-cluster',
    'elasticache-purpose-built-db.cache-requires-application-change',
    'elasticache-purpose-built-db.elasticache-not-a-durable-store',
    'elasticache-purpose-built-db.dax-encryption-at-rest',
  ]

  it('DynamoDB·캐시 문제 28개가 담당 개념 27개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(406, 434)

    expect(addedQuestions).toHaveLength(28)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 28 }, (_, index) => `q${index + 407}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(16).fill('dynamodb'),
      ...Array(12).fill('elasticache-purpose-built-db'),
    ])
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step7Concepts].sort(),
    )
  })

  it('DynamoDB·캐시 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(406, 434).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('DynamoDB·캐시 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(406, 434)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('DynamoDB와 목적별 데이터베이스 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))

    ;['dynamodb', 'elasticache-purpose-built-db'].forEach((topicId) => {
      const topic = topics.find(({ id }) => id === topicId)
      const uncovered = (topic?.concepts ?? [])
        .filter((concept) => !covered.has(concept.id))
        .map((concept) => concept.id)

      expect(uncovered).toEqual([])
    })
  })

  // phase 27 step 8 — ec2-autoscaling의 빈 개념 15개와 elastic-load-balancing의
  // 빈 개념 13개를 덮는다(ADR-026). 개념당 한 문항이 기본이고, 축이 양방향으로
  // 갈리는 개념 넷만 두 방향으로 물어 문항이 32개다 — 예약 인스턴스의 두 갈래
  // (유형을 고정해 할인을 크게 ↔ 유형을 바꿀 여지를 남기고 덜 싸게), 스팟 할당
  // 전략(중단 최소화 ↔ 비용과 용량의 절충), 단순 조정과 대상 추적(짧은 급증에서
  // 무엇으로 바꾸는가 ↔ 단순 조정의 동작 방식 자체), 종단 간 암호화(뒤 구간도
  // TLS여야 한다 ↔ 인증서 수명 주기를 누가 지는가).
  const step8Concepts = [
    'ec2-autoscaling.ami-and-launch-template',
    'ec2-autoscaling.ec2-image-builder',
    'ec2-autoscaling.memory-optimized-instance-family',
    'ec2-autoscaling.gpu-instance-family',
    'ec2-autoscaling.reserved-instance-types',
    'ec2-autoscaling.spot-workload-fit',
    'ec2-autoscaling.target-tracking-vs-simple-scaling',
    'ec2-autoscaling.predictive-scaling',
    'ec2-autoscaling.spot-allocation-strategy',
    'ec2-autoscaling.asg-instance-type-override',
    'ec2-autoscaling.asg-on-demand-base-capacity',
    'ec2-autoscaling.asg-single-instance-self-healing',
    'ec2-autoscaling.elb-health-check-drives-asg-replacement',
    'ec2-autoscaling.enhanced-networking',
    'ec2-autoscaling.parallelcluster',
    'elastic-load-balancing.gateway-load-balancer',
    'elastic-load-balancing.alb-routing-conditions',
    'elastic-load-balancing.nlb-tls-listener',
    'elastic-load-balancing.nlb-udp-listener',
    'elastic-load-balancing.nlb-ip-targets',
    'elastic-load-balancing.alb-cookie-stickiness',
    'elastic-load-balancing.internal-load-balancer',
    'elastic-load-balancing.alb-least-outstanding-requests',
    'elastic-load-balancing.alb-target-group-independent-scaling',
    'elastic-load-balancing.alb-listener-rule-fixed-response',
    'elastic-load-balancing.load-balancer-idle-timeout',
    'elastic-load-balancing.end-to-end-encryption-behind-alb',
    'elastic-load-balancing.gwlb-endpoint-cross-account-inspection',
    // phase 37 — q465를 secrets-encryption.acm으로 재연결해 이 구간이 다른 주제의 개념 하나를 덮는다.
    'secrets-encryption.acm',
  ]

  it('EC2·로드 밸런서 문제 32개가 담당 개념 29개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(434, 466)

    expect(addedQuestions).toHaveLength(32)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 32 }, (_, index) => `q${index + 435}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(18).fill('ec2-autoscaling'),
      ...Array(12).fill('elastic-load-balancing'),
      'secrets-encryption',
      'elastic-load-balancing',
    ])
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step8Concepts].sort(),
    )
  })

  it('EC2·로드 밸런서 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(434, 466).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('EC2·로드 밸런서 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(434, 466)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('EC2와 로드 밸런서 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))

    ;['ec2-autoscaling', 'elastic-load-balancing'].forEach((topicId) => {
      const topic = topics.find(({ id }) => id === topicId)
      const uncovered = (topic?.concepts ?? [])
        .filter((concept) => !covered.has(concept.id))
        .map((concept) => concept.id)

      expect(uncovered).toEqual([])
    })
  })

  // phase 27 step 9 — cloudfront-global-accelerator의 빈 개념 19개를 덮는다(ADR-026).
  // 개념당 한 문항이 기본이고, 축이 양방향으로 갈리는 개념 셋만 두 방향으로 물어
  // 문항이 22개다 — 서명된 URL(만료되는 일회성 링크가 맞는 자리 ↔ 매일 들어오는
  // 상시 접근에는 아닌 이유), 엣지 캐시의 비용 절감(지연과 전송 비용이 함께 조건일 때
  // CloudFront가 답인 자리 ↔ 리전 복제안이 비용에서 밀리는 이유), Global Accelerator의
  // 고정 IP(뒤쪽이 바뀌어도 변하지 않는 진입점 ↔ 캐시할 사본이 없는 TCP 연결의 가속).
  const step9Concepts = [
    'cloudfront-global-accelerator.cloudfront-alb-origin',
    'cloudfront-global-accelerator.cloudfront-multiple-origins',
    'cloudfront-global-accelerator.cloudfront-onprem-origin',
    'cloudfront-global-accelerator.global-accelerator',
    'cloudfront-global-accelerator.global-accelerator-static-ip',
    'cloudfront-global-accelerator.global-accelerator-endpoints',
    'cloudfront-global-accelerator.cloudfront-functions',
    'cloudfront-global-accelerator.cloudfront-reduces-data-transfer-cost',
    'cloudfront-global-accelerator.global-accelerator-vs-dns-failover',
    'cloudfront-global-accelerator.cloudfront-signed-url',
    'cloudfront-global-accelerator.cloudfront-signed-cookie',
    'cloudfront-global-accelerator.cloudfront-geo-restriction',
    'cloudfront-global-accelerator.cloudfront-field-level-encryption',
    'cloudfront-global-accelerator.lambda-at-edge-origin-selection-by-viewer-location',
    'cloudfront-global-accelerator.lambda-at-edge-response-compression',
    'cloudfront-global-accelerator.cloudfront-price-class',
    'cloudfront-global-accelerator.cloudfront-s3-upload-with-oac',
    'cloudfront-global-accelerator.cloudfront-alb-origin-access-restriction',
    'cloudfront-global-accelerator.cloudfront-functions-no-external-calls',
    // phase 37 — q472를 global-accelerator-protocols로 재연결해 이 구간이 덮는 개념이 하나 늘었다.
    'cloudfront-global-accelerator.global-accelerator-protocols',
  ]

  it('CloudFront·엣지 문제 22개가 담당 개념 20개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(466, 488)

    expect(addedQuestions).toHaveLength(22)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 22 }, (_, index) => `q${index + 467}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual(
      Array(22).fill('cloudfront-global-accelerator'),
    )
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step9Concepts].sort(),
    )
  })

  it('CloudFront·엣지 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(466, 488).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('CloudFront·엣지 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(466, 488)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('CloudFront·Global Accelerator 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const topic = topics.find(({ id }) => id === 'cloudfront-global-accelerator')
    const uncovered = (topic?.concepts ?? [])
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })


  // phase 27 step 10 — lambda의 빈 개념 15개를 덮는다(ADR-026). 개념당 한 문항이
  // 기본이고, 축이 양방향으로 갈리는 개념 다섯만 두 방향으로 물어 문항이 20개다 —
  // 호출 유형(즉시 답을 주지 않아야 하는 작업은 이벤트 호출 ↔ 요청-응답으로 받으면
  // 처리 시간이 그대로 대기 시간이 된다), 예약된 동시성(피크에 일정한 지연이 필요하면
  // 프로비저닝된 쪽 ↔ 예약된 쪽은 콜드 스타트를 남긴다), SnapStart(게시된 버전에서만
  // 켜진다 ↔ 스냅샷을 되살리므로 호출마다 달라야 하는 값은 핸들러 안으로),
  // EFS 마운트(레이어 상한을 넘는 공유 종속성 ↔ 전송 중 암호화는 이미 자동),
  // 운영 체제 접근(컴퓨팅은 EC2 ↔ 데이터베이스는 RDS Custom).
  const step10Concepts = [
    'lambda.lambda-function-url-iam-auth',
    'lambda.lambda-container-image',
    'lambda.lambda-invocation-types',
    'lambda.lambda-memory-cpu-proportional',
    'lambda.lambda-reserved-concurrency',
    'lambda.lambda-provisioned-concurrency-autoscaling',
    'lambda.lambda-concurrency-limit-throttling',
    'lambda.lambda-kinesis-event-source',
    'lambda.lambda-snapstart',
    'lambda.lambda-memory-ceiling',
    'lambda.lambda-layer-size-limit',
    'lambda.lambda-efs-mount',
    'lambda.lambda-version-alias-config-freeze',
    'lambda.lambda-execution-role-logs',
    'lambda.serverless-runtime-no-os-access',
    // phase 37 — q508을 rds-storage-features.rds-custom으로 재연결해 이 구간이 다른 주제의 개념 하나를 덮는다.
    'rds-storage-features.rds-custom',
  ]

  it('Lambda 문제 20개가 담당 개념 16개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(488, 508)

    expect(addedQuestions).toHaveLength(20)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 20 }, (_, index) => `q${index + 489}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual([
      ...Array(19).fill('lambda'),
      'rds-storage-features',
    ])
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step10Concepts].sort(),
    )
  })

  it('Lambda 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(488, 508).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('Lambda 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(488, 508)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('Lambda 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const topic = topics.find(({ id }) => id === 'lambda')
    const uncovered = (topic?.concepts ?? [])
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // phase 27 step 11 — ecs-eks-fargate의 빈 개념 19개를 덮는다(ADR-026). 개념당 한
  // 문항이 기본이고, EKS의 컴퓨팅 세 갈래만 두 방향으로 물어 문항이 20개다 —
  // 기본 컴퓨팅 인프라를 직접 관리하지 않는 것이 목표면 Fargate 쪽이라는 갈림길과,
  // 그 Fargate에서 어떤 파드를 돌릴지 고르는 장치가 Fargate 프로필이라는 설정 항목.
  const step11Concepts = [
    'ecs-eks-fargate.ecr-image-scan-on-push',
    'ecs-eks-fargate.elastic-beanstalk',
    'ecs-eks-fargate.app2container',
    'ecs-eks-fargate.eks-compute-options',
    'ecs-eks-fargate.fargate-spot',
    'ecs-eks-fargate.batch-fargate-compute-environment',
    'ecs-eks-fargate.eks-fargate-pod-isolation',
    'ecs-eks-fargate.eks-cluster-autoscaler',
    'ecs-eks-fargate.eks-aws-load-balancer-controller',
    'ecs-eks-fargate.eks-connector',
    'ecs-eks-fargate.eks-anywhere',
    'ecs-eks-fargate.ecs-task-role',
    'ecs-eks-fargate.ecs-task-role-vs-task-execution-role',
    'ecs-eks-fargate.eks-irsa',
    'ecs-eks-fargate.ecs-awsvpc-mode',
    'ecs-eks-fargate.ecs-task-placement-strategy',
    'ecs-eks-fargate.fargate-per-second-billing',
    'ecs-eks-fargate.fargate-efs-mount',
    'ecs-eks-fargate.eks-secrets-kms-encryption',
  ]

  it('컨테이너 문제 20개가 담당 개념 19개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(508, 528)

    expect(addedQuestions).toHaveLength(20)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 20 }, (_, index) => `q${index + 509}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual(Array(20).fill('ecs-eks-fargate'))
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step11Concepts].sort(),
    )
  })

  it('컨테이너 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(508, 528).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('컨테이너 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(508, 528)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('컨테이너 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const topic = topics.find(({ id }) => id === 'ecs-eks-fargate')
    const uncovered = (topic?.concepts ?? [])
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // phase 27 step 12 — api-gateway-step-functions의 빈 개념 16개를 덮는다(ADR-026).
  // 개념당 한 문항이 기본이고, 축이 양방향으로 갈리는 개념 넷만 두 방향으로 물어
  // 문항이 20개다 — 통합 타임아웃(어느 유형을 고르는가 ↔ 싼 쪽을 고른 설계가 왜 끊기는가),
  // 엔드포인트 유형(전 세계 지연을 줄이는 노출 방식 ↔ 같은 자리에 얹히는 캐싱이 하는 일),
  // Lambda 프록시 통합(동기 호출이라는 성질 ↔ 인증을 맡는 사용자 지정 권한 부여자),
  // 매핑 템플릿(형식이 달라지는 변환은 함수가 맡는다 ↔ 변환할 것이 없는 쪽은 그대로 흘린다).
  const step12Concepts = [
    'api-gateway-step-functions.amplify',
    'api-gateway-step-functions.api-gateway-rest-vs-http-timeout',
    'api-gateway-step-functions.api-gateway-rest-only-features',
    'api-gateway-step-functions.api-gateway-websocket-api',
    'api-gateway-step-functions.api-gateway-api-key-not-auth',
    'api-gateway-step-functions.api-gateway-resource-policy',
    'api-gateway-step-functions.api-gateway-endpoint-types',
    'api-gateway-step-functions.api-gateway-behind-cloudfront',
    'api-gateway-step-functions.api-gateway-lambda-proxy-integration',
    'api-gateway-step-functions.api-gateway-aws-service-integration',
    'api-gateway-step-functions.step-functions-long-running-workflow',
    'api-gateway-step-functions.step-functions-express-workflow',
    'api-gateway-step-functions.step-functions-map-state',
    'api-gateway-step-functions.api-gateway-custom-domain-name',
    'api-gateway-step-functions.api-gateway-mapping-template-limits',
    'api-gateway-step-functions.api-gateway-ip-restriction-by-resource-policy',
  ]

  it('API Gateway·Step Functions 문제 20개가 담당 개념 16개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(528, 548)

    expect(addedQuestions).toHaveLength(20)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 20 }, (_, index) => `q${index + 529}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual(
      Array(20).fill('api-gateway-step-functions'),
    )
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step12Concepts].sort(),
    )
  })

  it('API Gateway·Step Functions 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(528, 548).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('API Gateway·Step Functions 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(528, 548)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('API Gateway·Step Functions 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const topic = topics.find(({ id }) => id === 'api-gateway-step-functions')
    const uncovered = (topic?.concepts ?? [])
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // phase 27 step 13 — sqs-sns-eventbridge의 빈 개념 26개를 덮는다(ADR-026).
  // 개념당 한 문항이 기본이고, 축이 양방향으로 갈리는 개념 둘만 두 방향으로 물어
  // 문항이 28개다 — SNS는 큐가 아니다(버퍼가 필요한 자리는 큐다 ↔ 알림 한 통이면 되는
  // 자리에 큐를 끼우는 것도 같은 어긋남이다), 가시성 타임아웃(중복 처리 증상을 무엇으로
  // 고치는가 ↔ 전달 지연은 왜 그 증상에 손대지 못하는가).
  const step13Concepts = [
    'sqs-sns-eventbridge.amazon-mq',
    'sqs-sns-eventbridge.dead-letter-queue',
    'sqs-sns-eventbridge.sns-is-not-a-queue',
    'sqs-sns-eventbridge.sns-sqs-fanout-per-consumer',
    'sqs-sns-eventbridge.eventbridge-vs-step-functions',
    'sqs-sns-eventbridge.eventbridge-ordering-and-retention',
    'sqs-sns-eventbridge.eventbridge-event-pattern-vs-polling',
    'sqs-sns-eventbridge.eventbridge-event-bus-types',
    'sqs-sns-eventbridge.eventbridge-pipes',
    'sqs-sns-eventbridge.eventbridge-api-destination',
    'sqs-sns-eventbridge.eventbridge-private-api-target',
    'sqs-sns-eventbridge.eventbridge-resource-change-rule',
    'sqs-sns-eventbridge.sns-fifo-topic',
    'sqs-sns-eventbridge.ses-inbound-email-receiving',
    'sqs-sns-eventbridge.sqs-batch-and-polling',
    'sqs-sns-eventbridge.sqs-visibility-timeout-vs-processing-time',
    'sqs-sns-eventbridge.sqs-message-size-limit',
    'sqs-sns-eventbridge.sqs-fifo-message-group-id',
    'sqs-sns-eventbridge.sqs-fifo-deduplication-id',
    'sqs-sns-eventbridge.sqs-content-based-deduplication',
    'sqs-sns-eventbridge.sns-no-message-body-rewrite',
    'sqs-sns-eventbridge.sqs-queue-policy',
    'sqs-sns-eventbridge.cross-account-sns-to-sqs-queue-policy',
    'sqs-sns-eventbridge.sqs-encryption-and-consumer-kms-permission',
    'sqs-sns-eventbridge.sns-encrypted-topic-publish-permissions',
    'sqs-sns-eventbridge.sqs-vpc-endpoint-and-queue-policy',
  ]

  it('메시징 문제 28개가 담당 개념 26개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(548, 576)

    expect(addedQuestions).toHaveLength(28)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 28 }, (_, index) => `q${index + 549}`),
    )
    expect(addedQuestions.map(({ topicId }) => topicId)).toEqual(
      Array(28).fill('sqs-sns-eventbridge'),
    )
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step13Concepts].sort(),
    )
  })

  it('메시징 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(548, 576).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('메시징 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(548, 576)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('SQS·SNS·EventBridge 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const topic = topics.find(({ id }) => id === 'sqs-sns-eventbridge')
    const uncovered = (topic?.concepts ?? [])
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // phase 27 step 14 — 백업·재해 복구와 네트워킹 네 주제의 빈 개념 30개를 덮는다(ADR-026).
  // 개념당 한 문항이 기본이고, 축이 양방향으로 갈리는 개념 둘만 두 방향으로 물어
  // 문항이 32개다 — 상태 저장과 상태 비저장(응답 규칙이 왜 필요한가 ↔ 차단 규칙이
  // 없다는 성질이 IP 하나 막기를 어디로 보내는가), Direct Connect의 가상 인터페이스
  // (Transit Gateway로 가는 조합은 무엇인가 ↔ 세 종류의 목적지가 어떻게 갈리는가).
  const step14Concepts = [
    'backup-disaster-recovery.elastic-disaster-recovery',
    'backup-disaster-recovery.backup-and-restore-dr',
    'backup-disaster-recovery.warm-standby-for-low-rto',
    'backup-disaster-recovery.backup-ec2-resource-assignment',
    'backup-disaster-recovery.organizations-backup-policy',
    'backup-disaster-recovery.backup-cross-account-copy',
    'backup-disaster-recovery.backup-s3-continuous-backup',
    'backup-disaster-recovery.backup-restore-testing-plan',
    'backup-disaster-recovery.backup-audit-manager',
    'vpc-networking.vpc-flow-logs',
    'vpc-networking.nat-gateway-traffic-uses-public-endpoints',
    'vpc-networking.privatelink-endpoint-service',
    'vpc-networking.nat-gateway-per-az',
    'vpc-networking.internet-gateway-is-not-per-az',
    'vpc-networking.nat-gateway-count-by-environment',
    'vpc-networking.nat-gateway-elastic-ip',
    'vpc-networking.vpc-endpoint-policy',
    'security-groups-nacl.security-group-stateful-vs-nacl-stateless',
    'security-groups-nacl.nacl-deny-at-source-subnet',
    'security-groups-nacl.alb-security-group-outbound-and-health-check-port',
    'security-groups-nacl.nlb-security-group',
    'hybrid-connectivity.virtual-private-gateway',
    'hybrid-connectivity.region-attached-edge-options',
    'hybrid-connectivity.per-vpc-vpn-for-isolation',
    'hybrid-connectivity.transit-gateway-cross-region-peering',
    'hybrid-connectivity.onprem-access-via-interface-endpoint',
    'hybrid-connectivity.outposts-data-residency',
    'hybrid-connectivity.direct-connect-resiliency',
    'hybrid-connectivity.direct-connect-vif-types',
    'hybrid-connectivity.centralized-onprem-egress',
  ]

  it('백업·네트워킹 문제 32개가 담당 개념 30개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(576, 608)

    expect(addedQuestions).toHaveLength(32)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 32 }, (_, index) => `q${index + 577}`),
    )
    expect(new Set(addedQuestions.map(({ topicId }) => topicId))).toEqual(
      new Set([
        'backup-disaster-recovery',
        'vpc-networking',
        'security-groups-nacl',
        'hybrid-connectivity',
      ]),
    )
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step14Concepts].sort(),
    )
  })

  it('백업·네트워킹 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(576, 608).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('백업·네트워킹 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(576, 608)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('백업·재해 복구와 네트워킹 세 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const uncovered = topics
      .filter(({ id }) =>
        [
          'backup-disaster-recovery',
          'vpc-networking',
          'security-groups-nacl',
          'hybrid-connectivity',
        ].includes(id),
      )
      .flatMap(({ concepts }) => concepts)
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // phase 27 step 15 — Route 53과 분석 두 주제의 빈 개념 23개를 덮는다(ADR-026).
  // 개념당 한 문항이 기본이고, 축이 양방향으로 갈리는 개념 하나만 두 방향으로 물어
  // 문항이 24개다 — EMR 노드의 세 역할(저장을 맡느냐가 코어와 태스크를 가른다 ↔
  // 그 차이 때문에 스팟으로 돌려도 되는 노드가 어디인가).
  const step15Concepts = [
    'route53.route53-zone-file-import',
    'route53.route53-failover-routing',
    'route53.multi-region-failover-for-region-outage',
    'route53.latency-record-for-non-aws-endpoint',
    'route53.route53-alias-record',
    'route53.private-hosted-zone-vpc-only',
    'route53.route53-resolver-forward-rule',
    'route53.route53-query-logging',
    'emr-glue-athena.emr-node-types',
    'emr-glue-athena.glue-databrew',
    'emr-glue-athena.lake-formation',
    'emr-glue-athena.emr-transient-cluster',
    'emr-glue-athena.emr-managed-scaling',
    'emr-glue-athena.glue-etl-with-per-customer-kms-key',
    'emr-glue-athena.athena-encrypted-and-pay-per-query',
    'emr-glue-athena.athena-federated-query',
    'emr-glue-athena.log-storage-s3-athena',
    'emr-glue-athena.lake-formation-blueprint-and-athena',
    'emr-glue-athena.lake-formation-lf-tags',
    'emr-glue-athena.emr-node-instance-family-choice',
    'emr-glue-athena.emr-runtime-role',
    'emr-glue-athena.emr-security-configuration',
    'emr-glue-athena.parquet-columnar-format',
  ]

  it('Route 53·분석 문제 24개가 담당 개념 23개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(608, 632)

    expect(addedQuestions).toHaveLength(24)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `q${index + 609}`),
    )
    expect(new Set(addedQuestions.map(({ topicId }) => topicId))).toEqual(
      new Set(['route53', 'emr-glue-athena']),
    )
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step15Concepts].sort(),
    )
  })

  it('Route 53·분석 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(608, 632).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('Route 53·분석 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(608, 632)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('Route 53과 분석 두 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const uncovered = topics
      .filter(({ id }) => ['route53', 'emr-glue-athena'].includes(id))
      .flatMap(({ concepts }) => concepts)
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // phase 27 step 16 — 스트리밍과 관측 두 주제의 빈 개념 23개를 덮는다(ADR-026).
  // 개념당 한 문항이 기본이고, 축이 양방향으로 갈리는 개념 하나만 두 방향으로 물어
  // 문항이 24개다 — Kinesis 용량 모드(두 모드가 무엇으로 갈리는가 ↔ 파티션 키 쏠림에는
  // 온디맨드로 옮겨도 증상만 가려진다).
  const step16Concepts = [
    'kinesis-streaming.kinesis-data-streams',
    'kinesis-streaming.data-firehose',
    'kinesis-streaming.managed-service-apache-flink',
    'kinesis-streaming.kinesis-video-streams',
    'kinesis-streaming.flink-kinesis-source-sink',
    'kinesis-streaming.firehose-lambda-transformation',
    'kinesis-streaming.firehose-format-conversion',
    'kinesis-streaming.kinesis-retention-and-fanout',
    'kinesis-streaming.kinesis-client-library',
    'kinesis-streaming.msk-kafka-connect',
    'kinesis-streaming.kinesis-record-size-limit',
    'kinesis-streaming.kinesis-partition-key-hot-shard',
    'kinesis-streaming.kinesis-capacity-mode',
    'kinesis-streaming.firehose-buffering',
    'cloudwatch-xray.x-ray',
    'cloudwatch-xray.performance-insight',
    'cloudwatch-xray.amazon-managed-grafana',
    'cloudwatch-xray.cloudwatch-network-monitor',
    'cloudwatch-xray.cloudwatch-container-insights',
    'cloudwatch-xray.performance-insights-rightsizing',
    'cloudwatch-xray.cloudwatch-agent-memory-metric',
    'cloudwatch-xray.ec2-detailed-monitoring',
    'cloudwatch-xray.cloudwatch-alarm-state-change-event',
  ]

  it('스트리밍·관측 문제 24개가 담당 개념 23개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(632, 656)

    expect(addedQuestions).toHaveLength(24)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `q${index + 633}`),
    )
    expect(new Set(addedQuestions.map(({ topicId }) => topicId))).toEqual(
      new Set(['kinesis-streaming', 'cloudwatch-xray']),
    )
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step16Concepts].sort(),
    )
  })

  it('스트리밍·관측 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(632, 656).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('스트리밍·관측 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(632, 656)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('스트리밍과 관측 두 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const uncovered = topics
      .filter(({ id }) => ['kinesis-streaming', 'cloudwatch-xray'].includes(id))
      .flatMap(({ concepts }) => concepts)
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // phase 27 step 17 — 보안 서비스 세 주제의 빈 개념 26개를 덮는다(ADR-026).
  // 개념당 한 문항이 기본이고, 축이 양방향으로 갈리는 개념 둘만 두 방향으로 물어
  // 문항이 28개다 — Shield Standard의 방어 범위(정상 요청 모양의 L7 공격은 WAF가 맡는다
  // ↔ 기본 보호의 범위가 네트워크 계층까지라는 경계 자체)와 Inspector의 역할(취약점을
  // 찾아 주는 서비스는 무엇인가 ↔ 유입을 막는 일은 발견이 아니라 조치라 자리가 다르다).
  const step17Concepts = [
    'secrets-encryption.kms-key-types-by-management',
    'secrets-encryption.kms-multi-region-key',
    'secrets-encryption.kms-imported-key-material',
    'secrets-encryption.kms-cloudhsm-key-store',
    'secrets-encryption.kms-key-per-tenant',
    'secrets-encryption.acm-dns-validation',
    'secrets-encryption.secrets-manager-batch-get-secret-value',
    'secrets-encryption.kms-automatic-key-rotation',
    'secrets-encryption.kms-symmetric-vs-asymmetric-rotation',
    'secrets-encryption.imported-key-material-rotation',
    'secrets-encryption.acm-expiration-event',
    'waf-shield.firewall-manager',
    'waf-shield.waf-managed-rule-groups',
    'waf-shield.waf-rate-based-rule',
    'waf-shield.shield-standard-network-layer',
    'waf-shield.shield-advanced-protection-group',
    'waf-shield.waf-body-inspection-size-limit',
    'waf-shield.waf-web-acl-region-must-match-rest-api',
    'waf-shield.waf-logging-to-firehose',
    'guardduty-macie-inspector.amazon-inspector',
    'guardduty-macie-inspector.security-hub',
    'guardduty-macie-inspector.macie-automated-discovery',
    'guardduty-macie-inspector.inspector-scans-ecr-images',
    'guardduty-macie-inspector.macie-delegated-administrator',
    'guardduty-macie-inspector.guardduty-finding-to-eventbridge',
    'guardduty-macie-inspector.macie-finding-to-eventbridge',
  ]

  it('보안 서비스 문제 28개가 담당 개념 26개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(656, 684)

    expect(addedQuestions).toHaveLength(28)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 28 }, (_, index) => `q${index + 657}`),
    )
    expect(new Set(addedQuestions.map(({ topicId }) => topicId))).toEqual(
      new Set(['secrets-encryption', 'waf-shield', 'guardduty-macie-inspector']),
    )
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step17Concepts].sort(),
    )
  })

  it('보안 서비스 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(656, 684).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('보안 서비스 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(656, 684)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('비밀·키와 WAF·Shield와 탐지 세 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const uncovered = topics
      .filter(({ id }) =>
        ['secrets-encryption', 'waf-shield', 'guardduty-macie-inspector'].includes(id),
      )
      .flatMap(({ concepts }) => concepts)
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // phase 27 step 18 — 자격 증명 두 주제의 빈 개념 20개를 덮는다(ADR-026).
  // 개념당 한 문항이 기본이고, 축이 양방향으로 갈리는 개념 넷만 두 방향으로 물어
  // 문항이 24개다 — 권한 경계(주체별 상한이라는 정의 ↔ 부착을 SCP로 의무화하는 예방적
  // 통제), 명시적 거부(평가 순서 자체 ↔ aws:SourceIp 조건에 걸린 403 진단),
  // NotAction Deny(한 서비스만 남기는 구성 ↔ Deny 전체+Allow 하나가 죽는 이유),
  // AD Connector(디렉터리 정보를 AWS에 두지 않는다 ↔ 인증은 온프레미스·권한은 권한 세트).
  const step18Concepts = [
    'iam-permissions.iam-group-policy-attachment',
    'iam-permissions.iam-roles-anywhere',
    'iam-permissions.iam-access-analyzer',
    'iam-permissions.network-access-analyzer',
    'iam-permissions.abac',
    'iam-permissions.permissions-boundary',
    'iam-permissions.cross-account-iam-role',
    'iam-permissions.iam-user-is-account-scoped',
    'iam-permissions.iam-explicit-deny-precedence',
    'iam-permissions.iam-notaction-deny',
    'iam-permissions.iam-requested-region-condition',
    'iam-permissions.access-analyzer-delegated-administrator',
    'iam-permissions.root-user-multiple-mfa',
    'iam-permissions.root-user-cannot-be-disabled',
    'identity-federation.aws-directory-service',
    'identity-federation.identity-center-external-idp',
    'identity-federation.cognito-social-idp-federation',
    'identity-federation.custom-identity-broker-for-non-saml',
    'identity-federation.identity-center-permission-set',
    'identity-federation.saml-federation-role-to-ad-group-mapping',
  ]

  it('자격 증명 문제 24개가 담당 개념 20개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(684, 708)

    expect(addedQuestions).toHaveLength(24)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `q${index + 685}`),
    )
    expect(new Set(addedQuestions.map(({ topicId }) => topicId))).toEqual(
      new Set(['iam-permissions', 'identity-federation']),
    )
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step18Concepts].sort(),
    )
  })

  it('자격 증명 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(684, 708).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('자격 증명 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(684, 708)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('IAM 권한과 자격 증명 페더레이션 두 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const uncovered = topics
      .filter(({ id }) => ['iam-permissions', 'identity-federation'].includes(id))
      .flatMap(({ concepts }) => concepts)
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // phase 27 step 19 — 거버넌스·비용 두 주제의 빈 개념 21개를 덮는다(ADR-026).
  // 개념당 한 문항이 기본이고, 축이 양방향으로 갈리는 개념 셋만 두 방향으로 물어
  // 문항이 24개다 — 태그 정책(표기를 통일하는 일 ↔ 막는 일은 SCP라 둘을 함께 붙인다),
  // SCP를 붙일 수 있는 자리(넷 중 셋만 제한하는 방법 ↔ 루트에 붙여 전부 걸린 증상의 진단),
  // 온디맨드 용량 예약(할인 수단이 아니라는 성격 ↔ 중단을 견디는 배치는 스팟이 가장 싸다).
  const step19Concepts = [
    'organizations-cloudtrail-config.cloudtrail-lake',
    'organizations-cloudtrail-config.audit-manager',
    'organizations-cloudtrail-config.organizational-unit',
    'organizations-cloudtrail-config.organizations-tag-policy',
    'organizations-cloudtrail-config.organizations-consolidated-billing',
    'organizations-cloudtrail-config.cloudtrail-data-events',
    'organizations-cloudtrail-config.config-configuration-recorder',
    'organizations-cloudtrail-config.scp-attachment-targets',
    'organizations-cloudtrail-config.scp-condition-exception',
    'organizations-cloudtrail-config.cloudtrail-log-file-validation',
    'organizations-cloudtrail-config.config-conformance-pack',
    'organizations-cloudtrail-config.config-custom-rule',
    'organizations-cloudtrail-config.config-rule-remediation',
    'cost-management.cost-and-usage-report',
    'cost-management.savings-plan-baseline-vs-spike',
    'cost-management.rds-reserved-instance',
    'cost-management.on-demand-capacity-reservation',
    'cost-management.cost-allocation-tag-activation-in-management-account',
    'cost-management.budget-actions',
    'cost-management.budget-forecasted-alert',
    'cost-management.compute-optimizer-ebs-recommendations',
  ]

  it('거버넌스·비용 문제 24개가 담당 개념 21개를 빠짐없이 덮는다', () => {
    const addedQuestions = questions.slice(708, 732)

    expect(addedQuestions).toHaveLength(24)
    expect(addedQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 24 }, (_, index) => `q${index + 709}`),
    )
    expect(new Set(addedQuestions.map(({ topicId }) => topicId))).toEqual(
      new Set(['organizations-cloudtrail-config', 'cost-management']),
    )
    expect([...new Set(addedQuestions.map(({ conceptId }) => conceptId))].sort()).toEqual(
      [...step19Concepts].sort(),
    )
  })

  it('거버넌스·비용 문제의 topicId가 conceptId의 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.slice(708, 732).forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('거버넌스·비용 문제의 정답 위치와 문구가 출제 규칙을 따른다', () => {
    const addedQuestions = questions.slice(708, 732)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )
    const learnerFacingText = addedQuestions
      .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
      .join(' ')

    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
    addedQuestions.forEach(({ choices, explanation }) => {
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(explanation.length).toBeGreaterThanOrEqual(100)
    })
    expect(learnerFacingText).not.toMatch(
      /원본에서|원본은|문서에서|본문에서|위 글에 따르면|덤프|해설지|\[섹션/,
    )
    // ADR-011 — 문항과 보기는 열 때마다 섞이므로 순서를 가리키는 표현이 성립하지 않는다.
    expect(learnerFacingText).not.toMatch(/위의|다음 중|번 보기/)
  })

  it('거버넌스와 비용 관리 두 주제의 모든 개념이 문항을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const uncovered = topics
      .filter(({ id }) => ['organizations-cloudtrail-config', 'cost-management'].includes(id))
      .flatMap(({ concepts }) => concepts)
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  // slice의 시작 위치는 phase 26이 주제를 넣고 뺄 때마다 밀린다. 지금은 step 3이
  // s3-access-control을 4번 자리에 넣어 뒤쪽 주제가 한 칸씩 내려갔고,
  // block-file-storage가 ebs-instance-store·efs-fsx 둘로 갈리면서 한 칸 더,
  // data-transfer-services가 storage-gateway-migration을 내놓으며 또 한 칸 더 내려갔고,
  // aurora-dynamodb-cache가 셋으로 갈리면서 두 칸이 더 내려갔다.
  it('보안·운영 데이터 주제가 지정된 순서와 메타데이터로 추가된다', () => {
    // step 14가 security-groups-nacl을 네트워크 쪽으로 옮겨 이 묶음은 여섯이 됐고,
    // step 15가 messaging-backup을 없애 시작 위치가 한 칸 올라오면서
    // analytics-monitoring을 쪼갠 세 주제가 더해져 아홉이 됐다.
    // step 17이 identity-access를 셋으로 갈라 열하나가 됐고,
    // step 18이 threat-protection을 둘로 갈라 열둘이 됐다.
    // step 19가 governance-iac·systems-manager를 배열 끝에 신설해 열넷이 됐고,
    // step 20이 ai-ml-services를 그 뒤에 신설해 열다섯이 됐다.
    // phase 66이 별점을 다시 매겼다(ADR-051).
    expect(topics.slice(24, 39).map(({ id, title, importance, sourcePages }) => ({
      id,
      title,
      importance,
      sourcePages,
    }))).toEqual([
      { id: 'route53', title: 'Route 53', importance: 3, sourcePages: [36, 37] },
      { id: 'emr-glue-athena', title: 'EMR·Spark·Glue·Athena·Lake Formation', importance: 2, sourcePages: [38, 40] },
      { id: 'kinesis-streaming', title: 'Kinesis Data Streams·Data Firehose·Flink·Video Streams·MSK', importance: 2, sourcePages: [38, 40] },
      { id: 'redshift-opensearch-quicksight', title: 'Redshift·Redshift Spectrum·OpenSearch·QuickSight', importance: 2, sourcePages: [38, 40] },
      { id: 'cloudwatch-xray', title: 'CloudWatch·X-Ray·Performance Insights·Managed Grafana', importance: 2, sourcePages: [38, 40] },
      { id: 'secrets-encryption', title: 'Secrets Manager·Parameter Store·KMS·ACM·CloudHSM', importance: 2, sourcePages: [44, 44] },
      { id: 'waf-shield', title: 'WAF·Shield·Firewall Manager', importance: 2, sourcePages: [45, 47] },
      { id: 'guardduty-macie-inspector', title: 'GuardDuty·Macie·Inspector·Security Hub', importance: 2, sourcePages: [45, 47] },
      { id: 'iam-permissions', title: 'IAM 사용자·그룹·역할·정책·권한 경계·Access Analyzer', importance: 3, sourcePages: [48, 49] },
      { id: 'identity-federation', title: 'IAM Identity Center·STS·Cognito·Directory Service·SAML', importance: 3, sourcePages: [48, 49] },
      { id: 'organizations-cloudtrail-config', title: 'Organizations·SCP·CloudTrail·Config·Audit Manager', importance: 2, sourcePages: [48, 49] },
      { id: 'cost-management', title: '절약 플랜·Budgets·Cost Explorer·Trusted Advisor', importance: 2, sourcePages: [50, 50] },
      { id: 'governance-iac', title: 'CloudFormation·Service Catalog·Control Tower·RAM', importance: 2, sourcePages: [0, 0] },
      { id: 'systems-manager', title: 'Systems Manager·AppConfig·EC2 Instance Connect', importance: 2, sourcePages: [0, 0] },
      { id: 'ai-ml-services', title: 'SageMaker·Comprehend·Rekognition·Lex·Transcribe·Translate·Textract', importance: 2, sourcePages: [0, 0] },
    ])
  })

  it('보안·운영 데이터 주제는 원본 항목 수만큼 개념을 가진다', () => {
    // security-groups-nacl의 5는 step 14가 네트워크 묶음으로 가져갔다.
    // analytics-monitoring의 14는 step 15가 원본 10개념을 세 주제로 갈라 신규 36을
    // 더한 결과다(20·16·11). step 16이 남은 4개념에 신규 7을 더해 cloudwatch-xray를
    // 세우고, route53의 5에 신규 8을 더해 13으로 늘렸다.
    // 마지막 셋 18·11·15는 step 17이 identity-access의 12개념을 셋으로 나눠(4·5·3)
    // dump-gaps의 신규 32(IAM 14 · 페더레이션 6 · 조직·감사 12)를 더한 값이다.
    // organizations-cloudtrail-config의 16은 step 19가 (주제 미정)의
    // config-rule-remediation을 3단 끝으로 옮겨 와 채운 값이다.
    // cost-management의 17은 원본 9에 step 19가 신규 8을 더한 값이고,
    // 마지막 6·7은 같은 step이 (주제 미정)에서 거버넌스·IaC 6개와 Systems Manager
    // 7개를 가져와 세운 두 주제다.
    // step 18이 secrets-encryption의 9에 신규 11을 더해 20으로 늘리고,
    // threat-protection의 11개념을 둘로 나눠(7·4) 신규 15(WAF·Shield 8 · 탐지 7)를
    // 더해 15·11로 세웠다.
    // step 20이 (주제 미정)의 workload-discovery를 governance-iac 1단에 넣어 7로
    // 늘리고, AI·ML 신규 6으로 ai-ml-services를 배열 끝에 세웠다.
    // phase 54가 iam-permissions에 IAM 사용자·IAM 역할의 기본 개념 둘을 더해 18이 20이 됐다(ADR-041 개정).
    // phase 55가 IAM 정책·루트 사용자와 Systems Manager의 기본 개념을 더해 iam-permissions가 22, systems-manager가 8이 됐다(ADR-043).
    // phase 65가 STS 아래에 IAM Roles Anywhere 19단계 개념을 더해 identity-federation이 12가 됐다(ADR-050).
    // phase 66이 절약 플랜 아래에 컴퓨팅 절약 플랜 vs EC2 인스턴스 절약 플랜을 더해 cost-management가 18이 됐다(ADR-051).
    expect(topics.slice(24, 39).map((topic) => topic.concepts.length)).toEqual([
      13, 20, 16, 11, 11, 20, 15, 11, 22, 12, 16, 18, 7, 8, 6,
    ])
  })

  it('네트워크 데이터 주제가 지정된 순서와 메타데이터로 추가된다', () => {
    // step 14가 security-groups-nacl을 vpc-networking과 hybrid-connectivity 사이로
    // 옮겨 이 묶음이 하나 늘었고, step 15가 껍데기만 남았던 messaging-backup을
    // 없애면서 다시 하나 줄었다.
    // phase 66이 별점을 다시 매겼다(ADR-051).
    expect(topics.slice(9, 24).map(({ id, title, importance, sourcePages }) => ({
      id,
      title,
      importance,
      sourcePages,
    }))).toEqual([
      { id: 'rds-storage-features', title: 'RDS 스토리지 유형과 기능', importance: 3, sourcePages: [19, 20] },
      { id: 'aurora', title: 'Aurora·Aurora Serverless·글로벌 데이터베이스', importance: 3, sourcePages: [21, 21] },
      { id: 'dynamodb', title: 'DynamoDB', importance: 2, sourcePages: [21, 21] },
      { id: 'elasticache-purpose-built-db', title: 'ElastiCache·DAX·Neptune·DocumentDB·QLDB·Timestream', importance: 2, sourcePages: [21, 21] },
      { id: 'ec2-autoscaling', title: 'EC2 인스턴스 유형·구매 옵션·Auto Scaling', importance: 3, sourcePages: [22, 24] },
      { id: 'elastic-load-balancing', title: 'ALB·NLB·Gateway Load Balancer', importance: 3, sourcePages: [22, 24] },
      { id: 'cloudfront-global-accelerator', title: 'CloudFront·Global Accelerator·엣지 함수', importance: 3, sourcePages: [22, 24] },
      // phase 26 step 10이 serverless-containers에서 Lambda 계열을 빼내 세웠고,
      // step 11이 남은 껍데기를 ECS 계열과 API Gateway 계열로 갈랐다.
      { id: 'lambda', title: 'Lambda', importance: 3, sourcePages: [25, 26] },
      { id: 'ecs-eks-fargate', title: 'ECS·EKS·Fargate·Batch·ECR·Elastic Beanstalk', importance: 2, sourcePages: [25, 26] },
      { id: 'api-gateway-step-functions', title: 'API Gateway·Step Functions', importance: 2, sourcePages: [25, 26] },
      // phase 26 step 12가 messaging-backup에서 메시징 계열을 빼내 그 자리에 놓았고,
      // step 13이 AWS Backup 계열과 재해 복구 계열을 그 뒤에 세웠다.
      { id: 'sqs-sns-eventbridge', title: 'SQS·SNS·EventBridge·Amazon MQ·SES', importance: 3, sourcePages: [27, 29] },
      { id: 'backup-disaster-recovery', title: 'AWS Backup·재해 복구 전략·Elastic Disaster Recovery', importance: 2, sourcePages: [27, 29] },
      { id: 'vpc-networking', title: 'VPC·서브넷·인터넷/NAT 게이트웨이·VPC Endpoint·PrivateLink·피어링', importance: 3, sourcePages: [30, 33] },
      { id: 'security-groups-nacl', title: '보안 그룹·NACL', importance: 3, sourcePages: [41, 43] },
      { id: 'hybrid-connectivity', title: 'Site-to-Site VPN·Direct Connect·Transit Gateway', importance: 2, sourcePages: [34, 35] },
    ])
  })

  it('네트워크 데이터 주제는 원본 항목 수만큼 개념을 가진다', () => {
    // 첫 값 21은 원본 7에 phase 26 step 6이 dump-gaps에서 옮긴 신규 14를 더한 것이고,
    // 이어지는 18·18·14는 step 7이 원본 8개념을 셋으로 갈라 신규 42를 더한 결과다.
    // 17·16은 step 8이 compute-delivery의 11개념 중 EC2·ASG 쪽 3개와 ELB 쪽 3개를
    // 빼내 신규 27을 더한 결과이고, 24는 step 9가 남은 5개념을 옮겨 신규 16을 더한 데에
    // step 10이 엣지 함수 셋(기존 lambda-at-edge + 신규 2)을 보태 나온 값이다.
    // 18은 step 10이 serverless-containers의 11개념에서 Lambda 계열 4개를 빼내 신규 15를
    // 더한 결과이고, 23·19는 step 11이 남은 7개념을 둘로 가르며 messaging-backup의
    // step-functions-features를 함께 가져와 신규 34를 더한 결과다. 그 바람에
    // messaging-backup은 11에서 10으로 줄었다. 33은 step 12가 그중 메시징 계열 7개념을
    // 빼낸 값이고, 11은 step 13이 남은 AWS Backup 계열 둘에 dump-gaps의 신규 9(백업 6 +
    // 재해 복구 3)를 더한 값이다. 그러고 남은 MSK 하나는 step 15가 kinesis-streaming으로
    // 가져가며 그 주제를 없앴다.
    // 마지막 셋 20·9·19는 step 14가 세 주제에 dump-gaps의 신규 21(VPC 8 · 보안 그룹 4 ·
    // 하이브리드 연결 9)을 더한 값이다.
    // step 20이 (주제 미정)의 parallelcluster를 ec2-autoscaling 3단 끝에,
    // amplify를 api-gateway-step-functions 1단에 넣어 17·19가 18·20이 됐다.
    // phase 54가 기본 개념을 더해 ec2-autoscaling이 18에서 20(구매 옵션·Auto Scaling), elastic-load-balancing이
    // 16에서 18(ALB·NLB), ecs-eks-fargate가 23에서 24(Fargate)가 됐다(ADR-041 개정).
    // phase 55가 기본 개념을 더해 rds-storage-features가 22(자동 백업과 DB 스냅샷), ec2-autoscaling이 21(인스턴스 유형과
    // 제품군), backup-disaster-recovery가 12(재해 복구 전략)가 됐다(ADR-043).
    // phase 64가 주제 맨 앞에 컨테이너와 오케스트레이션의 기본 개념 둘을 더해 ecs-eks-fargate가 24에서 26이 됐다(ADR-049).
    // phase 66이 vs 개념을 더해 rds-storage-features가 23(다중 AZ 배포 vs 읽기 전용 복제본), sqs-sns-eventbridge가
    // 34(EventBridge vs SNS)가 됐다(ADR-051).
    expect(topics.slice(9, 24).map((topic) => topic.concepts.length)).toEqual([
      23, 18, 18, 14, 21, 18, 24, 18, 26, 20, 34, 12, 20, 9, 19,
    ])
  })

  it('기초 주제가 서비스와 용어 다음에 판단 기준과 설계 원칙을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'aws-core-services')

    // 1단 서비스 일곱과 DNS·리전·가용 영역이 각각 무엇인가
    // → 2단 다중 AZ와 단일 AZ, 온프레미스와 마이그레이션
    // → 3단 선택지를 지우는 판단 기준과, 주제 하나에 매이지 않는 설계 원칙 둘.
    // 마지막 둘은 step 20이 (주제 미정)에서 가져왔다(topic-plan "3단 구분").
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'aws-core-services.ec2',
      'aws-core-services.rds',
      'aws-core-services.s3',
      'aws-core-services.route-53',
      'aws-core-services.dns',
      'aws-core-services.elb',
      'aws-core-services.cloudfront',
      'aws-core-services.lambda',
      'aws-core-services.region',
      'aws-core-services.availability',
      'aws-core-services.availability-zone',
      'aws-core-services.multi-az',
      'aws-core-services.single-az',
      'aws-core-services.on-premise',
      'aws-core-services.migration',
      'aws-core-services.exam-heuristics',
      'aws-core-services.exponential-backoff-retry',
      'aws-core-services.blob-offload-to-s3',
    ])
  })

  it('S3 스토리지 클래스 주제가 클래스 8개 다음에 갈림길 7개와 비용 개념 2개를 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 's3-storage-classes')

    // 1단 클래스 여덟 → 2단 어느 클래스를 고르는가 → 3단 클래스별 비용 항목.
    // Glacier 3종을 포함한 클래스 전부가 한 주제 안에 있어야 한다 — 헷갈리는 짝을 가르면
    // "언제 무엇을 쓰는가"를 비교할 자리가 없어진다(PRD "사용자").
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      's3-storage-classes.standard',
      's3-storage-classes.intelligent-tiering',
      's3-storage-classes.standard-ia',
      's3-storage-classes.one-zone-ia',
      's3-storage-classes.glacier-instant-retrieval',
      's3-storage-classes.glacier-flexible-retrieval',
      's3-storage-classes.glacier-deep-archive',
      's3-storage-classes.s3-express-one-zone',
      's3-storage-classes.retrieval-time',
      's3-storage-classes.glacier-or-standard-ia',
      's3-storage-classes.glacier-flexible-retrieval-standard-time',
      's3-storage-classes.glacier-flexible-retrieval-expedited',
      's3-storage-classes.s3-storage-class-cost-order',
      's3-storage-classes.lifecycle-vs-intelligent-tiering',
      's3-storage-classes.s3-storage-class-analysis',
      's3-storage-classes.s3-retrieval-fee-by-class',
      's3-storage-classes.intelligent-tiering-monitoring-fee',
    ])
    expect(topic?.concepts.slice(0, 8).map((concept) => concept.name)).toEqual([
      'S3 Standard',
      'S3 Intelligent-Tiering',
      'S3 Standard-IA (Infrequent Access)',
      'S3 One Zone-IA',
      'S3 Glacier Instant Retrieval',
      'S3 Glacier Flexible Retrieval',
      'S3 Glacier Deep Archive',
      'S3 Express One Zone',
    ])
    expect(topic?.concepts.slice(8).map((concept) => concept.name)).toEqual([
      '즉시 조회 vs 대기 조회',
      'Glacier vs Standard-IA',
      'Glacier Flexible Retrieval의 표준 검색 시간',
      'Glacier Flexible Retrieval의 신속 검색',
      '아카이브 계열의 비용 순서',
      '수명 주기 규칙 vs 자동 계층화',
      'S3 스토리지 클래스 분석',
      '스토리지 클래스마다 다른 검색 요금',
      'Intelligent-Tiering의 객체별 감시 요금',
    ])
  })

  it('S3 버전 관리 주제가 버전 관리·객체 잠금·수명 주기·이벤트 알림·복제 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 's3-versioning-lifecycle')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: 버전 관리(1) → 객체 잠금(2) → 수명 주기 정책(2) → 이벤트 알림(1) → 복제(4).
    // 기능 하나가 블록 하나다. 객체 잠금의 전제 조건(버전 관리 필요)은 버전 관리 뒤, 객체 잠금 블록 안.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      's3-versioning-lifecycle.versioning',
      's3-versioning-lifecycle.object-lock',
      's3-versioning-lifecycle.object-lock-prerequisites',
      's3-versioning-lifecycle.lifecycle-policy',
      's3-versioning-lifecycle.s3-lifecycle-rules-and-size-filter',
      's3-versioning-lifecycle.event-notification',
      's3-versioning-lifecycle.s3-replication',
      's3-versioning-lifecycle.s3-same-region-replication',
      's3-versioning-lifecycle.s3-replication-time-control',
      's3-versioning-lifecycle.s3-replication-cross-account-kms',
    ])
  })

  it('S3 암호화 주제가 암호화·Batch Operations와 인벤토리·Object Lambda 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 's3-encryption-batch')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: 서버 측·클라이언트 측 암호화(8) → Batch Operations와 인벤토리(4) → S3 Object Lambda(1).
    // Batch Operations 블록은 일회성 복사와 지속 복제의 갈림길이 Lambda 호출(세부)보다 앞선다.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      's3-encryption-batch.sse',
      's3-encryption-batch.sse-types',
      's3-encryption-batch.client-side-encryption',
      's3-encryption-batch.envelope-encryption',
      's3-encryption-batch.sse-kms-audit-trail',
      's3-encryption-batch.sse-kms-cost',
      's3-encryption-batch.sse-c-no-rotation-or-audit',
      's3-encryption-batch.s3-secure-transport-condition',
      's3-encryption-batch.batch-operations',
      's3-encryption-batch.s3-inventory-report',
      's3-encryption-batch.batch-copy-vs-replication',
      's3-encryption-batch.s3-batch-operations-lambda-invoke',
      's3-encryption-batch.s3-object-lambda',
    ])
  })

  // 개념 제목은 목록에서 훑으며 찾아가는 이름표이지 그 개념이 주장하는 문장이 아니다.
  // 「배치 작업이 객체마다 Lambda를 부른다」처럼 문장이 제목 자리에 오면 무엇의 이름인지
  // 알 수 없고, 읽고 나서 다시 찾아올 이름도 되지 못한다. 주어가 되는 대상을 제목으로
  // 올리고 주장은 summary·paragraphs로 내린다 — 사용자가 직접 정한 기준이고 phase 29가
  // 시범 주제 하나에서 세운 뒤 phase 31·32가 39개 주제 전부로 넓혔다. 한국어 평서형
  // 종결어미는 모두 `-다`로 끝나므로 그것으로 잰다.
  //
  // **통과시키려고 예외 목록을 만들지 마라**(ADR-026의 경고와 같다). 목록이 생기는 순간
  // 거기에 개념이 추가되어 사각지대가 되살아난다. 이 단언이 실패하면 그 개념의 제목을
  // 명사구로 고쳐라 — 넘기는 것이 아니다.
  it('개념 제목이 모두 문장이 아니라 명사구다', () => {
    topics.forEach((topic) => {
      topic.concepts.forEach((concept) => {
        expect(concept.name, `${concept.id}의 name이 문장이다: "${concept.name}"`).not.toMatch(
          /다$/,
        )
      })
    })
  })

  // 위 기준으로 제목을 줄이다 보면 한 주제 안에 같은 제목이 둘 생길 수 있다 — 그러면
  // 개념 목록에서 둘을 구분할 수 없어, 이름표로서의 구실을 제목이 잃는다. phase 32가
  // 개념 제목 다수를 명사구로 줄이면서 새로 만들 수 있던 유일한 종류의 회귀이고,
  // 착수 시점에 0건이었던 것을 그대로 붙잡는다.
  //
  // **주제를 넘는 중복은 검사하지 않는다.** 같은 서비스가 두 주제에 나오면 제목이 같은
  // 것이 자연스럽고(착수 시점에도 3건 있었다), 그것을 좁히는 것은 목적이 아니다.
  it('한 주제 안에서 개념 제목이 겹치지 않는다', () => {
    topics.forEach((topic) => {
      const names = topic.concepts.map((concept) => concept.name)

      expect(new Set(names).size, `${topic.id}에 같은 제목이 둘 있다`).toBe(names.length)
    })
  })

  // ADR-029 — 용어 풀이는 주제마다 한 번씩 되풀이한다. 판정 기준은 "저장소 안에 정의가
  // 있는가"가 아니라 "이 주제 페이지만 읽고 뜻이 서는가"다. 이 주제는 버킷·객체·접두사의
  // 원적지이지만(ADR-028) 그 셋만으로 읽히지 않는 자리가 더 있었다.
  describe('AWS 핵심 서비스 주제가 주제 안에서 읽히는 용어만 쓴다', () => {
    const topicId = 'aws-core-services'

    const body = (conceptId: string) => {
      const concept = topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)

      return concept?.paragraphs.join(' ') ?? ''
    }

    const topicText = () => {
      const topic = topics.find((candidate) => candidate.id === topicId)

      return (topic?.concepts ?? [])
        .flatMap((concept) => [concept.name, concept.summary, ...concept.paragraphs])
        .join(' ')
    }

    // exam-heuristics가 서버리스를 풀이 없이 처음 쓰고 있었다. 자리를 lambda로 옮긴
    // 이유는 그 개념이 이 방식의 뜻을 이미 설명하고 있고, 배열에서 앞이라 이 주제에서
    // 처음 나오는 자리가 되기 때문이다. ADR-029가 이 낱말의 근거로 지목한 개념이다.
    it('서버리스의 뜻이 이 주제 안에서 풀린다', () => {
      expect(body('aws-core-services.lambda')).toContain(
        '서버를 직접 만들어 관리하지 않고 코드만 올려 실행하는 방식을 **서버리스**라고 한다',
      )
    })

    // blob-offload-to-s3이 메타데이터를 풀이 없이 쓰고 있었다. 이 주제에서 처음 나오는
    // 자리이자 유일한 자리다.
    it('메타데이터의 뜻이 이 주제 안에서 풀린다', () => {
      expect(body('aws-core-services.blob-offload-to-s3')).toContain(
        '메타데이터는 파일의 내용 자체가 아니라 그 파일에 딸려 있는 정보를 뜻한다',
      )
    })

    // `객체 키`는 출처(dump-gaps)의 말이라 살리되, 같은 주제의 s3 개념이 세운 `객체 이름`에
    // 잇는다. 같은 것을 두 이름으로 부르면 어느 쪽이 무엇인지 학습자가 알 수 없다.
    it('객체 키가 같은 주제의 객체·객체 이름에 이어져 쓰인다', () => {
      expect(body('aws-core-services.s3')).toContain('객체 이름의 앞부분은 **접두사**라 하며')
      expect(body('aws-core-services.blob-offload-to-s3')).toContain(
        '그 객체를 가리키는 이름인 객체 키',
      )
    })

    // 제목이 `큰 바이너리는 …에 둔다`였고 본문·해설은 같은 것을 `문서`·`파일 본체`라 불렀다.
    // 제목을 명사구로 내리면서 이름을 본문이 쓰는 말 하나로 모았다 — 네 출처 어디에도
    // `바이너리`가 무엇인지 말하는 문장이 없어 풀이를 세울 근거도 없다.
    it('큰 파일 본체를 바이너리라 부르지 않는다', () => {
      expect(topicText()).not.toContain('바이너리')
      expect(
        questions
          .filter((question) => question.topicId === topicId)
          .filter((question) => question.explanation.includes('바이너리'))
          .map(({ id }) => id),
      ).toEqual([])
    })

    // 형태는 ADR-010과 같다 — 풀이는 summary가 아니라 paragraphs에만 들어간다.
    it('이 주제의 풀이가 개념 요약이나 제목으로 새지 않는다', () => {
      const topic = topics.find((candidate) => candidate.id === topicId)
      const glosses = [
        '방식을 **서버리스**라고 한다',
        '메타데이터는 파일의 내용 자체가 아니라',
        '그 객체를 가리키는 이름인 객체 키',
      ]

      topic?.concepts.forEach((concept) => {
        glosses.forEach((gloss) => {
          expect(concept.summary).not.toContain(gloss)
          expect(concept.name).not.toContain(gloss)
        })
      })
    })
  })

  // ADR-029 — 용어 풀이는 주제마다 한 번씩 되풀이한다. 이 주제는 클래스 여덟 개를
  // 소개하면서 버킷·객체·AZ·수명 주기 규칙을 풀이 없이 쓰고 있었다. 정의는 저장소의
  // 다른 주제에 있었지만, 주제 페이지 단위로 읽는 학습자에게는 없는 것과 같다.
  describe('S3 스토리지 클래스 주제가 주제 안에서 읽히는 용어만 쓴다', () => {
    const topicId = 's3-storage-classes'

    const body = (conceptId: string) => {
      const concept = topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)

      return concept?.paragraphs.join(' ') ?? ''
    }

    // ADR-028의 뜻풀이가 이 주제 안에도 서 있어야 한다. 자리는 배열의 첫 개념이고,
    // 이 주제에서 두 낱말이 처음 나오는 자리다 — 뒤의 개념 열이 이 위에서 읽힌다.
    it('버킷과 객체의 뜻이 이 주제 안에서 풀린다', () => {
      const text = body('s3-storage-classes.standard')

      expect(text).toContain('파일을 담는 저장 공간을 **버킷**이라 부르고')
      expect(text).toContain('버킷에 담긴 파일 하나하나를 **객체**라 부른다')
    })

    // one-zone-ia와 s3-express-one-zone이 AZ를 풀이 없이 쓰고, 뒤의
    // intelligent-tiering-monitoring-fee는 같은 것을 `가용 영역`이라 불렀다.
    // 근거는 aws-core-services.availability-zone·single-az 본문의 성격 한 줄이다.
    it('AZ의 뜻이 이 주제 안에서 풀리고 가용 영역과 이어진다', () => {
      expect(body('s3-storage-classes.one-zone-ia')).toContain(
        'AZ는 가용 영역(Availability Zone)의 약자로, 서로 물리적으로 떨어져 있는 데이터 센터 하나하나를 가리킨다',
      )
    })

    // lifecycle-vs-intelligent-tiering이 수명 주기 규칙을 정의 없이 갈림길의 한쪽으로
    // 세우고 있었다. 근거는 s3-versioning-lifecycle.lifecycle-policy 본문이다.
    it('수명 주기 규칙이 무엇인지 이 주제 안에서 밝혀진다', () => {
      expect(body('s3-storage-classes.lifecycle-vs-intelligent-tiering')).toContain(
        '지정한 기간이 지난 객체를 다른 클래스로 자동으로 옮기도록 미리 정해 두는 수명 주기 규칙',
      )
    })

    // 아카이브 계열·검색이라는 말이 Glacier 개념 셋과 3단 개념 넷에서 쓰이는데
    // 무엇을 가리키는지가 없었다. 계열을 처음 여는 glacier-instant-retrieval과
    // 검색이 처음 나오는 glacier-flexible-retrieval이 그 자리다.
    it('아카이브 계열과 검색이 처음 나오는 자리에서 무엇인지 밝혀진다', () => {
      expect(body('s3-storage-classes.glacier-instant-retrieval')).toContain(
        '오래 보관해 두는 쪽이라 아카이브 계열이라고도 부른다',
      )
      expect(body('s3-storage-classes.glacier-flexible-retrieval')).toContain(
        '맡긴 데이터를 꺼내는 일은 검색이라 부르고',
      )
    })

    // 형태는 ADR-010과 같다 — 풀이는 summary가 아니라 paragraphs에만 들어간다.
    it('이 주제의 풀이가 개념 요약이나 제목으로 새지 않는다', () => {
      const topic = topics.find((candidate) => candidate.id === topicId)
      const glosses = [
        '파일을 담는 저장 공간을 **버킷**이라 부르고',
        'AZ는 가용 영역(Availability Zone)의 약자로',
        '미리 정해 두는 수명 주기 규칙',
        '아카이브 계열이라고도 부른다',
      ]

      topic?.concepts.forEach((concept) => {
        glosses.forEach((gloss) => {
          expect(concept.summary).not.toContain(gloss)
          expect(concept.name).not.toContain(gloss)
        })
      })
    })

    // s3-storage-class-analysis의 산출물을 개념은 `분석과 권고`라 부르는데 q323의
    // 보기 하나만 `분석 보고서`라 불렀다. 같은 것을 두 이름으로 부르면 학습자가
    // 어느 쪽이 무엇인지 알 수 없다 — 개념이 쓰는 말 하나로 모았다.
    it('스토리지 클래스 분석의 산출물을 보고서라 부르지 않는다', () => {
      const topicText = (topics.find((candidate) => candidate.id === topicId)?.concepts ?? [])
        .flatMap((concept) => [concept.name, concept.summary, ...concept.paragraphs])
        .join(' ')
      const questionText = questions
        .filter((question) => question.topicId === topicId)
        .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
        .join(' ')

      expect(topicText).not.toContain('보고서')
      expect(questionText).not.toContain('보고서')
    })

    // 문항은 열 때마다 순서가 섞이고(ADR-011) 랜덤 세트는 일부만 뽑으므로(ADR-012)
    // 학습자는 이 주제를 읽지 않은 채로 문항을 만난다. 그래서 문항 안에서는 풀이가
    // 아니라 개념 본문이 함께 쓰는 말을 쓴다 — q019의 `하나의 AZ`가 그 자리였다.
    it('이 주제의 문제문이 풀이 없는 AZ 약어를 쓰지 않는다', () => {
      const prompts = questions
        .filter((question) => question.topicId === topicId)
        .filter((question) => /AZ/.test(question.prompt))
        .map(({ id }) => id)

      expect(prompts).toEqual([])
    })
  })

  describe('S3 버전 관리 주제가 주제 안에서 읽히는 용어만 쓴다', () => {
    const topicId = 's3-versioning-lifecycle'

    const body = (conceptId: string) => {
      const concept = topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)

      return concept?.paragraphs.join(' ') ?? ''
    }

    // ADR-028의 뜻풀이가 이 주제 안에도 서 있어야 한다(ADR-029 — 주제마다 되풀이한다).
    // 자리는 배열의 첫 개념이고, 이 주제에서 두 낱말이 처음 나오는 자리다.
    it('버킷과 객체의 뜻이 이 주제 안에서 풀린다', () => {
      const text = body('s3-versioning-lifecycle.versioning')

      expect(text).toContain('파일을 담는 최상위 저장 공간을 **버킷**이라 부르고')
      expect(text).toContain('버킷에 담긴 파일 하나하나를 **객체**라 부른다')
    })

    // 접두사는 이 주제에서 마지막 개념의 크기 필터 설명에만 나온다 — 그 자리가 첫 등장이다.
    it('접두사의 뜻이 처음 나오는 자리에서 풀린다', () => {
      expect(body('s3-versioning-lifecycle.s3-lifecycle-rules-and-size-filter')).toContain(
        '접두사는 객체 이름의 앞부분을 가리키며',
      )
    })

    // 수명 주기 정책이 옮기는 대상을 이 주제는 `S3 유형`, 개념 넷과 문항 넷은
    // `저장 유형`·`클래스`·`스토리지 클래스`로 불렀다. 개념 본문이 쓰는 이름 하나로 모으고
    // 그것이 무엇인지 처음 나오는 자리에서 밝힌다. 근거는 s3-storage-classes.standard 본문.
    it('스토리지 클래스가 무엇인지 이 주제 안에서 밝혀지고 다른 이름으로 불리지 않는다', () => {
      expect(body('s3-versioning-lifecycle.lifecycle-policy')).toContain(
        '스토리지 클래스는 객체를 어느 조건으로 보관할지 고르는 유형이며',
      )

      const topicText = (topics.find((candidate) => candidate.id === topicId)?.concepts ?? [])
        .flatMap((concept) => [concept.name, concept.summary, ...concept.paragraphs])
        .join(' ')
      const questionText = questions
        .filter((question) => question.topicId === topicId)
        .flatMap((question) => [question.prompt, ...question.choices, question.explanation])
        .join(' ')

      expect(topicText).not.toContain('저장 유형')
      expect(questionText).not.toContain('저장 유형')
      expect(topicText).not.toContain('S3 유형')
      expect(questionText).not.toContain('S3 유형')
    })

    // 복제 계열 셋이 리전을 축으로 갈리는데 리전이 무엇인지가 이 주제에 없었고,
    // 아카이브 계열은 q271의 오답을 지우는 근거인데 개념 본문에도 풀이가 없었다.
    // 근거는 aws-core-services.region과 s3-storage-classes.glacier-instant-retrieval 본문이다.
    it('리전과 아카이브 계열이 복제 개념 안에서 무엇인지 밝혀진다', () => {
      const text = body('s3-versioning-lifecycle.s3-replication')

      expect(text).toContain('리전은 AWS가 서비스를 제공하는 컴퓨터들이 모여 있는 지리적 위치를 가리킨다')
      expect(text).toContain('데이터를 오래 보관해 두는 쪽이라 아카이브 계열이라고 부른다')
    })

    // 주제 밖 서비스는 사양·수치가 아니라 성격 한 줄만 가져온다(ADR-027·ADR-029).
    // 근거는 각각 aws-core-services.lambda·iam-permissions.iam·s3-encryption-batch.sse-types 본문이다.
    it('주제 밖 서비스 셋의 성격이 쓰이는 자리에서 한 줄로 붙는다', () => {
      expect(body('s3-versioning-lifecycle.event-notification')).toContain(
        'Lambda는 서버를 직접 만들어 관리하지 않고 올려 둔 코드만 실행하는 AWS 서비스다',
      )
      expect(body('s3-versioning-lifecycle.s3-same-region-replication')).toContain(
        'IAM 역할은 원래 접근 권한이 없는 사용자나 서비스에 AWS 리소스 권한을 넘겨주는 장치다',
      )
      expect(body('s3-versioning-lifecycle.s3-replication-cross-account-kms')).toContain(
        'SSE-KMS는 키 관리 서비스인 AWS KMS가 암호화 키를 만들고 관리하는 S3 암호화 방식이다',
      )
    })

    // 이 주제는 같은 기능을 `정책`(개념 2)·`구성`(개념 9)·`규칙`(구성 안의 조건)으로 부른다.
    // 셋은 실제로 다른 것을 가리키므로 하나로 합치지 않고, 마지막 개념이 관계를 밝힌다.
    it('수명 주기 구성이 무엇이고 규칙과 어떻게 다른지 밝혀진다', () => {
      expect(body('s3-versioning-lifecycle.s3-lifecycle-rules-and-size-filter')).toContain(
        '버킷에 걸어 두는 수명 주기 설정 한 벌을 수명 주기 구성이라 부르고, 그 구성은 버킷당 하나다',
      )
    })

    // 형태는 ADR-010과 같다 — 풀이는 summary가 아니라 paragraphs에만 들어간다.
    it('이 주제의 풀이가 개념 요약이나 제목으로 새지 않는다', () => {
      const topic = topics.find((candidate) => candidate.id === topicId)
      const glosses = [
        '파일을 담는 최상위 저장 공간을 **버킷**이라 부르고',
        '접두사는 객체 이름의 앞부분을 가리키며',
        '스토리지 클래스는 객체를 어느 조건으로 보관할지 고르는 유형이며',
        '리전은 AWS가 서비스를 제공하는',
        '아카이브 계열이라고 부른다',
        'Lambda는 서버를 직접 만들어 관리하지 않고',
        'IAM 역할은 원래 접근 권한이 없는',
        'SSE-KMS는 키 관리 서비스인',
      ]

      topic?.concepts.forEach((concept) => {
        glosses.forEach((gloss) => {
          expect(concept.summary).not.toContain(gloss)
          expect(concept.name).not.toContain(gloss)
        })
      })
    })

    // q031·q033은 개념도 정답 텍스트도 같아 content-audit의 ⑥에 뜬다. 중복이 아닌 이유는
    // 묻는 성질이 다르다는 것이고, 그 차이가 프롬프트에 남아 있어야 한다 — q031은 대상 목록
    // 없이 시간에 따라 적용되는 자동화(변별 상대는 S3 Batch Operations), q033은 보존 기한이
    // 끝난 객체의 자동 삭제(변별 상대는 삭제를 막는 객체 잠금·법적 보존)다.
    it('같은 개념에 붙은 수명 주기 문항 셋이 서로 다른 축을 묻는다', () => {
      const byId = Object.fromEntries(questions.map((question) => [question.id, question]))

      expect(byId.q031.prompt).toContain('대상 목록')
      expect(byId.q031.choices).toContain('S3 Batch Operations')
      expect(byId.q032.prompt).toContain('얼마나 자주 접근할지')
      expect(byId.q033.prompt).toContain('보존 기한')
      expect(new Set([byId.q031.prompt, byId.q032.prompt, byId.q033.prompt]).size).toBe(3)
    })
  })

  it('S3 접근 제어 주제가 버킷 정책과 공개 차단부터 Storage Lens까지 접근 경로 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 's3-access-control')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: 버킷 정책(2) → 공개 액세스 차단(2) → 사전 서명된 URL(1) → S3 액세스 권한(1) → 액세스 포인트(2) → CORS(1) → 요청자 부담(1) →
    //   정적 웹사이트 엔드포인트(1) → Storage Lens(2).
    // 공개 액세스 차단 둘은 따로 기본 개념이 없고 버킷 정책을 재정의하거나 그 허용을 통과시키는 관계라
    // 버킷 정책 블록 바로 뒤에 둔다. 접근 수단이 아닌 Storage Lens는 맨 뒤.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      's3-access-control.s3-cross-account-bucket-policy',
      's3-access-control.s3-bucket-policy-source-vpc-condition',
      's3-access-control.s3-account-level-public-access-block',
      's3-access-control.block-public-access-allows-explicit-grants',
      's3-access-control.s3-presigned-url',
      's3-access-control.s3-access-grants',
      's3-access-control.s3-access-point',
      's3-access-control.s3-multi-region-access-point',
      's3-access-control.s3-cors-not-authorization',
      's3-access-control.s3-requester-pays',
      's3-access-control.s3-website-endpoint-no-https',
      's3-access-control.s3-storage-lens',
      's3-access-control.s3-storage-lens-advanced-activity-metrics',
    ])
  })

  it('EBS 주제가 EBS 볼륨·스냅샷·인스턴스 스토어·배치 그룹·EFA 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'ebs-instance-store')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: EBS 볼륨(7) → EBS 스냅샷(4) → 인스턴스 스토어(1) → 배치 그룹(3) → EFA(1).
    // EFA 본문이 클러스터 배치 그룹과 분산 배치 그룹을 둘 다 전제로 쓰므로 배치 그룹 블록 뒤에 둔다(규칙 5).
    // 배치 그룹의 기본 개념은 phase 55가 더했다 — 클러스터와 분산 둘을 그 아래로 들여쓰려고(ADR-043).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'ebs-instance-store.ebs',
      'ebs-instance-store.ebs-elastic-volumes',
      'ebs-instance-store.ebs-volume-type-names',
      'ebs-instance-store.gp3-iops-independent-of-size',
      'ebs-instance-store.io2-block-express-iops-ceiling',
      'ebs-instance-store.ebs-encryption-by-default',
      'ebs-instance-store.ebs-encryption-performance',
      'ebs-instance-store.ebs-recycle-bin',
      'ebs-instance-store.ebs-snapshot-block-public-access',
      'ebs-instance-store.data-lifecycle-manager',
      'ebs-instance-store.ebs-fast-snapshot-restore',
      'ebs-instance-store.instance-store',
      'ebs-instance-store.placement-groups',
      'ebs-instance-store.cluster-placement-group',
      'ebs-instance-store.spread-placement-group',
      'ebs-instance-store.elastic-fabric-adapter',
    ])
  })

  it('EFS·FSx 주제가 EFS·FSx 개요·Windows·Lustre·ONTAP·File Gateway 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'efs-fsx')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // EFS: 기본 → 처리량 모드 둘·성능 모드·One Zone·POSIX 권한 → 수명 주기 관리와 그 세부 둘 →
    //   마운트 대상·계정 간 마운트·단방향 복제. 수명 주기 관리는 주요 기능이지만 자기 세부와
    //   붙이려고 갈림길 뒤에 둔다.
    // FSx 개요: Windows·Lustre·ONTAP·OpenZFS를 한 번에 소개한다.
    // FSx for Windows File Server → FSx for Lustre → FSx for NetApp ONTAP. 세 블록 모두 유형의 기본 개념이 맨 앞에 선다.
    //   ONTAP의 기본 개념은 phase 54가 더했다 — 세부 넷을 그 아래로 들여쓰려고(ADR-041 개정).
    // FSx File Gateway: FSx 파일 시스템이 아니라 온프레미스 쪽 접점이라 FSx 종류를 다 본 뒤에 둔다.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'efs-fsx.efs',
      'efs-fsx.efs-vs-ebs',
      'efs-fsx.efs-throughput-modes',
      'efs-fsx.efs-elastic-throughput',
      'efs-fsx.efs-performance-modes',
      'efs-fsx.efs-one-zone',
      'efs-fsx.efs-posix-permissions',
      'efs-fsx.efs-lifecycle-management',
      'efs-fsx.efs-ia-file-size-threshold',
      'efs-fsx.efs-lifecycle-transition-to-primary',
      'efs-fsx.efs-mount-target-per-az',
      'efs-fsx.efs-cross-account-mount',
      'efs-fsx.efs-replication-one-way',
      'efs-fsx.fsx',
      'efs-fsx.fsx-windows-file-server',
      'efs-fsx.sql-server-always-on-shared-storage',
      'efs-fsx.fsx-windows-storage-auto-scaling',
      'efs-fsx.fsx-for-lustre',
      'efs-fsx.fsx-lustre-sub-millisecond-latency',
      'efs-fsx.fsx-lustre-persistent-deployment',
      'efs-fsx.fsx-lustre-s3-data-repository-association',
      'efs-fsx.fsx-for-netapp-ontap',
      'efs-fsx.fsx-ontap-multi-az',
      'efs-fsx.fsx-ontap-multi-protocol-tiering',
      'efs-fsx.fsx-ontap-iscsi-block',
      'efs-fsx.fsx-ontap-snapmirror',
      'efs-fsx.fsx-file-gateway',
    ])
  })

  it('데이터 전송 주제가 DataSync·Snowball Edge·Transfer Family·S3 직접 전송 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'data-transfer-services')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // DataSync: 기본 → 지속 수집과 예약 전송의 갈림길 → 맡지 않는 일 → 전송 중 암호화·매니페스트·
    //   전송 모드·상태 이벤트.
    // Snowball Edge: 기본 → 현장 컴퓨팅 → 기한과 대역폭 계산(회선을 타는 수단이 전부 탈락한 뒤
    //   Snowball Edge가 남는다는 조건이라 이 블록 끝).
    // Transfer Family: 기본 → 사용자 지정 DNS 이름·Directory Service ID 공급자·서비스 관리형 사용자 →
    //   업로드 후 워크플로와 그 미리 정의된 액션 → 구조화된 로깅. 워크플로는 주요 기능이지만 자기
    //   세부와 붙이려고 갈림길 셋 뒤에 둔다.
    // S3 직접 전송: 전송 가속 → 멀티파트 업로드.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'data-transfer-services.datasync',
      'data-transfer-services.file-gateway-vs-datasync-continuous',
      'data-transfer-services.datasync-scope-limits',
      'data-transfer-services.datasync-in-transit-encryption',
      'data-transfer-services.datasync-manifest',
      'data-transfer-services.datasync-transfer-mode',
      'data-transfer-services.datasync-task-status-event',
      'data-transfer-services.snowball-edge',
      'data-transfer-services.snowball-edge-compute',
      'data-transfer-services.transfer-deadline-vs-bandwidth',
      'data-transfer-services.transfer-family',
      'data-transfer-services.transfer-family-custom-hostname',
      'data-transfer-services.transfer-family-directory-service-identity-provider',
      'data-transfer-services.transfer-family-service-managed-users',
      'data-transfer-services.transfer-family-workflow',
      'data-transfer-services.transfer-family-workflow-actions',
      'data-transfer-services.transfer-family-structured-logging',
      'data-transfer-services.s3-transfer-acceleration',
      'data-transfer-services.s3-multipart-upload',
    ])
  })

  it('Storage Gateway·마이그레이션 주제가 Storage Gateway·DMS·Application Migration Service 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'storage-gateway-migration')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: Storage Gateway(4) → DMS와 SCT(2) → Application Migration Service(1).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'storage-gateway-migration.storage-gateway',
      'storage-gateway-migration.storage-gateway-gateway-types',
      'storage-gateway-migration.storage-gateway-volume-modes',
      'storage-gateway-migration.tape-gateway-archive-tiers',
      'storage-gateway-migration.dms-sct',
      'storage-gateway-migration.dms-full-load-and-cdc-task',
      'storage-gateway-migration.application-migration-service',
    ])
  })

  it('전송 서비스를 가르는 갈림길이 두 주제 양쪽에서 보인다', () => {
    // step 5가 data-transfer-services를 둘로 갈랐다. DataSync ↔ Snowball ↔ Transfer
    // Family ↔ Storage Gateway는 "언제 무엇을 쓰는가"가 그대로 문항이므로, 쪼갠 뒤에도
    // 갈림길 개념이 양쪽에 남아야 한다(PRD "사용자").
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    expect(bodyOf('data-transfer-services.transfer-deadline-vs-bandwidth')).toContain(
      'DataSync·Storage Gateway·DMS',
    )
    expect(bodyOf('data-transfer-services.file-gateway-vs-datasync-continuous')).toContain(
      '파일 게이트웨이',
    )
    expect(bodyOf('storage-gateway-migration.storage-gateway')).toContain('DataSync·Snowball Edge와 달리')
    expect(bodyOf('storage-gateway-migration.dms-full-load-and-cdc-task')).toContain('DataSync')
  })

  it('RDS 주제가 스토리지부터 RDS Custom까지 하위 기능 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'rds-storage-features')

    // ADR-033 하위 기능 블록 순서 — 서비스가 하나라 하위 기능이 블록이다. 블록마다 기본 → 갈림길 → 세부.
    // 블록: RDS(1) → 스토리지 유형(2) → 기능 개요(1) → 다중 AZ(3) → 읽기 전용 복제본(1) → RDS Proxy(2) → 블루/그린 배포(1) → 백업과
    //   스냅샷(5) → 인증과 암호화(3) → 인스턴스 중지(1) → RDS Custom(2).
    // 기능 개요(features)가 다중 AZ → 읽기 전용 복제본 → RDS Proxy → 블루/그린 순으로 소개하므로 그 순서로
    // 블록을 둔다. 백업 블록은 자동 백업과 DB 스냅샷(기본, phase 55가 더했다 — ADR-043) → 리전 간 스냅샷 복사(갈림길) →
    // 자동 백업 보존·특정 시점 복구·수동 스냅샷(세부).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'rds-storage-features.rds',
      'rds-storage-features.storage-types',
      'rds-storage-features.storage-type-names',
      'rds-storage-features.features',
      'rds-storage-features.multi-az-vs-read-replica',
      'rds-storage-features.multi-az-standby-limits',
      'rds-storage-features.rds-multi-az-db-cluster',
      'rds-storage-features.rds-multi-az-failover-rto',
      'rds-storage-features.read-replica-vs-cache',
      'rds-storage-features.connection-issue-heuristic',
      'rds-storage-features.rds-proxy-failover',
      'rds-storage-features.rds-blue-green-deployment',
      'rds-storage-features.rds-backups',
      'rds-storage-features.rds-snapshot-cross-region-copy',
      'rds-storage-features.automated-backup-retention',
      'rds-storage-features.rds-pitr-transaction-log-interval',
      'rds-storage-features.rds-manual-snapshot-retention',
      'rds-storage-features.rds-iam-database-authentication',
      'rds-storage-features.rds-encryption-scope-and-in-transit',
      'rds-storage-features.rds-encrypt-existing-instance',
      'rds-storage-features.rds-stop-instance-restart',
      'rds-storage-features.rds-custom',
      'rds-storage-features.rds-custom-byol',
    ])
  })

  it('RDS와 Aurora가 배열에서 맞붙어 있다', () => {
    // 관리형 관계형 데이터베이스의 두 갈래다. 다른 주제로 떼어 놓으면 "언제 무엇을
    // 쓰는가"를 비교할 자리가 없어진다(PRD "사용자", topic-plan "헷갈리는 짝 배치").
    // Aurora를 담은 주제의 id는 step 7이 바꾸므로 개념 이름으로 찾는다.
    const rdsIndex = topics.findIndex(({ id }) => id === 'rds-storage-features')
    const auroraIndex = topics.findIndex((topic) =>
      topic.concepts.some(({ name }) => name === 'Aurora'),
    )

    expect(rdsIndex).toBeGreaterThanOrEqual(0)
    expect(auroraIndex).toBe(rdsIndex + 1)
  })

  it('다중 AZ 배포의 두 형태가 대기 인스턴스의 역할로 갈린다', () => {
    // 기존 multi-az-standby-limits는 대기 인스턴스가 아무 트래픽도 처리하지 않는다고
    // 못박는다. step 6이 들여온 rds-multi-az-db-cluster는 그 서술이 DB 인스턴스 배포에
    // 대한 것이고 DB 클러스터 배포는 다르다는 것을 같은 주제 안에서 잇는다.
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    expect(bodyOf('rds-storage-features.multi-az-standby-limits')).toContain(
      '아무 트래픽도 처리하지 않으므로',
    )
    expect(bodyOf('rds-storage-features.rds-multi-az-db-cluster')).toContain(
      '다중 AZ DB 인스턴스 배포',
    )
    expect(bodyOf('rds-storage-features.rds-multi-az-db-cluster')).toContain(
      'DB 클러스터 배포까지 부정하지는 않는다',
    )
    expect(bodyOf('rds-storage-features.read-replica-vs-cache')).toContain('ElastiCache')
  })

  it('Aurora 주제가 Serverless부터 스토리지 구성까지 하위 기능 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'aurora')

    // ADR-033 하위 기능 블록 순서 — 서비스가 하나라 하위 기능이 블록이다. 블록마다 기본 → 갈림길 → 세부.
    // 블록: Aurora(1) → Aurora Serverless(2) → 복제본과 엔드포인트(4) → SQL Server에서 옮기기(2) → pgvector(1) → S3로
    //   내보내기(1) → 글로벌 데이터베이스와 리전 간 복제본(3) → 백업과 클론(2) → 스토리지 구성(1) → 확장 수단이 아닌 기능(1).
    // 글로벌 데이터베이스와 리전 간 복제본 블록은 글로벌 데이터베이스 둘을 붙이고 리전 간 복제본을 뒤에 둔다. 쓰기 리전
    //   개념을 RPO·RTO 개념 아래로 들여쓰려고 사이에 있던 복제본을 옮겼다(ADR-041 「남은 자리」 2, phase 54).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'aurora.aurora',
      'aurora.aurora-serverless-v2',
      'aurora.aurora-serverless-max-acu',
      'aurora.aurora-reader-endpoint',
      'aurora.aurora-endpoint-types',
      'aurora.aurora-replica-auto-scaling',
      'aurora.read-replica-no-schema-change',
      'aurora.babelfish',
      'aurora.sql-server-license-cost',
      'aurora.aurora-pgvector',
      'aurora.aurora-select-into-outfile-s3',
      'aurora.aurora-global-database-dr-targets',
      'aurora.aurora-global-database-write-region',
      'aurora.aurora-cross-region-read-replica',
      'aurora.aurora-continuous-backup-rpo',
      'aurora.aurora-clone',
      'aurora.aurora-storage-configurations',
      'aurora.aurora-zdr-and-activity-streams',
    ])
  })

  it('DynamoDB 주제가 Streams부터 항목 크기 제한까지 하위 기능 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'dynamodb')

    // ADR-033 하위 기능 블록 순서 — 서비스가 하나라 하위 기능이 블록이다. 블록마다 기본 → 갈림길 → 세부.
    // 블록: DynamoDB와 응답 시간(2) → Streams(3) → 글로벌 테이블(1) → TTL(2) → 전역 보조 인덱스(1) → 용량 모드와 오토 스케일링(2) →
    //   읽기 일관성(1) → S3 내보내기와 PITR(5) → 항목 크기 제한(1).
    // S3 내보내기 블록이 스트림 경로와 대비하므로 Streams 블록 뒤. PITR은 내보내기의 전제 조건과 붙인다.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'dynamodb.dynamodb',
      'dynamodb.dynamodb-single-digit-latency',
      'dynamodb.dynamodb-streams',
      'dynamodb.dynamodb-streams-retention-24h',
      'dynamodb.dynamodb-streams-batch-size',
      'dynamodb.dynamodb-global-tables',
      'dynamodb.dynamodb-ttl',
      'dynamodb.dynamodb-ttl-deletion-delay',
      'dynamodb.dynamodb-global-secondary-index',
      'dynamodb.dynamodb-capacity-modes',
      'dynamodb.dynamodb-auto-scaling-target-utilization',
      'dynamodb.dynamodb-read-consistency',
      'dynamodb.dynamodb-s3-export-vs-streams',
      'dynamodb.dynamodb-incremental-export',
      'dynamodb.dynamodb-export-no-read-capacity',
      'dynamodb.dynamodb-pitr',
      'dynamodb.dynamodb-export-requires-pitr',
      'dynamodb.dynamodb-item-size-limit',
    ])
  })

  it('캐시·목적별 DB 주제가 ElastiCache·DAX·DocumentDB·Neptune·QLDB·Timestream 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'elasticache-purpose-built-db')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: ElastiCache(6) → DAX(2) → DocumentDB(2) → Neptune(2) → QLDB(1) → Timestream(1).
    // DAX는 따로 기본 개념이 없어 DynamoDB 전용 캐시라는 갈림길이 블록 머리다.
    // Timestream은 기록의 불변성을 보장하지 않는다는 대비로 QLDB를 부르므로 QLDB 뒤에 둔다.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'elasticache-purpose-built-db.elasticache',
      'elasticache-purpose-built-db.elasticache-redis-vs-memcached',
      'elasticache-purpose-built-db.elasticache-multi-az-failover',
      'elasticache-purpose-built-db.elasticache-global-datastore',
      'elasticache-purpose-built-db.cache-requires-application-change',
      'elasticache-purpose-built-db.elasticache-not-a-durable-store',
      'elasticache-purpose-built-db.dax-dynamodb-only',
      'elasticache-purpose-built-db.dax-encryption-at-rest',
      'elasticache-purpose-built-db.documentdb',
      'elasticache-purpose-built-db.documentdb-global-cluster',
      'elasticache-purpose-built-db.neptune',
      'elasticache-purpose-built-db.neptune-streams',
      'elasticache-purpose-built-db.qldb',
      'elasticache-purpose-built-db.timestream',
    ])
  })

  it('캐시 갈림길이 한 주제 안에 함께 있다', () => {
    // ElastiCache(Redis ↔ Memcached) ↔ DAX는 "언제 무엇을 쓰는가"가 그대로 문항이다.
    // step 7이 aurora-dynamodb-cache를 셋으로 가를 때 이 셋을 떼어 놓으면 비교할
    // 자리가 없어진다(PRD "사용자", topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id

    const engines = ownerOf('elasticache-purpose-built-db.elasticache-redis-vs-memcached')
    expect(engines).toBe('elasticache-purpose-built-db')
    expect(ownerOf('elasticache-purpose-built-db.elasticache')).toBe(engines)
    expect(ownerOf('elasticache-purpose-built-db.dax-dynamodb-only')).toBe(engines)
    expect(ownerOf('elasticache-purpose-built-db.dax-encryption-at-rest')).toBe(engines)
  })

  it('EC2·Auto Scaling 주제가 인스턴스 재료·제품군·구매 옵션·조정 정책·혼합 구성·운영 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'ec2-autoscaling')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: EC2와 인스턴스 재료(3) → 인스턴스 제품군(4) → 구매 옵션(3) → Auto Scaling 기본(1) → 조정 정책(3) → 스팟과 혼합 구성(3) →
    //   Auto Scaling 운영(3) → ParallelCluster(1).
    // 구매 옵션과 Auto Scaling의 기본 개념은 phase 54가 더했다 — 구매 옵션 둘과 Auto Scaling 세 블록의 아홉을 그 아래로
    //   들여쓰려고(ADR-041 개정). ec2 개념의 구매 옵션·Auto Scaling 문단은 주제의 첫 소개로 그대로 둔다.
    // 인스턴스 제품군 블록의 기본 개념(인스턴스 유형과 제품군)은 phase 55가 더했다(ADR-043).
    // 향상된 네트워킹은 인스턴스 유형이 지원해야 켜지는 기능이라 인스턴스 제품군 블록 끝에 둔다.
    // 스팟에 올릴 워크로드는 예약 인스턴스 유형과 함께 어떤 구매 옵션을 고를지의 갈림길이라 구매 옵션 블록에 둔다.
    // 스팟과 혼합 구성의 인스턴스 유형 재정의가 예약된 조정을 전제로 쓰므로 조정 정책 블록을 그 앞에 둔다(규칙 5).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'ec2-autoscaling.ec2',
      'ec2-autoscaling.ami-and-launch-template',
      'ec2-autoscaling.ec2-image-builder',
      'ec2-autoscaling.ec2-instance-types',
      'ec2-autoscaling.memory-optimized-instance-family',
      'ec2-autoscaling.gpu-instance-family',
      'ec2-autoscaling.enhanced-networking',
      'ec2-autoscaling.ec2-purchase-options',
      'ec2-autoscaling.reserved-instance-types',
      'ec2-autoscaling.spot-workload-fit',
      'ec2-autoscaling.ec2-auto-scaling',
      'ec2-autoscaling.scheduled-scaling',
      'ec2-autoscaling.target-tracking-vs-simple-scaling',
      'ec2-autoscaling.predictive-scaling',
      'ec2-autoscaling.spot-allocation-strategy',
      'ec2-autoscaling.asg-instance-type-override',
      'ec2-autoscaling.asg-on-demand-base-capacity',
      'ec2-autoscaling.warm-pool',
      'ec2-autoscaling.asg-single-instance-self-healing',
      'ec2-autoscaling.elb-health-check-drives-asg-replacement',
      'ec2-autoscaling.parallelcluster',
    ])
  })

  it('로드 밸런서 주제가 ELB 개요·ALB·NLB·Gateway Load Balancer·공통 설정 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'elastic-load-balancing')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: ELB 개요와 ALB·NLB의 계층 갈림길(2) → ALB(7) → NLB(4) → Gateway Load Balancer(2) → 공통 설정(3).
    // ALB와 NLB의 기본 개념은 phase 54가 더했다 — Gateway Load Balancer처럼 유형마다 기본 개념을 블록 맨 앞에 세우고
    //   세부를 그 아래로 들여쓰려고(ADR-041 개정). elb 개념의 세 유형 소개는 주제의 첫 소개로 그대로 둔다.
    // alb-l7-vs-nlb-l4는 비교 개념이지만 첫 개념 elb가 ALB·NLB를 이미 소개했고 ALB 블록의
    // alb-routing-conditions가 이 비교를 전제로 쓰므로 ALB 블록 앞에 둔다(규칙 5가 규칙 4보다 앞선다).
    // 공통 설정의 유휴 타임아웃이 Gateway Load Balancer를 언급하므로 공통 설정을 맨 뒤에 둔다.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'elastic-load-balancing.elb',
      'elastic-load-balancing.alb-l7-vs-nlb-l4',
      'elastic-load-balancing.alb',
      'elastic-load-balancing.alb-routing-conditions',
      'elastic-load-balancing.alb-cookie-stickiness',
      'elastic-load-balancing.sticky-session-tradeoff',
      'elastic-load-balancing.alb-least-outstanding-requests',
      'elastic-load-balancing.alb-target-group-independent-scaling',
      'elastic-load-balancing.alb-listener-rule-fixed-response',
      'elastic-load-balancing.nlb',
      'elastic-load-balancing.nlb-tls-listener',
      'elastic-load-balancing.nlb-udp-listener',
      'elastic-load-balancing.nlb-ip-targets',
      'elastic-load-balancing.gateway-load-balancer',
      'elastic-load-balancing.gwlb-endpoint-cross-account-inspection',
      'elastic-load-balancing.internal-load-balancer',
      'elastic-load-balancing.load-balancer-idle-timeout',
      'elastic-load-balancing.end-to-end-encryption-behind-alb',
    ])
  })

  it('CloudFront·Global Accelerator 주제가 CloudFront·엣지 함수·Global Accelerator 블록 다음에 둘의 비용 비교를 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'cloudfront-global-accelerator')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // CloudFront: 기본과 오리진 셋 → 서명된 URL·서명된 쿠키·지리적 제한·필드 수준 암호화 →
    //   가격 등급·TTL과 무효화·OAC로 받는 업로드·ALB 오리진 접근 제한. ALB 오리진 접근 제한은
    //   OAC를 전제로 쓰므로 OAC 업로드 뒤.
    // 엣지 함수: 'Edge'의 뜻 → Lambda@Edge와 그 쓰임 둘(오리진 선택·응답 압축) → CloudFront Functions와
    //   그 제약.
    // Global Accelerator: 기본 → 고정 IP·엔드포인트 → 프로토콜·DNS 캐시와 무관한 장애 조치.
    // 비교: CloudFront와 Global Accelerator를 비용으로 가르므로 두 블록 뒤에 둔다.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'cloudfront-global-accelerator.cloudfront',
      'cloudfront-global-accelerator.cloudfront-alb-origin',
      'cloudfront-global-accelerator.cloudfront-multiple-origins',
      'cloudfront-global-accelerator.cloudfront-onprem-origin',
      'cloudfront-global-accelerator.cloudfront-signed-url',
      'cloudfront-global-accelerator.cloudfront-signed-cookie',
      'cloudfront-global-accelerator.cloudfront-geo-restriction',
      'cloudfront-global-accelerator.cloudfront-field-level-encryption',
      'cloudfront-global-accelerator.cloudfront-price-class',
      'cloudfront-global-accelerator.cloudfront-ttl',
      'cloudfront-global-accelerator.cloudfront-s3-upload-with-oac',
      'cloudfront-global-accelerator.cloudfront-alb-origin-access-restriction',
      'cloudfront-global-accelerator.edge-keyword',
      'cloudfront-global-accelerator.lambda-at-edge',
      'cloudfront-global-accelerator.lambda-at-edge-origin-selection-by-viewer-location',
      'cloudfront-global-accelerator.lambda-at-edge-response-compression',
      'cloudfront-global-accelerator.cloudfront-functions',
      'cloudfront-global-accelerator.cloudfront-functions-no-external-calls',
      'cloudfront-global-accelerator.global-accelerator',
      'cloudfront-global-accelerator.global-accelerator-static-ip',
      'cloudfront-global-accelerator.global-accelerator-endpoints',
      'cloudfront-global-accelerator.global-accelerator-protocols',
      'cloudfront-global-accelerator.global-accelerator-vs-dns-failover',
      'cloudfront-global-accelerator.cloudfront-reduces-data-transfer-cost',
    ])
  })

  it('CloudFront와 Global Accelerator가 한 주제 안에 함께 있다', () => {
    // SAA-C03 대표 혼동 짝이다. step 9가 compute-delivery를 비울 때 둘을 다른 주제로
    // 떼어 놓으면 "언제 무엇을 쓰는가"를 비교할 자리가 없어진다
    // (PRD "사용자", topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id

    const fork = ownerOf('cloudfront-global-accelerator.global-accelerator-protocols')
    expect(fork).toBe('cloudfront-global-accelerator')
    expect(ownerOf('cloudfront-global-accelerator.cloudfront')).toBe(fork)
    expect(ownerOf('cloudfront-global-accelerator.global-accelerator')).toBe(fork)
    // 갈림길을 세우는 축이 셋이다 — 사본이 있느냐, 비용, DNS 캐시.
    expect(ownerOf('cloudfront-global-accelerator.cloudfront-reduces-data-transfer-cost')).toBe(fork)
    expect(ownerOf('cloudfront-global-accelerator.global-accelerator-vs-dns-failover')).toBe(fork)
  })

  it('CloudFront의 접근 통제 장치 넷이 서로 무엇으로 갈리는지 한 주제 안에서 읽힌다', () => {
    // 서명된 URL ↔ 서명된 쿠키 ↔ 지리적 제한 ↔ 필드 수준 암호화. 기준이 각각
    // 개별 사용자·URL의 동일성·국가·값 자체라서, 떼어 놓으면 무엇이 무엇의 대안인지
    // 알 수 없게 된다.
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    expect(bodyOf('cloudfront-global-accelerator.cloudfront-signed-url')).toContain('유효 기간 동안만')
    expect(bodyOf('cloudfront-global-accelerator.cloudfront-signed-cookie')).toContain('파일마다 URL이 달라진다')
    expect(bodyOf('cloudfront-global-accelerator.cloudfront-geo-restriction')).toContain('국가를 기준으로 삼지 않는다')
    expect(bodyOf('cloudfront-global-accelerator.cloudfront-field-level-encryption')).toContain('전달되는 값 자체를 가리는')
  })

  it('로드 밸런서 셋의 선택 기준이 한 주제 안에 함께 있다', () => {
    // ALB ↔ NLB ↔ Gateway Load Balancer는 "언제 무엇을 쓰는가"가 그대로 문항이다.
    // step 8이 compute-delivery를 가를 때 셋을 떼어 놓으면 비교할 자리가 없어진다
    // (PRD "사용자", topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id

    const layers = ownerOf('elastic-load-balancing.alb-l7-vs-nlb-l4')
    expect(layers).toBe('elastic-load-balancing')
    expect(ownerOf('elastic-load-balancing.elb')).toBe(layers)
    expect(ownerOf('elastic-load-balancing.gateway-load-balancer')).toBe(layers)
    expect(ownerOf('elastic-load-balancing.nlb-udp-listener')).toBe(layers)
    expect(ownerOf('elastic-load-balancing.gwlb-endpoint-cross-account-inspection')).toBe(layers)
  })

  it('구매 옵션 셋의 갈림길이 한 주제 안에 함께 있다', () => {
    // 스팟 ↔ 온디맨드 ↔ 예약 인스턴스도 갈림길이다. 셋을 처음 소개하는 것은 기존
    // ec2 개념의 문단이고, 고르는 기준은 새로 들어온 개념들이 맡는다.
    const topic = topics.find((candidate) => candidate.id === 'ec2-autoscaling')
    const slugs = new Set(topic?.concepts.map(({ id }) => id.split('.')[1]))
    const body = topic?.concepts
      .find(({ id }) => id === 'ec2-autoscaling.ec2')
      ?.paragraphs.join(' ') ?? ''

    expect(body).toContain('온디맨드 인스턴스')
    expect(body).toContain('스팟 인스턴스')
    expect(body).toContain('예약 인스턴스')
    expect(slugs).toContain('reserved-instance-types')
    expect(slugs).toContain('spot-workload-fit')
    expect(slugs).toContain('spot-allocation-strategy')
    expect(slugs).toContain('asg-on-demand-base-capacity')
  })

  it('오토 스케일링 조정 방식 넷이 한 주제 안에서 이어진다', () => {
    // 예약된 조정 ↔ 대상 추적 ↔ 단순 조정 ↔ 예측 스케일링. 기존 scheduled-scaling이
    // 앞의 둘을 예측 가능성으로 가르고, step 8이 들여온 둘이 남은 축을 세운다.
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    expect(bodyOf('ec2-autoscaling.scheduled-scaling')).toContain('대상 추적')
    expect(bodyOf('ec2-autoscaling.target-tracking-vs-simple-scaling')).toContain('단순 조정')
    expect(bodyOf('ec2-autoscaling.predictive-scaling')).toContain('예약된 조정과 대상 추적')
  })

  it('Lambda 주제가 호출부터 실행 역할까지 하위 기능 블록 다음에 운영 체제 접근 비교를 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'lambda')

    // ADR-033 하위 기능 블록 순서 — 서비스가 하나라 하위 기능이 블록이다. 블록마다 기본 → 갈림길 → 세부.
    // 블록: Lambda(1) → 호출(4) → VPC 연결(1) → 패키징과 종속성(3) → 메모리(2) → 동시성과 콜드 스타트(4) → 버전(1) → 실행 역할(1) →
    //   비교 — 관리형 런타임의 운영 체제 접근(1).
    // SnapStart는 게시된 버전에서만 동작하므로 동시성 블록 끝, 버전 블록 바로 앞에 둔다.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'lambda.lambda',
      'lambda.lambda-function-url',
      'lambda.lambda-function-url-iam-auth',
      'lambda.lambda-invocation-types',
      'lambda.lambda-kinesis-event-source',
      'lambda.lambda-vpc-access',
      'lambda.lambda-container-image',
      'lambda.lambda-layer-size-limit',
      'lambda.lambda-efs-mount',
      'lambda.lambda-memory-cpu-proportional',
      'lambda.lambda-memory-ceiling',
      'lambda.lambda-reserved-concurrency',
      'lambda.lambda-provisioned-concurrency-autoscaling',
      'lambda.lambda-concurrency-limit-throttling',
      'lambda.lambda-snapstart',
      'lambda.lambda-version-alias-config-freeze',
      'lambda.lambda-execution-role-logs',
      'lambda.serverless-runtime-no-os-access',
    ])
  })

  it('컨테이너 주제가 ECS·Fargate·EKS·ECR·Batch·Elastic Beanstalk·App2Container 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'ecs-eks-fargate')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: ECS(5) → Fargate(5) → EKS(9) → ECR(1) → AWS Batch(2) → Elastic Beanstalk(1) →
    //   App2Container(1).
    // ECS 첫 개념이 Fargate 기반 ECS를 소개하므로 Fargate 블록을 ECS 바로 뒤에 둔다. Fargate 블록의 기본 개념은
    //   phase 54가 더했다 — 세부 넷을 그 아래로 들여쓰려고(ADR-041 개정).
    // EKS의 Fargate 파드 격리와 Batch의 Fargate 컴퓨팅 환경이 Fargate를 전제로 쓰므로 둘 다 Fargate 블록 뒤.
    // App2Container는 본문이 Elastic Beanstalk와 대비하므로 그 뒤에 둔다.
    // phase 64가 모든 블록이 전제로 쓰는 컨테이너·컨테이너 이미지와 오케스트레이션·쿠버네티스의 기본 개념 둘을
    //   ECS 블록 앞에 더했다(ADR-049).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'ecs-eks-fargate.container',
      'ecs-eks-fargate.container-orchestration',
      'ecs-eks-fargate.ecs',
      'ecs-eks-fargate.ecs-task-role',
      'ecs-eks-fargate.ecs-task-role-vs-task-execution-role',
      'ecs-eks-fargate.ecs-awsvpc-mode',
      'ecs-eks-fargate.ecs-task-placement-strategy',
      'ecs-eks-fargate.fargate',
      'ecs-eks-fargate.fargate-no-time-limit',
      'ecs-eks-fargate.fargate-spot',
      'ecs-eks-fargate.fargate-per-second-billing',
      'ecs-eks-fargate.fargate-efs-mount',
      'ecs-eks-fargate.eks',
      'ecs-eks-fargate.eks-compute-options',
      'ecs-eks-fargate.eks-fargate-pod-isolation',
      'ecs-eks-fargate.eks-cluster-autoscaler',
      'ecs-eks-fargate.eks-aws-load-balancer-controller',
      'ecs-eks-fargate.eks-connector',
      'ecs-eks-fargate.eks-anywhere',
      'ecs-eks-fargate.eks-irsa',
      'ecs-eks-fargate.eks-secrets-kms-encryption',
      'ecs-eks-fargate.ecr-image-scan-on-push',
      'ecs-eks-fargate.aws-batch',
      'ecs-eks-fargate.batch-fargate-compute-environment',
      'ecs-eks-fargate.elastic-beanstalk',
      'ecs-eks-fargate.app2container',
    ])
  })

  it('API Gateway·Step Functions 주제가 API Gateway·Step Functions·Amplify 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'api-gateway-step-functions')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: API Gateway(14) → Step Functions(5) → Amplify(1).
    // API Gateway 블록은 기본 → API 유형·API 키·접근 통제·엔드포인트·통합 방식(갈림길) →
    // 인증서 리전·매핑 템플릿·IP 제한(세부) 순이다.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'api-gateway-step-functions.api-gateway',
      'api-gateway-step-functions.api-gateway-jwt-authorizer',
      'api-gateway-step-functions.api-gateway-rest-vs-http-timeout',
      'api-gateway-step-functions.api-gateway-rest-only-features',
      'api-gateway-step-functions.api-gateway-websocket-api',
      'api-gateway-step-functions.api-gateway-api-key-not-auth',
      'api-gateway-step-functions.api-gateway-resource-policy',
      'api-gateway-step-functions.api-gateway-endpoint-types',
      'api-gateway-step-functions.api-gateway-behind-cloudfront',
      'api-gateway-step-functions.api-gateway-lambda-proxy-integration',
      'api-gateway-step-functions.api-gateway-aws-service-integration',
      'api-gateway-step-functions.api-gateway-custom-domain-name',
      'api-gateway-step-functions.api-gateway-mapping-template-limits',
      'api-gateway-step-functions.api-gateway-ip-restriction-by-resource-policy',
      'api-gateway-step-functions.step-functions',
      'api-gateway-step-functions.step-functions-features',
      'api-gateway-step-functions.step-functions-long-running-workflow',
      'api-gateway-step-functions.step-functions-express-workflow',
      'api-gateway-step-functions.step-functions-map-state',
      'api-gateway-step-functions.amplify',
    ])
  })

  it('컨테이너 실행 방식 셋의 갈림길이 한 주제 안에서 관리 책임으로 갈린다', () => {
    // ECS ↔ EKS ↔ Fargate. 컨테이너를 어디서 돌리는가가 그대로 문항이므로 떼어 놓으면
    // 비교할 자리가 없어진다(PRD "사용자", topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const fork = ownerOf('ecs-eks-fargate.ecs')
    expect(fork).toBe('ecs-eks-fargate')
    ;[
      'ecs-eks-fargate.eks',
      'ecs-eks-fargate.eks-compute-options',
      'ecs-eks-fargate.fargate-no-time-limit',
      'ecs-eks-fargate.fargate-spot',
      'ecs-eks-fargate.fargate-per-second-billing',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(fork))
    // ECS ↔ EKS는 원래 쿠버네티스였는지로 갈리고, 세 실행 방식은 인프라 관리 책임이
    // 어디까지 남는지로 갈린다. Lambda ↔ Fargate는 실행 시간과 최소 과금 단위다.
    expect(bodyOf('ecs-eks-fargate.eks')).toContain('원래 쿠버네티스였는가')
    expect(bodyOf('ecs-eks-fargate.eks-compute-options')).toContain(
      'EC2 인스턴스의 패치와 관리 책임은 여전히 사용자에게 남는다',
    )
    expect(bodyOf('ecs-eks-fargate.fargate-per-second-billing')).toContain('최소 1분을 매긴다')
  })

  it('API 유형 셋과 워크플로 두 유형이 한 주제 안에서 갈린다', () => {
    // API Gateway REST ↔ HTTP ↔ WebSocket, Step Functions 표준 ↔ Express.
    // 엔드포인트 유형과 지원 기능이 갈리는 자리이므로 함께 둔다
    // (topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const fork = ownerOf('api-gateway-step-functions.api-gateway')
    expect(fork).toBe('api-gateway-step-functions')
    ;[
      'api-gateway-step-functions.api-gateway-jwt-authorizer',
      'api-gateway-step-functions.api-gateway-rest-vs-http-timeout',
      'api-gateway-step-functions.api-gateway-rest-only-features',
      'api-gateway-step-functions.api-gateway-websocket-api',
      'api-gateway-step-functions.step-functions-long-running-workflow',
      'api-gateway-step-functions.step-functions-express-workflow',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(fork))
    // 두 API 유형은 기능·비용·지연 말고 기다려 주는 시간과 기능 목록으로도 갈리고,
    // WebSocket API는 요청·응답 모델 자체가 다르다.
    expect(bodyOf('api-gateway-step-functions.api-gateway-rest-vs-http-timeout')).toContain(
      '그 시간이 REST API 쪽이 더 길기 때문에',
    )
    expect(bodyOf('api-gateway-step-functions.api-gateway-rest-only-features')).toContain(
      'HTTP API는 이 고급 기능들을 완전히 지원하지 않는다',
    )
    expect(bodyOf('api-gateway-step-functions.api-gateway-websocket-api')).toContain(
      '연결을 오래 유지한 채',
    )
    // 워크플로는 실행 시간 상한과 처리량이 반대편을 맡는다.
    expect(bodyOf('api-gateway-step-functions.step-functions-long-running-workflow')).toContain(
      '최대 1년까지',
    )
    expect(bodyOf('api-gateway-step-functions.step-functions-express-workflow')).toContain(
      '높은 처리량, 짧은 실행 시간, 낮은 비용',
    )
  })

  it('메시징 주제가 SQS·SNS·SQS와 SNS의 조합·EventBridge·Amazon MQ·SES 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'sqs-sns-eventbridge')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // SQS: 기본 → 데드레터 큐 → 보존 기간과 표준 대기열의 약점 → 대기열 깊이 확장·배치·가시성 타임아웃·
    //   크기 한계 → FIFO 셋 → 큐 정책·암호화·VPC 엔드포인트.
    // SNS: 기본 → FIFO 주제 → 본문 재작성 제약 → 암호화된 주제의 게시 권한.
    // SQS와 SNS의 조합: 버퍼인가 발행-구독인가, 소비자마다 큐를 두는 팬아웃, 계정 간 발행. 두 서비스를
    //   가르거나 함께 쓰는 개념이라 두 블록 뒤에 둔다.
    // EventBridge: 기본 → Scheduler → Step Functions와의 갈림길 → SNS와의 갈림길(phase 66, ADR-051) → 보장하지 않는 것·이벤트 패턴·
    //   버스·파이프·대상·리소스 변경 규칙.
    // Amazon MQ. SES: 기본 → 수신 규칙.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'sqs-sns-eventbridge.sqs',
      'sqs-sns-eventbridge.dead-letter-queue',
      'sqs-sns-eventbridge.sqs-details',
      'sqs-sns-eventbridge.sqs-queue-depth-scaling',
      'sqs-sns-eventbridge.sqs-batch-and-polling',
      'sqs-sns-eventbridge.sqs-visibility-timeout-vs-processing-time',
      'sqs-sns-eventbridge.sqs-message-size-limit',
      'sqs-sns-eventbridge.sqs-fifo-message-group-id',
      'sqs-sns-eventbridge.sqs-fifo-deduplication-id',
      'sqs-sns-eventbridge.sqs-content-based-deduplication',
      'sqs-sns-eventbridge.sqs-queue-policy',
      'sqs-sns-eventbridge.sqs-encryption-and-consumer-kms-permission',
      'sqs-sns-eventbridge.sqs-vpc-endpoint-and-queue-policy',
      'sqs-sns-eventbridge.sns',
      'sqs-sns-eventbridge.sns-fifo-topic',
      'sqs-sns-eventbridge.sns-no-message-body-rewrite',
      'sqs-sns-eventbridge.sns-encrypted-topic-publish-permissions',
      'sqs-sns-eventbridge.sns-is-not-a-queue',
      'sqs-sns-eventbridge.sns-sqs-fanout-per-consumer',
      'sqs-sns-eventbridge.cross-account-sns-to-sqs-queue-policy',
      'sqs-sns-eventbridge.eventbridge',
      'sqs-sns-eventbridge.eventbridge-scheduler',
      'sqs-sns-eventbridge.eventbridge-vs-step-functions',
      'sqs-sns-eventbridge.eventbridge-vs-sns',
      'sqs-sns-eventbridge.eventbridge-ordering-and-retention',
      'sqs-sns-eventbridge.eventbridge-event-pattern-vs-polling',
      'sqs-sns-eventbridge.eventbridge-event-bus-types',
      'sqs-sns-eventbridge.eventbridge-pipes',
      'sqs-sns-eventbridge.eventbridge-api-destination',
      'sqs-sns-eventbridge.eventbridge-private-api-target',
      'sqs-sns-eventbridge.eventbridge-resource-change-rule',
      'sqs-sns-eventbridge.amazon-mq',
      'sqs-sns-eventbridge.ses',
      'sqs-sns-eventbridge.ses-inbound-email-receiving',
    ])
  })

  it('메시징 세 갈래가 한 주제 안에서 서로 무엇으로 갈리는지 읽힌다', () => {
    // SQS ↔ SNS ↔ EventBridge. 셋 중 무엇을 고르는가가 그대로 문항이고, Amazon MQ와
    // SES도 같은 보기 줄에 오르므로 함께 둔다(PRD "사용자", topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const fork = ownerOf('sqs-sns-eventbridge.sqs')
    expect(fork).toBe('sqs-sns-eventbridge')
    ;[
      'sqs-sns-eventbridge.sns',
      'sqs-sns-eventbridge.eventbridge',
      'sqs-sns-eventbridge.amazon-mq',
      'sqs-sns-eventbridge.ses',
      'sqs-sns-eventbridge.sns-is-not-a-queue',
      'sqs-sns-eventbridge.sns-sqs-fanout-per-consumer',
      'sqs-sns-eventbridge.eventbridge-vs-step-functions',
      'sqs-sns-eventbridge.eventbridge-ordering-and-retention',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(fork))
    // SQS ↔ SNS는 쌓아 두는 버퍼인가로 갈리고, 팬아웃은 그 둘을 겹쳐 쓴다.
    // EventBridge는 라우팅까지가 몫이라 단계 추적도 순서·장기 보존도 맡지 않는다.
    expect(bodyOf('sqs-sns-eventbridge.sns-is-not-a-queue')).toContain('내구성 있는 버퍼다')
    expect(bodyOf('sqs-sns-eventbridge.sns-sqs-fanout-per-consumer')).toContain(
      '모든 소비자가 모든 이벤트를 받는다',
    )
    expect(bodyOf('sqs-sns-eventbridge.eventbridge-vs-step-functions')).toContain(
      '이벤트 라우팅 서비스라',
    )
    expect(bodyOf('sqs-sns-eventbridge.eventbridge-ordering-and-retention')).toContain(
      '24시간 넘게 들고 있지 않는다',
    )
  })

  it('표준 큐와 FIFO 큐의 갈림길이 한 주제 안에서 이어진다', () => {
    // 표준 ↔ FIFO. 순서와 중복 제거가 필요한지로 갈리는 한 벌이라 떼어 놓으면
    // 어느 쪽을 고르는지 판단할 자리가 없어진다(topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const fork = ownerOf('sqs-sns-eventbridge.sqs-details')
    expect(fork).toBe('sqs-sns-eventbridge')
    ;[
      'sqs-sns-eventbridge.sns-fifo-topic',
      'sqs-sns-eventbridge.sqs-fifo-message-group-id',
      'sqs-sns-eventbridge.sqs-fifo-deduplication-id',
      'sqs-sns-eventbridge.sqs-content-based-deduplication',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(fork))
    // 두 유형을 소개하는 것은 기존 sqs 개념의 문단이고, 표준 큐의 약점이 그 뒤를 잇는다.
    expect(bodyOf('sqs-sns-eventbridge.sqs')).toContain('**표준 대기열**')
    expect(bodyOf('sqs-sns-eventbridge.sqs')).toContain('**선입선출 대기열**')
    expect(bodyOf('sqs-sns-eventbridge.sqs-details')).toContain('순서가 바뀔 수 있다')
    // FIFO가 무엇을 어느 단위로 보장하는지, 그리고 표준 큐로는 왜 안 되는지가 이어진다.
    expect(bodyOf('sqs-sns-eventbridge.sqs-fifo-message-group-id')).toContain(
      '메시지 그룹 단위로 적용된다',
    )
    expect(bodyOf('sqs-sns-eventbridge.sqs-fifo-deduplication-id')).toContain(
      '걸러내는 범위가 5분이다',
    )
    expect(bodyOf('sqs-sns-eventbridge.sqs-content-based-deduplication')).toContain(
      '**표준 큐로는 이 요구를 만족할 수 없다.**',
    )
    // SNS 쪽에도 같은 두 유형이 있고, 지점 간 큐와 갈리는 지점이 여기다.
    expect(bodyOf('sqs-sns-eventbridge.sns-fifo-topic')).toContain(
      '여러 구독자에게 동시에 뿌리지 못한다',
    )
  })

  it('백업·재해 복구 주제가 AWS Backup·재해 복구 전략·Elastic Disaster Recovery 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'backup-disaster-recovery')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: AWS Backup(8) → 재해 복구 전략(3) → Elastic Disaster Recovery(1).
    // 재해 복구 전략의 기본 개념은 phase 55가 더했다 — 네 방식을 소개하고 백업 및 복원·웜 스탠바이를 그 아래로 들여쓴다(ADR-043).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'backup-disaster-recovery.backup',
      'backup-disaster-recovery.backup-long-term-retention',
      'backup-disaster-recovery.backup-ec2-resource-assignment',
      'backup-disaster-recovery.organizations-backup-policy',
      'backup-disaster-recovery.backup-cross-account-copy',
      'backup-disaster-recovery.backup-s3-continuous-backup',
      'backup-disaster-recovery.backup-restore-testing-plan',
      'backup-disaster-recovery.backup-audit-manager',
      'backup-disaster-recovery.dr-strategies',
      'backup-disaster-recovery.backup-and-restore-dr',
      'backup-disaster-recovery.warm-standby-for-low-rto',
      'backup-disaster-recovery.elastic-disaster-recovery',
    ])
  })

  it('재해 복구 전략이 한 주제 안에서 복구 시간과 비용으로 갈린다', () => {
    // 백업 및 복원 ↔ 웜 스탠바이. RTO·RPO로 갈리는 한 벌이라 흩으면 "짧은 RTO는
    // 무엇을 고르는가"를 배울 자리가 없어진다(PRD "사용자", topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const fork = ownerOf('backup-disaster-recovery.backup-and-restore-dr')
    expect(fork).toBe('backup-disaster-recovery')
    ;[
      'backup-disaster-recovery.warm-standby-for-low-rto',
      'backup-disaster-recovery.elastic-disaster-recovery',
      'backup-disaster-recovery.backup',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(fork))
    // 한쪽 끝은 대기 자원을 두지 않아 비용이 가장 낮고 복구가 즉시 끝나지 않는다.
    expect(bodyOf('backup-disaster-recovery.backup-and-restore-dr')).toContain(
      '컴퓨팅은 필요해질 때까지 띄우지 않는다',
    )
    expect(bodyOf('backup-disaster-recovery.backup-and-restore-dr')).toContain(
      '복구가 즉시 끝나지 않는다',
    )
    // 반대쪽 끝은 대기 환경이 실제로 떠 있어야 하고 전환도 자동이어야 한다.
    expect(bodyOf('backup-disaster-recovery.warm-standby-for-low-rto')).toContain(
      '실제로 실행 중이어야 하고',
    )
    expect(bodyOf('backup-disaster-recovery.warm-standby-for-low-rto')).toContain(
      '상태 점검을 건 DNS 장애 조치',
    )
    // DRS는 지속 복제로 그 복구 시간을 더 줄이는 쪽이다.
    expect(bodyOf('backup-disaster-recovery.elastic-disaster-recovery')).toContain(
      '디스크 변경을 지속적으로 복제',
    )
  })

  it('VPC 주제가 NAT·엔드포인트 블록 뒤에 둘의 비교를 두고 네 연결 방식의 비교와 플로우 로그로 끝낸다', () => {
    const topic = topics.find((candidate) => candidate.id === 'vpc-networking')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: VPC와 서브넷(1) → 인터넷 게이트웨이(2) → NAT 게이트웨이(5) → VPC 엔드포인트(4) → 비교 — NAT 경로와 엔드포인트(2) → VPC
    //   피어링(2) → PrivateLink(2) → 비교 — NAT·엔드포인트·PrivateLink·피어링(1) → VPC 플로우 로그(1).
    // internet-gateway-is-not-per-az는 인터넷 게이트웨이 개념이지만 본문이 바로 앞의 nat-gateway-per-az
    // 규칙을 전제로 대비하므로 NAT 블록 안에 둔다(규칙 5). nat-gateway-traffic-uses-public-endpoints와
    // nat-instance는 NAT 개념이지만 본문이 인터페이스 엔드포인트·게이트웨이 엔드포인트를 대안으로 쓰므로
    // NAT·엔드포인트 두 블록 뒤에 비교로 둔다(규칙 4·5). PrivateLink 엔드포인트 서비스가 피어링과
    // 대비하므로 피어링 블록을 PrivateLink 앞에 둔다. 네 연결 방식의 비교는 네 블록 뒤(규칙 4).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'vpc-networking.vpc-subnet',
      'vpc-networking.internet-gateway',
      'vpc-networking.egress-only-igw',
      'vpc-networking.nat-gateway',
      'vpc-networking.nat-gateway-per-az',
      'vpc-networking.internet-gateway-is-not-per-az',
      'vpc-networking.nat-gateway-count-by-environment',
      'vpc-networking.nat-gateway-elastic-ip',
      'vpc-networking.vpc-endpoint',
      'vpc-networking.endpoint-pricing',
      'vpc-networking.vpc-endpoint-policy',
      'vpc-networking.s3-is-regional',
      'vpc-networking.nat-gateway-traffic-uses-public-endpoints',
      'vpc-networking.nat-instance',
      'vpc-networking.vpc-peering',
      'vpc-networking.vpc-peering-scaling-limit',
      'vpc-networking.privatelink',
      'vpc-networking.privatelink-endpoint-service',
      'vpc-networking.comparison',
      'vpc-networking.vpc-flow-logs',
    ])
  })

  it('보안 그룹·NACL 주제가 보안 그룹·NACL 블록 다음에 둘의 비교를 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'security-groups-nacl')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: 보안 그룹(4) → NACL(3) → 비교 — 상태 저장과 Web ACL(2).
    // 상태 저장 ↔ 상태 비저장과 Web ACL ↔ 네트워크 ACL은 두 블록을 가르는 비교라 두 블록 뒤(규칙 4).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'security-groups-nacl.security-group',
      'security-groups-nacl.security-group-referencing',
      'security-groups-nacl.alb-security-group-outbound-and-health-check-port',
      'security-groups-nacl.nlb-security-group',
      'security-groups-nacl.nacl',
      'security-groups-nacl.nacl-rule-limit',
      'security-groups-nacl.nacl-deny-at-source-subnet',
      'security-groups-nacl.security-group-stateful-vs-nacl-stateless',
      'security-groups-nacl.web-acl-vs-nacl',
    ])
  })

  it('하이브리드 연결 주제가 연결 수단 블록 다음에 선택 기준·트래픽 설계·엣지 옵션을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'hybrid-connectivity')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: Site-to-Site VPN(2) → Client VPN(1) → Transit Gateway(2) → Direct Connect(6) → 비교 — VPN과
    //   Direct Connect(3) → 온프레미스와 오가는 트래픽(3) → 리전에 붙는 엣지 옵션(2).
    // Direct Connect 블록의 가상 프라이빗 게이트웨이·Direct Connect Gateway·VIF 유형이 Transit Gateway를
    // 전제로 쓰므로 Transit Gateway를 Direct Connect 앞에 둔다. VPN과 Direct Connect의 비교·출발점·
    // VPC마다 따로 맺는 VPN은 두 수단과 Transit Gateway를 함께 부르므로 연결 수단 블록 뒤(규칙 4).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'hybrid-connectivity.site-to-site-vpn',
      'hybrid-connectivity.access-terms',
      'hybrid-connectivity.client-vpn',
      'hybrid-connectivity.transit-gateway',
      'hybrid-connectivity.transit-gateway-cross-region-peering',
      'hybrid-connectivity.direct-connect',
      'hybrid-connectivity.virtual-private-gateway',
      'hybrid-connectivity.direct-connect-gateway',
      'hybrid-connectivity.direct-connect-caveats',
      'hybrid-connectivity.direct-connect-resiliency',
      'hybrid-connectivity.direct-connect-vif-types',
      'hybrid-connectivity.vpn-vs-direct-connect',
      'hybrid-connectivity.onprem-connectivity-heuristic',
      'hybrid-connectivity.per-vpc-vpn-for-isolation',
      'hybrid-connectivity.onprem-access-via-interface-endpoint',
      'hybrid-connectivity.data-locality-cost',
      'hybrid-connectivity.centralized-onprem-egress',
      'hybrid-connectivity.region-attached-edge-options',
      'hybrid-connectivity.outposts-data-residency',
    ])
  })

  it('보안 그룹과 NACL이 한 주제 안에서 상태 저장 여부로 갈린다', () => {
    // 대표 혼동 짝이다. 둘을 다른 주제로 떼면 "응답 트래픽에 규칙이 필요한가"를
    // 비교할 자리가 없어진다(PRD "사용자", topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const fork = ownerOf('security-groups-nacl.security-group-stateful-vs-nacl-stateless')
    expect(fork).toBe('security-groups-nacl')
    ;[
      'security-groups-nacl.security-group',
      'security-groups-nacl.nacl',
      'security-groups-nacl.nacl-deny-at-source-subnet',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(fork))
    // 보안 그룹은 응답을 규칙 없이 돌려보내고, NACL은 방향마다 규칙이 있어야 한다.
    const stateful = bodyOf('security-groups-nacl.security-group-stateful-vs-nacl-stateless')
    expect(stateful).toContain('아웃바운드 규칙이 없어도 나가고')
    expect(stateful).toContain('각각 규칙이 있어야 통신이 성립한다')
    // 차단이 필요하면 자리는 NACL이고, 남는 판단은 서브넷과 방향이다.
    expect(bodyOf('security-groups-nacl.nacl-deny-at-source-subnet')).toContain(
      '보내는 쪽 서브넷의 아웃바운드',
    )
  })

  it('온프레미스를 잇는 세 수단이 한 주제 안에 함께 있다', () => {
    // Site-to-Site VPN ↔ Direct Connect ↔ Transit Gateway는 한 벌이다. 흩으면
    // "언제 무엇을 쓰는가"를 비교할 자리가 없어진다(topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const fork = ownerOf('hybrid-connectivity.vpn-vs-direct-connect')
    expect(fork).toBe('hybrid-connectivity')
    ;[
      'hybrid-connectivity.site-to-site-vpn',
      'hybrid-connectivity.direct-connect',
      'hybrid-connectivity.transit-gateway',
      'hybrid-connectivity.per-vpc-vpn-for-isolation',
      'hybrid-connectivity.transit-gateway-cross-region-peering',
      'hybrid-connectivity.virtual-private-gateway',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(fork))
    // VPC마다 따로 걸면 VPC 사이에 경로가 생기지 않고, Transit Gateway로 모으면
    // 리전을 넘어서까지 경로가 이어진다. 가상 프라이빗 게이트웨이가 그 사이의 한계다.
    expect(bodyOf('hybrid-connectivity.per-vpc-vpn-for-isolation')).toContain(
      'VPC 사이에는 어느 쪽 라우팅 테이블에도 경로가 없다',
    )
    expect(bodyOf('hybrid-connectivity.transit-gateway-cross-region-peering')).toContain(
      '리전 수만큼만 늘어난다',
    )
    expect(bodyOf('hybrid-connectivity.virtual-private-gateway')).toContain(
      'VPC마다 하나씩 붙는 장치',
    )
  })

  it('엔드포인트 두 유형과 PrivateLink의 갈림길이 한 주제 안에서 읽힌다', () => {
    // 게이트웨이 엔드포인트 ↔ 인터페이스 엔드포인트 ↔ PrivateLink ↔ 피어링.
    // 넷이 같은 보기 줄에 오르므로 한 주제에 둔다(topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const fork = ownerOf('vpc-networking.comparison')
    expect(fork).toBe('vpc-networking')
    ;[
      'vpc-networking.vpc-endpoint',
      'vpc-networking.endpoint-pricing',
      'vpc-networking.privatelink',
      'vpc-networking.privatelink-endpoint-service',
      'vpc-networking.vpc-peering',
      'vpc-networking.nat-gateway-traffic-uses-public-endpoints',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(fork))
    // NAT를 거치면 목적지가 공용 엔드포인트라 사설 경로 요구를 채우지 못하고,
    // 엔드포인트 서비스는 라우팅 테이블을 건드리지 않는 쪽으로 피어링과 갈린다.
    expect(bodyOf('vpc-networking.nat-gateway-traffic-uses-public-endpoints')).toContain(
      '그 서비스의 공용 엔드포인트다',
    )
    expect(bodyOf('vpc-networking.privatelink-endpoint-service')).toContain(
      '라우팅 테이블을 건드리지 않는다',
    )
  })

  it('동시성 세 갈래가 한 주제 안에서 서로 무엇으로 갈리는지 읽힌다', () => {
    // 예약된 동시성 ↔ 프로비저닝된 동시성 ↔ 계정의 동시 실행 한도. 이름이 닮아
    // 보기 줄에 나란히 오르므로 떼어 놓으면 무엇이 무엇의 대안인지 알 수 없게 된다
    // (PRD "사용자", topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const fork = ownerOf('lambda.lambda-reserved-concurrency')
    expect(fork).toBe('lambda')
    expect(ownerOf('lambda.lambda-provisioned-concurrency-autoscaling')).toBe(fork)
    expect(ownerOf('lambda.lambda-concurrency-limit-throttling')).toBe(fork)
    // 콜드 스타트를 줄이는 쪽과 용량만 떼어 두는 쪽이 갈리고, 한도는 넘칠 때 무슨 일이
    // 벌어지는지를 맡는다. 콜드 스타트를 소개하는 것은 기존 lambda 개념의 문단이다.
    expect(bodyOf('lambda.lambda')).toContain('콜드 스타트')
    expect(bodyOf('lambda.lambda-reserved-concurrency')).toContain('콜드 스타트는 그대로 남는다')
    expect(bodyOf('lambda.lambda-provisioned-concurrency-autoscaling')).toContain('수요를 따라 오르내린다')
    expect(bodyOf('lambda.lambda-concurrency-limit-throttling')).toContain('확장을 묶는 쪽으로 작용한다')
  })

  it('엣지에서 코드를 돌리는 두 갈래가 CloudFront 주제 안에 함께 있다', () => {
    // Lambda@Edge ↔ CloudFront Functions. step 10이 serverless-containers에 있던
    // lambda-at-edge를 CloudFront 쪽으로 옮겨 온 이유가 이 갈림길이다
    // (topic-plan "헷갈리는 짝 배치", "step 경계를 넘는 개념").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const edge = ownerOf('cloudfront-global-accelerator.lambda-at-edge')
    expect(edge).toBe('cloudfront-global-accelerator')
    expect(ownerOf('cloudfront-global-accelerator.cloudfront-functions')).toBe(edge)
    expect(ownerOf('cloudfront-global-accelerator.cloudfront-functions-no-external-calls')).toBe(edge)
    expect(ownerOf('cloudfront-global-accelerator.lambda-at-edge-response-compression')).toBe(edge)
    // 둘을 가르는 축은 실행 모델이고, 각자 할 수 있는 일이 그 뒤에 이어진다.
    expect(bodyOf('cloudfront-global-accelerator.cloudfront-functions')).toContain('프로그래밍 모델과 배포 방식이 서로 다르다')
    expect(bodyOf('cloudfront-global-accelerator.lambda-at-edge-response-compression')).toContain('전달 직전에 응답을 압축한다')
  })

  it('EMR·Glue·Athena 주제가 EMR·Spark·Glue·Athena·Lake Formation·Parquet 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'emr-glue-athena')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: EMR(7) → Spark(1) → Glue(4) → Athena(4) → Lake Formation(3) → Apache Parquet(1).
    // EMR 블록: 관리형 스케일링이 코어 노드를 언급하므로 노드 세 가지가 그 앞(규칙 5), 노드 역할별
    // 제품군은 세부라 갈림길 뒤. Glue의 고객별 키 ETL은 EMR과 대비하므로 EMR 블록 뒤, Lake Formation
    // 블루프린트는 Athena를 거친 열 권한을 쓰므로 Athena 블록 뒤.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'emr-glue-athena.emr',
      'emr-glue-athena.emr-node-types',
      'emr-glue-athena.emr-transient-cluster',
      'emr-glue-athena.emr-managed-scaling',
      'emr-glue-athena.emr-node-instance-family-choice',
      'emr-glue-athena.emr-runtime-role',
      'emr-glue-athena.emr-security-configuration',
      'emr-glue-athena.spark',
      'emr-glue-athena.glue',
      'emr-glue-athena.glue-crawler',
      'emr-glue-athena.glue-databrew',
      'emr-glue-athena.glue-etl-with-per-customer-kms-key',
      'emr-glue-athena.athena',
      'emr-glue-athena.athena-encrypted-and-pay-per-query',
      'emr-glue-athena.athena-federated-query',
      'emr-glue-athena.log-storage-s3-athena',
      'emr-glue-athena.lake-formation',
      'emr-glue-athena.lake-formation-blueprint-and-athena',
      'emr-glue-athena.lake-formation-lf-tags',
      'emr-glue-athena.parquet-columnar-format',
    ])
  })

  it('스트리밍 주제가 Data Streams·Firehose·Flink 블록과 그 비교 다음에 Video Streams·MSK를 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'kinesis-streaming')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: Kinesis Data Streams(6) → Data Firehose(4) → Managed Service for Apache Flink(2) → 비교 — 세
    //   서비스의 담당 단계(1) → Kinesis Video Streams(1) → Amazon MSK(2).
    // Flink의 Kinesis 소스·싱크가 Data Streams를 전제로 쓰므로 Flink가 Data Streams 뒤. 세 서비스의
    // 담당 단계 비교는 세 블록 뒤(규칙 4).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'kinesis-streaming.kinesis-data-streams',
      'kinesis-streaming.kinesis-retention-and-fanout',
      'kinesis-streaming.kinesis-client-library',
      'kinesis-streaming.kinesis-record-size-limit',
      'kinesis-streaming.kinesis-partition-key-hot-shard',
      'kinesis-streaming.kinesis-capacity-mode',
      'kinesis-streaming.data-firehose',
      'kinesis-streaming.firehose-lambda-transformation',
      'kinesis-streaming.firehose-format-conversion',
      'kinesis-streaming.firehose-buffering',
      'kinesis-streaming.managed-service-apache-flink',
      'kinesis-streaming.flink-kinesis-source-sink',
      'kinesis-streaming.streaming-services-comparison',
      'kinesis-streaming.kinesis-video-streams',
      'kinesis-streaming.msk',
      'kinesis-streaming.msk-kafka-connect',
    ])
  })

  it('웨어하우스·검색·시각화 주제가 Redshift·OpenSearch·QuickSight 블록 다음에 적재 경로를 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'redshift-opensearch-quicksight')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: Redshift와 Spectrum(7) → OpenSearch(1) → QuickSight(2) → 운영 데이터를 S3에 남기는 경로(1).
    // Redshift 블록: 기본·Spectrum → OLTP와 OLAP·Athena와의 갈림길·핫 콜드 분리 → 동시성 확장·COPY.
    // 운영 테이블의 과거 데이터를 S3에 남기는 경로는 조회를 Athena·QuickSight에 맡기므로 QuickSight 뒤.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'redshift-opensearch-quicksight.redshift',
      'redshift-opensearch-quicksight.redshift-spectrum',
      'redshift-opensearch-quicksight.oltp-vs-olap',
      'redshift-opensearch-quicksight.athena-vs-redshift-workload',
      'redshift-opensearch-quicksight.redshift-hot-cold-split',
      'redshift-opensearch-quicksight.redshift-concurrency-scaling',
      'redshift-opensearch-quicksight.redshift-copy-from-s3',
      'redshift-opensearch-quicksight.opensearch-text-search',
      'redshift-opensearch-quicksight.quicksight',
      'redshift-opensearch-quicksight.quicksight-ml-forecast',
      'redshift-opensearch-quicksight.dynamodb-to-s3-analytics',
    ])
  })

  it('Kinesis 네 갈래와 MSK가 한 주제 안에서 담당으로 갈린다', () => {
    // Data Streams ↔ Data Firehose ↔ Flink(옛 Data Analytics) ↔ Video Streams를 한
    // 주제에 두고, 스트리밍 갈림길인 MSK도 같은 자리에 둔다. 흩으면 "언제 무엇을 쓰는가"를
    // 비교할 자리가 없어진다(PRD "사용자", topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const streaming = ownerOf('kinesis-streaming.kinesis-data-streams')
    expect(streaming).toBe('kinesis-streaming')
    ;[
      'kinesis-streaming.data-firehose',
      'kinesis-streaming.managed-service-apache-flink',
      'kinesis-streaming.kinesis-video-streams',
      'kinesis-streaming.msk',
      'kinesis-streaming.streaming-services-comparison',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(streaming))
    // 앞의 셋은 담당 단계로 갈리고, 영상 갈래는 이름만 같은 다른 대상을 다룬다.
    expect(bodyOf('kinesis-streaming.streaming-services-comparison')).toContain('스트림 저장소 역할을 한다')
    expect(bodyOf('kinesis-streaming.kinesis-video-streams')).toContain('저장된 미디어 배포는')
    // Kinesis ↔ MSK의 갈림길은 이미 Kafka를 쓰고 있는가다.
    expect(bodyOf('kinesis-streaming.msk')).toContain('코드를 크게 바꾸지 않고 그대로 옮길 수 있는')
    expect(bodyOf('kinesis-streaming.msk-kafka-connect')).toContain('Kafka Connect로')
  })

  it('Athena와 Redshift와 Spectrum의 갈림길이 한 주제 안에서 읽힌다', () => {
    // 임시 쿼리 ↔ 반복되는 고성능 쿼리 ↔ S3에 둔 채 조회하기. Athena 자체를 소개하는
    // 개념은 emr-glue-athena에 있고, 셋을 가르는 갈림길은 웨어하우스 주제에 둔다
    // (topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const warehouse = ownerOf('redshift-opensearch-quicksight.athena-vs-redshift-workload')
    expect(warehouse).toBe('redshift-opensearch-quicksight')
    ;[
      'redshift-opensearch-quicksight.redshift',
      'redshift-opensearch-quicksight.redshift-spectrum',
      'redshift-opensearch-quicksight.redshift-hot-cold-split',
      'redshift-opensearch-quicksight.oltp-vs-olap',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(warehouse))
    // 갈리는 축은 쿼리가 어떻게 들어오는가이고, Spectrum은 그 축이 아니라 조회 범위다.
    expect(bodyOf('redshift-opensearch-quicksight.athena-vs-redshift-workload')).toContain(
      '쿼리가 어떻게 들어오는가',
    )
    expect(bodyOf('redshift-opensearch-quicksight.redshift-spectrum')).toContain(
      '조회 대상을 S3까지 넓히는 것',
    )
    expect(bodyOf('redshift-opensearch-quicksight.redshift-hot-cold-split')).toContain(
      'Spectrum으로 필요할 때만 읽으면',
    )
    // 두 주제는 배열에서 이웃해 있어 Athena 소개와 이 갈림길이 이어 읽힌다.
    const indexOf = (topicId: string) => topics.findIndex(({ id }) => id === topicId)
    expect(indexOf('redshift-opensearch-quicksight') - indexOf('emr-glue-athena')).toBe(2)
  })

  it('EMR과 Glue의 갈림길이 두 서비스와 한 주제 안에 있다', () => {
    // 변환 작업을 클러스터에서 돌리느냐 관리형 ETL에 맡기느냐. 둘을 가르면 운영 부담이라는
    // 축을 배울 자리가 없어진다(topic-plan "담는 서비스", PRD "사용자").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const fork = ownerOf('emr-glue-athena.glue-etl-with-per-customer-kms-key')
    expect(fork).toBe('emr-glue-athena')
    expect(ownerOf('emr-glue-athena.emr')).toBe(fork)
    expect(ownerOf('emr-glue-athena.glue')).toBe(fork)
    expect(bodyOf('emr-glue-athena.glue-etl-with-per-customer-kms-key')).toContain(
      '클러스터를 띄우고 유지하는 일이 없고',
    )
    expect(bodyOf('emr-glue-athena.glue-etl-with-per-customer-kms-key')).toContain(
      '고객 수만큼 운영하는 부담이 그대로 남는다',
    )
  })

  it('Route 53 주제가 라우팅 정책·Resolver·호스팅 영역·쿼리 로깅 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'route53')

    // ADR-033 하위 기능 블록 순서 — 서비스가 하나라 하위 기능이 블록이다. 블록마다 기본 → 갈림길 → 세부.
    // 블록: Route 53(1) → 라우팅 정책(5) → Resolver(2) → 호스팅 영역과 레코드(4) → 쿼리 로깅(1).
    // 프라이빗 호스팅 영역이 Resolver 아웃바운드 엔드포인트를 언급하므로 Resolver를 호스팅 영역 앞에 둔다(규칙 5).
    // 호스팅 영역과 레코드 블록은 호스팅 영역 셋을 붙이고 별칭 레코드를 뒤에 둔다. 연결 대상 개념을 호스팅 영역 개념
    //   아래로 들여쓰려고 사이에 있던 별칭 레코드를 옮겼다(ADR-041 「남은 자리」 3, phase 54).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'route53.route53',
      'route53.routing-policies',
      'route53.route53-failover-routing',
      'route53.multi-region-failover-for-region-outage',
      'route53.latency-record-for-non-aws-endpoint',
      'route53.multivalue-answer-details',
      'route53.resolver',
      'route53.route53-resolver-forward-rule',
      'route53.private-hosted-zone',
      'route53.route53-zone-file-import',
      'route53.private-hosted-zone-vpc-only',
      'route53.route53-alias-record',
      'route53.route53-query-logging',
    ])
  })

  it('CloudWatch·X-Ray 주제가 CloudWatch·X-Ray·Performance Insights·Managed Grafana 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'cloudwatch-xray')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: CloudWatch(7) → X-Ray(1) → Performance Insights(2) → Managed Grafana(1).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'cloudwatch-xray.cloudwatch',
      'cloudwatch-xray.cloudwatch-network-monitor',
      'cloudwatch-xray.cloudwatch-container-insights',
      'cloudwatch-xray.log-analysis-options',
      'cloudwatch-xray.cloudwatch-agent-memory-metric',
      'cloudwatch-xray.ec2-detailed-monitoring',
      'cloudwatch-xray.cloudwatch-alarm-state-change-event',
      'cloudwatch-xray.x-ray',
      'cloudwatch-xray.performance-insight',
      'cloudwatch-xray.performance-insights-rightsizing',
      'cloudwatch-xray.amazon-managed-grafana',
    ])
  })

  it('Route 53 라우팅 정책들이 한 주제 안에 함께 있다', () => {
    // 가중치·지연 시간·장애 조치·지리 위치·다중값 응답은 "언제 무엇을 고르는가"가
    // 학습 내용이므로 흩어 두면 비교할 자리가 없어진다
    // (topic-plan "헷갈리는 짝 배치", PRD "사용자").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const dns = ownerOf('route53.routing-policies')
    expect(dns).toBe('route53')
    ;[
      'route53.route53-failover-routing',
      'route53.latency-record-for-non-aws-endpoint',
      'route53.multivalue-answer-details',
      'route53.multi-region-failover-for-region-outage',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(dns))
    // 정책 목록에는 없던 장애 조치가 따로 서고, 상태 검사를 어느 레코드에 거는지가 그 축이다.
    expect(bodyOf('route53.routing-policies')).toContain('가중치 기반 라우팅')
    expect(bodyOf('route53.route53-failover-routing')).toContain(
      '**상태 검사는 주 레코드에 연결한다.**',
    )
    // 리전 장애는 가용 영역으로 막지 못하고, 단순 라우팅으로는 자동 전환이 되지 않는다.
    expect(bodyOf('route53.multi-region-failover-for-region-outage')).toContain(
      '데이터 센터 하나가 멈추는 것까지다',
    )
    expect(bodyOf('route53.multi-region-failover-for-region-outage')).toContain(
      '단순 라우팅 레코드를 쓰면',
    )
    // 지연 시간 정책은 리전이 없는 엔드포인트까지 넓혀 읽는다.
    expect(bodyOf('route53.latency-record-for-non-aws-endpoint')).toContain(
      '가장 가까운 리전을 골라 레코드에 연결한다',
    )
  })

  it('CloudWatch의 지표와 로그와 경보가 한 주제 안에서 한 벌로 읽힌다', () => {
    // 지표 ↔ 로그 ↔ 경보는 CloudWatch를 이루는 세 축이다. 하나만 떼어 두면 무엇으로
    // 무엇을 보는지가 서지 않는다(topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const monitoring = ownerOf('cloudwatch-xray.cloudwatch')
    expect(monitoring).toBe('cloudwatch-xray')
    ;[
      // 지표
      'cloudwatch-xray.cloudwatch-agent-memory-metric',
      'cloudwatch-xray.ec2-detailed-monitoring',
      // 로그
      'cloudwatch-xray.log-analysis-options',
      // 경보
      'cloudwatch-xray.cloudwatch-alarm-state-change-event',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(monitoring))
    // 지표 쪽 두 축 — 기본으로 올라오지 않는 값과, 올라오는 간격.
    expect(bodyOf('cloudwatch-xray.cloudwatch-agent-memory-metric')).toContain(
      'CloudWatch 에이전트를 설치하면',
    )
    expect(bodyOf('cloudwatch-xray.ec2-detailed-monitoring')).toContain('5분 간격으로 올라온다')
    expect(bodyOf('cloudwatch-xray.ec2-detailed-monitoring')).toContain('1분 간격이 되고')
    // 로그는 어디서 분석하는가로 갈리고, 경보는 상태 변경이 이벤트로 나가 자동 대응이 붙는다.
    expect(bodyOf('cloudwatch-xray.log-analysis-options')).toContain('CloudWatch Logs Insights는')
    expect(bodyOf('cloudwatch-xray.cloudwatch-alarm-state-change-event')).toContain(
      'EventBridge 규칙이 알람의 상태 변경 이벤트를 잡고',
    )
  })

  it('IAM 권한 주제가 사용자와 그룹·역할·정책·분석 도구·루트 사용자 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'iam-permissions')

    // ADR-033 하위 기능 블록 순서 — 서비스가 하나라 하위 기능이 블록이다. 블록마다 기본 → 갈림길 → 세부.
    // 블록: IAM(1) → 사용자와 그룹(4) → 역할(4) → 정책 — 권한을 좁히는 장치와 평가 규칙(7) → 분석 도구(3) → 루트 사용자(3).
    // 사용자와 그룹·역할의 기본 개념은 phase 54가 더했다 — 세부 셋씩을 그 아래로 들여쓰려고(ADR-041 개정). iam 개념의
    //   사용자·역할 문단은 주제의 첫 소개로 그대로 둔다.
    // 분석 도구 블록은 IAM Access Analyzer와 위임 관리자를 붙이고 Network Access Analyzer를 뒤에 둔다. 위임 관리자를
    //   Access Analyzer 아래로 들여쓰려고 옮겼다(ADR-041 「남은 자리」 5, phase 54).
    // 정책과 루트 사용자의 기본 개념은 phase 55가 더했다(ADR-043).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'iam-permissions.iam',
      'iam-permissions.iam-user',
      'iam-permissions.iam-group-policy-attachment',
      'iam-permissions.iam-group-users-only',
      'iam-permissions.iam-user-is-account-scoped',
      'iam-permissions.iam-role',
      'iam-permissions.instance-profile',
      'iam-permissions.iam-roles-anywhere',
      'iam-permissions.cross-account-iam-role',
      'iam-permissions.iam-policy',
      'iam-permissions.least-privilege',
      'iam-permissions.abac',
      'iam-permissions.permissions-boundary',
      'iam-permissions.iam-explicit-deny-precedence',
      'iam-permissions.iam-notaction-deny',
      'iam-permissions.iam-requested-region-condition',
      'iam-permissions.iam-access-analyzer',
      'iam-permissions.access-analyzer-delegated-administrator',
      'iam-permissions.network-access-analyzer',
      'iam-permissions.root-user',
      'iam-permissions.root-user-multiple-mfa',
      'iam-permissions.root-user-cannot-be-disabled',
    ])
  })

  it('자격 증명 페더레이션 주제가 Identity Center·STS·Directory Service·페더레이션·Cognito 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'identity-federation')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: IAM Identity Center(3) → STS(3) → Directory Service(1) → 페더레이션 — ID 브로커와 SAML 2.0(2) →
    //   Cognito(3).
    // 페더레이션 블록은 사내 디렉터리를 STS와 SAML로 잇는 두 방식이라 STS·Directory Service 뒤.
    // 앱 사용자를 다루는 Cognito는 사내 사용자 쪽 블록을 다 본 뒤에 둔다.
    // phase 65가 STS로 임시 자격 증명을 받는 실제 절차(IAM Roles Anywhere 19단계)를 그 바로 뒤에 더했다(ADR-050).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'identity-federation.identity-center',
      'identity-federation.identity-center-external-idp',
      'identity-federation.identity-center-permission-set',
      'identity-federation.sts',
      'identity-federation.sts-assume-role',
      'identity-federation.iam-roles-anywhere',
      'identity-federation.aws-directory-service',
      'identity-federation.custom-identity-broker-for-non-saml',
      'identity-federation.saml-federation-role-to-ad-group-mapping',
      'identity-federation.cognito',
      'identity-federation.cognito-pools',
      'identity-federation.cognito-social-idp-federation',
    ])
  })

  it('조직·감사 주제가 Organizations·Config·CloudTrail·Audit Manager 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'organizations-cloudtrail-config')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: Organizations와 SCP(6) → AWS Config(5) → CloudTrail(4) → Audit Manager(1).
    // Organizations 블록: 태그 정책·통합 청구 다음에 조직 단위를 두어 SCP를 붙이는 자리·예외(세부)와
    // 붙인다(주요 기능을 가운데 층의 끝에). CloudTrail 로그 파일 유효성 검사가 Config 규칙을 쓰므로
    // Config를 CloudTrail 앞에 둔다. Audit Manager는 구성 변경 추적 도구가 아니라는 대비로 Config 뒤.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'organizations-cloudtrail-config.organizations-scp',
      'organizations-cloudtrail-config.organizations-tag-policy',
      'organizations-cloudtrail-config.organizations-consolidated-billing',
      'organizations-cloudtrail-config.organizational-unit',
      'organizations-cloudtrail-config.scp-attachment-targets',
      'organizations-cloudtrail-config.scp-condition-exception',
      'organizations-cloudtrail-config.aws-config',
      'organizations-cloudtrail-config.config-configuration-recorder',
      'organizations-cloudtrail-config.config-conformance-pack',
      'organizations-cloudtrail-config.config-custom-rule',
      'organizations-cloudtrail-config.config-rule-remediation',
      'organizations-cloudtrail-config.cloudtrail',
      'organizations-cloudtrail-config.cloudtrail-lake',
      'organizations-cloudtrail-config.cloudtrail-data-events',
      'organizations-cloudtrail-config.cloudtrail-log-file-validation',
      'organizations-cloudtrail-config.audit-manager',
    ])
  })

  it('IAM 역할·사용자·정책·권한 경계가 한 주제 안에 함께 있다', () => {
    // 무엇을 어디에 붙이는가가 이 주제의 학습 내용이다. 권한 경계를 SCP 쪽으로 떼면
    // 계정 전체의 금지와 개별 주체의 상한선을 비교할 자리가 없어진다
    // (step17 "헷갈리는 짝", PRD "사용자").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const iam = ownerOf('iam-permissions.iam')
    expect(iam).toBe('iam-permissions')
    ;[
      'iam-permissions.instance-profile',
      'iam-permissions.iam-group-policy-attachment',
      'iam-permissions.iam-group-users-only',
      'iam-permissions.permissions-boundary',
      'iam-permissions.abac',
      'iam-permissions.cross-account-iam-role',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(iam))
    // 권한 경계는 계정 전체를 막는 SCP와 재는 것이 다르다.
    expect(bodyOf('iam-permissions.permissions-boundary')).toContain(
      '**개별 주체가 가질 수 있는 권한의 최대치**',
    )
    // 정책은 사용자가 아니라 그룹에 붙고, 태그로 가르려면 정책이 태그를 조건으로 읽어야 한다.
    expect(bodyOf('iam-permissions.iam-group-policy-attachment')).toContain(
      '권한의 기준이 그룹 하나에 모인다',
    )
    expect(bodyOf('iam-permissions.abac')).toContain('조건 키로 비교해 접근을 허용하므로')
    // 계정을 넘는 접근은 그룹이 아니라 역할과 신뢰 정책으로 연다.
    expect(bodyOf('iam-permissions.iam-user-is-account-scoped')).toContain(
      'IAM 사용자는 계정 사이에 공유되지 않는다',
    )
    expect(bodyOf('iam-permissions.cross-account-iam-role')).toContain(
      '신뢰 정책에 접근을 허용할 주체를 적는다',
    )
    // 이름이 닮은 두 분석 도구는 분석 대상으로 갈린다.
    expect(ownerOf('iam-permissions.network-access-analyzer')).toBe(iam)
    expect(bodyOf('iam-permissions.network-access-analyzer')).toContain(
      '분석 대상이 네트워크인지 권한인지로 갈린다',
    )
  })

  it('Identity Center와 SAML 페더레이션과 Cognito가 한 주제 안에서 갈린다', () => {
    // 누구를 어떻게 들이는가의 갈림길이다. 직원인가 앱 사용자인가, 디렉터리가 SAML을
    // 지원하는가로 답이 바뀐다(topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const federation = ownerOf('identity-federation.identity-center')
    expect(federation).toBe('identity-federation')
    ;[
      'identity-federation.cognito',
      'identity-federation.aws-directory-service',
      'identity-federation.identity-center-external-idp',
      'identity-federation.cognito-social-idp-federation',
      'identity-federation.custom-identity-broker-for-non-saml',
      'identity-federation.saml-federation-role-to-ad-group-mapping',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(federation))
    // 축 하나 — 대상이 AWS 계정에 들어오는 직원인가 애플리케이션의 최종 사용자인가.
    expect(bodyOf('identity-federation.identity-center-external-idp')).toContain(
      '직원은 쓰던 자격 증명으로 로그인하고',
    )
    expect(bodyOf('identity-federation.cognito-social-idp-federation')).toContain(
      '**애플리케이션의 최종 사용자**',
    )
    // 축 둘 — 사내 디렉터리가 SAML을 지원하는가.
    expect(bodyOf('identity-federation.saml-federation-role-to-ad-group-mapping')).toContain(
      '역할을 AD 그룹에 매핑하므로',
    )
    expect(bodyOf('identity-federation.custom-identity-broker-for-non-saml')).toContain(
      'SAML을 지원하지 않으면 표준 페더레이션 방식으로는 이을 수 없다',
    )
    expect(bodyOf('identity-federation.aws-directory-service')).toContain(
      '디렉터리 정보를 AWS에 저장하지 않고',
    )
  })

  it('감사 쪽으로 갈린 주제가 IAM 두 주제 바로 뒤에 붙는다', () => {
    // CloudTrail·Config는 감사 쪽이라 쪼갤 수 있지만, 쪼갠다면 배열에서 인접해야 한다
    // (step17 "헷갈리는 짝"). identity-access가 있던 자리에 셋이 연속으로 놓인다.
    const ids = topics.map(({ id }) => id)
    const first = ids.indexOf('iam-permissions')

    expect(first).toBeGreaterThan(-1)
    expect(ids.slice(first, first + 3)).toEqual([
      'iam-permissions',
      'identity-federation',
      'organizations-cloudtrail-config',
    ])
  })

  it('SCP와 태그 정책과 Config가 한 주제 안에서 예방과 탐지로 갈린다', () => {
    // 조직 수준 정책 둘은 하는 일이 다르고, Config는 만들어진 뒤에 찾아내는 쪽이다.
    // 셋이 흩어지면 "막는 것"과 "찾는 것"을 비교할 자리가 없어진다.
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const governance = ownerOf('organizations-cloudtrail-config.organizations-scp')
    expect(governance).toBe('organizations-cloudtrail-config')
    ;[
      'organizations-cloudtrail-config.organizational-unit',
      'organizations-cloudtrail-config.scp-attachment-targets',
      'organizations-cloudtrail-config.scp-condition-exception',
      'organizations-cloudtrail-config.organizations-tag-policy',
      'organizations-cloudtrail-config.aws-config',
      'organizations-cloudtrail-config.cloudtrail-data-events',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(governance))
    // SCP는 붙인 자리 아래에만 걸리고, 예외는 Principal이 아니라 Condition으로 둔다.
    expect(bodyOf('organizations-cloudtrail-config.scp-attachment-targets')).toContain(
      '연결한 자리 아래에만 적용된다',
    )
    expect(bodyOf('organizations-cloudtrail-config.scp-condition-exception')).toContain(
      '`aws:PrincipalArn`으로 허용할 주체를 지목한다',
    )
    // 태그 정책은 표기를 맞추고, 행동을 막는 것은 SCP다.
    expect(bodyOf('organizations-cloudtrail-config.organizations-tag-policy')).toContain(
      '**표기를 통일하는 일**이 태그 정책의 몫이다',
    )
    expect(bodyOf('organizations-cloudtrail-config.organizations-tag-policy')).toContain(
      '만들어지는 것을 막는 쪽이 아니다',
    )
    // CloudTrail은 호출을 남기고 그 안이 두 갈래로 갈린다.
    expect(bodyOf('organizations-cloudtrail-config.cloudtrail-data-events')).toContain(
      '이것을 따로 켜야 객체 수준 활동이 기록에 남는다',
    )
  })

  it('비밀·키 주제가 Secrets Manager·Parameter Store·KMS·CloudHSM·ACM 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'secrets-encryption')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // Secrets Manager: 기본 → BatchGetSecretValue. Parameter Store: 기본.
    // 두 저장소의 갈림길: Secrets Manager와 Parameter Store의 차이, 자동 순환을 가리키는 신호. 두
    //   서비스를 가르므로 두 블록 뒤에 둔다.
    // KMS: 기본 → 키 관리 주체·다중 리전 키·고객별 키·가져온 키 자료 → 자동 교체·대칭과 비대칭의
    //   교체 → 가져온 키 자료의 교체 → Lambda 환경 변수 암호화. 가져온 키 자료의 교체는 자동 교체를
    //   전제로 쓰므로 그 뒤에 두고, 가져온 키 자료는 자기 세부와 가깝게 갈림길의 끝에 둔다.
    // CloudHSM: 기본 → CloudHSM이 뒷받침하는 KMS 키(KMS를 먼저 읽어야 하므로 KMS 블록 뒤).
    // ACM: 기본 → DNS 검증 → CloudFront용 인증서의 리전 → 만료 임박 이벤트.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'secrets-encryption.secrets-manager',
      'secrets-encryption.secrets-manager-batch-get-secret-value',
      'secrets-encryption.parameter-store',
      'secrets-encryption.secrets-manager-vs-parameter-store',
      'secrets-encryption.rotation-heuristic',
      'secrets-encryption.kms',
      'secrets-encryption.kms-key-types-by-management',
      'secrets-encryption.kms-multi-region-key',
      'secrets-encryption.kms-key-per-tenant',
      'secrets-encryption.kms-imported-key-material',
      'secrets-encryption.kms-automatic-key-rotation',
      'secrets-encryption.kms-symmetric-vs-asymmetric-rotation',
      'secrets-encryption.imported-key-material-rotation',
      'secrets-encryption.lambda-env-var-kms',
      'secrets-encryption.cloudhsm',
      'secrets-encryption.kms-cloudhsm-key-store',
      'secrets-encryption.acm',
      'secrets-encryption.acm-dns-validation',
      'secrets-encryption.acm-cloudfront-region',
      'secrets-encryption.acm-expiration-event',
    ])
  })

  it('WAF·Shield 주제가 CloudFront 재소개 다음 WAF·Shield·Firewall Manager 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'waf-shield')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: CloudFront 재소개(1) → WAF(9) → Shield(4) → Firewall Manager(1).
    // CloudFront 재소개는 WAF를 붙이는 자리(waf-attach-targets)가 멀티 오리진 CloudFront를 전제로 쓰므로 그보다 앞에 둔다(규칙 5).
    // WAF 블록 안에 두면 waf와 그 세부 여덟 사이가 끊겨 들여쓰기로 묶을 수 없으므로 주제 맨 앞에 둔다(ADR-041 「남은 자리」 1).
    // Firewall Manager는 WAF 규칙을 중앙에서 배포하므로 두 블록 뒤.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'waf-shield.cloudfront',
      'waf-shield.waf',
      'waf-shield.waf-attach-targets',
      'waf-shield.waf-rule-types',
      'waf-shield.waf-managed-rule-groups',
      'waf-shield.waf-rate-based-rule',
      'waf-shield.waf-bot-control',
      'waf-shield.waf-body-inspection-size-limit',
      'waf-shield.waf-web-acl-region-must-match-rest-api',
      'waf-shield.waf-logging-to-firehose',
      'waf-shield.shield',
      'waf-shield.shield-standard-network-layer',
      'waf-shield.shield-advanced-drt',
      'waf-shield.shield-advanced-protection-group',
      'waf-shield.firewall-manager',
    ])
  })

  it('탐지 주제가 GuardDuty·Macie·Inspector·Security Hub 블록 다음에 넷의 비교를 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'guardduty-macie-inspector')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: GuardDuty(3) → Macie(4) → Inspector(2) → Security Hub(1) → 비교 — 헷갈리는 보안 서비스 넷(1).
    // 헷갈리는 보안 서비스 넷은 네 블록을 가르는 비교라 네 블록 뒤(규칙 4).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'guardduty-macie-inspector.guardduty',
      'guardduty-macie-inspector.guardduty-db-login',
      'guardduty-macie-inspector.guardduty-finding-to-eventbridge',
      'guardduty-macie-inspector.macie',
      'guardduty-macie-inspector.macie-automated-discovery',
      'guardduty-macie-inspector.macie-delegated-administrator',
      'guardduty-macie-inspector.macie-finding-to-eventbridge',
      'guardduty-macie-inspector.amazon-inspector',
      'guardduty-macie-inspector.inspector-scans-ecr-images',
      'guardduty-macie-inspector.security-hub',
      'guardduty-macie-inspector.security-service-lineup',
    ])
  })

  it('KMS와 Secrets Manager와 Parameter Store가 한 주제 안에서 갈린다', () => {
    // 무엇을 어디에 두는가가 이 주제의 학습 내용이다. 셋을 가르면 키와 비밀값과
    // 설정값의 자리를 비교할 데가 없어진다(step18 "헷갈리는 짝", PRD "사용자").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const secrets = ownerOf('secrets-encryption.secrets-manager')
    expect(secrets).toBe('secrets-encryption')
    ;[
      'secrets-encryption.parameter-store',
      'secrets-encryption.kms',
      'secrets-encryption.cloudhsm',
      'secrets-encryption.secrets-manager-vs-parameter-store',
      'secrets-encryption.rotation-heuristic',
      'secrets-encryption.kms-key-types-by-management',
      'secrets-encryption.kms-cloudhsm-key-store',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(secrets))
    // 축 하나 — 자동 순환이 되는 쪽과 되지 않는 쪽.
    expect(bodyOf('secrets-encryption.secrets-manager-vs-parameter-store')).toContain(
      '자동 교체하는 순환 기능을 제공하지만 Parameter Store에는 이 기능이 없다',
    )
    // 축 둘 — KMS가 관리하는 것은 키이지 비밀값이 아니다.
    expect(bodyOf('secrets-encryption.kms')).toContain(
      '애플리케이션 설정값이나 비밀값을 저장하는 서비스는 아니다',
    )
    // 축 셋 — 그 키를 누가 관리하고 어디에 두는가.
    expect(bodyOf('secrets-encryption.kms-key-types-by-management')).toContain(
      '고객 관리 키는 내가 만들어 키 정책과 수명 주기를 직접 정하고',
    )
    expect(bodyOf('secrets-encryption.kms-cloudhsm-key-store')).toContain(
      '**CloudHSM이 뒷받침하는 KMS 키**',
    )
  })

  it('WAF와 Shield와 Shield Advanced가 한 주제 안에서 계층과 대상으로 갈린다', () => {
    // 계층과 대상이 갈리는 한 벌이다. Shield 쪽을 떼면 L7과 네트워크 계층의 경계를
    // 비교할 자리가 없어진다(topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const waf = ownerOf('waf-shield.waf')
    expect(waf).toBe('waf-shield')
    ;[
      'waf-shield.shield',
      'waf-shield.shield-standard-network-layer',
      'waf-shield.shield-advanced-drt',
      'waf-shield.shield-advanced-protection-group',
      'waf-shield.waf-rule-types',
      'waf-shield.waf-managed-rule-groups',
      'waf-shield.waf-rate-based-rule',
      'waf-shield.firewall-manager',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(waf))
    // 축 하나 — 어느 계층을 보는가.
    expect(bodyOf('waf-shield.waf')).toContain('**L7 애플리케이션 계층**')
    expect(bodyOf('waf-shield.shield-standard-network-layer')).toContain(
      '애플리케이션 계층의 요청을 검사해 막는 것은 WAF의 몫이고',
    )
    // 축 둘 — Shield와 Shield Advanced는 전담 대응 팀 지원으로 갈린다.
    expect(bodyOf('waf-shield.shield-advanced-drt')).toContain(
      'WAF는 애플리케이션 계층 공격 방어에는 유효하지만 DRT 지원은 제공하지 않는다',
    )
    // 축 셋 — 규칙이 요청의 내용을 보는가 빈도를 보는가.
    expect(bodyOf('waf-shield.waf-rate-based-rule')).toContain('**한 IP에서 오는 빈도**')
    // 계정이 여러 개면 규칙을 거는 자리가 달라진다.
    expect(bodyOf('waf-shield.firewall-manager')).toContain(
      '여러 계정의 WAF 규칙을 중앙에서 정의하고 배포해',
    )
  })

  it('탐지 서비스 넷이 한 주제 안에서 무엇을 찾는지로 갈린다', () => {
    // GuardDuty ↔ Macie ↔ Inspector ↔ Security Hub의 갈림길이다. 넷을 가르면
    // 무엇을 찾는 서비스인지 비교할 자리가 없어진다(topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const detection = ownerOf('guardduty-macie-inspector.guardduty')
    expect(detection).toBe('guardduty-macie-inspector')
    ;[
      'guardduty-macie-inspector.macie',
      'guardduty-macie-inspector.amazon-inspector',
      'guardduty-macie-inspector.security-hub',
      'guardduty-macie-inspector.security-service-lineup',
      'guardduty-macie-inspector.inspector-scans-ecr-images',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(detection))
    // 넷이 각각 무엇을 보는가 — 계정을 겨냥한 활동, 저장된 데이터의 내용, 취약점,
    // 그리고 그 결과가 모이는 자리.
    expect(bodyOf('guardduty-macie-inspector.guardduty')).toContain(
      '탐지 결과를 제공할 뿐 공격에 직접 대응하지는 않는다',
    )
    expect(bodyOf('guardduty-macie-inspector.macie')).toContain(
      'S3에 보관된 데이터에서 개인정보처럼 보호해야 할 내용을 찾아낸다',
    )
    expect(bodyOf('guardduty-macie-inspector.amazon-inspector')).toContain(
      '**패치를 적용하는 서비스가 아니라는 점이 다른 선택지와의 갈림길이 된다.**',
    )
    expect(bodyOf('guardduty-macie-inspector.security-hub')).toContain(
      '**탐지 결과가 모이는 자리**',
    )
    // 조사·분석을 맡는 Detective도 같은 보기 줄에 오르므로 한 주제 안에서 갈린다.
    expect(bodyOf('guardduty-macie-inspector.security-service-lineup')).toContain(
      '**Amazon Detective**',
    )
    // 취약점 스캔의 대상에 컨테이너 이미지가 들어간다.
    expect(bodyOf('guardduty-macie-inspector.inspector-scans-ecr-images')).toContain(
      'ECR의 컨테이너 이미지가 들어간다',
    )
    // 탐지하는 서비스는 결과를 이벤트로 내보내고 대응은 받는 쪽이 맡는다.
    ;[
      'guardduty-macie-inspector.guardduty-finding-to-eventbridge',
      'guardduty-macie-inspector.macie-finding-to-eventbridge',
    ].forEach((conceptId) => {
      expect(ownerOf(conceptId)).toBe(detection)
      expect(bodyOf(conceptId)).toContain('EventBridge')
    })
  })

  it('비용 관리 주제가 약정·비용 조회·예산·이상 탐지·보고서·권장 도구 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'cost-management')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: 약정 할인(5) → Cost Explorer·결제 콘솔·비용 할당 태그(4) → AWS Budgets(3) → Cost Anomaly Detection(1) → 비용
    //   및 사용량 보고서(1) → 권장 도구 — Trusted Advisor·Compute Optimizer(3).
    // Cost Anomaly Detection은 '예산 초과가 아닌'으로 정의되므로 Budgets 뒤. 비용 및 사용량 보고서는
    // Cost Explorer·Budgets와 대비하므로 둘 뒤.
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'cost-management.savings-plan',
      'cost-management.compute-vs-ec2-instance-savings-plans',
      'cost-management.savings-plan-details',
      'cost-management.savings-plan-baseline-vs-spike',
      'cost-management.rds-reserved-instance',
      'cost-management.on-demand-capacity-reservation',
      'cost-management.cost-explorer',
      'cost-management.billing-and-cost-management',
      'cost-management.cost-allocation-tag-activation',
      'cost-management.cost-allocation-tag-activation-in-management-account',
      'cost-management.aws-budgets',
      'cost-management.budget-actions',
      'cost-management.budget-forecasted-alert',
      'cost-management.cost-anomaly-detection',
      'cost-management.cost-and-usage-report',
      'cost-management.trusted-advisor',
      'cost-management.compute-optimizer',
      'cost-management.compute-optimizer-ebs-recommendations',
    ])
  })

  it('거버넌스·IaC 주제가 CloudFormation·Service Catalog·Control Tower·RAM·Workload Discovery 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'governance-iac')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: CloudFormation(2) → Service Catalog(1) → Control Tower(2) → RAM(1) → Workload Discovery(1).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'governance-iac.cloudformation',
      'governance-iac.cloudformation-drift-detection',
      'governance-iac.service-catalog',
      'governance-iac.control-tower-landing-zone',
      'governance-iac.control-tower-controls',
      'governance-iac.resource-access-manager',
      'governance-iac.workload-discovery',
    ])
  })

  it('Systems Manager 주제가 Systems Manager·EC2 Instance Connect·AppConfig 블록 순서로 개념을 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'systems-manager')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: Systems Manager(6) → EC2 Instance Connect 엔드포인트(1) → AppConfig(1).
    // Systems Manager 블록의 기본 개념은 phase 55가 더했다 — 기능 다섯을 그 아래로 들여쓰려고(ADR-043).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'systems-manager.systems-manager',
      'systems-manager.ssm-run-command',
      'systems-manager.ssm-session-manager',
      'systems-manager.ssm-patch-manager',
      'systems-manager.ssm-managed-instance-core-policy',
      'systems-manager.ssm-inventory',
      'systems-manager.ec2-instance-connect-endpoint',
      'systems-manager.appconfig',
    ])
  })

  it('AI·ML 주제가 SageMaker·API로 부르는 AI 서비스 블록 다음에 훈련 없이 쓰는 검토를 둔다', () => {
    const topic = topics.find((candidate) => candidate.id === 'ai-ml-services')

    // ADR-033 서비스 블록 순서 — 블록마다 기본 → 주요 기능·갈림길 → 세부 기능·설정·한계.
    // 블록: SageMaker AI(2) → 음성·이미지·번역·문서 AI 서비스(1) → Comprehend(1) → Lex(1) → 비교 — 훈련 없이 쓰는 콘텐츠 검토(1).
    // Rekognition의 콘텐츠 검토는 SageMaker·Comprehend와 대비하므로 맨 뒤(규칙 4).
    expect(topic?.concepts.map((concept) => concept.id)).toEqual([
      'ai-ml-services.sagemaker',
      'ai-ml-services.sagemaker-autopilot',
      'ai-ml-services.media-ai-service-lineup',
      'ai-ml-services.comprehend',
      'ai-ml-services.amazon-lex',
      'ai-ml-services.rekognition-content-moderation',
    ])
  })

  it('입력을 나눠 맡는 AI 서비스들이 한 주제 안에서 무엇을 다루는지로 갈린다', () => {
    // 음성·이미지·번역·문서·텍스트·대화를 나눠 맡는 서비스들은 "무엇을 하는
    // 서비스인가"가 그대로 문항이다. 떼어 놓으면 비교할 자리가 없어진다
    // (step20 "헷갈리는 짝", PRD "사용자").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join('\n') ?? ''

    const lineup = 'ai-ml-services.media-ai-service-lineup'

    expect(ownerOf('ai-ml-services.sagemaker')).toBe('ai-ml-services')
    expect(ownerOf(lineup)).toBe('ai-ml-services')
    expect(ownerOf('ai-ml-services.comprehend')).toBe('ai-ml-services')
    expect(ownerOf('ai-ml-services.amazon-lex')).toBe('ai-ml-services')

    // 넷이 어느 입력을 다루는지가 한 개념 안에서 갈린다.
    const lineupBody = bodyOf(lineup)
    expect(lineupBody).toContain('Transcribe는 음성을 글로 옮긴다')
    expect(lineupBody).toContain('Rekognition은 이미지와 영상을 분석하는 서비스라')
    expect(lineupBody).toContain('Translate는 언어를 다른 언어로 옮기는 서비스이며')
    expect(lineupBody).toContain('Textract는 문서 이미지에서 글자와 표를 뽑아내는 서비스다')

    // 글의 의미를 다루는 자리와 대화를 주고받는 자리가 그 넷과 갈린다.
    expect(bodyOf('ai-ml-services.comprehend')).toContain('글의 의미를 다루는 자리')
    expect(bodyOf('ai-ml-services.amazon-lex')).toContain('대화형 인터페이스')

    // 모델을 직접 만드는 자리와 이미 만들어진 기능을 부르는 자리가 갈린다.
    expect(lineupBody).toContain('이미 만들어진 기능을 API로 부르는 서비스들이다')
    expect(bodyOf('ai-ml-services.sagemaker-autopilot')).toContain('훈련이 필요한가')
    expect(bodyOf('ai-ml-services.rekognition-content-moderation')).toContain(
      '모델 훈련을 포함하지 않아야 한다는 조건',
    )
  })

  it('Cost Explorer와 Budgets와 Cost Anomaly Detection이 한 주제 안에서 갈린다', () => {
    // 셋 다 비용을 다루지만 재는 것이 다르다. 가르면 "지난 비용을 보는가, 임계값을
    // 감시하는가, 평소와 다른 지출을 알아채는가"를 비교할 자리가 없어진다
    // (step19 "헷갈리는 짝", PRD "사용자").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const cost = ownerOf('cost-management.cost-explorer')
    expect(cost).toBe('cost-management')
    ;[
      'cost-management.aws-budgets',
      'cost-management.cost-anomaly-detection',
      'cost-management.budget-actions',
      'cost-management.budget-forecasted-alert',
      'cost-management.cost-and-usage-report',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(cost))
    // 임계값 기반 요구는 Budgets이고 이상 탐지는 목적이 다르다.
    expect(bodyOf('cost-management.cost-anomaly-detection')).toContain(
      '"예산의 60%에 도달하면 알림"처럼 임계값 기반 요구에는 AWS Budgets가 맞다',
    )
    // 알리는 데서 그치지 않고 막는 것은 예산 조치뿐이다.
    expect(bodyOf('cost-management.budget-actions')).toContain('셋 다 알려 줄 뿐 막지 않는다')
    // 알림 기준이 실제값과 예측값 둘이다.
    expect(bodyOf('cost-management.budget-forecasted-alert')).toContain(
      '이번 기간의 예상 지출이 임계값을 넘을 것으로 계산되는 시점',
    )
    // 콘솔 화면으로 안 되는 집계는 원본 청구 데이터를 내보내는 쪽이 받는다.
    expect(bodyOf('cost-management.cost-and-usage-report')).toContain(
      '상세한 항목별 청구 데이터를 S3 버킷으로 내보낸다',
    )
  })

  it('CloudFormation과 Service Catalog와 Control Tower가 한 주제 안에서 갈린다', () => {
    // 거버넌스 갈림길이다. 셋을 가르면 "인프라를 만드는가, 승인된 제품을 고르게
    // 하는가, 계정 환경을 세우는가"를 비교할 자리가 없어진다
    // (topic-plan "헷갈리는 짝 배치").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const governance = ownerOf('governance-iac.cloudformation')
    expect(governance).toBe('governance-iac')
    ;[
      'governance-iac.service-catalog',
      'governance-iac.control-tower-landing-zone',
      'governance-iac.control-tower-controls',
      'governance-iac.cloudformation-drift-detection',
      'governance-iac.resource-access-manager',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(governance))
    // 셋이 각각 무엇을 맡는가.
    expect(bodyOf('governance-iac.cloudformation')).toContain(
      '인프라 구성을 파일로 적어 두고 그대로 배포하며',
    )
    expect(bodyOf('governance-iac.service-catalog')).toContain(
      '조직이 허용한 구성들을 제품으로 등록해 두고',
    )
    expect(bodyOf('governance-iac.control-tower-landing-zone')).toContain(
      '기준 환경(랜딩 존)을 자동으로 구성한다',
    )
    // 제어는 언제 작동하는지로 갈리고, 드리프트 감지는 스택 밖을 보지 못한다.
    expect(bodyOf('governance-iac.control-tower-controls')).toContain(
      '**사전 예방적 제어**(Proactive Control)는 배포 시점에 템플릿을 평가해',
    )
    expect(bodyOf('governance-iac.cloudformation-drift-detection')).toContain(
      '계정의 모든 지원 리소스를 대상으로 삼는 쪽은 AWS Config다',
    )
  })

  it('Systems Manager의 기능들이 한 주제 안에 함께 있다', () => {
    // Session Manager·Patch Manager·Run Command·Inventory는 한 서비스의 하위 기능이라
    // 흩어 놓으면 무엇이 어느 자리를 맡는지 읽히지 않는다
    // (step19 "헷갈리는 짝", topic-plan "범위를 벗어난 주제").
    const ownerOf = (conceptId: string) =>
      topics.find((topic) => topic.concepts.some(({ id }) => id === conceptId))?.id
    const bodyOf = (conceptId: string) =>
      topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)
        ?.paragraphs.join(' ') ?? ''

    const ssm = ownerOf('systems-manager.ssm-run-command')
    expect(ssm).toBe('systems-manager')
    ;[
      'systems-manager.ssm-session-manager',
      'systems-manager.ssm-patch-manager',
      'systems-manager.ssm-inventory',
      'systems-manager.ssm-managed-instance-core-policy',
      'systems-manager.ec2-instance-connect-endpoint',
      'systems-manager.appconfig',
    ].forEach((conceptId) => expect(ownerOf(conceptId)).toBe(ssm))
    // 배스천 없이 붙는 두 길은 SSH를 쓰는지로 갈린다.
    expect(bodyOf('systems-manager.ssm-session-manager')).toContain(
      'SSH 프로토콜을 쓰지 않는다',
    )
    expect(bodyOf('systems-manager.ec2-instance-connect-endpoint')).toContain(
      '**보안 그룹에서 여는 포트는 22가 아니라 443이다.**',
    )
    // 패치는 도는 자리가, 인벤토리는 모으는 것이 각각 한계다.
    expect(bodyOf('systems-manager.ssm-patch-manager')).toContain(
      '실행 중인 인스턴스를 대상으로 운영체제 패치를 배포한다',
    )
    expect(bodyOf('systems-manager.ssm-inventory')).toContain(
      '아키텍처 다이어그램이나 리소스 사이의 관계 전체를 만들어 내지 않는다',
    )
    // 그 기능들이 닿으려면 인스턴스가 관리형이어야 한다.
    expect(bodyOf('systems-manager.ssm-managed-instance-core-policy')).toContain(
      '`AmazonSSMManagedInstanceCore`는 AWS 관리형 정책이고',
    )
  })

  // 이 단언이 고정하는 것은 원본 은행 246문항 안의 스토리지 클래스 문항 9개가 클래스별
  // 개념과 일대일이라는 사실이다. phase 27 step 2가 이 주제의 빈 개념 8개를 덮으며
  // 문항을 더했으므로(ADR-026) 대상을 원본 은행으로 좁힌다 — 더한 문항은 위의 step 2
  // 블록이 따로 본다.
  it('원본 은행의 S3 스토리지 클래스 문제 9개가 클래스별 개념과 일대일로 이어진다', () => {
    const storageClassQuestions = questions
      .slice(0, 246)
      .filter((question) => question.topicId === 's3-storage-classes')

    expect(storageClassQuestions.map(({ id }) => id)).toEqual([
      'q016',
      'q017',
      'q018',
      'q019',
      'q020',
      'q021',
      'q022',
      'q023',
      'q024',
    ])
    expect(storageClassQuestions.map(({ conceptId }) => conceptId)).toEqual([
      's3-storage-classes.intelligent-tiering',
      's3-storage-classes.standard',
      's3-storage-classes.standard-ia',
      's3-storage-classes.one-zone-ia',
      's3-storage-classes.glacier-instant-retrieval',
      's3-storage-classes.glacier-flexible-retrieval',
      's3-storage-classes.glacier-deep-archive',
      's3-storage-classes.glacier-or-standard-ia',
      's3-storage-classes.retrieval-time',
    ])
    expect(new Set(storageClassQuestions.map(({ conceptId }) => conceptId)).size).toBe(9)
  })

  it('주제 id가 유일하다', () => {
    const ids = topics.map((topic) => topic.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('주제 중요도가 3, 2 또는 0이다', () => {
    topics.forEach((topic) => {
      expect([3, 2, 0]).toContain(topic.importance)
    })
  })

  it('개념 id가 전역에서 유일하다', () => {
    const ids = topics.flatMap((topic) =>
      topic.concepts.map((concept) => concept.id),
    )

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('모든 주제는 하나 이상의 개념을 가진다', () => {
    topics.forEach((topic) => {
      expect(topic.concepts.length).toBeGreaterThan(0)
    })
  })

  it('모든 개념의 이름과 요약이 빈 문자열이 아니다', () => {
    topics.forEach((topic) => {
      topic.concepts.forEach((concept) => {
        expect(concept.name.trim()).not.toBe('')
        expect(concept.summary.trim()).not.toBe('')
      })
    })
  })

  it('모든 개념은 하나 이상의 빈 문자열이 아닌 문단을 가진다', () => {
    topics.forEach((topic) => {
      topic.concepts.forEach((concept) => {
        expect(concept.paragraphs.length).toBeGreaterThan(0)
        concept.paragraphs.forEach((paragraph) => {
          expect(paragraph.trim()).not.toBe('')
        })
      })
    })
  })

  it('모든 주제의 원본 페이지 범위가 올바르다', () => {
    topics.forEach((topic) => {
      expect(topic.sourcePages).toHaveLength(2)
      expect(topic.sourcePages[0]).toBeLessThanOrEqual(topic.sourcePages[1])
    })
  })

  it('문제 id가 유일하다', () => {
    const ids = questions.map((question) => question.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('모든 문제가 실재하는 주제를 참조한다', () => {
    const topicIds = new Set(topics.map((topic) => topic.id))

    questions.forEach((question) => {
      expect(topicIds.has(question.topicId)).toBe(true)
    })
  })

  it('모든 문제가 실재하는 개념을 참조한다', () => {
    const conceptIds = new Set(
      topics.flatMap((topic) => topic.concepts.map((concept) => concept.id)),
    )

    questions.forEach((question) => {
      expect(conceptIds.has(question.conceptId)).toBe(true)
    })
  })

  // ADR-026 — 이 앱의 주 학습 경로는 문제를 풀고 틀린 것만 개념으로 되짚는 순환이라,
  // 문항이 가리키지 않는 개념은 그 경로에서 아예 배울 수 없는 사각지대다. phase 27이
  // 618개를 전부 덮었고 이 단언이 그 상태가 되돌아가는 것을 막는다 — 개념을 더하는 사람은
  // 문항도 함께 만들어야 한다.
  // 예외 목록("이 개념들은 출제하지 않는다")을 만들어 통과시키지 마라. 그 목록이 생기는
  // 순간 다음 사람이 거기에 개념을 추가해 사각지대가 되살아난다.
  it('모든 개념이 문항 하나 이상을 갖는다', () => {
    const covered = new Set(questions.map(({ conceptId }) => conceptId))
    const uncovered = topics
      .flatMap(({ concepts }) => concepts)
      .filter((concept) => !covered.has(concept.id))
      .map((concept) => concept.id)

    expect(uncovered).toEqual([])
  })

  it('모든 문제의 topicId가 conceptId가 속한 주제와 같다', () => {
    const topicOfConcept = new Map(
      topics.flatMap((topic) => topic.concepts.map((concept) => [concept.id, topic.id])),
    )

    questions.forEach((question) => {
      expect(topicOfConcept.get(question.conceptId)).toBe(question.topicId)
    })
  })

  it('문제 id가 q001부터 빈 번호 없이 이어진다', () => {
    expect(questions.map(({ id }) => id)).toEqual(
      questions.map((_, index) => `q${String(index + 1).padStart(3, '0')}`),
    )
  })

  // step 1~19가 이어 쓴 구간이다. 앞쪽 246문항은 각 step의 slice 테스트가 이미 고정한다.
  // 길이를 정확한 수가 아니라 하한으로 단언하는 이유: 이 구간은 문항을 더할 때마다 자라는데,
  // 이 테스트가 지키는 것은 분량이 아니라 분포다. 하한은 빈 slice로 조용히 통과하는 것만 막는다.
  it('phase 27이 더한 q247 이후 구간의 정답 위치가 고르게 퍼져 있다', () => {
    const addedQuestions = questions.slice(246)
    const answerCounts = [0, 1, 2, 3].map(
      (answerIndex) => addedQuestions.filter((question) => question.answerIndex === answerIndex).length,
    )

    expect(addedQuestions.length).toBeGreaterThanOrEqual(486)
    answerCounts.forEach((count) => {
      expect(count / addedQuestions.length).toBeGreaterThanOrEqual(0.2)
      expect(count / addedQuestions.length).toBeLessThanOrEqual(0.3)
    })
  })

  it('모든 문제는 서로 다른 보기 4개를 가진다', () => {
    questions.forEach((question) => {
      expect(question.choices).toHaveLength(4)
      expect(new Set(question.choices).size).toBe(4)
    })
  })

  it('모든 문제의 정답 인덱스가 0부터 3 범위다', () => {
    questions.forEach((question) => {
      expect(question.answerIndex).toBeGreaterThanOrEqual(0)
      expect(question.answerIndex).toBeLessThanOrEqual(3)
    })
  })

  it('모든 문제의 해설이 빈 문자열이 아니다', () => {
    questions.forEach((question) => {
      expect(question.explanation.trim()).not.toBe('')
    })
  })

  // ADR-027. 하한 187자는 phase 27이 ADR-026의 규칙대로 쓴 해설 486개(q247~q732)의
  // 실측 최소값이다. 임의로 고른 값이 아니다. 정답이 왜 맞는지와 오답 셋이 왜 아닌지를
  // 함께 담으면 자연히 넘게 되는 선이므로, 길이는 목표가 아니라 통과 조건이다.
  // 넘기려고 같은 말을 늘려 쓰면 단언을 통과해도 ADR-026·ADR-027을 어긴 것이고,
  // 반대로 이 값을 낮춰서 통과시키면 근거가 실측에서 임의값으로 바뀐다.
  const explanationMinLength = 187

  it('모든 문제의 해설이 그 개념을 가르칠 만큼의 길이를 갖는다', () => {
    // 구간을 나누지 않고 문제 은행 732문항 전체에 건다. phase 28이 q001~q246을 다시 써서
    // 앞 구간도 하한을 넘었으므로, 구간을 나누면 다음 사람이 "옛 구간은 예외"라고 읽는다.
    // 예외 목록을 만들어 통과시키지 마라 — 그 목록이 생기는 순간 사각지대가 되살아난다.
    const tooShort = questions
      .filter((question) => question.explanation.length < explanationMinLength)
      .map((question) => `${question.id}(${question.explanation.length}자)`)

    expect(tooShort).toEqual([])
  })

  it('정답이 Glacier 계열인 문항은 모두 법·감사 목적을 문제문에 담는다', () => {
    const glacierAnswered = questions.filter((question) =>
      question.choices[question.answerIndex].includes('Glacier'),
    )

    expect(glacierAnswered.map(({ id }) => id)).toEqual([
      'q020',
      'q021',
      'q022',
      'q023',
      'q024',
    ])
    glacierAnswered.forEach((question) => {
      expect(question.prompt).toContain('법')
      expect(question.prompt).toContain('감사')
    })
  })

  it('법·감사 키워드가 Glacier의 무조건 신호가 되지 않도록 q018이 부정형을 유지한다', () => {
    const question = questions.find(({ id }) => id === 'q018')

    expect(question?.choices[question.answerIndex]).toBe('S3 Standard-IA')
    expect(question?.prompt).toContain('아니면서')
  })

  it('q024는 Glacier 보기를 둘 이상 두어 법 키워드만으로 답이 정해지지 않는다', () => {
    const question = questions.find(({ id }) => id === 'q024')
    const glacierChoices = question?.choices.filter((choice) => choice.includes('Glacier')) ?? []

    expect(glacierChoices.length).toBeGreaterThanOrEqual(2)
    expect(question?.choices[question.answerIndex]).toBe('S3 Glacier Deep Archive')
  })

  const termGlosses: Array<{ conceptId: string; anchor: string }> = [
    { conceptId: 's3-versioning-lifecycle.object-lock-prerequisites', anchor: 'Multi-Factor Authentication' },
    { conceptId: 'efs-fsx.efs', anchor: 'Network File System' },
    { conceptId: 'data-transfer-services.transfer-family', anchor: 'File Transfer Protocol' },
    { conceptId: 'dynamodb.dynamodb', anchor: '키-값' },
    { conceptId: 'dynamodb.dynamodb', anchor: '미리 담아 두었다가' },
    { conceptId: 'aurora.aurora-reader-endpoint', anchor: '애플리케이션이 접속할 주소' },
    { conceptId: 'elastic-load-balancing.elb', anchor: '실어 나를지 정하는' },
    { conceptId: 'elastic-load-balancing.sticky-session-tradeoff', anchor: '차례대로 돌아가며' },
    { conceptId: 'cloudfront-global-accelerator.cloudfront-ttl', anchor: 'Time-to-Live' },
    { conceptId: 'api-gateway-step-functions.api-gateway', anchor: 'JSON Web Token' },
    { conceptId: 'waf-shield.shield', anchor: 'Distributed Denial of Service' },
    { conceptId: 'waf-shield.shield-advanced-drt', anchor: 'DDoS Response Team' },
    { conceptId: 'waf-shield.waf', anchor: 'Cross-Site Scripting' },
    { conceptId: 'guardduty-macie-inspector.security-service-lineup', anchor: 'Common Vulnerabilities' },
    { conceptId: 'secrets-encryption.acm', anchor: 'SSL의 후속' },
  ]

  it('풀이 없이 쓰이던 일반 IT 용어 15종이 첫 등장 개념에서 한 번씩 풀린다', () => {
    const concepts = topics.flatMap((topic) => topic.concepts)

    termGlosses.forEach(({ conceptId, anchor }) => {
      const holders = concepts.filter((concept) =>
        concept.paragraphs.some((paragraph) => paragraph.includes(anchor)),
      )

      expect(holders.map(({ id }) => id)).toEqual([conceptId])
    })
  })

  it('용어 풀이가 개념 요약이 아니라 본문에만 들어간다', () => {
    const concepts = topics.flatMap((topic) => topic.concepts)

    concepts.forEach((concept) => {
      termGlosses.forEach(({ anchor }) => {
        expect(concept.summary).not.toContain(anchor)
        expect(concept.name).not.toContain(anchor)
      })
    })
  })

  // ADR-028 — 버킷·객체·접두사는 두 원본에 정의가 없어 뜻풀이만 예외로 허용한
  // AWS 고유 기초 용어다. 자리는 aws-core-services.s3 하나다 — 첫 주제의 개념이라
  // 어느 S3 주제보다 앞에서 읽힌다.
  it('AWS 고유 기초 용어 3종의 뜻풀이가 S3 개념 본문에 들어 있다', () => {
    const concept = topics
      .flatMap((topic) => topic.concepts)
      .find(({ id }) => id === 'aws-core-services.s3')
    const body = concept?.paragraphs.join(' ') ?? ''

    // ADR-028이 목록으로 못박은 셋. 늘리려면 그 ADR을 먼저 고쳐야 한다.
    const basicTerms = ['버킷', '객체', '접두사']

    basicTerms.forEach((term) => expect(body).toContain(term))

    // 낱말이 나오는 것만으로는 부족하다 — 무엇을 가리키는지가 함께 있어야 한다.
    expect(body).toContain('파일을 담는 최상위 저장 공간을 **버킷**이라 부르고')
    expect(body).toContain('버킷에 담긴 파일 하나하나를 **객체**라 부른다')
    expect(body).toContain('객체 이름의 앞부분은 **접두사**라 하며')

    // 형태는 ADR-010과 같다 — 풀이는 summary가 아니라 paragraphs에만 들어간다.
    basicTerms.forEach((term) => {
      expect(concept?.summary).not.toContain(term)
      expect(concept?.name).not.toContain(term)
    })
  })

  // ADR-029 — 용어 풀이는 주제마다 한 번씩 되풀이한다. 판정 기준은 "저장소 안에 정의가
  // 있는가"가 아니라 "이 주제 페이지만 읽고 뜻이 서는가"다. ADR-028이 버킷·객체·접두사를
  // aws-core-services.s3에 넣은 직후에도 사용자가 이 주제에서 접두사에 다시 막혔다 —
  // 정의는 저장소에 있었지만 그 화면에는 없었다.
  //
  // 범위를 이 주제로 한정하는 이유: 나머지 38개 주제가 아직 안 고쳐졌다. 넓히는 것은
  // 다음 phase의 몫이고, 통과시키려고 예외 목록을 만들지 마라 — 목록이 생기는 순간
  // 거기에 개념이 추가되어 사각지대가 되살아난다(ADR-026의 경고와 같다).
  describe('S3 암호화 주제가 주제 안에서 읽히는 용어만 쓴다', () => {
    const body = (conceptId: string) => {
      const concept = topics
        .flatMap((topic) => topic.concepts)
        .find(({ id }) => id === conceptId)

      return concept?.paragraphs.join(' ') ?? ''
    }

    const topicText = () => {
      const topic = topics.find((candidate) => candidate.id === 's3-encryption-batch')

      return (topic?.concepts ?? [])
        .flatMap((concept) => [concept.name, concept.summary, ...concept.paragraphs])
        .join(' ')
    }

    // 덤프 해설의 "플랫 파일"을 직역한 말이라 없는 대립쌍(입체 파일)을 떠올리게 한다.
    // 출처에 낱말이 있다는 것이 그 낱말을 쓸 근거가 되지 않는다(ADR-009).
    it('인벤토리 산출물을 평면 파일이라 부르지 않는다', () => {
      expect(topicText()).not.toContain('평면 파일')
    })

    // 같은 것을 평면 파일·보고서·인벤토리 보고서 셋으로 부르던 것을 하나로 모았다.
    // q281과 s3-batch-operations-lambda-invoke가 이미 쓰던 이름을 살린 것이다.
    it('인벤토리 산출물의 이름이 인벤토리 보고서 하나로 통일돼 있다', () => {
      const text = topicText()
      const reports = text.split('보고서').length - 1
      const inventoryReports = text.split('인벤토리 보고서').length - 1

      expect(inventoryReports).toBeGreaterThan(0)
      expect(reports).toBe(inventoryReports)
    })

    // 목록 얻기를 어렵게 만드는 것은 객체 수이지 접두사 개수가 아니다([Q818 p553] 계열).
    it('인벤토리가 필요한 이유를 접두사 개수가 아니라 객체 수로 든다', () => {
      const text = body('s3-encryption-batch.s3-inventory-report')

      expect(text).toContain('객체가 수백만 개 쌓여 있으면')
      expect(text).not.toContain('접두사')
    })

    // ADR-028의 뜻풀이가 이 주제 안에도 서 있어야 한다. 자리는 접두사가 정말 필요한
    // batch-copy-vs-replication이고, 이 주제에서 처음 나오는 자리다.
    it('접두사의 뜻이 이 주제 안에서 풀린다', () => {
      expect(body('s3-encryption-batch.batch-copy-vs-replication')).toContain(
        '접두사는 객체 이름의 앞부분을 가리키며, 앞부분이 같은 객체들을 폴더처럼 한 묶음으로 묶어 다루는 단위가 된다',
      )
    })

    // 사용자가 처음 지적한 낱말이 버킷·객체·접두사 셋이었다. 접두사만 이 주제 안에 풀고
    // 둘을 aws-core-services.s3에만 두면 같은 결함이 그대로 남는다 — 이 주제로 곧바로
    // 들어온 학습자는 그 개념을 읽지 않는다. 자리는 이 주제의 첫 개념이고, 본문이 이미
    // 쓰고 있는 "파일"에 두 낱말을 이어 붙인다.
    it('버킷과 객체의 뜻이 이 주제 안에서 풀린다', () => {
      const text = body('s3-encryption-batch.sse')

      expect(text).toContain('파일을 담는 저장 공간을 **버킷**이라 부르고')
      expect(text).toContain('버킷에 담긴 파일 하나하나를 **객체**라 부른다')
    })

    // ADR-027의 "사양·수치가 아니라 성격만"을 개념 본문에 쓴 것이다. CloudTrail은
    // sse-kms-audit-trail에서 감사 추적이 되는 이유의 핵심이라 성격이 없으면 그 문단이
    // 통째로 읽히지 않는다. 근거는 organizations-cloudtrail-config.cloudtrail 본문이다.
    it('CloudTrail의 성격이 이 주제 안에서 밝혀진다', () => {
      expect(body('s3-encryption-batch.sse-kms-audit-trail')).toContain(
        'CloudTrail은 계정에서 일어난 AWS 호출을 빠짐없이 이벤트로 남기는 기록 서비스',
      )
    })

    // 형태는 ADR-010과 같다 — 풀이는 summary가 아니라 paragraphs에만 들어간다.
    it('이 주제의 풀이가 개념 요약이나 제목으로 새지 않는다', () => {
      const topic = topics.find((candidate) => candidate.id === 's3-encryption-batch')
      const glosses = [
        '접두사는 객체 이름의 앞부분을 가리키며',
        'CloudTrail은 계정에서 일어난 AWS 호출을',
        '메타데이터는 객체의 내용 자체가 아니라',
        '파일을 담는 저장 공간을 **버킷**이라 부르고',
      ]

      topic?.concepts.forEach((concept) => {
        glosses.forEach((gloss) => {
          expect(concept.summary).not.toContain(gloss)
          expect(concept.name).not.toContain(gloss)
        })
      })
    })
  })

  // 「AWS KMS가 암호화 키를 생성하고 관리하는 방식은?」 → 정답 SSE-KMS처럼, 프롬프트의 낱말이
  // 정답 이름과 글자로 이어지면 개념을 몰라도 골라진다. 이 앱은 시험 시뮬레이터가 아니라
  // 학습 도구이므로(CLAUDE.md) 문항은 요구나 상황을 주고 개념을 잇게 해야 한다.
  // 낱말이 프롬프트에 없으면 문항이 성립하지 않는 자리는 예외다 — q037의 SSE-KMS가 그렇다.
  // 그 자리는 정답이 아니라 전제이므로, 정답 보기의 이름만 검사한다.
  it('S3 암호화 주제의 문항이 정답 보기의 이름을 프롬프트에 꺼내지 않는다', () => {
    const leaked = questions
      .filter(({ topicId }) => topicId === 's3-encryption-batch')
      .filter((question) => {
        const answer = question.choices[question.answerIndex]
        const names = answer.match(/[A-Za-z][A-Za-z0-9-]{2,}/g) ?? []

        return names.some((name) => question.prompt.toUpperCase().includes(name.toUpperCase()))
      })
      .map(({ id }) => id)

    expect(leaked).toEqual([])
  })

  // phase 29 step 5 — 문항 쪽의 관용 표현·범위 결함을 이 주제에서 고정한다.
  describe('S3 암호화 주제의 문항이 한 개념을 뜻이 통하는 말로 묻는다', () => {
    const topicQuestions = questions.filter(({ topicId }) => topicId === 's3-encryption-batch')

    // 「돌린다」는 프로그램을 실행한다는 뜻으로 쓰였지만 그 뜻으로 읽히지 않는다.
    // 문항은 열 때마다 섞이므로(ADR-011) 앞뒤 문맥이 뜻을 보정해 주지 않는다.
    // 「돌려준다」(반환)는 대상이 아니다 — s3-object-lambda 개념 본문이 쓰는 말이고,
    // 실행·운영의 비유가 아니라서 phase 29 step 2가 개념 쪽에서도 그대로 두었다.
    it('실행을 「돌린다」로 쓰지 않는다', () => {
      const offenders = topicQuestions
        .filter(({ prompt, choices, explanation }) =>
          [prompt, ...choices, explanation].some((text) => /돌(릴|린|리는|아가)/.test(text)),
        )
        .map(({ id }) => id)

      expect(offenders).toEqual([])
    })

    // 개념 본문이 「자동 교체」·「인벤토리 보고서」로 통일돼 있다(phase 29 step 2·3).
    // 같은 동작을 문항이 다른 이름으로 부르면 개념 펼치기와 해설이 어긋나 보인다.
    it('키 교체와 인벤토리 산출물을 개념 본문과 같은 이름으로 부른다', () => {
      const text = topicQuestions
        .flatMap(({ prompt, choices, explanation }) => [prompt, ...choices, explanation])
        .join(' ')

      expect(text).not.toContain('자동 순환')
      expect(text).not.toContain('평면 파일')
    })

    // 목록 얻기를 어렵게 만드는 것은 객체 수이지 접두사 개수가 아니다.
    // 개념 본문은 step 3이 이미 고쳤고, 같은 오독을 부르던 프롬프트를 여기서 맞춘다.
    it('인벤토리 문항이 접두사 개수를 어려움의 원인으로 들지 않는다', () => {
      const question = topicQuestions.find(({ id }) => id === 'q277')

      expect(question?.prompt).toContain('버킷에 객체가 수백만 개 쌓여 있다')
      expect(question?.prompt).not.toContain('접두사')
    })

    // ③ — 정답 논리에 쓰이지 않는 요구를 얹으면 무엇을 배우는 문항인지 흐려진다.
    // 봉투 암호화는 q173(envelope-encryption)이 맡는 축이라 여기서 빼고, SSE-C가
    // 키 관리를 어디까지 맡길 수 있는가 하나만 묻는다. 그래서 보기 넷이 모두 키 축이다.
    it('SSE-C 문항이 키 관리 하나만 묻고 보기 넷이 그 축 안에 있다', () => {
      const question = topicQuestions.find(({ id }) => id === 'q282')

      expect(question?.prompt).not.toContain('봉투 암호화')
      question?.choices.forEach((choice) => {
        expect(choice).toContain('키')
      })
    })

    // 개념 하나를 묻는 문항이 「두 요구」라고 스스로 말하면 학습자는 둘을 묻는다고 읽는다.
    // sse-kms-audit-trail은 감사 추적과 업로드 강제를 한 쌍으로 묶은 개념이고, 두 요구
    // 어느 쪽으로도 같은 보기가 남으므로 프롬프트에서 그 라벨만 뺐다.
    it('감사 추적 문항이 스스로를 두 요구라 부르지 않는다', () => {
      const question = topicQuestions.find(({ id }) => id === 'q279')

      expect(question?.prompt).not.toContain('두 요구')
      expect(question?.explanation).not.toContain('두 요구')
    })

    // phase 29 step 7 — 문항에는 주제 문맥이 없다. ADR-011이 문항 순서를 섞고 ADR-012·018의
    // 랜덤 세트는 732문항에서 일부만 뽑으므로, 학습자는 이 주제를 읽지 않은 채로 문항을 만난다.
    // 개념 본문은 주제 페이지 안에서 읽혀 한 줄 풀이로 해결되지만(ADR-029) 문항은 그렇지 않다.
    // 그래서 문항에서는 풀이를 붙이는 대신 낱말에 소속을 붙인다 — 프롬프트가 길어지지 않고,
    // 그 낱말이 무엇에 대한 이야기인지가 그 자리에서 잡힌다.
    it('버킷·객체·접두사를 쓰는 프롬프트가 그 낱말이 S3의 것임을 밝힌다', () => {
      const orphans = topicQuestions
        .filter(({ prompt }) => /버킷|객체|접두사/.test(prompt) && !prompt.includes('S3'))
        .map(({ id }) => id)

      expect(orphans).toEqual([])
    })

    // 같은 개념에 정답까지 같은 문항이 둘이면 낱말만 다른 같은 문항일 가능성이 크다.
    // q036(자동 교체 → SSE-KMS)과 q173(봉투 암호화 → SSE-KMS)이 그 자리였다 — 개념이 달라
    // 이 단언에는 걸리지 않지만, step 7이 q173을 봉투 암호화 하나로 좁혀 근거를 갈랐다.
    // **후보와 위반은 다르다** — 같은 답을 다른 성질로 묻는 짝은 배우는 것이 서로 다르다.
    // 그래서 개념까지 같은 경우만 잡는다.
    it('같은 개념에 정답이 같은 문항이 둘 있지 않다', () => {
      const seen = new Map<string, string>()
      const duplicates: string[] = []

      topicQuestions.forEach((question) => {
        const key = `${question.conceptId}|${question.choices[question.answerIndex]}`
        const first = seen.get(key)
        if (first) duplicates.push(`${first}·${question.id}`)
        else seen.set(key, question.id)
      })

      expect(duplicates).toEqual([])
    })
  })

  it('Storage Gateway 문단이 일회성 전송과의 차이와 S3 저장 사실을 함께 밝힌다', () => {
    const concept = topics
      .flatMap((topic) => topic.concepts)
      .find(({ id }) => id === 'storage-gateway-migration.storage-gateway')

    expect(concept?.paragraphs).toHaveLength(4)
    expect(concept?.paragraphs[0]).toContain('스토리지를 연결한 채 사용하는 데 있다')
    expect(concept?.paragraphs[0]).toContain('세 유형 모두 데이터를 S3에 저장한다')
    expect(concept?.paragraphs[0]).toContain('DataSync·Snowball Edge와 달리')
    expect(concept?.paragraphs[0]).toContain('자체 저장 공간을 제공하지 않으며')
  })

  it('RDS 세 기능의 목적 차이가 기능 목록 바로 뒤 문단에 드러난다', () => {
    const concept = topics
      .flatMap((topic) => topic.concepts)
      .find(({ id }) => id === 'rds-storage-features.features')

    // ADR-046이 다섯 기능을 목록 항목으로 세우고, 셋을 함께 견주는 문장을 목록 뒤 문단으로 뺐다.
    expect(concept?.paragraphs).toHaveLength(6)
    expect(concept?.paragraphs[5]).toContain('Multi AZ 배포는 고가용성')
    expect(concept?.paragraphs[5]).toContain('Read Replica는 읽기 확장')
    expect(concept?.paragraphs[5]).toContain('Multi AZ DB Cluster는 그 둘을 함께 얻는 구성이다')
    expect(concept?.paragraphs[2]).toContain('Cross Region Read Replica')
  })

  it('S3·스토리지 보충 문항이 상황을 세우는 프롬프트로 바뀐다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    // phase 30 step 2가 한국어 문체만 다듬었다 — q171은 소속 없이 쓰인 「버킷」에 S3를 붙이고
    // (문항에는 주제 문맥이 없다 — ADR-011·012), 무엇을 묻는지 없이 끊던 「기능은?」을
    // 「기능은 무엇인가?」로 닫았다. q172도 같은 이유로 서술어만 온전하게 세웠다.
    // 리드인과 조건은 그대로다. 아래 「리드인을 붙인 29문항」의 120자 상한 안에 있다(80·81자).
    expect(prompts.q171).toBe('S3 객체 잠금은 정해진 기간 동안 객체의 수정과 삭제를 막는 기능이다. 이 잠금을 걸려면 S3 버킷에서 먼저 활성화해야 하는 기능은 무엇인가?')
    expect(prompts.q172).toBe('S3 이벤트 알림은 파일이 올라오는 즉시 Lambda 같은 서비스를 자동으로 호출한다. 이 알림이 객체 생성 이벤트를 발생시키는 대상은 무엇인가?')
    // q173은 phase 29 step 7이 봉투 암호화 하나로 좁혔다. 앞서 함께 걸려 있던 「자동 교체」는
    // step 4가 q036의 축으로 삼은 것이라, 두 문항이 같은 정답을 같은 근거로 묻고 있었다.
    // phase 30 step 1이 한국어 문체만 다시 다듬었다 — 「그리고」로 시작하던 둘째 문장을
    // 앞 문장에 이어 붙이고, 무엇을 고르는지가 없던 「이 구조를 쓰는 것은」을 물음 안에 세웠다.
    // 좁힌 범위(봉투 암호화 하나)와 조건은 그대로다.
    expect(prompts.q173).toBe('봉투 암호화는 데이터를 데이터 키로 암호화한 다음, 그 데이터 키를 다시 마스터 키로 한 번 더 암호화한다. S3에 저장할 때 이 구조를 사용하는 암호화 방식은 무엇인가?')
    // q174는 같은 step이 「객체」에 소속(S3)을 붙이고 세 문장으로 쪼갰다. phase 30 step 1이
    // 「불러서」→「호출하므로」, 「큰 몫이 된다」→「큰 몫을 차지한다」로 조사와 서술어를 고쳤다.
    // 소속(S3)과 세 문장 구성은 그대로다. 아래 「리드인을 붙인 29문항」이 프롬프트 상한을
    // 120자로 걸고 있어 이 문항은 그 안에서만 다듬을 수 있다 — 지금 정확히 120자다.
    expect(prompts.q174).toBe('SSE-KMS로 암호화한 S3 버킷에 객체가 초당 수백만 건씩 올라온다. 객체마다 KMS API를 호출하므로 그 비용이 청구서에서 큰 몫을 차지한다. 암호화 방식은 그대로 두고 이 호출 수를 줄이는 기능은 무엇인가?')
    // phase 30 step 3이 한국어 문체만 다듬었다 — q175는 상황을 서술하던 첫 문장을 「~하는 상황이다」로
    // 닫아 뒤 물음과 이어 붙였고(60자를 넘던 한 덩어리가 두 문장으로 끊긴다), q176은 「붙어 있는」을
    // 「연결된」으로, 무엇을 묻는지 없이 끊던 「기능은?」을 「기능은 무엇인가?」로 고쳤다.
    // 조건(수천 개 노드·HPC·네트워크 지연 / 무중단·떼었다 다시 붙이지 않음)은 그대로이고,
    // 아래 「리드인을 붙인 29문항」의 120자 상한 안에 있다(88·78자).
    expect(prompts.q175).toBe('수천 개 노드가 동시에 데이터를 읽고 쓰는 HPC 워크로드를 운영하는 상황이다. 노드 사이의 네트워크 지연을 최대한 줄이려면 EC2를 어떻게 배치해야 하는가?')
    expect(prompts.q176).toBe('EC2에 연결된 EBS 볼륨의 크기를 서비스를 멈추지 않고 늘려야 하는 상황이다. 볼륨을 떼었다 다시 붙이지 않고 확장하는 기능은 무엇인가?')
    // q177은 phase 30 step 4가 한국어 문체만 다듬었다 — 상황을 서술하던 첫 문장을
    // 「~하는 상황이다」로 닫아 뒤 물음과 이었고, 무엇을 묻는지 없이 끊던 「기능은?」을
    // 「기능은 무엇인가?」로 세웠다. 조건(보관 비용 절감 + 즉시 읽기 + 미접근 자동 전환)은
    // 그대로이고, 아래 「리드인을 붙인 29문항」의 120자 상한 안에 있다(97자).
    expect(prompts.q177).toBe('EFS에 오래 방치된 파일의 보관 비용을 줄이면서도 필요할 때는 즉시 읽을 수 있어야 하는 상황이다. 접근이 없는 파일을 자동으로 더 저렴한 클래스로 옮기는 기능은 무엇인가?')
  })

  it('데이터베이스·확장 보충 문항이 상황을 세우는 프롬프트로 바뀐다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    // phase 30 step 6이 q179·q181의 한국어 문체만 다듬었다 — q179는 한 덩어리로 이어지던
    // 63자 상황 문장을 「~하는 상황이다」와 「~해야 한다」 두 문장으로 끊고 무엇을 묻는지 없이
    // 끊던 「표기는?」을 「약칭은 무엇인가?」로 세웠고, q181은 「둘 수 있는지」를 「보관할 수
    // 있는지」로, 「보존 기간은?」을 「보존 기간은 얼마인가?」로 고쳤다. q181의 물음을 「며칠인가」로
    // 닫지 않은 이유는 보기에 「7년」이 있어 단위가 곧 힌트가 되기 때문이다. 조건(쓰기 급증·지연
    // 시간 보장 / 규정 준수·최대 보존)은 그대로이고, 아래 「리드인을 붙인 29문항」의 120자 상한
    // 안에 있다(106·71자).
    expect(prompts.q179).toBe('쓰기 작업량이 급격히 치솟는 RDS 워크로드를 운영하는 상황이다. 지연 시간을 보장하려면 IOPS를 직접 지정하는 스토리지를 골라야 한다. 이 프로비저닝된 IOPS SSD의 약칭은 무엇인가?')
    expect(prompts.q181).toBe('규정 준수를 위해 백업을 얼마나 오래 보관할 수 있는지부터 확인하려는 상황이다. RDS 자동 백업의 최대 보존 기간은 얼마인가?')
    // phase 30 step 7이 q183·q184의 한국어 문체만 다듬었다 — q183은 단정으로 끊던 상황 문장을
    // 「~하는 상황이다」로 닫아 뒤 물음과 이었고 「구성은?」을 「구성은 무엇인가?」로 세웠다.
    // q184는 62자로 이어지던 상황 한 덩어리를 두 문장으로 끊고, 가리키는 대상이 없던
    // 「어느 쪽으로 보낼지」를 「어느 복제본으로 요청을 보낼지」로 바꿨다. 조건(용량 예측 불가·
    // 1초 단위 자동 조정 / 복제본 여러 개·애플리케이션이 직접 고르지 않음·접속 주소 하나로
    // 자동 분산)은 그대로이고, 아래 「리드인을 붙인 29문항」의 120자 상한 안에 있다(87·117자).
    expect(prompts.q183).toBe('플레이어 수가 시시각각 바뀌어 용량을 예측하기 어려운 게임 서버에 관계형 데이터베이스가 필요한 상황이다. 용량을 1초 단위로 자동 조정하는 구성은 무엇인가?')
    expect(prompts.q184).toBe('Aurora에 읽기 전용 복제본을 여러 개 두려는 상황이다. 애플리케이션이 어느 복제본으로 요청을 보낼지 직접 고르지 않게 하려 한다. 접속 주소 하나로 부하를 자동 분산하는 Aurora 전용 기능은 무엇인가?')
    // phase 30 step 8이 q186의 한국어 문체만 다듬었다 — 「되돌리려고 … 검토한다」로 끊던 상황
    // 문장을 「되돌려야 하는 상황이다」로 닫아 뒤 물음과 이었고, 약어를 두 번 쓰던 것을
    // 「특정 시점 복구(PITR)」 한 번으로 모아 「최대 기간은?」을 「최대 기간은 얼마인가?」로
    // 세웠다. 물음을 「며칠인가」로 닫지 않은 이유는 보기에 「7년」이 있어 단위가 곧 힌트가
    // 되기 때문이다(step 6의 q181과 같은 판정). 조건(사고 직전 시점으로 복구·최대 기간)은
    // 그대로이고, 아래 「리드인을 붙인 29문항」의 120자 상한 안에 있다(82자).
    expect(prompts.q186).toBe('DynamoDB에서 사고가 나기 직전 시점으로 데이터를 되돌려야 하는 상황이다. 특정 시점 복구(PITR)로 되돌릴 수 있는 최대 기간은 얼마인가?')
    // phase 30 step 10이 q188의 한국어 문체만 다듬었다 — 단정으로 끊던 상황 문장을
    // 「~하는 상황이다」로 닫아 뒤 물음과 이었고, 「애플리케이션이 뜰 때까지」를
    // 「애플리케이션이 시작될 때까지」로 풀어 썼으며(ADR-030 기준 5) 「기능은?」을
    // 「기능은 무엇인가?」로 세웠다. 조건(부팅·초기화 지연 / 실행 비용을 늘리지 않음)은
    // 그대로이고, 아래 「리드인을 붙인 29문항」의 120자 상한 안에 있다(102자).
    expect(prompts.q188).toBe('트래픽이 급증할 때 새 EC2가 부팅되고 애플리케이션이 시작될 때까지 응답이 지연되는 상황이다. 실행 비용은 늘리지 않으면서 이 지연을 없애는 Auto Scaling 기능은 무엇인가?')
  })

  it('전송·서버리스 보충 문항이 상황을 세우는 프롬프트로 바뀐다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    // phase 30 step 12가 q192·q198의 한국어 문체만 다듬었다 — q192는 쉼표로 이어 붙여
    // 72자가 된 상황 한 덩어리를 「~해야 하는 상황이다」와 「~해야 한다」 두 문장으로 끊고
    // 무엇을 묻는지 없이 끊던 「적합한 서비스는?」을 「이때 알맞은 서비스는 무엇인가?」로
    // 세웠다. q198은 단정으로 끊던 상황 문장을 「~하려는 상황이다」로 닫아 뒤 물음과 이었고
    // 「방식은?」을 「방식은 무엇인가?」로 세웠다. 조건(HTTP가 아닌 트래픽·전 세계 전달·리전
    // 장애 시 정상 리전 / 로그인 지연·가장 가까운 곳·엣지 로케이션 실행)은 그대로이고,
    // 아래 「리드인을 붙인 29문항」의 120자 상한 안에 있다(104·95자).
    expect(prompts.q192).toBe('실시간 게임 서버처럼 HTTP가 아닌 트래픽을 전 세계 사용자에게 빠르게 전달해야 하는 상황이다. 리전에 장애가 나면 트래픽을 정상 리전으로 넘겨야 한다. 이때 알맞은 서비스는 무엇인가?')
    // phase 30 step 13이 q197의 한국어 문체만 다듬었다 — 「~라 … 과하다」로 이유와 결론을
    // 한 문장에 눌러 담던 것을 「단순한 호출이다」와 「앞에 두기에는 과한 상황이다」 두 문장으로
    // 끊어 뒤 물음과 이었고, 「기능은?」을 「기능은 무엇인가?」로 세웠다. 조건(관리자가 필요할
    // 때 누르는 단순한 호출 / API Gateway가 과함 / 직접 HTTP(S) 주소)은 그대로이고, 아래
    // 「리드인을 붙인 29문항」의 120자 상한 안에 있다(106자).
    expect(prompts.q197).toBe('관리자가 필요할 때 눌러 보고서를 만드는 정도의 단순한 호출이다. API Gateway를 앞에 두기에는 과한 상황이다. Lambda 함수에 직접 HTTP(S) 주소를 붙이는 기능은 무엇인가?')
    expect(prompts.q198).toBe('로그인 과정의 지연까지 줄이려고 권한 부여 로직을 사용자와 가장 가까운 곳에서 처리하려는 상황이다. CloudFront 엣지 로케이션에서 코드를 실행하는 방식은 무엇인가?')
    // phase 30 step 15가 q200의 한국어 문체만 다듬었다 — 단정으로 끊던 상황 문장을
    // 「~해야 하는 상황이다」로 닫아 뒤 물음과 이었고, 「기본 지원하면서」를 「기본으로
    // 지원하면서」로 풀어 쓴 뒤 「유형은?」을 「유형은 무엇인가?」로 세웠다. 늘어난 만큼
    // 「이 두 가지」를 「이 둘」로 줄여 둘째 문장을 58자에 맞췄다. 조건(JWT 인증·ALB 직접
    // 통합·REST API보다 낮은 비용과 지연)은 그대로이고, 아래 「리드인을 붙인 29문항」의
    // 120자 상한 안에 있다(105자).
    expect(prompts.q200).toBe('JWT로 사용자를 인증하는 퍼블릭 API를 ALB와 직접 통합해야 하는 상황이다. 이 둘을 기본으로 지원하면서 REST API보다 비용과 지연이 낮은 API Gateway 유형은 무엇인가?')
  })

  it('네트워크·분석 보충 문항이 상황을 세우는 프롬프트로 바뀐다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    // phase 30 step 17이 q210·q213의 한국어 문체만 다듬었다 — 둘 다 서술어 없이 끊던 물음을
    // 「IP 버전은 무엇인가?」·「사용하는 것은 무엇인가?」로 닫고, q213은 명사를 이어 붙인
    // 「접근 제어에 사용하는」을 「접근을 제어할 때 사용하는」으로 풀어 썼다. 리드인(Egress-only가
    // 무엇을 담당하는가 / S3가 리전 수준 서비스라는 전제)은 그대로이고, 아래 두 단언이 지키는
    // 것(프롬프트가 IPv4·보안 그룹을 꺼내 오답을 대신 지우지 않는가)도 그대로다.
    expect(prompts.q210).toBe('Egress-only 인터넷 게이트웨이는 NAT 게이트웨이처럼 안에서 밖으로 나가는 통신만 담당한다. 이 게이트웨이가 아웃바운드 통신을 제공하는 IP 버전은 무엇인가?')
    expect(prompts.q213).toBe('S3는 VPC나 서브넷 안에 만들 수 없는 리전 수준 서비스다. 이런 S3 버킷의 접근을 제어할 때 사용하는 것은 무엇인가?')
    // phase 30 step 19가 q215의 한국어 문체만 다듬었다 — 단정으로 끊던 상황 문장을
    // 「~하려는 상황이다」로 닫아 뒤 물음과 이었고, 서술어 없이 끊던 「묶는 통로는?」을
    // 「하나로 묶는 통로는 무엇인가?」로 세웠다. 리드인(일관되고 낮은 지연 시간 + 수백 개
    // VPC 연결)은 그대로이고, 아래 「리드인을 붙인 29문항」의 120자 상한 안에 있다(109자).
    expect(prompts.q215).toBe('일관되고 낮은 지연 시간과 수백 개 VPC 연결이 동시에 필요한 하이브리드 네트워크를 구성하려는 상황이다. Direct Connect와 Transit Gateway를 하나로 묶는 통로는 무엇인가?')
    // phase 30 step 20이 q221의 한국어 문체만 다듬었다 — 체언으로 끊어 서술어가 없던
    // 「정상 레코드의 최댓값은?」을 「정상 레코드는 최대 몇 개인가?」로 닫았다. 보기 넷이
    // 모두 「N개」라 단위가 힌트가 되지 않으므로 이 자리에서는 개수로 물어도 된다
    // (step 6의 q181·step 8의 q186은 보기에 「7년」이 섞여 단위로 닫지 않았다).
    // 리드인(헬스 체크로 장애가 난 곳을 빼고 무작위로 응답한다)은 한 글자도 바뀌지 않았고,
    // 아래 두 단언(「8개」를 흘리지 않는가, 120자 상한)도 그대로다 — 지금 101자다.
    expect(prompts.q221).toBe('다중값 응답 라우팅은 각 레코드에 연동된 헬스 체크로 장애가 난 곳을 빼고 무작위로 응답한다. 이 정책이 한 번에 반환할 수 있는 정상 레코드는 최대 몇 개인가?')
    // phase 30 step 21이 q222의 한국어 문체만 다듬었다 — 단정으로 끊던 상황 문장을
    // 「~하려는 상황이다」로 닫아 뒤 물음과 이었고, 무엇을 스캔하는지 가리키는 말이 없던
    // 「데이터를 스캔해」를 「이 데이터를 훑어」로 바꿔 앞 문장의 데이터를 받게 했다
    // (근거 개념 glue-crawler 문단 0이 「데이터를 훑어 구조를 파악해두고」로 쓴다).
    // 서술어 없이 끊던 「기능은?」도 「기능은 무엇인가?」로 세웠다. 리드인(S3에 막 들어온
    // 데이터를 Athena로 곧바로 분석한다)은 그대로이고, 아래 두 단언(Glue Job을 흘리지
    // 않는가, 「리드인을 붙인 29문항」의 120자 상한)도 그대로다 — 지금 85자다.
    expect(prompts.q222).toBe('S3에 막 들어온 데이터를 Athena로 곧바로 분석하려는 상황이다. 이 데이터를 훑어 구조를 파악하고 쿼리할 수 있는 상태로 준비하는 기능은 무엇인가?')
  })

  it('네트워크 보충 문항의 상황 문장이 오답을 대신 지워주지 않는다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    expect(prompts.q210).not.toContain('IPv4')
    expect(prompts.q213).not.toContain('보안 그룹')
    expect(prompts.q221).not.toContain('8개')
    expect(prompts.q222).not.toContain('Glue Job')
  })

  it('보안·권한·비용 보충 문항이 상황을 세우는 프롬프트로 바뀐다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    // phase 30 step 18이 q225의 한국어 문체만 다듬었다 — 앞 문장의 「매장 5만 곳」을 받는
    // 자리인데 「이 IP」라고만 해 무엇의 IP인지 끊기던 것을 「이 매장들의 IP」로 잇고,
    // 서술어 없이 끊던 「적합한 기능은?」을 「어떤 기능을 사용해야 하는가?」로 닫았다.
    // 아래 두 단언(WAF를 흘리지 않는가, 120자 상한)은 그대로 지킨다 — 지금 88자다.
    expect(prompts.q225).toBe('NACL은 규칙 수에 제한이 있어 매장 5만 곳의 IP를 개별 등록할 수 없다. 이 매장들의 IP에서 오는 웹 요청만 허용하려면 어떤 기능을 사용해야 하는가?')
    // phase 30 step 23이 q227의 한국어 문체만 다듬었다 — 조건 둘을 「~하면서」로 이어 붙여
    // 한 문장에 담던 것을 「서비스하고 있다」와 「적용하려는 상황이다」 두 문장으로 끊고,
    // 체언으로 끊던 「리전은?」을 「리전은 어디인가?」로 닫았다. 아래 두 단언(us-east-1을
    // 흘리지 않는가, 「리드인을 붙인 29문항」의 120자 상한)은 그대로다 — 지금 91자다.
    expect(prompts.q227).toBe('S3에 올린 정적 사이트를 CloudFront로 서비스하고 있다. 사용자 지정 도메인에 HTTPS를 적용하려는 상황이다. ACM 인증서를 발급해야 하는 리전은 어디인가?')
    // phase 30 step 24가 q232의 한국어 문체만 다듬었다 — 단정으로 끊던 상황 문장을
    // 「~하는 상황이다」로 닫아 뒤 물음과 이었고, 앞 문장의 악성 봇을 받는 자리인데
    // 「이를」이라고만 해 무엇을 탐지하는지 끊기던 것을 「이런 봇을」로 밝혔다. 서술어 없이
    // 끊던 「기능은?」도 「기능은 무엇인가?」로 세웠다. 아래 단언(정답 「AWS WAF Bot Control」을
    // 흘리지 않는가, 「리드인을 붙인 29문항」의 120자 상한)은 그대로다 — 지금 96자다.
    expect(prompts.q232).toBe('전 세계에서 오는 악성 봇이 대량의 요청을 보내 컴퓨팅 리소스를 낭비하고 있는 상황이다. 요청 속도 같은 행동 패턴을 기준으로 이런 봇을 탐지하고 제어하는 기능은 무엇인가?')
    // phase 30 step 24가 q236의 한국어 문체만 다듬었다 — 무엇의 패치인지 가리키는 말이 없던
    // 「EC2의」를 「EC2 인스턴스의」로 세우고, 서술어 없이 끊던 「서비스는?」을
    // 「서비스는 무엇인가?」로 닫았다. 스캔 대상 두 가지는 한 글자도 바뀌지 않았고,
    // 아래 단언(정답 「Amazon Inspector」를 흘리지 않는가, 120자 상한)도 그대로다 — 61자다.
    expect(prompts.q236).toBe('EC2 인스턴스의 소프트웨어 패치 누락과 공개적으로 알려진 보안 취약점(CVE)을 스캔하는 서비스는 무엇인가?')
    // phase 30 step 25가 q239의 한국어 문체만 다듬었다 — 단정으로 끊어 뒤 물음과 이어지지
    // 않던 상황 문장을 「~하려는 상황이다」로 닫고, 체언으로 끊던 「대상은?」을
    // 「대상은 무엇인가?」로 세웠다. 리드인(EC2에 S3 권한을 주려고 그룹에 인스턴스를 넣으려
    // 한다)은 그대로이고, 아래 「리드인을 붙인 29문항」의 단언(정답 「IAM 사용자」를 흘리지
    // 않는가, 120자 상한)도 그대로다 — 지금 73자다.
    expect(prompts.q239).toBe('EC2에 S3 접근 권한을 주려고 IAM 그룹에 그 인스턴스를 넣으려는 상황이다. IAM 그룹에 직접 추가할 수 있는 대상은 무엇인가?')
    // phase 30 step 26이 q241의 한국어 문체만 다듬었다 — 단정으로 끊어 뒤 물음과 이어지지
    // 않던 상황 문장을 「~하려는 상황이다」로 닫고, 체언으로 끊던 「구성 요소는?」을
    // 「구성 요소는 무엇인가?」로 세웠다. 리드인의 조건(Cognito로 로그인을 마쳤다 / S3에
    // 접근한다)은 그대로이고, 아래 두 단언(「사용자 풀」을 흘리지 않는가, 「리드인을 붙인
    // 29문항」의 120자 상한)도 그대로다 — 지금 79자다.
    expect(prompts.q241).toBe('Cognito로 로그인을 마친 사용자가 S3에 접근할 수 있게 하려는 상황이다. 인증된 사용자에게 임시 권한을 제공하는 구성 요소는 무엇인가?')
    // phase 30 step 27이 q243의 한국어 문체만 다듬었다 — 단정으로 끊어 뒤 문장이 새로
    // 시작하는 것처럼 읽히던 첫 문장을 「~한 상황이다」로 닫아 이었다. 물음은 이미 온전해
    // 그대로이고, 아래 두 단언(정답 「결제 콘솔에서 태그를 활성화한다」를 흘리지 않는가,
    // 「리드인을 붙인 29문항」의 120자 상한)도 그대로다 — 지금 88자다.
    expect(prompts.q243).toBe('부서별로 비용을 나눠 보려고 리소스에 사용자 정의 태그를 붙인 상황이다. Cost Explorer에서 이 태그로 비용을 집계하려면 그다음 무엇을 해야 하는가?')
  })

  it('보안 보충 문항의 상황 문장이 오답을 대신 지워주지 않는다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    expect(prompts.q225).not.toContain('WAF')
    expect(prompts.q227).not.toContain('us-east-1')
    expect(prompts.q241).not.toContain('사용자 풀')
  })

  it('리드인을 붙인 29문항이 정답을 노출하지 않고 길이 상한을 지킨다', () => {
    const leadInIds = [
      'q171', 'q172', 'q173', 'q174', 'q175', 'q176', 'q177',
      'q179', 'q181', 'q183', 'q184', 'q186', 'q188',
      'q192', 'q197', 'q198', 'q200',
      'q210', 'q213', 'q215', 'q221', 'q222',
      'q225', 'q227', 'q232', 'q236', 'q239', 'q241', 'q243',
    ]

    const targets = questions.filter(({ id }) => leadInIds.includes(id))

    expect(targets).toHaveLength(29)
    targets.forEach((question) => {
      expect(question.prompt.length).toBeLessThanOrEqual(120)
      expect(question.prompt).not.toContain(question.choices[question.answerIndex])
    })
  })
  it('전제 용어를 설명하지 않던 문항이 상황을 세우는 프롬프트로 바뀐다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    // phase 30 step 18이 셋의 한국어 문체만 다듬었다 — 체언으로 끊어 무엇을 묻는지 모호하던
    // 「초기 상태의 인바운드는?」류를 「초기 상태에서 인바운드 트래픽은 어떻게 처리되는가?」로
    // 닫았다. 이 단언이 지키는 것(전제 용어인 보안 그룹·NACL을 리드인이 먼저 세우는가)은
    // 그대로이고, 리드인 문장은 한 글자도 바뀌지 않았다.
    expect(prompts.q131).toBe('보안 그룹은 리소스에 도달하려는 요청을 문 앞에서 검사하는 방화벽이다. 규칙을 하나도 추가하지 않은 초기 상태에서 인바운드 트래픽은 어떻게 처리되는가?')
    expect(prompts.q132).toBe('보안 그룹은 리소스에서 밖으로 나가는 트래픽에도 규칙을 적용한다. 규칙을 하나도 추가하지 않은 초기 상태에서 아웃바운드 트래픽은 어떻게 처리되는가?')
    expect(prompts.q134).toBe('NACL은 개별 리소스가 아니라 서브넷 경계에서 트래픽을 통제한다. 규칙을 손대지 않은 초기 상태에서 인바운드와 아웃바운드 트래픽은 어떻게 처리되는가?')
    // phase 30 step 25가 q156의 한국어 문체만 다듬었다 — 체언으로 끊어 서술어가 없던
    // 「권한 부여 방식은?」을 「권한 부여 방식은 무엇인가?」로 닫았다. 이 단언이 지키는 것
    // (전제 용어인 Access Key와 장기 자격 증명을 리드인이 먼저 세우는가)은 그대로이고,
    // 리드인 문장은 한 글자도 바뀌지 않았다.
    expect(prompts.q156).toBe('액세스 키는 만료 시점이 없어 장기 자격 증명으로 분류한다. 이런 키를 서로 전달하지 않고 언제든 해제할 수 있는 권한 부여 방식은 무엇인가?')
  })

  it('정의 자체를 묻는 문항은 상황 문장 없이 그대로 남는다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    // 리드인을 붙이면 개념 summary가 곧 정답이 되는 문항들이다. 바뀌면 정답이 노출된 것이다.
    // phase 30 step 5가 앞의 둘을 온전한 물음으로 닫았다 — 리드인은 여전히 붙이지 않고
    // 서술어만 `무엇인가`로 맞췄으므로 이 단언이 지키려는 「상황 문장 없이」는 그대로다.
    expect(prompts.q053).toBe('Storage Gateway의 주된 목적은 무엇인가?')
    expect(prompts.q057).toBe('Storage Gateway 자체의 스토리지 기능을 옳게 설명한 것은 무엇인가?')
    // phase 30 step 23이 q144도 같은 방식으로 닫았다 — 리드인은 여전히 붙이지 않고
    // 서술어만 `무엇인가`로 맞췄다.
    expect(prompts.q144).toBe('Secrets Manager와 Parameter Store의 공통 기능은 무엇인가?')
    // phase 30 step 26이 q160도 같은 방식으로 닫았다 — 리드인은 여전히 붙이지 않고
    // 서술어만 `무엇인가`로 맞췄다. 함께 「만료 기간」을 「만료 시점」으로 바꿨는데,
    // 같은 사실을 뒤집어 말하는 q156·q157이 이미 「만료 시점이 없는」으로 쓰고 있어
    // 한 앱에서 같은 것을 두 이름으로 부르던 자리다.
    expect(prompts.q160).toBe('만료 시점이 있는 액세스 키나 Token 형태의 임시 권한을 발급하는 서비스는 무엇인가?')
  })

  it('막연한 일반 명사를 쓰던 문항이 구체적 사례로 바뀐다', () => {
    const question = questions.find(({ id }) => id === 'q088')

    // phase 30 step 15가 q088의 한국어 문체만 다듬었다 — 쉼표로 이어 붙여 72자가 된 상황
    // 한 덩어리를 「~해야 하는 상황이다」와 물음 두 문장으로 끊고, 무엇을 묻는지 없이 끊던
    // 「서비스는?」을 「서비스는 무엇인가?」로 세웠다. 조건(처리 여러 개를 정해진 순서로 이어
    // 실행 / 각 단계의 재시도·오류 처리)은 그대로이고, 아래 단언대로 보기 넷의 이름은
    // 여전히 프롬프트에 한 글자도 나오지 않는다.
    expect(question?.prompt).toBe('이미지 리사이징이나 보고서 발송 같은 처리 여러 개를 정해진 순서로 이어 실행해야 하는 상황이다. 각 단계의 재시도와 오류 처리까지 맡는 서비스는 무엇인가?')
    // 보기에 있는 서비스명을 꺼내면 오답이 소거된다.
    question?.choices.forEach((choice) => {
      expect(question.prompt).not.toContain(choice)
    })
  })

  it('가리키는 대상이 없던 명사와 전제 용어가 문항 안에서 해결된다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    // phase 30 step 1이 한국어 표현만 다듬었다 — 「수백만 개에서 수십억 개」는 범위를 말하는
    // 자리라 「까지」가 있어야 이어지고, 앞 문장을 「~하는 상황이다」로 닫아 다음 문장과 이었다.
    // 이 단언이 지키는 것(가리키는 대상 없이 「파일」만 던지지 않는가)은 그대로다.
    expect(prompts.q039).toBe('S3 버킷에 파일이 수백만 개에서 수십억 개까지 들어 있는 상황이다. 이 파일 전부에 복사나 삭제 같은 동일한 작업을 한 번에 적용해야 한다. 이 일을 맡는 서비스는 무엇인가?')
    // q043도 phase 30 step 4가 문체만 다듬었다 — 「접근이 뜸한」을 개념 본문과 같은
    // 「접근이 뜸해진」으로 바꾸고, 「EFS 클래스」에 무엇의 클래스인지를 밝혀
    // 「EFS의 스토리지 클래스」로 적었으며 「맞는 것은?」을 물음으로 닫았다.
    // 이 단언이 지키는 것(리드인이 IA가 무엇인지 먼저 세우는가)은 그대로다.
    expect(prompts.q043).toBe('EFS IA(Infrequent Access)는 접근이 뜸해진 파일을 옮겨 두는 EFS의 스토리지 클래스다. 이 클래스로 옮겨진 파일의 접근 특성으로 맞는 것은 무엇인가?')
    // phase 30 step 10이 q075의 한국어 문체만 다듬었다 — 서버 한 대를 늘렸다 줄인다는 뜻으로
    // 읽히던 「서버를 자동으로 확장하거나 축소하는」을 개념 본문(ec2-autoscaling.ec2 문단 1)의
    // 「서버 수를 자동으로 늘리거나 줄인다」에 맞춰 고치고, 「정책은?」을 「정책은 무엇인가?」로
    // 세웠다. 조건(평균 CPU 사용률 70% 같은 목표값 유지)은 그대로이고, 보기 넷은 여전히
    // 프롬프트에 한 글자도 나오지 않는다.
    expect(prompts.q075).toBe('평균 CPU 사용률 70% 같은 목표값을 유지하도록 서버 수를 자동으로 늘리거나 줄이는 정책은 무엇인가?')
    // phase 30 step 17이 q103의 한국어 문체만 다듬었다 — 「가능하게 하는」을 「허용하는」으로
    // 풀어 쓰고, 서술어 없이 끊던 「연결하는 위치는?」을 「연결해야 하는 위치는 어디인가?」로
    // 닫았다. 이 단언이 지키는 것(리드인이 NAT 게이트웨이가 무엇인지 먼저 세우는가)은 그대로이고,
    // 보기 넷의 이름은 여전히 프롬프트에 한 글자도 나오지 않는다.
    expect(prompts.q103).toBe('NAT 게이트웨이는 외부에서 시작하는 접근은 막고 내부에서 인터넷으로 나가는 통신만 허용하는 장치다. 이 게이트웨이를 연결해야 하는 위치는 어디인가?')
    // phase 30 step 18이 둘의 한국어 문체만 다듬었다 — q133은 가리키는 대상이 흐리던
    // 「이 규칙」을 「이 보안 그룹의 규칙」으로 밝히고, q135는 명사를 겹쳐 쓴 「규칙 설정에
    // 사용할 수 있는 대상은?」을 「규칙을 정할 때 대상으로 지정할 수 있는 것은 무엇인가?」로
    // 풀었다. 아래 「보강한 7문항」의 두 단언(보기 넷을 한 글자도 노출하지 않는가, 120자
    // 상한)은 그대로 지킨다 — 지금 q133이 72자, q135가 70자다.
    expect(prompts.q133).toBe('보안 그룹은 리소스에 도달하려는 요청을 문 앞에서 검사하는 방화벽이다. 이 보안 그룹의 규칙으로 지정할 수 있는 동작은 무엇인가?')
    expect(prompts.q135).toBe('NACL은 서브넷 경계에서 트래픽을 허용하거나 거부하는 기능이다. 이 규칙을 정할 때 대상으로 지정할 수 있는 것은 무엇인가?')
    // phase 30 step 19가 q217의 서술어 없이 끊던 물음만 「구성 요소는 무엇인가?」로 닫았다.
    // 이 단언이 지키는 것(리드인이 Site-to-Site VPN이 무엇인지 먼저 세우는가)은 그대로이고,
    // 아래 「보강한 7문항」의 두 단언(보기 넷을 노출하지 않는가, 120자 상한)도 그대로다 — 87자다.
    expect(prompts.q217).toBe('Site-to-Site VPN은 인터넷에 암호화된 터널을 만들어 온프레미스와 AWS를 연결한다. 이 연결에서 고객 측 종단을 가리키는 구성 요소는 무엇인가?')
  })

  it('보강한 7문항이 보기를 노출하지 않고 길이 상한을 지킨다', () => {
    const targetIds = ['q039', 'q043', 'q075', 'q103', 'q133', 'q135', 'q217']
    const targets = questions.filter(({ id }) => targetIds.includes(id))

    expect(targets).toHaveLength(7)
    targets.forEach((question) => {
      expect(question.prompt.length).toBeLessThanOrEqual(120)
      // 보기 문자열을 꺼내면 오답이 소거된다.
      question.choices.forEach((choice) => {
        expect(question.prompt).not.toContain(choice)
      })
    })
  })

  it('리드인이 곧 정답이 되는 문항은 그대로 남는다', () => {
    const prompts = Object.fromEntries(questions.map(({ id, prompt }) => [id, prompt]))

    // 전수 읽기에서 후보로 올랐지만 손대면 정답이 드러나는 문항들이다. 바뀌면 노출된 것이다.
    // phase 30 step 7이 서술어 없이 끊던 물음만 「것은 무엇인가?」로 닫았다. 리드인은 여전히
    // 붙이지 않았다 — 이 문항은 상황 문장을 얹는 순간 정답이 드러나는 자리다. step 6이 q180에
    // 같은 판정을 적용했다.
    expect(prompts.q066).toBe('Aurora를 가장 잘 설명한 것은 무엇인가?')
    // phase 30 step 19가 q115의 한국어 문체만 다듬었다 — 「제공하며 … 보안성이 높은」으로
    // 서술 형태가 엇갈리던 나열을 개념 본문(hybrid-connectivity.direct-connect 문단 1)의
    // 「높은 보안성과 대역폭, 빠른 성능」 순서에 맞춰 하나로 묶고, 「통신 기반은?」을
    // 「통신 기반은 무엇인가?」로 닫았다. 리드인은 여전히 붙이지 않았다 — 상황 문장을 얹으면
    // 정답이 드러나는 자리다. step 6이 q180에, step 7이 q066에 같은 판정을 적용했다.
    expect(prompts.q115).toBe('높은 보안성과 대역폭, 빠른 성능을 함께 제공하는 Direct Connect의 통신 기반은 무엇인가?')
    // phase 30 step 23이 서술어 없이 끊던 물음만 「것은 무엇인가?」로 닫았다. 리드인은 여전히
    // 붙이지 않았다 — KMS가 무엇을 보관하는지 상황으로 세우면 그것이 곧 정답이다.
    // step 7이 q066에, step 18이 q226에 같은 판정을 적용했다.
    expect(prompts.q142).toBe('KMS가 저장하는 대상으로 알맞은 것은 무엇인가?')
    // phase 30 step 24가 서술어 없이 끊던 물음만 「계층은 무엇인가?」로 닫았다. 리드인은
    // 여전히 붙이지 않았다 — 어떤 공격을 막는지 상황으로 세우는 순간 그것이 곧 계층을
    // 가리킨다. step 7이 q066에, step 23이 q142에 같은 판정을 적용했다.
    expect(prompts.q147).toBe('WAF가 방어하는 공격이 속한 계층은 무엇인가?')
    // phase 30 step 6이 서술어 없이 끊던 물음만 「작업은 무엇인가?」로 닫았다. 리드인은 여전히
    // 붙이지 않았다 — 이 문항은 상황 문장을 얹는 순간 정답이 드러나는 자리다.
    expect(prompts.q180).toBe('RDS 다중 AZ 배포의 대기 인스턴스로 할 수 없는 작업은 무엇인가?')
    // q201은 출처에 구체적 사례가 없어 명사를 바꿀 수 없다. 사실을 지어내면 ADR-006·008·009 위반이다.
    // phase 30 step 14가 서술어 없이 끊던 물음만 「서비스는 무엇인가?」로 닫았다. 리드인은 여전히
    // 붙이지 않았다 — 상황 문장을 얹으려면 출처에 없는 사례를 지어내야 한다. step 6이 q180에,
    // step 7이 q066에 같은 판정을 적용했다.
    expect(prompts.q201).toBe('여러 작업을 한꺼번에 모아서 처리하는 데 적합한 서비스는 무엇인가?')
    // phase 30 step 18이 서술어 없이 끊던 물음만 「것은 무엇인가?」로 닫았다. 리드인은 여전히
    // 붙이지 않았다 — 두 ACL의 역할을 상황 문장으로 세우는 순간 그것이 곧 정답이 된다.
    // step 7이 q066에, step 14가 q201에 같은 판정을 적용했다.
    expect(prompts.q226).toBe('Web ACL과 네트워크 ACL의 역할을 올바르게 설명한 것은 무엇인가?')
  })

  it('phase 18이 제외했던 q114가 정답을 노출하지 않는 리드인을 받는다', () => {
    const question = questions.find(({ id }) => id === 'q114')

    // phase 30 step 19가 q114의 한국어 문체만 다듬었다 — 쉼표로 두 방식을 이어 붙여 62자가
    // 된 리드인을 방식마다 한 문장씩으로 끊고, 가리키는 대상이 흐리던 「이 둘의」를
    // 「이 두 방식의」로 밝힌 뒤 「공통 목적은?」을 「공통 목적은 무엇인가?」로 세웠다.
    // 아래 세 단언(120자 상한, 온프레미스 미포함, 보기 넷 미노출)은 그대로 지킨다 — 84자다.
    expect(question?.prompt).toBe('Site-to-Site VPN은 인터넷에 암호화 터널을 구성한다. Direct Connect는 전용선을 설치한다. 이 두 방식의 공통 목적은 무엇인가?')
    expect(question?.prompt.length).toBeLessThanOrEqual(120)
    // 리드인에 온프레미스가 들어가면 오답 세 개가 한꺼번에 소거된다.
    expect(question?.prompt).not.toContain('온프레미스')
    question?.choices.forEach((choice) => {
      expect(question.prompt).not.toContain(choice)
    })
  })

  it('개념 본문이 Lambda가 하는 일과 비용 할당 태그가 무엇인지 알려준다', () => {
    const concepts = topics.flatMap((topic) => topic.concepts)
    const lambda = concepts.find(({ id }) => id === 'lambda.lambda')
    const tag = concepts.find(({ id }) => id === 'cost-management.cost-allocation-tag-activation')

    expect(lambda?.paragraphs[0]).toContain('S3에 올라온 이미지를 리사이징하거나')
    expect(lambda?.paragraphs[0]).toContain('정해진 시각에 개발용 RDS를 켜고 끄는')
    expect(tag?.paragraphs[0]).toContain('리소스에 직접 붙이는 사용자 정의 태그로')
    expect(tag?.paragraphs[0]).toContain('부서별로 비용을 나눠 보는 데 쓴다')
  })

  it('개념 본문 보강이 요약과 문단 개수를 바꾸지 않는다', () => {
    const concepts = topics.flatMap((topic) => topic.concepts)
    const lambda = concepts.find(({ id }) => id === 'lambda.lambda')
    const tag = concepts.find(({ id }) => id === 'cost-management.cost-allocation-tag-activation')

    // ADR-010이 정한 편집 범위 — summary와 개념 구조는 건드리지 않는다.
    expect(lambda?.paragraphs).toHaveLength(3)
    expect(lambda?.summary).toBe('Lambda는 서버 운영을 AWS에 맡기고 개발자가 올린 코드만 실행하는 서비스다.')
    expect(tag?.paragraphs).toHaveLength(2)
    expect(tag?.summary).toBe('비용 할당 태그는 결제 콘솔에서 활성화해야 Cost Explorer에 보인다.')
  })

  it('오답만으로 소거되던 4문항이 정답과 같은 범주의 보기를 받는다', () => {
    const byId = Object.fromEntries(questions.map((question) => [question.id, question]))

    expect(byId.q034.choices).toEqual(['KMS', 'SSE', 'CloudHSM', 'ACM'])
    // 프롬프트는 phase 29가 두 번 다시 썼다. step 4가 「서버가 자체적으로 데이터를 암호화하는
    // 방식」을 뺐고(그것이 곧 Server Side Encryption의 뜻이라 정답이 프롬프트에 있었다),
    // step 7이 67자짜리 한 호흡을 「상황 → 무엇을 하는가 → 묻는 것」 세 문장으로 쪼갰다.
    // phase 30 step 1이 그 위에서 한국어 표현만 다시 다듬었다 — 사용자가 든 예 그대로
    // 「암호문으로 바꿔 둔다」를 「암호화된 상태로 보관한다」로 풀어 쓰고, 목적어에 「그」를 붙여
    // 앞 문장의 파일을 가리키게 했다. 보기는 세 번 다 그대로이고 정답 논리도 그대로다.
    expect(byId.q034.prompt).toBe('S3에 파일을 그대로 저장하면 보안 침해가 일어났을 때 공격자가 그 내용을 곧바로 확인할 수 있다. 그래서 저장하는 파일은 키를 사용해 암호화된 상태로 보관한다. 이러한 처리를 무엇이라고 부르는가?')
    expect(byId.q075.choices).toEqual(['Sticky Session', '대상 추적 정책', '예약 인스턴스', '예약된 조정'])
    expect(byId.q098.choices).toEqual(['AWS Backup', 'RDS 자동 백업', 'EBS 스냅샷', 'S3 버전 관리'])
    expect(byId.q164.choices).toEqual(['AWS Budgets', 'Cost Explorer', '온디맨드 인스턴스', '절약 플랜'])
  })

  it('보기를 고친 4문항의 정답 위치와 프롬프트가 그대로 유지된다', () => {
    const byId = Object.fromEntries(questions.map((question) => [question.id, question]))

    expect(byId.q034.answerIndex).toBe(1)
    expect(byId.q075.answerIndex).toBe(1)
    expect(byId.q098.answerIndex).toBe(0)
    expect(byId.q164.answerIndex).toBe(3)
    // 프롬프트가 보기를 꺼내면 오답이 소거된다.
    ;['q034', 'q075', 'q098', 'q164'].forEach((id) => {
      expect(byId[id].prompt.length).toBeLessThanOrEqual(120)
      byId[id].choices.forEach((choice) => {
        expect(byId[id].prompt).not.toContain(choice)
      })
    })
  })

  it('같은 범주 오답을 만들 수 없어 제외한 문항은 보기가 그대로다', () => {
    const byId = Object.fromEntries(questions.map((question) => [question.id, question]))

    // 출처에 같은 범주의 대체 항목이 없거나, 넣으면 정답이 애매해지는 문항들이다.
    expect(byId.q083.choices).toEqual(['Lambda', 'ECS', 'Step Functions', 'API Gateway'])
    expect(byId.q085.choices).toEqual(['Sticky Session', '대상 추적', '엣지 최적화', '콜드 스타트'])
    expect(byId.q100.choices).toEqual(['인터넷 게이트웨이', 'VPC 피어링', '서브넷', 'PrivateLink'])
    expect(byId.q175.choices).toEqual(['클러스터 배치 그룹', 'EFS 수명 주기 관리', 'EBS Elastic Volumes', 'FSx for NetApp ONTAP'])
  })

  it('q034의 오답이 서버 측 암호화의 하위 방식이 아니다', () => {
    const question = questions.find(({ id }) => id === 'q034')
    const wrongChoices = question?.choices.filter((_, index) => index !== question.answerIndex) ?? []

    expect(wrongChoices).toHaveLength(3)
    // SSE-S3·SSE-KMS·SSE-C는 모두 서버 측 암호화라 오답이 될 수 없다.
    wrongChoices.forEach((choice) => {
      expect(choice.startsWith('SSE')).toBe(false)
    })
  })

  it('SQS 개념의 잘못된 표기가 바로잡혀 있다', () => {
    const concept = topics
      .flatMap((topic) => topic.concepts)
      .find(({ id }) => id === 'sqs-sns-eventbridge.sqs-details')

    expect(concept?.summary).toContain('중복과 순서 뒤바뀜이 생길 수 있다')
    expect(concept?.paragraphs[1]).toContain('순서가 바뀔 수 있다')
    expect(concept?.paragraphs[1]).toContain('(Exactly-Once)" 처리가')
  })

  it('TCP와 UDP 풀이가 이름과 계층뿐 아니라 둘의 차이까지 알려준다', () => {
    const concept = topics
      .flatMap((topic) => topic.concepts)
      .find(({ id }) => id === 'elastic-load-balancing.elb')

    // ADR-046이 ALB를 첫 문단에서 떼어 목록 항목으로 세워 NLB 항목이 셋째 문단이 됐다.
    expect(concept?.paragraphs[2]).toContain('빠진 것은 다시 보낸다')
    expect(concept?.paragraphs[2]).toContain('일부가 유실될 수 있다')
  })

  it('CloudFront와 Global Accelerator의 갈림길이 추상적인 대비 대신 구체적인 기준으로 쓰인다', () => {
    const concept = topics
      .flatMap((topic) => topic.concepts)
      .find(({ id }) => id === 'cloudfront-global-accelerator.global-accelerator-protocols')

    // "캐싱할 콘텐츠인가, 가속할 연결인가"는 두 말을 이미 아는 사람에게만 읽힌다.
    expect(concept?.paragraphs[1]).not.toContain('가속할 연결인가')
    expect(concept?.paragraphs[1]).toContain('미리 복사해 둘 이미지나 파일이 있느냐')
  })

  it('용어 풀이를 더해도 개념 요약과 문단 개수는 그대로다', () => {
    const byId = Object.fromEntries(
      topics.flatMap((topic) => topic.concepts).map((concept) => [concept.id, concept]),
    )

    // ADR-010이 정한 편집 범위 — paragraphs 안에서만 문장을 손본다.
    // ADR-039가 대상 그룹 정의 문단을 더해 4가 됐고, ADR-046이 ALB를 첫 문단에서 떼어 목록 항목으로 세워 5가 됐다.
    // phase 13의 편집 범위 단언이었다.
    expect(byId['elastic-load-balancing.elb'].paragraphs).toHaveLength(5)
    expect(byId['elastic-load-balancing.sticky-session-tradeoff'].paragraphs).toHaveLength(2)
    expect(byId['cloudfront-global-accelerator.global-accelerator-protocols'].paragraphs).toHaveLength(2)
    expect(byId['cloudfront-global-accelerator.cloudfront-ttl'].paragraphs).toHaveLength(2)
    expect(byId['cloudfront-global-accelerator.cloudfront-ttl'].summary).toBe(
      'TTL이 만료되기 전에는 원본이 바뀌어도 엣지가 옛 파일을 계속 내보낸다.',
    )
  })

  // ADR-015 — 해설에 나오는 약어와 괄호로 붙일 풀네임.
  // AWS·DB·CPU·MB·KB·IP처럼 상식으로 통하는 약어와, API·URL·SSD처럼 제품이나 유형
  // 이름의 일부로만 쓰이는 약어는 대상이 아니다.
  const acronymFullNames: Record<string, string> = {
    S3: 'Simple Storage Service',
    EC2: 'Elastic Compute Cloud',
    RDS: 'Relational Database Service',
    KMS: 'Key Management Service',
    WAF: 'Web Application Firewall',
    NACL: 'Network Access Control List',
    ACL: 'Access Control List',
    IAM: 'Identity And Access Management',
    EBS: 'Elastic Block Store',
    EFS: 'Elastic File System',
    FSx: 'File System for Extended use',
    SQS: 'Simple Queue Service',
    SNS: 'Simple Notification Service',
    SES: 'Simple Email Service',
    DNS: 'Domain Name System',
    ACM: 'AWS Certificate Manager',
    ELB: 'Elastic Load Balancer',
    ALB: 'Application Load Balancer',
    NLB: 'Network Load Balancer',
    GLB: 'Gateway Load Balancer',
    DDoS: 'Distributed Denial of Service',
    DRT: 'DDoS Response Team',
    STS: 'Security Token Service',
    SSE: 'Server Side Encryption',
    JWT: 'JSON Web Token',
    DAX: 'DynamoDB Accelerator',
    PITR: 'Point-in-Time Recovery',
    CDN: 'Content Delivery Network',
    EMR: 'Elastic MapReduce',
    XSS: 'Cross-Site Scripting',
    MFA: 'Multi-Factor Authentication',
    TTL: 'Time-to-Live',
    EKS: 'Elastic Kubernetes Service',
    MSK: 'Managed Streaming for Apache Kafka',
    CVE: 'Common Vulnerabilities and Exposures',
    NFS: 'Network File System',
    AZ: 'Availability Zone',
    IA: 'Infrequent Access',
    FTP: 'File Transfer Protocol',
    SFTP: 'SSH File Transfer Protocol',
    FTPS: 'File Transfer Protocol Secure',
    HTTP: 'HyperText Transfer Protocol',
    HTTPS: 'HyperText Transfer Protocol Secure',
    TCP: 'Transmission Control Protocol',
    UDP: 'User Datagram Protocol',
    SSL: 'Secure Sockets Layer',
    TLS: 'Transport Layer Security',
    VPN: 'Virtual Private Network',
    NAT: 'Network Address Translation',
    SMB: 'Server Message Block',
    SQL: 'Structured Query Language',
    RDBMS: 'Relational Database Management System',
    CIDR: 'Classless Inter-Domain Routing',
    REST: 'Representational State Transfer',
    FIFO: 'First In First Out',
    ETL: 'Extract, Transform, Load',
    IOPS: 'Input/Output Operations Per Second',
    HPC: 'High Performance Computing',
    VPC: 'Virtual Private Cloud',
    ECS: 'Elastic Container Service',
    OAC: 'Origin Access Control',
    SCP: 'Service Control Policy',
  }

  // 풀네임이 서로를 품는 묶음. 한 해설에서 먼저 나온 하나만 풀어야 되풀이가 생기지 않는다.
  const acronymFamilies = [
    ['HTTP', 'HTTPS'],
    ['FTP', 'SFTP', 'FTPS'],
  ]

  // 괄호 안에 든 약어는 이미 다른 풀이의 일부이므로 대상이 아니다.
  function usedOutsideParens(text: string, acronym: string) {
    const pattern = new RegExp(`(?<![A-Za-z0-9-])${acronym}(?![A-Za-z0-9-])`, 'g')

    return [...text.matchAll(pattern)].some(({ index }) => {
      const before = text.slice(0, index)

      return before.split('(').length === before.split(')').length
    })
  }

  it('해설에 나오는 약어가 풀네임을 괄호로 달고 나온다', () => {
    const singles = Object.keys(acronymFullNames)
      .filter((acronym) => !acronymFamilies.some((family) => family.includes(acronym)))
      .map((acronym) => [acronym])
    const groups = [...acronymFamilies, ...singles]

    questions.forEach((question) => {
      groups.forEach((family) => {
        if (!family.some((acronym) => usedOutsideParens(question.explanation, acronym))) return

        const glossed = family.some((acronym) =>
          question.explanation.includes(`${acronym}(${acronymFullNames[acronym]})`),
        )

        expect(glossed ? '' : `${question.id}에 ${family.join('/')} 풀이 없음`).toBe('')
      })
    })
  })

  it('한 해설에서 같은 약어를 두 번 풀지 않는다', () => {
    questions.forEach((question) => {
      Object.entries(acronymFullNames).forEach(([acronym, fullName]) => {
        const gloss = `${acronym}(${fullName})`

        expect(question.explanation.split(gloss).length - 1).toBeLessThanOrEqual(1)
      })
    })
  })

  it('상식으로 통하는 약어와 제품 이름 속 약어는 해설에서 풀지 않는다', () => {
    const allExplanations = questions.map(({ explanation }) => explanation).join(' ')

    const outOfScope = [
      'Amazon Web Services',
      'Central Processing Unit',
      'Internet Protocol',
      'Uniform Resource Locator',
      'Solid State Drive',
    ]

    outOfScope.forEach((fullName) => {
      expect(allExplanations).not.toContain(fullName)
    })
  })

  it('풀이가 그 약어의 첫 등장 자리에 붙는다', () => {
    const byId = Object.fromEntries(questions.map((question) => [question.id, question]))

    expect(byId.q130.explanation).toBe(
      'NACL(Network Access Control List)은 서브넷 경계에 붙어 그 서브넷을 지나는 트래픽을 허용하거나 거부한다. 기본 상태에서는 인바운드와 아웃바운드가 모두 허용이고 필요에 따라 허용 규칙과 차단 규칙을 함께 넣을 수 있어서, 서브넷 단위로 여닫는다는 조건이 이것을 가리킨다. 보안 그룹은 통제하는 자리가 서브넷이 아니라 개별 리소스이고 허용 규칙만 추가할 수 있어 거부를 표현하지 못한다. WAF(Web Application Firewall)는 웹 요청의 내용을 살펴 애플리케이션 계층 공격을 막는 장치라 서브넷을 다루지 않는다. 인터넷 게이트웨이는 VPC(Virtual Private Cloud)와 외부 인터넷 사이에 통신 경로를 마련하는 것이지, 규칙으로 트래픽을 걸러 내는 기능이 아니다.',
    )
    expect(byId.q080.explanation).toBe(
      'NLB(Network Load Balancer)는 4계층, 곧 전송 계층에서 동작하는 로드 밸런서라 TCP(Transmission Control Protocol)와 UDP(User Datagram Protocol) 트래픽을 모두 다루며 매우 빠른 응답 속도를 준다. TCP는 보낸 데이터가 빠짐없이 도착했는지 확인하고 빠진 것은 다시 보내며, UDP는 그 확인을 생략해 더 빠른 대신 일부가 유실될 수 있다. 두 규약을 다 받아야 한다는 조건이 이 로드 밸런서를 가리킨다. ALB(Application Load Balancer)는 7계층에서 HTTP(HyperText Transfer Protocol)와 HTTPS 웹 요청을 다루는 장치라 TCP·UDP를 지원하지 않는다. GLB(Gateway Load Balancer)는 방화벽 같은 보안 장비에 트래픽을 넘기는 용도다. CloudFront는 로드 밸런서가 아니라 콘텐츠를 엣지에 캐싱해 내주는 서비스다.',
    )
  })

  // ADR-019. 표기와 배치의 근거는 docs/source/service-categories.md 하나뿐이다.
  const categories = {
    compute: '컴퓨팅(Compute)',
    containers: '컨테이너(Containers)',
    storage: '스토리지(Storage)',
    databases: '데이터베이스(Databases)',
    analytics: '분석(Analytics)',
    networking: '네트워킹 및 콘텐츠 전송(Networking and Content Delivery)',
    appIntegration: '애플리케이션 통합(Application Integration)',
    management: '관리 및 거버넌스(Management and Governance)',
    security: '보안·자격 증명·규정 준수(Security, Identity, and Compliance)',
    migration: '마이그레이션 및 전송(Migration and Transfer)',
    finance: '클라우드 재무 관리(Cloud Financial Management)',
    devTools: '개발자 도구(Developer Tools)',
    business: '비즈니스 애플리케이션(Business Applications)',
    // ADR-022로 더한 둘. phase 26 step 20이 ai-ml-services와 Amplify를 만들며 썼다.
    machineLearning: '기계 학습(Machine Learning and Artificial Intelligence)',
    frontend: '프런트엔드 웹 및 모바일(Front-end Web and Mobile)',
  } as const

  // 절약 플랜만 서술이 다르다. 백서가 서비스가 아니라 pricing model로 소개하기 때문이다.
  const predicateExceptions: Record<string, string> = {
    'cost-management.savings-plan': '쪽에 속한다',
  }

  const serviceCategories: Array<[string, string, keyof typeof categories]> = [
    ['aws-core-services.ec2', 'EC2는', 'compute'],
    ['aws-core-services.rds', 'RDS는', 'databases'],
    ['aws-core-services.s3', 'S3는', 'storage'],
    ['aws-core-services.route-53', 'Route 53은', 'networking'],
    ['aws-core-services.elb', 'ELB는', 'networking'],
    ['aws-core-services.cloudfront', 'CloudFront는', 'networking'],
    ['aws-core-services.lambda', 'Lambda는', 'compute'],
    ['ebs-instance-store.ebs', 'EBS는', 'storage'],
    ['efs-fsx.efs', 'EFS는', 'storage'],
    ['efs-fsx.fsx', 'FSx는', 'storage'],
    ['data-transfer-services.datasync', 'DataSync는', 'migration'],
    ['data-transfer-services.snowball-edge', 'Snowball Edge는', 'migration'],
    ['data-transfer-services.transfer-family', 'Transfer Family는', 'migration'],
    ['storage-gateway-migration.storage-gateway', 'Storage Gateway는', 'storage'],
    // phase 26 step 5. DMS와 SCT는 한 개념이 둘을 함께 소개하므로 주어도 함께 적는다.
    ['storage-gateway-migration.dms-sct', 'DMS와 SCT는', 'migration'],
    ['storage-gateway-migration.application-migration-service', 'Application Migration Service는', 'migration'],
    ['rds-storage-features.rds', 'RDS는', 'databases'],
    ['aurora.aurora', 'Aurora는', 'databases'],
    ['dynamodb.dynamodb', 'DynamoDB는', 'databases'],
    ['elasticache-purpose-built-db.elasticache', 'ElastiCache는', 'databases'],
    ['elasticache-purpose-built-db.documentdb', 'DocumentDB는', 'databases'],
    // phase 26 step 7. QLDB는 백서에도 보조 출처에도 카테고리가 없어 붙이지 않는다
    // (docs/source/service-categories.md "카테고리 없음").
    ['elasticache-purpose-built-db.neptune', 'Neptune은', 'databases'],
    ['elasticache-purpose-built-db.timestream', 'Timestream은', 'databases'],
    ['ec2-autoscaling.ec2', 'EC2는', 'compute'],
    // phase 26 step 8. GWLB는 ELB 계열의 한 종류라 별도 항목이 아니고,
    // ASG 개념들은 서비스를 소개하는 자리가 아니라 갈림길·한계 개념이라 붙이지 않는다
    // (docs/source/service-categories.md "카테고리 문장을 붙이지 않는 개념").
    ['ec2-autoscaling.ec2-image-builder', 'EC2 Image Builder는', 'compute'],
    ['elastic-load-balancing.elb', 'ELB는', 'networking'],
    ['cloudfront-global-accelerator.cloudfront', 'CloudFront는', 'networking'],
    ['cloudfront-global-accelerator.global-accelerator', 'Global Accelerator는', 'networking'],
    // phase 26 step 10이 Lambda를 자기 주제로 빼냈다. 신규 15개념은 전부 Lambda의
    // 기능·설정·한계·갈림길이라 카테고리 한 줄을 붙이지 않는다
    // (docs/source/service-categories.md "카테고리 문장을 붙이지 않는 개념").
    ['lambda.lambda', 'Lambda는', 'compute'],
    // phase 26 step 11이 serverless-containers를 둘로 갈랐다. 신규 34개념 중 셋만
    // 서비스를 소개하는 자리이고, 나머지는 ECS·EKS·Fargate·API Gateway·Step Functions의
    // 기능·설정·한계·갈림길이라 카테고리 한 줄을 붙이지 않는다
    // (docs/source/service-categories.md "카테고리 문장을 붙이지 않는 개념").
    ['ecs-eks-fargate.ecs', 'ECS는', 'containers'],
    ['ecs-eks-fargate.eks', 'EKS는', 'containers'],
    ['ecs-eks-fargate.ecr-image-scan-on-push', 'ECR은', 'containers'],
    ['ecs-eks-fargate.aws-batch', 'AWS Batch는', 'compute'],
    // 백서 카테고리가 이 앱의 주제 배치와 갈리는 자리다. 주제는 옮기지 않고
    // 카테고리만 밝힌다(service-categories.md "주제 배치와 어긋나는 자리").
    ['ecs-eks-fargate.elastic-beanstalk', 'Elastic Beanstalk는', 'compute'],
    ['ecs-eks-fargate.app2container', 'App2Container는', 'containers'],
    ['api-gateway-step-functions.api-gateway', 'API Gateway는', 'networking'],
    ['api-gateway-step-functions.step-functions', 'Step Functions는', 'appIntegration'],
    // phase 26 step 12가 messaging-backup의 메시징 계열을 빼냈다. 신규 26개념 중
    // Amazon MQ만 서비스를 소개하는 자리이고, 나머지는 SQS·SNS·EventBridge·SES의
    // 기능·설정·한계·갈림길이라 카테고리 한 줄을 붙이지 않는다
    // (docs/source/service-categories.md "카테고리 문장을 붙이지 않는 개념").
    ['sqs-sns-eventbridge.sqs', 'SQS는', 'appIntegration'],
    ['sqs-sns-eventbridge.sns', 'SNS는', 'appIntegration'],
    ['sqs-sns-eventbridge.eventbridge', 'EventBridge는', 'appIntegration'],
    ['sqs-sns-eventbridge.amazon-mq', 'Amazon MQ는', 'appIntegration'],
    // 백서 카테고리가 이 앱의 주제 배치와 갈리는 자리다(service-categories.md
    // "주제 배치와 어긋나는 자리").
    ['sqs-sns-eventbridge.ses', 'SES는', 'business'],
    // phase 26 step 13이 AWS Backup 계열과 재해 복구 계열을 자기 주제로 빼냈다. 신규
    // 9개념 중 DRS만 서비스를 소개하는 자리이고, Backup Audit Manager는 이미 표에 있는
    // AWS Backup의 기능이며 나머지는 백업 계획의 설정·갈림길과 DR 전략이라 카테고리
    // 한 줄을 붙이지 않는다
    // (docs/source/service-categories.md "카테고리 문장을 붙이지 않는 개념").
    ['backup-disaster-recovery.backup', 'AWS Backup은', 'storage'],
    // 백서 카테고리가 이 앱의 주제 배치와 갈리는 자리다(service-categories.md
    // "주제 배치와 어긋나는 자리").
    ['backup-disaster-recovery.elastic-disaster-recovery', 'Elastic Disaster Recovery는', 'storage'],
    // phase 26 step 14가 세 네트워크 주제에 신규 21개념을 더했다. 그중 하나만
    // 서비스를 소개하는 자리이고, 나머지는 NAT 게이트웨이·VPC 엔드포인트·보안 그룹·
    // NACL·Direct Connect 같은 기능·설정·한계·갈림길이라 카테고리 한 줄을 붙이지 않는다
    // (docs/source/service-categories.md "카테고리 문장을 붙이지 않는 개념").
    ['vpc-networking.vpc-subnet', 'VPC는', 'networking'],
    ['vpc-networking.privatelink', 'PrivateLink는', 'networking'],
    ['hybrid-connectivity.site-to-site-vpn', 'Site-to-Site VPN은', 'networking'],
    ['hybrid-connectivity.direct-connect', 'Direct Connect는', 'networking'],
    ['hybrid-connectivity.transit-gateway', 'Transit Gateway는', 'networking'],
    ['hybrid-connectivity.client-vpn', 'Client VPN은', 'networking'],
    // Local Zones·Outposts·Wavelength를 소개하는 자리가 이 개념 하나뿐이라 셋의 주어를
    // 함께 적는다. storage-gateway-migration.dms-sct와 같은 방식이다.
    ['hybrid-connectivity.region-attached-edge-options', 'Local Zones·Outposts·Wavelength는', 'compute'],
    ['route53.route53', 'Route53은', 'networking'],
    // phase 26 step 15가 analytics-monitoring의 분석·스트리밍 계열을 세 주제로 갈랐다.
    // 신규 36개념 중 Lake Formation·Kinesis Video Streams·QuickSight·OpenSearch 넷만
    // 서비스를 소개하는 자리이고, 나머지는 EMR·Glue·Athena·Kinesis·Redshift의 기능·설정·한계·
    // 갈림길이라 카테고리 한 줄을 붙이지 않는다
    // (docs/source/service-categories.md "카테고리 문장을 붙이지 않는 개념").
    // Glue DataBrew는 그 파일의 "카테고리 없음"에 있어 붙일 근거가 없다.
    ['emr-glue-athena.emr', 'EMR은', 'analytics'],
    ['emr-glue-athena.glue', 'Glue는', 'analytics'],
    ['emr-glue-athena.athena', 'Athena는', 'analytics'],
    ['emr-glue-athena.lake-formation', 'Lake Formation은', 'analytics'],
    ['kinesis-streaming.kinesis-data-streams', 'Kinesis Data Streams는', 'analytics'],
    ['kinesis-streaming.data-firehose', 'Data Firehose는', 'analytics'],
    ['kinesis-streaming.managed-service-apache-flink', 'Managed Service for Apache Flink는', 'analytics'],
    ['kinesis-streaming.kinesis-video-streams', 'Kinesis Video Streams는', 'analytics'],
    ['kinesis-streaming.msk', 'MSK는', 'analytics'],
    ['redshift-opensearch-quicksight.redshift', 'RedShift는', 'analytics'],
    // step 15는 이 한 줄을 붙이지 않았다. service-categories.md가 OpenSearch를
    // "붙이지 않는 예"로 적어 두었기 때문인데, 그 예는 phase 26 이전에 OpenSearch를 단
    // 개념이 비교뿐이었을 때 쓴 것이다. step 15가 서비스를 소개하는 개념을 새로 들여왔으므로
    // 그 파일의 매핑 표에 OpenSearch를 넣고 여기에도 붙인다(백서 분석, 2026-09-07 확인).
    ['redshift-opensearch-quicksight.opensearch-text-search', 'OpenSearch는', 'analytics'],
    ['redshift-opensearch-quicksight.quicksight', 'QuickSight는', 'analytics'],
    // step 16이 남은 CloudWatch·X-Ray 계열을 cloudwatch-xray로 옮기며
    // analytics-monitoring을 없앴다. 신규 7개념 중 서비스를 소개하는 자리는
    // Managed Grafana 하나뿐이다 — Network Monitor·Container Insights는 CloudWatch의
    // 기능이라 그 파일의 기준 2가 덮고, 나머지는 지표의 한계·판단 근거다.
    ['cloudwatch-xray.cloudwatch', 'CloudWatch는', 'management'],
    ['cloudwatch-xray.x-ray', 'X-Ray는', 'devTools'],
    ['cloudwatch-xray.amazon-managed-grafana', 'Managed Grafana는', 'management'],
    ['secrets-encryption.secrets-manager', 'Secrets Manager는', 'security'],
    ['secrets-encryption.parameter-store', 'Parameter Store는', 'management'],
    ['secrets-encryption.kms', 'KMS는', 'security'],
    ['secrets-encryption.acm', 'ACM은', 'security'],
    ['secrets-encryption.cloudhsm', 'CloudHSM은', 'security'],
    // phase 26 step 18이 threat-protection을 둘로 갈랐다. 신규 15개념 중 서비스를
    // 소개하는 자리는 셋뿐이다 — 나머지는 WAF 규칙·Shield 계층·Macie 설정 같은
    // 기능·설정·한계·갈림길이라 카테고리 한 줄을 붙이지 않는다
    // (docs/source/service-categories.md "카테고리 문장을 붙이지 않는 개념").
    ['waf-shield.waf', 'WAF는', 'security'],
    ['waf-shield.shield', 'Shield는', 'security'],
    ['waf-shield.cloudfront', 'CloudFront는', 'networking'],
    ['waf-shield.firewall-manager', 'Firewall Manager는', 'security'],
    ['guardduty-macie-inspector.guardduty', 'GuardDuty는', 'security'],
    ['guardduty-macie-inspector.macie', 'Macie는', 'security'],
    ['guardduty-macie-inspector.amazon-inspector', 'Inspector는', 'security'],
    ['guardduty-macie-inspector.security-hub', 'Security Hub는', 'security'],
    ['iam-permissions.iam', 'IAM은', 'security'],
    ['identity-federation.identity-center', 'AWS IAM Identity Center는', 'security'],
    ['identity-federation.sts', 'STS는', 'security'],
    ['identity-federation.cognito', 'Cognito는', 'security'],
    // phase 26 step 17. Directory Service는 AD Connector와 함께 한 개념에서 소개된다.
    ['identity-federation.aws-directory-service', 'Directory Service는', 'security'],
    ['organizations-cloudtrail-config.cloudtrail', 'CloudTrail은', 'management'],
    ['organizations-cloudtrail-config.aws-config', 'AWS Config는', 'management'],
    ['organizations-cloudtrail-config.organizations-scp', 'AWS Organizations는', 'management'],
    // service-categories.md "주제 배치와 어긋나는 자리" — 주제는 조직·감사 쪽이고
    // 카테고리는 보안이다.
    ['organizations-cloudtrail-config.audit-manager', 'Audit Manager는', 'security'],
    ['cost-management.savings-plan', '절약 플랜은', 'finance'],
    ['cost-management.aws-budgets', 'AWS Budgets는', 'finance'],
    ['cost-management.cost-explorer', 'Cost Explorer는', 'finance'],
    ['cost-management.billing-and-cost-management', 'Billing and Cost Management는', 'finance'],
    ['cost-management.trusted-advisor', 'Trusted Advisor는', 'management'],
    ['cost-management.compute-optimizer', 'Compute Optimizer는', 'management'],
    ['cost-management.cost-anomaly-detection', 'Cost Anomaly Detection은', 'finance'],
    ['cost-management.cost-and-usage-report', 'Cost and Usage Report는', 'finance'],
    // phase 26 step 19. Control Tower와 Systems Manager는 그 서비스를 소개하는 개념
    // 하나에만 붙인다(service-categories.md "phase 26에서 들어오는 서비스").
    ['governance-iac.cloudformation', 'CloudFormation은', 'management'],
    ['governance-iac.service-catalog', 'Service Catalog는', 'management'],
    ['governance-iac.control-tower-landing-zone', 'Control Tower는', 'management'],
    // service-categories.md "주제 배치와 어긋나는 자리" — 주제는 거버넌스 쪽이고
    // 카테고리는 보안이다.
    ['governance-iac.resource-access-manager', 'Resource Access Manager는', 'security'],
    ['systems-manager.ssm-run-command', 'Systems Manager는', 'management'],
    // phase 26 step 20. ADR-022가 넓힌 두 종이 여기서 처음 쓰인다.
    // service-categories.md "주제 배치와 어긋나는 자리" — Amplify의 주제는 API 쪽이고
    // 카테고리는 프런트엔드다.
    ['api-gateway-step-functions.amplify', 'Amplify는', 'frontend'],
    ['ai-ml-services.sagemaker', 'SageMaker AI는', 'machineLearning'],
    // 한 개념이 서비스 넷을 함께 소개하므로 주어도 함께 적는다.
    [
      'ai-ml-services.media-ai-service-lineup',
      'Transcribe·Rekognition·Translate·Textract는',
      'machineLearning',
    ],
    ['ai-ml-services.comprehend', 'Comprehend는', 'machineLearning'],
    ['ai-ml-services.amazon-lex', 'Lex는', 'machineLearning'],
  ]

  it('서비스 개념 107개가 AWS 공식 카테고리 한 줄로 시작한다', () => {
    const byConceptId = Object.fromEntries(
      topics.flatMap((topic) => topic.concepts).map((concept) => [concept.id, concept]),
    )

    expect(serviceCategories).toHaveLength(107)

    serviceCategories.forEach(([conceptId, subject, key]) => {
      const concept = byConceptId[conceptId]
      const predicate = predicateExceptions[conceptId] ?? '쪽 서비스다'

      expect(concept).toBeDefined()
      expect(concept.paragraphs[0]).toContain(
        `${subject} AWS 분류로는 ${categories[key]} ${predicate}.`,
      )
      expect(concept.paragraphs[0].startsWith(`${subject} AWS 분류로는`)).toBe(true)
    })
  })

  it('카테고리 문장이 그 107개 개념의 본문에만 한 번씩 들어간다', () => {
    const concepts = topics.flatMap((topic) => topic.concepts)
    const marker = 'AWS 분류로는'
    const holders = concepts.filter((concept) =>
      concept.paragraphs.some((paragraph) => paragraph.includes(marker)),
    )

    expect(holders.map(({ id }) => id).sort()).toEqual(
      serviceCategories.map(([conceptId]) => conceptId).sort(),
    )

    holders.forEach((concept) => {
      const carrying = concept.paragraphs.filter((paragraph) => paragraph.includes(marker))
      expect(carrying).toHaveLength(1)
    })

    concepts.forEach((concept) => {
      expect(concept.summary).not.toContain(marker)
      expect(concept.name).not.toContain(marker)
    })
  })

  it('카테고리 표기가 백서의 15종을 벗어나지 않는다', () => {
    const declared = Object.values(categories)
    const used = new Set(serviceCategories.map(([, , key]) => categories[key]))

    // ADR-022. 선언한 15종 밖의 표기를 쓰지 않는지만 본다. 등식이 아닌 이유는
    // 선언만 해 두고 아직 안 쓰는 상태를 허용하기 위해서다.
    expect(declared).toHaveLength(15)
    used.forEach((name) => expect(declared).toContain(name))
  })

  it('카테고리 문장이 문항 프롬프트나 해설로 새지 않는다', () => {
    questions.forEach((question) => {
      expect(question.prompt).not.toContain('AWS 분류로는')
      expect(question.explanation).not.toContain('AWS 분류로는')
    })
  })
})

describe('q614 — 프라이빗 호스팅 영역 제안을 판단하는 문항', () => {
  it('상황을 살린 판단형으로, 정답이 VPC에만 연결된다는 사실이다', () => {
    const question = questions.find((item) => item.id === 'q614')
    if (!question) throw new Error('q614가 없다')

    expect(question.conceptId).toBe('route53.private-hosted-zone-vpc-only')
    expect(question.prompt).toContain('db.corp.local')
    expect(question.prompt).toContain('온프레미스 네트워크에 연결')
    expect(question.choices[question.answerIndex]).toContain('VPC에만 연결')

    question.choices.forEach((choice) => {
      expect(choice.startsWith('적절하다.') || choice.startsWith('부적절하다.')).toBe(true)
    })
    expect(question.choices.filter((choice) => choice.startsWith('적절하다.'))).toHaveLength(1)

    expect(JSON.stringify(questions)).not.toContain('corp.example.local')
    expect(JSON.stringify(topics)).not.toContain('corp.example.local')
  })
})

describe('ADR-039 — 레코드·호스팅 영역·대상 그룹의 정의', () => {
  const byId = Object.fromEntries(
    topics.flatMap((topic) => topic.concepts).map((concept) => [concept.id, concept]),
  )

  it('Route 53 개념이 호스팅 영역·레코드·라우팅 정책을 정의한다', () => {
    const concept = byId['route53.route53']

    expect(concept.paragraphs).toHaveLength(2)
    expect(concept.paragraphs[0].startsWith('Route53은')).toBe(true)
    expect(concept.paragraphs[1]).toContain('**호스팅 영역**(hosted zone)')
    expect(concept.paragraphs[1]).toContain('**레코드**(record)')
    expect(concept.paragraphs[1]).toContain('라우팅 정책')
  })

  it('별칭 레코드 개념이 대상 그룹을 처음 쓰는 자리 앞에서 풀이한다', () => {
    const concept = byId['route53.route53-alias-record']
    const first = concept.paragraphs[0]
    const gloss = first.indexOf('**대상 그룹**(target group)은 로드 밸런서가 요청을 넘길')

    expect(concept.paragraphs).toHaveLength(2)
    expect(gloss).toBeGreaterThanOrEqual(0)
    // ADR-029 — 주제 안에서 처음 나오는 자리에서 풀이한다.
    expect(gloss).toBeLessThan(first.indexOf('대상 그룹이 인스턴스 등록을 맡으므로'))
  })

  it('ELB 개념의 다섯째 문단이 대상 그룹을 정의한다', () => {
    const concept = byId['elastic-load-balancing.elb']

    // ADR-046이 ALB·NLB·GLB를 목록 항목으로 세웠다. 대상 그룹 문단은 목록 뒤 마지막 문단이다.
    expect(concept.paragraphs).toHaveLength(5)
    expect(
      concept.paragraphs[4].startsWith('로드 밸런서가 요청을 넘길 곳은 **대상 그룹**(target group)'),
    ).toBe(true)
    expect(concept.paragraphs[4]).toContain('상태 검사도 대상 그룹마다')
  })

  it('세 개념의 요약은 그대로다', () => {
    // ADR-010 — 풀이는 paragraphs에만 들어간다.
    expect(byId['route53.route53'].summary).toBe(
      'Route 53은 도메인 이름을 IP 주소로 바꾸고 트래픽의 전달 방향을 정한다.',
    )
    expect(byId['route53.route53-alias-record'].summary).toBe(
      '도메인 이름을 ALB 같은 AWS 리소스에 직접 겨누는 레코드라, 뒤에 있는 인스턴스가 바뀌어도 DNS를 고칠 일이 없다.',
    )
    expect(byId['elastic-load-balancing.elb'].summary).toBe(
      'ELB는 들어오는 트래픽을 여러 서버에 자동으로 나눠 보내는 서비스다.',
    )
  })
})

describe('ADR-039 확장 — Lambda 동시 실행 수와 예약된 동시성', () => {
  const byId = Object.fromEntries(
    topics.flatMap((topic) => topic.concepts).map((concept) => [concept.id, concept]),
  )
  const questionById = Object.fromEntries(questions.map((question) => [question.id, question]))

  it('예약된 동시성의 요약이 무엇에서 확보하는지 밝힌다', () => {
    expect(byId['lambda.lambda-reserved-concurrency'].summary).toBe(
      '예약된 동시성은 계정의 동시 실행 한도 가운데 일부를 한 함수 전용으로 확보하는 값이고, 실행 환경을 미리 초기화해 두는 것은 프로비저닝된 동시성이다.',
    )
  })

  it('첫 문단이 동시 실행 수와 계정 한도를 세운 뒤 예약된 동시성을 정의한다', () => {
    const concept = byId['lambda.lambda-reserved-concurrency']

    expect(concept.paragraphs).toHaveLength(3)
    expect(concept.paragraphs[0].startsWith('Lambda의 **동시 실행 수**(concurrency)는')).toBe(true)
    expect(concept.paragraphs[0]).toContain('**예약된 동시성**(reserved concurrency)은')
    expect(concept.paragraphs[0]).toContain('리전마다 동시 실행 한도')
    expect(concept.paragraphs[0]).toContain('요청을 동시에 100건까지 처리할 수 있다')
    expect(concept.paragraphs[0]).toContain('남은 900만 나눠 쓴다')
    expect(concept.paragraphs[1]).toContain('실행 환경은 요청이 온 뒤에 만든다')
    expect(concept.paragraphs[1]).toContain('콜드 스타트는 그대로 남는다')
    expect(concept.paragraphs[2]).toBe(
      '피크 시간대에도 **일관되게 낮은 지연이 필요하면 프로비저닝된 동시성**을 쓴다. 예약된 동시성으로는 그 조건을 채울 수 없다.',
    )
  })

  it('예약된 동시성 개념에 「떼어」가 남지 않는다', () => {
    const concept = byId['lambda.lambda-reserved-concurrency']

    expect(concept.summary).not.toContain('떼어')
    concept.paragraphs.forEach((paragraph) => {
      expect(paragraph).not.toContain('떼어')
    })
  })

  it('네 해설이 계정 한도에서 확보한다고 쓰고 정답은 그대로다', () => {
    const expectedAnswers: Record<string, number> = { q086: 0, q494: 1, q495: 2, q496: 0 }

    Object.entries(expectedAnswers).forEach(([id, answerIndex]) => {
      const question = questionById[id]

      expect(question.explanation).toContain('계정의 동시 실행 한도 가운데 일부를 그 함수 전용으로 확보')
      expect(question.explanation).not.toContain('떼어')
      expect(question.answerIndex).toBe(answerIndex)
    })
  })

  it('API Gateway 엔드포인트 개념이 예약된 동시성을 한도를 늘리는 설정으로 쓰지 않는다', () => {
    const body = byId['api-gateway-step-functions.api-gateway-endpoint-types'].paragraphs.join(' ')

    expect(body).not.toContain('감당하는 양을 늘리는')
    expect(body).toContain('그 함수가 요청을 동시에 몇 건까지 처리할지를 정해 두는 설정')
  })
})

describe('ADR-039 확장 — 권한 세트가 만드는 IAM 역할과 SCP의 관리 계정 예외', () => {
  const byId = Object.fromEntries(
    topics.flatMap((topic) => topic.concepts).map((concept) => [concept.id, concept]),
  )

  it('권한 세트의 기존 문단과 요약을 유지하고 둘째 문단에 IAM 역할 생성과 접근을 설명한다', () => {
    const concept = byId['identity-federation.identity-center-permission-set']

    expect(concept.paragraphs).toHaveLength(3)
    expect(concept.paragraphs[0]).toBe(
      '권한 세트는 사용자가 대상 계정에서 무엇을 할 수 있는지를 묶어 정의한 것이다. 사용자 개개인이 아니라 그룹에 할당하고, 그 그룹이 어느 계정에 접근할지를 정한다. 계정마다 IAM 사용자와 정책을 따로 만들지 않고도 팀 단위 접근이 서는 것이 이 구조 덕분이다.',
    )
    expect(concept.paragraphs[1]).toBe(
      '권한 세트를 계정에 할당하면 IAM Identity Center가 그 계정 안에 IAM 역할을 만들고, 권한 세트에 담긴 정책을 그 역할에 붙인다. 사용자는 AWS 접근 포털이나 CLI에서 이 역할을 맡아 그 계정에 들어간다. 할당하지 않은 계정에는 이 역할이 생기지 않는다. 권한 세트를 고치면 Identity Center가 이미 만든 역할도 함께 고친다.',
    )
    expect(concept.paragraphs[2]).toBe(
      '최소 권한 원칙이 조건으로 붙을 때 권한 세트가 답이 되는 이유는, 넓은 권한을 상시로 주는 대신 필요한 만큼만 담은 권한 세트를 여러 개 만들어 나눠 줄 수 있기 때문이다. 이미 IAM Identity Center를 쓰고 있는 환경이라면 IAM 사용자·역할을 새로 만드는 쪽은 중복이 된다.',
    )
    expect(concept.summary).toBe(
      'AWS IAM Identity Center가 계정에 권한을 부여하는 단위이며, 그룹에 할당해 최소 권한을 적용한다.',
    )
  })

  it('SCP 적용 범위의 첫 문단에 관리 계정 예외를 밝히고 문단 수를 유지한다', () => {
    const concept = byId['organizations-cloudtrail-config.scp-attachment-targets']

    expect(concept.paragraphs).toHaveLength(2)
    expect(concept.paragraphs[0]).toBe(
      'SCP를 붙일 수 있는 자리가 조직 단위(OU)만은 아니다. 조직의 루트, OU, 그리고 개별 멤버 계정에 연결할 수 있고 연결한 자리 아래에만 적용된다. 다만 관리 계정은 예외다. SCP는 멤버 계정에만 걸리고, 루트에 붙여도 관리 계정의 사용자와 역할은 제한하지 않는다.',
    )
  })

  it('q718의 정답 위치를 유지하고 정답 보기와 해설의 적용 대상을 멤버 계정으로 한정한다', () => {
    const question = questions.find((item) => item.id === 'q718')
    if (!question) throw new Error('q718이 없다')

    expect(question.answerIndex).toBe(1)
    expect(question.choices[1]).toContain('조직의 모든 멤버 계정이 걸린다')
    question.choices.forEach((choice) => {
      expect(choice).not.toContain('조직의 모든 계정이')
    })
    expect(question.explanation).toContain('제한할 생각이 없던 멤버 계정까지')
  })
})

describe('ADR-039 확장 — CloudFormation의 템플릿·스택·드리프트', () => {
  const byId = Object.fromEntries(
    topics.flatMap((topic) => topic.concepts).map((concept) => [concept.id, concept]),
  )
  const questionById = Object.fromEntries(questions.map((question) => [question.id, question]))

  it('CloudFormation의 기존 문단과 요약을 유지하고 둘째 문단에 템플릿과 스택을 정의한다', () => {
    const concept = byId['governance-iac.cloudformation']

    expect(concept.paragraphs).toHaveLength(3)
    expect(concept.paragraphs[0]).toBe(
      'CloudFormation은 AWS 분류로는 관리 및 거버넌스(Management and Governance) 쪽 서비스다. 인프라 구성을 파일로 적어 두고 그대로 배포하며, 사람이 콘솔에서 하나씩 만드는 것에 비해 실수가 줄고 같은 구성을 반복해서 만들 수 있다.',
    )
    expect(concept.paragraphs[1]).toBe(
      'CloudFormation에서 만들 리소스와 설정을 적어 두는 파일이 **템플릿**(template)이고, 그 템플릿을 제출해 실제로 만든 리소스 묶음이 **스택**(stack)이다. 스택을 만들면 CloudFormation이 템플릿에 적힌 리소스를 모두 만들고, 그 뒤로 이 리소스들은 스택 단위로 함께 고치고 함께 지운다. 예를 들어 로드 밸런서와 데이터베이스를 적은 템플릿으로 스택을 만들면, 둘은 한 스택에 속해 하나의 단위로 관리된다.',
    )
    expect(concept.paragraphs[2]).toBe(
      '이름이 CloudFront와 닮았지만 하는 일이 전혀 다르다. 인프라를 자동화해서 설정하는 것이 CloudFormation의 몫이고, 여러 계정을 묶어 관리하는 Organizations는 계정 관리 도구이지 인프라를 만드는 도구가 아니다.',
    )
    expect(concept.summary).toBe(
      '인프라를 템플릿으로 정의해 자동으로, 몇 번이든 같게 만들어 주는 서비스다.',
    )
  })

  it('드리프트 감지의 요약을 고치고 기존 문단 앞에 드리프트를 정의한다', () => {
    const concept = byId['governance-iac.cloudformation-drift-detection']

    expect(concept.summary).toBe(
      'CloudFormation 스택에 속한 리소스가 템플릿과 달라졌는지 보는 기능이라, 스택 밖에서 만든 리소스는 보지 못한다.',
    )
    expect(concept.paragraphs).toHaveLength(3)
    expect(concept.paragraphs[0]).toBe(
      '스택에 속한 리소스도 누군가 CloudFormation을 거치지 않고 콘솔 등에서 직접 바꿀 수 있다. 이렇게 템플릿에 적힌 값과 실제 값이 달라진 상태를 **드리프트**(drift)라 하고, 드리프트 감지는 두 값을 비교해 달라진 리소스를 찾는다.',
    )
    expect(concept.paragraphs[1]).toBe(
      '리소스 설정이 바뀐 것을 감지해야 한다는 요구에 드리프트 감지가 함께 오른다. 하는 일은 맞지만 대상이 좁다. CloudFormation이 만들고 관리하는 리소스에만 동작하고 스택이 있어야 한다.',
    )
    expect(concept.paragraphs[2]).toBe(
      '여러 팀이 각자 만든 리소스가 섞여 있는 계정 전체의 변경을 잡아야 한다면 이 기능으로는 스택 밖이 통째로 빠진다. 계정의 모든 지원 리소스를 대상으로 삼는 쪽은 AWS Config다.',
    )
  })

  it('세 해설에 스택의 뜻과 서비스 이름을 밝히고 정답 위치를 유지한다', () => {
    expect(questionById.q301.explanation).toContain('곧 스택에 속한 리소스에만 동작하므로')
    expect(questionById.q301.explanation).not.toContain('스택이 있어야 하므로')
    ;['q296', 'q299'].forEach((id) => {
      expect(questionById[id].explanation).toContain(
        '드리프트 감지는 CloudFormation 스택으로 만든 리소스가',
      )
    })
    expect(questionById.q296.answerIndex).toBe(0)
    expect(questionById.q299.answerIndex).toBe(0)
    expect(questionById.q301.answerIndex).toBe(2)
  })
})

describe('개념 계층 (ADR-041)', () => {
  it('모든 주제의 parentId가 같은 주제·두 단·연속 규칙을 지킨다', () => {
    expect(topics.flatMap((topic) => hierarchyProblems(topic))).toEqual([])
  })
})

describe('ADR-046 — 개념 본문 목록', () => {
  const concepts = topics.flatMap((topic) => topic.concepts)
  const byId = Object.fromEntries(concepts.map((concept) => [concept.id, concept]))

  it('목록 항목은 혼자 서지 않는다', () => {
    concepts.forEach(({ id, paragraphs }) => {
      paragraphs.forEach((paragraph, index) => {
        if (!isListItem(paragraph)) return

        expect(
          isListItem(paragraphs[index - 1] ?? '') || isListItem(paragraphs[index + 1] ?? ''),
          `${id} 문단 ${index}: 목록 항목의 앞이나 뒤에도 항목이 있어야 한다`,
        ).toBe(true)
      })
    })
  })

  it('목록이 있는 개념은 이 25개뿐이다', () => {
    // 목록을 늘리려면 ADR-046의 기준과 표를 먼저 고친다. phase 66이 vs 개념 넷을 더했다(ADR-051).
    const conceptsWithLists = [
      'backup-disaster-recovery.dr-strategies',
      'cost-management.compute-vs-ec2-instance-savings-plans',
      'dynamodb.dynamodb',
      'ebs-instance-store.ebs-volume-type-names',
      'ebs-instance-store.placement-groups',
      'ec2-autoscaling.ec2',
      'ec2-autoscaling.ec2-purchase-options',
      'ecs-eks-fargate.ecs-task-role-vs-task-execution-role',
      'efs-fsx.efs-vs-ebs',
      'efs-fsx.fsx',
      'elastic-load-balancing.elb',
      'governance-iac.control-tower-controls',
      'guardduty-macie-inspector.security-service-lineup',
      'iam-permissions.iam-policy',
      'lambda.lambda-invocation-types',
      'rds-storage-features.features',
      'rds-storage-features.multi-az-vs-read-replica',
      'rds-storage-features.rds-backups',
      'route53.routing-policies',
      's3-encryption-batch.sse-types',
      's3-versioning-lifecycle.object-lock',
      'sqs-sns-eventbridge.eventbridge-vs-sns',
      'sqs-sns-eventbridge.sqs',
      'storage-gateway-migration.storage-gateway',
      'waf-shield.cloudfront',
    ]

    expect(new Set(
      concepts.filter(({ paragraphs }) => paragraphs.some(isListItem)).map(({ id }) => id),
    )).toEqual(new Set(conceptsWithLists))
  })

  it('표지는 문단 맨 앞의 - 하나뿐이다', () => {
    concepts.forEach(({ id, paragraphs }) => {
      paragraphs.forEach((paragraph, index) => {
        const message = `${id} 문단 ${index}`

        if (paragraph.startsWith('-')) {
          expect(paragraph, message).toMatch(/^- \S/)
        }
        expect(paragraph, message).not.toContain('\n')
      })
    })
  })

  it('이름이 한국어인 항목에는 영문 이름이 붙는다', () => {
    // 영문 이름은 docs/source/aws-docs.md 「목록 항목의 영문 이름」(ADR-039 확장).
    const englishNamePrefixes: Record<string, string[]> = {
      'backup-disaster-recovery.dr-strategies': [
        '- **백업 및 복원**(Backup and Restore)',
        '- **파일럿 라이트**(Pilot Light)',
        '- **웜 스탠바이**(Warm Standby)',
        '- **다중 사이트 액티브-액티브**(Multi-site Active/Active)',
      ],
      'ebs-instance-store.ebs-volume-type-names': [
        '- 범용 SSD(General Purpose SSD)',
        '- 프로비저닝된 IOPS SSD(Provisioned IOPS SSD)',
        '- 처리량 최적화 HDD(Throughput Optimized HDD)',
        '- 콜드 HDD(Cold HDD)',
      ],
      'ebs-instance-store.placement-groups': [
        '- **클러스터**(Cluster)',
        '- **파티션**(Partition)',
        '- **분산**(Spread)',
      ],
      'ec2-autoscaling.ec2': [
        '- **온디맨드 인스턴스**(On-Demand Instance)',
        '- **스팟 인스턴스**(Spot Instance)',
        '- **예약 인스턴스**(Reserved Instance)',
      ],
      'ec2-autoscaling.ec2-purchase-options': [
        '- **온디맨드 인스턴스**(On-Demand Instance)',
        '- **스팟 인스턴스**(Spot Instance)',
        '- **예약 인스턴스**(Reserved Instance)',
      ],
      'ecs-eks-fargate.ecs-task-role-vs-task-execution-role': [
        '- **태스크 실행 역할**(Task Execution Role)',
        '- **태스크 역할**(Task Role)',
      ],
      'governance-iac.control-tower-controls': [
        '- **사전 예방적 제어**(Proactive Control)',
        '- **탐지 제어**(Detective Control)',
      ],
      'iam-permissions.iam-policy': [
        '- **자격 증명 기반 정책**(Identity-based Policy)',
        '- **리소스 기반 정책**(Resource-based Policy)',
      ],
      'lambda.lambda-invocation-types': [
        '- **이벤트 호출**(`Event`)',
        '- **요청-응답**(`RequestResponse`)',
      ],
      'rds-storage-features.rds-backups': [
        '- **자동 백업**(Automated Backup)',
        '- **DB 스냅샷**(DB Snapshot)',
      ],
      'route53.routing-policies': [
        '- **단순 라우팅**(Simple Routing)',
        '- **지리적 위치 라우팅**(Geolocation Routing)',
        '- **지리적 근접 라우팅**(Geoproximity Routing)',
        '- **다중값 응답 라우팅**(Multi-value Answer Routing)',
        '- **가중치 기반 라우팅**(Weighted Routing)',
        '- **지연시간 기반 라우팅**(Latency-based Routing)',
        '- **IP 기반 라우팅**(IP-based Routing)',
      ],
      's3-versioning-lifecycle.object-lock': [
        '- **거버넌스 모드**(Governance Mode)',
        '- **규정 준수 모드**(Compliance Mode)',
      ],
      'sqs-sns-eventbridge.sqs': [
        '- **표준 대기열**(Standard Queue)',
        '- **선입선출 대기열**(FIFO Queue)',
      ],
      'storage-gateway-migration.storage-gateway': [
        '- **파일 게이트웨이**(S3 File Gateway)',
        '- **볼륨 게이트웨이**(Volume Gateway)',
        '- **테이프 게이트웨이**(Tape Gateway)',
      ],
      'waf-shield.cloudfront': [
        '- **캐시 무효화**(Invalidation)',
      ],
    }

    Object.entries(englishNamePrefixes).forEach(([id, prefixes]) => {
      prefixes.forEach((prefix) => {
        expect(
          byId[id].paragraphs.filter((paragraph) => paragraph.startsWith(prefix)),
          `${id}: ${prefix}`,
        ).toHaveLength(1)
      })
    })
  })
})

describe('ADR-039 확장 — WAF의 Web ACL', () => {
  const concepts = topics.flatMap((topic) => topic.concepts)
  const byId = Object.fromEntries(concepts.map((concept) => [concept.id, concept]))
  const questionById = Object.fromEntries(questions.map((question) => [question.id, question]))

  it('WAF 기본 개념의 기존 문단과 요약을 유지하고 뒤에 Web ACL과 기본 동작을 정의한다', () => {
    const concept = byId['waf-shield.waf']

    expect(concept.paragraphs).toHaveLength(5)
    expect(concept.paragraphs[0]).toBe(
      'WAF는 AWS 분류로는 보안·자격 증명·규정 준수(Security, Identity, and Compliance) 쪽 서비스다. 웹 애플리케이션 앞단에서 HTTP와 HTTPS 요청을 살펴보고 공격 트래픽을 막는다. 인프라에서는 외부 요청이 처음 들어오는 지점에 주로 둔다.',
    )
    expect(concept.paragraphs[1]).toBe(
      '방어 범위는 **L7 애플리케이션 계층**이다. TCP와 UDP가 속한 L4 전송 계층 공격은 WAF로 막을 수 없다.',
    )
    expect(concept.paragraphs[2]).toBe(
      'IP 세트를 이용하면 특정 IP나 대역을 차단하거나 회사 내부 IP만 허용할 수 있다. 국가별 요청 차단도 지원하며 **SQL Injection과 XSS 공격을 방어한다**. SQL Injection은 입력창에 데이터베이스 명령을 몰래 끼워 넣는 공격이고, XSS(Cross-Site Scripting)는 다른 사용자의 브라우저에서 실행될 스크립트를 심는 공격이다.',
    )
    expect(concept.paragraphs[3]).toBe(
      '**Web ACL**(Web Access Control List)은 WAF가 요청을 검사할 규칙을 담아 두는 묶음이다. 규칙 하나는 요청의 어느 부분을 어떤 조건으로 볼지와, 그 조건에 맞는 요청을 허용할지 차단할지를 함께 정한다. 규칙은 Web ACL 안에 직접 쓸 수도 있고, 여러 규칙을 묶은 규칙 그룹을 통째로 넣을 수도 있다. 만든 Web ACL을 ALB나 CloudFront 같은 리소스에 연결해야 그 리소스로 들어오는 요청이 검사된다.',
    )
    expect(concept.paragraphs[4]).toBe(
      'Web ACL은 요청이 들어오면 우선순위가 앞선 규칙부터 차례로 평가하고, 허용이나 차단이 정해지면 나머지 규칙은 보지 않는다. 어느 규칙에서도 결론이 나지 않은 요청에는 Web ACL에 정해 둔 **기본 동작**(default action)이 적용된다. 기본 동작은 허용과 차단 가운데 하나다. 대부분의 요청을 받아들이고 일부만 막으려면 기본 동작을 허용으로 두고 막을 요청을 규칙으로 적는다. 반대로 회사 내부 IP처럼 정해진 출처만 들이려면 기본 동작을 차단으로 두고 들일 요청을 규칙으로 적는다.',
    )
    expect(concept.summary).toBe('웹 요청을 검사해 애플리케이션 계층의 공격을 차단한다.')
  })

  it('다른 주제에서 처음 나오는 Web ACL에 규칙 묶음이라는 풀이가 붙는다(ADR-029)', () => {
    const alb = byId['elastic-load-balancing.alb-routing-conditions']
    const cognito = byId['identity-federation.cognito-social-idp-federation']

    expect(alb.paragraphs).toHaveLength(2)
    expect(cognito.paragraphs).toHaveLength(2)
    expect(alb.paragraphs[1]).toContain('그 규칙을 담은 Web ACL을 ALB에 붙이면')
    expect(cognito.paragraphs[1]).toContain('WAF의 관리형 규칙을 담은 Web ACL을 함께 두면')
  })

  it('데이터 어디에도 웹 ACL 표기가 없다', () => {
    concepts.forEach(({ id, name, summary, paragraphs }) => {
      [name, summary, ...paragraphs].forEach((text) => {
        expect(text, id).not.toContain('웹 ACL')
      })
    })
    questions.forEach(({ id, prompt, choices, explanation }) => {
      [prompt, ...choices, explanation].forEach((text) => {
        expect(text, id).not.toContain('웹 ACL')
      })
    })
  })

  it('표기를 바꾼 문항은 정답 위치를 유지한다', () => {
    expect(questionById.q454.choices[2]).toBe('ALB에 붙인 WAF Web ACL')
    expect(questionById.q705.choices[2]).toBe(
      'Cognito 사용자 풀을 소셜 자격 증명 공급자와 연동해 REST API에 통합하고, 관리형 규칙을 붙인 WAF Web ACL을 함께 둔다',
    )
    expect(questionById.q079.answerIndex).toBe(1)
    expect(questionById.q454.answerIndex).toBe(1)
    expect(questionById.q705.answerIndex).toBe(2)
    ;['q079', 'q454', 'q705'].forEach((id) => {
      expect(questionById[id].explanation, id).toContain('Web ACL(Access Control List)')
    })
  })
})

describe('ADR-039 확장 — ECS의 태스크와 EKS의 파드', () => {
  const concepts = topics.flatMap((topic) => topic.concepts)
  const byId = Object.fromEntries(concepts.map((concept) => [concept.id, concept]))

  it('ECS 기본 개념의 기존 문단과 요약을 유지하고 뒤에 태스크 정의·태스크·서비스를 정의한다', () => {
    const concept = byId['ecs-eks-fargate.ecs']

    expect(concept.paragraphs).toHaveLength(4)
    expect(concept.paragraphs[0]).toBe(
      'ECS는 AWS 분류로는 컨테이너(Containers) 쪽 서비스다. EC2 기반 ECS에서는 사용자가 EC2를 직접 관리한다. 세부 구성을 조정할 수 있는 대신 운영 부담이 크다.',
    )
    expect(concept.paragraphs[1]).toBe(
      '**Fargate 기반 ECS**는 서버 관리를 AWS에 맡기는 완전 관리형 방식이다. 서버의 확장과 축소도 AWS가 담당하므로 관리할 일이 비교적 적고, 예측하기 어려운 트래픽 변화에 유연하게 대응할 수 있다.',
    )
    expect(concept.paragraphs[2]).toBe(
      'EC2 기반이든 Fargate 기반이든 그 위에서 실제로 실행되는 단위는 **태스크**(task)다. 무엇을 실행할지는 **태스크 정의**(task definition)에 먼저 적는다. 태스크 정의는 JSON 형식의 설계도로, 어떤 컨테이너 이미지를 쓸지, CPU와 메모리를 얼마나 줄지, 네트워크 모드는 무엇인지, 태스크가 쓸 IAM 역할은 무엇인지를 담고, 컨테이너를 하나 이상 적을 수 있다. 태스크는 이 설계도대로 시작한 실행 단위 하나이고, 한 태스크 정의로 태스크를 여러 개 실행할 수 있다.',
    )
    expect(concept.paragraphs[3]).toBe(
      '한 태스크 정의에 적은 컨테이너들은 태스크마다 함께 시작되고 함께 늘어난다. 그래서 웹 서버와 API처럼 따로 늘려야 하는 컨테이너는 태스크 정의를 나눈다. 태스크가 정해 둔 수만큼 계속 실행되게 유지하는 것은 **서비스**(service)다. 태스크가 실패하거나 멈추면 서비스 스케줄러가 같은 태스크 정의로 새 태스크를 시작해 그 수를 맞추고, 서비스를 로드 밸런서 뒤에 두면 트래픽이 그 서비스의 태스크들로 나뉜다.',
    )
    expect(concept.summary).toBe('ECS는 Docker 컨테이너를 손쉽게 운영하도록 지원하는 서비스다.')
  })

  it('EKS 기본 개념의 기존 문단과 요약을 유지하고 뒤에 파드와 노드를 정의한다', () => {
    const concept = byId['ecs-eks-fargate.eks']

    expect(concept.paragraphs).toHaveLength(4)
    expect(concept.paragraphs[0]).toBe(
      'EKS는 AWS 분류로는 컨테이너(Containers) 쪽 서비스다. 기존 환경이 쿠버네티스면 EKS로 옮겨야 코드와 배포 프로세스를 그대로 쓸 수 있다. 같은 컨테이너 서비스라도 ECS로 옮기면 공수가 많이 든다.',
    )
    expect(concept.paragraphs[1]).toBe(
      '반대로 온프레미스에서 순수 Docker 컨테이너로 돌리던 것을 옮길 때는 ECS가 맞다. EKS와 ECS를 가르는 기준은 "원래 쿠버네티스였는가"다.',
    )
    expect(concept.paragraphs[2]).toBe(
      'EKS에서 배포하는 가장 작은 단위는 **파드**(Pod)이고, ECS의 태스크에 해당한다. 파드는 보통 컨테이너 하나를 담지만, 웹 서버와 그 옆에서 로그를 모으는 컨테이너처럼 단단히 붙어 일하는 컨테이너는 한 파드에 함께 넣는다. 한 파드의 컨테이너들은 늘 같은 머신에서 함께 실행되고, IP 주소 하나를 함께 쓰므로 같은 머신 안의 프로그램끼리처럼 서로 통신한다.',
    )
    expect(concept.paragraphs[3]).toBe(
      'EKS로 만드는 쿠버네티스 클러스터는 두 부분으로 이루어진다. 클러스터 전체를 관리하는 컨트롤 플레인은 AWS가 운영하고, 파드가 실제로 올라가 실행되는 머신인 **노드**(node)는 보통 EC2 인스턴스다. 파드를 어느 노드에 올릴지는 컨트롤 플레인이 정한다.',
    )
    expect(concept.summary).toBe('쿠버네티스를 AWS에서 관리형으로 운영하는 서비스다.')
  })

  it('Lambda 주제에서 처음 나오는 태스크 정의와 서비스에 한 구절 풀이가 붙는다(ADR-029)', () => {
    const concept = byId['lambda.lambda-container-image']

    expect(concept.paragraphs).toHaveLength(2)
    expect(concept.paragraphs[1]).toContain(
      'ECS도 컨테이너를 어떤 설정으로 실행할지 적는 태스크 정의, 태스크를 정한 수만큼 유지하는 서비스, 네트워킹을 여전히 사람이 관리해야 하기 때문이다.',
    )
  })

  it('컨테이너 주제에서 파드와 태스크가 정의보다 먼저 나오지 않는다(ADR-029)', () => {
    const topic = topics.find((candidate) => candidate.id === 'ecs-eks-fargate')
    const ids = topic?.concepts.map((concept) => concept.id) ?? []
    const firstUse = (word: string) =>
      ids.findIndex((id) => {
        const { name, summary, paragraphs } = byId[id]
        return [name, summary, ...paragraphs].some((text) => text.includes(word))
      })

    expect(firstUse('**태스크**')).toBe(ids.indexOf('ecs-eks-fargate.ecs'))
    expect(firstUse('태스크')).toBe(ids.indexOf('ecs-eks-fargate.ecs'))
    expect(firstUse('**파드**')).toBe(ids.indexOf('ecs-eks-fargate.eks'))
    expect(firstUse('파드')).toBe(ids.indexOf('ecs-eks-fargate.eks'))
    expect(firstUse('**노드**')).toBe(ids.indexOf('ecs-eks-fargate.eks'))
    expect(firstUse('노드')).toBe(ids.indexOf('ecs-eks-fargate.eks'))
  })
})

describe('ADR-039 확장 — 유출된 액세스 키는 비활성화하거나 삭제할 수 있다', () => {
  const byId = Object.fromEntries(
    topics.flatMap((topic) => topic.concepts).map((concept) => [concept.id, concept]),
  )
  const questionById = Object.fromEntries(questions.map((question) => [question.id, question]))

  it('학습자가 읽는 어느 글도 유출된 액세스 키를 회수할 방법이 없다고 말하지 않는다', () => {
    const learnerFacingText = [
      ...topics.flatMap((topic) =>
        topic.concepts.flatMap((concept) => [concept.name, concept.summary, ...concept.paragraphs]),
      ),
      ...questions.flatMap((question) => [question.prompt, ...question.choices, question.explanation]),
    ].join('\n')

    expect(learnerFacingText).not.toMatch(/회수할 방법이 없/)
  })

  it('IAM 개념 둘이 키가 비활성화하거나 삭제하기 전까지 계속 유효하다고 말하고 문단 수를 유지한다', () => {
    expect(byId['iam-permissions.iam'].paragraphs).toHaveLength(3)
    expect(byId['iam-permissions.iam'].paragraphs[1]).toContain('비활성화하거나 삭제하기 전까지')
    expect(byId['iam-permissions.iam-user'].paragraphs[0]).toContain('비활성화하거나 삭제하기 전까지')
  })

  it('q156·q157·q160의 보기와 정답 위치를 유지하고 해설만 같은 사실로 맞춘다', () => {
    expect(questionById.q156.answerIndex).toBe(3)
    expect(questionById.q157.answerIndex).toBe(0)
    expect(questionById.q160.answerIndex).toBe(3)
    ;['q156', 'q157', 'q160'].forEach((id) => {
      expect(questionById[id].explanation).toContain('비활성화하거나 삭제하기 전까지')
    })
  })
})

describe('ADR-049 후속 — 컨테이너 용어는 주제마다 처음 나오는 개념에서 풀린다(ADR-029)', () => {
  const concepts = topics.flatMap((topic) => topic.concepts)
  const byId = Object.fromEntries(concepts.map((concept) => [concept.id, concept]))
  const textOf = ({ name, summary, paragraphs }: (typeof concepts)[number]) => [name, summary, ...paragraphs].join('\n')

  // 풀이의 표지는 ecs-eks-fargate.container·container-orchestration 본문과 같은 사실이다.
  const terms: { word: RegExp; definition: RegExp }[] = [
    { word: /컨테이너/u, definition: /파일·라이브러리와 한 덩어리로 묶은 실행 단위/u },
    { word: /컨테이너 이미지/u, definition: /읽기 전용 꾸러미/u },
    { word: /쿠버네티스/u, definition: /쿠버네티스\S*는 [^.]*오픈 소스[^.]*도구/u },
    { word: /Docker|도커/u, definition: /(Docker|도커)\S*는 [^.]*대표적인 도구/u },
  ]

  it.each(topics.map((topic) => [topic.id, topic] as const))('%s: 처음 나오는 개념의 본문이 그 낱말을 푼다', (_id, topic) => {
    for (const { word, definition } of terms) {
      const first = topic.concepts.find((concept) => word.test(textOf(concept)))
      if (!first) continue
      expect(first.paragraphs.join('\n'), `${first.id} — ${word.source}`).toMatch(definition)
    }
  })

  it('EC2 주제의 GPU 개념이 컨테이너를 오케스트레이션한다는 말을 푼다', () => {
    expect(byId['ec2-autoscaling.gpu-instance-family'].paragraphs[1]).toContain(
      '오케스트레이션은 여러 서버에 걸친 컨테이너를 어디에 올릴지 정하고, 실패하면 다시 띄우고, 부하에 따라 늘리고 줄이는 일을 자동으로 맡는 것이다.',
    )
  })

  it('Snowball Edge 현장 컴퓨팅 개념이 EKS Anywhere 클러스터를 푼다', () => {
    expect(byId['data-transfer-services.snowball-edge-compute'].paragraphs[1]).toMatch(
      /^EKS Anywhere 클러스터는 AWS 밖에서 직접 운영하는 쿠버네티스 클러스터다\./u,
    )
  })

  it('컨테이너 주제에서 리포지토리는 ECR 개념에서 처음 나오고 그 자리에서 정의된다', () => {
    const topic = topics.find((candidate) => candidate.id === 'ecs-eks-fargate')!
    const first = topic.concepts.find((concept) => textOf(concept).includes('리포지토리'))

    expect(first?.id).toBe('ecs-eks-fargate.ecr-image-scan-on-push')
    expect(first?.paragraphs[0]).toContain(
      'AWS 계정마다 기본 프라이빗 레지스트리가 하나 있고, 이미지는 그 레지스트리 안의 **리포지토리**(repository)에 담긴다.',
    )
  })
})

describe('ADR-050 — 단계 목록', () => {
  const concepts = topics.flatMap((topic) => topic.concepts)
  // 들여쓰기 칸 수와 표지를 문자열에서 바로 읽는다. 화면 쪽 규칙(src/lib/paragraph-blocks.ts)에 기대지 않는다.
  const indentOf = (paragraph: string) => paragraph.match(/^ */)![0].length
  const isStep = (paragraph: string) => /^\d+\. \S/.test(paragraph)
  const isItem = (paragraph: string) => isStep(paragraph) || /^ *- \S/.test(paragraph)

  it('번호 목록과 들여쓴 문단이 있는 개념은 이 하나뿐이다', () => {
    // 단계 목록은 따라 하는 절차에만 쓴다. 늘리려면 ADR-050의 기준을 먼저 고친다.
    expect(
      concepts.filter(({ paragraphs }) => paragraphs.some((paragraph) => isStep(paragraph) || indentOf(paragraph) > 0)).map(({ id }) => id),
    ).toEqual(['identity-federation.iam-roles-anywhere'])
  })

  it('들여쓰기는 2칸·4칸이고 번호는 맨 바깥에만 온다', () => {
    concepts.forEach(({ id, paragraphs }) => {
      paragraphs.forEach((paragraph, index) => {
        const indent = indentOf(paragraph)
        const message = `${id} 문단 ${index}`

        expect([0, 2, 4], message).toContain(indent)
        if (indent > 0) {
          expect(paragraph.slice(indent), message).toMatch(/^\S/)
          expect(/^\d+\. /.test(paragraph.slice(indent)), message).toBe(false)
        }
      })
    })
  })

  it('들여쓴 문단은 한 칸 얕은 항목 아래에 온다', () => {
    concepts.forEach(({ id, paragraphs }) => {
      paragraphs.forEach((paragraph, index) => {
        const depth = indentOf(paragraph) / 2
        if (depth === 0) return

        // 위로 올라가며 처음 만나는 더 얕은 문단이 바로 한 칸 얕은 항목이어야 한다.
        const parent = paragraphs.slice(0, index).reverse().find((previous) => indentOf(previous) / 2 < depth)
        expect(parent !== undefined && indentOf(parent) / 2 === depth - 1 && isItem(parent), `${id} 문단 ${index}`).toBe(true)
      })
    })
  })

  it('IAM Roles Anywhere 개념의 단계 번호가 1부터 19까지 빠짐없이 이어진다', () => {
    const concept = concepts.find(({ id }) => id === 'identity-federation.iam-roles-anywhere')
    const numbers = concept?.paragraphs.filter(isStep).map((paragraph) => Number(paragraph.match(/^\d+/)![0]))

    expect(numbers).toEqual(Array.from({ length: 19 }, (_, index) => index + 1))
  })
})

describe('ADR-039 확장 — Glue의 정의와 변환 예시', () => {
  const byId = Object.fromEntries(
    topics.flatMap((topic) => topic.concepts).map((concept) => [concept.id, concept]),
  )

  it('Glue의 요약이 무엇을 하는 서비스인지 바로 말한다', () => {
    expect(byId['emr-glue-athena.glue'].summary).toBe(
      'Glue는 여러 곳의 데이터를 모아 분석하기 좋은 형태로 다듬는 서버리스 데이터 통합 서비스다.',
    )
  })

  // 분류 문장(ADR-019)은 첫 문단 맨 앞에 남고, 셋째 문단의 「분석하는 기능이 없다」는 q127의 정답 근거다.
  it('분류 문장 뒤에 하는 일, 변환 예시와 ETL 정의, 분석은 다른 서비스가 한다는 것을 차례로 쓴다', () => {
    expect(byId['emr-glue-athena.glue'].paragraphs).toEqual([
      'Glue는 AWS 분류로는 분석(Analytics) 쪽 서비스다. 하는 일은 분석할 데이터를 준비하는 것이다. 여러 곳에 흩어진 데이터를 읽어 와 분석하기 좋은 형태로 다듬고, 그 결과를 원하는 곳에 저장한다. 서버리스라서 이 일을 돌릴 서버나 클러스터를 직접 띄우고 관리하지 않는다.',
      '예를 들어 S3에 CSV 파일과 JSON 파일이 섞여 쌓여 있다고 하자. Glue는 이 파일들을 읽어 분석에 필요 없는 열을 지우고, 데이터를 한 가지 형식으로 맞춘 뒤 다시 S3에 저장한다. 이렇게 꺼내고(Extract), 형태를 바꾸고(Transform), 대상에 적재하는(Load) 과정을 ETL이라 하고, Glue에서 이 과정을 돌리는 것을 ETL 작업(Glue Job)이라 한다.',
      'Glue가 맡는 것은 분석할 데이터를 준비하는 데까지다. Glue 자체에는 데이터를 분석하는 기능이 없고, 다듬어 둔 데이터를 SQL로 조회하는 일은 Athena 같은 다른 서비스가 한다.',
    ])
  })
})
