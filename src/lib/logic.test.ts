import { describe, expect, it } from 'vitest';
import {
  addConceptToPaper,
  addPaper,
  completePass,
  conceptStatus,
  deletePaper,
  emptyData,
  filterPapers,
  findDuplicate,
  mergeConcepts,
  normalizeKey,
  parseStored,
  removeOccurrence,
  resumePaper,
  setWorthReading,
  sortConcepts,
  summary,
  updateConcept,
  validatePaperForm,
  type PaperFormValues,
} from './logic';
import type { PaperInput } from './types';

const input = (title: string, extra: Partial<PaperInput> = {}): PaperInput => ({
  title,
  authors: '',
  year: 2024,
  venue: '',
  source: 'ieee',
  link: '',
  tags: [],
  ...extra,
});

const form = (v: Partial<PaperFormValues>): PaperFormValues => ({
  title: 'A paper',
  authors: '',
  year: '',
  venue: '',
  source: 'arxiv',
  link: '',
  tags: '',
  ...v,
});

describe('validatePaperForm', () => {
  it('requires title and source with PRD error messages', () => {
    const { errors } = validatePaperForm(form({ title: '  ', source: '' }));
    expect(errors.title).toBe('제목을 입력해 주세요.');
    expect(errors.source).toBeDefined();
  });

  it('checks year range and link scheme', () => {
    const { errors } = validatePaperForm(form({ year: '1949', link: 'ftp://x.org' }), 2026);
    expect(errors.year).toBe('연도는 1950~2026 사이 4자리 숫자로 입력해 주세요.');
    expect(errors.link).toBe('http:// 또는 https://로 시작하는 주소를 입력해 주세요.');
  });

  it('limits tags to 10, 20 chars each, and dedupes', () => {
    expect(validatePaperForm(form({ tags: Array.from({ length: 11 }, (_, i) => `t${i}`).join(',') })).errors.tags).toBeDefined();
    expect(validatePaperForm(form({ tags: 'x'.repeat(21) })).errors.tags).toBeDefined();
    expect(validatePaperForm(form({ tags: 'PAM4, pam4, #등화' })).input?.tags).toEqual(['PAM4', '등화']);
  });

  it('returns a clean input when valid', () => {
    const { input: out } = validatePaperForm(form({ title: ' T ', year: '2024', link: 'https://arxiv.org/abs/1' }), 2026);
    expect(out).toMatchObject({ title: 'T', year: 2024, link: 'https://arxiv.org/abs/1' });
  });
});

describe('papers', () => {
  it('detects duplicates ignoring whitespace and case', () => {
    const { data } = addPaper(emptyData(), input('Deep Learning Equalizer'));
    expect(findDuplicate(data.papers, 'deep  learning equalizer ')).toBeDefined();
    expect(findDuplicate(data.papers, 'other')).toBeUndefined();
  });

  it('pass 1 with "not worth reading" puts the paper on hold, hidden from "all"', () => {
    let { data, paper } = addPaper(emptyData(), input('P'));
    data = setWorthReading(data, paper.id, 'no');
    data = completePass(data, paper.id, 1);
    expect(data.papers[0].status).toBe('onhold');
    expect(filterPapers(data.papers, 'all', [], '')).toHaveLength(0);
    expect(filterPapers(data.papers, 'onhold', [], '')).toHaveLength(1);
    data = resumePaper(data, paper.id);
    expect(data.papers[0].status).toBe('pass1');
  });

  it('status never moves backwards', () => {
    let { data, paper } = addPaper(emptyData(), input('P'));
    data = completePass(data, paper.id, 2);
    data = completePass(data, paper.id, 1);
    expect(data.papers[0].status).toBe('pass2');
  });

  it('filters by tags and search, newest first', () => {
    let d = addPaper(emptyData(), input('Volterra equalizer', { tags: ['PAM4'] }), 1).data;
    d = addPaper(d, input('Transformer receiver', { tags: ['DMT'], authors: 'Kim' }), 2).data;
    expect(filterPapers(d.papers, 'all', ['pam4'], '').map((p) => p.title)).toEqual(['Volterra equalizer']);
    expect(filterPapers(d.papers, 'all', [], 'kim').map((p) => p.title)).toEqual(['Transformer receiver']);
    expect(filterPapers(d.papers, 'all', [], '').map((p) => p.title)).toEqual(['Transformer receiver', 'Volterra equalizer']);
  });
});

