import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CONCEPT_STATUS_STYLE, CharCount, ConceptStatusBadge, FieldError, Icon, Modal, btn, inputCls } from '../components/ui';
import { LIMITS, conceptStatus, deleteConcept, formatRelative, isValidUrl, mergeConcepts, sortConcepts, updateConcept } from '../lib/logic';
import { useStore } from '../lib/store';
import type { Concept, ConceptStatus, Paper } from '../lib/types';

type Filter = 'all' | ConceptStatus;
type Sort = 'default' | 'name' | 'recent';

function linkLabel(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '') + (u.pathname.length > 1 ? u.pathname.slice(0, 24) + (u.pathname.length > 24 ? '…' : '') : '');
  } catch {
    return url;
  }
}

function ConceptCard({
  concept,
  papers,
  selected,
  onToggleSelect,
  autoEdit,
}: {
  concept: Concept;
  papers: Paper[];
  selected: boolean;
  onToggleSelect: () => void;
  autoEdit: boolean;
}) {
  const { update, toast } = useStore();
  const [editing, setEditing] = useState(autoEdit);
  const [showPapers, setShowPapers] = useState(false);
  const [expl, setExpl] = useState(concept.explanation);
  const [links, setLinks] = useState<string[]>(concept.links);
  const [linkErr, setLinkErr] = useState<string>();
  const ref = useRef<HTMLElement>(null);
  const st = conceptStatus(concept);

  useEffect(() => {
    if (autoEdit) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ref.current?.querySelector('textarea')?.focus({ preventScroll: true });
    }
  }, [autoEdit]);

  const startEdit = () => {
    setExpl(concept.explanation);
    setLinks(concept.links.length ? concept.links : []);
    setLinkErr(undefined);
    setEditing(true);
  };

  const save = () => {
    const clean = links.map((l) => l.trim()).filter(Boolean);
    if (clean.some((l) => !isValidUrl(l) || l.length > 500)) {
      setLinkErr('http:// 또는 https://로 시작하는 주소를 입력해 주세요.');
      return;
    }
    const next = { explanation: expl.trim().slice(0, LIMITS.explanation), links: clean.slice(0, LIMITS.conceptLinks) };
    update((d) => updateConcept(d, concept.id, next));
    const newStatus = conceptStatus(next);
    toast({
      kind: 'success',
      title: newStatus === 'understood' ? `'${concept.name}' 이해함으로 정리했어요` : newStatus === 'lookedup' ? `'${concept.name}' 찾아봄으로 표시했어요` : '저장했어요',
    });
    setEditing(false);
  };

  const remove = () => {
    if (!window.confirm(`개념 '${concept.name}'을(를) 삭제할까요? 모든 논문에서 빠지며 되돌릴 수 없어요.`)) return;
    update((d) => deleteConcept(d, concept.id));
  };

  const paperOf = (id: string) => papers.find((p) => p.id === id);

  return (
    <article
      ref={ref}
      id={`concept-${concept.id}`}
      data-testid="concept-card"
      className={`rounded-lg border bg-white p-6 transition-shadow ${selected ? 'border-accent ring-2 ring-accent/20' : autoEdit ? 'border-accent' : 'border-line'}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="mt-2 h-4 w-4 cursor-pointer accent-[#2563eb]"
          aria-label={`${concept.name} 합치기 선택`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-[22px] font-semibold text-ink">{concept.name}</h3>
            <ConceptStatusBadge concept={concept} />
            {concept.occurrences.length >= 3 && <span className="rounded-sm bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">자주 등장</span>}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-4">
            <button type="button" onClick={() => setShowPapers((s) => !s)} className="inline-flex items-center gap-1 font-semibold text-ink-3 underline decoration-dotted hover:text-ink" aria-expanded={showPapers}>
              <Icon name="book" className="h-3.5 w-3.5" /> 등장 논문 {concept.occurrences.length}편
              <Icon name="chevronDown" className={`h-3.5 w-3.5 transition-transform ${showPapers ? 'rotate-180' : ''}`} />
            </button>
            <span>·</span>
            <span className="font-mono">최초 기록 {formatRelative(concept.createdAt)}</span>
          </div>
          {showPapers && (
            <ul className="mt-2 space-y-1 rounded border border-line bg-canvas p-3">
              {concept.occurrences.length === 0 && <li className="text-xs text-ink-4">연결된 논문이 없어요.</li>}
              {concept.occurrences.map((o) => {
                const p = paperOf(o.paperId);
                if (!p) return null;
                return (
                  <li key={o.paperId} className="flex items-baseline gap-2 text-sm">
                    <Link to={`/papers/${p.id}`} className="truncate text-ink-2 hover:text-accent hover:underline">
                      {p.title}
                    </Link>
                    {o.location && <span className="shrink-0 font-mono text-xs text-ink-4">{o.location}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {!editing && (
            <button type="button" onClick={startEdit} className={btn('ghost', 'px-2 py-1.5')} title="편집">
              <Icon name="edit" />
            </button>
          )}
          <button type="button" onClick={remove} className={btn('ghost', 'px-2 py-1.5 hover:text-danger')} title="개념 삭제" aria-label={`${concept.name} 삭제`}>
            <Icon name="trash" />
          </button>
        </div>
      </div>

      <div className="mt-4 pl-7">
        {editing ? (
          <div className="space-y-3 rounded border border-line bg-tint p-4">
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor={`expl-${concept.id}`} className="text-sm font-semibold text-ink">
                  내 말로 설명
                </label>
                <CharCount value={expl} max={LIMITS.explanation} />
              </div>
              <textarea
                id={`expl-${concept.id}`}
                rows={4}
                value={expl}
                maxLength={LIMITS.explanation}
                onChange={(e) => setExpl(e.target.value)}
                placeholder="교과서 정의를 베끼지 말고, 친구에게 설명하듯 써 보세요. 예: 앞뒤 심볼이 번져서 지금 심볼 판정을 방해하는 현상…"
                className={`${inputCls} leading-relaxed`}
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink">
                참고 링크 <span className="font-normal text-ink-4">(최대 {LIMITS.conceptLinks}개)</span>
              </p>
              <div className="space-y-2">
                {links.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={l}
                      onChange={(e) => {
                        setLinks((ls) => ls.map((x, j) => (j === i ? e.target.value : x)));
                        setLinkErr(undefined);
                      }}
                      placeholder="https://…"
                      aria-label={`참고 링크 ${i + 1}`}
                      className={`${inputCls} font-mono text-[13px]`}
                    />
                    <button type="button" onClick={() => setLinks((ls) => ls.filter((_, j) => j !== i))} className={btn('ghost', 'px-2')} aria-label="링크 삭제">
                      <Icon name="x" />
                    </button>
                  </div>
                ))}
                {links.length < LIMITS.conceptLinks && (
                  <button type="button" onClick={() => setLinks((ls) => [...ls, ''])} className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                    <Icon name="plus" className="h-3.5 w-3.5" /> 링크 추가
                  </button>
                )}
              </div>
              <FieldError msg={linkErr} />
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-ink-4">설명을 쓰면 '이해함', 링크만 있으면 '찾아봄'으로 바뀌어요.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(false)} className={btn('secondary')}>
                  취소
                </button>
                <button type="button" onClick={save} className={btn('primary')}>
                  <Icon name="check" /> 저장
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {concept.explanation ? (
              <div className="rounded bg-tint px-4 py-3">
                <p className="mb-1 text-xs font-semibold text-ink-3">내 말로 정리한 설명</p>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{concept.explanation}</p>
              </div>
            ) : (
              <button type="button" onClick={startEdit} className="flex w-full items-center justify-between rounded border border-dashed border-line-strong bg-tint/60 px-4 py-3 text-left hover:border-accent">
                <span className="text-sm italic text-ink-4">아직 정리된 내 말 설명이 없어요.</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  내 말로 설명하기 <Icon name="arrowRight" />
                </span>
              </button>
            )}
            {concept.links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {concept.links.map((l) => (
                  <a key={l} href={l} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded bg-tint px-2.5 py-1 font-mono text-xs text-accent-dark hover:underline">
                    <Icon name="link" className="h-3.5 w-3.5" /> {linkLabel(l)}
                  </a>
                ))}
              </div>
            )}
            {st === 'understood' && <p className="mt-3 text-right text-xs font-semibold text-st-understood">개념 정리 완료 ✓</p>}
          </>
        )}
      </div>
    </article>
  );
}

function MergeModal({ open, onClose, concepts, onMerged }: { open: boolean; onClose: () => void; concepts: Concept[]; onMerged: () => void }) {
  const { update, toast } = useStore();
  const [primary, setPrimary] = useState<string>('');
  useEffect(() => {
    if (open) setPrimary([...concepts].sort((a, b) => b.occurrences.length - a.occurrences.length)[0]?.id ?? '');
  }, [open, concepts]);
  const paperCount = new Set(concepts.flatMap((c) => c.occurrences.map((o) => o.paperId))).size;
  const keep = concepts.find((c) => c.id === primary);

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Merge Concepts"
      title="개념 합치기"
      description="같은 개념을 다른 이름으로 적은 경우(예: ISI와 Intersymbol interference) 하나로 합쳐요."
      width="max-w-xl"
      footer={
        <>
          <button type="button" onClick={onClose} className={btn('secondary')}>
            취소
          </button>
          <button
            type="button"
            className={btn('primary')}
            onClick={() => {
              update((d) => mergeConcepts(d, concepts.map((c) => c.id), primary));
              toast({ kind: 'success', title: `'${keep?.name}'(으)로 합쳤어요`, body: `등장 논문 ${paperCount}편` });
              onMerged();
            }}
          >
            <Icon name="merge" /> 합치기
          </button>
        </>
      }
    >
      <p className="mb-3 text-sm font-semibold text-ink">남길 이름을 고르세요</p>
      <div className="space-y-2">
        {concepts.map((c) => (
          <label key={c.id} className={`flex cursor-pointer items-center gap-3 rounded border px-4 py-3 ${primary === c.id ? 'border-accent bg-tint' : 'border-line hover:border-line-strong'}`}>
            <input type="radio" name="primary" checked={primary === c.id} onChange={() => setPrimary(c.id)} className="accent-[#2563eb]" />
            <span className="flex-1 font-semibold text-ink">{c.name}</span>
            <ConceptStatusBadge concept={c} />
            <span className="font-mono text-xs text-ink-4">논문 {c.occurrences.length}편</span>
          </label>
        ))}
      </div>
      <p className="mt-4 rounded bg-canvas px-4 py-3 text-sm text-ink-3">
        합치면 등장 논문 <b className="text-ink">{paperCount}편</b>, 작성한 설명과 참고 링크가 모두 하나로 모여요. 되돌릴 수 없어요.
      </p>
    </Modal>
  );
}

export function ConceptNotebook() {
  const { data, toast } = useStore();
  const [params, setParams] = useSearchParams();
  const focus = params.get('focus');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('default');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [mergeOpen, setMergeOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: data.concepts.length, unknown: 0, lookedup: 0, understood: 0 };
    for (const x of data.concepts) c[conceptStatus(x)]++;
    return c;
  }, [data.concepts]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = data.concepts
      .filter((c) => filter === 'all' || conceptStatus(c) === filter)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.explanation.toLowerCase().includes(q));
    return sortConcepts(filtered, sort);
  }, [data.concepts, filter, sort, query]);

  // drop selections for concepts that no longer exist
  useEffect(() => {
    setSelected((s) => s.filter((id) => data.concepts.some((c) => c.id === id)));
  }, [data.concepts]);

  const selectedConcepts = data.concepts.filter((c) => selected.includes(c.id));
  const resolvedPct = counts.all ? Math.round((counts.understood / counts.all) * 1000) / 10 : 0;

  const openMerge = () => {
    if (selected.length < 2) {
      toast({ kind: 'error', title: '합칠 개념을 2개 이상 선택해 주세요.' });
      return;
    }
    setMergeOpen(true);
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: '전체 보기' },
    { key: 'unknown', label: '모름' },
    { key: 'lookedup', label: '찾아봄' },
    { key: 'understood', label: '이해함' },
  ];

  return (
    <div className="mx-auto max-w-page px-10 py-8">
      <section className="flex items-end justify-between rounded-lg border border-tint-strong bg-tint px-8 py-7">
        <div>
          <p className="font-mono text-xs tracking-wider text-ink-4">PREREQUISITE CONCEPTS · 신호처리 지식 베이스</p>
          <h1 className="mt-1 text-[32px] font-bold tracking-tight text-ink">
            전제 개념 노트 <span className="font-serif font-semibold text-ink-3">(Concept Notebook)</span>
          </h1>
          <p className="mt-2 text-[15px] text-ink-3">논문을 읽다 막힌 개념을 내 말로 정리하고, 논문 사이에 반복해서 나오는 개념을 쌓아 갑니다.</p>
        </div>
        <div className="flex gap-2 rounded-lg bg-white p-2">
          <span className="rounded px-3 py-2 text-sm font-semibold text-ink">
            전체 <b className="ml-1 font-mono text-lg">{counts.all}</b>
          </span>
          {(['unknown', 'lookedup', 'understood'] as const).map((s) => (
            <span key={s} className={`flex items-center gap-1.5 rounded px-3 py-2 text-sm font-semibold ${CONCEPT_STATUS_STYLE[s].cls}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${CONCEPT_STATUS_STYLE[s].dot}`} />
              {CONCEPT_STATUS_STYLE[s].label} <b className="font-mono text-lg">{counts[s]}</b>
            </span>
          ))}
        </div>
      </section>

      {data.concepts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-white px-10 py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-st-unknown-bg text-st-unknown">
            <Icon name="bulb" className="h-7 w-7" />
          </span>
          <p className="max-w-xl text-lg font-semibold text-ink">
            아직 기록한 개념이 없어요. 논문을 읽다가 모르는 개념이 나오면 <span className="rounded bg-tint px-1.5 font-mono">+ 개념</span>으로 적어 두세요.
          </p>
          <Link to="/" className={btn('secondary', 'mt-6')}>
            논문 목록으로
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex rounded-lg bg-tint p-1" role="group" aria-label="상태 필터">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={filter === f.key}
                  className={`rounded px-4 py-2 text-[15px] font-semibold transition-colors ${filter === f.key ? 'bg-white text-ink shadow-sm' : 'text-ink-3 hover:text-ink'}`}
                >
                  {f.label} <span className="ml-1 font-mono text-xs text-ink-4">{counts[f.key]}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={openMerge} className={btn(selected.length >= 2 ? 'primary' : 'secondary')}>
                <Icon name="merge" /> 선택한 개념 합치기{selected.length > 0 && ` (${selected.length})`}
              </button>
              <label className="sr-only" htmlFor="c-sort">
                정렬
              </label>
              <select id="c-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`${inputCls} w-auto py-2 font-semibold`}>
                <option value="default">미해결 우선 · 등장 논문 많은 순</option>
                <option value="recent">최근 수정순</option>
                <option value="name">이름순</option>
              </select>
            </div>
          </div>

          <label className="relative mt-4 block">
            <span className="sr-only">개념 검색</span>
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
            <input
              type="search"
              value={query}
              maxLength={LIMITS.search}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="개념명, 설명 검색… (예: Volterra, ISI, 등화기)"
              className="w-full rounded border border-line bg-white py-2.5 pl-10 pr-3 text-[15px] placeholder:text-ink-5 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>

          <div className="mt-6 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8">
            <div className="space-y-4">
              {list.length === 0 ? (
                <div className="rounded-lg border border-dashed border-line-strong bg-white px-10 py-14 text-center">
                  <p className="font-semibold text-ink">조건에 맞는 개념이 없습니다.</p>
                </div>
              ) : (
                list.map((c) => (
                  <ConceptCard
                    key={c.id}
                    concept={c}
                    papers={data.papers}
                    selected={selected.includes(c.id)}
                    onToggleSelect={() => setSelected((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]))}
                    autoEdit={focus === c.id}
                  />
                ))
              )}
            </div>

            <aside className="sticky top-20 space-y-4 self-start">
              <section className="rounded-lg border border-line bg-white p-5">
                <h2 className="text-base font-semibold text-ink">개념 정리 현황</h2>
                <div className="mt-4 flex items-baseline justify-between text-sm">
                  <span className="text-ink-3">이해함으로 정리한 비율</span>
                  <b className="font-mono text-ink">{resolvedPct}%</b>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-st-understood" style={{ width: `${resolvedPct}%` }} />
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {sortConcepts(
                    data.concepts.filter((c) => conceptStatus(c) !== 'understood'),
                    'default',
                  )
                    .slice(0, 5)
                    .map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-2">
                        <button type="button" onClick={() => setParams({ focus: c.id })} className="truncate text-left text-ink-2 hover:text-accent hover:underline">
                          {c.name}
                        </button>
                        <span className="shrink-0 font-mono text-xs text-ink-4">논문 {c.occurrences.length}편</span>
                      </li>
                    ))}
                </ul>
                {counts.unknown + counts.lookedup > 0 && <p className="mt-3 text-xs text-ink-4">여러 논문에 나오는 미해결 개념부터 정리하면 효과가 커요.</p>}
              </section>
              <section className="rounded-lg bg-tint p-4">
                <p className="flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-ink-2">
                  <Icon name="bulb" className="h-3.5 w-3.5" /> 정리 원칙
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-3">
                  저자의 표현이나 위키 정의를 그대로 베끼지 말고, 내가 이미 아는 개념과 연결해서 내 말로 바꿔 쓰세요. 한 줄이라도 내 말로 쓸 수 있으면 '이해함'이에요.
                </p>
              </section>
            </aside>
          </div>
        </>
      )}

      <MergeModal
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
        concepts={selectedConcepts}
        onMerged={() => {
          setMergeOpen(false);
          setSelected([]);
        }}
      />
    </div>
  );
}
