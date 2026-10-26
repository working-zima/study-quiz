import type { Progress } from '../types/progress'
import { emptyProgress } from './progress'

interface ProgressV1 {
  version: 1
  read: Record<string, boolean>
  answers: Record<string, boolean>
}

interface ProgressV2 {
  version: 2
  read: Record<string, boolean>
  answers: Record<string, boolean>
  wrong: Record<string, true>
}

// version 1에는 오답노트가 없었다. 그때까지 틀린 문항을 씨앗으로 넣어 기록을 잇는다.
function migrateFromV1(stored: ProgressV1): ProgressV2 {
  return {
    version: 2,
    read: stored.read,
    answers: stored.answers,
    wrong: Object.fromEntries(
      Object.entries(stored.answers)
        .filter(([, correct]) => correct === false)
        .map(([questionId]) => [questionId, true]),
    ),
  }
}

// version 2의 오답노트는 틀리면 저절로 채워졌다. 복습 목록은 이제 사용자가 고르지만,
// 이미 쌓인 목록은 사용자가 지우지 않고 남겨 둔 것이므로 그대로 옮긴다 (ADR-032).
function migrateFromV2(stored: ProgressV2): Progress {
  return {
    version: 3,
    read: stored.read,
    answers: stored.answers,
    review: stored.wrong,
  }
}

// 키는 과목이 정한다(Subject.progressKey). 과목마다 키가 달라 기록이 서로 닿지 않는다.
export function loadProgress(key: string): Progress {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) {
      return emptyProgress()
    }

    const parsed: unknown = JSON.parse(stored)
    if (
      typeof parsed !== 'object'
      || parsed === null
      || !('version' in parsed)
    ) {
      return emptyProgress()
    }

    if (parsed.version === 1) {
      return migrateFromV2(migrateFromV1(parsed as ProgressV1))
    }

    if (parsed.version === 2) {
      return migrateFromV2(parsed as ProgressV2)
    }

    if (parsed.version !== 3) {
      return emptyProgress()
    }

    return parsed as Progress
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(key: string, progress: Progress): void {
  try {
    localStorage.setItem(key, JSON.stringify(progress))
  } catch {
    // 저장소가 차단되어도 메모리의 앱 상태는 계속 사용할 수 있다.
  }
}
