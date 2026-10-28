import questionsData from './questions.json'
import topicsData from './topics.json'
import arpVisuals from './visuals/arp.json'
import ethernetVisuals from './visuals/ethernet.json'
import hubSwitchVlanVisuals from './visuals/hub-switch-vlan.json'
import ipProtocolVisuals from './visuals/ip-protocol.json'
import networkBasicsVisuals from './visuals/network-basics.json'
import protocolsEncapsulationVisuals from './visuals/protocols-encapsulation.json'
import type { Question, Topic } from '../../types/content'
import type { Subject } from '../../types/subject'
import type { TopicVisuals } from '../../types/visuals'

// 빈 배열 JSON은 never[]로 잡혀 단언이 필요하다.
export const topics: Topic[] = topicsData as Topic[]
// 네트워크는 4지선다와 예/아니요를 함께 담는다. 문항마다 format을 적는다(ADR-054).
export const questions: Question[] = questionsData as Question[]
export const visualsByTopicId: Record<string, TopicVisuals> = {
  'network-basics': networkBasicsVisuals,
  'protocols-encapsulation': protocolsEncapsulationVisuals,
  'ethernet': ethernetVisuals,
  'hub-switch-vlan': hubSwitchVlanVisuals,
  'ip-protocol': ipProtocolVisuals,
  'arp': arpVisuals,
}

export const networkSubject: Subject = {
  id: 'network',
  title: '네트워크',
  // 이 과목의 학습 기록이 이 키에 담긴다. 배포한 뒤 바꾸면 진행률·복습 목록이 사라진다.
  progressKey: 'network-quiz.progress',
  topics,
  questions,
  visualsByTopicId,
  hasKeywordQuiz: false,
}
