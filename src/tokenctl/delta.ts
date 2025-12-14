import { getLines } from "../parser/tokenizer";
import { Token } from "../parser/tokenTypes";
import { TextDocumentContentChangeEvent } from "../_overrides/overrideChangeEvent";
import {
  getIndexAtPosition,
  getTokenEnd,
} from "../tokenctl/utils";
import { getTokenizedText } from "../parser/tokenizer";
import { determineTodotxtTokenType } from "../parser/lexer";

/** Tries to merge first and second token, so that the content of 2nd will overlap one of the 1st, and updates its type.
 *  If token1 and token2 are not lying next to each other, then token2 is just returned.
 * @param token1 - 1st token
 * @param token2 - 2nd token, that we want to "attach" to 1st
 * @param tokensBehind - array of tokens preceding the token ... attached (needed for token type determination)
 * @returns - the result merged token
 */
const tryMergeTokens = (token1: Token, token2: Token): Token =>  {
  /* NOTE: token1 must stand to the left of the token2. */
  let newContent: string;
  if (getTokenEnd(token1) >= token2.character) {
    newContent = token1.content + token2.content
    return {
      ...token1,
      content: newContent,
    };
  } else {
    // ???
    return token2;
  }
}

/**
 * Returns new token list and splice index shift for next delta updates in TextDocumentContentChangeEvent[].
*/
export const deltaChangeTokens = (
  tokens: Token[],
  change: TextDocumentContentChangeEvent,
  spliceStartShift: number = 0,
): [Token[], number] => {
  console.debug(`Starting handling token array: ${JSON.stringify(tokens)}`)
  const oldLength: number = tokens.length;
  const pastedTokens: Token[] = getTokenizedText(
    change.text, change.range.start.line, change.range.start.character
  );

  let spliceStartIndex: number; let startIsInsideAToken: boolean;
  let spliceEndIndex: number; let endIsInsideAToken: boolean;
  [spliceStartIndex, startIsInsideAToken] = getIndexAtPosition(
    tokens, change.range.start, true,
  ); spliceStartIndex += spliceStartShift;
  [spliceEndIndex, endIsInsideAToken] = getIndexAtPosition(
    tokens, change.range.end, true,
  ); spliceEndIndex += spliceStartShift;
  console.debug(`Splice start: ${spliceStartIndex}, start is inside: ${startIsInsideAToken}`);
  console.debug(`Splice end: ${spliceEndIndex}, end is inside: ${endIsInsideAToken}`);

  const lines: string[] = getLines(change.text);
  const lineShift: number =
    change.range.end.line - change.range.start.line + (lines.length ? lines.length - 1 : lines.length);
  // (only affects change.range.end.line line)
  const charShift: number =
    lineShift === 0
      ? change.range.start.character - change.range.end.character + lines[lines.length - 1].length
      : lines[lines.length - 1].length - change.range.start.character;
  console.debug(`Line shift: ${lineShift}, char shift: ${charShift}`);

  // Split token, if needed
  let splitWasPerformed: boolean = false;
  if (
    spliceStartIndex === spliceEndIndex
    && startIsInsideAToken && endIsInsideAToken
  ) {
    splitWasPerformed = true;
    tokens.splice(spliceStartIndex, 1, ...Array(2).fill(0).map(() => { return structuredClone(tokens[spliceStartIndex]) }));
    spliceEndIndex++;
    console.debug(`Split tokens! Here are those: ${JSON.stringify(tokens)}`);
  }

  let spliceDeleteCount: number =
    spliceEndIndex - spliceStartIndex - (splitWasPerformed ? 1 : 0);

  // Cutting tokens' content based on change.range borders
  if (startIsInsideAToken) {
    tokens[spliceStartIndex].content =
      tokens[spliceStartIndex].content.slice(
        0, change.range.start.character - tokens[spliceStartIndex].character
      );
  }
  if (endIsInsideAToken) {
    tokens[spliceEndIndex].content =
      tokens[spliceEndIndex].content.slice(
        change.range.end.character - tokens[spliceEndIndex].character
      );
    tokens[spliceEndIndex].character = change.range.end.character;
  }
  console.debug("Cut old tokens:", tokens);

  // Merging first and last pasted tokens data with surrounding old ones, if needed
  let spliceDeleteExtra: number = 0;
  let lastTokenMerged: boolean = false;
  if (pastedTokens.length > 0) {
    let mergedToken: Token = tryMergeTokens(
      tokens[spliceStartIndex], pastedTokens[0]
    );
    if (pastedTokens[0] !== mergedToken) {
      spliceDeleteExtra++;
      pastedTokens[0] = mergedToken;
    }
    if (pastedTokens.length > 1 || splitWasPerformed) {
      mergedToken = tryMergeTokens(
        pastedTokens[pastedTokens.length - 1], tokens[spliceEndIndex]
      );
      if (pastedTokens[pastedTokens.length - 1] !== mergedToken) {
        lastTokenMerged = true;
        spliceDeleteExtra++;
        pastedTokens[pastedTokens.length - 1] = mergedToken;
      }
    }
  }
  console.debug("Final pasted tokens:", pastedTokens);

  console.debug(`Splice start: ${spliceStartIndex}, delete count: ${spliceDeleteCount}, items: ${pastedTokens}`);
  const shiftStartSub: number = tokens.splice(
    spliceStartIndex,
    spliceDeleteCount + spliceDeleteExtra,
    ...pastedTokens,
  ).length;

  // Changing token types in the area of token joint, if needed.
  if (spliceStartIndex < tokens.length) {
    tokens[spliceStartIndex].tokenType = determineTodotxtTokenType(
      tokens[spliceStartIndex].content,
      tokens[spliceStartIndex].line,
      tokens[spliceStartIndex].character,
      tokens.slice(0, spliceStartIndex)
    );
  }

  // Shifting .line and .char attributes of the rest of the tokens.
  for (
    let i: number = spliceEndIndex - spliceDeleteCount + pastedTokens.length;
    i < tokens.length;
    i++
  ) {
    if (tokens[i].line === change.range.end.line) {
      tokens[i].character += charShift;
    }
    tokens[i].line += lineShift;
  }

  // Changing token types in the area of token joint, if needed, pt. 2
  if (spliceEndIndex < tokens.length) {
    tokens[spliceEndIndex].tokenType = determineTodotxtTokenType(
      tokens[spliceEndIndex].content,
      tokens[spliceEndIndex].line,
      tokens[spliceEndIndex].character,
      tokens.slice(0, spliceEndIndex)
    );
  }

  console.debug("Final tokens:", tokens);
  spliceStartShift += tokens.length - oldLength;
  return [tokens, spliceStartShift];
};
