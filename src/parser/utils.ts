import { legend, TodotxtTokenType, TodotxtTokenTypes } from "./tokenTypes";

export const encodeTokenType = (type: TodotxtTokenType): number => {
	let ind: number = TodotxtTokenTypes.indexOf(type);
	if (ind === -1) throw new Error("Incorrect token type!");
	return ind;
};

export const decodeTokenType = (tokenCode: number): TodotxtTokenType => {
	return legend.tokenTypes[tokenCode];
};
