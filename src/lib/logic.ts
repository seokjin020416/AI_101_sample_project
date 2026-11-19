// Pure data operations. Every function returns a new AppData and never mutates its input.
import type { AppData, Concept, ConceptStatus, Paper, PaperInput, PaperStatus, PassNo } from './types';

export const LIMITS = {
  title: 300,
  authors: 300,
  venue: 150,
  link: 500,
  tagLen: 20,
  tagCount: 10,
  conceptName: 50,
  conceptLocation: 50,
  explanation: 1000,
  conceptLinks: 3,
  search: 100,
} as const;

export const MIN_YEAR = 1950;

export function emptyData(): AppData {
  return { version: 1, papers: [], concepts: [] };
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Matching key: ignores whitespace and letter case ("Inter symbol" == "intersymbol"). */
export function normalizeKey(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase();
}

export function conceptStatus(c: Pick<Concept, 'explanation' | 'links'>): ConceptStatus {
  if (c.explanation.trim()) return 'understood';
  if (c.links.length > 0) return 'lookedup';
  return 'unknown';
}

const STATUS_RANK: Record<PaperStatus, number> = { toread: 0, onhold: 1, pass1: 1, pass2: 2, pass3: 3 };

export function passesDone(status: PaperStatus): number {
  return status === 'onhold' ? 1 : STATUS_RANK[status];
}

/** The pass the reader is working on next (1–3), or null when all three are done. */
export function currentPass(status: PaperStatus): PassNo | null {
  const done = passesDone(status);
  return done >= 3 ? null : ((done + 1) as PassNo);
}

// ---------- validation ----------

export function isValidUrl(s: string): boolean {
  return /^https?:\/\/[^\s]+\.[^\s]+$/i.test(s.trim()) || /^https?:\/\/localhost[^\s]*$/i.test(s.trim());
}

export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw.split(',')) {
    const tag = t.trim().replace(/^#/, '');
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

export interface PaperFormValues {
  title: string;
  authors: string;
  year: string;
  venue: string;
  source: PaperInput['source'] | '';
  link: string;
  tags: string;
}

export type PaperFormErrors = Partial<Record<keyof PaperFormValues, string>>;

export function validatePaperForm(
  v: PaperFormValues,
  currentYear = new Date().getFullYear(),
): { errors: PaperFormErrors; input: PaperInput | null } {
  const errors: PaperFormErrors = {};
  const title = v.title.trim();
  if (!title) errors.title = '제목을 입력해 주세요.';
  else if (title.length > LIMITS.title) errors.title = `제목은 ${LIMITS.title}자 이하로 입력해 주세요.`;

  if (v.authors.trim().length > LIMITS.authors) errors.authors = `저자는 ${LIMITS.authors}자 이하로 입력해 주세요.`;

  let year: number | null = null;
  const y = v.year.trim();
  if (y) {
    const n = Number(y);
    if (!/^\d{4}$/.test(y) || n < MIN_YEAR || n > currentYear) {
      errors.year = `연도는 ${MIN_YEAR}~${currentYear} 사이 4자리 숫자로 입력해 주세요.`;
    } else year = n;
  }

  if (v.venue.trim().length > LIMITS.venue) errors.venue = `게재처는 ${LIMITS.venue}자 이하로 입력해 주세요.`;

  if (!v.source) errors.source = '출처를 선택해 주세요.';

  const link = v.link.trim();
  if (link) {
    if (link.length > LIMITS.link) errors.link = `링크는 ${LIMITS.link}자 이하로 입력해 주세요.`;
    else if (!isValidUrl(link)) errors.link = 'http:// 또는 https://로 시작하는 주소를 입력해 주세요.';
  }

  const tags = parseTags(v.tags);
  if (tags.length > LIMITS.tagCount) errors.tags = `태그는 최대 ${LIMITS.tagCount}개까지 입력할 수 있어요.`;
  else if (tags.some((t) => t.length > LIMITS.tagLen)) errors.tags = `태그는 하나당 ${LIMITS.tagLen}자 이하로 입력해 주세요.`;

  if (Object.keys(errors).length > 0) return { errors, input: null };
  return {
    errors,
    input: {
      title,
      authors: v.authors.trim(),
      year,
      venue: v.venue.trim(),
      source: v.source as PaperInput['source'],
      link,
      tags,
    },
  };
}

export function findDuplicate(papers: Paper[], title: string, excludeId?: string): Paper | undefined {
  const key = normalizeKey(title);
  if (!key) return undefined;
  return papers.find((p) => p.id !== excludeId && normalizeKey(p.title) === key);
}

// ---------- papers ----------

export function addPaper(data: AppData, input: PaperInput, now = Date.now()): { data: AppData; paper: Paper } {
  const paper: Paper = {
    ...input,
    id: newId(),
    status: 'toread',
    notes: { 1: {}, 2: {}, 3: {} },
    worthReading: null,
    createdAt: now,
    updatedAt: now,
  };
  return { data: { ...data, papers: [paper, ...data.papers] }, paper };
}

function mapPaper(data: AppData, id: string, fn: (p: Paper) => Paper): AppData {
  return { ...data, papers: data.papers.map((p) => (p.id === id ? fn(p) : p)) };
}

export function updatePaper(data: AppData, id: string, input: PaperInput, now = Date.now()): AppData {
  return mapPaper(data, id, (p) => ({ ...p, ...input, updatedAt: now }));
}

export function deletePaper(data: AppData, id: string): AppData {
  const concepts = data.concepts
    .map((c) => ({ ...c, occurrences: c.occurrences.filter((o) => o.paperId !== id) }))
    .filter((c) => c.occurrences.length > 0 || c.explanation.trim() || c.links.length > 0);
  return { ...data, papers: data.papers.filter((p) => p.id !== id), concepts };
}

export function setAnswer(data: AppData, id: string, pass: PassNo, qid: string, value: string, now = Date.now()): AppData {
  return mapPaper(data, id, (p) => ({
    ...p,
    notes: { ...p.notes, [pass]: { ...p.notes[pass], [qid]: value } },
    updatedAt: now,
  }));
}

export function setWorthReading(data: AppData, id: string, value: 'yes' | 'no', now = Date.now()): AppData {
  return mapPaper(data, id, (p) => ({ ...p, worthReading: value, updatedAt: now }));
}

/**
 * Marks a pass done. Pass 1 with "not worth reading" puts the paper on hold (PRD §4-3).
 * Status never moves backwards.
 */
export function completePass(data: AppData, id: string, pass: PassNo, now = Date.now()): AppData {
  return mapPaper(data, id, (p) => {
    let status: PaperStatus;
    if (pass === 1 && p.worthReading === 'no') status = 'onhold';
    else {
      const target: PaperStatus = pass === 1 ? 'pass1' : pass === 2 ? 'pass2' : 'pass3';
      status = STATUS_RANK[target] > STATUS_RANK[p.status] || p.status === 'onhold' ? target : p.status;
    }
    return { ...p, status, updatedAt: now };
  });
}

/** Takes a paper off hold so the reader can continue to pass 2. */
export function resumePaper(data: AppData, id: string, now = Date.now()): AppData {
  return mapPaper(data, id, (p) => (p.status === 'onhold' ? { ...p, status: 'pass1', worthReading: 'yes', updatedAt: now } : p));
}

// ---------- concepts ----------

export function findConceptByName(concepts: Concept[], name: string): Concept | undefined {
  const key = normalizeKey(name);
  return concepts.find((c) => normalizeKey(c.name) === key);
}

/**
 * Records a concept met while reading a paper. Same name (ignoring whitespace/case) maps to
 * the existing concept; if the paper is already listed, its location is updated.
 */
export function addConceptToPaper(
  data: AppData,
  paperId: string,
  name: string,
  location: string,
  now = Date.now(),
): { data: AppData; concept: Concept; merged: boolean } {
  const trimmed = name.trim();
  const loc = location.trim();
  const existing = findConceptByName(data.concepts, trimmed);
  if (existing) {
    const has = existing.occurrences.some((o) => o.paperId === paperId);
    const occurrences = has
      ? existing.occurrences.map((o) => (o.paperId === paperId && loc ? { ...o, location: loc } : o))
      : [...existing.occurrences, { paperId, location: loc, addedAt: now }];
    const concept = { ...existing, occurrences, updatedAt: now };
    return {
      data: { ...data, concepts: data.concepts.map((c) => (c.id === existing.id ? concept : c)) },
      concept,
      merged: true,
    };
  }
  const concept: Concept = {
    id: newId(),
    name: trimmed,
    explanation: '',
    links: [],
    occurrences: [{ paperId, location: loc, addedAt: now }],
    createdAt: now,
    updatedAt: now,
  };
  return { data: { ...data, concepts: [...data.concepts, concept] }, concept, merged: false };
}

/** Removes a concept from one paper. A concept left with no papers and no notes is deleted. */
export function removeOccurrence(data: AppData, conceptId: string, paperId: string): AppData {
  const concepts = data.concepts
    .map((c) => (c.id === conceptId ? { ...c, occurrences: c.occurrences.filter((o) => o.paperId !== paperId) } : c))
    .filter((c) => c.id !== conceptId || c.occurrences.length > 0 || c.explanation.trim() || c.links.length > 0);
  return { ...data, concepts };
}

export function updateConcept(
  data: AppData,
  id: string,
  patch: Partial<Pick<Concept, 'explanation' | 'links' | 'name'>>,
  now = Date.now(),
): AppData {
  return { ...data, concepts: data.concepts.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: now } : c)) };
}

