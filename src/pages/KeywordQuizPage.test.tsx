import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithSubject } from '../test/subject'
import type { EncryptedKeywords, Keyword } from '../types/keywords'
import { KeywordQuizPage } from './KeywordQuizPage'

// jsdom에는 crypto.subtle이 없어 실제 복호화를 돌릴 수 없다. 복호화는 keyword-crypto.test.ts가 맡는다.
vi.mock('../lib/keyword-crypto', async () => {
  const actual = await vi.importActual<typeof import('../lib/keyword-crypto')>('../lib/keyword-crypto')
  return { WrongPassphraseError: actual.WrongPassphraseError, decryptKeywords: vi.fn() }
})

const { decryptKeywords, WrongPassphraseError } = await import('../lib/keyword-crypto')
const decrypt = vi.mocked(decryptKeywords)

// 특징 문항은 단원A에만 셋 있다(k1에 둘, k2에 하나). 단원B에는 특징이 없다.
// k3은 특징을 옳지 않은 것 고르기 한 문항으로만 낸다(단원A).
const keywords: Keyword[] = Array.from({ length: 12 }, (_, index) => ({
  id: `k${index + 1}`,
  term: `용어${index + 1}`,
  summary: `요약${index + 1}`,
  section: index < 6 ? '단원A' : '단원B',
  page: index + 1,
  ...(index === 0 && { features: [
    { text: '특징1-1', section: '단원A', page: 1 },
    { text: '특징1-2', section: '단원A', page: 1 },
  ] }),
  ...(index === 1 && { features: [{ text: '특징2-1', section: '단원A', page: 2 }] }),
  ...(index === 2 && {
    features: ['특징3-1', '특징3-2', '특징3-3'].map((text) => ({ text, section: '단원A', page: 3 })),
    falseFeature: { text: '가짜3', replaces: 0 },
  }),
}))

const encrypted: EncryptedKeywords = {
  version: 1,
  kdf: 'PBKDF2-SHA256',
  iterations: 1,
  cipher: 'AES-GCM-256',
  salt: '',
  iv: '',
  ciphertext: '',
}

function renderPage() {
  return renderWithSubject(<KeywordQuizPage encrypted={encrypted} rng={() => 0.5} />)
}

async function unlock(user: ReturnType<typeof userEvent.setup>) {
  decrypt.mockResolvedValueOnce(keywords)
  renderPage()
  await user.type(screen.getByLabelText('암호'), '맞는암호{Enter}')
  await screen.findByLabelText('단원')
}