describe('concepts', () => {
  it('derives status from explanation and links', () => {
    expect(conceptStatus({ explanation: '', links: [] })).toBe('unknown');
    expect(conceptStatus({ explanation: '', links: ['https://a.b'] })).toBe('lookedup');
    expect(conceptStatus({ explanation: 'x', links: [] })).toBe('understood');
  });

  it('same name in another paper maps to one concept ("Appears in 2 papers")', () => {
    let d = addPaper(emptyData(), input('A')).data;
    d = addPaper(d, input('B')).data;
    const [b, a] = d.papers;
    d = addConceptToPaper(d, a.id, 'ISI', 'Sec. II').data;
    const r = addConceptToPaper(d, b.id, ' isi ', 'Eq. (3)');
    expect(r.merged).toBe(true);
    expect(r.data.concepts).toHaveLength(1);
    expect(r.data.concepts[0].occurrences).toHaveLength(2);
    expect(normalizeKey('Inter symbol')).toBe(normalizeKey('intersymbol'));
  });

  it('merges concepts: papers, explanations and links combined', () => {
    let d = addPaper(emptyData(), input('A')).data;
    d = addPaper(d, input('B')).data;
    const [b, a] = d.papers;
    d = addConceptToPaper(d, a.id, 'ISI', '').data;
    d = addConceptToPaper(d, b.id, 'Intersymbol interference', '').data;
    d = addConceptToPaper(d, b.id, 'ISI', '').data;
    const [isi, longName] = d.concepts;
    d = updateConcept(d, longName.id, { explanation: '심볼이 번짐', links: ['https://w.org/isi'] });
    d = mergeConcepts(d, [isi.id, longName.id], isi.id);
    expect(d.concepts).toHaveLength(1);
    expect(d.concepts[0]).toMatchObject({ name: 'ISI', explanation: '심볼이 번짐', links: ['https://w.org/isi'] });
    expect(d.concepts[0].occurrences.map((o) => o.paperId).sort()).toEqual([a.id, b.id].sort());
  });

  it('merge needs at least 2 concepts', () => {
    let d = addPaper(emptyData(), input('A')).data;
    d = addConceptToPaper(d, d.papers[0].id, 'ISI', '').data;
    expect(mergeConcepts(d, [d.concepts[0].id], d.concepts[0].id)).toBe(d);
  });

  it('removing the last occurrence of an empty concept deletes it; deleting a paper cleans up', () => {
    let d = addPaper(emptyData(), input('A')).data;
    const pid = d.papers[0].id;
    d = addConceptToPaper(d, pid, 'ISI', '').data;
    d = addConceptToPaper(d, pid, 'DMT', '').data;
    d = updateConcept(d, d.concepts[1].id, { explanation: 'multicarrier' });
    expect(removeOccurrence(d, d.concepts[0].id, pid).concepts.map((c) => c.name)).toEqual(['DMT']);
    const after = deletePaper(d, pid);
    expect(after.papers).toHaveLength(0);
    expect(after.concepts.map((c) => c.name)).toEqual(['DMT']); // keeps written notes
  });

  it('default sort: unresolved first, then by paper count', () => {
    let d = addPaper(emptyData(), input('A')).data;
    d = addPaper(d, input('B')).data;
    const [b, a] = d.papers;
    d = addConceptToPaper(d, a.id, 'Done', '').data;
    d = addConceptToPaper(d, a.id, 'One', '').data;
    d = addConceptToPaper(d, a.id, 'Two', '').data;
    d = addConceptToPaper(d, b.id, 'Two', '').data;
    d = updateConcept(d, d.concepts[0].id, { explanation: 'x' });
    expect(sortConcepts(d.concepts, 'default').map((c) => c.name)).toEqual(['Two', 'One', 'Done']);
    expect(summary(d).unresolved).toBe(2);
  });
});

describe('parseStored', () => {
  it('falls back to empty data on bad input', () => {
    expect(parseStored('not json')).toEqual(emptyData());
    expect(parseStored(JSON.stringify({ version: 2 }))).toEqual(emptyData());
    expect(parseStored(null)).toEqual(emptyData());
  });
});
