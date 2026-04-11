import { expect, test } from "bun:test";

import { LexError, newLexer } from "~/lib/lexer";
import { Token } from "~/lib/types";

const STARTING_LINE = 0;

test("lexes all reserved keywords as keyword tokens", () => {
  const line = STARTING_LINE;
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
  const line = STARTING_LINE;
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
  const line = STARTING_LINE;
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
    { type: "BEGIN", value: "BEGIN", line: STARTING_LINE, colStart: 0, colEnd: 4 },
    { type: "END", value: "END", line: STARTING_LINE + 1, colStart: 2, colEnd: 4 },
  ]);
});

test("finalizes keyword tokens on punctuation separator", () => {
  const line = STARTING_LINE;
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
  const line = STARTING_LINE;
  const { tokens, error } = lex("FALSE");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([{ type: "FALSE", value: "FALSE", line, colStart: 0, colEnd: 4 }]);
});

test("lexes punctuation and operators", () => {
  const line = STARTING_LINE;
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
    tokenPos: { line: STARTING_LINE, tokenStart: 0, tokenEnd: 0 },
    error: { char: "EOF", stateLabel: ":" },
  });
});

test("returns illegal-char error for unsupported character in Q0", () => {
  const { tokens, error } = lex("@");

  expect(tokens).toEqual([]);
  expect(error).toEqual({
    type: "illegal-char",
    tokenPos: { line: STARTING_LINE, tokenStart: 0, tokenEnd: 0 },
    error: { char: "@", stateLabel: "Q0" },
  });
});

test("lexes numbers starting with nonzero digit", () => {
  const line = STARTING_LINE;
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
    tokenPos: { line: STARTING_LINE, tokenStart: 0, tokenEnd: 0 },
    error: { char: "0", stateLabel: "Q0" },
  });
});

test("resets to Q0 after accepting a token and reprocesses the same delimiter", () => {
  const line = STARTING_LINE;
  const { tokens, error } = lex("BEGINX");

  expect(error).toBeUndefined();
  expect(tokens).toEqual([{ type: "IDENT", value: "BEGINX", line, colStart: 0, colEnd: 5 }]);
});

test("tracks token positions correctly across a mixed input", async () => {
  const input = await Bun.file("public/examples/complex-example.txt").text();
  const { tokens, error } = lex(input);

  expect(error).toBeUndefined();
  expect(tokens).toEqual(ComplexExampleTokens(STARTING_LINE));
});

function lex(input: string): { tokens: Token[]; error?: LexError } {
  let line = STARTING_LINE;
  let linePos = 0;
  const lexer = newLexer({ startingLine: line, errorMode: "no-errors" }).lexer;
  const tokens = new Array<Token>();

  for (const char of input) {
    const result = lexer.process({ char, line, linePos });

    if (result.type === "error") {
      return { tokens, error: result.error };
    } else if (result.type === "ok") {
      tokens.push(...result.tokens);
    }

    if (char === "\n") {
      line += 1;
      linePos = 0;
      continue;
    }

    linePos += 1;
  }

  const result = lexer.eof({ line, linePos });
  if (result.type === "error") {
    return { tokens, error: result.error };
  } else if (result.type === "ok") {
    tokens.push(...result.tokens);
  }

  return { tokens };
}

