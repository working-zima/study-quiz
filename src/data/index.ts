import { awsSubject } from './aws/index'
import { networkSubject } from './network/index'
import type { Subject } from '../types/subject'

export const subjects: Subject[] = [awsSubject, networkSubject]
