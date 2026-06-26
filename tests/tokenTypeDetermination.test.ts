import { determineTokenType, determinePatternType } from "../src/parser/lexer";
import { PatternType } from "../src/parser/tokenTypes";

describe("Determining token patterns", () => {
  test.each([
    { name: "common token 1", content: "a", pattern: "common" },
    { name: "common token 2", content: "Buy", pattern: "common" },
    { name: "priority", content: "(A)", pattern: "priority" },
    { name: "common with project beginning", content: "+", pattern: "common" },
    { name: "project 1", content: "+someCoolProject", pattern: "project" },
    { name: "project 2", content: "+abra@kadabre", pattern: "project" },
    { name: "project 3", content: "+amara:kedavra", pattern: "project" },
    { name: "common with context beginning", content: "@", pattern: "common" },
    { name: "context 1", content: "@chores", pattern: "context" },
    { name: "context 2", content: "@2+2", pattern: "context" },
    { name: "context 3", content: "@key:value", pattern: "context" },
    { name: "key:value ", content: "due:2026-07-01", pattern: "keyValue" },
    { name: "key:value 2", content: "a:b", pattern: "keyValue" },
    { name: "key:value 3", content: "12:15", pattern: "keyValue" },
    { name: "token with multiple colons (not a key:value) 1", content: "12:59:00", pattern: "common" },
    {
      name: "token with multiple colons (not a key:value) 2",
      content: "magnet:?xt=urn:btih:439ec22f4d9a8efd479a98d94940e5f93d4b8140&dn=Totally.Legal.Content.1895.WEB-DL.720p.mkv",
      pattern: "common"
    },
    { name: "common token ending with \":\"", content: "list:", pattern: "common" },
    { name: "ASCII smile", content: ":-0", pattern: "common" },
    { name: "a custom emoji, not a key:value", content: ":crying:", pattern: "common" },
    { name: "completion mark pattern", content: "x", pattern: "completionMark" },
  ])("Case \"$name\": is a pattern type for content \"$content\" \"$pattern\"?",
    ({ name, content, pattern }): void => {
      expect(
        determinePatternType(content)
      ).toBe(pattern);
  });
});

describe("Determining token types", () => {
  test.each([
    { name: "a new task starting with a simple word", tokens: [], line: 0, character: 0, content: "Finish", tokenType: 0 },
    { name: "a new task starting with a priority", tokens: [], line: 0, character: 0, content: "(A)", tokenType: 1 },
    { name: "a new task starting with a date pattern", tokens: [], line: 0, character: 0, content: "2026-01-01", tokenType: 2 },
    {
      name: "pasting a (creation) date after priority", tokens: [
        {
          line: 0,
          character: 0,
          content: "(B)",
          tokenType: 1,
      }
      ], line: 0, character: 4, content: "2026-01-01", tokenType: 2
    },
    {
      name: "pasting a (creation) date after priority, but a little further", tokens: [
        {
          line: 0,
          character: 0,
          content: "(B)",
          tokenType: 1,
      }
      ], line: 0, character: 5, content: "2026-01-01", tokenType: 0
    },
    {
      name: "pasting a project after priority", tokens: [
        {
          line: 0,
          character: 0,
          content: "(B)",
          tokenType: 5,
      }
      ], line: 0, character: 5, content: "+GoogleAnalogue", tokenType: 5
    },
    {
      name: "pasting a project after priority, but a little further", tokens: [
        {
          line: 0,
          character: 0,
          content: "(B)",
          tokenType: 5,
      }
      ], line: 0, character: 6, content: "+GoogleAnalogue", tokenType: 5
    },
    {
      name: "pasting a context", tokens: [
        {
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
        }
      ], line: 0, character: 34, content: "@home", tokenType: 6
    },
    {
      name: "pasting a completion mark", tokens: [],
      line: 1, character: 0, content: "x", tokenType: 4,
    },
    {
      name: "pasting a completion date after completion mark", tokens: [
        { line: 1, character: 0, content: "x", tokenType: 4 }
      ], line: 1, character: 2, content: "2026-07-01", tokenType: 3
    },
    {
      name: "pasting a date after completion mark, but a little further (so it's just a common part of task's description)", tokens: [
        { line: 1, character: 0, content: "x", tokenType: 4 }
      ], line: 1, character: 3, content: "2026-07-01", tokenType: 0
    },
  ])("Case \"$name\": is a tokenType for content \"$content\" on line $line, character $character equals $tokenType?",
    ({ name, line, character, tokens, content, tokenType }): void => {
      expect(determineTokenType(
        content, line, character, tokens
      )).toBe(tokenType);
    }
  );
});