export function deleteConcept(data: AppData, id: string): AppData {
  return { ...data, concepts: data.concepts.filter((c) => c.id !== id) };
}

/** Merges several concepts into `primaryId`: papers, explanations and links are combined. */
export function mergeConcepts(data: AppData, ids: string[], primaryId: string, now = Date.now()): AppData {
  const selected = data.concepts.filter((c) => ids.includes(c.id));
  const primary = selected.find((c) => c.id === primaryId);
  if (!primary || selected.length < 2) return data;
  const ordered = [primary, ...selected.filter((c) => c.id !== primaryId)];

  const occurrences: Concept['occurrences'] = [];
  for (const c of ordered) {
    for (const o of c.occurrences) {
      if (!occurrences.some((x) => x.paperId === o.paperId)) occurrences.push(o);
    }
  }
  const explanations = ordered.map((c) => c.explanation.trim()).filter(Boolean);
  const explanation = [...new Set(explanations)].join('\n\n');
  const links = [...new Set(ordered.flatMap((c) => c.links))];

  const merged: Concept = {
    ...primary,
    occurrences,
    explanation,
    links,
    createdAt: Math.min(...ordered.map((c) => c.createdAt)),
    updatedAt: now,
  };
  return {
    ...data,
    concepts: data.concepts.filter((c) => !ids.includes(c.id) || c.id === primaryId).map((c) => (c.id === primaryId ? merged : c)),
  };
}

