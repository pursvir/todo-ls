import { TextDocument } from "vscode-languageserver-textdocument";
import { Diagnostic, TextDocumentContentChangeEvent, TextDocumentIdentifier } from "vscode-languageserver";

import { tokenizeText } from "./parser/tokenizer";
import { TodotxtTokenType, TodotxtTokenTypes, Token } from "./parser/tokenTypes";
import { KEY_WITH_COLON_RE } from "./parser/regexps";


/** Cache for `document`s' tokens.
 * Keys are documents' URIs, values are `Token[][]` lists, always sorted in ascending order. */
export class TokenStorage {
  private docTokensMap: Map<string, Token[][]> = new Map<string, Token[][]>();
  // private docDiagnosticsMap: Map<string, Diagnostic[]> = new Map<string, Diagnostic[]>();``

  private docProjectsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
  private docContextsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
  private docKeysMap: Map<string, Set<string>> = new Map<string, Set<string>>();

  /**
   * Cache document's tokens and return them.
   * @param doc - TextDocument itself
   * @returns list of Tokens
   */
  public get = (doc: TextDocument): Token[][] => {
    if (!this.docTokensMap.get(doc.uri)) {
      this.docTokensMap.set(doc.uri, tokenizeText(doc.getText()));
    }
    // @ts-expect-error: TS2322
    return this.docTokensMap.get(doc.uri);
  };

  /** Returns document's cached projects. */
  public getProjsOf = (doc: TextDocument): Set<string> | undefined => {
    return this.docProjectsMap.get(doc.uri);
  };

  /** Returns document's cached contexts. */
  public getCtxsOf = (doc: TextDocument): Set<string> | undefined => {
    return this.docContextsMap.get(doc.uri);
  };

  /** Returns document's cached keys of its key-value tags. */
  public getKeysOf = (doc: TextDocument): Set<string> | undefined => {
    return this.docKeysMap.get(doc.uri);
  };

  public set = (doc: TextDocument): void => {
    const text: string = doc.getText();
    const tokens: Token[][] = tokenizeText(text);

    this.docTokensMap.set(doc.uri, tokens);

    // TODO: this should be done in a lazy way.
    this.docProjectsMap.set(doc.uri, new Set<string>());
    this.docContextsMap.set(doc.uri, new Set<string>());
    this.docKeysMap.set(doc.uri, new Set<string>());

    tokens.forEach((tokenLine: Token[]): void => {
      tokenLine.forEach((token: Token): void => {
        switch (token.tokenType) {
          case TodotxtTokenType.Project:
            this.docProjectsMap.get(doc.uri)?.add(token.content);
            break;
          case TodotxtTokenType.Context:
            this.docContextsMap.get(doc.uri)?.add(token.content);
            break;
          case TodotxtTokenType.KeyValue:
            // @ts-expect-error
            this.docKeysMap.get(doc.uri)?.add(token.content.match(KEY_WITH_COLON_RE)[0]);
        }
      });
    })
  };

  // TODO: implement it
  public deltaUpdate = (doc: TextDocument, changes: TextDocumentContentChangeEvent[]): void => {
    this.set(doc);
  };

  public delete = (doc: TextDocumentIdentifier): void => {
    this.docTokensMap.delete(doc.uri);
    this.docProjectsMap.delete(doc.uri);
    this.docContextsMap.delete(doc.uri);
    this.docKeysMap.delete(doc.uri);
  };
}
