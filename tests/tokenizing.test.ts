import { tokenizeText } from "../src/parser/tokenizer";

describe("Tokenizing text", () => {
  test.each([
    { case: "empty text file", document: "", tokens: [] },
    { case: "a text file with several spaces", document: "   ", tokens: [] },
    {
      case: "a text file with some rows and description text",
      document:
        `Hello, world!
apple   juice_`, tokens: [
        { line: 0, character: 0, content: "Hello,", tokenType: 0 },
        { line: 0, character: 7, content: "world!", tokenType: 0 },
        { line: 1, character: 0, content: "apple", tokenType: 0 },
        { line: 1, character: 8, content: "juice_", tokenType: 0 }
      ]
    }, {
      case: "a text file with \"jumping\" creation date patterns and some text",
      document: `2025-01-01 Read a book
  2025-04-04  Visit  museum
2012-12-01 2012-11-01 2012-10-01`, tokens: [
        { line: 0, character: 0, content: "2025-01-01", tokenType: 2 },
        { line: 0, character: 11, content: "Read", tokenType: 0 },
        { line: 0, character: 16, content: "a", tokenType: 0 },
        { line: 0, character: 18, content: "book", tokenType: 0 },
        { line: 1, character: 2, content: "2025-04-04", tokenType: 0 },
        { line: 1, character: 14, content: "Visit", tokenType: 0 },
        { line: 1, character: 21, content: "museum", tokenType: 0 },
        { line: 2, character: 0, content: "2012-12-01", tokenType: 2 },
        { line: 2, character: 11, content: "2012-11-01", tokenType: 0 },
        { line: 2, character: 22, content: "2012-10-01", tokenType: 0 },
      ]
    },
    {
      case: "plus and minus mayhem",
      document: `+15 +- ±20watts ＋iAmAProject(No) +@:@+`,
      tokens: [
      { line: 0, character: 0, content: "+15", tokenType: 5},
      { line: 0, character: 4, content: "+-", tokenType: 5},
      { line: 0, character: 7, content: "±20watts", tokenType: 0 },
      // Full-width plus sign (U+FF0B) is here. This will not produce a project.
      { line: 0, character: 16, content: "＋iAmAProject(No)", tokenType: 0 },
      { line: 0, character: 33, content: "+@:@+", tokenType: 5 },
    ]
    }, {
      case: "mayhem with @ symbols",
      document: `@ +
Learn how to add 2+2
Reply to noreply@github.com
    @key:Value  `,
      tokens: [
        { line: 0, character: 0, content: "@", tokenType: 0 },
        { line: 0, character: 2, content: "+", tokenType: 0 },
        { line: 1, character: 0, content: "Learn", tokenType: 0 },
        { line: 1, character: 6, content: "how", tokenType: 0 },
        { line: 1, character: 10, content: "to", tokenType: 0 },
        { line: 1, character: 13, content: "add", tokenType: 0 },
        { line: 1, character: 17, content: "2+2", tokenType: 0 },
        { line: 2, character: 0, content: "Reply", tokenType: 0 },
        { line: 2, character: 6, content: "to", tokenType: 0 },
        { line: 2, character: 9, content: "noreply@github.com", tokenType: 0 },
        { line: 3, character: 4, content: "@key:Value", tokenType: 6 }
      ]
    },
    {
      case: "brackets and letters mayhem, which will mean a priority?",
      document: `(A) +TouchGrass
(b) Get back to the boss
(С) ...allrightreserved
(D)ear
(E) (E)
(GG)
(Н) get out of @bed`, tokens: [
        { line: 0, character: 0, content: "(A)", tokenType: 1 },
        { line: 0, character: 4, content: "+TouchGrass", tokenType: 5 },
        { line: 1, character: 0, content: "(b)", tokenType: 0 },
        { line: 1, character: 4, content: "Get", tokenType: 0 },
        { line: 1, character: 8, content: "back", tokenType: 0 },
        { line: 1, character: 13, content: "to", tokenType: 0 },
        { line: 1, character: 16, content: "the", tokenType: 0 },
        { line: 1, character: 20, content: "boss", tokenType: 0 },
        // A cyrillic C. Will not produce a priority.
        { line: 2, character: 0, content: "(С)", tokenType: 0 },
        { line: 2, character: 4, content: "...allrightreserved", tokenType: 0 },
        { line: 3, character: 0, content: "(D)ear", tokenType: 0 },
        { line: 4, character: 0, content: "(E)", tokenType: 1 },
        { line: 4, character: 4, content: "(E)", tokenType: 0 },
        { line: 5, character: 0, content: "(GG)", tokenType: 0 },
        // A cyrillic H. Same.
        { line: 6, character: 0, content: "(Н)", tokenType: 0 },
        { line: 6, character: 4, content: "get", tokenType: 0 },
        { line: 6, character: 8, content: "out", tokenType: 0 },
        { line: 6, character: 12, content: "of", tokenType: 0 },
        { line: 6, character: 15, content: "@bed", tokenType: 6 },
      ]
    }, {
      case: "a task almost with every tag possible",
      document: "2016-04-30 Measure space for +chapelShelving @chapel due:2016-05-30", tokens: [
        { line: 0, character: 0, content: "2016-04-30", tokenType: 2 },
        { line: 0, character: 11, content: "Measure", tokenType: 0 },
        { line: 0, character: 19, content: "space", tokenType: 0 },
        { line: 0, character: 25, content: "for", tokenType: 0 },
        { line: 0, character: 29, content: "+chapelShelving", tokenType: 5 },
        { line: 0, character: 45, content: "@chapel", tokenType: 6 },
        { line: 0, character: 53, content: "due:2016-05-30", tokenType: 7 },
      ]
    }, {
      case: "colon mayhem, which will mean key:value tag?",
      document: `5: :42 :
true：false 11ː50 AM
|:-0
::
a::B
key:value`,
      tokens: [
        { line: 0, character: 0, content: "5:", tokenType: 0 },
        { line: 0, character: 3, content: ":42", tokenType: 0 },
        { line: 0, character: 7, content: ":", tokenType: 0 },
        // Full-width colon (U+FF1A). Will not produce a key:value tag.
        { line: 1, character: 0, content: "true：false", tokenType: 0 },
        // Modifier letter triangular colon (U+02D0). Same.
        { line: 1, character: 11, content: "11ː50", tokenType: 0 },
        { line: 1, character: 17, content: "AM", tokenType: 0 },
        { line: 2, character: 0, content: "|:-0", tokenType: 7 },
        { line: 3, character: 0, content: "::", tokenType: 0 },
        { line: 4, character: 0, content: "a::B", tokenType: 0 },
        { line: 5, character: 0, content: "key:value", tokenType: 7 },
      ]
    }, {
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
        { line: 0, character: 0, content: "x", tokenType: 4 },
        { line: 0, character: 2, content: "play", tokenType: 0 },
        { line: 0, character: 7, content: "a", tokenType: 0 },
        { line: 0, character: 9, content: "+game", tokenType: 5 },
     		{ line: 1, character: 0, content: "x", tokenType: 4 },
        { line: 1, character: 2, content: "2023-01-01", tokenType: 3 },
        { line: 1, character: 13, content: "Wash", tokenType: 0 },
        { line: 1, character: 18, content: "a", tokenType: 0 },
        { line: 1, character: 20, content: "floor", tokenType: 0 },
        { line: 1, character: 26, content: "@home", tokenType: 6 },
        { line: 1, character: 32, content: "t:2022-10-25", tokenType: 7 },
        { line: 2, character: 0, content: "x", tokenType: 4 },
        { line: 2, character: 2, content: "2024-12-31", tokenType: 3 },
        { line: 2, character: 13, content: "2024-06-30", tokenType: 2 },
        { line: 2, character: 24, content: "Finish", tokenType: 0 },
        { line: 2, character: 31, content: "Dark", tokenType: 0 },
        { line: 2, character: 36, content: "Souls", tokenType: 0 },
        { line: 3, character: 0, content: "x", tokenType: 4 },
        { line: 3, character: 2, content: "2024-11-29", tokenType: 3 },
        { line: 3, character: 13, content: "2024-05-08", tokenType: 2 },
        { line: 3, character: 24, content: "2022-10-04", tokenType: 0 },
        { line: 3, character: 35, content: "hehe", tokenType: 0 },
        // A cyrillic x. This will not create a completed task on its row.
        { line: 4, character: 0, content: "х", tokenType: 0 },
        { line: 4, character: 2, content: "Посадить", tokenType: 0 },
        { line: 4, character: 11, content: "дерево", tokenType: 0 },
        { line: 4, character: 18, content: "@жизнь", tokenType: 6 },
        { line: 6, character: 0, content: "x", tokenType: 4 },
        { line: 6, character: 2, content: "x", tokenType: 0 },
        { line: 6, character: 4, content: "x", tokenType: 0 },
        { line: 7, character: 0, content: "x_x", tokenType: 0 },
        { line: 8, character: 0, content: "xylophone", tokenType: 0 },
        { line: 8, character: 10, content: "lesson", tokenType: 0 },
        { line: 9, character: 0, content: "X", tokenType: 0 },
        { line: 9, character: 2, content: "2012-01-01", tokenType: 0 },
        { line: 9, character: 13, content: "Make", tokenType: 0 },
        { line: 9, character: 18, content: "resolutions", tokenType: 0 },
      ]
    }, {
      case: "let's add some emojis and even more weird characters!",
      document: `(A) x Find ticket prices
🧠 get +200 IQ
(Ａ) sleep ＠healht
🯲🯰🯰🯰-🯰🯱-🯰🯱 🌳:🐵 +👽 @💩
ｘ grow beard`, tokens: [
      { line: 0, character: 0, content: "(A)", tokenType: 1 },
      { line: 0, character: 4, content: "x", tokenType: 0 },
      { line: 0, character: 6, content: "Find", tokenType: 0 },
      { line: 0, character: 11, content: "ticket", tokenType: 0 },
      { line: 0, character: 18, content: "prices", tokenType: 0 },
      { line: 1, character: 0, content: "🧠", tokenType: 0 },
      { line: 1, character: 3, content: "get", tokenType: 0 },
      { line: 1, character: 7, content: "+200", tokenType: 5 },
      { line: 1, character: 12, content: "IQ", tokenType: 0 },
      // Full-width latin capital A (U+FF21)
      { line: 2, character: 0, content: "(Ａ)", tokenType: 0 },
      { line: 2, character: 4, content: "sleep", tokenType: 0 },
      // Full-width commercial at (U+FF20)
      { line: 2, character: 10, content: "＠healht", tokenType: 0 },
      // Segmented digits (U+1FB0 - U+1FB9)
      { line: 3, character: 0, content: "🯲🯰🯰🯰-🯰🯱-🯰🯱", tokenType: 0 },
      { line: 3, character: 19, content: "🌳:🐵", tokenType: 7 },
      { line: 3, character: 25, content: "+👽", tokenType: 5 },
      { line: 3, character: 29, content: "@💩", tokenType: 6 },
      // Full-width small latin letter x (U+FF58)
      { line: 4, character: 0, content: "ｘ", tokenType: 0 },
      { line: 4, character: 2, content: "grow", tokenType: 0 },
      { line: 4, character: 7, content: "beard", tokenType: 0 },
      // NOTE: emojis and segmented digits take up two characters
    ]

    }
  ])("Case: \"$case\": is the text tokenized correctly?",
      ({ document, tokens }): void => {
        expect(tokenizeText(document))
          .toStrictEqual(tokens);
      }
    );
});