const ComplexExampleTokens = (line: number): Array<Token> =>
  [
    // Line 1: BEGIN
    { type: "BEGIN", value: "BEGIN", line, colStart: 0, colEnd: 4 },

    // Line 2: READ(a,b,c,d,e);
    { type: "READ", value: "READ", line: line + 1, colStart: 0, colEnd: 3 },
    { type: "LPAREN", value: "(", line: line + 1, colStart: 4, colEnd: 4 },
    { type: "IDENT", value: "a", line: line + 1, colStart: 5, colEnd: 5 },
    { type: "COMMA", value: ",", line: line + 1, colStart: 6, colEnd: 6 },
    { type: "IDENT", value: "b", line: line + 1, colStart: 7, colEnd: 7 },
    { type: "COMMA", value: ",", line: line + 1, colStart: 8, colEnd: 8 },
    { type: "IDENT", value: "c", line: line + 1, colStart: 9, colEnd: 9 },
    { type: "COMMA", value: ",", line: line + 1, colStart: 10, colEnd: 10 },
    { type: "IDENT", value: "d", line: line + 1, colStart: 11, colEnd: 11 },
    { type: "COMMA", value: ",", line: line + 1, colStart: 12, colEnd: 12 },
    { type: "IDENT", value: "e", line: line + 1, colStart: 13, colEnd: 13 },
    { type: "RPAREN", value: ")", line: line + 1, colStart: 14, colEnd: 14 },
    { type: "SEMI", value: ";", line: line + 1, colStart: 15, colEnd: 15 },

    // Line 3: x:=a+b;
    { type: "IDENT", value: "x", line: line + 2, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 2, colStart: 1, colEnd: 2 },
    { type: "IDENT", value: "a", line: line + 2, colStart: 3, colEnd: 3 },
    { type: "PLUS", value: "+", line: line + 2, colStart: 4, colEnd: 4 },
    { type: "IDENT", value: "b", line: line + 2, colStart: 5, colEnd: 5 },
    { type: "SEMI", value: ";", line: line + 2, colStart: 6, colEnd: 6 },

    // Line 4: y:=x-c;
    { type: "IDENT", value: "y", line: line + 3, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 3, colStart: 1, colEnd: 2 },
    { type: "IDENT", value: "x", line: line + 3, colStart: 3, colEnd: 3 },
    { type: "MINUS", value: "-", line: line + 3, colStart: 4, colEnd: 4 },
    { type: "IDENT", value: "c", line: line + 3, colStart: 5, colEnd: 5 },
    { type: "SEMI", value: ";", line: line + 3, colStart: 6, colEnd: 6 },

    // Line 5: z:=y+10;
    { type: "IDENT", value: "z", line: line + 4, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 4, colStart: 1, colEnd: 2 },
    { type: "IDENT", value: "y", line: line + 4, colStart: 3, colEnd: 3 },
    { type: "PLUS", value: "+", line: line + 4, colStart: 4, colEnd: 4 },
    { type: "NUMBER", value: "10", line: line + 4, colStart: 5, colEnd: 6 },
    { type: "SEMI", value: ";", line: line + 4, colStart: 7, colEnd: 7 },

    // Line 6: total:=z+d;
    { type: "IDENT", value: "total", line: line + 5, colStart: 0, colEnd: 4 },
    { type: "ASSIGN", value: ":=", line: line + 5, colStart: 5, colEnd: 6 },
    { type: "IDENT", value: "z", line: line + 5, colStart: 7, colEnd: 7 },
    { type: "PLUS", value: "+", line: line + 5, colStart: 8, colEnd: 8 },
    { type: "IDENT", value: "d", line: line + 5, colStart: 9, colEnd: 9 },
    { type: "SEMI", value: ";", line: line + 5, colStart: 10, colEnd: 10 },

    // Line 7: temp:=total-e;
    { type: "IDENT", value: "temp", line: line + 6, colStart: 0, colEnd: 3 },
    { type: "ASSIGN", value: ":=", line: line + 6, colStart: 4, colEnd: 5 },
    { type: "IDENT", value: "total", line: line + 6, colStart: 6, colEnd: 10 },
    { type: "MINUS", value: "-", line: line + 6, colStart: 11, colEnd: 11 },
    { type: "IDENT", value: "e", line: line + 6, colStart: 12, colEnd: 12 },
    { type: "SEMI", value: ";", line: line + 6, colStart: 13, colEnd: 13 },

    // Line 8: WRITE(a,b,c,d,e);
    { type: "WRITE", value: "WRITE", line: line + 7, colStart: 0, colEnd: 4 },
    { type: "LPAREN", value: "(", line: line + 7, colStart: 5, colEnd: 5 },
    { type: "IDENT", value: "a", line: line + 7, colStart: 6, colEnd: 6 },
    { type: "COMMA", value: ",", line: line + 7, colStart: 7, colEnd: 7 },
    { type: "IDENT", value: "b", line: line + 7, colStart: 8, colEnd: 8 },
    { type: "COMMA", value: ",", line: line + 7, colStart: 9, colEnd: 9 },
    { type: "IDENT", value: "c", line: line + 7, colStart: 10, colEnd: 10 },
    { type: "COMMA", value: ",", line: line + 7, colStart: 11, colEnd: 11 },
    { type: "IDENT", value: "d", line: line + 7, colStart: 12, colEnd: 12 },
    { type: "COMMA", value: ",", line: line + 7, colStart: 13, colEnd: 13 },
    { type: "IDENT", value: "e", line: line + 7, colStart: 14, colEnd: 14 },
    { type: "RPAREN", value: ")", line: line + 7, colStart: 15, colEnd: 15 },
    { type: "SEMI", value: ";", line: line + 7, colStart: 16, colEnd: 16 },

    // Line 9: WRITE(x,y,z,total,temp);
    { type: "WRITE", value: "WRITE", line: line + 8, colStart: 0, colEnd: 4 },
    { type: "LPAREN", value: "(", line: line + 8, colStart: 5, colEnd: 5 },
    { type: "IDENT", value: "x", line: line + 8, colStart: 6, colEnd: 6 },
    { type: "COMMA", value: ",", line: line + 8, colStart: 7, colEnd: 7 },
    { type: "IDENT", value: "y", line: line + 8, colStart: 8, colEnd: 8 },
    { type: "COMMA", value: ",", line: line + 8, colStart: 9, colEnd: 9 },
    { type: "IDENT", value: "z", line: line + 8, colStart: 10, colEnd: 10 },
    { type: "COMMA", value: ",", line: line + 8, colStart: 11, colEnd: 11 },
    { type: "IDENT", value: "total", line: line + 8, colStart: 12, colEnd: 16 },
    { type: "COMMA", value: ",", line: line + 8, colStart: 17, colEnd: 17 },
    { type: "IDENT", value: "temp", line: line + 8, colStart: 18, colEnd: 21 },
    { type: "RPAREN", value: ")", line: line + 8, colStart: 22, colEnd: 22 },
    { type: "SEMI", value: ";", line: line + 8, colStart: 23, colEnd: 23 },

    // Line 10: IF TRUE THEN WRITE(x); ELSE WRITE(y);
    { type: "IF", value: "IF", line: line + 9, colStart: 0, colEnd: 1 },
    { type: "TRUE", value: "TRUE", line: line + 9, colStart: 3, colEnd: 6 },
    { type: "THEN", value: "THEN", line: line + 9, colStart: 8, colEnd: 11 },
    { type: "WRITE", value: "WRITE", line: line + 9, colStart: 13, colEnd: 17 },
    { type: "LPAREN", value: "(", line: line + 9, colStart: 18, colEnd: 18 },
    { type: "IDENT", value: "x", line: line + 9, colStart: 19, colEnd: 19 },
    { type: "RPAREN", value: ")", line: line + 9, colStart: 20, colEnd: 20 },
    { type: "SEMI", value: ";", line: line + 9, colStart: 21, colEnd: 21 }, // ends THEN statement
    { type: "ELSE", value: "ELSE", line: line + 9, colStart: 23, colEnd: 26 },
    { type: "WRITE", value: "WRITE", line: line + 9, colStart: 28, colEnd: 32 },
    { type: "LPAREN", value: "(", line: line + 9, colStart: 33, colEnd: 33 },
    { type: "IDENT", value: "y", line: line + 9, colStart: 34, colEnd: 34 },
    { type: "RPAREN", value: ")", line: line + 9, colStart: 35, colEnd: 35 },
    { type: "SEMI", value: ";", line: line + 9, colStart: 36, colEnd: 36 }, // ends ELSE and whole IF

    // Line 11: IF FALSE THEN READ(m); ELSE WRITE(z);
    { type: "IF", value: "IF", line: line + 10, colStart: 0, colEnd: 1 },
    { type: "FALSE", value: "FALSE", line: line + 10, colStart: 3, colEnd: 7 },
    { type: "THEN", value: "THEN", line: line + 10, colStart: 9, colEnd: 12 },
    { type: "READ", value: "READ", line: line + 10, colStart: 14, colEnd: 17 },
    { type: "LPAREN", value: "(", line: line + 10, colStart: 18, colEnd: 18 },
    { type: "IDENT", value: "m", line: line + 10, colStart: 19, colEnd: 19 },
    { type: "RPAREN", value: ")", line: line + 10, colStart: 20, colEnd: 20 },
    { type: "SEMI", value: ";", line: line + 10, colStart: 21, colEnd: 21 }, // ends THEN statement
    { type: "ELSE", value: "ELSE", line: line + 10, colStart: 23, colEnd: 26 },
    { type: "WRITE", value: "WRITE", line: line + 10, colStart: 28, colEnd: 32 },
    { type: "LPAREN", value: "(", line: line + 10, colStart: 33, colEnd: 33 },
    { type: "IDENT", value: "z", line: line + 10, colStart: 34, colEnd: 34 },
    { type: "RPAREN", value: ")", line: line + 10, colStart: 35, colEnd: 35 },
    { type: "SEMI", value: ";", line: line + 10, colStart: 36, colEnd: 36 }, // ends ELSE and whole IF

    // Line 12: alpha:=1;
    { type: "IDENT", value: "alpha", line: line + 11, colStart: 0, colEnd: 4 },
    { type: "ASSIGN", value: ":=", line: line + 11, colStart: 5, colEnd: 6 },
    { type: "NUMBER", value: "1", line: line + 11, colStart: 7, colEnd: 7 },
    { type: "SEMI", value: ";", line: line + 11, colStart: 8, colEnd: 8 },

    // Line 13: beta:=alpha+2;
    { type: "IDENT", value: "beta", line: line + 12, colStart: 0, colEnd: 3 },
    { type: "ASSIGN", value: ":=", line: line + 12, colStart: 4, colEnd: 5 },
    { type: "IDENT", value: "alpha", line: line + 12, colStart: 6, colEnd: 10 },
    { type: "PLUS", value: "+", line: line + 12, colStart: 11, colEnd: 11 },
    { type: "NUMBER", value: "2", line: line + 12, colStart: 12, colEnd: 12 },
    { type: "SEMI", value: ";", line: line + 12, colStart: 13, colEnd: 13 },

    // Line 14: gamma:=beta+3;
    { type: "IDENT", value: "gamma", line: line + 13, colStart: 0, colEnd: 4 },
    { type: "ASSIGN", value: ":=", line: line + 13, colStart: 5, colEnd: 6 },
    { type: "IDENT", value: "beta", line: line + 13, colStart: 7, colEnd: 10 },
    { type: "PLUS", value: "+", line: line + 13, colStart: 11, colEnd: 11 },
    { type: "NUMBER", value: "3", line: line + 13, colStart: 12, colEnd: 12 },
    { type: "SEMI", value: ";", line: line + 13, colStart: 13, colEnd: 13 },

    // Line 15: delta:=gamma-4;
    { type: "IDENT", value: "delta", line: line + 14, colStart: 0, colEnd: 4 },
    { type: "ASSIGN", value: ":=", line: line + 14, colStart: 5, colEnd: 6 },
    { type: "IDENT", value: "gamma", line: line + 14, colStart: 7, colEnd: 11 },
    { type: "MINUS", value: "-", line: line + 14, colStart: 12, colEnd: 12 },
    { type: "NUMBER", value: "4", line: line + 14, colStart: 13, colEnd: 13 },
    { type: "SEMI", value: ";", line: line + 14, colStart: 14, colEnd: 14 },

    // Line 16: epsilon:=delta+5;
    { type: "IDENT", value: "epsilon", line: line + 15, colStart: 0, colEnd: 6 },
    { type: "ASSIGN", value: ":=", line: line + 15, colStart: 7, colEnd: 8 },
    { type: "IDENT", value: "delta", line: line + 15, colStart: 9, colEnd: 13 },
    { type: "PLUS", value: "+", line: line + 15, colStart: 14, colEnd: 14 },
    { type: "NUMBER", value: "5", line: line + 15, colStart: 15, colEnd: 15 },
    { type: "SEMI", value: ";", line: line + 15, colStart: 16, colEnd: 16 },

    // Line 17: WRITE(alpha,beta,gamma,delta,epsilon);
    { type: "WRITE", value: "WRITE", line: line + 16, colStart: 0, colEnd: 4 },
    { type: "LPAREN", value: "(", line: line + 16, colStart: 5, colEnd: 5 },
    { type: "IDENT", value: "alpha", line: line + 16, colStart: 6, colEnd: 10 },
    { type: "COMMA", value: ",", line: line + 16, colStart: 11, colEnd: 11 },
    { type: "IDENT", value: "beta", line: line + 16, colStart: 12, colEnd: 15 },
    { type: "COMMA", value: ",", line: line + 16, colStart: 16, colEnd: 16 },
    { type: "IDENT", value: "gamma", line: line + 16, colStart: 17, colEnd: 21 },
    { type: "COMMA", value: ",", line: line + 16, colStart: 22, colEnd: 22 },
    { type: "IDENT", value: "delta", line: line + 16, colStart: 23, colEnd: 27 },
    { type: "COMMA", value: ",", line: line + 16, colStart: 28, colEnd: 28 },
    { type: "IDENT", value: "epsilon", line: line + 16, colStart: 29, colEnd: 35 },
    { type: "RPAREN", value: ")", line: line + 16, colStart: 36, colEnd: 36 },
    { type: "SEMI", value: ";", line: line + 16, colStart: 37, colEnd: 37 },

    // Line 18: IF NOT FALSE THEN WRITE(epsilon); ELSE WRITE(alpha);
    { type: "IF", value: "IF", line: line + 17, colStart: 0, colEnd: 1 },
    { type: "NOT", value: "NOT", line: line + 17, colStart: 3, colEnd: 5 },
    { type: "FALSE", value: "FALSE", line: line + 17, colStart: 7, colEnd: 11 },
    { type: "THEN", value: "THEN", line: line + 17, colStart: 13, colEnd: 16 },
    { type: "WRITE", value: "WRITE", line: line + 17, colStart: 18, colEnd: 22 },
    { type: "LPAREN", value: "(", line: line + 17, colStart: 23, colEnd: 23 },
    { type: "IDENT", value: "epsilon", line: line + 17, colStart: 24, colEnd: 30 },
    { type: "RPAREN", value: ")", line: line + 17, colStart: 31, colEnd: 31 },
    { type: "SEMI", value: ";", line: line + 17, colStart: 32, colEnd: 32 },
    { type: "ELSE", value: "ELSE", line: line + 17, colStart: 34, colEnd: 37 },
    { type: "WRITE", value: "WRITE", line: line + 17, colStart: 39, colEnd: 43 },
    { type: "LPAREN", value: "(", line: line + 17, colStart: 44, colEnd: 44 },
    { type: "IDENT", value: "alpha", line: line + 17, colStart: 45, colEnd: 49 },
    { type: "RPAREN", value: ")", line: line + 17, colStart: 50, colEnd: 50 },
    { type: "SEMI", value: ";", line: line + 17, colStart: 51, colEnd: 51 },

    // Line 19: u:=1;
    { type: "IDENT", value: "u", line: line + 18, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 18, colStart: 1, colEnd: 2 },
    { type: "NUMBER", value: "1", line: line + 18, colStart: 3, colEnd: 3 },
    { type: "SEMI", value: ";", line: line + 18, colStart: 4, colEnd: 4 },

    // Line 20: v:=u+2;
    { type: "IDENT", value: "v", line: line + 19, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 19, colStart: 1, colEnd: 2 },
    { type: "IDENT", value: "u", line: line + 19, colStart: 3, colEnd: 3 },
    { type: "PLUS", value: "+", line: line + 19, colStart: 4, colEnd: 4 },
    { type: "NUMBER", value: "2", line: line + 19, colStart: 5, colEnd: 5 },
    { type: "SEMI", value: ";", line: line + 19, colStart: 6, colEnd: 6 },

    // Line 21: w:=v+3;
    { type: "IDENT", value: "w", line: line + 20, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 20, colStart: 1, colEnd: 2 },
    { type: "IDENT", value: "v", line: line + 20, colStart: 3, colEnd: 3 },
    { type: "PLUS", value: "+", line: line + 20, colStart: 4, colEnd: 4 },
    { type: "NUMBER", value: "3", line: line + 20, colStart: 5, colEnd: 5 },
    { type: "SEMI", value: ";", line: line + 20, colStart: 6, colEnd: 6 },

    // Line 22: p:=w-4;
    { type: "IDENT", value: "p", line: line + 21, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 21, colStart: 1, colEnd: 2 },
    { type: "IDENT", value: "w", line: line + 21, colStart: 3, colEnd: 3 },
    { type: "MINUS", value: "-", line: line + 21, colStart: 4, colEnd: 4 },
    { type: "NUMBER", value: "4", line: line + 21, colStart: 5, colEnd: 5 },
    { type: "SEMI", value: ";", line: line + 21, colStart: 6, colEnd: 6 },

    // Line 23: q:=p+5;
    { type: "IDENT", value: "q", line: line + 22, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 22, colStart: 1, colEnd: 2 },
    { type: "IDENT", value: "p", line: line + 22, colStart: 3, colEnd: 3 },
    { type: "PLUS", value: "+", line: line + 22, colStart: 4, colEnd: 4 },
    { type: "NUMBER", value: "5", line: line + 22, colStart: 5, colEnd: 5 },
    { type: "SEMI", value: ";", line: line + 22, colStart: 6, colEnd: 6 },

    // Line 24: r:=q-6;
    { type: "IDENT", value: "r", line: line + 23, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 23, colStart: 1, colEnd: 2 },
    { type: "IDENT", value: "q", line: line + 23, colStart: 3, colEnd: 3 },
    { type: "MINUS", value: "-", line: line + 23, colStart: 4, colEnd: 4 },
    { type: "NUMBER", value: "6", line: line + 23, colStart: 5, colEnd: 5 },
    { type: "SEMI", value: ";", line: line + 23, colStart: 6, colEnd: 6 },

    // Line 25: s:=r+7;
    { type: "IDENT", value: "s", line: line + 24, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 24, colStart: 1, colEnd: 2 },
    { type: "IDENT", value: "r", line: line + 24, colStart: 3, colEnd: 3 },
    { type: "PLUS", value: "+", line: line + 24, colStart: 4, colEnd: 4 },
    { type: "NUMBER", value: "7", line: line + 24, colStart: 5, colEnd: 5 },
    { type: "SEMI", value: ";", line: line + 24, colStart: 6, colEnd: 6 },

    // Line 26: t:=s-8;
    { type: "IDENT", value: "t", line: line + 25, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 25, colStart: 1, colEnd: 2 },
    { type: "IDENT", value: "s", line: line + 25, colStart: 3, colEnd: 3 },
    { type: "MINUS", value: "-", line: line + 25, colStart: 4, colEnd: 4 },
    { type: "NUMBER", value: "8", line: line + 25, colStart: 5, colEnd: 5 },
    { type: "SEMI", value: ";", line: line + 25, colStart: 6, colEnd: 6 },

    // Line 27: WRITE(u,v,w,p,q,r,s,t);
    { type: "WRITE", value: "WRITE", line: line + 26, colStart: 0, colEnd: 4 },
    { type: "LPAREN", value: "(", line: line + 26, colStart: 5, colEnd: 5 },
    { type: "IDENT", value: "u", line: line + 26, colStart: 6, colEnd: 6 },
    { type: "COMMA", value: ",", line: line + 26, colStart: 7, colEnd: 7 },
    { type: "IDENT", value: "v", line: line + 26, colStart: 8, colEnd: 8 },
    { type: "COMMA", value: ",", line: line + 26, colStart: 9, colEnd: 9 },
    { type: "IDENT", value: "w", line: line + 26, colStart: 10, colEnd: 10 },
    { type: "COMMA", value: ",", line: line + 26, colStart: 11, colEnd: 11 },
    { type: "IDENT", value: "p", line: line + 26, colStart: 12, colEnd: 12 },
    { type: "COMMA", value: ",", line: line + 26, colStart: 13, colEnd: 13 },
    { type: "IDENT", value: "q", line: line + 26, colStart: 14, colEnd: 14 },
    { type: "COMMA", value: ",", line: line + 26, colStart: 15, colEnd: 15 },
    { type: "IDENT", value: "r", line: line + 26, colStart: 16, colEnd: 16 },
    { type: "COMMA", value: ",", line: line + 26, colStart: 17, colEnd: 17 },
    { type: "IDENT", value: "s", line: line + 26, colStart: 18, colEnd: 18 },
    { type: "COMMA", value: ",", line: line + 26, colStart: 19, colEnd: 19 },
    { type: "IDENT", value: "t", line: line + 26, colStart: 20, colEnd: 20 },
    { type: "RPAREN", value: ")", line: line + 26, colStart: 21, colEnd: 21 },
    { type: "SEMI", value: ";", line: line + 26, colStart: 22, colEnd: 22 },

    // Line 28: IF TRUE OR FALSE THEN WRITE(t); ELSE WRITE(u);
    { type: "IF", value: "IF", line: line + 27, colStart: 0, colEnd: 1 },
    { type: "TRUE", value: "TRUE", line: line + 27, colStart: 3, colEnd: 6 },
    { type: "OR", value: "OR", line: line + 27, colStart: 8, colEnd: 9 },
    { type: "FALSE", value: "FALSE", line: line + 27, colStart: 11, colEnd: 15 },
    { type: "THEN", value: "THEN", line: line + 27, colStart: 17, colEnd: 20 },
    { type: "WRITE", value: "WRITE", line: line + 27, colStart: 22, colEnd: 26 },
    { type: "LPAREN", value: "(", line: line + 27, colStart: 27, colEnd: 27 },
    { type: "IDENT", value: "t", line: line + 27, colStart: 28, colEnd: 28 },
    { type: "RPAREN", value: ")", line: line + 27, colStart: 29, colEnd: 29 },
    { type: "SEMI", value: ";", line: line + 27, colStart: 30, colEnd: 30 },
    { type: "ELSE", value: "ELSE", line: line + 27, colStart: 32, colEnd: 35 },
    { type: "WRITE", value: "WRITE", line: line + 27, colStart: 37, colEnd: 41 },
    { type: "LPAREN", value: "(", line: line + 27, colStart: 42, colEnd: 42 },
    { type: "IDENT", value: "u", line: line + 27, colStart: 43, colEnd: 43 },
    { type: "RPAREN", value: ")", line: line + 27, colStart: 44, colEnd: 44 },
    { type: "SEMI", value: ";", line: line + 27, colStart: 45, colEnd: 45 },

    // Line 29: left:=1;
    { type: "IDENT", value: "left", line: line + 28, colStart: 0, colEnd: 3 },
    { type: "ASSIGN", value: ":=", line: line + 28, colStart: 4, colEnd: 5 },
    { type: "NUMBER", value: "1", line: line + 28, colStart: 6, colEnd: 6 },
    { type: "SEMI", value: ";", line: line + 28, colStart: 7, colEnd: 7 },

    // Line 30: right:=2;
    { type: "IDENT", value: "right", line: line + 29, colStart: 0, colEnd: 4 },
    { type: "ASSIGN", value: ":=", line: line + 29, colStart: 5, colEnd: 6 },
    { type: "NUMBER", value: "2", line: line + 29, colStart: 7, colEnd: 7 },
    { type: "SEMI", value: ";", line: line + 29, colStart: 8, colEnd: 8 },

    // Line 31: mid:=left+right;
    { type: "IDENT", value: "mid", line: line + 30, colStart: 0, colEnd: 2 },
    { type: "ASSIGN", value: ":=", line: line + 30, colStart: 3, colEnd: 4 },
    { type: "IDENT", value: "left", line: line + 30, colStart: 5, colEnd: 8 },
    { type: "PLUS", value: "+", line: line + 30, colStart: 9, colEnd: 9 },
    { type: "IDENT", value: "right", line: line + 30, colStart: 10, colEnd: 14 },
    { type: "SEMI", value: ";", line: line + 30, colStart: 15, colEnd: 15 },

    // Line 32: value:=mid+3;
    { type: "IDENT", value: "value", line: line + 31, colStart: 0, colEnd: 4 },
    { type: "ASSIGN", value: ":=", line: line + 31, colStart: 5, colEnd: 6 },
    { type: "IDENT", value: "mid", line: line + 31, colStart: 7, colEnd: 9 },
    { type: "PLUS", value: "+", line: line + 31, colStart: 10, colEnd: 10 },
    { type: "NUMBER", value: "3", line: line + 31, colStart: 11, colEnd: 11 },
    { type: "SEMI", value: ";", line: line + 31, colStart: 12, colEnd: 12 },

    // Line 33: result:=value-1;
    { type: "IDENT", value: "result", line: line + 32, colStart: 0, colEnd: 5 },
    { type: "ASSIGN", value: ":=", line: line + 32, colStart: 6, colEnd: 7 },
    { type: "IDENT", value: "value", line: line + 32, colStart: 8, colEnd: 12 },
    { type: "MINUS", value: "-", line: line + 32, colStart: 13, colEnd: 13 },
    { type: "NUMBER", value: "1", line: line + 32, colStart: 14, colEnd: 14 },
    { type: "SEMI", value: ";", line: line + 32, colStart: 15, colEnd: 15 },

    // Line 34: WRITE(left,right,mid,value,result);
    { type: "WRITE", value: "WRITE", line: line + 33, colStart: 0, colEnd: 4 },
    { type: "LPAREN", value: "(", line: line + 33, colStart: 5, colEnd: 5 },
    { type: "IDENT", value: "left", line: line + 33, colStart: 6, colEnd: 9 },
    { type: "COMMA", value: ",", line: line + 33, colStart: 10, colEnd: 10 },
    { type: "IDENT", value: "right", line: line + 33, colStart: 11, colEnd: 15 },
    { type: "COMMA", value: ",", line: line + 33, colStart: 16, colEnd: 16 },
    { type: "IDENT", value: "mid", line: line + 33, colStart: 17, colEnd: 19 },
    { type: "COMMA", value: ",", line: line + 33, colStart: 20, colEnd: 20 },
    { type: "IDENT", value: "value", line: line + 33, colStart: 21, colEnd: 25 },
    { type: "COMMA", value: ",", line: line + 33, colStart: 26, colEnd: 26 },
    { type: "IDENT", value: "result", line: line + 33, colStart: 27, colEnd: 32 },
    { type: "RPAREN", value: ")", line: line + 33, colStart: 33, colEnd: 33 },
    { type: "SEMI", value: ";", line: line + 33, colStart: 34, colEnd: 34 },

    // Line 35: IF (TRUE AND NOT FALSE) THEN WRITE(result); ELSE WRITE(mid);
    { type: "IF", value: "IF", line: line + 34, colStart: 0, colEnd: 1 },
    { type: "LPAREN", value: "(", line: line + 34, colStart: 3, colEnd: 3 },
    { type: "TRUE", value: "TRUE", line: line + 34, colStart: 4, colEnd: 7 },
    { type: "AND", value: "AND", line: line + 34, colStart: 9, colEnd: 11 },
    { type: "NOT", value: "NOT", line: line + 34, colStart: 13, colEnd: 15 },
    { type: "FALSE", value: "FALSE", line: line + 34, colStart: 17, colEnd: 21 },
    { type: "RPAREN", value: ")", line: line + 34, colStart: 22, colEnd: 22 },
    { type: "THEN", value: "THEN", line: line + 34, colStart: 24, colEnd: 27 },
    { type: "WRITE", value: "WRITE", line: line + 34, colStart: 29, colEnd: 33 },
    { type: "LPAREN", value: "(", line: line + 34, colStart: 34, colEnd: 34 },
    { type: "IDENT", value: "result", line: line + 34, colStart: 35, colEnd: 40 },
    { type: "RPAREN", value: ")", line: line + 34, colStart: 41, colEnd: 41 },
    { type: "SEMI", value: ";", line: line + 34, colStart: 42, colEnd: 42 },
    { type: "ELSE", value: "ELSE", line: line + 34, colStart: 44, colEnd: 47 },
    { type: "WRITE", value: "WRITE", line: line + 34, colStart: 49, colEnd: 53 },
    { type: "LPAREN", value: "(", line: line + 34, colStart: 54, colEnd: 54 },
    { type: "IDENT", value: "mid", line: line + 34, colStart: 55, colEnd: 57 },
    { type: "RPAREN", value: ")", line: line + 34, colStart: 58, colEnd: 58 },
    { type: "SEMI", value: ";", line: line + 34, colStart: 59, colEnd: 59 },

    // Line 36: n1:=1;
    { type: "IDENT", value: "n1", line: line + 35, colStart: 0, colEnd: 1 },
    { type: "ASSIGN", value: ":=", line: line + 35, colStart: 2, colEnd: 3 },
    { type: "NUMBER", value: "1", line: line + 35, colStart: 4, colEnd: 4 },
    { type: "SEMI", value: ";", line: line + 35, colStart: 5, colEnd: 5 },

    // Line 37: n2:=n1+1;
    { type: "IDENT", value: "n2", line: line + 36, colStart: 0, colEnd: 1 },
    { type: "ASSIGN", value: ":=", line: line + 36, colStart: 2, colEnd: 3 },
    { type: "IDENT", value: "n1", line: line + 36, colStart: 4, colEnd: 5 },
    { type: "PLUS", value: "+", line: line + 36, colStart: 6, colEnd: 6 },
    { type: "NUMBER", value: "1", line: line + 36, colStart: 7, colEnd: 7 },
    { type: "SEMI", value: ";", line: line + 36, colStart: 8, colEnd: 8 },

    // Line 38: n3:=n2+1;
    { type: "IDENT", value: "n3", line: line + 37, colStart: 0, colEnd: 1 },
    { type: "ASSIGN", value: ":=", line: line + 37, colStart: 2, colEnd: 3 },
    { type: "IDENT", value: "n2", line: line + 37, colStart: 4, colEnd: 5 },
    { type: "PLUS", value: "+", line: line + 37, colStart: 6, colEnd: 6 },
    { type: "NUMBER", value: "1", line: line + 37, colStart: 7, colEnd: 7 },
    { type: "SEMI", value: ";", line: line + 37, colStart: 8, colEnd: 8 },

    // Line 39: n4:=n3+1;
    { type: "IDENT", value: "n4", line: line + 38, colStart: 0, colEnd: 1 },
    { type: "ASSIGN", value: ":=", line: line + 38, colStart: 2, colEnd: 3 },
    { type: "IDENT", value: "n3", line: line + 38, colStart: 4, colEnd: 5 },
    { type: "PLUS", value: "+", line: line + 38, colStart: 6, colEnd: 6 },
    { type: "NUMBER", value: "1", line: line + 38, colStart: 7, colEnd: 7 },
    { type: "SEMI", value: ";", line: line + 38, colStart: 8, colEnd: 8 },

    // Line 40: n5:=n4+1;
    { type: "IDENT", value: "n5", line: line + 39, colStart: 0, colEnd: 1 },
    { type: "ASSIGN", value: ":=", line: line + 39, colStart: 2, colEnd: 3 },
    { type: "IDENT", value: "n4", line: line + 39, colStart: 4, colEnd: 5 },
    { type: "PLUS", value: "+", line: line + 39, colStart: 6, colEnd: 6 },
    { type: "NUMBER", value: "1", line: line + 39, colStart: 7, colEnd: 7 },
    { type: "SEMI", value: ";", line: line + 39, colStart: 8, colEnd: 8 },

    // Line 41: n6:=n5+1;
    { type: "IDENT", value: "n6", line: line + 40, colStart: 0, colEnd: 1 },
    { type: "ASSIGN", value: ":=", line: line + 40, colStart: 2, colEnd: 3 },
    { type: "IDENT", value: "n5", line: line + 40, colStart: 4, colEnd: 5 },
    { type: "PLUS", value: "+", line: line + 40, colStart: 6, colEnd: 6 },
    { type: "NUMBER", value: "1", line: line + 40, colStart: 7, colEnd: 7 },
    { type: "SEMI", value: ";", line: line + 40, colStart: 8, colEnd: 8 },

    // Line 42: n7:=n6+1;
    { type: "IDENT", value: "n7", line: line + 41, colStart: 0, colEnd: 1 },
    { type: "ASSIGN", value: ":=", line: line + 41, colStart: 2, colEnd: 3 },
    { type: "IDENT", value: "n6", line: line + 41, colStart: 4, colEnd: 5 },
    { type: "PLUS", value: "+", line: line + 41, colStart: 6, colEnd: 6 },
    { type: "NUMBER", value: "1", line: line + 41, colStart: 7, colEnd: 7 },
    { type: "SEMI", value: ";", line: line + 41, colStart: 8, colEnd: 8 },

    // Line 43: n8:=n7+1;
    { type: "IDENT", value: "n8", line: line + 42, colStart: 0, colEnd: 1 },
    { type: "ASSIGN", value: ":=", line: line + 42, colStart: 2, colEnd: 3 },
    { type: "IDENT", value: "n7", line: line + 42, colStart: 4, colEnd: 5 },
    { type: "PLUS", value: "+", line: line + 42, colStart: 6, colEnd: 6 },
    { type: "NUMBER", value: "1", line: line + 42, colStart: 7, colEnd: 7 },
    { type: "SEMI", value: ";", line: line + 42, colStart: 8, colEnd: 8 },

    // Line 44: n9:=n8+1;
    { type: "IDENT", value: "n9", line: line + 43, colStart: 0, colEnd: 1 },
    { type: "ASSIGN", value: ":=", line: line + 43, colStart: 2, colEnd: 3 },
    { type: "IDENT", value: "n8", line: line + 43, colStart: 4, colEnd: 5 },
    { type: "PLUS", value: "+", line: line + 43, colStart: 6, colEnd: 6 },
    { type: "NUMBER", value: "1", line: line + 43, colStart: 7, colEnd: 7 },
    { type: "SEMI", value: ";", line: line + 43, colStart: 8, colEnd: 8 },

    // Line 45: WRITE(n1,n2,n3,n4,n5,n6,n7,n8,n9);
    { type: "WRITE", value: "WRITE", line: line + 44, colStart: 0, colEnd: 4 },
    { type: "LPAREN", value: "(", line: line + 44, colStart: 5, colEnd: 5 },
    { type: "IDENT", value: "n1", line: line + 44, colStart: 6, colEnd: 7 },
    { type: "COMMA", value: ",", line: line + 44, colStart: 8, colEnd: 8 },
    { type: "IDENT", value: "n2", line: line + 44, colStart: 9, colEnd: 10 },
    { type: "COMMA", value: ",", line: line + 44, colStart: 11, colEnd: 11 },
    { type: "IDENT", value: "n3", line: line + 44, colStart: 12, colEnd: 13 },
    { type: "COMMA", value: ",", line: line + 44, colStart: 14, colEnd: 14 },
    { type: "IDENT", value: "n4", line: line + 44, colStart: 15, colEnd: 16 },
    { type: "COMMA", value: ",", line: line + 44, colStart: 17, colEnd: 17 },
    { type: "IDENT", value: "n5", line: line + 44, colStart: 18, colEnd: 19 },
    { type: "COMMA", value: ",", line: line + 44, colStart: 20, colEnd: 20 },
    { type: "IDENT", value: "n6", line: line + 44, colStart: 21, colEnd: 22 },
    { type: "COMMA", value: ",", line: line + 44, colStart: 23, colEnd: 23 },
    { type: "IDENT", value: "n7", line: line + 44, colStart: 24, colEnd: 25 },
    { type: "COMMA", value: ",", line: line + 44, colStart: 26, colEnd: 26 },
    { type: "IDENT", value: "n8", line: line + 44, colStart: 27, colEnd: 28 },
    { type: "COMMA", value: ",", line: line + 44, colStart: 29, colEnd: 29 },
    { type: "IDENT", value: "n9", line: line + 44, colStart: 30, colEnd: 31 },
    { type: "RPAREN", value: ")", line: line + 44, colStart: 32, colEnd: 32 },
    { type: "SEMI", value: ";", line: line + 44, colStart: 33, colEnd: 33 },

    // Line 46: IF ((TRUE)) THEN WRITE(n9); ELSE WRITE(n1);
    { type: "IF", value: "IF", line: line + 45, colStart: 0, colEnd: 1 },
    { type: "LPAREN", value: "(", line: line + 45, colStart: 3, colEnd: 3 },
    { type: "LPAREN", value: "(", line: line + 45, colStart: 4, colEnd: 4 },
    { type: "TRUE", value: "TRUE", line: line + 45, colStart: 5, colEnd: 8 },
    { type: "RPAREN", value: ")", line: line + 45, colStart: 9, colEnd: 9 },
    { type: "RPAREN", value: ")", line: line + 45, colStart: 10, colEnd: 10 },
    { type: "THEN", value: "THEN", line: line + 45, colStart: 12, colEnd: 15 },
    { type: "WRITE", value: "WRITE", line: line + 45, colStart: 17, colEnd: 21 },
    { type: "LPAREN", value: "(", line: line + 45, colStart: 22, colEnd: 22 },
    { type: "IDENT", value: "n9", line: line + 45, colStart: 23, colEnd: 24 },
    { type: "RPAREN", value: ")", line: line + 45, colStart: 25, colEnd: 25 },
    { type: "SEMI", value: ";", line: line + 45, colStart: 26, colEnd: 26 },
    { type: "ELSE", value: "ELSE", line: line + 45, colStart: 28, colEnd: 31 },
    { type: "WRITE", value: "WRITE", line: line + 45, colStart: 33, colEnd: 37 },
    { type: "LPAREN", value: "(", line: line + 45, colStart: 38, colEnd: 38 },
    { type: "IDENT", value: "n1", line: line + 45, colStart: 39, colEnd: 40 },
    { type: "RPAREN", value: ")", line: line + 45, colStart: 41, colEnd: 41 },
    { type: "SEMI", value: ";", line: line + 45, colStart: 42, colEnd: 42 },

    // Line 47: foo:=1;
    { type: "IDENT", value: "foo", line: line + 46, colStart: 0, colEnd: 2 },
    { type: "ASSIGN", value: ":=", line: line + 46, colStart: 3, colEnd: 4 },
    { type: "NUMBER", value: "1", line: line + 46, colStart: 5, colEnd: 5 },
    { type: "SEMI", value: ";", line: line + 46, colStart: 6, colEnd: 6 },

    // Line 48: bar:=foo+2;
    { type: "IDENT", value: "bar", line: line + 47, colStart: 0, colEnd: 2 },
    { type: "ASSIGN", value: ":=", line: line + 47, colStart: 3, colEnd: 4 },
    { type: "IDENT", value: "foo", line: line + 47, colStart: 5, colEnd: 7 },
    { type: "PLUS", value: "+", line: line + 47, colStart: 8, colEnd: 8 },
    { type: "NUMBER", value: "2", line: line + 47, colStart: 9, colEnd: 9 },
    { type: "SEMI", value: ";", line: line + 47, colStart: 10, colEnd: 10 },

    // Line 49: baz:=bar-1;
    { type: "IDENT", value: "baz", line: line + 48, colStart: 0, colEnd: 2 },
    { type: "ASSIGN", value: ":=", line: line + 48, colStart: 3, colEnd: 4 },
    { type: "IDENT", value: "bar", line: line + 48, colStart: 5, colEnd: 7 },
    { type: "MINUS", value: "-", line: line + 48, colStart: 8, colEnd: 8 },
    { type: "NUMBER", value: "1", line: line + 48, colStart: 9, colEnd: 9 },
    { type: "SEMI", value: ";", line: line + 48, colStart: 10, colEnd: 10 },

    // Line 50: WRITE(foo,bar,baz);
    { type: "WRITE", value: "WRITE", line: line + 49, colStart: 0, colEnd: 4 },
    { type: "LPAREN", value: "(", line: line + 49, colStart: 5, colEnd: 5 },
    { type: "IDENT", value: "foo", line: line + 49, colStart: 6, colEnd: 8 },
    { type: "COMMA", value: ",", line: line + 49, colStart: 9, colEnd: 9 },
    { type: "IDENT", value: "bar", line: line + 49, colStart: 10, colEnd: 12 },
    { type: "COMMA", value: ",", line: line + 49, colStart: 13, colEnd: 13 },
    { type: "IDENT", value: "baz", line: line + 49, colStart: 14, colEnd: 16 },
    { type: "RPAREN", value: ")", line: line + 49, colStart: 17, colEnd: 17 },
    { type: "SEMI", value: ";", line: line + 49, colStart: 18, colEnd: 18 },

    // Line 51:   n10   :=    n9
    { type: "IDENT", value: "n10", line: line + 50, colStart: 2, colEnd: 4 },
    { type: "ASSIGN", value: ":=", line: line + 50, colStart: 8, colEnd: 9 },
    { type: "IDENT", value: "n9", line: line + 50, colStart: 14, colEnd: 15 },

    // Line 52: +
    { type: "PLUS", value: "+", line: line + 51, colStart: 0, colEnd: 0 },

    // Line 53: 420;
    { type: "NUMBER", value: "420", line: line + 52, colStart: 0, colEnd: 2 },
    { type: "SEMI", value: ";", line: line + 52, colStart: 3, colEnd: 3 },

    // line: line+54: bar := baz -    15;
    { type: "IDENT", value: "bar", line: line + 53, colStart: 0, colEnd: 2 },
    { type: "ASSIGN", value: ":=", line: line + 53, colStart: 4, colEnd: 5 },
    { type: "IDENT", value: "baz", line: line + 53, colStart: 7, colEnd: 9 },
    { type: "MINUS", value: "-", line: line + 53, colStart: 11, colEnd: 11 },
    { type: "NUMBER", value: "15", line: line + 53, colStart: 16, colEnd: 17 },
    { type: "SEMI", value: ";", line: line + 53, colStart: 18, colEnd: 18 },

    // Line 55: x := -502;
    { type: "IDENT", value: "x", line: line + 54, colStart: 0, colEnd: 0 },
    { type: "ASSIGN", value: ":=", line: line + 54, colStart: 2, colEnd: 3 },
    { type: "NUMBER", value: "-502", line: line + 54, colStart: 5, colEnd: 8 },
    { type: "SEMI", value: ";", line: line + 54, colStart: 9, colEnd: 9 },

    // Line 56: END
    { type: "END", value: "END", line: line + 55, colStart: 0, colEnd: 2 },
  ] satisfies Array<Token>;
