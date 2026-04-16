import { ParseTable, RuleNumber, Rules } from "~/lib/types";

export const DEFAULT_PARSE_TABLE: ParseTable = {
  program: { BEGIN: 1 },
  statement_list: { IDENT: 2, READ: 2, WRITE: 2, IF: 2 },
  "statement_list'": { IDENT: 4, READ: 4, WRITE: 4, IF: 4, END: 3 },
  statement: { IDENT: 5, READ: 6, WRITE: 7, IF: 8 },
  else: { ELSE: 10, SEMI: 9, END: 9, READ: 9, WRITE: 9, IDENT: 9 },
  id_list: { IDENT: 11 },
  "id_list'": { RPAREN: 12, COMMA: 13 },
  expr_list: { IDENT: 14, NUMBER: 14, LPAREN: 14 },
  "expr_list'": { RPAREN: 15, COMMA: 16 },
  expression: { IDENT: 17, NUMBER: 17, LPAREN: 17 },
  "expression'": { SEMI: 18, COMMA: 18, RPAREN: 18, PLUS: 19, MINUS: 19 },
  factor: { IDENT: 20, NUMBER: 21, LPAREN: 22 },
  op: { PLUS: 23, MINUS: 24 },
  bexpr: { NOT: 25, TRUE: 25, FALSE: 25, LPAREN: 25 },
  "bexpr'": { THEN: 26, RPAREN: 26, OR: 27 },
  bterm: { NOT: 28, TRUE: 28, FALSE: 28, LPAREN: 28 },
  "bterm'": { THEN: 29, OR: 29, RPAREN: 29, AND: 30 },
  bfactor: { NOT: 31, LPAREN: 32, TRUE: 33, FALSE: 34 },
};

export const RULES: Rules = {
  1: { left: "program", right: ["BEGIN", "statement_list", "END"] },
  2: { left: "statement_list", right: ["statement", "statement_list'"] },
  3: { left: "statement_list'", right: [] },
  4: { left: "statement_list'", right: ["statement_list"] },
  5: { left: "statement", right: ["IDENT", "ASSIGN", "expression", "SEMI"] },
  6: { left: "statement", right: ["READ", "LPAREN", "id_list", "RPAREN", "SEMI"] },
  7: { left: "statement", right: ["WRITE", "LPAREN", "expr_list", "RPAREN", "SEMI"] },
  8: { left: "statement", right: ["IF", "bexpr", "THEN", "statement", "else"] },
  9: { left: "else", right: [] },
  10: { left: "else", right: ["ELSE", "statement"] },
  11: { left: "id_list", right: ["IDENT", "id_list'"] },
  12: { left: "id_list'", right: [] },
  13: { left: "id_list'", right: ["COMMA", "id_list"] },
  14: { left: "expr_list", right: ["expression", "expr_list'"] },
  15: { left: "expr_list'", right: [] },
  16: { left: "expr_list'", right: ["COMMA", "expr_list"] },
  17: { left: "expression", right: ["factor", "expression'"] },
  18: { left: "expression'", right: [] },
  19: { left: "expression'", right: ["op", "factor", "expression'"] },
  20: { left: "factor", right: ["IDENT"] },
  21: { left: "factor", right: ["NUMBER"] },
  22: { left: "factor", right: ["LPAREN", "expression", "RPAREN"] },
  23: { left: "op", right: ["PLUS"] },
  24: { left: "op", right: ["MINUS"] },
  25: { left: "bexpr", right: ["bterm", "bexpr'"] },
  26: { left: "bexpr'", right: [] },
  27: { left: "bexpr'", right: ["OR", "bterm", "bexpr'"] },
  28: { left: "bterm", right: ["bfactor", "bterm'"] },
  29: { left: "bterm'", right: [] },
  30: { left: "bterm'", right: ["AND", "bfactor", "bterm'"] },
  31: { left: "bfactor", right: ["NOT", "bfactor"] },
  32: { left: "bfactor", right: ["LPAREN", "bexpr", "RPAREN"] },
  33: { left: "bfactor", right: ["TRUE"] },
  34: { left: "bfactor", right: ["FALSE"] },
};

export const RULE_NUMBERS: Array<RuleNumber> = Object.keys(RULES)
  .map((ruleNumber: string): number => Number(ruleNumber))
  .sort((a: number, b: number): number => a - b);

export const NON_TERMINAL_ORDER: Array<string> = Object.keys(DEFAULT_PARSE_TABLE);

export const cloneParseTable = (table: ParseTable): ParseTable =>
  Object.fromEntries(
    Object.entries(table).map(([nonTerminal, transitions]) => [nonTerminal, { ...transitions }]),
  );

export const TERMINALS: Array<string> = Array.from(
  new Set(
    Object.values(DEFAULT_PARSE_TABLE).flatMap(
      (row: Record<string, number>): Array<string> => Object.keys(row),
    ),
  ),
);
export const NON_TERMINALS: Set<string> = new Set(NON_TERMINAL_ORDER);
