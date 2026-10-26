import questionsData from './questions.json'
import topicsData from './topics.json'
import apiGatewayStepFunctionsVisuals from './visuals/api-gateway-step-functions.json'
import backupDisasterRecoveryVisuals from './visuals/backup-disaster-recovery.json'
import ecsEksFargateVisuals from './visuals/ecs-eks-fargate.json'
import emrGlueAthenaVisuals from './visuals/emr-glue-athena.json'
import governanceIacVisuals from './visuals/governance-iac.json'
import iamPermissionsVisuals from './visuals/iam-permissions.json'
import identityFederationVisuals from './visuals/identity-federation.json'
import organizationsCloudtrailConfigVisuals from './visuals/organizations-cloudtrail-config.json'
import route53Visuals from './visuals/route53.json'
import securityGroupsNaclVisuals from './visuals/security-groups-nacl.json'
import vpcNetworkingVisuals from './visuals/vpc-networking.json'
import type { Question, Topic } from '../../types/content'
import type { Subject } from '../../types/subject'
import type { TopicVisuals } from '../../types/visuals'

export const topics: Topic[] = topicsData as Topic[]
export const questions: Question[] = questionsData as Question[]
export const visualsByTopicId: Record<string, TopicVisuals> = {
  'api-gateway-step-functions': apiGatewayStepFunctionsVisuals,
  'backup-disaster-recovery': backupDisasterRecoveryVisuals,
  'ecs-eks-fargate': ecsEksFargateVisuals,
  'emr-glue-athena': emrGlueAthenaVisuals,
  'governance-iac': governanceIacVisuals,
  'iam-permissions': iamPermissionsVisuals,
  'identity-federation': identityFederationVisuals,
  'organizations-cloudtrail-config': organizationsCloudtrailConfigVisuals,
  'route53': route53Visuals,
  'security-groups-nacl': securityGroupsNaclVisuals,
  'vpc-networking': vpcNetworkingVisuals,
}

export const awsSubject: Subject = {
  id: 'aws',
  title: 'AWS SAA-C03',
  // 지금 사용자의 학습 기록이 이 키에 있다. 바꾸면 모두의 진행률·복습 목록이 사라진다.
  progressKey: 'aws-quiz.progress',
  topics,
  questions,
  visualsByTopicId,
  hasKeywordQuiz: true,
}
