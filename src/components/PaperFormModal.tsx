import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOURCE_META } from '../lib/guide';
import { LIMITS, MIN_YEAR, addPaper, deletePaper, findDuplicate, parseTags, updatePaper, validatePaperForm, type PaperFormErrors, type PaperFormValues } from '../lib/logic';
import { useStore } from '../lib/store';
import type { Paper, Source } from '../lib/types';
import { CharCount, FieldError, Icon, Modal, btn, inputCls } from './ui';

const EMPTY: PaperFormValues = { title: '', authors: '', year: '', venue: '', source: '', link: '', tags: '' };

function toValues(p: Paper): PaperFormValues {
  return {
    title: p.title,
    authors: p.authors,
    year: p.year ? String(p.year) : '',
    venue: p.venue,
    source: p.source,
    link: p.link,
    tags: p.tags.join(', '),
  };
}

export function PaperFormModal({ open, editing, onClose }: { open: boolean; editing: Paper | null; onClose: () => void }) {
  const { data, update, toast } = useStore();
  const navigate = useNavigate();
  const [v, setV] = useState<PaperFormValues>(EMPTY);
  const [errors, setErrors] = useState<PaperFormErrors>({});
  const [duplicate, setDuplicate] = useState<Paper | null>(null);

  useEffect(() => {
    if (open) {
      setV(editing ? toValues(editing) : EMPTY);
      setErrors({});
      setDuplicate(null);
    }
  }, [open, editing]);

  const set = (k: keyof PaperFormValues) => (e: { target: { value: string } }) => {
    setV((s) => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    if (k === 'title') setDuplicate(null);
  };

  const submit = (force = false) => {
    const { errors: errs, input } = validatePaperForm(v);
    setErrors(errs);
    if (!input) return;
    if (!force) {
      const dup = findDuplicate(data.papers, input.title, editing?.id);
      if (dup) {
        setDuplicate(dup);
        return;
      }
    }
    if (editing) {
      update((d) => updatePaper(d, editing.id, input));
      toast({ kind: 'success', title: '논문 정보가 수정되었습니다' });
    } else {
      update((d) => addPaper(d, input).data);
      toast({ kind: 'success', title: '논문이 추가되었습니다', body: input.title });
    }
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    if (!window.confirm(`"${editing.title}"을(를) 삭제할까요?\n작성한 노트도 함께 삭제되며 되돌릴 수 없어요.`)) return;
    update((d) => deletePaper(d, editing.id));
    toast({ kind: 'info', title: '논문을 삭제했습니다' });
    onClose();
    navigate('/');
  };

  const tagCount = parseTags(v.tags).length;
  const year = new Date().getFullYear();

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={editing ? 'Edit Paper' : 'Bibliographic Registration'}
      title={editing ? '논문 정보 수정' : '새 논문 등록'}
      description="읽을 논문의 서지 정보와 출처를 입력하세요. 3-pass 노트의 기초 데이터가 됩니다."
      footer={
        <>
          {editing && (
            <button type="button" onClick={remove} className={btn('danger', 'mr-auto')}>
              <Icon name="trash" /> 삭제
            </button>
          )}
          <button type="button" onClick={onClose} className={btn('secondary')}>
            취소
          </button>
          <button type="submit" form="paper-form" className={btn('primary')}>
            <Icon name="check" /> 저장
          </button>
        </>
      }
    >
      <form
        id="paper-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-5"
      >
        {duplicate && (
          <div role="alert" className="flex items-center gap-3 rounded-lg border border-st-unknown-bd bg-st-unknown-bg px-4 py-3">
            <Icon name="info" className="h-5 w-5 shrink-0 text-st-unknown" />
            <p className="flex-1 text-sm font-medium text-ink">이미 등록된 논문입니다. 해당 논문으로 이동할까요?</p>
            <button
              type="button"
              className={btn('primary', 'px-3 py-1.5')}
              onClick={() => {
                onClose();
                navigate(`/papers/${duplicate.id}`);
              }}
            >
              이동
            </button>
            <button type="button" className={btn('secondary', 'px-3 py-1.5')} onClick={() => submit(true)}>
              그래도 추가
            </button>
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="f-title" className="text-sm font-semibold text-ink">
              제목 <span className="text-danger">*</span>
            </label>
            <CharCount value={v.title} max={LIMITS.title} />
          </div>
          <textarea
            id="f-title"
            rows={2}
            value={v.title}
            onChange={set('title')}
            placeholder="예: Deep Learning-Based Nonlinear Equalization for 112-Gb/s PAM4 IM/DD Optical Interconnects"
            className={`${inputCls} resize-none font-serif text-lg leading-snug`}
          />
          <FieldError msg={errors.title} />
        </div>

        <div className="grid grid-cols-[1fr_160px] gap-4">
          <div>
            <label htmlFor="f-authors" className="mb-1.5 block text-sm font-semibold text-ink">
              저자 <span className="font-normal text-ink-4">(쉼표로 구분)</span>
            </label>
            <input id="f-authors" value={v.authors} onChange={set('authors')} placeholder="J. Kim, H. Park, Y. Choi" className={inputCls} />
            <FieldError msg={errors.authors} />
          </div>
          <div>
            <label htmlFor="f-year" className="mb-1.5 block text-sm font-semibold text-ink">
              연도
            </label>
            <input id="f-year" inputMode="numeric" value={v.year} onChange={set('year')} placeholder={`${MIN_YEAR}~${year}`} className={`${inputCls} font-mono`} />
            <FieldError msg={errors.year} />
          </div>
        </div>

        <div>
          <label htmlFor="f-venue" className="mb-1.5 block text-sm font-semibold text-ink">
            게재처
          </label>
          <input id="f-venue" value={v.venue} onChange={set('venue')} placeholder="예: IEEE Photonics Technology Letters" className={inputCls} />
          <FieldError msg={errors.venue} />
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-ink">
            출처 <span className="text-danger">*</span>
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(SOURCE_META) as Source[]).map((s) => {
              const active = v.source === s;
              return (
                <label
                  key={s}
                  className={`flex cursor-pointer items-center justify-center rounded border px-3 py-2 text-sm font-semibold transition-colors ${
                    active ? `${SOURCE_META[s].badge} border-current` : 'border-line bg-white text-ink-3 hover:border-line-strong'
                  }`}
                >
                  <input type="radio" name="source" value={s} checked={active} onChange={set('source')} className="sr-only" />
                  {SOURCE_META[s].label}
                </label>
              );
            })}
          </div>
          <FieldError msg={errors.source} />
        </fieldset>

        <div>
          <label htmlFor="f-link" className="mb-1.5 block text-sm font-semibold text-ink">
            링크
          </label>
          <input id="f-link" type="url" value={v.link} onChange={set('link')} placeholder="https://ieeexplore.ieee.org/document/… 또는 https://arxiv.org/abs/…" className={`${inputCls} font-mono text-[13px]`} />
          <FieldError msg={errors.link} />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="f-tags" className="text-sm font-semibold text-ink">
              태그 <span className="font-normal text-ink-4">(쉼표로 구분, 태그당 {LIMITS.tagLen}자)</span>
            </label>
            <span className={`font-mono text-xs ${tagCount > LIMITS.tagCount ? 'text-danger' : 'text-ink-5'}`}>
              {tagCount} / {LIMITS.tagCount}개
            </span>
          </div>
          <input id="f-tags" value={v.tags} onChange={set('tags')} placeholder="등화, PAM4, 딥러닝" className={inputCls} />
          <FieldError msg={errors.tags} />
        </div>
      </form>
    </Modal>
  );
}
