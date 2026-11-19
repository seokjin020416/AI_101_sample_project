import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePaperForm } from '../components/Layout';
import { CharCount, ConceptStatusBadge, FieldError, Icon, SaveIndicator, SourceBadge, btn, inputCls } from '../components/ui';
import { MAX_ANSWER, PASSES, PASS_GUIDES, STATUS_LABEL } from '../lib/guide';
import {
  LIMITS,
  addConceptToPaper,
  completePass,
  conceptStatus,
  conceptsForPaper,
  currentPass,
  passesDone,
  removeOccurrence,
  resumePaper,
  setAnswer,
  setWorthReading,
} from '../lib/logic';
import { useStore } from '../lib/store';
import type { Concept, Paper, PassNo } from '../lib/types';

function PassTabs({ paper, active, onSelect }: { paper: Paper; active: PassNo; onSelect: (p: PassNo) => void }) {
  const done = passesDone(paper.status);
  return (
    <div className="grid grid-cols-3 border-b border-line bg-white" role="tablist">
      {PASSES.map((n) => {
        const g = PASS_GUIDES[n];
        const isDone = n <= done && !(paper.status === 'onhold' && n > 1);
        const selected = n === active;
        return (
          <button
            key={n}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(n)}
            className={`flex items-center gap-3 border-b-2 px-6 py-4 text-left transition-colors ${
              selected ? 'border-ink bg-tint' : 'border-transparent hover:bg-canvas'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                isDone ? 'bg-accent text-white' : selected ? 'bg-ink text-white' : 'border-2 border-line-strong text-ink-5'
              }`}
            >
              {isDone ? <Icon name="check" className="h-4 w-4" /> : n}
            </span>
            <span className="min-w-0">
              <span className={`block font-mono text-[11px] tracking-wider ${isDone ? 'text-accent' : selected ? 'text-ink' : 'text-ink-5'}`}>
                PASS {n} · {isDone ? '완료' : selected ? '작성 중' : '대기'}
              </span>
              <span className={`block text-[15px] font-semibold ${selected || isDone ? 'text-ink' : 'text-ink-4'}`}>{g.label}</span>
              <span className="block truncate text-xs text-ink-4">
                {g.time} · {g.scope}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ConceptPanel({ paper, concepts }: { paper: Paper; concepts: Concept[] }) {
  const { data, update, toast } = useStore();
  const [name, setName] = useState('');
  const [loc, setLoc] = useState('');
  const [error, setError] = useState<string>();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('개념 이름을 입력해 주세요.');
      return;
    }
    const preview = addConceptToPaper(data, paper.id, name, loc);
    update((d) => addConceptToPaper(d, paper.id, name, loc).data);
    if (preview.merged) {
      toast({ kind: 'info', title: `기존 개념 '${preview.concept.name}'에 연결했어요`, body: `등장 논문 ${preview.concept.occurrences.length}편` });
    }
    setName('');
    setLoc('');
    setError(undefined);
  };

  return (
    <aside className="sticky top-20 space-y-4">
      <section className="rounded-lg border border-line bg-white/95 p-5 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <Icon name="book" className="h-4 w-4 text-accent" /> 전제 개념 기록
          </h2>
          <span className="rounded bg-tint px-2 py-0.5 font-mono text-xs text-accent-dark">이 논문 {concepts.length}개</span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-ink-3">모르는 개념이 나오면 이름과 위치만 적고 계속 읽으세요. 설명은 나중에 개념 노트에서 채워요.</p>
        <form onSubmit={submit} className="space-y-2" noValidate>
          <div>
            <label htmlFor="c-name" className="sr-only">
              개념명
            </label>
            <input
              id="c-name"
              value={name}
              maxLength={LIMITS.conceptName}
              onChange={(e) => {
                setName(e.target.value);
                setError(undefined);
              }}
              placeholder="개념명 (예: Volterra 비선형성)"
              className={inputCls}
            />
            <FieldError msg={error} />
          </div>
          <label htmlFor="c-loc" className="sr-only">
            나온 위치
          </label>
          <input id="c-loc" value={loc} maxLength={LIMITS.conceptLocation} onChange={(e) => setLoc(e.target.value)} placeholder="나온 위치 (예: Sec. II-B, 식 (3))" className={`${inputCls} font-mono text-[13px]`} />
          <button type="submit" className={btn('primary', 'w-full')}>
            <Icon name="plus" /> 빠르게 적고 계속 읽기
          </button>
        </form>
      </section>

      {concepts.length > 0 && (
        <section className="space-y-2">
          {concepts.map((c) => {
            const occ = c.occurrences.find((o) => o.paperId === paper.id);
            const st = conceptStatus(c);
            return (
              <div
                key={c.id}
                className={`group rounded-lg border p-4 ${st === 'unknown' ? 'border-st-unknown-bd bg-st-unknown-bg/40' : 'border-line bg-white'}`}
                data-testid="paper-concept"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{c.name}</p>
                  <div className="flex items-center gap-1">
                    <ConceptStatusBadge concept={c} />
                    <button
                      type="button"
                      onClick={() => update((d) => removeOccurrence(d, c.id, paper.id))}
                      className="rounded p-0.5 text-ink-5 opacity-0 hover:bg-line hover:text-ink group-hover:opacity-100 focus:opacity-100"
                      title="이 논문에서 제거"
                      aria-label={`${c.name} 이 논문에서 제거`}
                    >
                      <Icon name="x" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {occ?.location && (
                  <p className="mt-1 flex items-center gap-1 font-mono text-xs text-ink-4">
                    <Icon name="pin" className="h-3 w-3" /> {occ.location}
                  </p>
                )}
                {c.explanation ? (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-2">{c.explanation}</p>
                ) : (
                  <Link to={`/concepts?focus=${c.id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-st-unknown hover:underline">
                    아직 미작성 · 내 말로 설명 추가하기 <Icon name="arrowRight" className="h-3 w-3" />
                  </Link>
                )}
                {c.occurrences.length > 1 && <p className="mt-2 font-mono text-[11px] text-ink-4">다른 논문 {c.occurrences.length - 1}편에도 등장</p>}
              </div>
            );
          })}
        </section>
      )}

      <Link to="/concepts" className="flex items-center justify-between rounded-lg px-1 py-2 text-sm font-semibold text-accent hover:underline">
        전체 개념 노트 보기 <Icon name="arrowRight" />
      </Link>

      <section className="rounded-lg bg-tint p-4">
        <p className="flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-ink-2">
          <Icon name="bulb" className="h-3.5 w-3.5" /> KESHAV READING TIP
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-3">
          막히는 개념을 그 자리에서 다 찾아보면 흐름이 끊겨요. 2차까지는 이름만 적어 두고, 3차 읽기 전에 개념 노트에서 몰아서 정리하세요.
        </p>
      </section>
    </aside>
  );
}

function QuestionCard({ index, text, hint, placeholder, value, onChange, children }: {
  index: number;
  text: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  children?: ReactNode;
}) {
  const id = `q-${index}`;
  return (
    <section className="rounded-lg border border-line bg-white p-6" data-testid="question">
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={id} className="flex items-start gap-2.5 text-[17px] font-semibold text-ink">
          <span className="mt-0.5 rounded-sm bg-primary px-1.5 py-0.5 font-mono text-xs text-white">Q{index}</span>
          {text}
        </label>
        {value.trim() && <span className="shrink-0 rounded bg-st-understood-bg px-2 py-0.5 text-xs font-semibold text-st-understood">작성함</span>}
      </div>
      <p className="mb-3 mt-1.5 pl-10 text-sm text-ink-4">{hint}</p>
      {children}
      <textarea
        id={id}
        rows={4}
        value={value}
        maxLength={MAX_ANSWER}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} min-h-[110px] resize-y leading-relaxed`}
      />
      <div className="mt-1 text-right">
        <CharCount value={value} max={MAX_ANSWER} />
      </div>
    </section>
  );
}

export function PaperDetail() {
  const { id } = useParams();
  const { data, update, toast } = useStore();
  const { openEdit } = usePaperForm();
  const navigate = useNavigate();
  const paper = data.papers.find((p) => p.id === id);
  const [tab, setTab] = useState<PassNo>(() => (paper ? currentPass(paper.status) ?? 3 : 1));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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

  const guide = PASS_GUIDES[tab];
  const answers = paper.notes[tab] ?? {};
  const concepts = conceptsForPaper(data.concepts, paper.id);
  const done = passesDone(paper.status);
  const tabDone = tab <= done && !(paper.status === 'onhold' && tab > 1);
  const answered = guide.questions.filter((q) => answers[q.id]?.trim()).length;
  const holdChoice = tab === 1 && paper.worthReading === 'no';

  const markDone = () => {
    update((d) => completePass(d, paper.id, tab));
    if (holdChoice) {
      toast({ kind: 'info', title: '보류로 표시했어요', body: '목록의 기본 필터에서 숨겨져요. "보류" 필터에서 다시 볼 수 있어요.' });
      return;
    }
    toast({ kind: 'success', title: `${tab}차 읽기 완료!`, body: tab < 3 ? `이제 ${tab + 1}차 읽기로 넘어가요.` : '3-pass를 모두 마쳤어요.' });
    if (tab < 3) setTab((tab + 1) as PassNo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <section className="border-b border-line bg-tint">
        <div className="mx-auto max-w-page px-10 pb-6 pt-5">
          <div className="flex items-center justify-between gap-4">
            <nav className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-ink-4">
              <Link to="/" className="flex items-center gap-1 hover:text-ink">
                <Icon name="arrowLeft" className="h-3.5 w-3.5" /> 논문 목록
              </Link>
              <span>/</span>
              <span className="truncate">{paper.title}</span>
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              <SaveIndicator />
              <span className="rounded bg-tint-strong px-2.5 py-1 font-mono text-xs font-semibold text-accent-dark">{STATUS_LABEL[paper.status]}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 font-mono text-xs text-ink-3">
            <SourceBadge source={paper.source} />
            {[paper.authors, paper.year, paper.venue].filter(Boolean).join(' · ')}
          </div>
          <div className="mt-2 flex items-end justify-between gap-8">
            <h1 className="max-w-4xl font-serif text-[30px] font-semibold leading-tight text-ink">{paper.title}</h1>
            <div className="flex shrink-0 gap-2">
              {paper.link && (
                <a href={paper.link} target="_blank" rel="noopener noreferrer" className={btn('secondary')}>
                  <Icon name="external" /> 원문 열기
                </a>
              )}
              <button type="button" onClick={() => navigate(`/papers/${paper.id}/print?auto=1`)} className={btn('secondary')}>
                <Icon name="print" /> 인쇄용 워크시트
              </button>
              <button type="button" onClick={() => openEdit(paper)} className={btn('ghost')} title="논문 정보 수정">
                <Icon name="edit" /> 수정
              </button>
            </div>
          </div>
          {paper.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {paper.tags.map((t) => (
                <span key={t} className="rounded-sm bg-white px-2 py-0.5 font-mono text-xs text-ink-3">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-page">
        <PassTabs paper={paper} active={tab} onSelect={setTab} />
      </div>

      <div className="mx-auto grid max-w-page grid-cols-[minmax(0,68fr)_minmax(0,32fr)] gap-8 px-10 py-8">
        <div className="space-y-5">
          {paper.status === 'onhold' && (
            <div className="flex items-center gap-4 rounded-lg border border-line-strong bg-src-other-bg px-5 py-4">
              <Icon name="pause" className="h-5 w-5 text-ink-4" />
              <p className="flex-1 text-sm text-ink-2">
                <b>보류 중인 논문이에요.</b> 1차에서 "계속 읽을 가치가 없다"고 판단했어요. 생각이 바뀌면 다시 읽기를 누르세요.
              </p>
              <button
                type="button"
                className={btn('secondary')}
                onClick={() => {
                  update((d) => resumePaper(d, paper.id));
                  setTab(2);
                }}
              >
                다시 읽기
              </button>
            </div>
          )}

          <section className="rounded-lg border border-line bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-accent">
                <Icon name="info" className="h-3.5 w-3.5" /> KESHAV PASS {tab}
              </p>
              <span className="font-mono text-xs text-ink-4">
                {answered} / {guide.questions.length} 문항 작성
              </span>
            </div>
            <p className="mt-1.5 text-sm text-ink-2">
              <b>{guide.time}</b> · {guide.scope}
            </p>
          </section>

          {guide.questions.map((q, i) =>
            tab === 1 && q.id === 'q5' ? (
              <QuestionCard
                key={`${tab}-${q.id}`}
                index={i + 1}
                text={q.text}
                hint={q.hint}
                placeholder={q.placeholder}
                value={answers[q.id] ?? ''}
                onChange={(v) => update((d) => setAnswer(d, paper.id, tab, q.id, v))}
              >
                <div className="mb-3 flex gap-2" role="radiogroup" aria-label="계속 읽을 가치">
                  {(['yes', 'no'] as const).map((opt) => {
                    const on = paper.worthReading === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => update((d) => setWorthReading(d, paper.id, opt))}
                        className={`rounded border px-4 py-1.5 text-sm font-semibold transition-colors ${
                          on
                            ? opt === 'yes'
                              ? 'border-st-understood bg-st-understood-bg text-st-understood'
                              : 'border-ink-4 bg-src-other-bg text-ink-2'
                            : 'border-line bg-white text-ink-3 hover:border-line-strong'
                        }`}
                      >
                        {opt === 'yes' ? '예, 계속 읽는다' : '아니오, 여기까지'}
                      </button>
                    );
                  })}
                </div>
              </QuestionCard>
            ) : (
              <QuestionCard
                key={`${tab}-${q.id}`}
                index={i + 1}
                text={q.text}
                hint={q.hint}
                placeholder={q.placeholder}
                value={answers[q.id] ?? ''}
                onChange={(v) => update((d) => setAnswer(d, paper.id, tab, q.id, v))}
              />
            ),
          )}

          <section
            className={`flex items-center gap-4 rounded-lg border px-6 py-5 ${tabDone ? 'border-st-understood-bd bg-st-understood-bg/50' : 'border-tint-strong bg-tint'}`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tabDone ? 'bg-st-understood text-white' : 'bg-white text-accent'}`}>
              <Icon name="check" className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-ink">
                {tabDone ? `${tab}차 읽기를 완료했어요` : `${guide.questions.length}문항 중 ${answered}문항 작성`}
              </p>
              <p className="text-sm text-ink-3">
                {tabDone
                  ? '노트는 언제든 고칠 수 있어요. 수정 내용은 자동으로 저장됩니다.'
                  : holdChoice
                    ? '"아니오"를 골랐어요. 완료하면 이 논문은 보류로 바뀌어요.'
                    : tab === 2
                      ? '3차 읽기 전에 인쇄용 워크시트를 출력해 두면 좋아요.'
                      : '빈 문항이 있어도 완료할 수 있어요.'}
              </p>
            </div>
            {tabDone ? (
              tab < 3 && (
                <button type="button" onClick={() => setTab((tab + 1) as PassNo)} className={btn('secondary')}>
                  {tab + 1}차로 이동 <Icon name="arrowRight" />
                </button>
              )
            ) : (
              <button type="button" onClick={markDone} className={btn('primary', 'px-5 py-2.5')}>
                {holdChoice ? '보류로 표시' : `${tab}차 완료`} <Icon name="arrowRight" />
              </button>
            )}
          </section>
        </div>

        <ConceptPanel paper={paper} concepts={concepts} />
      </div>
    </div>
  );
}
