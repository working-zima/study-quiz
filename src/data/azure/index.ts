import questionsData from './questions.json'
import topicsData from './topics.json'
import azureCloudBenefitsVisuals from './visuals/azure-cloud-benefits.json'
import azureCloudComputingVisuals from './visuals/azure-cloud-computing.json'
import azureCloudModelsVisuals from './visuals/azure-cloud-models.json'
import azureComputeVisuals from './visuals/azure-compute.json'
import azureCostFactorsVisuals from './visuals/azure-cost-factors.json'
import azureCostManagementVisuals from './visuals/azure-cost-management.json'
import azureDataMovementVisuals from './visuals/azure-data-movement.json'
import azureGovernanceVisuals from './visuals/azure-governance.json'
import azureIdentityVisuals from './visuals/azure-identity.json'
import azureNetworkProtectionVisuals from './visuals/azure-network-protection.json'
import azureRegionsZonesVisuals from './visuals/azure-regions-zones.json'
import azureResourceHierarchyVisuals from './visuals/azure-resource-hierarchy.json'
import azureSecurityModelVisuals from './visuals/azure-security-model.json'
import azureServiceTypesVisuals from './visuals/azure-service-types.json'
import azureSlaLifecycleVisuals from './visuals/azure-sla-lifecycle.json'
import azureStorageVisuals from './visuals/azure-storage.json'
import azureVirtualNetworkingVisuals from './visuals/azure-virtual-networking.json'
import type { Question, Topic } from '../../types/content'
import type { Subject } from '../../types/subject'
import type { TopicVisuals } from '../../types/visuals'

// 빈 배열 JSON은 never[]로 잡혀 단언이 필요하다.
export const topics: Topic[] = topicsData as Topic[]
// Azure는 4지선다와 예/아니요를 함께 담는다. 문항마다 format을 적는다(ADR-054).
export const questions: Question[] = questionsData as Question[]
export const visualsByTopicId: Record<string, TopicVisuals> = {
  'azure-cloud-computing': azureCloudComputingVisuals,
  'azure-cloud-models': azureCloudModelsVisuals,
  'azure-cloud-benefits': azureCloudBenefitsVisuals,
  'azure-sla-lifecycle': azureSlaLifecycleVisuals,
  'azure-service-types': azureServiceTypesVisuals,
  'azure-regions-zones': azureRegionsZonesVisuals,
  'azure-resource-hierarchy': azureResourceHierarchyVisuals,
  'azure-compute': azureComputeVisuals,
  'azure-virtual-networking': azureVirtualNetworkingVisuals,
  'azure-network-protection': azureNetworkProtectionVisuals,
  'azure-storage': azureStorageVisuals,
  'azure-data-movement': azureDataMovementVisuals,
  'azure-identity': azureIdentityVisuals,
  'azure-security-model': azureSecurityModelVisuals,
  'azure-cost-factors': azureCostFactorsVisuals,
  'azure-cost-management': azureCostManagementVisuals,
  'azure-governance': azureGovernanceVisuals,
}

export const azureSubject: Subject = {
  id: 'azure',
  title: 'Azure AZ-900',
  // 이 과목의 학습 기록이 이 키에 담긴다. 배포한 뒤 바꾸면 진행률·복습 목록이 사라진다.
  progressKey: 'azure-quiz.progress',
  topics,
  questions,
  visualsByTopicId,
  hasKeywordQuiz: false,
}
