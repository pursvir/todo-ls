import { determineTodotxtTokenType } from "./lexer";
import { encodeTokenType } from "./utils";
import { Token } from "./tokenTypes";

const tokenPattern: RegExp = /\S+/g;

export const tokenizeLine = (
	text: string,
	targetLine: number = 0,
	charOffset: number = 0,
): Token[] => {
	const tokens: Token[] = [];
	let match: RegExpExecArray | null;

	while ((match = tokenPattern.exec(text)) !== null) {
		const newTokenChar: number = match.index + charOffset;
		const newToken: Token = {
			line: targetLine,
			character: newTokenChar,
			content: match[0],
			tokenType: encodeTokenType(
				determineTodotxtTokenType(match[0], targetLine, newTokenChar, tokens),
			),
			tokenModifiers: 0,
		};
		tokens.push(newToken);
	}

	return tokens;
};

const LINES_RE: RegExp = /\r?\n/;

export const getTokenizedText = (
	text: string,
	lineOffset: number = 0,
	charOffset: number = 0,
): Token[] => {
	const textLines: string[] = text.split(LINES_RE);
	const tokens: Token[] = tokenizeLine(textLines[0], lineOffset, charOffset);
	for (let i: number = 1; i < textLines.length; i++)
		tokens.push(...tokenizeLine(textLines[i], lineOffset + i, 0));
	return tokens;
};
