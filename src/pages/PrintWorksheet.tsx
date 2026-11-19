import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Icon, btn } from '../components/ui';
import { PASS_GUIDES, SOURCE_META, STATUS_LABEL } from '../lib/guide';
import { unresolvedForPaper } from '../lib/logic';
import { useStore } from '../lib/store';

function Lines({ n }: { n: number }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="h-[9mm] border-b border-dotted border-ink-5" />
      ))}
    </div>
  );
}

/** A4 portrait worksheet for pass 3 (PRD §5 Screen 5). */
export function PrintWorksheet() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { data } = useStore();
  const paper = data.papers.find((p) => p.id === id);

  useEffect(() => {
    if (!paper || params.get('auto') !== '1') return;
    // Wait for web fonts so the print preview uses the final layout.
    let cancelled = false;
    const ready = document.fonts?.ready ?? Promise.resolve();
    ready.then(() => window.setTimeout(() => !cancelled && window.print(), 150));
    return () => {
      cancelled = true;
    };
  }, [paper, params]);

  if (!paper) {
    return (
      <div className="mx-auto max-w-page px-10 py-20 text-center">
        <p className="text-lg font-semibold text-ink">논문을 찾을 수 없어요.</p>
        <Link to="/" className={btn('secondary', 'mt-4')}>
          논문 목록으로
        </Link>
      </div>
    );
  }

  const unresolved = unresolvedForPaper(data.concepts, paper.id);
  const p1 = PASS_GUIDES[1];
  const p2 = PASS_GUIDES[2];
  const p3 = PASS_GUIDES[3];
  const ans = (pass: 1 | 2 | 3, q: string) => paper.notes[pass]?.[q]?.trim() ?? '';

  return (
    <div className="min-h-screen bg-canvas pb-16 print:bg-white print:pb-0">
      <div className="sticky top-0 z-10 border-b border-line bg-tint print:hidden">
        <div className="mx-auto flex max-w-[210mm] items-center gap-4 py-4">
          <Icon name="print" className="h-6 w-6 text-accent" />
          <div className="flex-1">
            <p className="font-semibold text-ink">A4 3차 읽기 워크시트</p>
            <p className="text-xs text-ink-3">브라우저 인쇄(Ctrl+P / Cmd+P)로 A4 세로, 흑백으로 출력하세요. 버튼과 메뉴는 인쇄되지 않아요.</p>
          </div>
          <Link to={`/papers/${paper.id}`} className={btn('secondary')}>
            <Icon name="x" /> 닫기
          </Link>
          <button type="button" onClick={() => window.print()} className={btn('primary')}>
            <Icon name="print" /> 인쇄
          </button>
        </div>
      </div>

      <div className="worksheet mx-auto mt-8 max-w-[210mm] text-black print:mt-0">
        {/* ---- Sheet 1 ---- */}
        <section className="sheet bg-white px-[15mm] py-[15mm] shadow-overlay print:p-0 print:shadow-none">
          <header className="flex items-start justify-between border-b-2 border-black pb-3">
            <div>
              <p className="font-serif text-2xl font-semibold">
                PaperPass <span className="ml-1 align-middle font-mono text-[10px] tracking-wider">3-PASS METHOD</span>
              </p>
              <p className="text-xs">3차 읽기 워크시트 (Pass 3: Critical Analysis &amp; Reproducibility)</p>
            </div>
            <div className="text-right font-mono text-[11px] leading-5">
              <p>날짜: ______년 ____월 ____일</p>
              <p>이름: ____________________</p>
            </div>
          </header>

          <div className="mt-4">
            <h1 className="font-serif text-[20px] font-semibold leading-snug">{paper.title}</h1>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[12px]">
              {paper.authors && (
                <>
                  <dt className="font-semibold">저자</dt>
                  <dd>{paper.authors}</dd>
                </>
              )}
              <dt className="font-semibold">게재처</dt>
              <dd>
                {[paper.venue, paper.year].filter(Boolean).join(', ') || '—'} · 출처 {SOURCE_META[paper.source].label} · 현재 상태 {STATUS_LABEL[paper.status]}
              </dd>
              {paper.link && (
                <>
                  <dt className="font-semibold">링크</dt>
                  <dd className="break-all font-mono text-[11px]">{paper.link}</dd>
                </>
              )}
            </dl>
          </div>

          <h2 className="mt-6 border-b border-black pb-1 text-[14px] font-bold">1·2차 읽기 요약</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 text-[11.5px] leading-[1.55]">
            <div className="rounded border border-ink-5 p-3">
              <p className="mb-1.5 font-bold">1차 · {p1.short}</p>
              {(['q2', 'q3', 'q4'] as const).map((q) => {
                const qq = p1.questions.find((x) => x.id === q)!;
                return (
                  <div key={q} className="mb-1.5">
                    <p className="font-semibold">{qq.text}</p>
                    <p className="whitespace-pre-line">{ans(1, q) || <span className="text-ink-4">(미작성)</span>}</p>
                  </div>
                );
              })}
            </div>
            <div className="rounded border border-ink-5 p-3">
              <p className="mb-1.5 font-bold">2차 · {p2.short}</p>
              {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => {
                const qq = p2.questions.find((x) => x.id === q)!;
                return (
                  <div key={q} className="mb-1.5">
                    <p className="font-semibold">{qq.text}</p>
                    <p className="whitespace-pre-line">{ans(2, q) || <span className="text-ink-4">(미작성)</span>}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <h2 className="mt-6 flex items-baseline justify-between border-b border-black pb-1 text-[14px] font-bold">
            미해결 전제 개념 체크리스트 <span className="font-mono text-[11px] font-normal">{unresolved.length}개</span>
          </h2>
          {unresolved.length === 0 ? (
            <p className="mt-3 text-[12px]">미해결 개념이 없어요. 3차 읽기 중 새로 막히는 개념을 아래에 적으세요.</p>
          ) : (
            <ol className="mt-2">
              {unresolved.map((c) => {
                const loc = c.occurrences.find((o) => o.paperId === paper.id)?.location;
                return (
                  <li key={c.id} className="break-inside-avoid border-b border-ink-5 py-2">
                    <div className="flex items-baseline gap-2 text-[12.5px]">
                      <span className="inline-block h-3.5 w-3.5 shrink-0 translate-y-0.5 border border-black" />
                      <span className="font-semibold">{c.name}</span>
                      {loc && <span className="ml-auto font-mono text-[11px]">{loc}</span>}
                    </div>
                    <div className="ml-5 mt-1 h-[9mm] border-b border-dotted border-ink-5 text-[10px] text-ink-4">내 말로:</div>
                  </li>
                );
              })}
            </ol>
          )}
          <div className="mt-2 text-[11px] font-semibold">3차 읽기 중 새로 막힌 개념</div>
          <Lines n={3} />

          <p className="mt-4 text-center font-mono text-[10px]">PaperPass · Sheet 1 / 2</p>
        </section>

        <div className="page-break my-8 flex items-center gap-3 print:my-0" aria-hidden="true">
          <span className="h-px flex-1 bg-line-strong print:hidden" />
          <span className="rounded-full bg-tint px-3 py-1 font-mono text-xs text-ink-3 print:hidden">페이지 구분 (2쪽)</span>
          <span className="h-px flex-1 bg-line-strong print:hidden" />
        </div>

        {/* ---- Sheet 2 ---- */}
        <section className="sheet bg-white px-[15mm] py-[15mm] shadow-overlay print:p-0 print:shadow-none">
          <header className="flex items-baseline justify-between border-b-2 border-black pb-2">
            <h2 className="text-[18px] font-bold">Pass 3 · {p3.short} — 가정, 재현, 연결</h2>
            <span className="max-w-[45%] truncate font-mono text-[10px]">{paper.title}</span>
          </header>
          {p3.questions.map((q, i) => {
            const existing = ans(3, q.id);
            return (
              <div key={q.id} className="mt-5 break-inside-avoid">
                <p className="text-[13px] font-bold">
                  Q{i + 1}. {q.text}
                </p>
                <p className="text-[11px] text-ink-3">{q.hint}</p>
                {existing && <p className="mt-1 whitespace-pre-line border-l-2 border-black pl-2 text-[11.5px]">{existing}</p>}
                <Lines n={existing ? 3 : 5} />
              </div>
            );
          })}
          <p className="mt-6 text-center font-mono text-[10px]">PaperPass · Sheet 2 / 2</p>
        </section>
      </div>
    </div>
  );
}
