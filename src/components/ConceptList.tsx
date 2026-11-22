import { Fragment, type ComponentType } from 'react'
import { groupConcepts } from '../lib/concept-groups'
import { markFirstOccurrences } from '../lib/glossary'
import { groupParagraphs, stripListMarker, type SubBlock } from '../lib/paragraph-blocks'
import type { Concept } from '../types/content'
import type { GlossaryTerm } from '../types/visuals'
import { diagramsByConceptId, stepFiguresByConceptId, summaryFiguresByConceptId } from './diagrams/registry'
import { EmphasizedText } from './EmphasizedText'

interface ConceptListProps {
  concepts: Concept[]
  // 개념 읽기 화면은 주제 제목이 h1이라 개념이 h2다. 확인 문제의 펼치기는 제목·문제문·
  // 주제 제목이 h1·h2·h3를 쓰고 있어 개념이 h4가 된다.
  headingLevel: 2 | 4
  diagrams?: Record<string, ComponentType | ComponentType[]>
  // 단계 목록의 번호 항목마다 끼우는 단계 그림(ADR-050).
  stepFigures?: Record<string, ComponentType<{ step: number }>>
  // 한 줄 요약 바로 아래, 본문보다 앞에 끼우는 표.
  summaryFigures?: Record<string, ComponentType>
  // 주제의 약어 사전(ADR-037). 개념마다 약어가 처음 나오는 한 곳에만 툴팁을 단다.
  glossary?: GlossaryTerm[]
}

// 개념 읽기 화면과 확인 문제의 개념 펼치기가 같은 본문을 렌더한다.
// 둘이 갈라지면 같은 개념이 화면에 따라 다르게 보인다.
// `- `로 시작하는 문단은 목록 항목이다(ADR-046). `N. `로 시작하는 문단은 단계 목록이다(ADR-050).
export function ConceptList({
  concepts,
  headingLevel,
  diagrams = diagramsByConceptId,
  stepFigures = stepFiguresByConceptId,
  summaryFigures = summaryFiguresByConceptId,
  glossary,
}: ConceptListProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h4'
  const ChildHeading = headingLevel === 2 ? 'h3' : 'h5'

  function renderConcept(concept: Concept, Heading: 'h2' | 'h3' | 'h4' | 'h5') {
    const Diagram = diagrams[concept.id]
    const StepFigure = stepFigures[concept.id]
    const SummaryFigure = summaryFigures[concept.id]
    // 요약과 문단을 한 번에 넘겨야 개념 안에서 처음 나오는 자리 하나만 표시된다.
    const segments = glossary
      ? markFirstOccurrences([concept.summary, ...concept.paragraphs.map(stripListMarker)], glossary.map(({ term }) => term))
      : undefined
    const glossaryAt = (index: number) => (segments && glossary ? { segments: segments[index], terms: glossary } : undefined)

    // 번호 항목 아래의 하위 글머리(1단은 disc, 2단은 circle)와 이어지는 문단.
    function renderSubBlocks(blocks: SubBlock[], nested: boolean) {
      return blocks.map((block) => (
        block.kind === 'paragraph' ? (
          <p className="mt-2" key={`${concept.id}-${block.index}`}>
            <EmphasizedText glossary={glossaryAt(block.index + 1)} text={block.text} />
          </p>
        ) : (
          <ul
            className={`mt-2 ${nested ? 'list-[circle]' : 'list-disc'} space-y-2 pl-5 marker:text-neutral-500`}
            key={`${concept.id}-${block.items[0].index}`}
          >
            {block.items.map(({ index, text, children }) => (
              <li className="break-keep" key={`${concept.id}-${index}`}>
                <EmphasizedText glossary={glossaryAt(index + 1)} text={text} />
                {renderSubBlocks(children, true)}
              </li>
            ))}
          </ul>
        )
      ))
    }

    return (
      <article className="space-y-3 scroll-mt-24" id={concept.id} key={concept.id}>
        <div className="space-y-1">
          <Heading className="text-base font-medium text-neutral-100">{concept.name}</Heading>
          <p className="text-sm text-neutral-400"><EmphasizedText glossary={glossaryAt(0)} text={concept.summary} /></p>
        </div>
        {SummaryFigure && <SummaryFigure />}
        <div className="space-y-3">
          {groupParagraphs(concept.paragraphs).map((block) => (
            block.kind === 'paragraph' ? (
              <p className="whitespace-pre-line break-keep text-[15px] leading-7 text-neutral-300" key={`${concept.id}-${block.index}`}>
                <EmphasizedText glossary={glossaryAt(block.index + 1)} text={block.text} />
              </p>
            ) : block.kind === 'steps' ? (
              <ol
                className="list-decimal space-y-4 pl-7 text-[15px] leading-7 text-neutral-300 marker:text-neutral-500"
                key={`${concept.id}-${block.items[0].index}`}
                start={block.start}
              >
                {block.items.map(({ index, number, text, children }) => (
                  <li className="break-keep" key={`${concept.id}-${index}`}>
                    <EmphasizedText glossary={glossaryAt(index + 1)} text={text} />
                    {StepFigure && <StepFigure step={number} />}
                    {renderSubBlocks(children, false)}
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="list-disc space-y-2 pl-5 text-[15px] leading-7 text-neutral-300 marker:text-neutral-500" key={`${concept.id}-${block.items[0].index}`}>
                {block.items.map(({ index, text }) => (
                  <li className="break-keep" key={`${concept.id}-${index}`}>
                    <EmphasizedText glossary={glossaryAt(index + 1)} text={text} />
                  </li>
                ))}
              </ul>
            )
          ))}
        </div>
        {Array.isArray(Diagram)
          ? Diagram.map((Component, index) => <Component key={index} />)
          : Diagram && <Diagram />}
      </article>
    )
  }

  return (
    <div className="space-y-8">
      {groupConcepts(concepts).map(({ concept, children }) => (
        <Fragment key={concept.id}>
          {renderConcept(concept, Heading)}
          {children.length > 0 && (
            <div className="space-y-8 border-l border-border pl-4 max-sm:[&_figure]:-ml-[37px]">
              {children.map((child) => renderConcept(child, ChildHeading))}
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}
