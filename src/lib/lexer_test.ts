import { expect, test } from "bun:test";

import { LexError, newLexer } from "~/lib/lexer";
import { Token } from "~/lib/types";

test("lexes all reserved keywords as keyword tokens", () => {
  const line = 0;
  const { tokens, error } = lex("BEGIN END READ WRITE IF THEN ELSE OR AND NOT TRUE FALSE");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([
    { type: "BEGIN", value: "BEGIN", line, colStart: 0, colEnd: 4 },
    { type: "END", value: "END", line, colStart: 6, colEnd: 8 },
    { type: "READ", value: "READ", line, colStart: 10, colEnd: 13 },
    { type: "WRITE", value: "WRITE", line, colStart: 15, colEnd: 19 },
    { type: "IF", value: "IF", line, colStart: 21, colEnd: 22 },
    { type: "THEN", value: "THEN", line, colStart: 24, colEnd: 27 },
    { type: "ELSE", value: "ELSE", line, colStart: 29, colEnd: 32 },
    { type: "OR", value: "OR", line, colStart: 34, colEnd: 35 },
    { type: "AND", value: "AND", line, colStart: 37, colEnd: 39 },
    { type: "NOT", value: "NOT", line, colStart: 41, colEnd: 43 },
    { type: "TRUE", value: "TRUE", line, colStart: 45, colEnd: 48 },
    { type: "FALSE", value: "FALSE", line, colStart: 50, colEnd: 54 },
  ]);
});

test("keeps keyword-like identifiers as IDENT tokens", () => {
  const line = 0;
  const { tokens, error } = lex("BEGINX IF1 TRUEVALUE READ2 WRITEX");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([
    { type: "IDENT", value: "BEGINX", line, colStart: 0, colEnd: 5 },
    { type: "IDENT", value: "IF1", line, colStart: 7, colEnd: 9 },
    { type: "IDENT", value: "TRUEVALUE", line, colStart: 11, colEnd: 19 },
    { type: "IDENT", value: "READ2", line, colStart: 21, colEnd: 25 },
    { type: "IDENT", value: "WRITEX", line, colStart: 27, colEnd: 32 },
  ]);
});

test("distinguishes THEN and TRUE from shared T prefix", () => {
  const line = 0;
  const { tokens, error } = lex("THEN TRUE;");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([
    { type: "THEN", value: "THEN", line, colStart: 0, colEnd: 3 },
    { type: "TRUE", value: "TRUE", line, colStart: 5, colEnd: 8 },
    { type: "SEMI", value: ";", line, colStart: 9, colEnd: 9 },
  ]);
});

test("finalizes keyword tokens on whitespace separator", () => {
  const { tokens, error } = lex("BEGIN\n\t END ");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([
    { type: "BEGIN", value: "BEGIN", line: 0, colStart: 0, colEnd: 4 },
    { type: "END", value: "END", line: 1, colStart: 2, colEnd: 4 },
  ]);
});

test("finalizes keyword tokens on punctuation separator", () => {
  const line = 0;
  const { tokens, error } = lex("READ;WRITE)");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([
    { type: "READ", value: "READ", line, colStart: 0, colEnd: 3 },
    { type: "SEMI", value: ";", line, colStart: 4, colEnd: 4 },
    { type: "WRITE", value: "WRITE", line, colStart: 5, colEnd: 9 },
    { type: "RPAREN", value: ")", line, colStart: 10, colEnd: 10 },
  ]);
});

test("finalizes keyword tokens at EOF", () => {
  const line = 0;
  const { tokens, error } = lex("FALSE");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([{ type: "FALSE", value: "FALSE", line, colStart: 0, colEnd: 4 }]);
});

test("lexes punctuation and operators", () => {
  const line = 0;
  const { tokens, error } = lex(":=;(),+-1;");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([
    { type: "ASSIGN", value: ":=", line, colStart: 0, colEnd: 1 },
    { type: "SEMI", value: ";", line, colStart: 2, colEnd: 2 },
    { type: "LPAREN", value: "(", line, colStart: 3, colEnd: 3 },
    { type: "RPAREN", value: ")", line, colStart: 4, colEnd: 4 },
    { type: "COMMA", value: ",", line, colStart: 5, colEnd: 5 },
    { type: "PLUS", value: "+", line, colStart: 6, colEnd: 6 },
    { type: "NUMBER", value: "-1", line, colStart: 7, colEnd: 8 },
    { type: "SEMI", value: ";", line, colStart: 9, colEnd: 9 },
  ]);
});

test("returns illegal-char error for standalone colon", () => {
  const { tokens, error } = lex(":");

  expect(tokens).toEqual([]);
  expect(error).toEqual({
    type: "illegal-char",
    tokenPos: { line: 0, tokenStart: 0, tokenEnd: 0 },
    error: { char: "EOF", stateLabel: ":" },
  });
});

test("returns illegal-char error for unsupported character in Q0", () => {
  const { tokens, error } = lex("@");

  expect(tokens).toEqual([]);
  expect(error).toEqual({
    type: "illegal-char",
    tokenPos: { line: 0, tokenStart: 0, tokenEnd: 0 },
    error: { char: "@", stateLabel: "Q0" },
  });
});

test("lexes numbers starting with nonzero digit", () => {
  const line = 0;
  const { tokens, error } = lex("69 -420 +42069");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([
    { type: "NUMBER", value: "69", line, colStart: 0, colEnd: 1 },
    { type: "NUMBER", value: "-420", line, colStart: 3, colEnd: 6 },
    { type: "NUMBER", value: "+42069", line, colStart: 8, colEnd: 13 },
  ]);
});

test("does not treat zero as valid number start", () => {
  const { tokens, error } = lex("0");

  expect(tokens).toEqual([]);
  expect(error).toEqual({
    type: "illegal-char",
    tokenPos: { line: 0, tokenStart: 0, tokenEnd: 0 },
    error: { char: "0", stateLabel: "Q0" },
  });
});

test("resets to Q0 after accepting a token and reprocesses the same delimiter", () => {
  const line = 0;
  const { tokens, error } = lex("BEGINX");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([{ type: "IDENT", value: "BEGINX", line, colStart: 0, colEnd: 5 }]);
});

function lex(input: string): { tokens: Token[]; error?: LexError } {
  const lexer = newLexer();
  const tokens: Token[] = [];

  let line = 0;
  let linePos = 0;

  for (const char of input) {
    const error = lexer.process({
      char,
      line,
      linePos,
      onTokenEmit: (t) => tokens.push(t),
    });

    if (error) return { tokens, error };

    if (char === "\n") {
      line += 1;
      linePos = 0;
      continue;
    }

    linePos += 1;
  }

  const error = lexer.eof({
    line,
    linePos,
    onTokenEmit: (t) => tokens.push(t),
  });

  return { tokens, error };
}
