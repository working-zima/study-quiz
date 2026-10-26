import { describe, expect, it } from 'vitest'
// 파일을 글자 그대로 읽는다. `node:fs`를 쓰지 않는 이유는 이 저장소에 @types/node가
// 없고 tsconfig의 types가 제한돼 있어서다 — 의존성을 늘리지 않으려고 Vite의 ?raw를 쓴다.
import html from '../index.html?raw'

// GitHub Pages 정적 호스팅이라 배포 산출물의 메타데이터를 고쳐 줄 서버가 없다.
// index.html에 없으면 배포된 사이트에도 없다. 그래서 여기서 고정한다.

describe('배포 메타데이터', () => {
  it('탭에서 알아볼 아이콘이 걸려 있다', () => {
    expect(html).toMatch(/<link[^>]+rel="icon"/)
  })

  // CRITICAL: base가 './'이므로 아이콘 경로도 상대여야 한다. 절대 경로로 쓰면
  // 서브경로(/study-quiz/)에 배포했을 때 도메인 루트를 찾아가 404가 난다.
  it('아이콘 경로가 상대 경로다 — 서브경로 배포가 깨지지 않는다', () => {
    const icon = html.match(/<link[^>]+rel="icon"[^>]*href="([^"]+)"/)?.[1]

    expect(icon).toBeDefined()
    expect(icon?.startsWith('/')).toBe(false)
    expect(icon?.startsWith('http')).toBe(false)
  })

  it('북마크와 공유에 쓸 설명이 있다', () => {
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/)?.[1]

    expect(description).toBeDefined()
    expect(description?.length).toBeGreaterThan(20)
  })

  it('제목이 비어 있지 않다', () => {
    expect(html).toMatch(/<title>[^<]{5,}<\/title>/)
  })

  // 과목을 여럿 담는 앱이라 탭과 공유 카드에 과목 이름 대신 앱 이름을 쓴다.
  it('탭 제목과 공유 제목이 앱 이름 「Study Quiz」다', () => {
    expect(html).toMatch(/<title>Study Quiz<\/title>/)
    expect(html).toMatch(/<meta\s+property="og:title"\s+content="Study Quiz"/)
  })

  it('한국어 문서로 선언돼 있다', () => {
    expect(html).toMatch(/<html[^>]+lang="ko"/)
  })
})
