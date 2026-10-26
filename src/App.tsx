import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { SubjectScope } from './components/SubjectScope'
import { subjects as defaultSubjects } from './data'
import { useSubject } from './hooks/useSubject'
import { ConceptReadPage } from './pages/ConceptReadPage'
import { KeywordQuizPage } from './pages/KeywordQuizPage'
import { QuizPage } from './pages/QuizPage'
import { RandomQuizPage } from './pages/RandomQuizPage'
import { RandomStartPage } from './pages/RandomStartPage'
import { ReviewPage } from './pages/ReviewPage'
import { ReviewQuizPage } from './pages/ReviewQuizPage'
import { SearchPage } from './pages/SearchPage'
import { SubjectListPage } from './pages/SubjectListPage'
import { TopicListPage } from './pages/TopicListPage'
import type { Subject } from './types/subject'

// 과목 접두사 없는 예전 주소(#/topic/…)는 과목이 AWS 하나였을 때만 만들어졌다.
const LEGACY_SUBJECT_ID = 'aws'

// 북마크·공유한 주소와 화면에 남은 예전 링크가 이 길로 들어온다.
// 검색어(?q=)와 개념 앵커(#개념id, ADR-020)를 그대로 붙여야 착지한 화면이 같은 상태로 열린다.
function LegacyRedirect() {
  const { pathname, search, hash } = useLocation()
  return <Navigate replace to={`/${LEGACY_SUBJECT_ID}${pathname}${search}${hash}`} />
}

function SubjectHomeRedirect() {
  return <Navigate replace to={`/${useSubject().id}`} />
}

function SubjectKeywordQuiz() {
  return useSubject().hasKeywordQuiz ? <KeywordQuizPage /> : <SubjectHomeRedirect />
}

export function AppRoutes({ subjects = defaultSubjects }: { subjects?: Subject[] }) {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<SubjectListPage subjects={subjects} />} />
        <Route path="topic/*" element={<LegacyRedirect />} />
        <Route path="review/*" element={<LegacyRedirect />} />
        <Route path="search" element={<LegacyRedirect />} />
        <Route path="random/*" element={<LegacyRedirect />} />
        <Route path="keywords" element={<LegacyRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      {/* 위 Layout 라우트의 자식으로 넣으면 헤더가 두 번 그려진다. */}
      <Route path=":subjectId" element={<SubjectScope subjects={subjects} />}>
        <Route element={<Layout />}>
          <Route index element={<TopicListPage />} />
          <Route path="topic/:topicId" element={<ConceptReadPage />} />
          <Route path="topic/:topicId/quiz" element={<QuizPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="review/quiz" element={<ReviewQuizPage />} />
          <Route path="review/quiz/:topicId" element={<ReviewQuizPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="random" element={<RandomStartPage />} />
          <Route path="random/:count" element={<RandomQuizPage />} />
          <Route path="keywords" element={<SubjectKeywordQuiz />} />
          <Route path="*" element={<SubjectHomeRedirect />} />
        </Route>
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ErrorBoundary>
  )
}

export default App
