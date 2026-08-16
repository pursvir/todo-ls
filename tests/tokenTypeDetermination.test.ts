import { determineTokenType, determinePatternType } from "../src/parser/parser";
import { PatternType, TodotxtTokenType } from "../src/parser/tokenTypes";

type TestParam = {
  case: string,
  content: string,
  pattern: PatternType,
}

describe("Determining token patterns", () => {
  test.each<TestParam>([
    { case: "common token 1", content: "a", pattern: PatternType.Common },
    { case: "common token 2", content: "Buy", pattern: PatternType.Common },
    { case: "priority", content: "(A)", pattern: PatternType.Priority },
    { case: "plus sign", content: "+", pattern: PatternType.Common },
    { case: "project 1", content: "+someCoolProject", pattern: PatternType.Project },
    { case: "project 2", content: "+abra@kadabre", pattern: PatternType.Project },
    { case: "project 3", content: "+amara:kedavra", pattern: PatternType.Project },
    { case: "common with context beginning", content: "@", pattern: PatternType.Common },
    { case: "context 1", content: "@chores", pattern: PatternType.Context },
    { case: "context 2", content: "@2+2", pattern: PatternType.Context },
    { case: "context 3", content: "@key:value", pattern: PatternType.Context },
    { case: "key:value ", content: "due:2026-07-01", pattern: PatternType.KeyValue },
    { case: "key:value 2", content: "a:b", pattern: PatternType.KeyValue },
    { case: "key:value 3", content: "12:15", pattern: PatternType.KeyValue },
    { case: "token with multiple colons (not a key:value)", content: "12:59:00", pattern: PatternType.Common },
    {
      case: "token with multiple colons (not a key:value), pt. 2",
      content: "magnet:?xt=urn:btih:439ec22f4d9a8efd479a98d94940e5f93d4b8140&dn=Totally.Legal.Content.1895.WEB-DL.720p.mkv",
      pattern: PatternType.Common
    },
    { case: "common token ending with \":\"", content: "list:", pattern: PatternType.Common },
    { case: "ASCII smile", content: ":-0", pattern: PatternType.Common },
    { case: "a custom emoji, not a key:value", content: ":crying:", pattern: PatternType.Common },
    { case: "completion mark pattern", content: "x", pattern: PatternType.CompletionMark },
  ])("Case \"$name\": is a pattern type for content \"$content\" \"$pattern\"?",
    ({ content, pattern }): void => {
      expect(
        determinePatternType(content)
      ).toStrictEqual(pattern);
  });
});

describe("Determining token types", () => {
  test.each([
    { case: "a new task starting with a simple word", tokens: [], line: 0, character: 0, content: "Finish", tokenType: TodotxtTokenType.Common },
    { case: "a new task starting with a priority", tokens: [], line: 0, character: 0, content: "(A)", tokenType: TodotxtTokenType.Priority },
    { case: "a new task starting with a date pattern", tokens: [], line: 0, character: 0, content: "2026-01-01", tokenType: TodotxtTokenType.CreationDate },
    {
      case: "pasting a (creation) date after priority", tokens: [
        {
          line: 0,
          character: 0,
          content: "(B)",
          tokenType: TodotxtTokenType.Priority,
      }
      ], line: 0, character: 4, content: "2026-01-01", tokenType: TodotxtTokenType.CreationDate
    },
    {
      case: "pasting a (creation) date after priority, but a little further", tokens: [
        {
          line: 0,
          character: 0,
          content: "(B)",
          tokenType: TodotxtTokenType.Priority,
      }
      ], line: 0, character: 5, content: "2026-01-01", tokenType: TodotxtTokenType.Common
    },
    {
      case: "pasting a project after priority", tokens: [
        {
          line: 0,
          character: 0,
          content: "(B)",
          tokenType: TodotxtTokenType.Priority,
      }
      ], line: 0, character: 5, content: "+GoogleAnalogue", tokenType: TodotxtTokenType.Project
    },
    {
      case: "pasting a project after priority, but a little further", tokens: [
        {
          line: 0,
          character: 0,
          content: "(B)",
          tokenType: TodotxtTokenType.Priority,
      }
      ], line: 0, character: 6, content: "+GoogleAnalogue", tokenType: TodotxtTokenType.Project
    },
    {
      case: "pasting a context", tokens: [
        {
          line: 0,
          character: 0,
          content: "(B)",
          tokenType: TodotxtTokenType.Priority,
        }, {
          line: 0,
          character: 4,
          content: "2026-06-01",
          tokenType: TodotxtTokenType.CreationDate,
        }, {
          line: 0,
          character: 15,
          content: "Clean",
          tokenType: TodotxtTokenType.Common,
        }, {
          line: 0,
          character: 21,
          content: "a",
          tokenType: TodotxtTokenType.Common,
        }, {
          line: 0,
          character: 23,
          content: "windowsill",
          tokenType: TodotxtTokenType.Common,
        }
      ], line: 0, character: 34, content: "@home", tokenType: TodotxtTokenType.Context
    },
    {
      case: "pasting a completion mark", tokens: [],
      line: 1, character: 0, content: "x", tokenType: TodotxtTokenType.CompletionMark,
    },
    {
      case: "pasting a completion date after completion mark", tokens: [
        { line: 1, character: 0, content: "x", tokenType: TodotxtTokenType.CompletionMark }
      ], line: 1, character: 2, content: "2026-07-01", tokenType: TodotxtTokenType.CompletionDate
    },
    {
      case: "pasting a date after completion mark, but a little further (so it's just a common part of task's description)", tokens: [
        { line: 1, character: 0, content: "x", tokenType: TodotxtTokenType.CompletionMark }
      ], line: 1, character: 3, content: "2026-07-01", tokenType: TodotxtTokenType.Common
    },
  ])("Case \"case\": is a tokenType for content \"$content\" on line $line, character $character equals $tokenType?",
    ({ character, tokens, content, tokenType }): void => {
      expect(determineTokenType(
        content, character, tokens
      )).toBe(tokenType);
    }
  );
});
