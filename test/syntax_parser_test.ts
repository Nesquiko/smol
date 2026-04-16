import { describe, test, expect } from "bun:test";

import type { Token, Result, SyntaxParserStep, SyntaxErrorMode } from "~/lib/types";

import { SyntaxParser } from "~/lib/parsing/syntax-parser";

// ─── helpers ──────────────────────────────────────────────────────────────────

function tok(
  type: Token["type"],
  value: string = type,
  line: number = 1,
  colStart: number = 1,
  colEnd: number = 1,
): Token {
  return { type, value, line, colStart, colEnd };
}

function parseWith(
  tokens: Token[],
  errorMode: SyntaxErrorMode | undefined = "no-errors",
): { steps: SyntaxParserStep[]; result: Result } {
  let result: Result = "unknown";
  const parser = new SyntaxParser(
    tokens,
    (r) => {
      result = r;
    },
    () => errorMode,
  );
  const steps = parser.parse();
  return { steps, result };
}

function expandedRules(steps: SyntaxParserStep[]): number[] {
  return steps
    .filter((s) => s.action.type === "expand" && s.action.ruleNumber != null)
    .map((s) => s.action.ruleNumber!);
}

function expectAccepted(tokens: Token[], ruleNumbers?: number[], errorMode?: SyntaxErrorMode) {
  const { steps, result } = parseWith(tokens, errorMode);
  const lastAction = steps.at(-1)?.action.type;
  expect(lastAction).toBe("accept");
  expect(result === "correct" || result === "correct-with-errors").toBe(true);
  if (ruleNumbers) {
    const used = expandedRules(steps);
    for (const r of ruleNumbers) {
      expect(used).toContain(r);
    }
  }
}

function expectRejected(tokens: Token[], errorMode?: SyntaxErrorMode) {
  const { result } = parseWith(tokens, errorMode);
  expect(result).toBe("incorrect");
}

// ─── Reusable token sequences ────────────────────────────────────────────────

const minimalRead: Token[] = [
  tok("BEGIN"),
  tok("READ"),
  tok("LPAREN", "("),
  tok("IDENT", "x"),
  tok("RPAREN", ")"),
  tok("SEMI", ";"),
  tok("END"),
];

const minimalWrite: Token[] = [
  tok("BEGIN"),
  tok("WRITE"),
  tok("LPAREN", "("),
  tok("IDENT", "x"),
  tok("RPAREN", ")"),
  tok("SEMI", ";"),
  tok("END"),
];

const minimalAssign: Token[] = [
  tok("BEGIN"),
  tok("IDENT", "x"),
  tok("ASSIGN", ":="),
  tok("IDENT", "y"),
  tok("SEMI", ";"),
  tok("END"),
];

