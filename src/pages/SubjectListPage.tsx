import { Link } from 'react-router-dom'
import { subjects as defaultSubjects } from '../data'
import type { Subject } from '../types/subject'

export function SubjectListPage({ subjects = defaultSubjects }: { subjects?: Subject[] }) {
  return (
    <section className="max-w-3xl space-y-8 break-keep break-anywhere">
      <h1 className="text-2xl font-semibold text-title">과목</h1>
      <div className="grid gap-3">
        {subjects.map((subject) => (
          <Link
            className="rounded-lg border border-neutral-800 bg-panel p-5 transition-colors hover:border-neutral-700"
            key={subject.id}
            to={`/${subject.id}`}
          >
            <h2 className="text-lg font-medium text-neutral-100">{subject.title}</h2>
            <p className="mt-3 text-xs text-neutral-500">
              주제 {subject.topics.length}개 · 문항 {subject.questions.length}개
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
