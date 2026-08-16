import { tokenizeText } from "../src/parser/tokenizer";
import { TodotxtTokenType, Token } from "../src/parser/tokenTypes";

type TestParam = {
  case: string;
  document: string;
  tokens: Token[][];
};

// NOTE: emojis and segmented digits take up two characters
describe("Tokenizing text", () => {
  test.each<TestParam>([
    { case: "empty text file", document: "", tokens: [[]] },
    { case: "a text file with several spaces", document: "   ", tokens: [[]] },
    {
      case: "a text file with some rows and description text",
      document: `Hello, world!
apple   juice_`,
      tokens: [
        [
          {
            line: 0,
            character: 0,
            content: "Hello,",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 7,
            content: "world!",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 1,
            character: 0,
            content: "apple",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 8,
            content: "juice_",
            tokenType: TodotxtTokenType.Common,
          },
        ],
      ],
    },
    {
      case: 'a text file with "jumping" creation date patterns and some text',
      document: `2025-01-01 Read a book
  2025-04-04  Visit  museum
2012-12-01 2012-11-01 2012-10-01`,
      tokens: [
        [
          {
            line: 0,
            character: 0,
            content: "2025-01-01",
            tokenType: TodotxtTokenType.CreationDate,
          },
          {
            line: 0,
            character: 11,
            content: "Read",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 16,
            content: "a",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 18,
            content: "book",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 1,
            character: 2,
            content: "2025-04-04",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 14,
            content: "Visit",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 21,
            content: "museum",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 2,
            character: 0,
            content: "2012-12-01",
            tokenType: TodotxtTokenType.CreationDate,
          },
          {
            line: 2,
            character: 11,
            content: "2012-11-01",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 2,
            character: 22,
            content: "2012-10-01",
            tokenType: TodotxtTokenType.Common,
          },
        ],
      ],
    },
    {
      case: "plus and minus mayhem",
      document: `+15 +- ±20watts ＋iAmAProject(No) +@:@+`,
      tokens: [
        [
          {
            line: 0,
            character: 0,
            content: "+15",
            tokenType: TodotxtTokenType.Project,
          },
          {
            line: 0,
            character: 4,
            content: "+-",
            tokenType: TodotxtTokenType.Project,
          },
          {
            line: 0,
            character: 7,
            content: "±20watts",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 16,
            // Full-width plus sign (U+FF0B) is here. Will not produce a project.
            content: "＋iAmAProject(No)",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 33,
            content: "+@:@+",
            tokenType: TodotxtTokenType.Project,
          },
        ],
      ],
    },
    {
      case: "mayhem with @ symbols",
      document: `@ +
Learn how to add 2+2
Reply to noreply@github.com
    @key:Value  `,
      tokens: [
        [
          {
            line: 0,
            character: 0,
            content: "@",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 2,
            content: "+",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 1,
            character: 0,
            content: "Learn",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 6,
            content: "how",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 10,
            content: "to",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 13,
            content: "add",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 17,
            content: "2+2",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 2,
            character: 0,
            content: "Reply",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 2,
            character: 6,
            content: "to",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 2,
            character: 9,
            content: "noreply@github.com",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 3,
            character: 4,
            content: "@key:Value",
            tokenType: TodotxtTokenType.Context,
          },
        ],
      ],
    },
    {
      case: "brackets and letters mayhem, which will mean a priority?",
      document: `(A) +TouchGrass
(b) Get back to the boss
(С) ...allrightreserved
(D)ear
(E) (E)
(GG)
(Н) get out of @bed`,
      tokens: [
        [
          {
            line: 0,
            character: 0,
            content: "(A)",
            tokenType: TodotxtTokenType.Priority,
          },
          {
            line: 0,
            character: 4,
            content: "+TouchGrass",
            tokenType: TodotxtTokenType.Project,
          },
        ],
        [
          {
            line: 1,
            character: 0,
            content: "(b)",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 4,
            content: "Get",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 8,
            content: "back",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 13,
            content: "to",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 16,
            content: "the",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 20,
            content: "boss",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 2,
            character: 0,
            // A cyrillic C.
            content: "(С)",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 2,
            character: 4,
            content: "...allrightreserved",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 3,
            character: 0,
            content: "(D)ear",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 4,
            character: 0,
            content: "(E)",
            tokenType: TodotxtTokenType.Priority,
          },
          {
            line: 4,
            character: 4,
            content: "(E)",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 5,
            character: 0,
            content: "(GG)",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 6,
            character: 0,
            // A cyrillic H.
            content: "(Н)",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 6,
            character: 4,
            content: "get",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 6,
            character: 8,
            content: "out",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 6,
            character: 12,
            content: "of",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 6,
            character: 15,
            content: "@bed",
            tokenType: TodotxtTokenType.Context,
          },
        ],
      ],
    },
    {
      case: "a task almost with every tag possible",
      document:
        "2016-04-30 Measure space for +chapelShelving @chapel due:2016-05-30",
      tokens: [
        [
          {
            line: 0,
            character: 0,
            content: "2016-04-30",
            tokenType: TodotxtTokenType.CreationDate,
          },
          {
            line: 0,
            character: 11,
            content: "Measure",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 19,
            content: "space",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 25,
            content: "for",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 29,
            content: "+chapelShelving",
            tokenType: TodotxtTokenType.Project,
          },
          {
            line: 0,
            character: 45,
            content: "@chapel",
            tokenType: TodotxtTokenType.Context,
          },
          {
            line: 0,
            character: 53,
            content: "due:2016-05-30",
            tokenType: TodotxtTokenType.KeyValue,
          },
        ],
      ],
    },
    {
      case: "colon mayhem, which will mean key:value tag?",
      document: `5: :42 :
true：false 11ː50 AM
|:-0
::
a::B
key:value`,
      tokens: [
        [
          {
            line: 0,
            character: 0,
            content: "5:",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 3,
            content: ":42",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 7,
            content: ":",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 1,
            character: 0,
            // Full-width colon (U+FF1A). Therefore, not a key:value tag.
            content: "true：false",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 11,
            // Modifier letter triangular colon (U+02D0). Same.
            content: "11ː50",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 17,
            content: "AM",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 2,
            character: 0,
            content: "|:-0",
            tokenType: TodotxtTokenType.KeyValue,
          },
        ],
        [
          {
            line: 3,
            character: 0,
            content: "::",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 4,
            character: 0,
            content: "a::B",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 5,
            character: 0,
            content: "key:value",
            tokenType: TodotxtTokenType.KeyValue,
          },
        ],
      ],
    },
    {
      case: "completion marks mayhem",
      document: `x play a +game
x 2023-01-01 Wash a floor @home t:2022-10-25
x 2024-12-31 2024-06-30 Finish Dark Souls
x 2024-11-29 2024-05-08 2022-10-04 hehe
х Посадить дерево @жизнь

x x x
x_x
xylophone lesson
X 2012-01-01 Make resolutions`,
      tokens: [
        [
          {
            line: 0,
            character: 0,
            content: "x",
            tokenType: TodotxtTokenType.CompletionMark,
          },
          {
            line: 0,
            character: 2,
            content: "play",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 7,
            content: "a",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 9,
            content: "+game",
            tokenType: TodotxtTokenType.Project,
          },
        ],
        [
          {
            line: 1,
            character: 0,
            content: "x",
            tokenType: TodotxtTokenType.CompletionMark,
          },
          {
            line: 1,
            character: 2,
            content: "2023-01-01",
            tokenType: TodotxtTokenType.CompletionDate,
          },
          {
            line: 1,
            character: 13,
            content: "Wash",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 18,
            content: "a",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 20,
            content: "floor",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 26,
            content: "@home",
            tokenType: TodotxtTokenType.Context,
          },
          {
            line: 1,
            character: 32,
            content: "t:2022-10-25",
            tokenType: TodotxtTokenType.KeyValue,
          },
        ],
        [
          {
            line: 2,
            character: 0,
            content: "x",
            tokenType: TodotxtTokenType.CompletionMark,
          },
          {
            line: 2,
            character: 2,
            content: "2024-12-31",
            tokenType: TodotxtTokenType.CompletionDate,
          },
          {
            line: 2,
            character: 13,
            content: "2024-06-30",
            tokenType: TodotxtTokenType.CreationDate,
          },
          {
            line: 2,
            character: 24,
            content: "Finish",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 2,
            character: 31,
            content: "Dark",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 2,
            character: 36,
            content: "Souls",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 3,
            character: 0,
            content: "x",
            tokenType: TodotxtTokenType.CompletionMark,
          },
          {
            line: 3,
            character: 2,
            content: "2024-11-29",
            tokenType: TodotxtTokenType.CompletionDate,
          },
          {
            line: 3,
            character: 13,
            content: "2024-05-08",
            tokenType: TodotxtTokenType.CreationDate,
          },
          {
            line: 3,
            character: 24,
            content: "2022-10-04",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 3,
            character: 35,
            content: "hehe",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 4,
            character: 0,
            // A cyrillic x.
            content: "х",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 4,
            character: 2,
            content: "Посадить",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 4,
            character: 11,
            content: "дерево",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 4,
            character: 18,
            content: "@жизнь",
            tokenType: TodotxtTokenType.Context,
          },
        ],
        [],
        [
          {
            line: 6,
            character: 0,
            content: "x",
            tokenType: TodotxtTokenType.CompletionMark,
          },
          {
            line: 6,
            character: 2,
            content: "x",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 6,
            character: 4,
            content: "x",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 7,
            character: 0,
            content: "x_x",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 8,
            character: 0,
            content: "xylophone",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 8,
            character: 10,
            content: "lesson",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 9,
            character: 0,
            content: "X",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 9,
            character: 2,
            content: "2012-01-01",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 9,
            character: 13,
            content: "Make",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 9,
            character: 18,
            content: "resolutions",
            tokenType: TodotxtTokenType.Common,
          },
        ],
      ],
    },
    {
      case: "let's add some emojis and even more weird characters!",
      document: `(A) x Find ticket prices
🧠 get +200 IQ
(Ａ) sleep ＠healht
🯲🯰🯰🯰-🯰🯱-🯰🯱 🌳:🐵 +👽 @💩
ｘ grow beard`,
      tokens: [
        [
          {
            line: 0,
            character: 0,
            content: "(A)",
            tokenType: TodotxtTokenType.Priority,
          },
          {
            line: 0,
            character: 4,
            content: "x",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 6,
            content: "Find",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 11,
            content: "ticket",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 0,
            character: 18,
            content: "prices",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 1,
            character: 0,
            content: "🧠",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 3,
            content: "get",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 1,
            character: 7,
            content: "+200",
            tokenType: TodotxtTokenType.Project,
          },
          {
            line: 1,
            character: 12,
            content: "IQ",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 2,
            character: 0,
            // Full-width latin capital A (U+FF21)
            content: "(Ａ)",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 2,
            character: 4,
            content: "sleep",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 2,
            character: 10,
            // Full-width commercial at (U+FF20)
            content: "＠healht",
            tokenType: TodotxtTokenType.Common,
          },
        ],
        [
          {
            line: 3,
            character: 0,
            // Segmented digits (U+1FB0 - U+1FB9)
            content: "🯲🯰🯰🯰-🯰🯱-🯰🯱",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 3,
            character: 19,
            content: "🌳:🐵",
            tokenType: TodotxtTokenType.KeyValue,
          },
          {
            line: 3,
            character: 25,
            content: "+👽",
            tokenType: TodotxtTokenType.Project,
          },
          {
            line: 3,
            character: 29,
            content: "@💩",
            tokenType: TodotxtTokenType.Context,
          },
        ],
        [
          {
            line: 4,
            character: 0,
            // Full-width small latin letter x (U+FF58)
            content: "ｘ",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 4,
            character: 2,
            content: "grow",
            tokenType: TodotxtTokenType.Common,
          },
          {
            line: 4,
            character: 7,
            content: "beard",
            tokenType: TodotxtTokenType.Common,
          },
        ],
      ],
    },
  ])(
    'Case: "$case": is the text tokenized correctly?',
    ({ document, tokens }): void => {
      expect(tokenizeText(document)).toStrictEqual(tokens);
    },
  );
});
