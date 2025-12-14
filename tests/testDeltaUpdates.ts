import { TextDocumentContentChangeEvent } from "../src/_overrides/overrideChangeEvent";
import { Token } from "../src/parser/tokenTypes";
import { testParams } from "./params";
import { deltaChangeTokens } from "../src/tokenctl/delta";
import { encodeTokenType as enc } from "../src/parser/utils";

type TestName = string;

const deltaTestParams: [
  TestName, Token[], TextDocumentContentChangeEvent[], Token[]
][] = [
  [
    `Adding space on empty string`,
    testParams[0][1].slice(), [{
      range: {
        start: { line: 0, character: 0},
        end: { line: 0, character: 0},
      },
      text: ""
    }], testParams[0][1].slice()
  ],
  [
    `Adding new line inside empty text`,
    testParams[2][1].slice(), [{
      range: {
        start: {line: 2, character: 0 },
        end: {line: 2, character: 0},
      },
      text: '\n'
    }], testParams[2][1].slice()
  ],
  [
    `Typing one space after "juice_"`,
    testParams[3][1].slice(), [{
      range: {
        start: { line: 1, character: 14 },
        end: { line: 1, character: 14 },
      },
      text: " "
    }], testParams[3][1].slice(),
  ],
  // TODO: this test and the next one fail, but they pass when they are the only ones in a test suite.
  //  Therefore, results of other tests somehow affect those tests. I have to deal with this.
  [
    `Typing two spaces before "apple" and "juice_"`,
    testParams[3][1].slice(), [{
      range: {
        start: { line: 1, character: 0 },
        end: { line: 1, character: 0 },
      },
      text: "  "
    }], testParams[3][1]
      .slice(0, 2)
      .concat(
        testParams[3][1].slice(2).map((token: Token) => {
          return { ...token, character: token.character + 2 }
        })
      )
  ],
  [
    `Typing ! after "juice_"`,
    testParams[3][1].slice(), [{
      range: {
        start: { line: 1, character: 14 },
        end: { line: 1, character: 14 },
      },
      text: "!"
    }], testParams[3][1].slice(0, 3).concat([{ ...testParams[3][1][3], content: "juice_!" }])
  ],
  [
    `Rtrimming 2nd row`,
    testParams[4][1].slice(), [{
      range: {
        start: { line: 1, character: 0 },
        end: { line: 1, character: 2 },
      },
      text: ""
    }], testParams[4][1].slice(0, 4)
      .concat([
        { line: 1, character: 0, content: "2025-04-04", tokenType: enc("creationDate"), tokenModifiers: 0 },
      ])
      .concat(testParams[4][1].slice(5, 7).map((token: Token) => {
        return { ...token, character: token.character - 2 }
      }))
      .concat(testParams[4][1].slice(7))
  ],
  [
    `Split text with projects into two rows`,
    testParams[5][1].slice(), [{
      range: {
        start: { line: 0, character: 16},
        end: { line: 0, character: 16}
      },
      text: '\n'
    }], testParams[5][1]
      .slice(0, 3)
      .concat(
         testParams[5][1].slice(3)
          .map(
            (token: Token) => { return { ...token, line: 1, character: token.character - 16 } }
          )
        )
  ],
  [
    `Add one space inside an email`,
    [ { line: 0, character: 0, content: "noreply@example.com", tokenType: enc("description"), tokenModifiers: 0 }],
    [{
      range: {
        start: { line: 0, character: 7},
        end: { line: 0, character: 7},
      },
      text: " "
    }],
    [
      { line: 0, character: 0, content: "noreply", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 0, character: 8, content: "@example.com", tokenType: enc("context"), tokenModifiers: 0 },
    ],
  ],
  [
    `2+2 => 2 +2`,
    [ { line: 0, character: 0, content: "2+2", tokenType: enc("description"), tokenModifiers: 0 } ],
    [{
      range: {
        start: { line: 0, character: 1},
        end: { line: 0, character: 1},
      },
      text: " "
    }],
    [
      { line: 0, character: 0, content: "2", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 0, character: 2, content: "+2", tokenType: enc("project"), tokenModifiers: 0 }
    ],
  ],
  [
    `"Test +@... string" => "@... string`,
    [
      { line: 0, character: 0, content: "Test", tokenType: enc("description"), tokenModifiers: 0 },
      { line: 0, character: 5, content: "+@...", tokenType: enc("project"), tokenModifiers: 0 },
      { line: 0, character: 11, content: "string", tokenType: enc("description"), tokenModifiers: 0 },
    ], [{
      range: {
        start: { line: 0, character: 0},
        end: { line: 0, character: 6},
      },
      text: ""
    }],
    [
      { line: 0, character: 0, content: "@...", tokenType: enc("context"), tokenModifiers: 0 },
      { line: 0, character: 5, content: "string", tokenType: enc("description"), tokenModifiers: 0 },
    ]
  ],
  [
    `"keyvalue" => "key:value"`,
    [
      { line: 0, character: 0, content: "keyvalue", tokenType: enc("description"), tokenModifiers: 0 },
    ], [{
      range: {
        start: { line: 0, character: 3 },
        end: { line: 0, character: 3 }
      },
      text: ":"
    }],
    [
      { line: 0, character: 0, content: "key:value", tokenType: enc("keyValue"), tokenModifiers: 0 },
    ]
  ]
];

describe("Delta updating index", () => {
  for (const [testName, oldTokens, changeEvents, expectedTokens] of deltaTestParams) {
    test(testName, () => {
      const oldTokensCopy = oldTokens.slice();
      let newTokens: Token[] = [];
      let spliceShift: number = 0;
      for (const changeEvent of changeEvents)
        [newTokens, spliceShift] = deltaChangeTokens(
          oldTokensCopy, changeEvent, spliceShift
        );
      expect(newTokens).toEqual(expectedTokens);
    });
  }
});
