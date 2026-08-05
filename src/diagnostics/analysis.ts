import { Diagnostic } from "vscode-languageserver";

import { TodotxtTokenType, Token } from "../parser/tokenTypes";
import { generateISODate } from "../utils/dateUtils";
import {
  diagnoseInvalidCreationDateToken,
  diagnoseInvalidCompletionDateToken,
  diagnoseDuplicateProject,
  diagnoseDuplicateContext,
  diagnoseDuplicateKey,
  diagnoseMissingDescription,
  diagnoseMissingCompletionDate,
  diagnoseRedundantWhitespaces,
  diagnoseInvalidCompletionChronology,
} from "./diagnosis";
import { getKey, getTokenEnd } from "../utils/tokenUtils";

import { storage } from "../server";
import { TextDocument } from "vscode-languageserver-textdocument";

// TODO: this is complete antipattern code... In the future, those functions **should** return Diagnostic or nothing.

const analyzeForDuplicateTags = (
  token: Token,
  uniqueTags: Record<string, Set<string>>,
  diagnostics: Diagnostic[]
): void => {
  switch (token.tokenType) {
    case TodotxtTokenType.Project:
      if (uniqueTags.projects.has(token.content)) {
        diagnostics.push(diagnoseDuplicateProject(token));
      } else {
        uniqueTags.projects.add(token.content);
      }
      break;
    case TodotxtTokenType.Context:
      if (uniqueTags.contexts.has(token.content)) {
        diagnostics.push(diagnoseDuplicateContext(token));
      } else {
        uniqueTags.contexts.add(token.content);
      }
      break;
    case TodotxtTokenType.KeyValue:
      const key: string = getKey(token);
      if (uniqueTags.keys.has(key)) {
        diagnostics.push(diagnoseDuplicateKey(token));
      } else {
        uniqueTags.keys.add(key);
      }
      break;
  };
};

/** Returns `token`'s last character. */
const analyzeForRedundantWhitespaces = (
  token: Token,
  lastChar: number,
  diagnostics: Diagnostic[]
): number => {
  if (token.character - lastChar >= 2)
    diagnostics.push(diagnoseRedundantWhitespaces(
      token.line, lastChar, token.character,
    ));
  return getTokenEnd(token);
};

/** Returns `true` if token is invalid creation date. */
const analyzeForInvalidCreationDate = (
  token: Token,
  today: string,
  diagnostics: Diagnostic[],
): boolean => {
  if (
    token.tokenType === TodotxtTokenType.CreationDate
    && token.content > today
  ) {
    diagnostics.push(diagnoseInvalidCreationDateToken(token));
    return true;
  }
  return false;
}

const analyzeForInvalidCompletionDate = (
  token: Token,
  today: string,
  diagnostics: Diagnostic[],
): void => {
  if (
    token.tokenType === TodotxtTokenType.CompletionDate
    && token.content > today
  ) {
      diagnostics.push(diagnoseInvalidCompletionDateToken(token));
  }
};

/** Analyze document to find errors. */
export const analyzeDocument = (
  document: TextDocument,
): Diagnostic[] => {
  const tokens: Token[][] | undefined = storage.get(document);
  if (!tokens) return [];

  const diagnostics: Diagnostic[] = [];
  // TODO: if a document is open and not changed for many hours, this may become outdated.
  const today: string = generateISODate();

  tokens.forEach((tokenLine: Token[], line: number): void => {
    const isEmptyLine: boolean = tokenLine.length === 0;
    let descriptionIsPresent: boolean = false;

    const uniqueTags: Record<string, Set<string>> = {
      projects: new Set<string>(),
      contexts: new Set<string>(),
      keys: new Set<string>(),
    };

    let compMark: Token | null = null;
    let compDate: Token | null = null;
    let creationDate: Token | null = null;

    let lastChar: number = 0;

    tokenLine.forEach((token: Token): void => {
      // TODO: analyze for duplicate tasks
      // TODO: we should prohibit \t's

      switch (token.tokenType) {
        case TodotxtTokenType.Common:
          descriptionIsPresent = true;
          break;
        case TodotxtTokenType.CompletionMark:
          compMark = token;
          break;
        case TodotxtTokenType.CompletionDate:
          compDate = token;
          break;
      }

      analyzeForDuplicateTags(token, uniqueTags, diagnostics);

      analyzeForInvalidCreationDate(token, today, diagnostics);
      analyzeForInvalidCompletionDate(token, today, diagnostics);

      // TODO: check whitespaces after the last token
      lastChar = analyzeForRedundantWhitespaces(token, lastChar, diagnostics);
    });

    if (compMark && (!compDate)) {
      diagnostics.push(
        diagnoseMissingCompletionDate(
          // TODO: why is compMark.line's type is never?
          line, tokenLine,
        ),
      );
    }

    if ((compDate && creationDate) && (creationDate > compDate)) {
      diagnostics.push(
        diagnoseInvalidCompletionChronology(
          compDate, creationDate,
        )
      );
    }

    if (!descriptionIsPresent && !isEmptyLine) {
      diagnostics.push(
        diagnoseMissingDescription(line, tokenLine)
      );
    }
  });

  return diagnostics;
}
