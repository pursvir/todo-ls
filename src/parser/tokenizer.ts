export interface IndexedToken {
  token: string;
  start: number;
}

const tokenPattern: RegExp = /\S+/g;

export const tokenizeLine = (text: string): IndexedToken[] => {
  const indexexTokens: IndexedToken[] = [];
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    indexexTokens.push({
      token: match[0],
      start: match.index,
    });
  }

  return indexexTokens;
};

export const getTokenAtPosition = (
  tokens: IndexedToken[],
  offset: number,
): IndexedToken => {
  for (const token of tokens) {
    if (offset >= token.start && offset <= token.start + token.token.length)
      return token;
  }
  return null;
};
