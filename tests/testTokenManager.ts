import { Position } from "vscode-languageserver";

import { getIndexAtPosition, getTokenEnd, positionIsInsideToken } from "../src/tokenManager";
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
        // if (previousLine !== -1) {
          // /* Walking over task end whitespaces (assuming tasks text is not trimmed).
             // Simulating random whitespace count (value is between 0 and 5). */
          // for (let j: number = i; j < Math.floor(Math.random() * 6) + i; j++) {
            // position = {
              // line: token.line,
              // character: i,
            // };
            // let testName: string = `tokenLists[${listIndex}] > token[${tokenIndex}] > position: ${JSON.stringify(position)}`;
            // test(`${testName} - is position inside token?`, () => {
              // expect(positionIsInsideToken(position, token)).toBeFalsy;
            // });
            // test(`${testName} - get token index for splice`, () => {
              // expect(getIndexAtPosition(tokenList, position, true)).toStrictEqual(tokenIndex + 1);
            // });
            // test(`${testName} - get token index`, () => {
              // expect(getIndexAtPosition(tokenList, position, false)).toStrictEqual(-1);
            // });
          // }
        // }
        i = 0;
        previousLine = token.line;
      }

      for (; i < token.character; i++) {
        position = {
          line: token.line,
          character: i,
        };
        let testName: string = `tokenLists[${listIndex}] > token[${tokenIndex}] > position: ${JSON.stringify(position)}`;
        test(`${testName} - positionIsInsideToken (outside the token)`, () => {
          expect(positionIsInsideToken(position, token)).toBeTruthy;
        });
        test(`${testName} - getIndexAtPosition(splice=true) (outside the token)`, () => {
          expect(getIndexAtPosition(tokenList, position, true)).toStrictEqual(tokenIndex);
        });
        test(`${testName} - getIndexAtPosition(splice=false) (outside the token)`, () => {
          expect(getIndexAtPosition(tokenList, position, false)).toStrictEqual(-1);
        });
      }

      for (; i < getTokenEnd(token) + 1; i++) {
        position = {
          line: token.line,
          character: i,
        };
        let testName: string = `tokenLists[${listIndex}] > token[${tokenIndex}] > position: ${JSON.stringify(position)}`;
        test(`${testName} - positionIsInsideToken (inside the token)`, () => {
          expect(positionIsInsideToken(position, token)).toBeTruthy;
        });
        test(`${testName} - getIndexAtPosition(splice=true) (inside the token)`, () => {
          expect(getIndexAtPosition(tokenList, position, true)).toStrictEqual(tokenIndex);
        });
        test(`${testName} - getIndexAtPosition(splice=false) (inside the token)`, () => {
          expect(getIndexAtPosition(tokenList, position, false)).toStrictEqual(tokenIndex);
        });
      }
    });
  });
});
