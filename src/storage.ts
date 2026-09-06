import { TextDocument } from "vscode-languageserver-textdocument";
import { TextDocumentContentChangeEvent, TextDocumentIdentifier } from "vscode-languageserver";

import { tokenizeText } from "./parser/tokenizer";
import { TodotxtTokenType, Token } from "./parser/tokenTypes";
import { KV_RE } from "./parser/regexps";


/** Cache for `document`s' tokens.
 * Keys are documents' URIs, values are `Token[][]` lists, always sorted in ascending order. */
export class TokenStorage {
  private docTokens: Map<string, Token[][]> = new Map<string, Token[][]>();
  // private docDiagnosticsMap: Map<string, Diagnostic[]> = new Map<string, Diagnostic[]>();``

  private docProjects: Map<string, Set<string>> = new Map<string, Set<string>>();
  private docContexts: Map<string, Set<string>> = new Map<string, Set<string>>();
  private docKeyValues: Map<string, Map<string, Set<string>>> =
    new Map<string, Map<string, Set<string>>>();

  /**
   * Cache document's tokens and return them.
   * @param doc - TextDocument itself
   * @returns list of Tokens
   */
  public get = (doc: TextDocument): Token[][] => {
    if (!this.docTokens.get(doc.uri)) {
      this.docTokens.set(doc.uri, tokenizeText(doc.getText()));
    }
    // @ts-expect-error: TS2322
    return this.docTokens.get(doc.uri);
  };

  /** Returns document's cached projects. */
  public getProjsOf = (doc: TextDocument): Set<string> | undefined => {
    return this.docProjects.get(doc.uri);
  };

  /** Returns document's cached contexts. */
  public getCtxsOf = (doc: TextDocument): Set<string> | undefined => {
    return this.docContexts.get(doc.uri);
  };

  /** Returns document's cached keys of its key-value tags. */
  public getKeysOf = (doc: TextDocument): Map<string, Set<string>> | undefined => {
    return this.docKeyValues.get(doc.uri);
  };

  public set = (doc: TextDocument): void => {
    const text: string = doc.getText();
    const tokens: Token[][] = tokenizeText(text);

    this.docTokens.set(doc.uri, tokens);

    // TODO: this should be done in a lazy way.
    this.docProjects.set(doc.uri, new Set<string>());
    this.docContexts.set(doc.uri, new Set<string>());
    this.docKeyValues.set(doc.uri, new Map<string, Set<string>>());

    tokens.forEach((tokenLine: Token[]): void => {
      tokenLine.forEach((token: Token): void => {
        switch (token.tokenType) {
          case TodotxtTokenType.Project:
            this.docProjects.get(doc.uri)?.add(token.content);
            break;
          case TodotxtTokenType.Context:
            this.docContexts.get(doc.uri)?.add(token.content);
            break;
          case TodotxtTokenType.KeyValue:
            let docKeys: Map<string, Set<string>> | undefined;
            if ((docKeys = this.docKeyValues.get(doc.uri)) !== undefined) {
              const match = token.content.match(KV_RE);
              // @ts-expect-error
              const key: string = match.groups.key;
              // @ts-expect-error
              const value: string = match.groups.value;

              if (docKeys.get(key) === undefined)
                docKeys.set(key, new Set<string>());

              // @ts-expect-error
              docKeys.get(key).add(value);
            }
            break;
        }
      });
    })
  };

  // TODO: implement it
  public deltaUpdate = (doc: TextDocument, changes: TextDocumentContentChangeEvent[]): void => {
    this.set(doc);
  };

  public delete = (doc: TextDocumentIdentifier): void => {
    this.docTokens.delete(doc.uri);
    this.docProjects.delete(doc.uri);
    this.docContexts.delete(doc.uri);
    this.docKeyValues.delete(doc.uri);
  };
}