// ---------- queries ----------

export function conceptsForPaper(concepts: Concept[], paperId: string): Concept[] {
  return concepts.filter((c) => c.occurrences.some((o) => o.paperId === paperId));
}

export function unresolvedForPaper(concepts: Concept[], paperId: string): Concept[] {
  return conceptsForPaper(concepts, paperId).filter((c) => conceptStatus(c) !== 'understood');
}

export function summary(data: AppData) {
  return {
    reading: data.papers.filter((p) => p.status === 'pass1' || p.status === 'pass2').length,
    done: data.papers.filter((p) => p.status === 'pass3').length,
    unresolved: data.concepts.filter((c) => conceptStatus(c) !== 'understood').length,
  };
}

export type StatusFilter = 'all' | PaperStatus;

/** Dashboard filter. "all" hides on-hold papers (PRD §4-3). */
export function filterPapers(papers: Paper[], status: StatusFilter, tags: string[], query: string): Paper[] {
  const q = query.trim().toLowerCase();
  const tagKeys = tags.map((t) => t.toLowerCase());
  return papers
    .filter((p) => (status === 'all' ? p.status !== 'onhold' : p.status === status))
    .filter((p) => tagKeys.every((t) => p.tags.some((pt) => pt.toLowerCase() === t)))
    .filter(
      (p) =>
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

const CONCEPT_RANK: Record<ConceptStatus, number> = { unknown: 0, lookedup: 1, understood: 2 };

/** Default concept order: unresolved first, then by how many papers mention it. */
export function sortConcepts(concepts: Concept[], mode: 'default' | 'name' | 'recent'): Concept[] {
  const list = [...concepts];
  if (mode === 'name') return list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  if (mode === 'recent') return list.sort((a, b) => b.updatedAt - a.updatedAt);
  return list.sort((a, b) => {
    const ra = CONCEPT_RANK[conceptStatus(a)] === 2 ? 1 : 0;
    const rb = CONCEPT_RANK[conceptStatus(b)] === 2 ? 1 : 0;
    if (ra !== rb) return ra - rb;
    if (b.occurrences.length !== a.occurrences.length) return b.occurrences.length - a.occurrences.length;
    return a.name.localeCompare(b.name, 'ko');
  });
}

export function allTags(papers: Paper[]): string[] {
  const map = new Map<string, string>();
  for (const p of papers) for (const t of p.tags) if (!map.has(t.toLowerCase())) map.set(t.toLowerCase(), t);
  return [...map.values()].sort((a, b) => a.localeCompare(b, 'ko'));
}

// ---------- persistence ----------

export const STORAGE_KEY = 'paperpass:v1';

export function parseStored(raw: string | null): AppData {
  if (!raw) return emptyData();
  try {
    const d = JSON.parse(raw);
    if (d && d.version === 1 && Array.isArray(d.papers) && Array.isArray(d.concepts)) return d as AppData;
  } catch {
    /* fall through */
  }
  return emptyData();
}

export function formatRelative(ts: number, now = Date.now()): string {
  const diff = Math.max(0, now - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  const date = new Date(ts);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}
