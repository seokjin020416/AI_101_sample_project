import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePaperForm } from '../components/Layout';
import { ConceptStatusBadge, Icon, PassProgress, SourceBadge, btn } from '../components/ui';
import { STATUS_LABEL } from '../lib/guide';
import { LIMITS, allTags, conceptStatus, conceptsForPaper, filterPapers, formatRelative, summary, type StatusFilter } from '../lib/logic';
import { useStore } from '../lib/store';
import type { Concept, Paper } from '../lib/types';

const FILTERS: StatusFilter[] = ['all', 'toread', 'pass1', 'pass2', 'pass3', 'onhold'];

const CTA: Record<Paper['status'], string> = {
  toread: 'Pass 1 훑기 시작',
  pass1: 'Pass 2 이어서 읽기',
  pass2: 'Pass 3 깊이 읽기',
  pass3: '노트 열람',
  onhold: '보류 중 · 노트 보기',
};

function PaperCard({ paper, concepts }: { paper: Paper; concepts: Concept[] }) {
  const mine = conceptsForPaper(concepts, paper.id);
  const unresolved = mine.filter((c) => conceptStatus(c) !== 'understood');
  const problem = paper.notes[1]?.q2?.trim();
  const done = paper.status === 'pass3';

  return (
    <article className="flex flex-col rounded-lg border border-line bg-white p-6 transition-shadow hover:shadow-overlay" data-testid="paper-card">
      <div className="mb-3 flex items-center gap-2">
        <SourceBadge source={paper.source} />
        <span className="truncate font-mono text-xs text-ink-4">{[paper.venue, paper.year].filter(Boolean).join(' · ')}</span>
        <span
          className={`ml-auto inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
            done ? 'bg-st-understood-bg text-st-understood' : paper.status === 'onhold' ? 'bg-src-other-bg text-ink-4' : 'bg-tint text-accent-dark'
          }`}
        >
          <PassProgress status={paper.status} />
          {STATUS_LABEL[paper.status]}
        </span>
      </div>

      <Link to={`/papers/${paper.id}`} className="font-serif text-[22px] font-semibold leading-snug text-ink hover:text-accent">
        {paper.title}
      </Link>
      {paper.authors && <p className="mt-1.5 truncate text-sm text-ink-3">{paper.authors}</p>}

      <div className="mt-4 rounded bg-tint px-4 py-3 text-sm leading-relaxed">
        {problem ? (
          <p className="line-clamp-2 text-ink-2">“{problem}”</p>
        ) : (
          <p className="italic text-ink-4">아직 '이 논문이 푸는 문제'를 적지 않았어요. 제목, 초록, 그림부터 훑어보세요.</p>
        )}
      </div>

      <div className="mt-4 flex min-h-[26px] flex-wrap items-center gap-2">
        {mine.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded border border-line bg-canvas px-2 py-0.5 text-xs font-semibold text-ink-4">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-5" />
            기록한 개념 없음
          </span>
        ) : unresolved.length > 0 ? (
          <>
            <span className="inline-flex items-center gap-1.5 rounded border border-st-unknown-bd bg-st-unknown-bg px-2 py-0.5 text-xs font-semibold text-st-unknown">
              <span className="h-1.5 w-1.5 rounded-full bg-st-unknown" />
              모르는 개념 {unresolved.length}
            </span>
            <span className="truncate font-mono text-xs text-ink-3">{unresolved.map((c) => c.name).join(', ')}</span>
          </>
        ) : (
          <>
            <ConceptStatusBadge concept={{ explanation: 'x', links: [] }} />
            <span className="text-xs text-st-understood">개념 {mine.length}개 모두 정리 완료</span>
          </>
        )}
      </div>

      {paper.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {paper.tags.map((t) => (
            <span key={t} className="rounded-sm bg-src-other-bg px-2 py-0.5 font-mono text-xs text-ink-3">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="min-h-5 flex-1" />
      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="font-mono text-xs text-ink-4">최근 수정: {formatRelative(paper.updatedAt)}</span>
        <Link to={`/papers/${paper.id}`} className="inline-flex items-center gap-1 text-[15px] font-semibold text-accent hover:underline">
          {CTA[paper.status]} <Icon name="arrowRight" />
        </Link>
      </div>
    </article>
  );
}

export function Dashboard() {
  const { data } = useStore();
  const { openAdd } = usePaperForm();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [tags, setTags] = useState<string[]>([]);

  const tagOptions = useMemo(() => allTags(data.papers), [data.papers]);
  const list = useMemo(() => filterPapers(data.papers, status, tags, query), [data.papers, status, tags, query]);
  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: 0, toread: 0, pass1: 0, pass2: 0, pass3: 0, onhold: 0 };
    for (const p of data.papers) {
      c[p.status]++;
      if (p.status !== 'onhold') c.all++;
    }
    return c;
  }, [data.papers]);
  const s = summary(data);

  const toggleTag = (t: string) => setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
  const resetFilters = () => {
    setQuery('');
    setStatus('all');
    setTags([]);
  };

  return (
    <>
      <section className="border-b border-line bg-tint">
        <div className="mx-auto flex max-w-page items-end justify-between px-10 py-8">
          <div className="border-l-4 border-accent pl-4">
            <p className="font-mono text-xs tracking-wider text-ink-4">METHODOLOGY DASHBOARD · S. KESHAV 3-PASS</p>
            <h1 className="mt-1 text-[32px] font-bold tracking-tight text-ink">연구 논문 독해 현황</h1>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-line bg-white px-5 py-3 text-[15px]">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" /> 읽는 중 <b className="rounded bg-tint px-1.5 font-mono">{s.reading}</b>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-st-understood" /> 완료 <b className="rounded bg-st-understood-bg px-1.5 font-mono text-st-understood">{s.done}</b>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-st-unknown" /> 미해결 개념 <b className="rounded bg-st-unknown-bg px-1.5 font-mono text-st-unknown">{s.unresolved}</b>
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-page px-10 py-8">
        {data.papers.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-white px-10 py-20 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tint text-accent">
              <Icon name="book" className="h-7 w-7" />
            </span>
            <p className="text-lg font-semibold text-ink">아직 등록한 논문이 없어요. 첫 논문을 추가해 보세요.</p>
            <p className="mt-2 max-w-lg text-sm text-ink-3">IEEE Xplore, Google Scholar, arXiv에서 찾은 논문의 제목과 링크만 있으면 시작할 수 있어요.</p>
            <button type="button" onClick={openAdd} className={btn('primary', 'mt-6')}>
              <Icon name="plus" /> 논문 추가
            </button>
          </div>
        ) : (
          <>
            <section className="rounded-lg border border-line bg-white p-6">
              <div className="flex gap-3">
                <label className="relative flex-1">
                  <span className="sr-only">논문 검색</span>
                  <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
                  <input
                    type="search"
                    value={query}
                    maxLength={LIMITS.search}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="논문 제목, 저자, 태그 검색… (예: PAM4, Volterra, Kim)"
                    className="w-full rounded border border-transparent bg-tint py-2.5 pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-5 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="상태 필터">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatus(f)}
                    aria-pressed={status === f}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                      status === f ? 'border-primary bg-primary text-white' : 'border-line bg-tint text-ink-2 hover:border-line-strong'
                    }`}
                  >
                    {f === 'all' ? '전체' : STATUS_LABEL[f]} <span className="font-mono text-xs opacity-70">({counts[f]})</span>
                  </button>
                ))}
              </div>
              {tagOptions.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 font-mono text-xs text-ink-4">태그</span>
                  {tagOptions.map((t) => {
                    const on = tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        aria-pressed={on}
                        className={`rounded-sm px-2 py-0.5 font-mono text-xs transition-colors ${on ? 'bg-accent text-white' : 'bg-src-other-bg text-ink-3 hover:bg-line'}`}
                      >
                        #{t}
                      </button>
                    );
                  })}
                  {tags.length > 0 && (
                    <button type="button" onClick={() => setTags([])} className="ml-1 text-xs text-ink-4 underline hover:text-ink">
                      태그 해제
                    </button>
                  )}
                </div>
              )}
            </section>

            <div className="mb-4 mt-8 flex items-center justify-between">
              <h2 className="flex items-center gap-3 text-xl font-semibold text-ink">
                논문 목록 <span className="rounded bg-tint-strong px-2 py-0.5 font-mono text-xs text-ink-2">{list.length}건 표시 중</span>
              </h2>
              <div className="flex items-center gap-4 font-mono text-xs text-ink-4">
                <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-accent" /> 완료한 pass</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-ink/70" /> 다음 pass</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-st-understood" /> 3차까지 완료</span>
                <span>· 최근 수정순</span>
              </div>
            </div>

            {list.length === 0 ? (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-white px-10 py-14 text-center">
                <p className="text-base font-semibold text-ink">조건에 맞는 논문이 없습니다.</p>
                <button type="button" onClick={resetFilters} className={btn('secondary', 'mt-4')}>
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {list.map((p) => (
                  <PaperCard key={p.id} paper={p} concepts={data.concepts} />
                ))}
              </div>
            )}
          </>
        )}

        <section className="mt-10 flex items-center gap-5 rounded-lg border border-tint-strong bg-tint px-7 py-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white text-accent">
            <Icon name="bulb" className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-ink">S. Keshav 3-Pass 읽기법</h3>
            <p className="mt-1 text-sm text-ink-3">
              1차(훑기 5~10분: 제목·초록·서론·그림·결론) → 2차(이해 약 1시간: 본문 전체, 수식 유도는 건너뛰기) → 3차(깊이 수 시간: 가정과 한계, 재현 가능성). 대부분의 논문은 1차에서 끝나도 괜찮아요.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
