import { getTokenizedText } from "../src/parser/tokenizer";
import { testParams } from "./params";

describe("Tokenize tasks", () => {
	for (const [text, expectedTokens] of testParams)
		test(text, () => {
			const result = getTokenizedText(text);
			expect(result).toEqual(expect.arrayOf(
				expect.objectContaining({
					line: expect.any(Number),
					character: expect.any(Number),
					content: expect.any(String),
					tokenType: expect.any(Number),
					tokenModifiers: expect.any(Number),
				})
			));
			expect(result).toStrictEqual(expectedTokens);
		});
})
