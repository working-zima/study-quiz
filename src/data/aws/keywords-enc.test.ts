// @vitest-environment node

import { describe, expect, it } from 'vitest'
// 파일을 글자 그대로 읽는다. @types/node가 없어 node:fs 대신 Vite의 ?raw를 쓴다.
import text from './keywords.enc.json?raw'

// 커밋된 암호문을 검사하는 가드다. 평문이 새어 들어가지 않았는지 막는다(ADR-040).
const payload = JSON.parse(text) as Record<string, unknown>

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/

function decodedLength(value: unknown): number {
  expect(typeof value).toBe('string')
  expect(value).toMatch(BASE64)
  return atob(value as string).length
}

describe('keywords.enc.json', () => {
  it('EncryptedKeywords의 일곱 필드와 규약 값을 갖는다', () => {
    expect(Object.keys(payload).sort()).toEqual(
      ['cipher', 'ciphertext', 'iterations', 'iv', 'kdf', 'salt', 'version'].sort(),
    )
    expect(payload.version).toBe(1)
    expect(payload.kdf).toBe('PBKDF2-SHA256')
    expect(payload.cipher).toBe('AES-GCM-256')
    expect(payload.iterations).toBe(600000)
  })

  it('salt는 16바이트, iv는 12바이트 base64이고 ciphertext도 base64다', () => {
    expect(decodedLength(payload.salt)).toBe(16)
    expect(decodedLength(payload.iv)).toBe(12)
    expect(decodedLength(payload.ciphertext)).toBeGreaterThan(16)
  })

  it('파일 전체에 한글과 ○가 없다', () => {
    expect(text).not.toMatch(/[ᄀ-ᇿ㄰-㆏가-힣]/)
    expect(text).not.toContain('○')
  })
})