// ═════════════════════════════════════════════════════════════════════════════
// RULE 1: program -> BEGIN statement_list END
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 1: program -> BEGIN statement_list END", () => {
  test("accepts simplest valid program", () => {
    expectAccepted(minimalRead, [1]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 2: statement_list -> statement statement_list'
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 2: statement_list -> statement statement_list'", () => {
  test("single statement produces rule 2", () => {
    expectAccepted(minimalRead, [2]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 3: statement_list' -> ε
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 3: statement_list' -> ε", () => {
  test("single statement => epsilon for statement_list'", () => {
    expectAccepted(minimalRead, [3]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 4: statement_list' -> statement_list
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 4: statement_list' -> statement_list", () => {
  test("two statements produce rule 4", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("READ"),
      tok("LPAREN", "("),
      tok("IDENT", "x"),
      tok("RPAREN", ")"),
      tok("SEMI", ";"),
      tok("WRITE"),
      tok("LPAREN", "("),
      tok("IDENT", "y"),
      tok("RPAREN", ")"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [4]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 5: statement -> IDENT ASSIGN expression SEMI
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 5: statement -> IDENT ASSIGN expression SEMI", () => {
  test("assignment statement", () => {
    expectAccepted(minimalAssign, [5]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 6: statement -> READ LPAREN id_list RPAREN SEMI
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 6: statement -> READ LPAREN id_list RPAREN SEMI", () => {
  test("read statement", () => {
    expectAccepted(minimalRead, [6]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 7: statement -> WRITE LPAREN expr_list RPAREN SEMI
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 7: statement -> WRITE LPAREN expr_list RPAREN SEMI", () => {
  test("write statement", () => {
    expectAccepted(minimalWrite, [7]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 8: statement -> IF bexpr THEN statement else SEMI
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 8: statement -> IF bexpr THEN statement else SEMI", () => {
  test("if-then statement (no else)", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("TRUE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [8]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 9: else -> ε
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 9: else -> ε", () => {
  test("if without else produces epsilon", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("TRUE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [9]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 10: else -> ELSE statement
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 10: else -> ELSE statement", () => {
  test("if-then-else statement", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("TRUE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("NUMBER", "1"),
      tok("SEMI", ";"),
      tok("ELSE"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("NUMBER", "2"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [10]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 11: id_list -> IDENT id_list'
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 11: id_list -> IDENT id_list'", () => {
  test("single id in id_list", () => {
    expectAccepted(minimalRead, [11]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 12: id_list' -> ε
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 12: id_list' -> ε", () => {
  test("single id => epsilon for id_list'", () => {
    expectAccepted(minimalRead, [12]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 13: id_list' -> COMMA id_list
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 13: id_list' -> COMMA id_list", () => {
  test("multiple ids in read", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("READ"),
      tok("LPAREN", "("),
      tok("IDENT", "x"),
      tok("COMMA", ","),
      tok("IDENT", "y"),
      tok("RPAREN", ")"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [13]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 14: expr_list -> expression expr_list'
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 14: expr_list -> expression expr_list'", () => {
  test("single expression in write", () => {
    expectAccepted(minimalWrite, [14]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 15: expr_list' -> ε
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 15: expr_list' -> ε", () => {
  test("single expression => epsilon for expr_list'", () => {
    expectAccepted(minimalWrite, [15]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 16: expr_list' -> COMMA expr_list
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 16: expr_list' -> COMMA expr_list", () => {
  test("multiple expressions in write", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("WRITE"),
      tok("LPAREN", "("),
      tok("IDENT", "x"),
      tok("COMMA", ","),
      tok("IDENT", "y"),
      tok("RPAREN", ")"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [16]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 17: expression -> factor expression'
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 17: expression -> factor expression'", () => {
  test("simple expression", () => {
    expectAccepted(minimalAssign, [17]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 18: expression' -> ε
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 18: expression' -> ε", () => {
  test("single factor => epsilon for expression'", () => {
    expectAccepted(minimalAssign, [18]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 19: expression' -> op factor expression'
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 19: expression' -> op factor expression'", () => {
  test("expression with operator", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("PLUS", "+"),
      tok("IDENT", "z"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [19]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 20: factor -> IDENT
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 20: factor -> IDENT", () => {
  test("identifier as factor", () => {
    expectAccepted(minimalAssign, [20]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 21: factor -> NUMBER
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 21: factor -> NUMBER", () => {
  test("number as factor", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("NUMBER", "42"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [21]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 22: factor -> LPAREN expression RPAREN
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 22: factor -> LPAREN expression RPAREN", () => {
  test("parenthesized expression as factor", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("LPAREN", "("),
      tok("IDENT", "y"),
      tok("RPAREN", ")"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [22]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 23: op -> PLUS
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 23: op -> PLUS", () => {
  test("plus operator", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("PLUS", "+"),
      tok("IDENT", "z"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [23]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 24: op -> MINUS
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 24: op -> MINUS", () => {
  test("minus operator", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("MINUS", "-"),
      tok("IDENT", "z"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [24]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 25: bexpr -> bterm bexpr'
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 25: bexpr -> bterm bexpr'", () => {
  test("simple boolean expression", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("TRUE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [25]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 26: bexpr' -> ε
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 26: bexpr' -> ε", () => {
  test("single bterm => epsilon for bexpr'", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("TRUE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [26]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 27: bexpr' -> OR bterm bexpr'
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 27: bexpr' -> OR bterm bexpr'", () => {
  test("boolean OR expression", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("TRUE"),
      tok("OR"),
      tok("FALSE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [27]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 28: bterm -> bfactor bterm'
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 28: bterm -> bfactor bterm'", () => {
  test("simple boolean term", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("TRUE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [28]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 29: bterm' -> ε
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 29: bterm' -> ε", () => {
  test("single bfactor => epsilon for bterm'", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("TRUE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [29]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 30: bterm' -> AND bfactor bterm'
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 30: bterm' -> AND bfactor bterm'", () => {
  test("boolean AND expression", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("TRUE"),
      tok("AND"),
      tok("FALSE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [30]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 31: bfactor -> NOT bfactor
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 31: bfactor -> NOT bfactor", () => {
  test("NOT boolean expression", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("NOT"),
      tok("TRUE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [31]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 32: bfactor -> LPAREN bexpr RPAREN
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 32: bfactor -> LPAREN bexpr RPAREN", () => {
  test("parenthesized boolean expression", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("LPAREN", "("),
      tok("TRUE"),
      tok("OR"),
      tok("FALSE"),
      tok("RPAREN", ")"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [32]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 33: bfactor -> TRUE
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 33: bfactor -> TRUE", () => {
  test("TRUE literal", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("TRUE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [33]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RULE 34: bfactor -> FALSE
// ═════════════════════════════════════════════════════════════════════════════
describe("Rule 34: bfactor -> FALSE", () => {
  test("FALSE literal", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("IF"),
      tok("FALSE"),
      tok("THEN"),
      tok("IDENT", "x"),
      tok("ASSIGN", ":="),
      tok("IDENT", "y"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectAccepted(tokens, [34]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR MODE: no-errors (default)
// ═══════════════════════════════════════════════════════════════════════════════

describe("Error mode: no-errors", () => {
  test("rejects on terminal mismatch", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("READ"),
      tok("LPAREN", "("),
      tok("IDENT", "x"),
      // missing RPAREN
      tok("SEMI", ";"),
      tok("END"),
    ];
    expectRejected(tokens, "no-errors");
  });

  test("rejects on non-terminal mismatch (no rule in parse table)", () => {
    const tokens: Token[] = [tok("BEGIN"), tok("PLUS", "+"), tok("END")];
    expectRejected(tokens, "no-errors");
  });

  test("rejects when input not fully consumed", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("READ"),
      tok("LPAREN", "("),
      tok("IDENT", "x"),
      tok("RPAREN", ")"),
      tok("SEMI", ";"),
      tok("END"),
      tok("IDENT", "extra"),
    ];
    expectRejected(tokens, "no-errors");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR MODE: skip-until-found
// ═══════════════════════════════════════════════════════════════════════════════

describe("Error mode: skip-until-found", () => {
  test("recovers from terminal mismatch by skipping tokens", () => {
    // BEGIN READ ( x PLUS ) ; END  — extra PLUS before )
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("READ"),
      tok("LPAREN", "("),
      tok("IDENT", "x"),
      tok("PLUS", "+"), // unexpected, should be skipped
      tok("RPAREN", ")"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    const { steps, result } = parseWith(tokens, "skip-until-found");
    expect(result).toBe("correct-with-errors");
    expect(steps.some((s) => s.action.type === "skip")).toBe(true);
    expect(steps.some((s) => s.action.type === "recover")).toBe(true);
  });

  test("fails when sync token not found for terminal", () => {
    // Missing RPAREN entirely — can't find it
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("READ"),
      tok("LPAREN", "("),
      tok("IDENT", "x"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    const { result } = parseWith(tokens, "skip-until-found");
    expect(result).toBe("incorrect");
  });

  test("recovers from non-terminal mismatch by skipping tokens", () => {
    // BEGIN PLUS READ(x); END — PLUS has no rule for statement
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("PLUS", "+"),
      tok("READ"),
      tok("LPAREN", "("),
      tok("IDENT", "x"),
      tok("RPAREN", ")"),
      tok("SEMI", ";"),
      tok("END"),
    ];
    const { steps, result } = parseWith(tokens, "skip-until-found");
    expect(result).toBe("correct-with-errors");
    expect(steps.some((s) => s.action.type === "skip")).toBe(true);
    expect(steps.some((s) => s.action.type === "recover")).toBe(true);
  });

  test("fails when sync token not found for non-terminal", () => {
    const tokens: Token[] = [tok("BEGIN"), tok("PLUS", "+"), tok("MINUS", "-")];
    const { result } = parseWith(tokens, "skip-until-found");
    expect(result).toBe("incorrect");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR MODE: add-missing
// ═══════════════════════════════════════════════════════════════════════════════

describe("Error mode: add-missing", () => {
  test("recovers from terminal mismatch by inserting missing token", () => {
    // Missing RPAREN: BEGIN READ ( x ; END
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("READ"),
      tok("LPAREN", "("),
      tok("IDENT", "x"),
      // RPAREN missing, parser should insert it
      tok("SEMI", ";"),
      tok("END"),
    ];
    const { steps, result } = parseWith(tokens, "add-missing");
    expect(result).toBe("correct-with-errors");
    expect(
      steps.some((s) => s.action.type === "recover" && s.action.strategy === "add-missing"),
    ).toBe(true);
  });

  test("recovers from non-terminal mismatch by inserting synthetic token", () => {
    const tokens: Token[] = [tok("BEGIN"), tok("PLUS", "+"), tok("SEMI", ";"), tok("END")];
    const { steps } = parseWith(tokens, "add-missing");
    expect(
      steps.some((s) => s.action.type === "recover" && s.action.strategy === "add-missing"),
    ).toBe(true);
  });

  test("inserted synthetic token appears in step logs", () => {
    const tokens: Token[] = [
      tok("BEGIN"),
      tok("READ"),
      tok("LPAREN", "("),
      tok("IDENT", "x"),
      // RPAREN missing
      tok("SEMI", ";"),
      tok("END"),
    ];
    const { steps } = parseWith(tokens, "add-missing");
    const recoverStep = steps.find(
      (s) => s.action.type === "recover" && s.action.strategy === "add-missing",
    );
    expect(recoverStep).toBeDefined();
    expect(recoverStep!.log.type).toBe("recover");
    expect(recoverStep!.log.message).toContain("Inserted synthetic");
  });
});