beforeEach(() => {
  decrypt.mockReset()
  vi.stubGlobal('crypto', { subtle: {} })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('KeywordQuizPage', () => {
  it('처음에는 암호 입력만 보이고 키워드 내용은 보이지 않는다', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: '키워드 퀴즈' })).toBeInTheDocument()
    // 입력한 글자를 그대로 보여 준다(사용자 결정). 대신 브라우저가 입력 기록으로 남기지 않게 자동완성을 끈다.
    const input = screen.getByLabelText('암호')
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('autocomplete', 'off')
    expect(input).toHaveAttribute('autocapitalize', 'off')
    expect(input).toHaveAttribute('spellcheck', 'false')
    expect(screen.getByRole('button', { name: '열기' })).toBeInTheDocument()
    expect(screen.queryByText(/용어1|요약1/)).toBeNull()
    expect(screen.queryByText(/키워드 \d+개/)).toBeNull()
  })

  it('틀린 암호면 안내를 보이고 입력을 비운다', async () => {
    const user = userEvent.setup()
    decrypt.mockRejectedValueOnce(new WrongPassphraseError('암호가 틀렸다'))
    renderPage()

    await user.type(screen.getByLabelText('암호'), '틀린암호')
    await user.click(screen.getByRole('button', { name: '열기' }))

    expect(await screen.findByText('암호가 맞지 않습니다.')).toBeInTheDocument()
    expect(screen.getByLabelText('암호')).toHaveValue('')
    expect(screen.getByLabelText('암호')).toHaveFocus()
    expect(decrypt).toHaveBeenCalledWith(encrypted, '틀린암호')
  })

  it('그 밖의 에러면 열 수 없다고 안내한다', async () => {
    const user = userEvent.setup()
    decrypt.mockRejectedValueOnce(new Error('형식 오류'))
    renderPage()

    await user.type(screen.getByLabelText('암호'), '암호{Enter}')

    expect(await screen.findByText('열 수 없습니다.')).toBeInTheDocument()
  })

  it('crypto.subtle이 없으면 안내를 보이고 복호화를 부르지 않는다', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('crypto', {})
    renderPage()

    await user.type(screen.getByLabelText('암호'), '암호{Enter}')

    expect(await screen.findByText('이 주소에서는 열 수 없습니다. HTTPS나 localhost에서 열어 주세요.')).toBeInTheDocument()
    expect(decrypt).not.toHaveBeenCalled()
  })

  it('여는 동안에는 버튼을 비활성화하고 여는 중으로 표시한다', async () => {
    const user = userEvent.setup()
    decrypt.mockReturnValueOnce(new Promise(() => {}))
    renderPage()

    await user.type(screen.getByLabelText('암호'), '암호{Enter}')

    expect(screen.getByRole('button', { name: '여는 중' })).toBeDisabled()
  })

  it('맞는 암호면 선택 단계로 가고 암호 입력이 사라진다', async () => {
    const user = userEvent.setup()
    await unlock(user)

    expect(screen.queryByLabelText('암호')).toBeNull()
    expect(screen.getByRole('button', { name: '요약 보고 키워드 고르기' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '키워드 보고 요약 고르기' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: '플래시카드' })).toHaveAttribute('aria-pressed', 'false')
    // 특징 문항은 요약 보고 키워드 고르기에 섞였으므로 따로 모드가 없다(사용자 결정).
    expect(screen.queryByRole('button', { name: '특징 보고 키워드 고르기' })).toBeNull()
  })

  // 문항 수는 고르지 않는다. 고른 범위의 키워드를 모두 섞어 한 판으로 푼다(사용자 결정).
  it('문항 수 선택은 없다', async () => {
    const user = userEvent.setup()
    await unlock(user)

    expect(screen.queryByRole('group', { name: '문항 수' })).toBeNull()
    for (const name of ['10', '20', '전체']) {
      expect(screen.queryByRole('button', { name })).toBeNull()
    }
  })

  it('요약 보고 키워드 고르기는 키워드 수와 특징 수를 보이고, 요약 문항과 특징 문항을 섞어 낸다', async () => {
    const user = userEvent.setup()
    await unlock(user)
    expect(screen.getByText('키워드 12개 · 특징 3개')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '시작' }))

    expect(screen.getByRole('heading', { name: '정의 보고 용어 고르기' })).toBeInTheDocument()
    expect(screen.getByText('1 / 15')).toBeInTheDocument()
  })

  it('키워드 보고 요약 고르기는 옳지 않은 것 고르기 수를, 플래시카드는 키워드 수만 보인다', async () => {
    const user = userEvent.setup()
    await unlock(user)

    await user.click(screen.getByRole('button', { name: '키워드 보고 요약 고르기' }))
    expect(screen.getByText('키워드 12개 · 옳지 않은 것 고르기 1개')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '플래시카드' }))
    expect(screen.getByText('키워드 12개')).toBeInTheDocument()
  })

  it('키워드 보고 요약 고르기로 시작하면 해당 러너가 나오고, 옳지 않은 것 고르기 문항도 섞어 낸다', async () => {
    const user = userEvent.setup()
    await unlock(user)

    await user.click(screen.getByRole('button', { name: '키워드 보고 요약 고르기' }))
    await user.click(screen.getByRole('button', { name: '시작' }))

    expect(screen.getByRole('heading', { name: '용어 보고 정의 고르기' })).toBeInTheDocument()
    expect(screen.getByText('1 / 13')).toBeInTheDocument()
  })

  it('플래시카드로 시작하면 플래시카드가 나온다', async () => {
    const user = userEvent.setup()
    await unlock(user)

    await user.click(screen.getByRole('button', { name: '플래시카드' }))
    await user.click(screen.getByRole('button', { name: '시작' }))

    expect(screen.getByRole('heading', { name: '플래시카드' })).toBeInTheDocument()
    expect(screen.getByText('1 / 12')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '뒤집기' })).toBeInTheDocument()
  })

  it('처음으로를 누르면 선택 단계로 돌아가고 암호를 다시 묻지 않는다', async () => {
    const user = userEvent.setup()
    await unlock(user)
    await user.click(screen.getByRole('button', { name: '플래시카드' }))
    await user.click(screen.getByRole('button', { name: '시작' }))

    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByRole('button', { name: '뒤집기' }))
      await user.click(screen.getByRole('button', { name: '알았음' }))
    }
    await user.click(screen.getByRole('button', { name: '처음으로' }))

    expect(screen.getByText('키워드 12개')).toBeInTheDocument()
    expect(screen.queryByLabelText('암호')).toBeNull()
    expect(decrypt).toHaveBeenCalledTimes(1)
  })

  it('한 판 더를 누르면 같은 모드로 처음부터 다시 푼다', async () => {
    const user = userEvent.setup()
    await unlock(user)
    await user.click(screen.getByRole('button', { name: '플래시카드' }))
    await user.click(screen.getByRole('button', { name: '시작' }))
    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByRole('button', { name: '뒤집기' }))
      await user.click(screen.getByRole('button', { name: '몰랐음' }))
    }

    await user.click(screen.getByRole('button', { name: '한 판 더' }))

    expect(screen.getByRole('heading', { name: '플래시카드' })).toBeInTheDocument()
    expect(screen.getByText('1 / 12')).toBeInTheDocument()
  })

  it('단원을 고르면 그 단원의 키워드 수를 보이고, 그 단원 키워드를 모두 푼다', async () => {
    const user = userEvent.setup()
    await unlock(user)
    const select = screen.getByLabelText('단원')
    expect(select).toHaveValue('')
    expect(screen.getByRole('option', { name: '전체 단원 (12)' })).toBeInTheDocument()

    await user.selectOptions(select, '단원B')
    expect(screen.getByText('키워드 6개')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '시작' }))

    expect(screen.getByText('1 / 6')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toMatch(/^요약(7|8|9|10|11|12)$/)
  })

  it('단원을 골라 플래시카드를 넘기면 그 단원 카드만 나온다', async () => {
    const user = userEvent.setup()
    await unlock(user)
    await user.selectOptions(screen.getByLabelText('단원'), '단원A')
    await user.click(screen.getByRole('button', { name: '플래시카드' }))
    await user.click(screen.getByRole('button', { name: '시작' }))

    expect(screen.getByText('1 / 6')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 }).textContent).toMatch(/^용어[1-6]$/)
  })

  it('돌아가기로 선택 화면에 오면 고른 단원이 그대로다', async () => {
    const user = userEvent.setup()
    await unlock(user)
    await user.selectOptions(screen.getByLabelText('단원'), '단원B')
    await user.click(screen.getByRole('button', { name: '시작' }))
    await user.click(screen.getByRole('button', { name: '돌아가기' }))

    expect(screen.getByLabelText('단원')).toHaveValue('단원B')
    expect(screen.getByText('키워드 6개')).toBeInTheDocument()
  })

  it('특징이 있는 단원을 고르면 그 단원에 나온 특징도 함께 푼다', async () => {
    const user = userEvent.setup()
    await unlock(user)
    await user.selectOptions(screen.getByLabelText('단원'), '단원A')
    expect(screen.getByText('키워드 6개 · 특징 3개')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '시작' }))
    expect(screen.getByText('1 / 9')).toBeInTheDocument()
  })

  it('localStorage에 아무것도 쓰지 않는다', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const user = userEvent.setup()
    await unlock(user)
    await user.click(screen.getByRole('button', { name: '시작' }))
    await user.click(screen.getAllByRole('button').find((button) => /^용어\d+$/.test(button.textContent ?? ''))!)

    expect(setItem).not.toHaveBeenCalled()
  })
})
