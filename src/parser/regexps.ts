export const COMPLETION_MARK_RE: RegExp = /^x$/;

export const PRIORITY_RE: RegExp = /^\([A-Z]\)$/;
export const INCOMPLETE_PRIORITY_BEGINNING_RE: RegExp = /^(?<priorBegin>\([A-Z]?\)?).*$/;
export const PRIORITY_CONTAINING_RE: RegExp = /\([A-Z]\)$/;

export const DATE_RE: RegExp = /^[1-9]\d{3}-\d{2}-\d{2}$/;
export const INCOMPLETE_DATE_BEGINNING_RE: RegExp = /^([1-9](?:|\d{1,3}|\d{3}(?:-(?:|\d{1,2}(?:|-\d{0,1})))))$/;
export const DATE_CONTAINING_RE: RegExp = /[1-9]\d{3}-\d{2}-\d{2}$/;

export const PROJECT_RE: RegExp = /^\+\S+$/;
export const PROJECT_SYMBOL_RE: RegExp = /^\+$/;

export const CONTEXT_RE: RegExp = /^@\S+$/;
export const CONTEXT_SYMBOL_RE: RegExp = /^@$/;

export const KV_RE: RegExp = /^(?<key>[^:\s]+):(?<value>[^:\s]+)$/;
export const KEY_WITH_COLON_RE: RegExp = /^[^:\s]+:/;
