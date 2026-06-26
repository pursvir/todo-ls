import { getIndexOnLine } from "../src/parser/utils";

describe("Getting indexes on lines", () => {
  test.each([
    { name: "empty file", tokens: [], line: 0, expectation: 0 },
    {
      name: "one token on line", tokens: [{
        line: 0,
        character: 0,
        content: "(A)",
        tokenType: 1,
      }], line: 0, expectation: 1
    },
    {
      name: "typing a context after description",
      tokens: [{
        line: 0,
        character: 0,
        content: "(B)",
        tokenType: 1,
      }, {
        line: 0,
        character: 4,
        content: "2026-06-01",
        tokenType: 2,
      }, {
        line: 0,
        character: 15,
        content: "Clean",
        tokenType: 0,
      }, {
        line: 0,
        character: 21,
        content: "a",
        tokenType: 0,
      }, {
        line: 0,
        character: 23,
        content: "windowsill",
        tokenType: 0,
      }],
      line: 0, expectation: 5
    }
  ])("Is last token index equals $expectation on line $line in the case \"$name\"?",
    ({ tokens, line, expectation }): void => {
      expect(
        getIndexOnLine(tokens, line)
      ).toBe(expectation);
  });
});
