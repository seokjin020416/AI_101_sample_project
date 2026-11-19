export type Source = 'ieee' | 'scholar' | 'arxiv' | 'other';

/** Reading status. `onhold` = stopped after pass 1 ("not worth reading further"). */
export type PaperStatus = 'toread' | 'pass1' | 'pass2' | 'pass3' | 'onhold';

export type PassNo = 1 | 2 | 3;

export type ConceptStatus = 'unknown' | 'lookedup' | 'understood';

export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  venue: string;
  source: Source;
  link: string;
  tags: string[];
  status: PaperStatus;
  /** answers keyed by pass, then question id */
  notes: Record<PassNo, Record<string, string>>;
  /** Pass 1 Q5: is it worth reading further? */
  worthReading: 'yes' | 'no' | null;
  createdAt: number;
  updatedAt: number;
}

export interface Occurrence {
  paperId: string;
  /** e.g. "Sec. II-B, Eq. (3)" */
  location: string;
  addedAt: number;
}

export interface Concept {
  id: string;
  name: string;
  /** "My explanation" */
  explanation: string;
  links: string[];
  occurrences: Occurrence[];
  createdAt: number;
  updatedAt: number;
}

export interface AppData {
  version: 1;
  papers: Paper[];
  concepts: Concept[];
}

export type PaperInput = Pick<Paper, 'title' | 'authors' | 'year' | 'venue' | 'source' | 'link' | 'tags'>;
