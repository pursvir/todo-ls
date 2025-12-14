import { Position } from "vscode-languageserver";

import { getIndexAtPosition, getTokenEnd, positionIsInsideToken } from "../src/tokenctl/utils";
import { Token } from "../src/parser/tokenTypes";
import { testParams } from "./params";

describe("Walking over tokens", () => {
  const tokenLists: Token[][] = testParams.map((param: [string, Token[]]) => param[1]);

  tokenLists.forEach((tokenList: Token[], listIndex: number) => {
    let i: number = 0;
    let previousLine: number = -1;
    tokenList.forEach((token: Token, tokenIndex: number) => {
      let position: Position;

      if (token.line !== previousLine) {
        // TODO: walk over whitespaces at the task end (we assume that sometimes they can be not trimmed)
        // TODO: walk over empty lines
        i = 0;
        previousLine = token.line;
      }

      // TODO: test boolean return values of getIndexAtPosition

      for (; i < token.character; i++) {
        position = { line: token.line, character: i };
        let testName: string = `tokenLists[${listIndex}] > ${JSON.stringify(token)} > ${JSON.stringify(position)}`;
        // TODO: prevent tests failing for task rows where there are 2+ whitespace gaps #1
        //  although it works correctly with hover e2e test!
        test(`${testName} - positionIsInsideToken (outside the token)`, () => {
          expect(positionIsInsideToken(position, token)).toStrictEqual(false);
        });
        test(`${testName} - getIndexAtPosition(splice=true) (outside the token)`, () => {
          expect(getIndexAtPosition(tokenList, position, true)[0]).toStrictEqual(tokenIndex);
        });
        // check #1
        test(`${testName} - getIndexAtPosition(splice=false) (outside the token)`, () => {
          expect(getIndexAtPosition(tokenList, position, false)[0]).toStrictEqual(-1);
        });
      }

      for (; i < getTokenEnd(token) + 1; i++) {
        position = { line: token.line, character: i };
        let testName: string = `tokenLists[${listIndex}] > ${JSON.stringify(token)} > ${JSON.stringify(position)}`;
        test(`${testName} - positionIsInsideToken (inside the token)`, () => {
          expect(positionIsInsideToken(position, token)).toStrictEqual(true);
        });
        test(`${testName} - getIndexAtPosition(splice=true) (inside the token)`, () => {
          expect(getIndexAtPosition(tokenList, position, true)[0]).toStrictEqual(tokenIndex);
        });
        test(`${testName} - getIndexAtPosition(splice=false) (inside the token)`, () => {
          expect(getIndexAtPosition(tokenList, position, false)[0]).toStrictEqual(tokenIndex);
        });
      }
    });
  });
});
