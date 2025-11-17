export const COMPLETION_MARK_RE: RegExp = /^x$/;
export const PRIORITY_RE: RegExp = /^\([A-Z]\)$/;
export const DATE_RE: RegExp = /^\d{4}-\d{2}-\d{2}$/;
export const PROJECT_RE: RegExp = /^\+\S+$/;
export const CONTEXT_RE: RegExp = /^@\S+$/;
export const KV_RE: RegExp = /^[^:\s]+\:[^:\s]+$/;

export const DATA_BEFORE_DESCRIPTION_RE: RegExp =
  /^(?:x(?: \d{4}-\d{2}-\d{2}){0,2} |(?:\([A-Z]\) )?(?:\d{4}-\d{2}-\d{2} )?)/;
