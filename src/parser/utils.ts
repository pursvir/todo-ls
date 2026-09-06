const LINES_RE: RegExp = /\r?\n/;

/** A helper function for splitting `text` by newlines. */
export function getLines(text: string): string[] {
    return text.split(LINES_RE);
}
