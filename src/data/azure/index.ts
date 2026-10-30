import questionsData from './questions.json'
import topicsData from './topics.json'
import azureCloudBenefitsVisuals from './visuals/azure-cloud-benefits.json'
import azureCloudComputingVisuals from './visuals/azure-cloud-computing.json'
import azureCloudModelsVisuals from './visuals/azure-cloud-models.json'
import azureSlaLifecycleVisuals from './visuals/azure-sla-lifecycle.json'
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
