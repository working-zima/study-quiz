#!/usr/bin/env node
/**
 * 키워드 퀴즈의 평문(docs/source/keywords-raw.json)을 암호화해 src/data/aws/keywords.enc.json에 쓴다.
 *
 * 평문은 원본 PDF의 원문 그대로라 로컬에만 두고, 저장소와 배포본에는 이 암호문만 들어간다(ADR-040).
 * 암호는 EGG_PASSPHRASE 환경 변수 또는 저장소 루트의 .env에서 읽는다. VITE_ 접두사를 붙이지 마라 —
 * Vite가 클라이언트 번들에 평문으로 넣는다. 빌드할 때마다 암호가 필요해지지 않도록 npm 스크립트에 엮지 않는다.
 *
 * 암호 값은 어떤 경로로도 출력하지 않는다.
 *
 * 사용법: node scripts/encrypt-keywords.mjs
 */
import { webcrypto } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { isDeepStrictEqual } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Node 18은 globalThis.crypto를 기본으로 두지 않는다(19부터). 같은 Web Crypto API인 webcrypto로 채운다.
const crypto = globalThis.crypto ?? webcrypto

function toBase64(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function deriveKey(passphrase, salt, iterations, usage) {
  const { subtle } = crypto
  const base = await subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  return subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  )
}

export async function encryptKeywords(keywords, passphrase, { iterations = 600000 } = {}) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt, iterations, 'encrypt')
  const data = new TextEncoder().encode(JSON.stringify(keywords))
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data))
  return {
    version: 1,
    kdf: 'PBKDF2-SHA256',
    iterations,
    cipher: 'AES-GCM-256',
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
  }
}

// 쓴 파일을 되읽어 확인하는 용도다. 앱의 복호화는 src/lib/keyword-crypto.ts가 맡는다.
async function decrypt(payload, passphrase) {
  const key = await deriveKey(passphrase, fromBase64(payload.salt), payload.iterations, 'decrypt')
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(payload.iv) },
    key,
    fromBase64(payload.ciphertext),
  )
  return JSON.parse(new TextDecoder().decode(plain))
}

// Node 18에는 --env-file이 없고 dotenv를 들이지 않으므로 .env의 한 줄만 직접 읽는다.
function readPassphrase(root) {
  if (process.env.EGG_PASSPHRASE) return process.env.EGG_PASSPHRASE
  let text
  try {
    text = readFileSync(join(root, '.env'), 'utf8')
  } catch {
    return ''
  }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*EGG_PASSPHRASE\s*=(.*)$/)
    if (!match) continue
    let value = match[1].trim()
    if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0]) {
      value = value.slice(1, -1)
    }
    return value
  }
  return ''
}

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const passphrase = readPassphrase(root)
  if (!passphrase) {
    console.error('EGG_PASSPHRASE가 없다')
    process.exit(1)
  }

  const source = 'docs/source/keywords-raw.json'
  const target = 'src/data/aws/keywords.enc.json'
  let keywords
  try {
    keywords = JSON.parse(readFileSync(join(root, source), 'utf8'))
  } catch {
    console.error(`${source}를 읽을 수 없다`)
    process.exit(1)
  }

  const payload = await encryptKeywords(keywords, passphrase)
  writeFileSync(join(root, target), JSON.stringify(payload, null, 2) + '\n')

  const written = JSON.parse(readFileSync(join(root, target), 'utf8'))
  let restored
  try {
    restored = await decrypt(written, passphrase)
  } catch {
    console.error('복호화 실패')
    process.exit(1)
  }
  if (!isDeepStrictEqual(restored, keywords)) {
    console.error('복호화 결과가 원본과 다르다')
    process.exit(1)
  }
  console.log(`${keywords.length}개 암호화, 복호화 확인`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  // 예외 메시지·스택에 암호가 섞이지 않도록 내용 없이 끝낸다.
  main().catch(() => {
    console.error('암호화 실패')
    process.exit(1)
  })
}
