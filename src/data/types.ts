// Shared content types for the networking lab. Content is data-driven: adding a
// new experiment, note, or journey entry means editing these data files only.

export type Status = 'planned' | 'in-progress' | 'complete' | 'broken';
export type Difficulty = 'intro' | 'core' | 'deep' | 'advanced';

export interface JourneyEntry {
  day: number;
  slug: string;
  concept: string;
  summary: string;
  status: Status;
  difficulty: Difficulty;
  tags: string[];
  /** If true, a full experiment page exists at /experiments/:slug */
  hasExperiment: boolean;
}

export interface ExperimentSection {
  /** Section heading, e.g. "The Question" */
  title: string;
  /** Markdown body (supports GFM + fenced code blocks). */
  body: string;
}

export interface Experiment {
  day: number;
  slug: string;
  title: string;
  concept: string;
  summary: string;
  status: Status;
  difficulty: Difficulty;
  tags: string[];
  date: string;
  /** Ordered sections that follow the lab-notebook template. */
  sections: ExperimentSection[];
}

export interface Note {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface BrokenThing {
  id: string;
  title: string;
  blast: string;
  what: string;
  cause: string;
  fix: string;
  lesson: string;
  relatedSlug?: string;
}

export interface LabNode {
  id: string;
  label: string;
  kind:
    | 'wan'
    | 'router'
    | 'firewall'
    | 'switch'
    | 'ap'
    | 'server'
    | 'client'
    | 'vm'
    | 'container';
  detail: string;
  meta: string[];
}
