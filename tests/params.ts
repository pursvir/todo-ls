import { Token } from "../src/parser/tokenTypes";
import { encodeTokenType as enc } from "../src/parser/utils";

type testText = string;

export const testParams: [testText, Token[]][] = [
  // TODO: include tasks with \t whitespaces
  // TODO: provide tasks with more non-latin characters
  ["", []],
  ["   ", []],
  [
`
`, [],
  ],
  [
`Hello, world!
apple   juice_`, [
    { line: 0, character: 0, content: "Hello,", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 0, character: 7, content: "world!", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 1, character: 0, content: "apple", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 1, character: 8, content: "juice_", tokenType: enc("description"), tokenModifiers: 0 }
  ]],
  [
`2025-01-01 Read a book
  2025-04-04  Visit  museum
2012-12-01 2012-11-01 2012-10-01`, [
    { line: 0, character: 0, content: "2025-01-01", tokenType: enc("creationDate"), tokenModifiers: 0},
    { line: 0, character: 11, content: "Read", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 0, character: 16, content: "a", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 0, character: 18, content: "book", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 1, character: 2, content: "2025-04-04", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 1, character: 14, content: "Visit", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 1, character: 21, content: "museum", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 2, character: 0, content: "2012-12-01", tokenType: enc("creationDate"), tokenModifiers: 0 },
    { line: 2, character: 11, content: "2012-11-01", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 2, character: 22, content: "2012-10-01", tokenType: enc("description"), tokenModifiers: 0 },
  ]],
  [
`+15 +- ±20watts ＋iAmAProject(No) +@:@+`, [
  { line: 0, character: 0, content: "+15", tokenType: enc("project"), tokenModifiers: 0},
  { line: 0, character: 4, content: "+-", tokenType: enc("project"), tokenModifiers: 0},
  { line: 0, character: 7, content: "±20watts", tokenType: enc("description"), tokenModifiers: 0},
  // Full-width plus sign (U+FF0B) is used
  { line: 0, character: 16, content: "＋iAmAProject(No)", tokenType: enc("description"), tokenModifiers: 0},
  { line: 0, character: 33, content: "+@:@+", tokenType: enc("project"), tokenModifiers: 0},
]],
	[
`@ +
Learn how to add 2+2
Reply to noreply@github.com
    @key:Value  `, [
      { line: 0, character: 0, content: "@", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 0, character: 2, content: "+", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 0, content: "Learn", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 6, content: "how", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 10, content: "to", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 13, content: "add", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 17, content: "2+2", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 2, character: 0, content: "Reply", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 2, character: 6, content: "to", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 2, character: 9, content: "noreply@github.com", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 3, character: 4, content: "@key:Value", tokenType: enc("context"), tokenModifiers: 0 }
    ]
	],
	[
`5: :42 :
true：false 11ː50 AM
|:-0
::
a::B
key:value`, [
  { line: 0, character: 0, content: "5:", tokenType: enc("description"), tokenModifiers: 0 },
  { line: 0, character: 3, content: ":42", tokenType: enc("description"), tokenModifiers: 0 },
  { line: 0, character: 7, content: ":", tokenType: enc("description"), tokenModifiers: 0 },
  // Full-width colon (U+FF1A) is used
  { line: 1, character: 0, content: "true：false", tokenType: enc("description"), tokenModifiers: 0 },
  // Modifier letter triangular colon (U+02D0) is used
  { line: 1, character: 11, content: "11ː50", tokenType: enc("description"), tokenModifiers: 0 },
  { line: 1, character: 17, content: "AM", tokenType: enc("description"), tokenModifiers: 0 },
  { line: 2, character: 0, content: "|:-0", tokenType: enc("keyValue"), tokenModifiers: 0 },
  { line: 3, character: 0, content: "::", tokenType: enc("description"), tokenModifiers: 0 },
  { line: 4, character: 0, content: "a::B", tokenType: enc("description"), tokenModifiers: 0 },
  { line: 5, character: 0, content: "key:value", tokenType: enc("keyValue"), tokenModifiers: 0 },
    ]
	],
	[
`(A) +TouchGrass
(b) Get back to the boss
(С) ...allrightreserved
(D)ear
(E) (E)
(GG)
(Н) get out of @bed
`, [
    { line: 0, character: 0, content: "(A)", tokenType: enc("priority"), tokenModifiers: 0 },
    { line: 0, character: 4, content: "+TouchGrass", tokenType: enc("project"), tokenModifiers: 0 },
    { line: 1, character: 0, content: "(b)", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 1, character: 4, content: "Get", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 1, character: 8, content: "back", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 1, character: 13, content: "to", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 1, character: 16, content: "the", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 1, character: 20, content: "boss", tokenType: enc("description"), tokenModifiers: 0 },
    // That's a cyrillic C
    { line: 2, character: 0, content: "(С)", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 2, character: 4, content: "...allrightreserved", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 3, character: 0, content: "(D)ear", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 4, character: 0, content: "(E)", tokenType: enc("priority"), tokenModifiers: 0 },
    { line: 4, character: 4, content: "(E)", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 5, character: 0, content: "(GG)", tokenType: enc("description"), tokenModifiers: 0 },
    // Cyrillic H
    { line: 6, character: 0, content: "(Н)", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 6, character: 4, content: "get", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 6, character: 8, content: "out", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 6, character: 12, content: "of", tokenType: enc("description"), tokenModifiers: 0 },
    { line: 6, character: 15, content: "@bed", tokenType: enc("context"), tokenModifiers: 0 },
  ]],
  [
    "2016-04-30 Measure space for +chapelShelving @chapel due:2016-05-30", [
      { line: 0, character: 0, content: "2016-04-30", tokenType: enc("creationDate"), tokenModifiers: 0 },
      { line: 0, character: 11, content: "Measure", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 0, character: 19, content: "space", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 0, character: 25, content: "for", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 0, character: 29, content: "+chapelShelving", tokenType: enc("project"), tokenModifiers: 0 },
      { line: 0, character: 45, content: "@chapel", tokenType: enc("context"), tokenModifiers: 0 },
      { line: 0, character: 53, content: "due:2016-05-30", tokenType: enc("keyValue"), tokenModifiers: 0 },
    ]
  ],
  [
`x play a +game
x 2023-01-01 Wash a floor @home t:2022-10-25
x 2024-12-31 2024-06-30 Finish Dark Souls
x 2024-11-29 2024-05-08 2022-10-04 hehe
х Посадить дерево @жизнь

x x x
x_x
xylophone lesson
X 2012-01-01 Make resolutions`, [
      { line: 0, character: 0, content: "x", tokenType: enc("completionMark"), tokenModifiers: 0 },
	    { line: 0, character: 2, content: "play", tokenType: enc("description"), tokenModifiers: 0 },
	    { line: 0, character: 7, content: "a", tokenType: enc("description"), tokenModifiers: 0 },
	    { line: 0, character: 9, content: "+game", tokenType: enc("project"), tokenModifiers: 0 },
   		{ line: 1, character: 0, content: "x", tokenType: enc("completionMark"), tokenModifiers: 0 },
      { line: 1, character: 2, content: "2023-01-01", tokenType: enc("completionDate"), tokenModifiers: 0 },
      { line: 1, character: 13, content: "Wash", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 18, content: "a", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 20, content: "floor", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 26, content: "@home", tokenType: enc("context"), tokenModifiers: 0 },
      { line: 1, character: 32, content: "t:2022-10-25", tokenType: enc("keyValue"), tokenModifiers: 0 },
      { line: 2, character: 0, content: "x", tokenType: enc("completionMark"), tokenModifiers: 0 },
      { line: 2, character: 2, content: "2024-12-31", tokenType: enc("completionDate"), tokenModifiers: 0 },
      { line: 2, character: 13, content: "2024-06-30", tokenType: enc("creationDate"), tokenModifiers: 0 },
      { line: 2, character: 24, content: "Finish", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 2, character: 31, content: "Dark", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 2, character: 36, content: "Souls", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 3, character: 0, content: "x", tokenType: enc("completionMark"), tokenModifiers: 0 },
      { line: 3, character: 2, content: "2024-11-29", tokenType: enc("completionDate"), tokenModifiers: 0 },
      { line: 3, character: 13, content: "2024-05-08", tokenType: enc("creationDate"), tokenModifiers: 0 },
      { line: 3, character: 24, content: "2022-10-04", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 3, character: 35, content: "hehe", tokenType: enc("description"), tokenModifiers: 0 },
      // That's a cyrillic x
      { line: 4, character: 0, content: "х", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 4, character: 2, content: "Посадить", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 4, character: 11, content: "дерево", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 4, character: 18, content: "@жизнь", tokenType: enc("context"), tokenModifiers: 0 },
      { line: 6, character: 0, content: "x", tokenType: enc("completionMark"), tokenModifiers: 0 },
      { line: 6, character: 2, content: "x", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 6, character: 4, content: "x", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 7, character: 0, content: "x_x", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 8, character: 0, content: "xylophone", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 8, character: 10, content: "lesson", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 9, character: 0, content: "X", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 9, character: 2, content: "2012-01-01", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 9, character: 13, content: "Make", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 9, character: 18, content: "resolutions", tokenType: enc("description"), tokenModifiers: 0 },
    ]
  ],
  [
`(A) x Find ticket prices
🧠 get +200 IQ
(Ａ) sleep ＠healht
🯲🯰🯰🯰-🯰🯱-🯰🯱 🌳:🐵 +👽 @💩
ｘ grow beard`, [
      { line: 0, character: 0, content: "(A)", tokenType: enc("priority"), tokenModifiers: 0 },
      { line: 0, character: 4, content: "x", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 0, character: 6, content: "Find", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 0, character: 11, content: "ticket", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 0, character: 18, content: "prices", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 0, content: "🧠", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 3, content: "get", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 1, character: 7, content: "+200", tokenType: enc("project"), tokenModifiers: 0 },
      { line: 1, character: 12, content: "IQ", tokenType: enc("description"), tokenModifiers: 0 },
      // Full-width latin capital A (U+FF21)
      { line: 2, character: 0, content: "(Ａ)", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 2, character: 4, content: "sleep", tokenType: enc("description"), tokenModifiers: 0 },
      // Full-width commercial at (U+FF20)
      { line: 2, character: 10, content: "＠healht", tokenType: enc("description"), tokenModifiers: 0 },
      // Segmented digits (U+1FB0 - U+1FB9)
      { line: 3, character: 0, content: "🯲🯰🯰🯰-🯰🯱-🯰🯱", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 3, character: 19, content: "🌳:🐵", tokenType: enc("keyValue"), tokenModifiers: 0 },
      { line: 3, character: 25, content: "+👽", tokenType: enc("project"), tokenModifiers: 0 },
      { line: 3, character: 29, content: "@💩", tokenType: enc("context"), tokenModifiers: 0 },
      // Full-width small latin letter x (U+FF58)
      { line: 4, character: 0, content: "ｘ", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 4, character: 2, content: "grow", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 4, character: 7, content: "beard", tokenType: enc("description"), tokenModifiers: 0 },
      // NOTE: emojis and segmented digits take up two characters
    ]
  ],
];
