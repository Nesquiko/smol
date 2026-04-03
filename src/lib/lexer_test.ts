import { expect, test } from "bun:test";

import { newLexer } from "~/lib/lexer";
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
  // Verifies :=, ;, (, ), ,, +, and - produce the expected token types and values.
});

test("returns illegal-char error for standalone colon", () => {
  // Verifies : without = produces an illegal-char error from the AssignStart state.
});

test("returns illegal-char error for unsupported character in Q0", () => {
  // Verifies an unsupported character like @ or # returns an illegal-char error with the correct state label.
});

test("lexes positive numbers starting with nonzero digit", () => {
  // Verifies numeric literals like 1 and 123 become NUMBER tokens.
});

test("does not treat zero as valid number start", () => {
  // Verifies 0 is not accepted as a number start under current isNumberStart behavior and instead follows identifier/error behavior as intended.
});

test("lexes signed numbers after plus and minus", () => {
  // Verifies +1 and -9 are emitted as single NUMBER tokens rather than separate operator and number tokens.
});

test("emits plus and minus operators when not followed by digit", () => {
  // Verifies + and - become PLUS and MINUS tokens when not immediately followed by a valid number-start digit.
});

test("tracks token positions correctly across a mixed input", () => {
  // Verifies line, colStart, and colEnd are correct for keywords, identifiers, numbers, and punctuation in a realistic multi-token sample.
});

test("resets to Q0 after accepting a token and reprocesses the same delimiter", () => {
  // Verifies the delimiter that confirms one token can also begin the next token sequence without being lost.
});

function lex(input: string): { tokens: Token[]; error?: unknown } {
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
